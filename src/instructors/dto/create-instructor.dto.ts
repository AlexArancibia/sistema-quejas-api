import { IsString, IsEmail, IsOptional, IsUUID, IsBoolean, IsEnum } from "class-validator"
import { Discipline } from "@prisma/client"

export class CreateInstructorDto {
  @IsString()
  name: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsEnum(Discipline)
  discipline: Discipline

  @IsUUID()
  branchId: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
