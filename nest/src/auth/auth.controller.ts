import { Body, Controller, HttpCode, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { Public } from './auth.guard';
import { EmptyQueryDto } from '../common/query.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly service:AuthService) {}
  @Public() @Post('login') @HttpCode(200)
  login(@Body() input:LoginDto, @Query() _query:EmptyQueryDto) { return this.service.login(input); }
}
