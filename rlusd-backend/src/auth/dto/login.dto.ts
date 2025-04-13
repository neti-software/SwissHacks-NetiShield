import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The XRPL wallet address',
    example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}
