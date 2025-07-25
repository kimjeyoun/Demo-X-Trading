import { forwardRef, Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { BinanceModule } from '../binance/binance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position]),
    WalletsModule,
    TransactionsModule,
    forwardRef(() => BinanceModule),
  ],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}
