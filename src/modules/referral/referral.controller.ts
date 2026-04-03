import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { ApplyReferralDto } from './dto/apply-referral.dto';
import { ReferralService } from './referral.service';

@ApiTags('referral')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('my-code')
  @ApiOperation({ summary: 'Genera il mio codice referral (formato PINGU-XXXXXX-YYYY)' })
  @ApiResponse({ status: 200, description: 'Codice referral generato' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  generateCode(@CurrentUser() user: User) {
    return this.referralService.generateCode(user.id);
  }

  @Post('apply')
  @ApiOperation({
    summary: 'Applica un codice referral (programma early adopter, primi 1000 utenti)',
    description: 'Se il codice è valido e siamo entro il limite early adopter, il referrer riceve +10pc.',
  })
  @ApiResponse({ status: 201, description: 'Codice applicato con successo' })
  @ApiResponse({ status: 400, description: 'Codice non valido, già usato, o autoreferal' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  applyCode(@CurrentUser() user: User, @Body() dto: ApplyReferralDto) {
    return this.referralService.applyCode(user.id, dto.code);
  }

  @Get('my-referrals')
  @ApiOperation({ summary: 'Lista le persone che ho referito' })
  @ApiResponse({ status: 200, description: 'Lista referral effettuati' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyReferrals(@CurrentUser() user: User) {
    return this.referralService.getMyReferrals(user.id);
  }
}
