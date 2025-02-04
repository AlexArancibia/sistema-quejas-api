import { IsString, IsNumber, IsOptional, IsUUID, IsJSON } from "class-validator"
import { Type } from "class-transformer"
import { PaymentStatus } from "@prisma/client"

export class CreatePaymentTransactionDto {
  @IsUUID()
  orderId: string

  @IsUUID()
  paymentProviderId: string

  @IsNumber()
  @Type(() => Number)
  amount: number

  @IsUUID()
  currencyId: string

  @IsString()
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
  @IsJSON()
  metadata?: Record<string, any>
}

