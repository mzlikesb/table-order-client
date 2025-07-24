import { io, Socket } from 'socket.io-client';

// Socket.IO 클라이언트 인스턴스
let socket: Socket | null = null;

// Socket.IO 연결 초기화
export const initSocket = () => {
  if (!socket) {
    socket = io('http://dongyo.synology.me:14000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // 연결 이벤트
    socket.on('connect', () => {
      console.log('Socket.IO 연결됨:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO 연결 해제');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO 연결 오류:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO 재연결됨:', attemptNumber);
    });
  }
  return socket;
};

// Socket.IO 인스턴스 가져오기
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// 직원용 룸 참가
export const joinStaffRoom = () => {
  const socket = getSocket();
  socket.emit('join-staff');
  console.log('직원용 룸에 참가');
};

// 테이블별 룸 참가
export const joinTableRoom = (tableId: string) => {
  const socket = getSocket();
  socket.emit('join-table', tableId);
  console.log(`테이블 ${tableId} 룸에 참가`);
};

// Socket.IO 연결 해제
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket.IO 연결 해제됨');
  }
};

// 이벤트 리스너 타입
export type SocketEventListener = (data: any) => void;

// 이벤트 리스너 등록
export const onOrderUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('order-updated', callback);
};

export const onCallUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('call-updated', callback);
};

export const onMenuUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('menu-updated', callback);
};

export const onTableUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('table-updated', callback);
};

// 이벤트 리스너 제거
export const offOrderUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('order-updated', callback);
};

export const offCallUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('call-updated', callback);
};

export const offMenuUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('menu-updated', callback);
};

export const offTableUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('table-updated', callback);
}; 