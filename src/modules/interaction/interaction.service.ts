import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaction } from './entities/interaction.entity';
import { ProposalInteraction } from './entities/proposal-interaction.entity';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { PenguinService } from '../penguin/penguin.service';

const KEY_ALL = 'interactions:all';
const TTL = 3_600_000; // 1 ora

@Injectable()
export class InteractionService {
  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepository: Repository<Interaction>,
    @InjectRepository(ProposalInteraction)
    private readonly proposalInteractionRepository: Repository<ProposalInteraction>,
    private readonly penguinService: PenguinService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll(): Promise<Interaction[]> {
    const cached = await this.cache.get<Interaction[]>(KEY_ALL);
    if (cached) return cached;
    const data = await this.interactionRepository.find({ where: { active: true } });
    await this.cache.set(KEY_ALL, data, TTL);
    return data;
  }

  async findById(id: string): Promise<Interaction> {
    const interaction = await this.interactionRepository.findOne({ where: { id } });
    if (!interaction) throw new NotFoundException('Interaction not found');
    return interaction;
  }

  async create(dto: CreateInteractionDto, actor: string): Promise<Interaction> {
    const interaction = this.interactionRepository.create({ ...dto, active: true, createdBy: actor });
    const saved = await this.interactionRepository.save(interaction);
    await this.cache.del(KEY_ALL);
    return saved;
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
