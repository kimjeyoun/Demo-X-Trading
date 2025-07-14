import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from './entities/position.entity';
import { PositionSide } from '../common/enums/order.enum';

// createOrUpdatePosition 메소드에 전달될 데이터 타입을 정의
interface PositionParams {
  userId: string;
  symbol: string;
  side: PositionSide; // 사는거냐(BUY) 파는거냐(SELL)
  quantity: number;
  entryPrice: number;
  leverage: number;
  margin: number; // 주문 체결에 필요한 증거금
}

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positionsRepository: Repository<Position>,
  ) {}

  async createOrUpdatePosition(params: PositionParams): Promise<Position> {
    const { userId, symbol, side, quantity, entryPrice, leverage, margin } =
      params;

    // 1. 동일한 종목, 동일한 방향의 기존 포지션이 있는지 확인
    const existingPosition = await this.positionsRepository.findOne({
      where: { user: { id: userId }, symbol, side },
    });

    if (existingPosition) {
      // --- 여기가 수정될 부분입니다 ---
      // 1. 기존 값들을 명시적으로 숫자로 변환합니다.
      const existingQuantity = Number(existingPosition.quantity);
      const existingMargin = Number(existingPosition.margin);

      // 2. 새로운 값(수량, 증거금)을 계산합니다.
      const newQuantity = existingQuantity + quantity;
      const newMargin = existingMargin + margin;

      // TODO: 추후 평균 진입 가격(entryPrice) 재계산 로직 추가 필요
      // const totalValue = (existingQuantity * existingPosition.entryPrice) + (quantity * entryPrice);
      // existingPosition.entryPrice = totalValue / newQuantity;

      // 3. 계산된 숫자 값을 할당합니다.
      existingPosition.quantity = newQuantity;
      existingPosition.margin = newMargin;

      return this.positionsRepository.save(existingPosition);
    } else {
      // 3. 기존 포지션이 없으면 새로 생성
      // TODO: 청산 가격(liquidationPrice) 계산 로직 필요
      const newPosition = this.positionsRepository.create({
        user: { id: userId },
        symbol,
        side,
        quantity,
        entryPrice,
        leverage,
        margin,
        liquidationPrice: 0, // 임시값
      });
      return this.positionsRepository.save(newPosition);
    }
  }
}
