/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 'Bearer' 타입 토큰 사용
      ignoreExpiration: false, // 만료된 토큰은 거부
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // 이 메소드는 토큰 검증이 성공한 후에 자동으로 호출됨
  async validate(payload: any) {
    // payload에는 토큰을 만들 때 넣었던 정보(예: userId)가 담겨 있음
    const user = await this.usersService.findById(payload.sub); // usersService에 findById 메소드 추가 필요!
    if (!user) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }
    return user; // 이 리턴값은 req.user에 저장됨
  }
}
