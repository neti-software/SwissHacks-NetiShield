import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { XrplService } from './xrpl.service';
import { XrplController } from './xrpl.controller';

@Module({
  imports: [ConfigModule],
  controllers: [XrplController],
  providers: [XrplService],
  exports: [XrplService],
})
export class XrplModule {}
