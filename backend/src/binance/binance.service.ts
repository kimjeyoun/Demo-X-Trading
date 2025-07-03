// backend/src/binance/binance.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BinanceApiService implements OnModuleInit {
  private readonly apiKey: string;
  private readonly secretKey: string;
  // 바이낸스 선물 API 기본 URL
  private readonly baseURL = 'https://fapi.binance.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // .env에서 API 키를 안전하게 가져옴
    this.apiKey = this.configService.getOrThrow<string>('BINANCE_API_KEY');
    this.secretKey =
      this.configService.getOrThrow<string>('BINANCE_SECRET_KEY');
  }

  // 모듈이 초기화될 때 실행되는 라이프사이클 훅
  async onModuleInit(): Promise<void> {
    await this.ping();
  }

  /**
   * 바이낸스 API 서버에 연결 테스트 (ping)
   */
  async ping(): Promise<void> {
    try {
      const url = `${this.baseURL}/fapi/v1/ping`;

      // HttpService는 RxJS의 Observable을 반환하므로, Promise로 변환하기 위해 firstValueFrom을 사용
      const response = await firstValueFrom(this.httpService.get(url));

      if (response.status === 200) {
        console.log('✅ Binance API connection successful (ping).');
      } else {
        console.error('❌ Binance API connection failed.');
      }
    } catch (error) {
      console.error('❌ Error pinging Binance API:', error.message);
    }
  }
}
