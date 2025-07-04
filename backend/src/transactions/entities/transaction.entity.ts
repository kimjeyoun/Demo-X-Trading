// backend/src/transactions/entities/transaction.entity.ts
// 모든 '돈'의 흐름을 기록하는 매우 중요한 장부
// Wallet(지갑)의 잔고가 왜, 얼마만큼 변했는지에 대한 모든 역사를 추적하는 역할

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT', // 입금
  WITHDRAW = 'WITHDRAW', // 출금
  REALIZED_PNL = 'REALIZED_PNL', // 실현 손익
  FEE = 'FEE', // 수수료
}

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // "하나의 지갑(Wallet)에는 여러 개의 거래 내역(Transaction)이 있을 수 있다"는 관계
  @ManyToOne(() => Wallet, (wallet) => wallet.id)
  wallet: Wallet;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
