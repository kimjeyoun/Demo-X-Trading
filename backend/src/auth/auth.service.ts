// backend/src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 이메일과 비밀번호로 사용자를 검증합니다. (LocalStrategy에서 사용)
   * @param email 사용자 이메일
   * @param pass  사용자 비밀번호 (암호화되지 않은 원본)
   * @returns 비밀번호를 제외한 사용자 정보 또는 null
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    // 1. 이메일로 사용자 찾기 (비밀번호 포함)
    const user = await this.usersService.findByEmail(email);

    // 2. 사용자가 있고, 비밀번호가 일치하는지 확인
    const isPasswordMatched = user
      ? await bcrypt.compare(pass, user.password)
      : false;

    if (user && isPasswordMatched) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // 비밀번호 제외하고 반환
      return result;
    }

    return null; // 사용자가 없거나 비밀번호가 틀리면 null 반환
  }

  /**
   * 로그인 성공 시 JWT 토큰을 발급합니다.
   * @param user 사용자 정보 객체
   * @returns 액세스 토큰
   */
  login(user: Omit<User, 'password'>): { accessToken: string } {
    // 토큰에 담을 payload. sub는 'subject'의 약자로, 토큰의 주체를 나타냄.
    // 일반적으로 사용자의 ID를 넣습니다.
    const payload = { email: user.email, sub: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
