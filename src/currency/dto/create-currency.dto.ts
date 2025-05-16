import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min, IsBoolean, MaxLength } from "class-validator"
import { CurrencyPosition } from "@prisma/client"

export class CreateCurrencyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(3)
  code: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(5)
  symbol: string

  @IsOptional()
  @IsInt()
  @Min(0)
  decimalPlaces?: number = 2

  @IsOptional()
  @IsEnum(CurrencyPosition)
  symbolPosition?: CurrencyPosition = CurrencyPosition.BEFORE

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true

  @IsOptional()
  @IsBoolean()
  autoUpdateRates?: boolean

  @IsOptional()
  @IsString()
  @MaxLength(50)
  updateFrequency?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  roundingPrecision?: number

  @IsNotEmpty()
  @IsString()
  storeId: string
}
