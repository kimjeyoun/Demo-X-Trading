// backend/src/binance/binance.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // HttpModule 임포트
import { BinanceApiService } from './binance.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    // HttpModule을 등록하여 이 모듈 내에서 HttpService를 주입받아 사용할 수 있게 함
    HttpModule.register({
      timeout: 5000, // 요청 타임아웃: 5초
      maxRedirects: 5, // 최대 리다이렉트 횟수
    }),
    EventsModule,
  ],
  providers: [BinanceApiService], // 서비스는 다음 단계에서 추가
  exports: [BinanceApiService],
})
export class BinanceModule {}
