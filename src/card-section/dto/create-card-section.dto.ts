import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray, ValidateNested, IsBoolean } from "class-validator"
import { Type } from "class-transformer"

class CardItemDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  subtitle?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  imageUrl?: string

  @IsString()
  @IsOptional()
  linkUrl?: string

  @IsString()
  @IsOptional()
  buttonText?: string
}

export class CreateCardSectionDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  subtitle?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsUUID()
  @IsNotEmpty()
  storeId: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardItemDto)
  cards: CardItemDto[]
}
