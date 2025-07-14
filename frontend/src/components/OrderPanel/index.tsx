// frontend/src/components/OrderPanel/index.tsx

import { useState } from "react";
import * as S from "./styles";
import { createOrder } from '../../services/orderService'; 

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

  // 로딩 및 에러 상태 관리를 위한 상태 추가
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 현재는 시장가 주문만 구현
  const orderType = "MARKET";
  const symbol = "BTCUSDT"; // 지금은 BTCUSDT로 고정

  // 주문 제출 핸들러 (API 연동 전, 콘솔 출력)
  const handleSubmit = async () => {
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

        setIsLoading(true); // 로딩 시작
    setError(null); // 이전 에러 메시지 초기화

    try {
      // 실제 API 호출
      const response = await createOrder(payload);
      console.log('Order created successfully:', response);
      alert('주문이 성공적으로 체결되었습니다.');
      
      // 성공 시 입력 필드 초기화
      setQuantity('');

    } catch (err: unknown) {
      // 서비스에서 던진 에러를 잡아서 상태에 저장
      if (err instanceof Error) {
        setError(err.message);
        console.error(err.message);
        alert(`오류: ${err.message}`); // 사용자에게 오류 피드백
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false); // 로딩 종료 (성공/실패 모두)
    }

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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </S.InputGroup>

        <S.InfoGroup>
          <span>주문 가능 금액:</span>
          {/* TODO: 이슈 #10에서 실제 지갑 정보와 연동됩니다. */}
          <span>10000.00 USDT</span>
        </S.InfoGroup>
      </S.Form>

      {/* 에러 메시지 표시 영역 추가 */}
      {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

      <S.SubmitButton side={positionSide} onClick={handleSubmit} disabled={isLoading}>
        {/* 로딩 상태에 따라 버튼 텍스트 변경 */}
        {isLoading ? '주문 처리 중...' : (positionSide === 'BUY' ? '롱 포지션 진입' : '숏 포지션 진입')}
      </S.SubmitButton>
    </S.OrderPanelContainer>
  );
};

export default OrderPanel;
