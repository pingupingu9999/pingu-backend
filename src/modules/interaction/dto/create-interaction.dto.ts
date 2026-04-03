import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateInteractionDto {
  @ApiProperty({ example: 'Like' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ example: '👍' })
  @IsOptional()
  @IsString()
  @Length(0, 10)
  emoji?: string;
}
