import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUUID,
  Min,
  IsJSON,
  IsBoolean,
} from "class-validator"
import { Type } from "class-transformer"
import { ProductStatus } from "@prisma/client"

export class CreatePriceDto {
  @IsUUID()
  currencyId: string

  @IsNumber()
  @Min(0)
  price: number
}

export class CreateProductVariantDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  sku?: string

  @IsOptional()
  @IsString()
  isActive?: boolean

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsNumber()
  @Min(0)
  inventoryQuantity: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightValue?: number

 

  @ValidateNested({ each: true })
  @Type(() => CreatePriceDto)
  prices: CreatePriceDto[]

 
  @IsJSON()
  attributes: Record<string, any>

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number

  @IsNumber()
  @Min(1)
  position: number
}

export class CreateProductDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  slug: string

  @IsOptional()
  @IsString()
  vendor?: string

  @IsEnum(ProductStatus)
  status: ProductStatus

  @IsArray()
  @IsString({ each: true })
  categoryIds: string[]

  @IsArray()
  @IsString({ each: true })
  imageUrls: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collectionIds?: string[]

  @IsOptional()
  @IsString()
  sku?: string

  @IsNumber()
  @Min(0)
  inventoryQuantity: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightValue?: number

  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[]

  @IsBoolean()
  allowBackorder: boolean

  @IsOptional()
  @IsString()
  metaTitle?: string

  @IsOptional()
  @IsString()
  metaDescription?: string


  @IsJSON()
  fbt: Record<string, any>
}

