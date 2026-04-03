import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ApplyReferralDto {
  @ApiProperty({ example: 'PINGU-000042-AB3C' })
  @IsString()
  @Matches(/^PINGU-\d{6}-[A-Z0-9]{4}$/, { message: 'Invalid referral code format' })
  code: string;
}
