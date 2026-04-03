import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PenguinCategoryTag } from './entities/penguin-category-tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { WalletService } from '../wallet/wallet.service';
import { IncomeTypeEnum } from '../wallet/enums/income-type.enum';
import { PenguinService } from '../penguin/penguin.service';
import { CategoryService } from '../category/category.service';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(PenguinCategoryTag)
    private readonly tagRepository: Repository<PenguinCategoryTag>,
    private readonly walletService: WalletService,
    private readonly penguinService: PenguinService,
    private readonly categoryService: CategoryService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateTagDto): Promise<PenguinCategoryTag> {
    const penguin = await this.penguinService.findByUserId(userId);
    await this.categoryService.findTagById(dto.categoryTagId); // validates existence

    const tagCost = this.configService.get<number>('TAG_COST_PC', 100);

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // Deduct 100pc
      await this.walletService.debit(
        penguin.id,
        IncomeTypeEnum.TAG_PURCHASE,
        tagCost,
        `Tag creation: ${dto.customName}`,
        undefined,
        userId,
        qr,
      );

      const tag = qr.manager.create(PenguinCategoryTag, {
        penguinId: penguin.id,
        categoryTagId: dto.categoryTagId,
        customName: dto.customName,
        description: dto.description,
        radius: dto.radius,
        latitude: dto.latitude,
        longitude: dto.longitude,
        active: dto.active ?? true,
        createdBy: userId,
      });
      const saved = await qr.manager.save(PenguinCategoryTag, tag);
      await qr.commitTransaction();
      return saved;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async findMyTags(userId: string): Promise<PenguinCategoryTag[]> {
    const penguin = await this.penguinService.findByUserId(userId);
    return this.tagRepository.find({
      where: { penguinId: penguin.id, deletedAt: IsNull() },
      relations: ['categoryTag', 'categoryTag.category'],
      order: { createdDate: 'DESC' },
    });
  }

  async findById(id: string): Promise<PenguinCategoryTag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['categoryTag', 'categoryTag.category'],
    });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: string, dto: UpdateTagDto, userId: string): Promise<PenguinCategoryTag> {
    const tag = await this.findById(id);
    const penguin = await this.penguinService.findByUserId(userId);
    if (tag.penguinId !== penguin.id) throw new ForbiddenException();
    Object.assign(tag, { ...dto, lastModifiedBy: userId });
    return this.tagRepository.save(tag);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const tag = await this.findById(id);
    const penguin = await this.penguinService.findByUserId(userId);
    if (tag.penguinId !== penguin.id) throw new ForbiddenException();
    tag.deletedAt = new Date();
    tag.lastModifiedBy = userId;
    await this.tagRepository.save(tag);
  }

  async findPublicByPenguin(penguinId: string): Promise<PenguinCategoryTag[]> {
    return this.tagRepository.find({
      where: { penguinId, active: true, deletedAt: IsNull() },
      relations: ['categoryTag', 'categoryTag.category'],
    });
  }
}
