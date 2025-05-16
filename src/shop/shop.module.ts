import { Module } from '@nestjs/common';
import { ShopSettingsService } from './shop.service';
import { ShopSettingsController } from './shop.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShopSettingsController],
  providers: [ShopSettingsService]
})
export class ShopModule {}

