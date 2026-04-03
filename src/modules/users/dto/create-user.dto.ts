import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SexEnum } from '../enums/sex.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'mario_rossi', maxLength: 50 })
  @IsString()
  @Length(1, 50)
  login: string;

  @ApiProperty({ example: 'Str0ng!Pass', minLength: 8, maxLength: 100 })
  @IsString()
  @Length(8, 100)
  password: string;

  @ApiPropertyOptional({ example: 'Mario', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Rossi', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  lastName?: string;

  @ApiPropertyOptional({ example: 'mario@example.com', maxLength: 100 })
  @IsOptional()
  @IsEmail()
  @Length(5, 100)
  email?: string;

  @ApiPropertyOptional({ example: 'RSSMRA80A01H501U', maxLength: 256 })
  @IsOptional()
  @IsString()
  @Length(0, 256)
  taxCode?: string;

  @ApiPropertyOptional({ example: '12345678901', maxLength: 256 })
  @IsOptional()
  @IsString()
  @Length(0, 256)
  vatNumber?: string;

  @ApiPropertyOptional({ example: '+393331234567', maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(0, 10)
  phone?: string;

  @ApiPropertyOptional({ enum: SexEnum, example: SexEnum.MALE })
  @IsOptional()
  @IsEnum(SexEnum)
  sex?: SexEnum;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  activated?: boolean;

  @ApiPropertyOptional({ example: 'it', minLength: 2, maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  langKey?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg', maxLength: 256 })
  @IsOptional()
  @IsString()
  @Length(0, 256)
  imageUrl?: string;
}
