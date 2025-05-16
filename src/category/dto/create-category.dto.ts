import { IsNotEmpty, IsString, IsOptional, IsUrl, MaxLength } from "class-validator"

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

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
  @IsString()
  parentId?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  metaTitle?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaDescription?: string
}
