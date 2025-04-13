import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { TransactionsModule } from './core/transactions/transactions.module';
import { VendorsModule } from './core/vendors/vendors.module';
import { XrplModule } from './core/xrpl/xrpl.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TransactionsModule,
    VendorsModule,
    XrplModule,
  ],
})
export class AppModule {}
