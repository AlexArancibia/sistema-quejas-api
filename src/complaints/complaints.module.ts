import { Module } from "@nestjs/common"
import { ComplaintsService } from "./complaints.service"
import { ComplaintsController } from "./complaints.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { EmailModule } from "../email/email.module"

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
