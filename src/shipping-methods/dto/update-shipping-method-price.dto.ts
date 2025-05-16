import { PartialType } from "@nestjs/mapped-types"
import { CreateShippingMethodPriceDto } from "./create-shipping-method-price.dto"

export class UpdateShippingMethodPriceDto extends PartialType(CreateShippingMethodPriceDto) {}
