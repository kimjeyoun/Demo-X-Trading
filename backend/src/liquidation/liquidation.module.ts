/* backend/src/liquidation/liquidation.module.ts */
import { Module } from '@nestjs/common';
import { LiquidationService } from './liquidation.service';
import { PositionsModule } from '../positions/positions.module';

@Module({
  imports: [PositionsModule],
  providers: [LiquidationService],
})
export class LiquidationModule {}
