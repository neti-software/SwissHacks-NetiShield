import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XummSdk } from 'xumm-sdk';
import {
  CreateEscrowParams,
  CreateMultisigPaymentTransactionParams,
  CreatePaymentTransactionParams,
  CreateTrustSetTransactionParams,
  SignTransactionParams,
  SubmitMultisigTransactionParams,
} from './xrpl.types';
import * as xrpl from 'xrpl';
import { XummJsonTransaction, XummPostPayloadResponse } from 'xumm-sdk/dist/src/types/xumm-api';
import { TransactionStatus } from './xrpl.types';
import { TransactionStatusResponseDto } from './dto/get-transaction-status.dto';
import { TokenBalanceResponseDto } from './dto/token-balance-response.dto';

@Injectable()
export class XrplService {
  private readonly xummSdk: XummSdk;
  private readonly logger = new Logger(XrplService.name);
  private xrplClient: xrpl.Client;
  private readonly issuer: string;
  private readonly adminAddress: string;

  constructor(private configService: ConfigService) {
    if (
      !this.configService.get<string>('XUMM_API_KEY') ||
      !this.configService.get<string>('XUMM_API_SECRET')
    ) {
      throw new Error('XUMM_API_KEY and XUMM_API_SECRET must be configured');
    }

    this.xummSdk = new XummSdk(
      this.configService.get<string>('XUMM_API_KEY'),
      this.configService.get<string>('XUMM_API_SECRET'),
    );
    this.initXrplClient();

    const escrowSecret = this.configService.get<string>('ESCROW_WALLET_SECRET_KEY');
    if (!escrowSecret) {
      throw new Error('ESCROW_WALLET_SECRET_KEY is not configured');
    }
    this.adminAddress = xrpl.Wallet.fromSecret(escrowSecret).address;
    const issuerAddress = this.configService.get('ISSUER_ADDRESS');
    if (!issuerAddress) {
      throw new Error('ISSUER_ADDRESS is not configured');
    }
    this.issuer = issuerAddress;
  }

  private async initXrplClient() {
    try {
      this.xrplClient = new xrpl.Client('wss://testnet.xrpl-labs.com');
      await this.xrplClient.connect();
      this.logger.log('Connected to XRPL Testnet');
    } catch (error) {
      this.logger.error('Failed to connect to XRPL', error);
      throw error;
    }
  }

  /**
   * Ensures XRPL client is connected, reconnecting if necessary
   * @returns A promise that resolves when the client is connected
   */
  private async ensureXrplConnection(): Promise<void> {
    try {
      if (!this.xrplClient) {
        this.logger.log('XRPL client not initialized, creating new client');
        await this.initXrplClient();
        return;
      }

      if (!this.xrplClient.isConnected()) {
        this.logger.log('XRPL client disconnected, reconnecting');
        await this.xrplClient.connect();
        this.logger.log('Reconnected to XRPL Testnet');
      }
    } catch (error) {
      this.logger.error('Failed to ensure XRPL connection', error);
      // Recreate client on failure
      this.logger.log('Recreating XRPL client after connection failure');
      await this.initXrplClient();
    }
  }

  /**
   * Creates a login payload for Xaman wallet
   * @returns The payload with QR to be scanned by Xaman
   */
  async createLoginPayload() {
    try {
      const payload = await this.xummSdk.payload.create({
        txjson: {
          TransactionType: 'SignIn',
        },
      });

      if (!payload) {
        throw new Error('Failed to create payload');
      }

      return {
        uuid: payload.uuid,
        qrUrl: payload.next.always,
        webSocketUrl: payload.refs.websocket_status,
      };
    } catch (error) {
      this.logger.error('Failed to create Xaman login payload', error);
      throw error;
    }
  }

  /**
   * Verify a login payload by UUID
   * @param uuid The payload UUID
   * @returns The wallet address if verified
   */
  async verifyLoginPayload(uuid: string) {
    try {
      const payload = await this.xummSdk.payload.get(uuid);

      if (!payload) {
        return {
          success: false,
          walletAddress: null,
        };
      }

      if (payload.meta.signed === true && payload.response?.account) {
        return {
          success: true,
          walletAddress: payload.response.account,
        };
      }

      return {
        success: false,
        walletAddress: null,
      };
    } catch (error) {
      this.logger.error('Failed to verify Xaman login payload', error);
      throw error;
    }
  }

