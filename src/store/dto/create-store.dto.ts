import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsDate,
  IsObject,
  MaxLength,
  Matches,
} from "class-validator"
import { Type } from "class-transformer"

export class CreateStoreDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  })
  slug: string

  @IsNotEmpty()
  @IsString()
  ownerId: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true

  @IsOptional()
  @IsInt()
  @Min(0)
  maxProducts?: number

  @IsOptional()
  @IsString()
  @MaxLength(50)
  planType?: string

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  planExpiryDate?: Date

  @IsOptional()
  @IsObject()
  apiKeys?: Record<string, any>
}
