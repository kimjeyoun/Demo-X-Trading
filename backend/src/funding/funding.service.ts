/* backend/src/funding/funding.service.ts */
/*
- 펀딩비 정산 로직을 담당하는 서비스
- @Cron 데코레이터를 사용하여 정해진 시간마다 자동으로 로직을 실행
*/
import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import * as cron from 'node-cron'; // node-cron 임포트
import { BinanceApiService } from '../binance/binance.service';
import { PositionsService } from '../positions/positions.service';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletsService } from '../wallets/wallets.service';
import { TransactionType } from '../transactions/entities/transaction.entity';
import { PositionSide } from 'src/common/enums/order.enum';

@Injectable()
export class FundingService {
  private readonly logger = new Logger(FundingService.name);
  private fundingJob: cron.ScheduledTask;

  constructor(
    private readonly positionsService: PositionsService,
    private readonly walletsService: WalletsService,
    private readonly transactionsService: TransactionsService,
    private readonly binanceApiService: BinanceApiService,
  ) {}

  // CronExpression.EVERY_8_HOURS는 실제 운영용
  // 테스트를 위해 1분마다 실행: @Cron('0 * * * * *')
  // 서비스가 초기화될 때 한번만 실행됩니다.
  onModuleInit() {
    this.logger.log('Initializing funding fee settlement job...');

    // 테스트용: 매 1분마다 실행 ('0 * * * * *')
    // 운영용: 매 8시간마다 실행 ('0 0 */8 * * *') -> 0시, 8시, 16시 정각
    const cronExpression = '0 0 */8 * * *';

    this.fundingJob = cron.schedule(
      cronExpression,
      async () => {
        // NestJS의 DI 컨텍스트를 잃지 않도록, this를 바인딩해줍니다.
        await this.handleFundingFeeSettlement();
      },
      {
        timezone: 'UTC',
      },
    );

    this.fundingJob.start();
    this.logger.log(
      `Funding fee settlement job scheduled with expression: ${cronExpression}`,
    );
  }

  async handleFundingFeeSettlement() {
    this.logger.log('Starting funding fee settlement process...');

    const openPositions = await this.positionsService.findAllOpenPositions();
    if (openPositions.length === 0) {
      this.logger.log(
        'No open positions to settle funding fees. Process finished.',
      );
      return;
    }

    // 심볼별로 펀딩비를 한 번만 조회하기 위해 Map 사용 (API 호출 최적화)
    const fundingRateMap = new Map<string, number>();

    for (const position of openPositions) {
      const { symbol, user, quantity, entryPrice } = position;
      const symbolStr = String(symbol);

      if (!fundingRateMap.has(symbolStr)) {
        const rate = await this.binanceApiService.getFundingRate(symbolStr);
        fundingRateMap.set(symbolStr, rate);
      }

      const fundingRate = fundingRateMap.get(symbolStr);
      const positionValue = Number(quantity) * Number(entryPrice);

      // 펀딩비 계산 (숏 포지션은 반대 금액)
      let fundingFee = positionValue * fundingRate;
      if (position.side === PositionSide.SHORT) {
        fundingFee = -fundingFee;
      }

      // 펀딩비는 자산에서 차감 (음수 금액)
      const amountToSettle = -fundingFee;

      // 지갑 잔고 업데이트 및 거래 내역 기록
      await this.walletsService.updateBalance(String(user.id), amountToSettle);
      await this.transactionsService.create({
        wallet: await this.walletsService.findWalletByUserId(String(user.id)),
        type: TransactionType.FUNDING_FEE,
        amount: amountToSettle,
      });

      this.logger.log(
        `User ${user.id} settled funding fee of ${amountToSettle} for position ${position.id}`,
      );
    }

    this.logger.log('Funding fee settlement process finished.');
  }
}
