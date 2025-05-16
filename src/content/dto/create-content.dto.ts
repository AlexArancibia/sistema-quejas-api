import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  IsBoolean,
  IsEnum,
  IsDate,
  IsObject,
} from "class-validator"
import { ContentType } from "@prisma/client"
import { Type } from "class-transformer"

export class CreateContentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  slug: string

  @IsOptional()
  @IsString()
  body?: string

  @IsNotEmpty()
  @IsEnum(ContentType)
  type: ContentType

  @IsNotEmpty()
  @IsString()
  storeId: string

  @IsOptional()
  @IsString()
  authorId?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string

  @IsOptional()
  @IsBoolean()
  published?: boolean = false

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishedAt?: Date

  @IsOptional()
  @IsUrl()
  featuredImage?: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}
