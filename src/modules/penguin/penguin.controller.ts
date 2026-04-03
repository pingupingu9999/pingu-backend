import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UpdatePenguinDto } from './dto/update-penguin.dto';
import { UpsertMetaDto } from './dto/upsert-meta.dto';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { PenguinService } from './penguin.service';

@ApiTags('penguin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('penguins')
export class PenguinController {
  constructor(private readonly penguinService: PenguinService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my penguin profile' })
  @ApiResponse({ status: 200, description: 'My penguin profile with meta and settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Penguin profile not found' })
  getMyProfile(@CurrentUser() user: User) {
    return this.penguinService.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a penguin profile by id' })
  @ApiResponse({ status: 200, description: 'Penguin profile' })
  @ApiResponse({ status: 404, description: 'Penguin not found' })
  findOne(@Param('id') id: string) {
    return this.penguinService.findById(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my penguin profile (bio, description, location)' })
  @ApiResponse({ status: 200, description: 'Updated penguin profile' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateMyProfile(@CurrentUser() user: User, @Body() dto: UpdatePenguinDto) {
    return this.penguinService
      .findByUserId(user.id)
      .then((penguin) => this.penguinService.update(penguin.id, dto, user.id));
  }

  @Post('me/meta')
  @ApiOperation({ summary: 'Upsert a custom meta field on my penguin' })
  @ApiResponse({ status: 201, description: 'Meta field saved' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  upsertMeta(@CurrentUser() user: User, @Body() dto: UpsertMetaDto) {
    return this.penguinService
      .findByUserId(user.id)
      .then((p) => this.penguinService.upsertMeta(p.id, dto, user.id));
  }

  @Post('me/settings')
  @ApiOperation({ summary: 'Upsert a setting on my penguin (e.g. active=true/false)' })
  @ApiResponse({ status: 201, description: 'Setting saved' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  upsertSetting(@CurrentUser() user: User, @Body() dto: UpsertSettingDto) {
    return this.penguinService
      .findByUserId(user.id)
      .then((p) => this.penguinService.upsertSetting(p.id, dto, user.id));
  }
}
