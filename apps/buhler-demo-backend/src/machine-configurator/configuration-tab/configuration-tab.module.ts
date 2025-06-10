import { Module } from '@nestjs/common';
import { ConfigurationTabController } from './configuration-tab.controller';
import { ConfigurationTabService } from './configuration-tab.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConfigurationTabController],
  providers: [ConfigurationTabService],
  exports: [ConfigurationTabService],
})
export class ConfigurationTabModule {}