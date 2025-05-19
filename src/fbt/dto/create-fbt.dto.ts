 import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  IsUUID,
  ArrayMinSize,
  IsBoolean,
} from "class-validator"
import { Type } from "class-transformer"

export class CreateFrequentlyBoughtTogetherDto {
 
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  storeId: string

 
  @IsString()
  @IsNotEmpty()
  name: string

 
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  @IsUUID(undefined, { each: true })
  variantIds: string[]

 
  @IsOptional()
  @IsString()
  discountName?: string

  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount?: number

 
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
