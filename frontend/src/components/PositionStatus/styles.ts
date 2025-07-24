// frontend/src/components/PositionStatus/styles.ts

import styled from 'styled-components';

export const Container = styled.div`
  background-color: #1e222d;
  color: #f0f0f0;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #2a2e39;
  }

  th {
    font-size: 12px;
    color: #888;
    text-align: center;
  }

  td {
    text-align: center;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody td[colspan] {
    text-align: center;
    color: #888;
    padding: 20px;
  }
`;

export const PositionSideCell = styled.td<{ $side: 'LONG' | 'SHORT' }>`
  color: ${({ $side }) => ($side === 'LONG' ? '#089981' : '#f23645')};
  font-weight: bold;
`;

// PNL 셀 스타일 추가
export const PnlCell = styled.td<{ $isPositive: boolean }>`
  color: ${({ $isPositive }) => ($isPositive ? '#089981' : '#f23645')};
  font-weight: 500;
`;

export const CloseButton = styled.button`
  background-color: #373c4a;
  color: #d1d4dc;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #4a5060;
  }
`;