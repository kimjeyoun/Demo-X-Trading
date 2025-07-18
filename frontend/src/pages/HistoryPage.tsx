// frontend/src/pages/HistoryPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { getMyTransactions, type Transaction } from '../services/transactionService';

const HistoryPageContainer = styled.div`
  padding: 24px;
  background-color: #131722;
  color: #d1d4dc;
  height: 100%;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 24px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #2a2e39;
  }
  th {
    color: #848e9c;
    font-size: 14px;
  }
  td {
    font-size: 14px;
  }
`;

const Loader = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
`;

// 금액에 따라 색상을 다르게 표시하는 컴포넌트
const AmountCell = styled.td<{ $isPositive: boolean }>`
  color: ${({ $isPositive }) => ($isPositive ? '#0ecb81' : '#f6465d')};
`;

export const HistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchTransactions = useCallback(async (pageNum: number) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const { data, meta } = await getMyTransactions(pageNum);
      setTransactions(prev => {
          const allData = [...prev, ...data];
          const uniqueIds = new Set();
          return allData.filter(item => {
              if (uniqueIds.has(item.id)) {
                  return false;
              } else {
                  uniqueIds.add(item.id);
                  return true;
              }
          });
      });
      setHasMore(meta.page < meta.lastPage);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  // 페이지 번호가 변경될 때만 추가 데이터를 가져오도록 useEffect 분리
  useEffect(() => {
    // 1페이지가 아닌 경우에만 실행 (초기 로딩은 아래 useEffect에서 처리)
    if (page > 1) {
      fetchTransactions(page);
    }
  }, [page]); // page가 변경될 때만 실행

// 컴포넌트가 처음 마운트될 때 초기 데이터 로딩
  useEffect(() => {
    setTransactions([]); // 페이지 재진입 시 초기화
    setPage(1);
    setHasMore(true);
    fetchTransactions(1);
  }, []); // 의존성 배열을 비워 최초 1회만 실행

  const lastTransactionElementRef = useCallback((node: HTMLTableRowElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);
  
  return (
    <HistoryPageContainer>
      <Title>거래 내역</Title>
      <Table>
        <thead>
          <tr>
            <th>시간</th>
            <th>종류</th>
            <th>금액</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => {
            const isLastElement = transactions.length === index + 1;
            const amountAsNumber = Number(tx.amount); // 숫자로 변환
            return (
              <tr key={tx.id} ref={isLastElement ? lastTransactionElementRef : null}>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
                <td>{tx.type}</td>
                <AmountCell $isPositive={tx.amount >= 0}>
                  {amountAsNumber > 0 ? '+' : ''}{amountAsNumber.toFixed(4)} USDT
                </AmountCell>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {isLoading && <Loader>로딩 중...</Loader>}
      {!isLoading && !hasMore && transactions.length > 0 && <Loader>더 이상 내역이 없습니다.</Loader>}
      {!isLoading && transactions.length === 0 && <Loader>거래 내역이 없습니다.</Loader>}
    </HistoryPageContainer>
  );
};