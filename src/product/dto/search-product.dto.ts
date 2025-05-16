import { IsOptional, IsString, IsEnum, IsArray, IsInt, Min, Max } from "class-validator"
import { ProductStatus } from "@prisma/client"
import { Type } from "class-transformer"

export class SearchProductDto {
  @IsOptional()
  @IsString()
  query?: string

  @IsOptional()
  @IsString()
  storeId?: string

  @IsOptional()
  @IsEnum(ProductStatus, { each: true })
  status?: ProductStatus[]

  @IsOptional()
  @IsString()
  vendor?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collectionIds?: string[]

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc"
}
