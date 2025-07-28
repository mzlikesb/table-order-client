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
      withCredentials: true, // 보안 미들웨어 지원
    });

    // 연결 이벤트
    socket.on('connect', () => {
      console.log('Socket.IO 연결됨:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO 연결 해제:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO 연결 오류:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO 재연결됨:', attemptNumber);
    });

    // 서버 에러 핸들링
    socket.on('error', (error) => {
      console.error('Socket.IO 서버 에러:', error);
    });

    // 연결 상태 확인 (ping/pong)
    socket.on('pong', (data) => {
      console.log('서버 응답:', data);
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

// 직원용 룸 참가 (기존 호환성 유지)
export const joinStaffRoom = () => {
  const socket = getSocket();
  socket.emit('join-staff');
  console.log('직원용 룸에 참가');
};

// 스토어별 직원용 룸 참가 (권장 - 부하 최적화)
export const joinStaffStoreRoom = (storeId: string) => {
  const socket = getSocket();
  socket.emit('join-staff-store', storeId);
  console.log(`스토어 ${storeId} 직원용 룸에 참가`);
};

// 테이블별 룸 참가
export const joinTableRoom = (tableId: string) => {
  const socket = getSocket();
  socket.emit('join-table', tableId);
  console.log(`테이블 ${tableId} 룸에 참가`);
};

// 연결 상태 확인
export const pingServer = () => {
  const socket = getSocket();
  socket.emit('ping');
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

// 새로운 서버 이벤트 리스너 등록
export const onNewOrder = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('new-order', callback);
};

export const onOrderStatusChanged = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('order-status-changed', callback);
};

export const onNewCall = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('new-call', callback);
};

export const onCallStatusChanged = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('call-status-changed', callback);
};

export const onTableStatusChanged = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('table-status-changed', callback);
};

// 기존 이벤트 리스너 (호환성 유지)
export const onOrderUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('order-updated', callback);
  // 새로운 이벤트도 함께 등록
  socket.on('new-order', callback);
  socket.on('order-status-changed', callback);
};

export const onCallUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('call-updated', callback);
  // 새로운 이벤트도 함께 등록
  socket.on('new-call', callback);
  socket.on('call-status-changed', callback);
};

export const onMenuUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('menu-updated', callback);
};

export const onTableUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.on('table-updated', callback);
  // 새로운 이벤트도 함께 등록
  socket.on('table-status-changed', callback);
};

// 이벤트 리스너 제거
export const offNewOrder = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('new-order', callback);
};

export const offOrderStatusChanged = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('order-status-changed', callback);
};

export const offNewCall = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('new-call', callback);
};

export const offCallStatusChanged = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('call-status-changed', callback);
};

export const offTableStatusChanged = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('table-status-changed', callback);
};

// 기존 이벤트 리스너 제거 (호환성 유지)
export const offOrderUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('order-updated', callback);
  socket.off('new-order', callback);
  socket.off('order-status-changed', callback);
};

export const offCallUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('call-updated', callback);
  socket.off('new-call', callback);
  socket.off('call-status-changed', callback);
};

export const offMenuUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('menu-updated', callback);
};

export const offTableUpdate = (callback: SocketEventListener) => {
  const socket = getSocket();
  socket.off('table-updated', callback);
  socket.off('table-status-changed', callback);
}; 