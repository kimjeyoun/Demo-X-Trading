// frontend/src/components/PositionStatus/index.tsx

import React from "react";
import * as S from "./styles";
import { type Position } from "../../services/orderService";

interface PositionStatusProps {
  positions: Position[];
  isLoading: boolean;
  error: string | null;
  markPrice: number;
}

const PositionStatus: React.FC<PositionStatusProps> = ({
  positions,
  isLoading,
  error,
  markPrice,
}) => {
  // PNL 계산 함수
  const calculatePnl = (position: Position) => {
    if (!markPrice) return { pnl: 0, pnlPercent: 0 };

    const entryPrice = Number(position.entryPrice);
    const quantity = Number(position.quantity);
    const margin = Number(position.margin);

    let pnl = 0;
    if (position.side === "LONG") {
      pnl = (markPrice - entryPrice) * quantity;
    } else {
      // SHORT
      pnl = (entryPrice - markPrice) * quantity;
    }

    const pnlPercent = (pnl / margin) * 100;

    return { pnl: pnl.toFixed(2), pnlPercent: pnlPercent.toFixed(2) };
  };

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
            positions.map((pos) => {
              const { pnl, pnlPercent } = calculatePnl(pos);
              return (
                <tr key={pos.id}>
                  <td>{pos.symbol}</td>
                  <S.PositionSideCell side={pos.side}>
                    {pos.side}
                  </S.PositionSideCell>
                  <td>{pos.quantity}</td>
                  <td>{Number(pos.entryPrice).toFixed(2)}</td>
                  <td>{markPrice.toFixed(2)}</td>
                  <S.PnlCell isPositive={Number(pnl) >= 0}>
                    {pnl} USDT ({pnlPercent}%)
                  </S.PnlCell>
                  <td>{pos.leverage}x</td>
                  {/* <td>+12.34 USDT (2.45%)</td> */}
                </tr>
              );
            })
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
