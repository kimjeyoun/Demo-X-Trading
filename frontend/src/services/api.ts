// frontend/src/services/api.ts

import axios from "axios";

const API_BASE_URL = "http://localhost:3001"; // 백엔드 서버 주소

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 설정 (API 요청을 보내기 전에 실행)
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지 등에서 JWT 토큰을 가져옵니다.
    // TODO: 로그인 기능 구현 후 실제 토큰으로 교체해야 합니다.
    const token = localStorage.getItem("accessToken");

    if (token) {
      // 토큰이 있으면 Authorization 헤더에 Bearer 토큰을 추가합니다.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
