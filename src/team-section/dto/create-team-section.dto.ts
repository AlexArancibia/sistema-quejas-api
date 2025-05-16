import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray, ValidateNested, IsBoolean } from "class-validator"
import { Type } from "class-transformer"

class TeamMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  position?: string

  @IsString()
  @IsOptional()
  bio?: string

  @IsString()
  @IsOptional()
  imageUrl?: string

  @IsString()
  @IsOptional()
  socialLinks?: string
}

export class CreateTeamSectionDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  subtitle?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsUUID()
  @IsNotEmpty()
  storeId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  members: TeamMemberDto[]

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsString()
  @IsOptional()
  backgroundColor?: string

  @IsString()
  @IsOptional()
  textColor?: string
}
