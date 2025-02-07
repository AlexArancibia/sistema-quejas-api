import { IsString, IsOptional, IsBoolean, ValidateNested, IsArray, IsNumber } from "class-validator"
import { Type } from "class-transformer"

class CreateShippingMethodPriceDto {
  @IsString()
  currencyId: string

  @IsNumber()
  price: number
}

export class CreateShippingMethodDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @ValidateNested({ each: true })
  @Type(() => CreateShippingMethodPriceDto)
  @IsArray()
  prices: CreateShippingMethodPriceDto[]

  @IsOptional()
  @IsString()
  estimatedDeliveryTime?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

