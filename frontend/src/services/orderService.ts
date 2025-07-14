// frontend/src/services/orderService.ts

import axios from "axios";
import apiClient from "./api";

// 백엔드의 CreateOrderDto와 타입을 맞춥니다.
export interface OrderPayload {
  symbol: string;
  type: "MARKET" | "LIMIT";
  side: "BUY" | "SELL";
  quantity: number;
  leverage: number;
  price?: number;
}

// 백엔드의 응답 데이터 타입을 정의합니다. (실제 응답에 맞게 수정 필요)
interface OrderResponse {
  order: {
    id: string;
    // ... 기타 주문 정보
  };
  position: {
    id: string;
    // ... 기타 포지션 정보
  };
}

/**
 * 신규 주문을 생성합니다.
 * @param orderData 주문 생성에 필요한 데이터
 * @returns 생성된 주문 및 포지션 정보
 */
export const createOrder = async (
  orderData: OrderPayload
): Promise<OrderResponse> => {
  try {
    const response = await apiClient.post<OrderResponse>("/orders", orderData);
    return response.data;
  } catch (error) {
    // Axios 에러 객체에서 더 구체적인 오류 메시지를 추출합니다.
    if (axios.isAxiosError(error) && error.response) {
      console.error("Order creation failed:", error.response.data);
      // 서버에서 보낸 에러 메시지를 그대로 던져서 UI단에서 처리할 수 있게 합니다.
      throw new Error(
        error.response.data.message || "주문 생성에 실패했습니다."
      );
    }
    console.error("An unexpected error occurred:", error);
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};
