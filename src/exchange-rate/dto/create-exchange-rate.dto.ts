import { IsNotEmpty, IsString, IsNumber, IsPositive, IsDate } from "class-validator"
import { Type } from "class-transformer"

export class CreateExchangeRateDto {
  @IsNotEmpty()
  @IsString()
  fromCurrencyId: string

  @IsNotEmpty()
  @IsString()
  toCurrencyId: string

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  rate: number

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  effectiveDate: Date
}
