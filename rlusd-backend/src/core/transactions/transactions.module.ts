import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { VendorsModule } from '../vendors/vendors.module';
import { XrplModule } from '../xrpl/xrpl.module';
import { ConfigModule } from '@nestjs/config';
import { EscrowStrategyModule } from './escrow-strategy/escrow-strategy.module';

@Module({
  imports: [PrismaModule, VendorsModule, XrplModule, ConfigModule, EscrowStrategyModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
