// backend/src/wallets/entities/wallet.entity.ts

import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User(1) : Wallet(1) 관계 설정
  @OneToOne(() => User, { eager: false })
  @JoinColumn() // JoinColumn은 OneToOne 관계에서 주인이 되는 쪽에 붙임
  user: User;

  @Column({ type: 'decimal', precision: 20, scale: 4, default: 0.0 })
  balance: number; // 지갑 잔액
}
