// frontend/src/pages/TradingPage.tsx

import { useEffect, useState } from "react";
import styled from "styled-components";
import { TradingChart } from "../components/TradingChart";
import OrderPanel from "../components/OrderPanel";
import PositionStatus from "../components/PositionStatus";
import {
  getMyPositions,
  getMyWallet,
  type Position,
  type Wallet,
} from "../services/orderService";
import { socket } from '../services/socket';

const TradingPageContainer = styled.div`
  display: grid;
  grid-template-areas:
    "chart order-panel"
    "chart order-book"
    "positions positions";
  grid-template-columns: 3fr 1fr; /* 차트가 3, 오른쪽 패널이 1의 비율 */
  grid-template-rows: 1fr 1fr auto; /* 3번째 행 크기 자동 조절 */
  height: 95vh;
  width: 100%;
  background-color: #131722;
  color: #d1d4dc;
  gap: 8px;
  padding: 8px;
  box-sizing: border-box; /* padding이 크기에 포함되도록 함 */
`;

const ChartContainer = styled.div`
  grid-area: chart;
  background-color: #1e222d;
`;

const OrderPanelContainer = styled.div`
  grid-area: order-panel;
  background-color: #1e222d;
`;

const OrderBookContainer = styled.div`
  grid-area: order-book;
  background-color: #1e222d;
`;

const PositionStatusContainer = styled.div`
  grid-area: positions;
  background-color: #1e222d;
  min-height: 150px; /* 최소 높이 지정 */
`;

// Binance WebSocket 'trade' 이벤트의 데이터 타입
interface TradeData {
  p: string; // Price
  // ... 다른 속성들
}

export const TradingPage = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null); // wallet 상태 추가
  const [markPrice, setMarkPrice] = useState<number>(0); // 실시간 현재가(Mark Price) 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const data = await getMyPositions();
      setPositions(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const data = await getMyWallet();
      setWallet(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("지갑 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  // 주문 성공 시, 포지션과 지갑 정보를 모두 다시 불러옵니다.
  const handleOrderSuccess = async () => {
    await Promise.all([fetchPositions(), fetchWallet()]);
  };

  // 최초 로딩 시, 포지션과 지갑 정보를 병렬로 가져옵니다.
  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await Promise.all([fetchPositions(), fetchWallet()]);
      setIsLoading(false);
    };

    initialFetch();

    // WebSocket 연결 및 이벤트 핸들러 등록
    socket.connect();
    const handleTrade = (trade: TradeData) => {
      setMarkPrice(parseFloat(trade.p));
    };
    socket.on('trade', handleTrade); // 'trade' 이벤트 구독

    // 컴포넌트 언마운트 시 클린업
    return () => {
      socket.off('trade', handleTrade);
      socket.disconnect();
    };
  }, []);

  return (
    <TradingPageContainer>
      <ChartContainer>
        <TradingChart />
      </ChartContainer>
      <OrderPanelContainer>
        <OrderPanel wallet={wallet} onOrderSuccess={handleOrderSuccess} />
      </OrderPanelContainer>
      <OrderBookContainer>호가창</OrderBookContainer>
      <PositionStatusContainer>
        <PositionStatus
          positions={positions}
          isLoading={isLoading}
          error={error}
          markPrice={markPrice}
          onPositionClosed={handleOrderSuccess}
        />
      </PositionStatusContainer>
    </TradingPageContainer>
  );
};
