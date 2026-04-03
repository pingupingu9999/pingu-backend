import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { InteractionService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { ReactDto } from './dto/react.dto';

@ApiTags('interactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interactions')
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @Get()
  @ApiOperation({ summary: 'List all interaction types' })
  @ApiResponse({ status: 200, description: 'List of active interaction types' })
  findAll() {
    return this.interactionService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Create an interaction type' })
  @ApiResponse({ status: 201, description: 'Interaction type created' })
  @ApiResponse({ status: 403, description: 'Forbidden – admin only' })
  create(@Body() dto: CreateInteractionDto, @CurrentUser() user: User) {
    return this.interactionService.create(dto, user.login);
  }

  @Post('proposals/:proposalId/react')
  @ApiOperation({ summary: 'React to a proposal' })
  @ApiResponse({ status: 201, description: 'Reaction saved' })
  @ApiResponse({ status: 404, description: 'Proposal or interaction type not found' })
  react(
    @Param('proposalId') proposalId: string,
    @Body() dto: ReactDto,
    @CurrentUser() user: User,
  ) {
    return this.interactionService.react(user.id, proposalId, dto.interactionId, dto.emoji);
  }

  @Get('proposals/:proposalId')
  @ApiOperation({ summary: 'Get all interactions on a proposal' })
  @ApiResponse({ status: 200, description: 'List of reactions on the proposal' })
  findByProposal(@Param('proposalId') proposalId: string) {
    return this.interactionService.findByProposal(proposalId);
  }
}
