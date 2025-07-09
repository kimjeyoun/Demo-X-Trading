// backend/src/orders/dto/create-order.dto.ts

import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { OrderSide, OrderType } from '../../common/enums/order.enum';

export class CreateOrderDto {
  @IsString()
  symbol: string;

  @IsEnum(OrderType)
  type: OrderType;

  @IsEnum(OrderSide)
  side: OrderSide;

  // 지정가(LIMIT) 주문일 때만 필요한 값이므로, @IsOptional() 데코레이터를 사용할 수도 있지만
  // 일단은 필수 값으로 두고 서비스 로직에서 분기 처리하겠습니다.
  @IsNumber()
  price: number; // 시장가 주문 시에는 0 또는 클라이언트에서 보내지 않음

  @IsNumber()
  @Min(0.00001) // 최소 주문 수량 제약
  quantity: number;

  @IsNumber()
  @Min(1)
  leverage: number;
}
