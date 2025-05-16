import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common"
import  { JwtService } from "@nestjs/jwt"
import  { ConfigService } from "@nestjs/config"
import  { Request } from "express"

@Injectable()
export class CustomerGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException("Authorization token is missing")
    }

    // 1. Intentar verificar como token JWT de customer
    try {
      const customerSecret = this.configService.get<string>("CUSTOMER_JWT_SECRET")
      const payload = await this.jwtService.verifyAsync(token, { secret: customerSecret })
      request["customer"] = payload
      return true // Token de customer válido
    } catch (customerError) {
      // No es un token de customer válido, intentamos con auth
    }

    // 2. Intentar verificar como token JWT de auth
    try {
      const authSecret = this.configService.get<string>("JWT_SECRET")
      const payload = await this.jwtService.verifyAsync(token, { secret: authSecret })
      request["user"] = payload
      return true // Token de auth válido
    } catch (authError) {
      // No es un token de auth válido
    }

    throw new UnauthorizedException("Invalid token - requires customer or admin access")
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Bearer" ? token : undefined
  }
}
