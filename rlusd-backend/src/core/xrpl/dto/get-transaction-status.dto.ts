import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../xrpl.types';

export class TransactionStatusResponseDto {
  @ApiProperty({
    description: 'The status of the XRPL transaction',
    enum: TransactionStatus,
    example: TransactionStatus.SUCCESS,
  })
  status: TransactionStatus;
}
