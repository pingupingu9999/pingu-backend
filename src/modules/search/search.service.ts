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

    // Full-text search via PostgreSQL tsvector — uses GIN index
    if (dto.q) {
      qb.andWhere(
        `to_tsvector('italian', coalesce(p.name, '') || ' ' || coalesce(p.description, '')) @@ plainto_tsquery('italian', :q)`,
        { q: dto.q },
      ).addOrderBy(
        `ts_rank(to_tsvector('italian', coalesce(p.name, '') || ' ' || coalesce(p.description, '')), plainto_tsquery('italian', :q))`,
        'DESC',
      );
    }

    if (dto.categoryId) {
      qb.andWhere('cat.id = :categoryId', { categoryId: dto.categoryId });
    }

    if (dto.proposalType) {
      qb.andWhere('p.proposal_type = :proposalType', { proposalType: dto.proposalType });
    }

    // Geo filter — Haversine (sostituito da PostGIS in futuro)
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

    // Default ordering by date when no text query
    if (!dto.q) {
      qb.orderBy('p.created_date', 'DESC');
    }

    const [data, total] = await qb
      .skip(page * size)
      .take(size)
      .getManyAndCount();

    return { data, total };
  }

  async searchTags(dto: SearchDto): Promise<{ data: PenguinCategoryTag[]; total: number }> {
    const page = dto.page ?? 0;
    const size = dto.size ?? 20;

    const qb = this.tagRepository
      .createQueryBuilder('pct')
      .leftJoinAndSelect('pct.categoryTag', 'ct')
      .leftJoinAndSelect('ct.category', 'cat')
      .where('pct.active = TRUE')
      .andWhere('pct.deleted_at IS NULL');

    // Full-text search via PostgreSQL tsvector — uses GIN index
    if (dto.q) {
      qb.andWhere(
        `to_tsvector('italian', coalesce(pct.custom_name, '') || ' ' || coalesce(pct.description, '')) @@ plainto_tsquery('italian', :q)`,
        { q: dto.q },
      ).addOrderBy(
        `ts_rank(to_tsvector('italian', coalesce(pct.custom_name, '') || ' ' || coalesce(pct.description, '')), plainto_tsquery('italian', :q))`,
        'DESC',
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

    if (!dto.q) {
      qb.orderBy('pct.created_date', 'DESC');
    }

    const [data, total] = await qb
      .skip(page * size)
      .take(size)
      .getManyAndCount();

    return { data, total };
  }
}
