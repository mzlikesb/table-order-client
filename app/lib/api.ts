import type {
  MenuItem,
  Order,
  CreateOrderRequest,
  OrderStatus,
  Call,
  CreateCallRequest,
  CallStatus,
  Table,
  TableStatus,
  ApiResponse
} from '../types/api';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api'; // 백엔드 서버 URL

// 메뉴 관련 API
export const menuApi = {
  // 고객용 메뉴 목록 조회
  getMenus: async (): Promise<ApiResponse<MenuItem[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '메뉴 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 관리자용 메뉴 목록 조회 (품절 포함)
  getAdminMenus: async (): Promise<ApiResponse<MenuItem[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/menus`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '메뉴 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 메뉴 추가
  createMenu: async (menuData: Omit<MenuItem, 'id'>): Promise<ApiResponse<MenuItem>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuData),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '메뉴 추가에 실패했습니다.' };
    }
  },

  // 메뉴 수정
  updateMenu: async (id: string, menuData: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuData),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '메뉴 수정에 실패했습니다.' };
    }
  },

  // 메뉴 품절 상태 변경
  toggleAvailability: async (id: string): Promise<ApiResponse<MenuItem>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/menus/${id}/availability`, {
        method: 'PATCH',
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '메뉴 상태 변경에 실패했습니다.' };
    }
  },

  // 메뉴 삭제
  deleteMenu: async (id: string): Promise<ApiResponse<void>> => {
    try {
      await fetch(`${API_BASE_URL}/admin/menus/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: '메뉴 삭제에 실패했습니다.' };
    }
  },
};

// 주문 관련 API
export const orderApi = {
  // 주문 생성
  createOrder: async (orderData: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 생성에 실패했습니다.' };
    }
  },

  // 테이블별 주문 내역 조회
  getTableOrders: async (tableId: string): Promise<ApiResponse<Order[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/table/${tableId}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 내역을 불러오는데 실패했습니다.' };
    }
  },

  // 고객 주문 취소
  cancelOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 취소에 실패했습니다.' };
    }
  },

  // 관리자용 주문 목록 조회
  getAdminOrders: async (): Promise<ApiResponse<Order[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 주문 상태 변경
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 상태 변경에 실패했습니다.' };
    }
  },

  // 관리자 주문 강제 취소
  adminCancelOrder: async (orderId: string, reason?: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 취소에 실패했습니다.' };
    }
  },
};

// 호출 관련 API
export const callApi = {
  // 호출 생성
  createCall: async (callData: CreateCallRequest): Promise<ApiResponse<Call>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callData),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '호출 생성에 실패했습니다.' };
    }
  },

  // 관리자용 호출 목록 조회
  getAdminCalls: async (): Promise<ApiResponse<Call[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/calls`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '호출 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 호출 상태 변경
  updateCallStatus: async (callId: string, status: CallStatus): Promise<ApiResponse<Call>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/calls/${callId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '호출 상태 변경에 실패했습니다.' };
    }
  },
};

// 테이블 관련 API
export const tableApi = {
  // 테이블 목록 조회
  getTables: async (): Promise<ApiResponse<Table[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '테이블 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 테이블 상세 정보 조회
  getTable: async (tableId: string): Promise<ApiResponse<Table>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '테이블 정보를 불러오는데 실패했습니다.' };
    }
  },

  // 테이블 상태 변경
  updateTableStatus: async (tableId: string, status: TableStatus): Promise<ApiResponse<Table>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '테이블 상태 변경에 실패했습니다.' };
    }
  },
}; 