import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional, IsBoolean } from "class-validator"

export class CreateRefundLineItemDto {
  @IsNotEmpty()
  @IsString()
  refundId: string

  @IsNotEmpty()
  @IsString()
  orderItemId: string

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number

  @IsOptional()
  @IsBoolean()
  restocked?: boolean = false
}
