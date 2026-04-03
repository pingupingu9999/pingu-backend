import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { SexEnum } from '../enums/sex.enum';

export class CreateUserDto {
  @IsString()
  @Length(1, 50)
  login: string;

  @IsString()
  @Length(8, 100)
  password: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @Length(5, 100)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(0, 256)
  taxCode?: string;

  @IsOptional()
  @IsString()
  @Length(0, 256)
  vatNumber?: string;

  @IsOptional()
  @IsString()
  @Length(0, 10)
  phone?: string;

  @IsOptional()
  @IsEnum(SexEnum)
  sex?: SexEnum;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsBoolean()
  activated?: boolean;

  @IsOptional()
  @IsString()
  @Length(2, 10)
  langKey?: string;

  @IsOptional()
  @IsString()
  @Length(0, 256)
  imageUrl?: string;
}