import { Controller, Get, Param, Post, Patch, Delete, Request, UseGuards, Body } from "@nestjs/common"
import  { AuthService } from "./auth.service"
import  { LoginAuthDto } from "./dto/login-auth.dto"
import { AuthGuard } from "./guards/auth.guard"
import  { RegisterDto } from "./dto/register.dto"
import  { CreateAuthDto } from "./dto/create-auth.dto"
import  { UpdateAuthDto } from "./dto/update-auth.dto"
import  { VerifyEmailDto } from "./dto/verify-email.dto"
import  { ForgotPasswordDto } from "./dto/forgot-password.dto"
import  { ResetPasswordDto } from "./dto/reset-password.dto"
import  { OAuthLoginDto } from "./dto/oauth-login.dto"
import { PublicKeyGuard } from "./guards/public.guard"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  

  // Registro público CON confirmación de email
  @UseGuards(PublicKeyGuard)
  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @UseGuards(PublicKeyGuard)
  @Post("login")
  login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto)
  }

  @UseGuards(PublicKeyGuard)
  @Post("verify-email")
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto)
  }

  @UseGuards(PublicKeyGuard)
  @Post("resend-verification")
  resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email)
  }

  @UseGuards(PublicKeyGuard)
  @Post("forgot-password")
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto)
  }

  @UseGuards(PublicKeyGuard)
  @Post("reset-password")
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto)
  }

  @UseGuards(PublicKeyGuard)
  @Post("oauth/login")
  oauthLogin(@Body() oauthLoginDto: OAuthLoginDto) {
    return this.authService.oauthLogin(oauthLoginDto)
  }

  @UseGuards(AuthGuard)
  @Post("change-password")
  changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword)
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return this.authService.findOne(req.user.id)
  }

  // Admin endpoints
  // Crear usuario SIN confirmación de email (para admins)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto)
  }

  @UseGuards(PublicKeyGuard)
  @Get()
  findAll() {
    return this.authService.findAll()
  }

  @UseGuards(AuthGuard)
  @Get("branch/:branchId/users")
  getUsersByBranch(@Param("branchId") branchId: string) {
    return this.authService.getUsersByBranch(branchId)
  }

  @UseGuards(AuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.authService.findOne(id)
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.authService.remove(id)
  }
}
