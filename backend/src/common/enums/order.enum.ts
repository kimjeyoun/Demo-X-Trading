// backend/src/common/enums/order.enum.ts

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
}

export enum OrderSide {
  BUY = 'BUY', // Long 포지션 진입 또는 Short 포지션 종료
  SELL = 'SELL', // Short 포지션 진입 또는 Long 포지션 종료
}

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export enum OrderStatus {
  NEW = 'NEW', // 체결 대기 (지정가)
  FILLED = 'FILLED', // 완전 체결
  CANCELED = 'CANCELED', // 취소
}
