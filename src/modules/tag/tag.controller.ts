import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagService } from './tag.service';

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user tag (costs 100pc, transactional)' })
  @ApiResponse({ status: 201, description: 'Tag created and 100pc deducted' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'CategoryTag not found' })
  create(@CurrentUser() user: User, @Body() dto: CreateTagDto) {
    return this.tagService.create(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'List my active tags' })
  @ApiResponse({ status: 200, description: 'My tags' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMine(@CurrentUser() user: User) {
    return this.tagService.findMyTags(user.id);
  }

  @Get('penguin/:penguinId')
  @ApiOperation({ summary: 'Get public active tags of a penguin' })
  @ApiResponse({ status: 200, description: 'Public tags of the penguin' })
  findByPenguin(@Param('penguinId') penguinId: string) {
    return this.tagService.findPublicByPenguin(penguinId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by id' })
  @ApiResponse({ status: 200, description: 'Tag detail' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  findOne(@Param('id') id: string) {
    return this.tagService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update my tag' })
  @ApiResponse({ status: 200, description: 'Tag updated' })
  @ApiResponse({ status: 403, description: 'Forbidden – not your tag' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTagDto, @CurrentUser() user: User) {
    return this.tagService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete my tag' })
  @ApiResponse({ status: 204, description: 'Tag deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden – not your tag' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tagService.softDelete(id, user.id);
  }
}
