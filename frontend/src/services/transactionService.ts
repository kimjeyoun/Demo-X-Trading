// frontend/src/services/transactionService.ts
import apiClient from './api';
import { type Wallet } from './orderService'; // Wallet 타입 재사용

export const TransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  REALIZED_PNL: 'REALIZED_PNL',
  FEE: 'FEE',
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export interface Transaction {
  id: string;
  wallet: Wallet;
  type: TransactionType;
  amount: number;
  createdAt: string;
  // 백엔드 엔티티에 상세 내용 컬럼 추가 시 반영
  // details: string; 
}

interface PageMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: PageMeta;
}

/**
 * 거래 내역을 페이지네이션하여 가져옵니다.
 * @param page 페이지 번호
 * @param limit 페이지당 항목 수
 */
export const getMyTransactions = async (page = 1, limit = 20): Promise<PaginatedTransactions> => {
  try {
    const response = await apiClient.get<PaginatedTransactions>('/transactions', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    // Axios 에러 처리 (orderService.ts와 동일한 패턴 사용)
    console.error("Failed to fetch transactions:", error);
    throw new Error('거래 내역을 불러오는데 실패했습니다.');
  }
};