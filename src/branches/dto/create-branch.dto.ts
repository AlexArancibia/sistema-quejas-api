import { IsString, IsEmail, IsOptional, IsBoolean } from "class-validator"

export class CreateBranchDto {
  @IsString()
  name: string

  @IsString()
  address: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
