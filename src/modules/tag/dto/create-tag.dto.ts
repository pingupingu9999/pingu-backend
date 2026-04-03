import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'ID of the system CategoryTag to associate' })
  @IsString()
  categoryTagId: string;

  @ApiProperty({ example: 'Ripetizioni liceo' })
  @IsString()
  @Length(1, 100)
  customName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Radius in km: 1, 5, 10, 50 or null (global)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  radius?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
