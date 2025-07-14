import { IsString, IsEmail, IsOptional, IsEnum } from "class-validator"
import { AuthProvider } from "@prisma/client"

export class OAuthLoginDto {
  @IsEmail()
  email: string

  @IsString()
  providerAccountId: string

  @IsEnum(AuthProvider)
  provider: AuthProvider

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsString()
  image?: string

  @IsOptional()
  @IsString()
  accessToken?: string

  @IsOptional()
  @IsString()
  refreshToken?: string

  @IsOptional()
  expiresAt?: number
}
