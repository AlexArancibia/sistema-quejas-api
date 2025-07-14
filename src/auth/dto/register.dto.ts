import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from "class-validator"
import { UserRole, AuthProvider } from "@prisma/client"

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  firstName: string

  @IsNotEmpty()
  @IsString()
  lastName: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  company?: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.USER

  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider = AuthProvider.EMAIL

  @IsOptional()
  @IsString()
  branchId?: string
}
