import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common"
import  { JwtService } from "@nestjs/jwt"
import  { ConfigService } from "@nestjs/config"
import  { Request } from "express"

@Injectable()
export class PublicKeyGuard implements CanActivate {
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

    // 1. Verificar si es la clave pública
    const publicKey = this.configService.get<string>("PUBLIC_KEY")
    if (token === publicKey) {
      return true // Clave pública válida
    }

    // 2. Intentar verificar como token JWT de customer
    try {
      const customerSecret = this.configService.get<string>("CUSTOMER_JWT_SECRET")
      await this.jwtService.verifyAsync(token, { secret: customerSecret })
      return true // Token de customer válido
    } catch (error) {
      // No es un token de customer válido, continuamos
    }

    // 3. Intentar verificar como token JWT de auth
    try {
      const authSecret = this.configService.get<string>("JWT_SECRET")
      await this.jwtService.verifyAsync(token, { secret: authSecret })
      return true // Token de auth válido
    } catch (error) {
      // No es un token de auth válido
    }

    throw new UnauthorizedException("Invalid token or public key")
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Bearer" ? token : undefined
  }
}
