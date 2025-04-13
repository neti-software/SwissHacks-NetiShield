import { ApiProperty } from '@nestjs/swagger';
import { Prisma, TransactionStatus } from '@prisma/client';

export const TransactionStatusLogSelect = {
  id: true,
  status: true,
  createdAt: true,
} satisfies Prisma.TransactionStatusLogSelect;

export class TransactionStatusLogEntity {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
