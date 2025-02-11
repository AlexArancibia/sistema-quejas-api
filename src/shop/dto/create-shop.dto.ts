import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsBoolean, 
  IsUUID, 
  IsDecimal, 
  IsUrl 
} from 'class-validator';

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
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

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
  @IsBoolean()
  multiCurrencyEnabled?: boolean;

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
  @IsDecimal()
  taxValue?: number;

  @IsOptional()
  @IsString()
  shippingZones?: string;

  @IsOptional()
  @IsDecimal()
  defaultShippingRate?: number;

  @IsOptional()
  @IsDecimal()
  freeShippingThreshold?: number;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @IsOptional()
  @IsUrl()
  twitterUrl?: string;

  @IsOptional()
  @IsUrl()
  tiktokUrl?: string;

  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  facebookPixelId?: string;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  supportPhone?: string;

  @IsOptional()
  @IsBoolean()
  liveChatEnabled?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsBoolean()
  multiLanguageEnabled?: boolean;
}
