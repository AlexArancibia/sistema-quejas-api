import { PartialType } from "@nestjs/mapped-types"
import { CreateOrderDto } from "./create-order.dto"
import { IsArray, IsOptional, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { OrderItemDto } from "./create-order.dto"

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  addLineItems?: OrderItemDto[]

  @IsOptional()
  @IsArray()
  removeLineItemIds?: string[]
}
