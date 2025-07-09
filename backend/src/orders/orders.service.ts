import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import {
  OrderSide,
  OrderStatus,
  OrderType,
  PositionSide,
} from '../common/enums/order.enum';
import { PositionsService } from '../positions/positions.service';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly positionsService: PositionsService,
    private readonly walletsService: WalletsService,
    // TODO: 나중에 BinanceApiService도 주입받아 실제 시장가를 가져와야 함
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    // 지금은 시장가(MARKET) 주문만 처리
    if (createOrderDto.type !== OrderType.MARKET) {
      throw new BadRequestException('지정가 주문은 현재 지원되지 않습니다.');
    }

    // --- 1. 모의 시장가 가져오기 ---
    // TODO: 실제로는 BinanceApiService를 통해 현재 시장가를 가져와야 함
    const mockMarketPrice = 50000.0; // 임시 모의 시장가

    const { symbol, side, quantity, leverage } = createOrderDto; // 종목, 방향, 수량, 레버리지

    // --- 2. 필요한 증거금(margin) 계산 ---
    // 총 거래대금 = (체결 가격) * (주문 수량), 즉 50000 * quantity
    // 필요 증거금 = (총 거래대금) / (레버리지)
    // 예: 10배 레버리지로 0.1 BTC (5,000달러어치)를 주문하면, 필요한 내 돈은 500달러
    const marginRequired = (mockMarketPrice * quantity) / leverage;

    // --- 3. 사용자 지갑 잔고 확인 ---
    const hasSufficientBalance = await this.walletsService.checkBalance(
      userId,
      marginRequired,
    );
    if (!hasSufficientBalance) {
      throw new BadRequestException('증거금이 부족합니다.');
    }

    // --- 4. 주문(Order) 기록 생성 ---
    const newOrder = this.ordersRepository.create({
      user: { id: userId }, // 관계형 데이터는 id만 넣어줘도 됨
      symbol,
      type: OrderType.MARKET,
      side,
      price: mockMarketPrice, // 체결된 시장가로 기록
      quantity,
      status: OrderStatus.FILLED, // 시장가는 즉시 체결
    });
    await this.ordersRepository.save(newOrder);

    // --- 5. 포지션(Position) 생성 또는 업데이트 ---
    const positionSide =
      side === OrderSide.BUY ? PositionSide.LONG : PositionSide.SHORT;
    const newPosition = await this.positionsService.createOrUpdatePosition({
      userId,
      symbol,
      side: positionSide,
      quantity,
      entryPrice: mockMarketPrice,
      leverage,
      margin: marginRequired,
    });

    // --- 6. 지갑 잔고에서 증거금 차감 ---
    await this.walletsService.updateBalance(userId, -marginRequired);

    return { order: newOrder, position: newPosition };
  }
}
