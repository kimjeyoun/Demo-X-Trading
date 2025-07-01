/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
// backend/src/auth/auth.controller.ts

import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard'; // 곧 생성
import { LoginDto } from './dto/login.dto'; // 곧 생성

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login
  @UseGuards(LocalAuthGuard) // 이 Guard가 LocalStrategy를 실행시킴
  @Post('/login')
  login(@Request() req, @Body() _loginDto: LoginDto): { accessToken: string } {
    // LocalAuthGuard가 성공하면 req.user에 검증된 user 객체가 담겨 있음
    return this.authService.login(req.user);
  }
}
