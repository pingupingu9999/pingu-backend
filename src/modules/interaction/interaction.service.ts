import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaction } from './entities/interaction.entity';
import { ProposalInteraction } from './entities/proposal-interaction.entity';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { PenguinService } from '../penguin/penguin.service';

@Injectable()
export class InteractionService {
  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepository: Repository<Interaction>,
    @InjectRepository(ProposalInteraction)
    private readonly proposalInteractionRepository: Repository<ProposalInteraction>,
    private readonly penguinService: PenguinService,
  ) {}

  async findAll(): Promise<Interaction[]> {
    return this.interactionRepository.find({ where: { active: true } });
  }

  async findById(id: string): Promise<Interaction> {
    const interaction = await this.interactionRepository.findOne({ where: { id } });
    if (!interaction) throw new NotFoundException('Interaction not found');
    return interaction;
  }

  async create(dto: CreateInteractionDto, actor: string): Promise<Interaction> {
    const interaction = this.interactionRepository.create({ ...dto, active: true, createdBy: actor });
    return this.interactionRepository.save(interaction);
  }

  async react(userId: string, proposalId: string, interactionId: string, emoji?: string): Promise<ProposalInteraction> {
    const penguin = await this.penguinService.findByUserId(userId);
    await this.findById(interactionId);

    // Remove previous reaction from same penguin on same proposal (if any)
    await this.proposalInteractionRepository.delete({ penguinId: penguin.id, proposalId });

    const pi = this.proposalInteractionRepository.create({
      penguinId: penguin.id,
      proposalId,
      interactionId,
      emoji,
      createdBy: userId,
    });
    return this.proposalInteractionRepository.save(pi);
  }

  async findByProposal(proposalId: string): Promise<ProposalInteraction[]> {
    return this.proposalInteractionRepository.find({
      where: { proposalId },
      relations: ['interaction'],
    });
  }
}
