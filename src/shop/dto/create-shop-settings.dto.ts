import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsPositive,
  IsUrl,
  IsEmail,
  MaxLength,
} from "class-validator"

export class CreateShopSettingsDto {
  @IsNotEmpty()
  @IsString()
  storeId: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  domain: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shopOwner?: string

  @IsOptional()
  @IsUrl()
  logo?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  address1?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  address2?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  provinceCode?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  countryCode?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  zip?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string

  @IsNotEmpty()
  @IsString()
  defaultCurrencyId: string

  @IsOptional()
  @IsBoolean()
  multiCurrencyEnabled?: boolean = false

  @IsOptional()
  @IsString()
  shippingZones?: string

  @IsOptional()
  @IsNumber()
  @IsPositive()
  defaultShippingRate?: number

  @IsOptional()
  @IsNumber()
  @IsPositive()
  freeShippingThreshold?: number

  @IsOptional()
  @IsBoolean()
  taxesIncluded?: boolean = false

  @IsOptional()
  @IsNumber()
  @IsPositive()
  taxValue?: number

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  weightUnit?: string

  @IsOptional()
  @IsString()
  @MaxLength(7)
  primaryColor?: string

  @IsOptional()
  @IsString()
  @MaxLength(7)
  secondaryColor?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  theme?: string

  @IsOptional()
  @IsUrl()
  facebookUrl?: string

  @IsOptional()
  @IsUrl()
  instagramUrl?: string

  @IsOptional()
  @IsUrl()
  twitterUrl?: string

  @IsOptional()
  @IsUrl()
  tiktokUrl?: string

  @IsOptional()
  @IsUrl()
  youtubeUrl?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  googleAnalyticsId?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  facebookPixelId?: string

  @IsOptional()
  @IsEmail()
  supportEmail?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  supportPhone?: string

  @IsOptional()
  @IsBoolean()
  liveChatEnabled?: boolean = false

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string = "active"

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean = false

  @IsOptional()
  @IsBoolean()
  multiLanguageEnabled?: boolean = false

  @IsOptional()
  @IsBoolean()
  cookieConsentEnabled?: boolean

  @IsOptional()
  @IsBoolean()
  gdprCompliant?: boolean

  @IsOptional()
  @IsBoolean()
  ccpaCompliant?: boolean

  @IsOptional()
  @IsBoolean()
  enableWishlist?: boolean
}
