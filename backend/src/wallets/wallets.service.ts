import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
  ) {}

  /**
   * 사용자의 지갑을 생성합니다. (회원가입 시 호출됨)
   * @param user 새로 생성된 사용자 객체
   * @param initialBalance 초기 잔액
   * @returns 생성된 지갑 정보
   */
  async createWallet(user: User, initialBalance = 10000.0): Promise<Wallet> {
    const wallet = this.walletsRepository.create({
      user,
      balance: initialBalance,
    });
    return this.walletsRepository.save(wallet);
  }

  /**
   * 사용자의 잔고가 특정 금액 이상인지 확인합니다.
   * @param userId 사용자 ID
   * @param amount 필요한 금액
   * @returns 잔고가 충분하면 true, 아니면 false
   */
  async checkBalance(userId: string, amount: number): Promise<boolean> {
    const wallet = await this.findWalletByUserId(userId);
    return wallet.balance >= amount;
  }

  /**
   * 사용자의 지갑 잔고를 업데이트합니다.
   * @param userId 사용자 ID
   * @param amount 변경할 금액 (음수도 가능)
   * @returns 업데이트된 지갑 정보
   */
  async updateBalance(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.findWalletByUserId(userId);
    // TypeORM은 decimal 타입을 string으로 다룰 수 있으므로, 숫자형으로 변환 후 계산
    const newBalance = parseFloat(wallet.balance.toString()) + amount;

    wallet.balance = newBalance;
    return this.walletsRepository.save(wallet);
  }

  /**
   * 사용자 ID로 지갑을 찾는 내부 헬퍼 메소드
   * @param userId 사용자 ID
   * @returns 지갑 객체
   */
  async findWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!wallet) {
      throw new NotFoundException(
        `User ID ${userId}에 대한 지갑을 찾을 수 없습니다.`,
      );
    }
    return wallet;
  }
}
