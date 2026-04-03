import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { InteractionModule } from './modules/interaction/interaction.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PenguinModule } from './modules/penguin/penguin.module';
import { PingModule } from './modules/ping/ping.module';
import { ProposalModule } from './modules/proposal/proposal.module';
import { ReferralModule } from './modules/referral/referral.module';
import { SearchModule } from './modules/search/search.module';
import { TagModule } from './modules/tag/tag.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
    UsersModule,
    AuthModule,
    PenguinModule,
    CategoryModule,
    TagModule,
    WalletModule,
    ProposalModule,
    InteractionModule,
    PingModule,
    SearchModule,
    ReferralModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
