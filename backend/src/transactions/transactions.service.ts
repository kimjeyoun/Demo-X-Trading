// backend/src/transactions/transactions.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // create 메소드 구현
  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const newTransaction =
      this.transactionRepository.create(createTransactionDto);
    return this.transactionRepository.save(newTransaction);
  }

  /**
   * 특정 사용자의 거래 내역을 페이지네이션하여 조회합니다.
   * 최근 3개월 데이터만 조회합니다.
   * @param userId 사용자 ID
   * @param pageOptionsDto 페이지네이션 옵션 (page, limit)
   * @returns 페이지네이션된 거래 내역과 메타 데이터
   */
  async findAllByUserId(userId: string, pageOptionsDto: PageOptionsDto) {
    const queryBuilder =
      this.transactionRepository.createQueryBuilder('transaction');

    queryBuilder
      .innerJoin('transaction.wallet', 'wallet')
      .where('wallet.userId = :userId', { userId })
      .andWhere('transaction.createdAt > DATE_SUB(NOW(), INTERVAL 3 MONTH)') // 최근 3개월 데이터
      .orderBy('transaction.createdAt', 'DESC') // 최신순 정렬
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, total] = await queryBuilder.getManyAndCount();

    return {
      data: entities,
      meta: {
        page: pageOptionsDto.page,
        limit: pageOptionsDto.limit,
        total,
        lastPage: Math.ceil(total / pageOptionsDto.limit),
      },
    };
  }
}
