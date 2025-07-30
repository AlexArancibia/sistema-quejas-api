import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from "class-validator"
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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
