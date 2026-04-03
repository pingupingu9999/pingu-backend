import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenguinWallet } from './entities/penguin-wallet.entity';
import { CoinBundle } from './entities/coin-bundle.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PenguinModule } from '../penguin/penguin.module';

@Module({
  imports: [TypeOrmModule.forFeature([PenguinWallet, CoinBundle]), PenguinModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService, TypeOrmModule],
})
export class WalletModule {}
