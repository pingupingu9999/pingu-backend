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

    // Geo filter — PostGIS ST_DWithin con indice GIST (radiusKm → metri)
    if (dto.lat !== undefined && dto.lon !== undefined && dto.radiusKm) {
      qb.andWhere(
        `p.location IS NOT NULL AND ST_DWithin(
          p.location,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
          :radiusM
        )`,
        { lat: dto.lat, lon: dto.lon, radiusM: dto.radiusKm * 1000 },
      );
      if (!dto.q) {
        qb.addOrderBy(
          `ST_Distance(p.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography)`,
          'ASC',
        );
      }
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

    // Geo filter — PostGIS ST_DWithin con indice GIST (radiusKm → metri)
    if (dto.lat !== undefined && dto.lon !== undefined && dto.radiusKm) {
      qb.andWhere(
        `pct.location IS NOT NULL AND ST_DWithin(
          pct.location,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
          :radiusM
        )`,
        { lat: dto.lat, lon: dto.lon, radiusM: dto.radiusKm * 1000 },
      );
      if (!dto.q) {
        qb.addOrderBy(
          `ST_Distance(pct.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography)`,
          'ASC',
        );
      }
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
