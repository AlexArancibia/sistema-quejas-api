import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  Min,
  IsUrl,
  IsObject,
  MaxLength,
  IsArray,
  ValidateNested,
} from "class-validator"
import { CreateVariantPriceDto } from "./create-variant-price.dto";

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  sku: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls: string[] = [];

  @IsNumber()
  @IsOptional()
  inventoryQuantity: number;

  @IsNumber()
  @IsOptional()
  weightValue: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  position?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantPriceDto)
  prices: CreateVariantPriceDto[];

  @IsObject()
  @IsOptional()
  attributes: Record<string, string>;
}