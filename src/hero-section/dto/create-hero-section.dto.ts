import { IsString, IsOptional, IsBoolean, IsDate, IsUrl, IsJSON } from "class-validator"
import { Type } from "class-transformer"

export class CreateHeroSectionDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  subtitle?: string

  @IsOptional()
  @IsUrl()
  backgroundImage?: string

  @IsOptional()
  @IsUrl()
  mobileBackgroundImage?: string

  @IsOptional()
  @IsUrl()
  backgroundVideo?: string

  @IsOptional()
  @IsUrl()
  mobileBackgroundVideo?: string

  @IsOptional()
  @IsString()
  buttonText?: string

  @IsOptional()
  @IsString()
  buttonLink?: string

  @IsOptional()
  @IsJSON()
  styles?: Record<string, any>

  @IsOptional()
  @IsJSON()
  metadata?: Record<string, any>

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date
}

