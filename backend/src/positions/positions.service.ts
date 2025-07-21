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
    const { userId, symbol, side, quantity, entryPrice, leverage, margin } =
      params;

    // 1. 동일한 종목, 동일한 방향의 기존 포지션이 있는지 확인
    const existingPosition = await this.positionsRepository.findOne({
      where: { user: { id: userId }, symbol, side },
    });

    if (existingPosition) {
      // --- [수정] 기존 포지션 업데이트(물타기) 로직 ---

      // 1. 기존 값과 신규 값을 숫자로 명확하게 준비
      const existingQuantity = Number(existingPosition.quantity); // 기존 포지션의 수량
      const existingEntryPrice = Number(existingPosition.entryPrice); // 기존 포지션의 진입 가격
      const existingMargin = Number(existingPosition.margin); // 기존 포지션의 증거금

      const newOrderQuantity = quantity;
      const newOrderEntryPrice = entryPrice;
      const newOrderMargin = margin;

      // 2. 새로운 총 수량과 총 증거금을 계산합니다.
      const totalQuantity = existingQuantity + newOrderQuantity;
      const totalMargin = existingMargin + newOrderMargin;

      // 3. 가중 평균을 이용하여 새로운 평균 진입 가격을 계산합니다.
      // (기존 포지션의 총 가치 + 신규 주문의 총 가치) / 새로운 총 수량
      const totalValue =
        existingQuantity * existingEntryPrice +
        newOrderQuantity * newOrderEntryPrice;
      const averageEntryPrice = totalValue / totalQuantity;

      // 4. 새로운 평균 진입 가격과 총 증거금을 바탕으로 강제 청산 가격을 재계산합니다.
      let newLiquidationPrice: number;
      if (side === PositionSide.LONG) {
        newLiquidationPrice = averageEntryPrice - totalMargin / totalQuantity;
      } else {
        // SHORT
        newLiquidationPrice = averageEntryPrice + totalMargin / totalQuantity;
      }
      const finalNewLiquidationPrice = Math.max(0, newLiquidationPrice);

      this.logger.debug(
        `[Update Position] Avg Price: ${averageEntryPrice}, Total Margin: ${totalMargin}, Total Qty: ${totalQuantity}, New Liq. Price: ${finalNewLiquidationPrice}`,
      );

      // 5. 계산된 모든 값을 기존 포지션 객체에 업데이트합니다.
      existingPosition.quantity = totalQuantity;
      existingPosition.margin = totalMargin;
      existingPosition.entryPrice = averageEntryPrice;
      existingPosition.liquidationPrice = finalNewLiquidationPrice;
      // 레버리지는 첫 진입 시의 값을 유지하는 것이 일반적인 정책이므로 변경하지 않습니다.

      return this.positionsRepository.save(existingPosition);
    } else {
      let calculatedLiqPrice: number;
      if (side === PositionSide.LONG) {
        calculatedLiqPrice = entryPrice - margin / quantity;
      } else {
        calculatedLiqPrice = entryPrice + margin / quantity;
      }
      const finalLiqPrice = Math.max(0, calculatedLiqPrice);

      this.logger.debug(
        `[New Position] Entry: ${entryPrice}, Margin: ${margin}, Qty: ${quantity}, Calculated Liq. Price: ${calculatedLiqPrice}, Final Liq. Price: ${finalLiqPrice}`,
      );

      const newPosition = this.positionsRepository.create({
        user: { id: userId },
        symbol,
        side,
        quantity,
        entryPrice,
        leverage,
        margin,
        liquidationPrice: finalLiqPrice,
      });

      return this.positionsRepository.save(newPosition);
    }
  }
}
