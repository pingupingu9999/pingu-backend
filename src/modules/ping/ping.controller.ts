import {
  Body,
  Controller,
  Get,
  Param,
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
import { CreatePingDto } from './dto/create-ping.dto';
import { PingService } from './ping.service';

@ApiTags('pings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pings')
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Post()
  @ApiOperation({ summary: 'Ping a proposal — avvia il ciclo di vita del ping' })
  @ApiResponse({ status: 201, description: 'Ping creato, notifica inviata al proprietario' })
  @ApiResponse({ status: 400, description: 'Limite giornaliero raggiunto, cooldown attivo, o utente non attivo' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Proposal non trovata' })
  create(@CurrentUser() user: User, @Body() dto: CreatePingDto) {
    return this.pingService.createPing(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista i miei ping (inviati e ricevuti, paginati)' })
  @ApiResponse({ status: 200, description: 'Lista paginata di ping' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMine(@CurrentUser() user: User, @Query() pagination: PaginationDto) {
    const [data, total] = await this.pingService.findMyPings(
      user.id,
      pagination.page,
      pagination.size,
    );
    return { data, meta: { page: pagination.page, size: pagination.size, total } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettaglio di un ping' })
  @ApiResponse({ status: 200, description: 'Ping trovato' })
  @ApiResponse({ status: 404, description: 'Ping non trovato' })
  findOne(@Param('id') id: string) {
    return this.pingService.findById(id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accetta un ping ricevuto (proprietario della proposal)' })
  @ApiResponse({ status: 201, description: 'Ping accettato, notifica inviata al pinger' })
  @ApiResponse({ status: 400, description: 'Il ping non è in stato PENDING' })
  @ApiResponse({ status: 403, description: 'Non sei il destinatario del ping' })
  accept(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pingService.respond(id, user.id, true);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Rifiuta un ping ricevuto (proprietario della proposal)' })
  @ApiResponse({ status: 201, description: 'Ping rifiutato, notifica inviata al pinger' })
  @ApiResponse({ status: 400, description: 'Il ping non è in stato PENDING' })
  @ApiResponse({ status: 403, description: 'Non sei il destinatario del ping' })
  reject(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pingService.respond(id, user.id, false);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Conferma il completamento del servizio — entrambe le parti devono confermare per rilasciare i pc' })
  @ApiResponse({ status: 201, description: 'Conferma registrata. Se entrambi hanno confermato: COMPLETED + pc rilasciati' })
  @ApiResponse({ status: 400, description: 'Il ping non è in uno stato confermabile' })
  @ApiResponse({ status: 403, description: 'Non sei parte di questo ping' })
  confirm(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pingService.confirm(id, user.id);
  }

  @Post(':id/dispute')
  @ApiOperation({ summary: 'Apri una disputa su questo ping' })
  @ApiResponse({ status: 201, description: 'Disputa aperta, intervento admin richiesto' })
  @ApiResponse({ status: 403, description: 'Non sei parte di questo ping' })
  dispute(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pingService.dispute(id, user.id);
  }
}
