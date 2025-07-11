// frontend/src/components/OrderPanel/index.tsx

import { useState } from "react";
import * as S from "./styles";

// 나중에 API 서비스를 통해 가져올 타입들 (임시 정의)
interface OrderPayload {
  symbol: string;
  type: "MARKET" | "LIMIT";
  side: "BUY" | "SELL";
  quantity: number;
  leverage: number;
  price?: number; // 지정가 주문을 위해 옵셔널
}

const OrderPanel = () => {
  // 'BUY'(롱) 또는 'SELL'(숏)을 관리하는 상태
  const [positionSide, setPositionSide] = useState<"BUY" | "SELL">("BUY");
  // 수량 입력 (BTC)
  const [quantity, setQuantity] = useState("");
  // 레버리지
  const [leverage, setLeverage] = useState(1);
  // 현재는 시장가 주문만 구현
  const orderType = "MARKET";
  const symbol = "BTCUSDT"; // 지금은 BTCUSDT로 고정

  // 주문 제출 핸들러 (API 연동 전, 콘솔 출력)
  const handleSubmit = () => {
    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      alert("정확한 수량을 입력해주세요.");
      return;
    }

    const payload: OrderPayload = {
      symbol,
      type: orderType,
      side: positionSide,
      quantity: numQuantity,
      leverage: leverage,
    };

    // TODO: Step 3에서 실제 API 연동 로직으로 교체될 부분입니다.
    console.log("Submitting Order:", payload);
    alert(`주문 제출: ${JSON.stringify(payload)}`);
  };

  return (
    <S.OrderPanelContainer>
      <S.TabWrapper>
        <S.TabButton
          active={positionSide === "BUY"}
          onClick={() => setPositionSide("BUY")}
        >
          롱 (매수)
        </S.TabButton>
        <S.TabButton
          active={positionSide === "SELL"}
          onClick={() => setPositionSide("SELL")}
        >
          숏 (매도)
        </S.TabButton>
      </S.TabWrapper>

      <S.Form>
        <S.InputGroup>
          <label htmlFor="leverage">레버리지 ({leverage}x)</label>
          <S.LeverageSlider
            type="range"
            id="leverage"
            min="1"
            max="50"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
          />
        </S.InputGroup>

        <S.InputGroup>
          <label htmlFor="quantity">수량 ({symbol.replace("USDT", "")})</label>
          <S.Input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
          />
        </S.InputGroup>

        <S.InfoGroup>
          <span>주문 가능 금액:</span>
          {/* TODO: 이슈 #10에서 실제 지갑 정보와 연동됩니다. */}
          <span>10000.00 USDT</span>
        </S.InfoGroup>
      </S.Form>

      <S.SubmitButton side={positionSide} onClick={handleSubmit}>
        {positionSide === "BUY" ? "롱 포지션 진입" : "숏 포지션 진입"}
      </S.SubmitButton>
    </S.OrderPanelContainer>
  );
};

export default OrderPanel;
