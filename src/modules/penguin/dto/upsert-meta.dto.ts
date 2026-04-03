import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpsertMetaDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  metaKey: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  metaValue?: string;
}
