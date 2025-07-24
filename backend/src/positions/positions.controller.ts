// backend/src/positions/positions.controller.ts

import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
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

  /*
- [기능 구현] 포지션 종료를 위한 API 엔드포인트를 추가합니다. (DELETE /:id)
- JwtAuthGuard를 적용하여 본인의 포지션만 종료할 수 있도록 보호합니다.
- URL 파라미터에서 positionId를, 요청 객체에서 userId를 가져와 서비스 로직으로 전달합니다.
*/
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  closePosition(@Param('id') positionId: string, @Request() req) {
    const userId = req.user.id;
    return this.positionsService.closePosition(positionId, userId);
  }
}
