import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpsertSettingDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  settingKey: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  settingValue?: string;
}
