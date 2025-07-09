import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { PositionsModule } from '../positions/positions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), WalletsModule, PositionsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
