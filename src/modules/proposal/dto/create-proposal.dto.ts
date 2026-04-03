import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ProposalTypeEnum } from '../enums/proposal-type.enum';

export class CreateProposalDto {
  @ApiProperty()
  @IsString()
  penguinCategoryTagId: string;

  @ApiProperty({ example: 'Lezioni di matematica per liceo' })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 3000)
  description?: string;

  @ApiProperty({ enum: ProposalTypeEnum })
  @IsEnum(ProposalTypeEnum)
  proposalType: ProposalTypeEnum;

  @ApiPropertyOptional({ description: 'Max guests for EVENT type' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  guests?: number;

  @ApiPropertyOptional()
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

  @ApiPropertyOptional({ example: '2026-06-01T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-01T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  acceptance?: boolean;
}
