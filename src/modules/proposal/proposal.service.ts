import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity';
import { ProposalAttachment } from './entities/proposal-attachment.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { PenguinService } from '../penguin/penguin.service';
import { TagService } from '../tag/tag.service';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    @InjectRepository(ProposalAttachment)
    private readonly attachmentRepository: Repository<ProposalAttachment>,
    private readonly penguinService: PenguinService,
    private readonly tagService: TagService,
  ) {}

  async create(userId: string, dto: CreateProposalDto): Promise<Proposal> {
    const penguin = await this.penguinService.findByUserId(userId);
    const tag = await this.tagService.findById(dto.penguinCategoryTagId);
    if (tag.penguinId !== penguin.id) throw new ForbiddenException('Tag does not belong to you');

    const proposal = this.proposalRepository.create({
      penguinCategoryTagId: dto.penguinCategoryTagId,
      name: dto.name,
      description: dto.description,
      proposalType: dto.proposalType,
      guests: dto.guests,
      radius: dto.radius,
      latitude: dto.latitude,
      longitude: dto.longitude,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      isPrivate: dto.isPrivate ?? false,
      acceptance: dto.acceptance ?? false,
      active: true,
      createdBy: userId,
    });
    return this.proposalRepository.save(proposal);
  }

  async findPublic(page = 0, size = 20): Promise<[Proposal[], number]> {
    return this.proposalRepository.findAndCount({
      where: { isPrivate: false, active: true, deletedAt: IsNull() },
      relations: ['penguinCategoryTag', 'penguinCategoryTag.categoryTag', 'attachments'],
      order: { createdDate: 'DESC' },
      skip: page * size,
      take: size,
    });
  }

  async findById(id: string): Promise<Proposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
      relations: ['penguinCategoryTag', 'penguinCategoryTag.categoryTag', 'attachments'],
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async findMyProposals(userId: string, page = 0, size = 20): Promise<[Proposal[], number]> {
    const penguin = await this.penguinService.findByUserId(userId);
    return this.proposalRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.penguinCategoryTag', 'pct')
      .leftJoinAndSelect('p.attachments', 'att')
      .where('pct.penguinId = :penguinId', { penguinId: penguin.id })
      .andWhere('p.deletedAt IS NULL')
      .orderBy('p.createdDate', 'DESC')
      .skip(page * size)
      .take(size)
      .getManyAndCount();
  }

  async findNearby(userId: string, page = 0, size = 20): Promise<[Proposal[], number]> {
    const me = await this.penguinService.findByUserId(userId);
    if (!me.latitude || !me.longitude || !me.radius) {
      throw new BadRequestException('Imposta la tua posizione e il raggio di ricerca nel profilo');
    }

    // Due raggi si intersecano se: distanza(A, B) <= raggio_A + raggio_B
    // Fallback posizione/raggio: proposal → penguinCategoryTag → penguin autore
    const [items, total] = await this.proposalRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.penguinCategoryTag', 'pct')
      .leftJoinAndSelect('pct.categoryTag', 'ct')
      .leftJoin('pct.penguin', 'author')
      .leftJoinAndSelect('p.attachments', 'att')
      .where('p.isPrivate = false')
      .andWhere('p.active = true')
      .andWhere('p.deletedAt IS NULL')
      .andWhere('author.id != :myId', { myId: me.id })
      .andWhere(
        `ST_DWithin(
          ST_MakePoint(
            COALESCE(p.longitude, pct.longitude, author.longitude),
            COALESCE(p.latitude,  pct.latitude,  author.latitude)
          )::geography,
          ST_MakePoint(:myLon, :myLat)::geography,
          (COALESCE(p.radius, pct.radius, author.radius) + :myRadius)
        )`,
        { myLon: me.longitude, myLat: me.latitude, myRadius: me.radius },
      )
      .orderBy('p.createdDate', 'DESC')
      .skip(page * size)
      .take(size)
      .getManyAndCount();

    return [items, total];
  }

  async update(id: string, dto: UpdateProposalDto, userId: string): Promise<Proposal> {
    const proposal = await this.findById(id);
    await this.assertOwner(proposal, userId);
    Object.assign(proposal, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : proposal.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : proposal.endDate,
      lastModifiedBy: userId,
    });
    return this.proposalRepository.save(proposal);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const proposal = await this.findById(id);
    await this.assertOwner(proposal, userId);
    proposal.deletedAt = new Date();
    proposal.lastModifiedBy = userId;
    await this.proposalRepository.save(proposal);
  }

  async addAttachment(proposalId: string, data: { imageUrl?: string; fileName?: string; mimeType?: string }, userId: string): Promise<ProposalAttachment> {
    const proposal = await this.findById(proposalId);
    await this.assertOwner(proposal, userId);
    const attachment = this.attachmentRepository.create({
      proposalId,
      ...data,
      createdBy: userId,
    });
    return this.attachmentRepository.save(attachment);
  }

  private async assertOwner(proposal: Proposal, userId: string): Promise<void> {
    const penguin = await this.penguinService.findByUserId(userId);
    const tag = await this.proposalRepository
      .createQueryBuilder('p')
      .leftJoin('p.penguinCategoryTag', 'pct')
      .where('p.id = :id', { id: proposal.id })
      .andWhere('pct.penguinId = :penguinId', { penguinId: penguin.id })
      .getOne();
    if (!tag) throw new ForbiddenException();
  }
}
