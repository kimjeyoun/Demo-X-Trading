// backend/src/orders/entities/order.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import {
  OrderSide,
  OrderStatus,
  OrderType,
} from '../../common/enums/order.enum';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User(1) : Order(N) 관계 설정
  // "한 명의 사용자(User)는 여러 개의 주문(Order)을 할 수 있다"는 관계
  // eager : 기본적으로 주문 정보를 조회할 때마다 연결된 사용자 정보 전체를 항상 같이 불러오지는 않겠다는 설정
  @ManyToOne(() => User, (user) => user.id, { eager: false })
  user: User;

  @Column()
  symbol: string; // 예: BTCUSDT

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({ type: 'enum', enum: OrderSide })
  side: OrderSide;

  // decimal 타입은 소수점을 매우 정확하게 저장 금융계산에서 오류 방지
  @Column({ type: 'decimal', precision: 20, scale: 10, default: 0.0 })
  price: number; // 주문 가격 (시장가 주문 시 0)

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  quantity: number; // 주문 수량

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus; // NEW, FILLED, CANCELED

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
