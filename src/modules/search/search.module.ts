import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from '../proposal/entities/proposal.entity';
import { PenguinCategoryTag } from '../tag/entities/penguin-category-tag.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, PenguinCategoryTag])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
