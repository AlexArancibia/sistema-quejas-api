import { PartialType } from "@nestjs/mapped-types"
import { CreateCardSectionDto } from "./create-card-section.dto"

export class UpdateCardSectionDto extends PartialType(CreateCardSectionDto) {}
