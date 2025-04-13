import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { XrplService } from './xrpl.service';
import { TransactionStatusResponseDto } from './dto/get-transaction-status.dto';
import { TokenBalanceResponseDto } from './dto/token-balance-response.dto';
import { ConfigResponseDto } from './dto/config-response.dto';

@ApiTags('xrpl')
@Controller('xrpl')
export class XrplController {
  constructor(private readonly xrplService: XrplService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get application configuration including admin address' })
  @ApiResponse({
    status: 200,
    description: 'Application configuration retrieved successfully',
    type: ConfigResponseDto,
  })
  async getConfig(): Promise<ConfigResponseDto> {
    return this.xrplService.getConfig();
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get XRPL transaction status by UUID' })
  @ApiParam({ name: 'uuid', type: String, description: 'Transaction UUID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction status retrieved successfully',
    type: TransactionStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async getTransactionStatus(@Param('uuid') uuid: string): Promise<TransactionStatusResponseDto> {
    return this.xrplService.getTransactionStatus(uuid);
  }

  @Get('balance/:address')
  @ApiOperation({ summary: 'Get token balances for authenticated user' })
  @ApiParam({ name: 'address', type: String, description: 'Wallet address' })
  @ApiResponse({
    status: 200,
    description: 'Token balances retrieved successfully',
    type: TokenBalanceResponseDto,
  })
  async getTokenBalance(@Param('address') address: string): Promise<TokenBalanceResponseDto> {
    return this.xrplService.getAccountTokenBalances(address);
  }
}
