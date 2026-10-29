import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) throw new Error('Production JWT_SECRET must contain at least 32 characters');
  return secret || 'local-demo-only-change-this-before-deploying';
}
@Module({
  imports:[JwtModule.register({ global:true, secret:jwtSecret(), signOptions:{ expiresIn:3600, algorithm:'HS256', issuer:'susiair-pilot-api', audience:'susiair-pilot-app' }, verifyOptions:{ algorithms:['HS256'], issuer:'susiair-pilot-api', audience:'susiair-pilot-app' } })],
  controllers:[AuthController], providers:[AuthService, { provide:APP_GUARD, useClass:AuthGuard }],
})
export class AuthModule {}
