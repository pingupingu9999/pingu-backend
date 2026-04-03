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
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'List all active categories with their tags' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAll() {
    return this.categoryService.findAllCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  @ApiResponse({ status: 200, description: 'Category with tags' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findCategoryById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 403, description: 'Forbidden – admin only' })
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: User) {
    return this.categoryService.createCategory(dto, user.login);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Update a category' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden – admin only' })
  update(@Param('id') id: string, @Body() dto: CreateCategoryDto, @CurrentUser() user: User) {
    return this.categoryService.updateCategory(id, dto, user.login);
  }

  @Get(':id/tags')
  @ApiOperation({ summary: 'List all tags for a category' })
  @ApiResponse({ status: 200, description: 'List of tags in the category' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findTags(@Param('id') id: string) {
    return this.categoryService.findTagsByCategory(id);
  }

  @Post(':id/tags')
  @UseGuards(RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Create a tag inside a category' })
  @ApiResponse({ status: 201, description: 'Category tag created' })
  @ApiResponse({ status: 403, description: 'Forbidden – admin only' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  createTag(
    @Param('id') categoryId: string,
    @Body() dto: CreateCategoryTagDto,
    @CurrentUser() user: User,
  ) {
    return this.categoryService.createTag(categoryId, dto, user.login);
  }

  @Patch('tags/:tagId')
  @UseGuards(RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Update a category tag' })
  @ApiResponse({ status: 200, description: 'Tag updated' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 403, description: 'Forbidden – admin only' })
  updateTag(
    @Param('tagId') tagId: string,
    @Body() dto: CreateCategoryTagDto,
    @CurrentUser() user: User,
  ) {
    return this.categoryService.updateTag(tagId, dto, user.login);
  }
}
