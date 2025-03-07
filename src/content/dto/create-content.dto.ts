import { IsString, IsOptional, IsEnum, IsBoolean, IsDate, IsUrl, IsJSON } from "class-validator"
import { Type } from "class-transformer"
import { ContentType } from "@prisma/client"
 

export class CreateContentDto {
  @IsString()
  title: string

  @IsString()
  slug: string

  @IsString()
  body: string // Changed from optional to required

  @IsEnum(ContentType)
  type: ContentType

  @IsOptional()
  @IsString()
  authorId?: string

  
  @IsOptional()
  @IsString()
  category?: string
  

  @IsOptional()
  @IsBoolean()
  published?: boolean

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishedAt?: Date

  @IsOptional()
  @IsUrl()
  featuredImage?: string

  @IsOptional()
  @IsJSON()
  metadata?: Record<string, any>
}

