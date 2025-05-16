import { PartialType } from "@nestjs/mapped-types"
import { CreateVariantPriceDto } from "./create-variant-price.dto"

export class UpdateVariantPriceDto extends PartialType(CreateVariantPriceDto) {}
