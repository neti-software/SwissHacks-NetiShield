import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionEntity } from '@infra/prisma/entities/transaction.entity';
import { BuildTrustlineDto } from './dto/build-trustline.dto';
import { TransactionResponseDto } from './dto/transaction.response';
import { TransactionActionDto } from './dto/transaction-action.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Post('trustline')
  @ApiBody({ type: BuildTrustlineDto })
  @ApiResponse({
    status: 200,
    description: 'Transaction sign url and uuid',
    type: TransactionResponseDto,
  })
  async createTrustline(@Body() data: BuildTrustlineDto): Promise<TransactionResponseDto> {
    return await this.transactionsService.buildTrustlineTransaction(data);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction approved successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async approveTransaction(@Param('id') id: string, @Body() approveTransactionDto: TransactionActionDto) {
    return this.transactionsService.approveTransaction(id, approveTransactionDto);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a transaction' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: TransactionActionDto })
  @ApiResponse({
    status: 200,
    description: 'Transaction rejected successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async rejectTransaction(
    @Param('id') id: string,
    @Body() transactionActionDto: TransactionActionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.rejectTransaction(id, transactionActionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    type: [TransactionEntity],
  })
  @ApiQuery({ name: 'senderAddress', required: false, description: 'Filter by sender address' })
  @ApiQuery({ name: 'recipientAddress', required: false, description: 'Filter by recipient address' })
  async findAll(
    @Query('senderAddress') senderAddress?: string,
    @Query('recipientAddress') recipientAddress?: string,
  ): Promise<TransactionEntity[]> {
    return this.transactionsService.findAll({ senderAddress, recipientAddress });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find transaction by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Transaction found',
    type: TransactionEntity,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string): Promise<TransactionEntity> {
    return this.transactionsService.findById(id);
  }
}
