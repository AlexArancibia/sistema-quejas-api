import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import  { JwtService } from "@nestjs/jwt"
import  { CreateAuthDto } from "./dto/create-auth.dto"
import  { UpdateAuthDto } from "./dto/update-auth.dto"
import  { LoginAuthDto } from "./dto/login-auth.dto"
import  { RegisterDto } from "./dto/register.dto"
import  { VerifyEmailDto } from "./dto/verify-email.dto"
import  { ForgotPasswordDto } from "./dto/forgot-password.dto"
import  { ResetPasswordDto } from "./dto/reset-password.dto"
import  { OAuthLoginDto } from "./dto/oauth-login.dto"
import * as bcrypt from "bcryptjs"
import  { ConfigService } from "@nestjs/config"
import * as crypto from "crypto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Método para crear usuario SIN confirmación de email (para admins)
  async create(createUserDto: CreateAuthDto) {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      })

      if (existingUser) {
        throw new ConflictException("Email already exists")
      }

      // Extraer branchId del DTO (si existe)
      const { branchId, ...userData } = createUserDto

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      console.log(
        `DEBUG: Creating user with email ${userData.email}${branchId ? ` and connecting to branch ${branchId}` : ""}`,
      )

      // Preparar los datos base del usuario
      const createData: any = {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role || "MANAGER",
        phone: userData.phone,
        authProvider: userData.authProvider || "EMAIL",
        emailVerified: new Date(), // Usuario creado por admin está verificado automáticamente
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Si se proporciona branchId, conectar el usuario a la sucursal
      if (branchId) {
        // Verificar primero si la sucursal existe
        const branchExists = await this.prisma.branch.findUnique({
          where: { id: branchId },
        })

        if (!branchExists) {
          throw new NotFoundException(`Branch with ID ${branchId} not found`)
        }

        // Añadir la relación con la sucursal
        createData.branches = {
          connect: {
            id: branchId,
          },
        }
      }

      // Crear el usuario con o sin la relación con la sucursal
      const user = await this.prisma.user.create({
        data: createData,
        include: {
          branches: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Eliminar la contraseña del resultado
      const { password, ...result } = user
      return {
        ...result,
        message: "User created successfully and verified automatically.",
      }
    } catch (error) {
      console.error("ERROR creating user:", error)
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error
      }
      throw new InternalServerErrorException("Error creating user: " + error.message)
    }
  }

  // Método para registro CON confirmación de email (para usuarios públicos)
  async register(registerDto: RegisterDto) {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      })

      if (existingUser) {
        throw new ConflictException("Email already exists")
      }

      // Extraer branchId del DTO (si existe)
      const { branchId, ...userData } = registerDto

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      console.log(
        `DEBUG: Registering user with email ${userData.email}${branchId ? ` and connecting to branch ${branchId}` : ""}`,
      )

      // Preparar los datos base del usuario
      const createData: any = {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role || "USER",
        phone: userData.phone,
        company: userData.company,
        authProvider: userData.authProvider || "EMAIL",
        emailVerified: null, // Usuario registrado necesita verificar email
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Si se proporciona branchId, conectar el usuario a la sucursal
      if (branchId) {
        // Verificar primero si la sucursal existe
        const branchExists = await this.prisma.branch.findUnique({
          where: { id: branchId },
        })

        if (!branchExists) {
          throw new NotFoundException(`Branch with ID ${branchId} not found`)
        }

        // Añadir la relación con la sucursal
        createData.branches = {
          connect: {
            id: branchId,
          },
        }
      }

      // Crear el usuario
      const user = await this.prisma.user.create({
        data: createData,
        include: {
          branches: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Generar token de verificación de email
      await this.generateEmailVerificationToken(user.email)

      // Eliminar la contraseña del resultado
      const { password, ...result } = user
      return {
        ...result,
        message: "User registered successfully. Please check your email to verify your account.",
      }
    } catch (error) {
      console.error("ERROR registering user:", error)
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error
      }
      throw new InternalServerErrorException("Error registering user: " + error.message)
    }
  }

  async login(loginUserDto: LoginAuthDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginUserDto.email },
        include: {
          branches: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!user) {
        throw new UnauthorizedException("Invalid credentials")
      }

      // Verificar si la cuenta está bloqueada
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new UnauthorizedException("Account is temporarily locked. Please try again later.")
      }

      const isPasswordMatch = await bcrypt.compare(loginUserDto.password, user.password)

      if (!isPasswordMatch) {
        // Incrementar intentos fallidos
        await this.handleFailedLogin(user.id)
        throw new UnauthorizedException("Invalid credentials")
      }

      // Verificar si el email está verificado
      if (!user.emailVerified) {
        throw new UnauthorizedException("Please verify your email before logging in")
      }

      // Actualizar lastLogin y resetear intentos fallidos
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      })

      const { password, ...userWithoutPassword } = user

      // Crear payload para el token
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      }

      const access_token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: "7d",
      })

      return { access_token, userInfo: userWithoutPassword }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException("Error during login: " + error.message)
    }
  }

  async oauthLogin(oauthLoginDto: OAuthLoginDto) {
    try {
      // Buscar usuario existente
      let user = await this.prisma.user.findUnique({
        where: { email: oauthLoginDto.email },
        include: {
          accounts: true,
          branches: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!user) {
        // Crear nuevo usuario
        user = await this.prisma.user.create({
          data: {
            email: oauthLoginDto.email,
            name: oauthLoginDto.name || `${oauthLoginDto.firstName || ""} ${oauthLoginDto.lastName || ""}`.trim(),
            firstName: oauthLoginDto.firstName,
            lastName: oauthLoginDto.lastName,
            image: oauthLoginDto.image,
            emailVerified: new Date(), // OAuth users are pre-verified
            authProvider: oauthLoginDto.provider,
            role: "USER",
          },
          include: {
            accounts: true,
            branches: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
      }

      // Buscar o crear account
      let account = await this.prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: oauthLoginDto.provider,
            providerAccountId: oauthLoginDto.providerAccountId,
          },
        },
      })

      if (!account) {
        account = await this.prisma.account.create({
          data: {
            userId: user.id,
            type: "oauth",
            provider: oauthLoginDto.provider,
            providerAccountId: oauthLoginDto.providerAccountId,
            access_token: oauthLoginDto.accessToken,
            refresh_token: oauthLoginDto.refreshToken,
            expires_at: oauthLoginDto.expiresAt,
          },
        })
      }

      // Actualizar lastLogin
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })

      const { password, ...userWithoutPassword } = user

      // Crear payload para el token
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      }

      const access_token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: "7d",
      })

      return { access_token, userInfo: userWithoutPassword }
    } catch (error) {
      throw new InternalServerErrorException("Error during OAuth login: " + error.message)
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      const verificationToken = await this.prisma.verificationToken.findUnique({
        where: {
          identifier_token: {
            identifier: verifyEmailDto.email,
            token: verifyEmailDto.token,
          },
        },
      })

      if (!verificationToken) {
        throw new BadRequestException("Invalid verification token")
      }

      if (verificationToken.expires < new Date()) {
        throw new BadRequestException("Verification token has expired")
      }

      // Verificar el email del usuario
      await this.prisma.user.update({
        where: { email: verifyEmailDto.email },
        data: { emailVerified: new Date() },
      })

      // Eliminar el token usado
      await this.prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verifyEmailDto.email,
            token: verifyEmailDto.token,
          },
        },
      })

      return { message: "Email verified successfully" }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException("Error verifying email: " + error.message)
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new NotFoundException("User not found")
      }

      if (user.emailVerified) {
        throw new BadRequestException("Email is already verified")
      }

      await this.generateEmailVerificationToken(email)
      return { message: "Verification email sent successfully" }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException("Error resending verification email: " + error.message)
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: forgotPasswordDto.email },
      })

      if (!user) {
        // No revelar si el email existe o no por seguridad
        return { message: "If the email exists, a password reset link has been sent" }
      }

      await this.generatePasswordResetToken(forgotPasswordDto.email)
      return { message: "If the email exists, a password reset link has been sent" }
    } catch (error) {
      throw new InternalServerErrorException("Error processing forgot password: " + error.message)
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: {
          identifier_token: {
            identifier: resetPasswordDto.email,
            token: resetPasswordDto.token,
          },
        },
      })

      if (!resetToken || resetToken.used) {
        throw new BadRequestException("Invalid or expired reset token")
      }

      if (resetToken.expires < new Date()) {
        throw new BadRequestException("Reset token has expired")
      }

      // Actualizar la contraseña
      const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10)

      await this.prisma.user.update({
        where: { email: resetPasswordDto.email },
        data: {
          password: hashedPassword,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      })

      // Marcar el token como usado
      await this.prisma.passwordResetToken.update({
        where: {
          identifier_token: {
            identifier: resetPasswordDto.email,
            token: resetPasswordDto.token,
          },
        },
        data: { used: true },
      })

      return { message: "Password reset successfully" }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException("Error resetting password: " + error.message)
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new NotFoundException("User not found")
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException("Current password is incorrect")
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      })

      return { message: "Password changed successfully" }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException("Error changing password: " + error.message)
    }
  }

  private async handleFailedLogin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    const failedAttempts = (user.failedLoginAttempts || 0) + 1
    const updateData: any = { failedLoginAttempts: failedAttempts }

    // Bloquear cuenta después de 5 intentos fallidos por 30 minutos
    if (failedAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    })
  }

  private async generateEmailVerificationToken(email: string) {
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Eliminar tokens existentes
    await this.prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Crear nuevo token
    await this.prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
        type: "email_verification",
      },
    })

    // Aquí enviarías el email con el token
    console.log(`Verification token for ${email}: ${token}`)
  }

  private async generatePasswordResetToken(email: string) {
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Eliminar tokens existentes
    await this.prisma.passwordResetToken.deleteMany({
      where: { identifier: email },
    })

    // Crear nuevo token
    await this.prisma.passwordResetToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Aquí enviarías el email con el token
    console.log(`Password reset token for ${email}: ${token}`)
  }

  // Métodos existentes actualizados...
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        image: true,
        phone: true,
        company: true,
        emailVerified: true,
        lastLogin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        branches: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async getUsersByBranch(branchId: string) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          branches: {
            some: {
              id: branchId,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          role: true,
          image: true,
          phone: true,
          company: true,
          emailVerified: true,
          lastLogin: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          branches: {
            select: {
              id: true,
              name: true,
            },
            where: {
              id: branchId,
            },
          },
        },
      })

      console.log(`DEBUG: Found ${users.length} users for branch ${branchId}`)
      return users
    } catch (error) {
      console.error("Error fetching users by branch:", error)
      throw new InternalServerErrorException("Error fetching users by branch: " + error.message)
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        image: true,
        phone: true,
        company: true,
        emailVerified: true,
        lastLogin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        authProvider: true,
        branches: {
          select: {
            id: true,
            name: true,
          },
        },
        accounts: {
          select: {
            provider: true,
            type: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }

  async update(id: string, updateUserDto: UpdateAuthDto) {
    // Manejar cambio de contraseña
    if (updateUserDto.newPassword && updateUserDto.password) {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { password: true },
      })

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`)
      }

      const isPasswordMatch = await bcrypt.compare(updateUserDto.password, user.password)

      if (!isPasswordMatch) {
        throw new UnauthorizedException("Current password is incorrect")
      }

      updateUserDto.password = await bcrypt.hash(updateUserDto.newPassword, 10)
      delete updateUserDto.newPassword
    } else if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
    }

    // Actualizar name si se cambian firstName o lastName
    if (updateUserDto.firstName || updateUserDto.lastName) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id },
        select: { firstName: true, lastName: true },
      })

      if (currentUser) {
        const firstName = updateUserDto.firstName || currentUser.firstName
        const lastName = updateUserDto.lastName || currentUser.lastName
        updateUserDto["name"] = `${firstName} ${lastName}`
      }
    }

    updateUserDto["updatedAt"] = new Date()

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          role: true,
          image: true,
          phone: true,
          company: true,
          emailVerified: true,
          lastLogin: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return updatedUser
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`User with ID ${id} not found`)
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      })

      return { message: "User deleted successfully" }
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`User with ID ${id} not found`)
      }
      throw error
    }
  }
}
