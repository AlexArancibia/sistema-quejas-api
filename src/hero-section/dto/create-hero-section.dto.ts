import { IsNotEmpty, IsString, IsOptional, IsUrl, IsBoolean, IsObject, MaxLength } from "class-validator"

export class CreateHeroSectionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
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
  @MaxLength(50)
  buttonText?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  buttonLink?: string

  @IsOptional()
  @IsObject()
  styles?: Record<string, any>

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true

  @IsNotEmpty()
  @IsString()
  storeId: string
}
