// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity'; // User 엔티티 직접 임포트
import { BinanceModule } from './binance/binance.module';
import { EventsGateway } from './events/events.gateway';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // useFactory 함수의 반환 타입을 명시적으로 지정
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        // DB_PORT를 숫자로 명시적 변환
        port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        // entities 경로를 좀 더 안정적인 방식으로 수정
        // __dirname은 현재 파일이 있는 디렉토리 경로를 의미
        // entities: [__dirname + '/../**/*.entity{.ts,.js}'], // 이 방식은 가끔 문제를 일으킴

        // entities를 직접 지정하는 방식으로 변경하여 안정성 확보
        entities: [User], // User 엔티티를 직접 임포트해서 사용

        // synchronize는 개발 환경에서만 true로 설정해야 합니다.
        // process.env.NODE_ENV가 'production'이 아닐 때만 true가 되도록 설정
        synchronize: process.env.NODE_ENV !== 'production',

        // 로깅 추가 (디버깅에 유용)
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),

    UsersModule,
    AuthModule,
    BinanceModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
