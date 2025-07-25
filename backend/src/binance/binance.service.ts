// backend/src/binance/binance.service.ts

import {
  Injectable,
  Inject,
  forwardRef,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';
import * as WebSocket from 'ws';
import { EventsGateway } from 'src/events/events.gateway';
import { PositionsService } from 'src/positions/positions.service';

@Injectable()
export class BinanceApiService implements OnModuleInit {
  private readonly logger = new Logger(BinanceApiService.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  // 바이낸스 선물 API 기본 URL
  private readonly baseURL = 'https://fapi.binance.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly eventsGateway: EventsGateway,
    @Inject(forwardRef(() => PositionsService))
    private readonly positionsService: PositionsService,
  ) {
    // .env에서 API 키를 안전하게 가져옴
    this.apiKey = this.configService.getOrThrow<string>('BINANCE_API_KEY');
    this.secretKey =
      this.configService.getOrThrow<string>('BINANCE_SECRET_KEY');
  }

  // 모듈이 초기화될 때 실행되는 라이프사이클 훅
  async onModuleInit(): Promise<void> {
    await this.ping();
    this.connectToWebSocket(); // 모듈 초기화 시 WebSocket 연결 시작
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

  /**
   * [신규 추가] 자동 청산 로직을 처리하는 비동기 메소드
   * @param markPrice 현재 시장가
   */
  private async handleLiquidationCheck(markPrice: number): Promise<void> {
    try {
      const liquidatablePositions =
        await this.positionsService.findLiquidatablePositions(markPrice);

      if (liquidatablePositions.length > 0) {
        this.logger.warn(
          `Found ${liquidatablePositions.length} positions to liquidate at price ${markPrice}`,
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

  /**
   * 바이낸스 선물 WebSocket 스트림에 연결합니다.
   */
  private connectToWebSocket(): void {
    // 여러 스트림을 동시에 구독 (예: BTC/USDT 1분봉, 호가창, 체결 정보)
    const streams = 'btcusdt@kline_1m/btcusdt@depth5@100ms/btcusdt@aggTrade';
    const wsURL = `wss://fstream.binance.com/stream?streams=${streams}`;

    const ws = new WebSocket(wsURL);

    ws.on('open', () => {
      console.log('✅ Connected to Binance WebSocket');
    });

    ws.on('message', (data: WebSocket.Data) => {
      let messageString: string;

      // 1. data가 Buffer 타입인지 먼저 확인
      if (Buffer.isBuffer(data)) {
        messageString = data.toString('utf-8');
      } else {
        // Buffer가 아니라면, string으로 간주 (ArrayBuffer 등 다른 경우는 일단 무시)
        messageString = data as string;
      }

      // 이제 messageString은 확실한 string 타입이므로 안전하게 파싱 가능
      try {
        const message = JSON.parse(messageString);

        // 데이터 스트림 종류에 따라 분기하여 처리 (이 부분은 동일)
        // 'stream' 속성이 있는지 먼저 확인하여 안정성 추가
        if (message && message.stream) {
          if (message.stream.endsWith('@kline_1m')) {
            // 캔들 데이터 처리 (클라이언트에 'kline' 이벤트로 전송)
            this.eventsGateway.server.emit('kline', message.data);
          } else if (message.stream.endsWith('@depth5@100ms')) {
            // 호가창 데이터 처리 (클라이언트에 'depth' 이벤트로 전송)
            this.eventsGateway.server.emit('depth', message.data);
          } else if (message.stream.endsWith('@aggTrade')) {
            // 체결 데이터 처리 (클라이언트에 'trade' 이벤트로 전송)
            this.eventsGateway.server.emit('trade', message.data);

            const markPrice = parseFloat(message.data.p);

            void this.handleLiquidationCheck(markPrice);
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('❌ Disconnected from Binance WebSocket. Reconnecting...');
      // 재연결 로직 (일정 시간 후 다시 connectToWebSocket 호출)
      setTimeout(() => this.connectToWebSocket(), 5000);
    });

    ws.on('error', (error) => {
      console.error('Binance WebSocket Error:', error);
    });
  }

  /**
   * [feat] 특정 심볼의 현재 시장가를 조회합니다.
   * @param symbol 조회할 심볼 (예: 'BTCUSDT')
   * @returns 현재 시장가 (숫자)
   */
  async getMarketPrice(symbol: string): Promise<number> {
    const url = `${this.baseURL}/fapi/v1/ticker/price`;
    try {
      const response$ = this.httpService
        .get(url, { params: { symbol } })
        .pipe(map((resp) => resp.data));

      const data = await firstValueFrom(response$);
      console.log(`Current market price for ${symbol}:`, data.price);
      // 바이낸스 API 응답: { "symbol": "BTCUSDT", "price": "50000.00", ... }
      return parseFloat(data.price);
    } catch (error) {
      this.logger.error(
        `Failed to fetch market price for ${symbol}:`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        `Failed to fetch market price for ${symbol}`,
      );
    }
  }

  /**
   * 특정 심볼의 현재 펀딩비율을 조회
   * @param symbol 조회할 심볼 (예: 'BTCUSDT')
   * @returns 현재 펀딩비율 (숫자)
   */
  async getFundingRate(symbol: string): Promise<number> {
    const url = `${this.baseURL}/fapi/v1/fundingRate`;
    try {
      const response$ = this.httpService
        .get(url, { params: { symbol } })
        .pipe(map((resp) => resp.data));
      const data = await firstValueFrom(response$);
      // API는 배열을 반환하므로, 해당 심볼의 데이터를 찾아야 합니다.
      const fundingRateInfo = data.find((item) => item.symbol === symbol);
      if (!fundingRateInfo) {
        throw new Error(`Funding rate for ${symbol} not found.`);
      }
      // fundingRate가 문자열이므로 숫자로 변환하여 반환
      return parseFloat(fundingRateInfo.fundingRate);
    } catch (error) {
      this.logger.error(
        `Failed to fetch funding rate for ${symbol}:`,
        error.message,
      );
      throw new InternalServerErrorException(
        `Failed to fetch funding rate for ${symbol}`,
      );
    }
  }
}
