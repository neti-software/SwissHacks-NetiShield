import { Module } from '@nestjs/common';
import { EscrowStrategyService } from './escrow-strategy.service';

@Module({
  providers: [EscrowStrategyService],
  exports: [EscrowStrategyService],
})
export class EscrowStrategyModule {}
