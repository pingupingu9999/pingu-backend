import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Penguin } from './entities/penguin.entity';
import { PenguinMeta } from './entities/penguin-meta.entity';
import { PenguinSetting } from './entities/penguin-setting.entity';
import { PenguinService } from './penguin.service';
import { PenguinController } from './penguin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Penguin, PenguinMeta, PenguinSetting])],
  controllers: [PenguinController],
  providers: [PenguinService],
  exports: [PenguinService, TypeOrmModule],
})
export class PenguinModule {}
