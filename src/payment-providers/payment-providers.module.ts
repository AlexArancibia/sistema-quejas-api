import { Module } from '@nestjs/common';
import { PaymentProviderService } from './payment-providers.service';
import { PaymentProviderController } from './payment-providers.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentProviderController],
  providers: [PaymentProviderService],
})
export class PaymentProvidersModule {}
