import { ApiProperty } from '@nestjs/swagger';

export class TokenBalanceResponseDto {
  @ApiProperty({
    description: 'Wallet address',
    example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  })
  address: string;

  @ApiProperty({
    description: 'USDT balance',
    example: '1000.00',
  })
  balance: string;

  @ApiProperty({
    description: 'Whether the account has a trustline for USDT',
    example: true,
  })
  hasTrustline: boolean;
}
