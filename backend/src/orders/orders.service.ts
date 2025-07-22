import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/entities/transaction.entity';
import { BinanceApiService } from '../binance/binance.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly positionsService: PositionsService,
    private readonly walletsService: WalletsService,
    private readonly transactionsService: TransactionsService,
    private readonly binanceApiService: BinanceApiService,
    private readonly configService: ConfigService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    // 지금은 시장가(MARKET) 주문만 처리
    if (createOrderDto.type !== OrderType.MARKET) {
      throw new BadRequestException('지정가 주문은 현재 지원되지 않습니다.');
    }

    const { symbol, side, quantity, leverage } = createOrderDto; // 종목, 방향, 수량, 레버리지

    // --- 1. 모의 시장가 가져오기 ---
    // TODO: 실제로는 BinanceApiService를 통해 현재 시장가를 가져와야 함
    const marketPrice = await this.binanceApiService.getMarketPrice(symbol);

    // --- 2. 필요한 증거금(margin) 계산 ---
    // 총 거래대금 = (체결 가격) * (주문 수량), 즉 50000 * quantity
    // 필요 증거금 = (총 거래대금) / (레버리지)
    // 예: 10배 레버리지로 0.1 BTC (5,000달러어치)를 주문하면, 필요한 내 돈은 500달러
    const marginRequired = (marketPrice * quantity) / leverage;

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
      price: marketPrice, // 체결된 시장가로 기록
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
      entryPrice: marketPrice,
      leverage,
      margin: marginRequired,
    });

    // 6단계 로직을 '자산 변동 처리'로 통합하여 확장합니다.
    // --- 6. 자산 변동 처리 (증거금 및 수수료) ---
    const wallet = await this.walletsService.findWalletByUserId(userId);
    if (!wallet) {
      throw new BadRequestException('사용자 지갑을 찾을 수 없습니다.');
    }

    // 6-1. 지갑 잔고 업데이트
    await this.walletsService.updateBalance(userId, -marginRequired);
    await this.transactionsService.create({
      wallet: wallet,
      type: TransactionType.REALIZED_PNL, // 증거금 사용은 손익 실현으로 간주
      amount: -marginRequired,
    });

    // 6-2. [신규] 거래 수수료 계산 및 차감, 기록
    const feeRate = this.configService.get<number>('TRADE_FEE_RATE');
    const positionValue = marketPrice * quantity; // 포지션 총 가치
    const tradeFee = positionValue * feeRate; // 수수료 계산

    await this.walletsService.updateBalance(userId, -tradeFee);
    await this.transactionsService.create({
      wallet: wallet,
      type: TransactionType.FEE, // 'FEE' 타입으로 기록
      amount: -tradeFee, // 수수료는 차감되므로 음수
    });

    return { order: newOrder, position: newPosition };
  }
}
