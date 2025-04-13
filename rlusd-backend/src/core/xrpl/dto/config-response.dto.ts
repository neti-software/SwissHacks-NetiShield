import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for application configuration
 */
export class ConfigResponseDto {
  @ApiProperty({
    description: 'The admin wallet address',
    example: 'rWsmTxAbgWLT8bgDN9WFtDPvuKLP1JzrM',
  })
  adminAddress: string;
}
