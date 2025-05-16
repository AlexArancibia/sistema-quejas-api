import { IsString, IsEmail, IsEnum, IsOptional, MinLength, IsDate, IsNumber, IsObject, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, AuthProvider } from '@prisma/client';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;

  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;

  @IsOptional()
  @IsString()
  authProviderId?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  tokenExpiresAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  emailVerified?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLogin?: Date;

  @IsOptional()
  @IsNumber()
  failedLoginAttempts?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lockedUntil?: Date;
}