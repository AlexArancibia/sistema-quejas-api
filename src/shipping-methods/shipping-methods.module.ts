import { Module } from "@nestjs/common"
import { ShippingMethodsService } from "./shipping-methods.service"
import { ShippingMethodController } from "./shipping-methods.controller"
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  controllers: [ShippingMethodController],
  providers: [ShippingMethodsService],
 
})
export class ShippingMethodsModule {}

