import { IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  recipientAddress: string;

  @ApiProperty()
  @IsString()
  senderAddress: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  vendorIds: string[];
}
