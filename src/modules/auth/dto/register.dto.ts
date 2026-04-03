import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { SexEnum } from '../../users/enums/sex.enum';

export class RegisterDto {
  @ApiProperty({ example: 'mario_rossi' })
  @IsString()
  @Length(1, 50)
  login: string;

  @ApiProperty({ example: 'MyPassword123!' })
  @IsString()
  @Length(8, 100)
  password: string;

  @ApiProperty({ example: 'mario@example.com' })
  @IsEmail()
  @Length(5, 100)
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 50)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 10)
  phone?: string;

  @ApiPropertyOptional({ enum: SexEnum })
  @IsOptional()
  @IsEnum(SexEnum)
  sex?: SexEnum;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ example: 'it' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  langKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referralCode?: string;
}
