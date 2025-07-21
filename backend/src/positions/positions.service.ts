import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(PositionsService.name);

  constructor(
    @InjectRepository(Position)
    private readonly positionsRepository: Repository<Position>,
  ) {}

  /**
   * 특정 사용자의 모든 포지션을 조회합니다.
   * @param userId 사용자 ID
   * @returns 해당 사용자의 포지션 목록
   */
  async findAllByUserId(userId: string): Promise<Position[]> {
    return this.positionsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }, // 최신 포지션이 위로 오도록 정렬
    });
  }

  async createOrUpdatePosition(params: PositionParams): Promise<Position> {
    const { userId, symbol, side, quantity, entryPrice, margin } = params;

    // 1. 동일한 종목, 동일한 방향의 기존 포지션이 있는지 확인
    const existingPosition = await this.positionsRepository.findOne({
      where: { user: { id: userId }, symbol, side },
    });

    if (existingPosition) {
      // --- 기존 포지션 업데이트 (물타기) 로직 ---
      // TODO: 이슈 #20의 심화 과제. 평균 진입가 및 청산가 재계산 로지 추가 필요
      // 현재는 수량과 증거금만 업데이트합니다
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
      if (!existingPosition) {
        // 1. 청산 가격(liquidationPrice)을 계산합니다.
        let calculatedLiqPrice: number;
        if (side === PositionSide.LONG) {
          calculatedLiqPrice = entryPrice - margin / quantity;
        } else {
          calculatedLiqPrice = entryPrice + margin / quantity;
        }

        // 2. [수정] 계산된 청산 가격이 음수일 경우 0으로 조정합니다.
        const finalLiqPrice = Math.max(0, calculatedLiqPrice);

        this.logger.debug(
          `[New Position] Entry: ${entryPrice}, Margin: ${margin}, Qty: ${quantity}, Calculated Liq. Price: ${calculatedLiqPrice}, Final Liq. Price: ${finalLiqPrice}`,
        );

        // 3. 최종 청산 가격을 포함하여 새로운 포지션 엔티티를 생성합니다.
        const newPosition = this.positionsRepository.create({
          ...params, // DTO를 그대로 사용하여 간결화
          user: { id: userId },
          liquidationPrice: finalLiqPrice, // 최종 조정된 값으로 저장
        });

        return this.positionsRepository.save(newPosition);
      }
    }
  }
}
