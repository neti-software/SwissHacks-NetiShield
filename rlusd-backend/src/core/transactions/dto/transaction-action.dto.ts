import { IsString } from 'class-validator';

export class TransactionActionDto {
  @IsString()
  signer: string;
}
