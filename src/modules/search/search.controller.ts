import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SearchDto } from './dto/search.dto';
import { SearchService } from './search.service';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('proposals')
  @ApiOperation({
    summary: 'Cerca proposal — full-text + filtri geo/categoria/tipo',
    description:
      'Supporta ricerca testuale (q), filtro per categoria (categoryId), tipo proposta (proposalType) e raggio geografico (lat/lon/radiusKm con formula Haversine).',
  })
  @ApiResponse({ status: 200, description: 'Lista paginata di proposal corrispondenti' })
  @ApiResponse({ status: 400, description: 'Parametri di ricerca non validi' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchProposals(@Query() dto: SearchDto) {
    const { data, total } = await this.searchService.searchProposals(dto);
    return { data, meta: { page: dto.page, size: dto.size, total } };
  }

  @Get('tags')
  @ApiOperation({
    summary: 'Cerca tag utente — trova persone che offrono un servizio',
    description:
      'Supporta ricerca testuale (q), filtro per categoria (categoryId) e raggio geografico (lat/lon/radiusKm).',
  })
  @ApiResponse({ status: 200, description: 'Lista paginata di tag utente corrispondenti' })
  @ApiResponse({ status: 400, description: 'Parametri di ricerca non validi' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchTags(@Query() dto: SearchDto) {
    const { data, total } = await this.searchService.searchTags(dto);
    return { data, meta: { page: dto.page, size: dto.size, total } };
  }
}
