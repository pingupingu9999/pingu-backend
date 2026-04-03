import { Module, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
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
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const logger = new Logger('CacheModule');
        try {
          const store = await redisStore({ url: config.get<string>('REDIS_URL') });
          logger.log('Redis cache connesso');
          return { store, ttl: 60_000 };
        } catch (err) {
          logger.warn(`Redis non disponibile, fallback in-memory: ${(err as Error).message}`);
          return { ttl: 60_000 };
        }
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60_000, limit: 100 },
      { name: 'auth', ttl: 60_000, limit: 10 },
    ]),
    TypeOrmModule.forRootAsync(databaseConfig),
    HealthModule,
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
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
