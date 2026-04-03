import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryTag } from './entities/category-tag.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategoryTag)
    private readonly tagRepository: Repository<CategoryTag>,
  ) {}

  async createCategory(dto: CreateCategoryDto, actor: string): Promise<Category> {
    const category = this.categoryRepository.create({ ...dto, active: dto.active ?? true, createdBy: actor });
    return this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({ where: { active: true }, relations: ['tags'] });
  }

  async findCategoryById(id: string): Promise<Category> {
    const cat = await this.categoryRepository.findOne({ where: { id }, relations: ['tags'] });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async updateCategory(id: string, dto: Partial<CreateCategoryDto>, actor: string): Promise<Category> {
    const cat = await this.findCategoryById(id);
    Object.assign(cat, { ...dto, lastModifiedBy: actor });
    return this.categoryRepository.save(cat);
  }

  async createTag(categoryId: string, dto: CreateCategoryTagDto, actor: string): Promise<CategoryTag> {
    await this.findCategoryById(categoryId);
    const tag = this.tagRepository.create({ ...dto, categoryId, active: dto.active ?? true, createdBy: actor });
    return this.tagRepository.save(tag);
  }

  async findTagsByCategory(categoryId: string): Promise<CategoryTag[]> {
    return this.tagRepository.find({ where: { categoryId, active: true } });
  }

  async findTagById(id: string): Promise<CategoryTag> {
    const tag = await this.tagRepository.findOne({ where: { id }, relations: ['category'] });
    if (!tag) throw new NotFoundException('Category tag not found');
    return tag;
  }

  async updateTag(id: string, dto: Partial<CreateCategoryTagDto>, actor: string): Promise<CategoryTag> {
    const tag = await this.findTagById(id);
    Object.assign(tag, { ...dto, lastModifiedBy: actor });
    return this.tagRepository.save(tag);
  }
}
