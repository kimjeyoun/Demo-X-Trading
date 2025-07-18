import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PageOptionsDto } from '../common/dto/page-options.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req, @Query() pageOptionsDto: PageOptionsDto) {
    // req.user는 JwtStrategy의 validate에서 반환된 페이로드입니다.
    const userId = req.user.id;
    return this.transactionsService.findAllByUserId(userId, pageOptionsDto);
  }
}
