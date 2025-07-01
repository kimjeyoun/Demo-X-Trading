// backend/src/users/entities/user.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' }) // 'users' 라는 이름의 테이블을 생성
export class User {
  @PrimaryGeneratedColumn('uuid') // UUID 형식의 기본 키
  id: string;

  @Column({ unique: true }) // 중복될 수 없는 값
  email: string;

  @Column()
  nickname: string;

  @Column({ select: false }) // 기본적으로 조회되지 않도록 설정
  password?: string;

  @CreateDateColumn() // 데이터 생성 시 자동으로 날짜 기록
  createdAt: Date;

  @UpdateDateColumn() // 데이터 업데이트 시 자동으로 날짜 기록
  updatedAt: Date;
}
