import { IsString, IsEmail, IsUUID, IsEnum, IsOptional, IsArray } from "class-validator"
import { ComplaintPriority } from "@prisma/client"

export class CreateComplaintDto {
  @IsString()
  fullName: string

  @IsEmail()
  email: string

  @IsOptional()
  @IsUUID()
  branchId?: string

  @IsOptional()
  @IsUUID()
  areaId?: string

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
