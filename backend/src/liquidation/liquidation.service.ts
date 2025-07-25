/* backend/src/liquidation/liquidation.service.ts */
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PositionsService } from '../positions/positions.service';

@Injectable()
export class LiquidationService {
  private readonly logger = new Logger(LiquidationService.name);

  constructor(private readonly positionsService: PositionsService) {}

  @OnEvent('price.update') // 'price.update' 이벤트를 리스닝
  async handlePriceUpdate(payload: { symbol: string; price: number }) {
    try {
      const liquidatablePositions =
        await this.positionsService.findLiquidatablePositions(payload.price);

      if (liquidatablePositions.length > 0) {
        this.logger.warn(
          `Found ${liquidatablePositions.length} positions to liquidate at price ${payload.price}`,
        );

        const liquidationPromises = liquidatablePositions.map((position) =>
          this.positionsService.closePosition(position.id, position.user.id),
        );

        await Promise.all(liquidationPromises);
      }
    } catch (error) {
      this.logger.error('Error during liquidation check:', error);
    }
  }
}
