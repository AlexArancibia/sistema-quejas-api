import { Module } from "@nestjs/common"
import { TeamSectionService } from "./team-section.service"
import { TeamSectionController } from "./team-section.controller"
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  controllers: [TeamSectionController],
  providers: [TeamSectionService],
  exports: [TeamSectionService],
})
export class TeamSectionModule {}
    