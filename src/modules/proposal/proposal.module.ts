import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from './entities/proposal.entity';
import { ProposalAttachment } from './entities/proposal-attachment.entity';
import { ProposalService } from './proposal.service';
import { ProposalController } from './proposal.controller';
import { PenguinModule } from '../penguin/penguin.module';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal, ProposalAttachment]),
    PenguinModule,
    TagModule,
  ],
  controllers: [ProposalController],
  providers: [ProposalService],
  exports: [ProposalService, TypeOrmModule],
})
export class ProposalModule {}
