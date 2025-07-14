import { IsString, IsEmail, IsUUID, IsEnum, IsOptional, IsArray } from "class-validator"
import { ComplaintPriority } from "@prisma/client"

export class CreateComplaintDto {
  @IsString()
  fullName: string

  @IsEmail()
  email: string

  @IsUUID()
  branchId: string

  @IsString()
  observationType: string

  @IsString()
  detail: string

  @IsEnum(ComplaintPriority)
  priority: ComplaintPriority

  @IsOptional()
  @IsArray()
  attachments?: any[]
}
