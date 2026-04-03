import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreatePingDto {
  @ApiProperty({ description: 'ID of the proposal to ping' })
  @IsString()
  proposalId: string;

  @ApiPropertyOptional({ description: 'Optional message to the proposal owner' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  message?: string;
}
