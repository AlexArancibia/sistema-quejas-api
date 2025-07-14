import { PartialType } from "@nestjs/mapped-types"
import { CreateComplaintDto } from "./create-complaint.dto"
import { IsEnum, IsOptional, IsString, IsArray } from "class-validator"
import { ComplaintStatus } from "@prisma/client"

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus

  @IsOptional()
  @IsString()
  resolution?: string

  @IsOptional()
  @IsString()
  managerComments?: string

  @IsOptional()
  @IsArray()
  resolutionAttachments?: any[]
}
