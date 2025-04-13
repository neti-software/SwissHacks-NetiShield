import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Wallet address',
    example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  })
  walletAddress: string;
}
