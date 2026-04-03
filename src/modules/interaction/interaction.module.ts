import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interaction } from './entities/interaction.entity';
import { ProposalInteraction } from './entities/proposal-interaction.entity';
import { InteractionService } from './interaction.service';
import { InteractionController } from './interaction.controller';
import { PenguinModule } from '../penguin/penguin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interaction, ProposalInteraction]),
    PenguinModule,
  ],
  controllers: [InteractionController],
  providers: [InteractionService],
  exports: [InteractionService],
})
export class InteractionModule {}
