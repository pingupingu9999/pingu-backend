import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalService } from './proposal.service';

@ApiTags('proposals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('proposals')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new proposal linked to one of your tags' })
  @ApiResponse({ status: 201, description: 'Proposal created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'The tag does not belong to you' })
  create(@CurrentUser() user: User, @Body() dto: CreateProposalDto) {
    return this.proposalService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List public proposals (feed, paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated proposal feed' })
  async findAll(@Query() pagination: PaginationDto) {
    const [data, total] = await this.proposalService.findPublic(
      pagination.page,
      pagination.size,
    );
    return { data, meta: { page: pagination.page, size: pagination.size, total } };
  }

  @Get('me')
  @ApiOperation({ summary: 'List my proposals (paginated)' })
  @ApiResponse({ status: 200, description: 'My proposals' })
  async findMine(@CurrentUser() user: User, @Query() pagination: PaginationDto) {
    const [data, total] = await this.proposalService.findMyProposals(
      user.id,
      pagination.page,
      pagination.size,
    );
    return { data, meta: { page: pagination.page, size: pagination.size, total } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a proposal by id' })
  @ApiResponse({ status: 200, description: 'Proposal detail' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  findOne(@Param('id') id: string) {
    return this.proposalService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update my proposal' })
  @ApiResponse({ status: 200, description: 'Proposal updated' })
  @ApiResponse({ status: 403, description: 'Forbidden – not your proposal' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  update(@Param('id') id: string, @Body() dto: UpdateProposalDto, @CurrentUser() user: User) {
    return this.proposalService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete my proposal' })
  @ApiResponse({ status: 204, description: 'Proposal deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden – not your proposal' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.proposalService.softDelete(id, user.id);
  }
}
