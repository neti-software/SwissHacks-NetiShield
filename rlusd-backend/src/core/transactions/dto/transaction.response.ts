import { ApiProperty } from '@nestjs/swagger';
import { XummPostPayloadResponse } from 'xumm-sdk/dist/src/types';

export class TransactionResponseDto {
  @ApiProperty({ required: false })
  transactionId?: string;

  @ApiProperty()
  signUrl: string;

  @ApiProperty()
  uuid: string;

  static fromPayload(payload: XummPostPayloadResponse, transactionId?: string): TransactionResponseDto {
    const response = new TransactionResponseDto();
    response.transactionId = transactionId;
    response.signUrl = payload.next.always;
    response.uuid = payload.uuid;
    return response;
  }
}
