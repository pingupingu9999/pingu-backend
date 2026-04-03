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
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { PenguinService } from '../penguin/penguin.service';
import { WalletService } from './wallet.service';
import { CreateBundleDto } from './dto/create-bundle.dto';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly penguinService: PenguinService,
  ) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get my pinguCoin balance' })
  @ApiResponse({ status: 200, description: 'Current balance in pc' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBalance(@CurrentUser() user: User) {
    const penguin = await this.penguinService.findByUserId(user.id);
    return { balance: await this.walletService.getBalance(penguin.id) };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List my wallet transactions (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of wallet movements' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactions(@CurrentUser() user: User, @Query() pagination: PaginationDto) {
    const penguin = await this.penguinService.findByUserId(user.id);
    const [data, total] = await this.walletService.getTransactions(
      penguin.id,
      pagination.page,
      pagination.size,
    );
    return { data, meta: { page: pagination.page, size: pagination.size, total } };
  }

  @Get('bundles')
  @ApiOperation({ summary: 'List available coin bundles' })
  @ApiResponse({ status: 200, description: 'List of purchasable pinguCoin bundles' })
  getBundles() {
    return this.walletService.findAllBundles();
  }

  @Get('bundles/:id')
  @ApiOperation({ summary: 'Get a coin bundle by id' })
  @ApiResponse({ status: 200, description: 'Coin bundle detail' })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  getBundle(@Param('id') id: string) {
    return this.walletService.findBundleById(id);
  }

  @Post('bundles')
  @UseGuards(RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Create a coin bundle' })
  @ApiResponse({ status: 201, description: 'Bundle created' })
  @ApiResponse({ status: 403, description: 'Forbidden – admin only' })
  createBundle(@Body() dto: CreateBundleDto, @CurrentUser() user: User) {
    return this.walletService.createBundle(dto, user.login);
  }
}
