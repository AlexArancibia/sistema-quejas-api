import { IsString, IsOptional, IsBoolean, IsDecimal, IsArray, ValidateNested } from "class-validator"
import { Type, Transform } from "class-transformer"
import { CreateShippingMethodPriceDto } from "./create-shipping-method-price.dto"

export class CreateShippingMethodDto {
  @IsString()
  storeId: string

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  estimatedDeliveryTime?: string

  @IsOptional()
  @IsDecimal()
  @Transform(({ value }) => Number.parseFloat(value))
  maxWeight?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShippingMethodPriceDto)
  prices: CreateShippingMethodPriceDto[]
}
