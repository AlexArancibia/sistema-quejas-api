import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsPositive,
  IsObject,
  IsArray,
  IsDate,
  IsUrl,
  ValidateNested,
  ArrayMinSize,
} from "class-validator"
import { Type } from "class-transformer"
import { OrderFinancialStatus, OrderFulfillmentStatus, PaymentStatus, ShippingStatus } from "@prisma/client"

export class OrderItemDto {
  @IsOptional()
  @IsString()
  variantId?: string

  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number

  @IsOptional()
  @IsNumber()
  totalDiscount?: number = 0
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  storeId: string

  @IsNotEmpty()
  @IsNumber()
  orderNumber: number

  @IsNotEmpty()
  @IsObject()
  customerInfo: Record<string, any>

  @IsOptional()
  @IsEnum(OrderFinancialStatus)
  financialStatus?: OrderFinancialStatus

  @IsOptional()
  @IsEnum(OrderFulfillmentStatus)
  fulfillmentStatus?: OrderFulfillmentStatus

  @IsNotEmpty()
  @IsString()
  currencyId: string

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  totalPrice: number

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  subtotalPrice: number

  @IsNotEmpty()
  @IsNumber()
  totalTax: number

  @IsNotEmpty()
  @IsNumber()
  totalDiscounts: number

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  lineItems: OrderItemDto[]

  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, any>

  @IsOptional()
  @IsObject()
  billingAddress?: Record<string, any>

  @IsOptional()
  @IsString()
  couponId?: string

  @IsOptional()
  @IsString()
  paymentProviderId?: string

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus

  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>

  @IsOptional()
  @IsString()
  shippingMethodId?: string

  @IsOptional()
  @IsEnum(ShippingStatus)
  shippingStatus?: ShippingStatus = ShippingStatus.PENDING

  @IsOptional()
  @IsString()
  trackingNumber?: string

  @IsOptional()
  @IsUrl()
  trackingUrl?: string

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  estimatedDeliveryDate?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  shippedAt?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deliveredAt?: Date

  @IsOptional()
  @IsString()
  customerNotes?: string

  @IsOptional()
  @IsString()
  internalNotes?: string

  @IsOptional()
  @IsString()
  source?: string

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  preferredDeliveryDate?: Date
}
