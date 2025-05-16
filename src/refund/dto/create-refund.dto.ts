import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from "class-validator"
import { Type } from "class-transformer"

export class RefundLineItemDto {
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

export class CreateRefundDto {
  @IsNotEmpty()
  @IsString()
  orderId: string

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number

  @IsOptional()
  @IsString()
  note?: string

  @IsOptional()
  @IsBoolean()
  restock?: boolean = false

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RefundLineItemDto)
  lineItems: RefundLineItemDto[]
}
