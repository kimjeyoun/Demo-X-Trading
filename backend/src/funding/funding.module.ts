/* backend/src/funding/funding.module.ts */
/*
- FundingService를 위한 모듈을 정의하고, 필요한 모든 의존 모듈을 임포트
*/
import { Module } from '@nestjs/common';
import { FundingService } from './funding.service';
import { PositionsModule } from '../positions/positions.module';
import { WalletsModule } from '../wallets/wallets.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { BinanceModule } from '../binance/binance.module';

@Module({
  imports: [PositionsModule, WalletsModule, TransactionsModule, BinanceModule],
  providers: [FundingService],
})
export class FundingModule {}
