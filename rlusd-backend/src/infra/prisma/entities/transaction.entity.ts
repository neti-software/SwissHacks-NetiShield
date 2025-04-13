import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { TransactionStatusLogEntity, TransactionStatusLogSelect } from './transaction-status-log.entity';
import { ApiProperty } from '@nestjs/swagger';
import { VendorVerificationEntity, VendorVerificationSelect } from './vendor-verification.entity';

export const TransactionSelect = {
  id: true,
  recipientAddress: true,
  senderAddress: true,
  amount: true,
  escrowTransactionHash: true,
  recipientSignature: true,
  senderSignature: true,
  adminSignature: true,
  escrowWalletAddress: true,
  escrowLedgerIndex: true,
  currentStatus: {
    select: TransactionStatusLogSelect,
  },
  statusLog: {
    orderBy: {
      createdAt: 'desc',
    },
    select: TransactionStatusLogSelect,
  },
  vendorVerifications: {
    select: VendorVerificationSelect,
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TransactionSelect;

export class TransactionEntity {
  id: string;

  @ApiProperty({
    description: 'Address of the transaction recipient',
    example: '0x123...',
  })
  recipientAddress: string;

  @ApiProperty({
    description: 'Address of the transaction sender',
    example: '0x456...',
  })
  senderAddress: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 100,
  })
  amount: number;

  @ApiProperty({
    description: 'Escrow transaction ID (hash)',
    example: '1234567890ABCDEF...',
    nullable: true,
  })
  escrowTransactionHash: string | null;

  @ApiProperty({
    description: 'Transfer transaction IDs (hashes)',
    type: [String],
    example: ['1234567890ABCDEF...', '1234567890ABCDEF...'],
    nullable: true,
  })
  recipientSignature: string | null;

  @ApiProperty({
    description: 'Sender transfer transaction ID (hash)',
    example: '1234567890ABCDEF...',
    nullable: true,
  })
  senderSignature: string | null;

  @ApiProperty({
    description: 'Admin transfer transaction ID (hash)',
    example: '1234567890ABCDEF...',
    nullable: true,
  })
  adminSignature: string | null;

  @ApiProperty({
    description: 'Escrow wallet address',
    example: '0x123...',
    nullable: true,
  })
  escrowWalletAddress: string | null;

  @ApiProperty({
    description: 'Escrow sequence number',
    example: 1234567890,
    nullable: true,
  })
  escrowLedgerIndex: number | null;

  @ApiProperty({
    description: 'Vendor verifications for this transaction',
    type: [VendorVerificationEntity],
  })
  @Type(() => VendorVerificationEntity)
  vendorVerifications: VendorVerificationEntity[];

  @Type(() => TransactionStatusLogEntity)
  @ApiProperty({
    description: 'Current transaction status',
    type: TransactionStatusLogEntity,
  })
  currentStatus: TransactionStatusLogEntity | null;

  @Type(() => TransactionStatusLogEntity)
  @ApiProperty({
    description: 'Transaction status history',
    type: [TransactionStatusLogEntity],
  })
  statusLog: TransactionStatusLogEntity[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-03-25T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-03-25T12:00:00Z',
    nullable: true,
  })
  updatedAt: Date | null;

  constructor(transaction: Prisma.TransactionGetPayload<{ select: typeof TransactionSelect }>) {
    this.amount = transaction.amount;
    this.currentStatus = transaction.currentStatus;
    this.statusLog = transaction.statusLog;
    this.createdAt = transaction.createdAt;
    this.updatedAt = transaction.updatedAt;
    this.recipientAddress = transaction.recipientAddress;
    this.id = transaction.id;
    this.senderAddress = transaction.senderAddress;
    this.escrowTransactionHash = transaction.escrowTransactionHash;
    this.recipientSignature = transaction.recipientSignature;
    this.senderSignature = transaction.senderSignature;
    this.adminSignature = transaction.adminSignature;
    this.escrowWalletAddress = transaction.escrowWalletAddress;
    this.escrowLedgerIndex = transaction.escrowLedgerIndex;
    this.vendorVerifications = transaction.vendorVerifications.map(
      (verification) => new VendorVerificationEntity(verification),
    );
  }
}
