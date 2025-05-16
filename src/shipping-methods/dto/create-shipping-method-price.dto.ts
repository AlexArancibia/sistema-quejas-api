import { IsNotEmpty, IsString, IsNumber, IsPositive } from "class-validator"

export class CreateShippingMethodPriceDto {
  @IsNotEmpty()
  @IsString()
  shippingMethodId: string

  @IsNotEmpty()
  @IsString()
  currencyId: string

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number
}
