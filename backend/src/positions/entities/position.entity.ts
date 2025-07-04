// backend/src/positions/entities/position.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PositionSide } from '../../common/enums/order.enum';

@Entity({ name: 'positions' })
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  user: User;

  @Column()
  symbol: string;

  // side가 LONG이면, (현재가 - 진입가) * 수량으로 PNL을 계산
  // side가 SHORT이면, (진입가 - 현재가) * 수량으로 PNL을 계산
  @Column({ type: 'enum', enum: PositionSide })
  side: PositionSide;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  quantity: number; // 포지션 규모

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  entryPrice: number; // 진입 가격

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  liquidationPrice: number; // 청산 가격

  @Column({ type: 'int' })
  leverage: number; // 레버리지

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  margin: number; // 증거금 (실제 투입된 내 돈) = 담보

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
