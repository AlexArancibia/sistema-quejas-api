import { IsString, IsOptional, IsEmail, IsBoolean, IsUUID } from 'class-validator';

export class CreateShopDto {
  @IsString()
  name: string;

  @IsString()
  domain: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  shopOwner?: string;

  @IsOptional()
  @IsString()
  address1?: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  provinceCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsUUID()
  defaultCurrencyId: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  weightUnit?: string;

  @IsOptional()
  @IsBoolean()
  taxesIncluded?: boolean;

  @IsOptional()
  taxValue: number;
}

