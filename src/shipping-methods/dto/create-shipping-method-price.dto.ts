import { IsString, IsDecimal, IsOptional, IsArray, IsBoolean, IsInt, Min } from "class-validator"
import { Transform } from "class-transformer"

export class CreateShippingMethodPriceDto {
  @IsString()
  currencyId: string

  @IsDecimal()
  @Transform(({ value }) => Number.parseFloat(value))
  price: number

  // Zone information
  @IsOptional()
  @IsString()
  zoneName?: string

  @IsOptional()
  @IsString()
  zoneDescription?: string

  // Geographic references using ISO codes
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countryCodes?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stateCodes?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cityNames?: string[]

  // Postal codes
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  postalCodes?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  postalCodePatterns?: string[]

  // Advanced configuration

  @IsOptional()
  @IsDecimal()
  @Transform(({ value }) => Number.parseFloat(value))
  freeShippingThreshold?: number


  @IsOptional()
  @IsString()
  freeShippingMessage?: string


  @IsOptional()
  @IsDecimal()
  @Transform(({ value }) => Number.parseFloat(value))
  pricePerKg?: number

  @IsOptional()
  @IsDecimal()
  @Transform(({ value }) => Number.parseFloat(value))
  freeWeightLimit?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  zonePriority?: number

  @IsOptional()
  @IsBoolean()
  isZoneActive?: boolean
}