  /**
   * Creates an escrow account with the specified parameters
   * @param params The escrow creation parameters
   * @returns The escrow account address
   */
  async createEscrow(params: CreateEscrowParams): Promise<string> {
    const masterWallet = xrpl.Wallet.generate();

    try {
      await this.ensureXrplConnection();

      console.log('Funding wallet', masterWallet);
      await this.xrplClient.fundWallet(masterWallet);
      console.log('Wallet funded', masterWallet);
      // Set up signer list
      const signerListSetTx: xrpl.SubmittableTransaction = {
        TransactionType: 'SignerListSet',
        Account: masterWallet.address,
        SignerQuorum: params.requiredWeight,
        SignerEntries: params.entries.map((entry) => ({
          SignerEntry: {
            Account: entry.address,
            SignerWeight: entry.weight,
          },
        })),
      };

      await this.xrplClient.submitAndWait(signerListSetTx, { wallet: masterWallet });
      console.log('Signer list set', masterWallet.address);
      // Set up trustline
      const trustlineTx: xrpl.SubmittableTransaction = {
        TransactionType: 'TrustSet',
        Account: masterWallet.address,
        LimitAmount: {
          currency: '524C555344000000000000000000000000000000',
          issuer: this.issuer,
          value: '1000000',
        },
        Flags: 0,
      };

      await this.xrplClient.submitAndWait(trustlineTx, { wallet: masterWallet });
      console.log('Trustline set', masterWallet.address);

      const disableMasterKeyTx: xrpl.SubmittableTransaction = {
        TransactionType: 'AccountSet',
        Account: masterWallet.address,
        SetFlag: 4,
        Memos: [
          {
            Memo: {
              MemoType: Buffer.from('EscrowMessage').toString('hex'),
              MemoData: Buffer.from(params.message).toString('hex'),
              MemoFormat: Buffer.from('text/plain').toString('hex'),
            },
          },
        ],
      };

      await this.xrplClient.submitAndWait(disableMasterKeyTx, { wallet: masterWallet });
      console.log('Escrow created', masterWallet.address);
      return masterWallet.address;
    } catch (error) {
      this.logger.error('Failed to create escrow', error);
      throw error;
    }
  }

  /**
   * Creates a TrustSet transaction for establishing trust lines
   * @param params The transaction parameters
   * @returns The transaction payload
   */
  async createTrustSetTransaction(params: CreateTrustSetTransactionParams) {
    const payload = await this.xummSdk.payload.create({
      txjson: {
        TransactionType: 'TrustSet',
        Account: params.account,
        LimitAmount: {
          currency: '524C555344000000000000000000000000000000',
          issuer: this.issuer,
          value: params.amount,
        },
        Flags: 0,
      },
    });
    return payload;
  }

  /**
   * Creates a Payment transaction
   * @param params The transaction parameters
   * @returns The transaction payload
   */
  async createPaymentTransaction(params: CreatePaymentTransactionParams) {
    const payload = await this.xummSdk.payload.create({
      txjson: {
        TransactionType: params.type,
        Account: params.account,
        Destination: params.destination,
        Amount: {
          currency: '524C555344000000000000000000000000000000',
          issuer: this.issuer,
          value: params.amount,
        },
        Flags: 0,
      },
    });
    return payload;
  }

  async createMultisigTransactionObject(
    params: CreateMultisigPaymentTransactionParams,
  ): Promise<XummJsonTransaction> {
    const accountInfo = await this.getAccountInfo(params.account);
    const baseTx: XummJsonTransaction = {
      TransactionType: params.type,
      Account: params.account,
      Destination: params.destination,
      Amount: {
        currency: '524C555344000000000000000000000000000000',
        issuer: this.issuer,
        value: params.amount,
      },
      SigningPubKey: '',
      Fee: '61',
      Flags: 0,
      Sequence: accountInfo.sequence,
      LastLedgerSequence: params.lastLedgerSequence,
    };
    return baseTx;
  }

  /**
   * Creates a multisig transaction payload
   * @param params The multisig transaction parameters
   * @returns The transaction payload
   */
  async signTransaction(params: SignTransactionParams): Promise<XummPostPayloadResponse | null> {
    return await this.xummSdk.payload.create({
      txjson: params.transaction,
      options: {
        multisign: true,
        signers: [params.signer],
        submit: false,
      },
    });
  }

  /**
   * Creates a multisig transaction payload
   * @param params The multisig transaction parameters
   * @returns The transaction payload
   */
  async submitMultisigTransaction(params: SubmitMultisigTransactionParams) {
    try {
      await this.ensureXrplConnection();
      console.log('signers', params.signers);
      const result = await this.xrplClient.submitAndWait({
        ...params.transaction,
        Signers: params.signers,
      });
      return result;
    } catch (error) {
      this.logger.error('Failed to create multisig transaction', error);
      throw error;
    }
  }

