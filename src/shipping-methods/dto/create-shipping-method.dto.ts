import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingMethodPriceDto {
  @IsString()
  @IsNotEmpty()
  currencyId: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  estimatedDeliveryTime?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingMethodPriceDto)
  prices: ShippingMethodPriceDto[];
}