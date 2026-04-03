import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
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
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { PenguinService } from '../penguin/penguin.service';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly penguinService: PenguinService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista le mie notifiche (paginate, dalla più recente)' })
  @ApiResponse({ status: 200, description: 'Lista paginata di notifiche' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() user: User, @Query() pagination: PaginationDto) {
    const penguin = await this.penguinService.findByUserId(user.id);
    const [data, total] = await this.notificationService.findMyNotifications(
      penguin.id,
      pagination.page,
      pagination.size,
    );
    return { data, meta: { page: pagination.page, size: pagination.size, total } };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Numero di notifiche non lette' })
  @ApiResponse({ status: 200, description: '{ count: number }' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async countUnread(@CurrentUser() user: User) {
    const penguin = await this.penguinService.findByUserId(user.id);
    return { count: await this.notificationService.countUnread(penguin.id) };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Segna una notifica come letta' })
  @ApiResponse({ status: 200, description: '{ success: true }' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    const penguin = await this.penguinService.findByUserId(user.id);
    await this.notificationService.markAsRead(id, penguin.id);
    return { success: true };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Segna tutte le notifiche come lette' })
  @ApiResponse({ status: 200, description: '{ success: true }' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@CurrentUser() user: User) {
    const penguin = await this.penguinService.findByUserId(user.id);
    await this.notificationService.markAllAsRead(penguin.id);
    return { success: true };
  }
}
