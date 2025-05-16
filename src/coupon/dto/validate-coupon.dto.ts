import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional, IsArray } from "class-validator"

export class ValidateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string

  @IsNotEmpty()
  @IsString()
  storeId: string

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  cartTotal: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collectionIds?: string[]
}
