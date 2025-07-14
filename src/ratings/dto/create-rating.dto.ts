import { IsString, IsUUID, IsInt, IsDecimal, IsOptional, Min, Max, IsEnum } from "class-validator"
import { Transform } from "class-transformer"
import { Discipline } from "@prisma/client"

export class CreateRatingDto {
  @IsUUID()
  instructorId: string

  @IsUUID()
  branchId: string

  @IsString()
  instructorName: string

  @IsEnum(Discipline)
  discipline: Discipline

  @IsString()
  schedule: string

  @IsString()
  date: string

  @IsInt()
  @Min(1)
  @Max(5)
  instructorRating: number

  @IsInt()
  @Min(1)
  @Max(5)
  cleanlinessRating: number

  @IsInt()
  @Min(1)
  @Max(5)
  audioRating: number

  @IsInt()
  @Min(1)
  @Max(5)
  attentionQualityRating: number

  @IsInt()
  @Min(1)
  @Max(5)
  amenitiesRating: number

  @IsInt()
  @Min(1)
  @Max(5)
  punctualityRating: number

  @Transform(({ value }) => Number.parseFloat(value))
  @IsDecimal({ decimal_digits: "1" })
  @Min(0)
  @Max(10)
  npsScore: number

  @IsOptional()
  @IsString()
  comments?: string
}
