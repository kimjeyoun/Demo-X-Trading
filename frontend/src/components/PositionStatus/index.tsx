// frontend/src/components/PositionStatus/index.tsx

import React from "react";
import * as S from "./styles";
import { type Position, closePosition } from "../../services/orderService";

interface PositionStatusProps {
  positions: Position[];
  isLoading: boolean;
  error: string | null;
  markPrice: number;
  onPositionClosed: () => void;
}

const PositionStatus: React.FC<PositionStatusProps> = ({
  positions,
  isLoading,
  error,
  markPrice,
  onPositionClosed,
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

  const handleClosePosition = async (positionId: string) => {
    if (!window.confirm("정말로 포지션을 종료하시겠습니까?")) {
      return;
    }
    try {
      await closePosition(positionId);
      alert("포지션이 성공적으로 종료되었습니다.");
      onPositionClosed(); // 부모 컴포넌트에 포지션 종료 사실을 알림
    } catch (err: unknown) {
      let message;
      if (err instanceof Error) message = err.message;

      alert(`${message || "알 수 없는 오류"}`);
    }
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
            <th>현재가</th>
            <th>청산가</th>
            <th>미실현손익(PNL)</th>
            <th>레버리지</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {positions?.length > 0 ? (
            positions.map((pos) => {
              const { pnl, pnlPercent } = calculatePnl(pos);
              return (
                <tr key={pos.id}>
                  <td>{pos.symbol}</td>
                  <S.PositionSideCell $side={pos.side}>
                    {pos.side}
                  </S.PositionSideCell>
                  <td>{Number(pos.quantity).toFixed(8)}</td>
                  <td>{Number(pos.entryPrice).toFixed(2)}</td>
                  {/* '현재가'와 '청산가' 컬럼을 명시적으로 추가 */}
                  <td>{markPrice.toFixed(2)}</td>
                  <td>{Number(pos.liquidationPrice).toFixed(2)}</td>
                  {/* PNL 셀 */}
                  <S.PnlCell $isPositive={Number(pnl) >= 0}>
                    {pnl} USDT ({pnlPercent}%)
                  </S.PnlCell>
                  <td>{pos.leverage}x</td>
                  <td>
                    <S.CloseButton onClick={() => handleClosePosition(pos.id)}>
                      종료
                    </S.CloseButton>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={9}>보유 중인 포지션이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </S.Table>
    </S.Container>
  );
};

export default PositionStatus;
