import { Module } from "@nestjs/common"
import { CardSectionService } from "./card-section.service"
import { CardSectionController } from "./card-section.controller"
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  controllers: [CardSectionController],
  providers: [CardSectionService],
  exports: [CardSectionService],
})
export class CardSectionModule {}
