import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from '../proposal/entities/proposal.entity';
import { PenguinCategoryTag } from '../tag/entities/penguin-category-tag.entity';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    @InjectRepository(PenguinCategoryTag)
    private readonly tagRepository: Repository<PenguinCategoryTag>,
  ) {}

  /**
   * Search proposals with optional full-text, category filter, type filter,
   * and Haversine geo-distance filter.
   */
  async searchProposals(dto: SearchDto): Promise<{ data: Proposal[]; total: number }> {
    const page = dto.page ?? 0;
    const size = dto.size ?? 20;

    const qb = this.proposalRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.penguinCategoryTag', 'pct')
      .leftJoinAndSelect('pct.categoryTag', 'ct')
      .leftJoinAndSelect('ct.category', 'cat')
      .leftJoinAndSelect('p.attachments', 'att')
      .where('p.is_private = FALSE')
      .andWhere('p.active = TRUE')
      .andWhere('p.deleted_at IS NULL');

    // Full-text search on proposal name, description and tag custom_name
    if (dto.q) {
      const term = `%${dto.q.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(p.name) LIKE :term OR LOWER(p.description) LIKE :term OR LOWER(pct.custom_name) LIKE :term OR LOWER(pct.description) LIKE :term)',
        { term },
      );
    }

    // Category filter
    if (dto.categoryId) {
      qb.andWhere('cat.id = :categoryId', { categoryId: dto.categoryId });
    }

    // Proposal type filter
    if (dto.proposalType) {
      qb.andWhere('p.proposal_type = :proposalType', { proposalType: dto.proposalType });
    }

    // Geo filter (Haversine formula — works without PostGIS)
    if (dto.lat !== undefined && dto.lon !== undefined && dto.radiusKm) {
      qb.andWhere(
        `(
          p.latitude IS NOT NULL AND p.longitude IS NOT NULL AND
          (
            6371 * ACOS(
              COS(RADIANS(:lat)) * COS(RADIANS(CAST(p.latitude AS DOUBLE PRECISION)))
              * COS(RADIANS(CAST(p.longitude AS DOUBLE PRECISION)) - RADIANS(:lon))
              + SIN(RADIANS(:lat)) * SIN(RADIANS(CAST(p.latitude AS DOUBLE PRECISION)))
            )
          ) <= :radiusKm
        )`,
        { lat: dto.lat, lon: dto.lon, radiusKm: dto.radiusKm },
      );
    }

    const [data, total] = await qb
      .orderBy('p.created_date', 'DESC')
      .skip(page * size)
      .take(size)
      .getManyAndCount();

    return { data, total };
  }

  /**
   * Search user tags (PenguinCategoryTag) — find people who offer a service.
   */
  async searchTags(dto: SearchDto): Promise<{ data: PenguinCategoryTag[]; total: number }> {
    const page = dto.page ?? 0;
    const size = dto.size ?? 20;

    const qb = this.tagRepository
      .createQueryBuilder('pct')
      .leftJoinAndSelect('pct.categoryTag', 'ct')
      .leftJoinAndSelect('ct.category', 'cat')
      .where('pct.active = TRUE')
      .andWhere('pct.deleted_at IS NULL');

    if (dto.q) {
      const term = `%${dto.q.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(pct.custom_name) LIKE :term OR LOWER(pct.description) LIKE :term OR LOWER(ct.name) LIKE :term)',
        { term },
      );
    }

    if (dto.categoryId) {
      qb.andWhere('cat.id = :categoryId', { categoryId: dto.categoryId });
    }

    if (dto.lat !== undefined && dto.lon !== undefined && dto.radiusKm) {
      qb.andWhere(
        `(
          pct.latitude IS NOT NULL AND pct.longitude IS NOT NULL AND
          (
            6371 * ACOS(
              COS(RADIANS(:lat)) * COS(RADIANS(CAST(pct.latitude AS DOUBLE PRECISION)))
              * COS(RADIANS(CAST(pct.longitude AS DOUBLE PRECISION)) - RADIANS(:lon))
              + SIN(RADIANS(:lat)) * SIN(RADIANS(CAST(pct.latitude AS DOUBLE PRECISION)))
            )
          ) <= :radiusKm
        )`,
        { lat: dto.lat, lon: dto.lon, radiusKm: dto.radiusKm },
      );
    }

    const [data, total] = await qb
      .orderBy('pct.created_date', 'DESC')
      .skip(page * size)
      .take(size)
      .getManyAndCount();

    return { data, total };
  }
}
