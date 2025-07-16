// frontend/src/components/PositionStatus/index.tsx

import React from 'react';
import * as S from './styles';
import {type Position } from '../../services/orderService';

interface PositionStatusProps {
  positions: Position[];
  isLoading: boolean;
  error: string | null;
}

const PositionStatus: React.FC<PositionStatusProps> = ({ positions, isLoading, error }) => {
  if (isLoading) {
    return <S.Container>로딩 중...</S.Container>;
  }

  if (error) {
    return <S.Container>오류: {error}</S.Container>;
  }

  return (
    <S.Container>
      <S.Title>포지션 현황</S.Title>
      <S.Table>
        <thead>
          <tr>
            <th>종목</th>
            <th>방향</th>
            <th>수량</th>
            <th>진입가</th>
            <th>레버리지</th>
            {/* <th>미실현손익(PNL)</th> */}
          </tr>
        </thead>
        <tbody>
          {positions?.length > 0 ? (
            positions.map((pos) => (
              <tr key={pos.id}>
                <td>{pos.symbol}</td>
                <S.PositionSideCell side={pos.side}>{pos.side}</S.PositionSideCell>
                <td>{pos.quantity}</td>
                <td>{Number(pos.entryPrice).toFixed(2)}</td>
                <td>{pos.leverage}x</td>
                {/* <td>+12.34 USDT (2.45%)</td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>보유 중인 포지션이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </S.Table>
    </S.Container>
  );
};

export default PositionStatus;