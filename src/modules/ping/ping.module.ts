import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ping } from './entities/ping.entity';
import { DailyLimit } from './entities/daily-limit.entity';
import { PingService } from './ping.service';
import { PingController } from './ping.controller';
import { PenguinModule } from '../penguin/penguin.module';
import { ProposalModule } from '../proposal/proposal.module';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ping, DailyLimit]),
    PenguinModule,
    ProposalModule,
    WalletModule,
    NotificationModule,
  ],
  controllers: [PingController],
  providers: [PingService],
  exports: [PingService],
})
export class PingModule {}
