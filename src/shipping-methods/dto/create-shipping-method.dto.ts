import { IsString, IsOptional, IsBoolean, IsDecimal, IsArray, ValidateNested, IsInt, IsIn, Matches } from "class-validator"
import { Type, Transform } from "class-transformer"
import { CreateShippingMethodPriceDto } from "./create-shipping-method-price.dto"
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export class CreateShippingMethodDto {
  @IsString()
  storeId: string

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  minDeliveryDays: number

  @IsOptional()
  @IsInt()
  maxDeliveryDays: number

  @IsOptional()
  @IsString()
  estimatedDeliveryTime?: string

  @IsOptional()
  @IsArray()
  @IsIn(WEEKDAYS, { each: true })
  availableDays?: string[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'cutOffTime must be in HH:MM format'
  })
  cutOffTime?: string;

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
