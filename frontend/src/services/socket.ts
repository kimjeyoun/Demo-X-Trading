// frontend/src/services/socket.ts

import { io, Socket } from 'socket.io-client';

const URL = 'http://localhost:3001'; // 백엔드 서버 주소

export const socket: Socket = io(URL, {
  autoConnect: false, // 필요할 때 수동으로 연결하도록 설정
});