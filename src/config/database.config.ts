import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres' as const,
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    // Connection pool — evita esaurimento connessioni in produzione
    extra: {
      max: configService.get<number>('DB_POOL_MAX', 10),
      min: configService.get<number>('DB_POOL_MIN', 2),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    },
  }),
};
