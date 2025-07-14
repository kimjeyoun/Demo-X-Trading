import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  /**
   * 현재 로그인된 사용자의 지갑 정보를 조회합니다.
   */
  @UseGuards(JwtAuthGuard) // 👈 이 API는 인증된 사용자만 호출 가능
  @Get()
  findMyWallet(@Request() req: { user: { id: string } }) {
    const userId = req.user.id;
    return this.walletsService.findWalletByUserId(userId);
  }
}
