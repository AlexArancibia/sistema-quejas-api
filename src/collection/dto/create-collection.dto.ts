import { IsNotEmpty, IsString, IsOptional, IsUrl, MaxLength, IsBoolean, IsArray } from "class-validator"

export class CreateCollectionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  slug: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsUrl()
  imageUrl?: string

  @IsNotEmpty()
  @IsString()
  storeId: string

  @IsOptional()
  @IsBoolean()
  isFeatured? = false // Corrected syntax for default value

  @IsOptional()
  @IsString()
  @MaxLength(100)
  metaTitle?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaDescription?: string

  @IsOptional()
  @IsArray()
  productIds?: string[] // Added productIds property
}
