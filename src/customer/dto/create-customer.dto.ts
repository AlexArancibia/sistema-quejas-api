import { IsString, IsEmail, IsOptional, IsBoolean, ValidateNested, IsArray, IsJSON } from 'class-validator';
import { Type } from 'class-transformer';

class CreateAddressDto {
  @IsString()
  firstName: string

  @IsString()
  lastName: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @IsOptional()
  @IsString()
  company?: string

  @IsString()
  address1: string

  @IsOptional()
  @IsString()
  address2?: string

  @IsString()
  city: string

  @IsOptional()
  @IsString()
  province?: string

  @IsString()
  zip: string

  @IsString()
  country: string

  @IsOptional()
  @IsString()
  phone?: string
}

export class CreateCustomerDto {
  @IsOptional()
  @IsEmail()
  email: string
  
  @IsOptional()
  @IsString()
  password: string

  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsBoolean()
  acceptsMarketing?: boolean

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses?: CreateAddressDto[]

  @IsJSON()
  extrainfo: Record<string, any>
}
