import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsUrl,
  MaxLength,
  IsDate,
  Matches,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  IsUUID,
} from "class-validator"
import { ProductStatus } from "@prisma/client"
import { Type } from "class-transformer"
import { CreateProductVariantDto } from "./create-product-variant.dto";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsBoolean()
  @IsOptional()
  allowBackorder?: boolean = false;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  releaseDate?: Date;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.ACTIVE;

  @IsNumber()
  @IsOptional()
  restockThreshold?: number;

  @IsBoolean()
  @IsOptional()
  restockNotify?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  collectionIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls: string[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @ArrayMinSize(1)
  variants: CreateProductVariantDto[];

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsNotEmpty()
  storeId: string;
}