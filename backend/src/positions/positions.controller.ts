// backend/src/positions/positions.controller.ts

import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  /**
   * 현재 로그인된 사용자의 모든 포지션을 조회합니다.
   */
  @UseGuards(JwtAuthGuard) // 👈 이 API는 인증된 사용자만 호출 가능
  @Get()
  findMyPositions(@Request() req: { user: { id: string } }) {
    const userId = req.user.id;
    return this.positionsService.findAllByUserId(userId);
  }
}
