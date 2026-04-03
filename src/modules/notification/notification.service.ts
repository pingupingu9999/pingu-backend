import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationTypeEnum } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    penguinId: string,
    type: NotificationTypeEnum,
    title: string,
    body?: string,
    data?: Record<string, unknown>,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      penguinId,
      type,
      title,
      body,
      data,
      isRead: false,
      createdBy: 'system',
    });
    return this.notificationRepository.save(notification);
  }

  async findMyNotifications(
    penguinId: string,
    page = 0,
    size = 20,
  ): Promise<[Notification[], number]> {
    return this.notificationRepository.findAndCount({
      where: { penguinId },
      order: { createdDate: 'DESC' },
      skip: page * size,
      take: size,
    });
  }

  async countUnread(penguinId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { penguinId, isRead: false },
    });
  }

  async markAsRead(id: string, penguinId: string): Promise<void> {
    await this.notificationRepository.update(
      { id, penguinId },
      { isRead: true, lastModifiedBy: 'system' },
    );
  }

  async markAllAsRead(penguinId: string): Promise<void> {
    await this.notificationRepository.update(
      { penguinId, isRead: false },
      { isRead: true, lastModifiedBy: 'system' },
    );
  }
}
