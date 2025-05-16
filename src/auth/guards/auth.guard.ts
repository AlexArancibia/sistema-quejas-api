import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config"
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request);
    

    console.log({token})

    if(!token){
      throw new UnauthorizedException()
    }

    try {
      const payload = await this.jwtService.verifyAsync(token,{
        secret: this.configService.get<string>("JWT_SECRET"),

      })

      return true


      
    } catch (error) {
      throw new UnauthorizedException()
      
    }
  }

  private extractToken(request : Request): string | undefined {
    const [type,token] = request.headers.authorization.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined
  }
}