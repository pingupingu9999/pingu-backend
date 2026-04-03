import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryTag } from './entities/category-tag.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';

const KEY_ALL = 'cat:all';
const keyTags = (categoryId: string) => `cat:tags:${categoryId}`;
const TTL = 3_600_000; // 1 ora

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategoryTag)
    private readonly tagRepository: Repository<CategoryTag>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async createCategory(dto: CreateCategoryDto, actor: string): Promise<Category> {
    const category = this.categoryRepository.create({ ...dto, active: dto.active ?? true, createdBy: actor });
    const saved = await this.categoryRepository.save(category);
    await this.cache.del(KEY_ALL);
    return saved;
  }

  async findAllCategories(): Promise<Category[]> {
    const cached = await this.cache.get<Category[]>(KEY_ALL);
    if (cached) return cached;
    const data = await this.categoryRepository.find({ where: { active: true }, relations: ['tags'] });
    await this.cache.set(KEY_ALL, data, TTL);
    return data;
  }

  async findCategoryById(id: string): Promise<Category> {
    const cat = await this.categoryRepository.findOne({ where: { id }, relations: ['tags'] });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async updateCategory(id: string, dto: Partial<CreateCategoryDto>, actor: string): Promise<Category> {
    const cat = await this.findCategoryById(id);
    Object.assign(cat, { ...dto, lastModifiedBy: actor });
    const saved = await this.categoryRepository.save(cat);
    await this.cache.del(KEY_ALL);
    return saved;
  }

  async createTag(categoryId: string, dto: CreateCategoryTagDto, actor: string): Promise<CategoryTag> {
    await this.findCategoryById(categoryId);
    const tag = this.tagRepository.create({ ...dto, categoryId, active: dto.active ?? true, createdBy: actor });
    const saved = await this.tagRepository.save(tag);
    await Promise.all([this.cache.del(KEY_ALL), this.cache.del(keyTags(categoryId))]);
    return saved;
  }

  async findTagsByCategory(categoryId: string): Promise<CategoryTag[]> {
    const key = keyTags(categoryId);
    const cached = await this.cache.get<CategoryTag[]>(key);
    if (cached) return cached;
    const data = await this.tagRepository.find({ where: { categoryId, active: true } });
    await this.cache.set(key, data, TTL);
    return data;
  }

  async findTagById(id: string): Promise<CategoryTag> {
    const tag = await this.tagRepository.findOne({ where: { id }, relations: ['category'] });
    if (!tag) throw new NotFoundException('Category tag not found');
    return tag;
  }

  async updateTag(id: string, dto: Partial<CreateCategoryTagDto>, actor: string): Promise<CategoryTag> {
    const tag = await this.findTagById(id);
    Object.assign(tag, { ...dto, lastModifiedBy: actor });
    const saved = await this.tagRepository.save(tag);
    await Promise.all([this.cache.del(KEY_ALL), this.cache.del(keyTags(tag.categoryId))]);
    return saved;
  }
}
