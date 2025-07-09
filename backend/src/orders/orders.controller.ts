import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard) // 👈 이 API는 JWT 인증이 필요함을 명시
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    // req.user에는 JwtStrategy의 validate 메소드가 반환한 user 객체가 담겨 있음
    const userId = req.user.id;
    return this.ordersService.createOrder(userId, createOrderDto);
  }
}
