import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsPositive, IsObject } from "class-validator"
import { PaymentStatus } from "@prisma/client"

export class CreatePaymentTransactionDto {
  @IsNotEmpty()
  @IsString()
  orderId: string

  @IsNotEmpty()
  @IsString()
  paymentProviderId: string

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number

  @IsNotEmpty()
  @IsString()
  currencyId: string

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus

  @IsOptional()
  @IsString()
  transactionId?: string

  @IsOptional()
  @IsString()
  paymentMethod?: string

  @IsOptional()
  @IsString()
  errorMessage?: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}
