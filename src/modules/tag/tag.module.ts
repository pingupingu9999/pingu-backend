import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenguinCategoryTag } from './entities/penguin-category-tag.entity';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { WalletModule } from '../wallet/wallet.module';
import { PenguinModule } from '../penguin/penguin.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PenguinCategoryTag]),
    WalletModule,
    PenguinModule,
    CategoryModule,
  ],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService, TypeOrmModule],
})
export class TagModule {}
