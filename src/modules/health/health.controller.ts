import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Controlla lo stato del servizio e della connessione DB' })
  @ApiResponse({ status: 200, description: 'Servizio operativo' })
  @ApiResponse({ status: 503, description: 'Servizio non disponibile' })
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
