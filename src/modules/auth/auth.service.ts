import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { PenguinService } from '../penguin/penguin.service';
import { WalletService } from '../wallet/wallet.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly penguinService: PenguinService,
    private readonly walletService: WalletService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async validateUser(login: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { login: login.toLowerCase() },
      select: ['id', 'login', 'password', 'activated', 'firstName', 'lastName', 'email'],
      relations: ['authorities'],
    });
    if (!user || !user.password) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
  }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.validateUser(dto.login, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.activated) throw new UnauthorizedException('Account not activated');
    return this.generateTokens(user);
  }

  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    const existing = await this.usersService.findByLogin(dto.login);
    if (existing) throw new ConflictException('Login already taken');

    const user = await this.usersService.registerUser(dto);

    // Create penguin profile
    const penguin = await this.penguinService.createForUser(user.id);

    // Grant 100pc signup bonus
    await this.walletService.grantSignupBonus(penguin.id);

    return this.generateTokens(user);
  }

  async refreshToken(token: string): Promise<TokenResponseDto> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh_changeme'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.usersService.findOne(payload.sub);
    return this.generateTokens(user);
  }

  private generateTokens(user: User): TokenResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      login: user.login,
      authorities: (user.authorities || []).map((a) => a.name),
    };
    const accessExpiration = this.configService.get<number>('JWT_ACCESS_EXPIRATION', 900);
    const refreshExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRATION', 604800);

    const accessToken = this.jwtService.sign(payload, { expiresIn: accessExpiration });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh_changeme'),
      expiresIn: refreshExpiration,
    });

    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: accessExpiration };
  }
}
