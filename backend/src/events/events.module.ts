// backend/src/events/events.module.ts

import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway], // 👈 --- 이 줄을 추가하세요! ---
})
export class EventsModule {}
