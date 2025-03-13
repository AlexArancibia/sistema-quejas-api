import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class PublicKeyGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Authorization token is missing");
    }

    // Intentar validación con publicKey
    if (this.isPublicKeyValid(token)) {
      return true; // Clave pública válida
    }

    // Intentar validación con JWT
    const secrets = [process.env.CUSTOMER_JWT_SECRET, process.env.SECRET];

    for (const secret of secrets) {
      try {
        await this.jwtService.verifyAsync(token, { secret });
        return true; // Token is valid
      } catch {
        // Continue to the next secret if verification fails
      }
    }

    throw new UnauthorizedException("Invalid token");
  }
  private extractToken(request: Request): string | undefined {
    const [type, token] = (request.headers.authorization?.split(" ") ?? []);
    return type === "Bearer" ? token : undefined; // Asegurar que sea un Bearer token
  }

  private isPublicKeyValid(token: string): boolean {
    return token === process.env.PUBLIC_KEY; // Comparar con la clave pública en .env
  }
}
