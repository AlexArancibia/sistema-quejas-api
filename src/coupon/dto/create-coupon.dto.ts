import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  IsBoolean,
  IsDate,
  IsArray,
  ValidateIf,
} from "class-validator"
import { Type } from "class-transformer"
import { DiscountType } from "@prisma/client"

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNotEmpty()
  @IsEnum(DiscountType)
  type: DiscountType

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @ValidateIf((o) => o.type !== DiscountType.FREE_SHIPPING)
  value: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  minPurchase?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true

  @IsNotEmpty()
  @IsString()
  storeId: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableProductIds?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategoryIds?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCollectionIds?: string[]
}
