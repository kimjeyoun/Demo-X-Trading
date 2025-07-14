// backend/src/orders/dto/create-order.dto.ts

import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
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
  @IsOptional() // price 필드는 이제 선택 사항(Optional)입니다.
  // o.type이 'LIMIT'일 경우에만 아래 유효성 검사를 실행합니다.
  @ValidateIf((o) => o.type === OrderType.LIMIT)
  price?: number; // 시장가(MARKET) 주문 시에는 이 값이 없을 수 있으므로 '?' 추가

  @IsNumber()
  @Min(0.00001) // 최소 주문 수량 제약
  quantity: number;

  @IsNumber()
  @Min(1)
  leverage: number;
}
