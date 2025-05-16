import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional } from "class-validator"

export class CreateVariantPriceDto {
  @IsNotEmpty()
  @IsString()
  variantId: string

  @IsNotEmpty()
  @IsString()
  currencyId: string

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  originalPrice?: number
}
