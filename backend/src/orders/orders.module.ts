import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { PositionsModule } from '../positions/positions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { BinanceModule } from '../binance/binance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    WalletsModule,
    PositionsModule,
    TransactionsModule,
    BinanceModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
