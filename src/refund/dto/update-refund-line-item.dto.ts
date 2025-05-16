import { PartialType } from "@nestjs/mapped-types"
import { CreateRefundLineItemDto } from "./create-refund-line-item.dto"

export class UpdateRefundLineItemDto extends PartialType(CreateRefundLineItemDto) {}