  /**
   * Gets account information
   * @param address The account address
   * @returns Account information
   */
  async getAccountInfo(address: string) {
    try {
      await this.ensureXrplConnection();

      const response = await this.xrplClient.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated',
      });

      return {
        address,
        balance: xrpl.dropsToXrp(response.result.account_data.Balance),
        sequence: response.result.account_data.Sequence,
        ledgerIndex: response.result.ledger_index || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get account info for ${address}`, error);
      throw error;
    }
  }

  /**
   * Gets account token balances
   * @param address The account address
   * @returns Account token balances including USDT
   */
  async getAccountTokenBalances(address: string): Promise<TokenBalanceResponseDto> {
    try {
      await this.ensureXrplConnection();

      const response = await this.xrplClient.request({
        command: 'account_lines',
        account: address,
        ledger_index: 'validated',
      });

      let balance = '0';
      let hasTrustline = false;

      if (response.result.lines && response.result.lines.length > 0) {
        // Look for RLUSD token lines (which is our USDT representation)
        const rlusdLine = response.result.lines.find(
          (line) =>
            line.currency === '524C555344000000000000000000000000000000' && line.account === this.issuer,
        );

        if (rlusdLine) {
          balance = rlusdLine.balance;
          hasTrustline = true; // If we found the line, trustline exists regardless of balance
        }
      }

      return {
        address,
        balance,
        hasTrustline,
      };
    } catch (error) {
      this.logger.error(`Failed to get token balances for ${address}`, error);
      // Return zero balance instead of throwing error for UI display
      return {
        address,
        balance: '0',
        hasTrustline: false,
      };
    }
  }

  /**
   * Gets a payload by UUID
   * @param uuid The payload UUID
   * @returns The payload details
   */
  async getPayload(uuid: string) {
    try {
      const payload = await this.xummSdk.payload.get(uuid);
      return payload;
    } catch (error) {
      this.logger.error('Failed to get payload', error);
      throw error;
    }
  }

  /**
   * Submits a signed transaction
   * @param signedBlob The signed transaction blob
   * @returns The submission result
   */
  async #submitTransaction(signedBlob: string) {
    try {
      await this.ensureXrplConnection();
      return await this.xrplClient.submit(signedBlob);
    } catch (error) {
      this.logger.error('Failed to submit transaction', error);
      throw error;
    }
  }

  /**
   * Gets the status of a transaction by UUID
   * @param uuid The payload UUID
   * @returns The transaction status
   */
  async getTransactionStatus(uuid: string): Promise<TransactionStatusResponseDto> {
    const payload = await this.getPayload(uuid);
    if (!payload) {
      throw new NotFoundException('Transaction not found');
    }

    if (!payload.meta.resolved || !payload.meta.signed) {
      return { status: TransactionStatus.PENDING };
    }

    return { status: TransactionStatus.SUCCESS };
  }

  async monitorAndSubmitPayload(
    payloadUuid: string,
  ): Promise<{ hash: string; success: boolean; signer: xrpl.Signer | null }> {
    return new Promise(async (resolve) => {
      const maxWaitTime = 180000; // 3 minutes timeout
      const startTime = Date.now();

      const checkAndSubmitTx = async () => {
        try {
          // Check if we've exceeded the timeout
          if (Date.now() - startTime > maxWaitTime) {
            this.logger.warn(`Transaction ${payloadUuid} timed out after ${maxWaitTime}ms`);
            return;
          }
          const payloadStatus = await this.getPayload(payloadUuid);
          if (!payloadStatus || !payloadStatus.meta.resolved || !payloadStatus.meta.signed) {
            setTimeout(checkAndSubmitTx, 500);
            return;
          }

          const signedBlob = payloadStatus.response.hex;

          if (!signedBlob) {
            throw new Error('No signed transaction blob available');
          }

          const submitResult = await this.#submitTransaction(signedBlob);
          const signer = (xrpl.decode(signedBlob!)['Signers'] as any)?.[0] ?? null;
          resolve({
            hash: submitResult.result.tx_json.hash!,
            signer,
            success: submitResult.result.engine_result === 'tesSUCCESS',
          });
        } catch (error) {
          console.error('Error checking payload status:', error);
          setTimeout(checkAndSubmitTx, 500); // Check every 500ms
        }
      };

      checkAndSubmitTx();
    });
  }

  /**
   * Get application configuration including admin address
   * @returns ConfigResponseDto with admin address
   */
  getConfig() {
    return {
      adminAddress: this.adminAddress,
    };
  }
}
