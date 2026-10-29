import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual, createHash } from 'node:crypto';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}
  login(input: LoginDto) {
    const hash = (value:string) => createHash('sha256').update(value).digest();
    const userOk = timingSafeEqual(hash(input.username), hash('johndoe'));
    const passwordOk = timingSafeEqual(hash(input.password), hash('susiairtest'));
    if (!userOk || !passwordOk) throw new UnauthorizedException('Incorrect username or password');
    return { accessToken:this.jwt.sign({ sub:'johndoe' }), tokenType:'Bearer', expiresIn:3600 };
  }
}
