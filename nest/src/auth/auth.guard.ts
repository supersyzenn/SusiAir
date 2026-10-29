import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export const Public = () => SetMetadata('public', true);
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector:Reflector, private readonly jwt:JwtService) {}
  canActivate(context:ExecutionContext): boolean {
    if (this.reflector.getAllAndOverride('public', [context.getHandler(), context.getClass()])) return true;
    const header = context.switchToHttp().getRequest<Request>().headers.authorization;
    const match = header?.match(/^Bearer ([^\s]+)$/i);
    if (!match) throw new UnauthorizedException('Please sign in to continue');
    try {
      const payload = this.jwt.verify<{ sub:string }>(match[1]);
      if (payload.sub !== 'johndoe') throw new Error('Unknown pilot');
      return true;
    } catch { throw new UnauthorizedException('Your session has expired. Please sign in again'); }
  }
}
