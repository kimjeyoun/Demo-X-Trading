// frontend/src/pages/TradingPage.tsx

import styled from "styled-components";
import { TradingChart } from "../components/TradingChart";
import OrderPanel from "../components/OrderPanel";

const TradingPageContainer = styled.div`
  display: grid;
  grid-template-areas:
    "chart order-panel"
    "chart order-book";
  grid-template-columns: 3fr 1fr; /* 차트가 3, 오른쪽 패널이 1의 비율 */
  grid-template-rows: 1fr 1fr;
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

export const TradingPage = () => {
  return (
    <TradingPageContainer>
      <ChartContainer>
        <TradingChart />
      </ChartContainer>
      <OrderPanelContainer>
        <OrderPanel />
      </OrderPanelContainer>
      <OrderBookContainer>호가창</OrderBookContainer>
    </TradingPageContainer>
  );
};
