import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET', 'changeme'),
    signOptions: {
      expiresIn: configService.get<number>('JWT_ACCESS_EXPIRATION', 900),
    },
  }),
};
