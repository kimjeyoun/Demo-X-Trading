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
      // 2. 기존 포지션이 있으면 '물타기/불타기' 로직 실행 (평균 단가, 수량 업데이트)
      // TODO: 지금은 단순 덮어쓰기. 추후 평균 단가 계산 로직으로 고도화 필요
      existingPosition.quantity += quantity;
      existingPosition.margin += margin;
      // entryPrice, liquidationPrice도 평균값으로 재계산 필요
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
