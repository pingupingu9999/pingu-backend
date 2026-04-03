import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'mario_rossi' })
  @IsString()
  @Length(1, 50)
  login: string;

  @ApiProperty({ example: 'MyPassword123!' })
  @IsString()
  @Length(8, 100)
  password: string;
}
