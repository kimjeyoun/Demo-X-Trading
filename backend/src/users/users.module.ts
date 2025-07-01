// backend/src/users/users.module.ts

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // 1. TypeOrmModule 임포트
import { User } from './entities/user.entity'; // 2. User 엔티티 임포트

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 3. User 엔티티를 TypeOrmModule에 등록
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
