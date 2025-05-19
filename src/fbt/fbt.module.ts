import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { FrequentlyBoughtTogetherService } from "./fbt.service"
import { FrequentlyBoughtTogetherController } from "./fbt.controller"

@Module({
  imports: [PrismaModule],
  controllers: [FrequentlyBoughtTogetherController],
  providers: [FrequentlyBoughtTogetherService],
  exports: [FrequentlyBoughtTogetherService],
})
export class FrequentlyBoughtTogetherModule {}
