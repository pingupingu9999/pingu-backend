import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ReactDto {
  @ApiProperty()
  @IsString()
  interactionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 10)
  emoji?: string;
}
