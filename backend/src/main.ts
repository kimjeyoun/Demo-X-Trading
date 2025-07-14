// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // ValidationPipe import 추가

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORS 설정 추가 ---
  app.enableCors({
    origin: 'http://localhost:5173', // 프론트엔드 주소만 명시적으로 허용
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 전역 ValidationPipe 추가 (DTO 유효성 검사를 위해)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 자동으로 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성이 들어오면 에러 발생
      transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
    }),
  );
  // 포트 번호를 .env에서 가져오도록 수정
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`); // 실행 포트 로그 추가
}
void bootstrap();
