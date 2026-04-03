import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Penguin } from './entities/penguin.entity';
import { PenguinMeta } from './entities/penguin-meta.entity';
import { PenguinSetting } from './entities/penguin-setting.entity';
import { CreatePenguinDto } from './dto/create-penguin.dto';
import { UpdatePenguinDto } from './dto/update-penguin.dto';
import { UpsertMetaDto } from './dto/upsert-meta.dto';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Injectable()
export class PenguinService {
  constructor(
    @InjectRepository(Penguin)
    private readonly penguinRepository: Repository<Penguin>,
    @InjectRepository(PenguinMeta)
    private readonly metaRepository: Repository<PenguinMeta>,
    @InjectRepository(PenguinSetting)
    private readonly settingRepository: Repository<PenguinSetting>,
  ) {}

  async createForUser(userId: string, dto: CreatePenguinDto = {}): Promise<Penguin> {
    const penguin = this.penguinRepository.create({
      userId,
      ...dto,
      createdBy: userId,
    });
    const saved = await this.penguinRepository.save(penguin);
    // Default settings
    await this.settingRepository.save([
      this.settingRepository.create({ penguinId: saved.id, settingKey: 'active', settingValue: 'true', createdBy: userId }),
      this.settingRepository.create({ penguinId: saved.id, settingKey: 'notifications', settingValue: 'true', createdBy: userId }),
    ]);
    return saved;
  }

  async findByUserId(userId: string): Promise<Penguin> {
    const penguin = await this.penguinRepository.findOne({
      where: { userId },
      relations: ['metas', 'settings'],
    });
    if (!penguin) throw new NotFoundException('Penguin profile not found');
    return penguin;
  }

  async findById(id: string): Promise<Penguin> {
    const penguin = await this.penguinRepository.findOne({
      where: { id },
      relations: ['metas', 'settings'],
    });
    if (!penguin) throw new NotFoundException('Penguin not found');
    return penguin;
  }

  async update(id: string, dto: UpdatePenguinDto, userId: string): Promise<Penguin> {
    const penguin = await this.findById(id);
    Object.assign(penguin, { ...dto, lastModifiedBy: userId });
    return this.penguinRepository.save(penguin);
  }

  async upsertMeta(penguinId: string, dto: UpsertMetaDto, userId: string): Promise<PenguinMeta> {
    let meta = await this.metaRepository.findOne({
      where: { penguinId, metaKey: dto.metaKey },
    });
    if (meta) {
      meta.metaValue = dto.metaValue ?? null;
      meta.lastModifiedBy = userId;
    } else {
      meta = this.metaRepository.create({
        penguinId,
        metaKey: dto.metaKey,
        metaValue: dto.metaValue,
        createdBy: userId,
      });
    }
    return this.metaRepository.save(meta);
  }

  async upsertSetting(penguinId: string, dto: UpsertSettingDto, userId: string): Promise<PenguinSetting> {
    let setting = await this.settingRepository.findOne({
      where: { penguinId, settingKey: dto.settingKey },
    });
    if (setting) {
      setting.settingValue = dto.settingValue ?? null;
      setting.lastModifiedBy = userId;
    } else {
      setting = this.settingRepository.create({
        penguinId,
        settingKey: dto.settingKey,
        settingValue: dto.settingValue,
        createdBy: userId,
      });
    }
    return this.settingRepository.save(setting);
  }

  async isActive(penguinId: string): Promise<boolean> {
    const setting = await this.settingRepository.findOne({
      where: { penguinId, settingKey: 'active' },
    });
    return setting?.settingValue === 'true';
  }
}
