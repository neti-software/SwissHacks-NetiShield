import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateEscrowParams } from 'src/core/xrpl/xrpl.types';
import * as xrpl from 'xrpl';

@Injectable()
export class EscrowStrategyService {
  private readonly escrowWallet: xrpl.Wallet;

  constructor(private configService: ConfigService) {
    const escrowSecret = this.configService.get<string>('ESCROW_WALLET_SECRET_KEY');
    if (!escrowSecret) {
      throw new Error('ESCROW_WALLET_SECRET_KEY is not configured');
    }

    this.escrowWallet = xrpl.Wallet.fromSecret(escrowSecret);
  }

  /**
   * Creates escrow parameters based on the strategy
   * @param sender The sender's address
   * @param recipient The recipient's address
   * @param isSenderFailed Whether the sender has failed
   * @param isRecipientFailed Whether the recipient has failed
   * @returns The escrow parameters
   */
  createEscrowParams(
    sender: string,
    recipient: string,
    isSenderFailed: boolean,
    isRecipientFailed: boolean,
  ): CreateEscrowParams {
    const entries = [
      {
        address: sender,
        weight: isSenderFailed ? 1 : 10,
      },
      {
        address: recipient,
        weight: isRecipientFailed ? 1 : 10,
      },
      {
        address: this.escrowWallet.address,
        weight: 10,
      },
    ];

    let requiredWeight = 0;

    if (isSenderFailed && isRecipientFailed) {
      requiredWeight = 10;
    } else if (isSenderFailed) {
      requiredWeight = 20;
    } else if (isRecipientFailed) {
      requiredWeight = 20;
    } else {
      requiredWeight = 20;
    }

    return {
      message: 'Escrow transaction',
      requiredWeight,
      entries,
    };
  }
}
