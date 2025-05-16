import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsNumber,
  IsPositive,
  IsUrl,
  MaxLength,
} from "class-validator"
import { PaymentProviderType } from "@prisma/client"

export class CreatePaymentProviderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @IsNotEmpty()
  @IsEnum(PaymentProviderType)
  type: PaymentProviderType

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true

  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minimumAmount?: number

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maximumAmount?: number

  @IsOptional()
  @IsBoolean()
  testMode?: boolean

  @IsOptional()
  @IsUrl()
  imgUrl?: string

  @IsNotEmpty()
  @IsString()
  storeId: string

  @IsNotEmpty()
  @IsString()
  currencyId: string
}
