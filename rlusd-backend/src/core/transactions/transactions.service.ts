import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Prisma, TransactionStatus, VendorVerificationStatus } from '@prisma/client';
import { TransactionEntity, TransactionSelect } from '@infra/prisma/entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { VendorsService } from '../vendors/vendors.service';
import { XrplService } from '../xrpl/xrpl.service';
import { BuildTrustlineDto } from './dto/build-trustline.dto';
import { TransactionResponseDto } from './dto/transaction.response';
import { TransactionActionDto } from './dto/transaction-action.dto';
import { EscrowStrategyService } from './escrow-strategy/escrow-strategy.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly issuer = process.env.ISSUER_ADDRESS || 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV';
  constructor(
    private prisma: PrismaService,
    private vendorsService: VendorsService,
    private xrplService: XrplService,
    private escrowStrategyService: EscrowStrategyService,
  ) {}

  async findAll(params: { senderAddress?: string; recipientAddress?: string }) {
    const { senderAddress, recipientAddress } = params;
    const where: Prisma.TransactionWhereInput = {
      OR: [
        {
          statusLog: {
            some: {
              status: {
                in: [TransactionStatus.ESCROW_FUNDED],
              },
            },
          },
        },
      ],
    };

    if (senderAddress) {
      where.senderAddress = senderAddress;
    }

    if (recipientAddress) {
      where.recipientAddress = recipientAddress;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: TransactionSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions.map((transaction) => new TransactionEntity(transaction));
  }

  async findById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      select: TransactionSelect,
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return new TransactionEntity(transaction);
  }

  async create(createTransactionDto: CreateTransactionDto) {
    try {
      const transaction = await this.prisma.transaction.create({
        data: {
          amount: createTransactionDto.amount,
          recipientAddress: createTransactionDto.recipientAddress,
          senderAddress: createTransactionDto.senderAddress,
          statusLog: {
            create: {
              status: TransactionStatus.PENDING_VERIFICATION,
            },
          },
          vendorVerifications: {
            create: createTransactionDto.vendorIds.flatMap((vendorId) => [
              {
                vendorId,
                subjectAddress: createTransactionDto.senderAddress,
                statusLog: {
                  create: {
                    status: VendorVerificationStatus.PENDING,
                  },
                },
              },
              {
                vendorId,
                subjectAddress: createTransactionDto.recipientAddress,
                statusLog: {
                  create: {
                    status: VendorVerificationStatus.PENDING,
                  },
                },
              },
            ]),
          },
        },
        select: TransactionSelect,
      });

      return await this.#verifyTransactionAndProcess(new TransactionEntity(transaction));
    } catch (error) {
      this.logger.error('Failed to create transaction', error);
      throw error;
    }
  }

  async buildTrustlineTransaction(data: BuildTrustlineDto): Promise<TransactionResponseDto> {
    const payload = await this.xrplService.createTrustSetTransaction({
      account: data.account,
      destination: this.issuer,
      amount: '1000000',
      type: 'TrustSet',
    });

    if (!payload) {
      throw new Error('Failed to create payload');
    }

    return TransactionResponseDto.fromPayload(payload);
  }

  async approveTransaction(id: string, approveTransactionDto: TransactionActionDto) {
    const transaction = await this.findById(id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (!transaction.escrowWalletAddress) {
      throw new BadRequestException(`Transaction can only be approved if its escrow wallet address is set.`);
    }

    try {
      const transactionParams = await this.xrplService.createMultisigTransactionObject({
        account: transaction.escrowWalletAddress!,
        destination: transaction.recipientAddress,
        amount: transaction.amount.toString(),
        type: 'Payment',
        lastLedgerSequence: transaction.escrowLedgerIndex!,
      });
      const signedTransaction = await this.xrplService.signTransaction({
        transaction: transactionParams,
        signer: approveTransactionDto.signer,
      });

      if (!signedTransaction) {
        throw new Error('Failed to create payload');
      }

      this.xrplService.monitorAndSubmitPayload(signedTransaction.uuid).then(async ({ signer }) => {
        const isSender = approveTransactionDto.signer === transaction.senderAddress;
        const isRecipient = approveTransactionDto.signer === transaction.recipientAddress;
        const isAdmin = approveTransactionDto.signer === this.xrplService.getConfig().adminAddress;
        const status = isSender
          ? TransactionStatus.SENDER_APPROVED
          : isRecipient
            ? TransactionStatus.RECIPIENT_APPROVED
            : isAdmin
              ? TransactionStatus.ADMIN_APPROVED
              : undefined;
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            recipientSignature: isRecipient ? JSON.stringify(signer) : undefined,
            senderSignature: isSender ? JSON.stringify(signer) : undefined,
            adminSignature: isAdmin ? JSON.stringify(signer) : undefined,
            statusLog: status
              ? {
                  create: {
                    status,
                  },
                }
              : undefined,
          },
        });
        await this.#verifySubmitMultisigTransaction(transaction.id);
      });
      return TransactionResponseDto.fromPayload(signedTransaction!, transaction.id);
    } catch (err) {
      console.error('Error creating multisig payload:', err);
      await this.#updateStatus(transaction.id, TransactionStatus.FAILED);
      throw err;
    }
  }

  async rejectTransaction(id: string, rejectTransactionDto: TransactionActionDto) {
    const transaction = await this.findById(id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (!transaction.escrowWalletAddress) {
      throw new BadRequestException(`Transaction can only be rejected if its escrow wallet address is set.`);
    }

    let payload = null;
    try {
      const transactionParams = await this.xrplService.createMultisigTransactionObject({
        account: transaction.escrowWalletAddress!,
        destination: transaction.senderAddress,
        amount: transaction.amount.toString(),
        type: 'Payment',
        lastLedgerSequence: transaction.escrowLedgerIndex!,
      });
      payload = await this.xrplService.signTransaction({
        transaction: transactionParams,
        signer: rejectTransactionDto.signer,
      });

      if (!payload) {
        throw new Error('Failed to create payload');
      }

      this.xrplService.monitorAndSubmitPayload(payload.uuid).then(async ({ signer }) => {
        const isSender = rejectTransactionDto.signer === transaction.senderAddress;
        const isRecipient = rejectTransactionDto.signer === transaction.recipientAddress;
        const isAdmin = rejectTransactionDto.signer === this.xrplService.getConfig().adminAddress;
        const status = isSender
          ? TransactionStatus.SENDER_REJECTED
          : isRecipient
            ? TransactionStatus.RECIPIENT_REJECTED
            : isAdmin
              ? TransactionStatus.ADMIN_REJECTED
              : undefined;

        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            recipientSignature: isRecipient ? JSON.stringify(signer) : undefined,
            senderSignature: isSender ? JSON.stringify(signer) : undefined,
            adminSignature: isAdmin ? JSON.stringify(signer) : undefined,
            statusLog: status
              ? {
                  create: {
                    status,
                  },
                }
              : undefined,
          },
        });
        await this.#verifySubmitMultisigTransaction(transaction.id);
      });
    } catch (err) {
      console.error('Error creating rejection payload:', err);
      await this.#updateStatus(transaction.id, TransactionStatus.FAILED);
    }

    return TransactionResponseDto.fromPayload(payload!, transaction.id);
  }

  async #verifySubmitMultisigTransaction(transactionId: string) {
    try {
      const transaction = await this.findById(transactionId);
      if (!transaction) {
        return;
      }
      const hasStatus = (status: TransactionStatus) =>
        transaction.statusLog.some((statusLog) => statusLog.status === status);

      const isRejected =
        (hasStatus(TransactionStatus.RECIPIENT_AND_SENDER_VERIFICATION_FAILED) &&
          hasStatus(TransactionStatus.ADMIN_REJECTED)) ||
        (hasStatus(TransactionStatus.RECIPIENT_VERIFICATION_FAILED) &&
          hasStatus(TransactionStatus.ADMIN_REJECTED) &&
          hasStatus(TransactionStatus.SENDER_REJECTED)) ||
        (hasStatus(TransactionStatus.SENDER_VERIFICATION_FAILED) &&
          hasStatus(TransactionStatus.ADMIN_REJECTED) &&
          hasStatus(TransactionStatus.RECIPIENT_REJECTED));

      const isApproved =
        (hasStatus(TransactionStatus.RECIPIENT_AND_SENDER_VERIFICATION_FAILED) &&
          hasStatus(TransactionStatus.ADMIN_APPROVED)) ||
        (hasStatus(TransactionStatus.RECIPIENT_VERIFICATION_FAILED) &&
          hasStatus(TransactionStatus.ADMIN_APPROVED) &&
          hasStatus(TransactionStatus.SENDER_APPROVED)) ||
        (hasStatus(TransactionStatus.SENDER_VERIFICATION_FAILED) &&
          hasStatus(TransactionStatus.ADMIN_APPROVED) &&
          hasStatus(TransactionStatus.RECIPIENT_APPROVED));

      if (!isApproved && !isRejected) {
        return;
      }
      const signers = [];
      signers.push(JSON.parse(transaction.adminSignature!));
      if (hasStatus(TransactionStatus.RECIPIENT_VERIFICATION_FAILED)) {
        signers.push(JSON.parse(transaction.senderSignature!));
      } else if (hasStatus(TransactionStatus.SENDER_VERIFICATION_FAILED)) {
        signers.push(JSON.parse(transaction.recipientSignature!));
      }

      const transactionParams = await this.xrplService.createMultisigTransactionObject({
        account: transaction.escrowWalletAddress!,
        destination: isRejected ? transaction.senderAddress : transaction.recipientAddress,
        amount: transaction.amount.toString(),
        type: 'Payment',
        lastLedgerSequence: transaction.escrowLedgerIndex!,
      });

      await this.xrplService.submitMultisigTransaction({
        transaction: transactionParams as any,
        signers,
      });
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          statusLog: {
            create: {
              status: TransactionStatus.SUCCESS,
            },
          },
        },
      });
    } catch (e) {
      console.error('Error submitting multisig transaction:', e);
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          statusLog: {
            create: {
              status: TransactionStatus.FAILED,
            },
          },
        },
      });
    }
  }

  async #verifyTransactionAndProcess(transaction: TransactionEntity) {
    await this.#verifyTransaction(transaction);
    const result = await this.#processTransaction(transaction.id);
    return result;
  }

  async #verifyTransaction(transaction: TransactionEntity) {
    const verificationResults = await Promise.all(
      transaction.vendorVerifications.map(async (vendorVerification) => {
        const result = await this.vendorsService.isAddressSafe(
          vendorVerification.vendor.name,
          vendorVerification.subjectAddress,
          vendorVerification.subjectAddress === transaction.senderAddress ? 'sender' : 'recipient',
        );

        await this.#updateVendorVerificationStatus(
          vendorVerification.id,
          result ? VendorVerificationStatus.APPROVED : VendorVerificationStatus.REJECTED,
        );

        return {
          vendorId: vendorVerification.vendor.id,
          approved: result,
          subjectAddress: vendorVerification.subjectAddress,
        };
      }),
    );

    const senderRejected = verificationResults.some(
      (result) => !result.approved && result.subjectAddress === transaction.senderAddress,
    );
    const recipientRejected = verificationResults.some(
      (result) => !result.approved && result.subjectAddress === transaction.recipientAddress,
    );

    let transactionStatus;
    if (senderRejected && recipientRejected) {
      transactionStatus = TransactionStatus.RECIPIENT_AND_SENDER_VERIFICATION_FAILED;
    } else if (senderRejected) {
      transactionStatus = TransactionStatus.SENDER_VERIFICATION_FAILED;
    } else if (recipientRejected) {
      transactionStatus = TransactionStatus.RECIPIENT_VERIFICATION_FAILED;
    } else {
      transactionStatus = TransactionStatus.VERIFICATION_SUCCESS;
    }

    if (transactionStatus !== TransactionStatus.VERIFICATION_SUCCESS) {
      const escrowParams = this.escrowStrategyService.createEscrowParams(
        transaction.senderAddress,
        transaction.recipientAddress,
        senderRejected,
        recipientRejected,
      );

      const escrowWalletAddress = await this.xrplService.createEscrow(escrowParams);
      const accountInfo = await this.xrplService.getAccountInfo(escrowWalletAddress);
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { escrowWalletAddress, escrowLedgerIndex: accountInfo.ledgerIndex + 100000 },
      });
    }

    await this.#updateStatus(transaction.id, transactionStatus);
  }

  async #processTransaction(transactionId: string) {
    const transaction = await this.findById(transactionId);
    if (
      transaction.currentStatus?.status !== TransactionStatus.RECIPIENT_AND_SENDER_VERIFICATION_FAILED &&
      transaction.currentStatus?.status !== TransactionStatus.RECIPIENT_VERIFICATION_FAILED &&
      transaction.currentStatus?.status !== TransactionStatus.SENDER_VERIFICATION_FAILED &&
      transaction.currentStatus?.status !== TransactionStatus.VERIFICATION_SUCCESS
    ) {
      throw new Error('Transaction is not in VERIFICATION_FAILED or VERIFICATION_SUCCESS status');
    }

    const escrow =
      transaction.currentStatus?.status === TransactionStatus.RECIPIENT_AND_SENDER_VERIFICATION_FAILED ||
      transaction.currentStatus?.status === TransactionStatus.RECIPIENT_VERIFICATION_FAILED ||
      transaction.currentStatus?.status === TransactionStatus.SENDER_VERIFICATION_FAILED;

    const payload = await this.xrplService.createPaymentTransaction({
      account: transaction.senderAddress,
      destination: escrow ? transaction.escrowWalletAddress! : transaction.recipientAddress,
      amount: transaction.amount.toString(),
      type: 'Payment',
    });

    if (!payload) {
      throw new Error('Failed to create payload');
    }

    this.xrplService.monitorAndSubmitPayload(payload.uuid).then(async ({ hash, success }) => {
      if (escrow) {
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            escrowTransactionHash: hash,
            statusLog: { create: { status: TransactionStatus.ESCROW_FUNDED } },
          },
        });
        return;
      }

      if (!success) {
        return;
      }
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          statusLog: { create: { status: TransactionStatus.SUCCESS } },
        },
      });
    });

    return TransactionResponseDto.fromPayload(payload, transaction.id);
  }

  async #updateVendorVerificationStatus(vendorVerificationId: string, status: VendorVerificationStatus) {
    await this.prisma.vendorVerificationStatusLog.create({
      data: {
        status,
        vendorVerificationId,
      },
    });
  }

  async #updateStatus(transactionId: string, status: TransactionStatus) {
    await this.prisma.transactionStatusLog.create({
      data: {
        status,
        transactionId,
      },
    });

    return this.findById(transactionId);
  }
}
