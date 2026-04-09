import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Cache } from 'cache-manager';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  login: string;
  authorities: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'changeme'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload) {
    const token = request.headers['authorization']?.split(' ')[1];
    if (token && await this.cacheManager.get(`blacklist:${token}`)) {
      throw new UnauthorizedException('Token revocato');
    }
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
