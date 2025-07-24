import type {
  MenuItem,
  Order,
  CreateOrderRequest,
  OrderStatus,
  Call,
  CreateCallRequest,
  CallStatus,
  CallType,
  Table,
  TableStatus,
  ApiResponse
} from '../types/api';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api'; // 백엔드 서버 URL

// 서버 응답 데이터를 클라이언트 타입으로 변환하는 함수
const transformServerMenuItem = (serverData: any): MenuItem => {
  return {
    id: serverData.id,
    name: serverData.name,
    price: serverData.price,
    image: serverData.image_url,
    description: serverData.description,
    category: serverData.category,
    isAvailable: serverData.is_available,
    createdAt: serverData.created_at,
    updatedAt: serverData.updated_at
  };
};

// 서버 응답 데이터를 클라이언트 Call 타입으로 변환하는 함수
const transformServerCall = (serverData: any): Call => {
  // 서버 상태를 클라이언트 상태로 변환
  const transformStatus = (serverStatus: string): CallStatus => {
    switch (serverStatus) {
      case 'waiting': return 'pending';
      case 'processing': return 'pending';
      case 'completed': return 'completed';
      case 'cancelled': return 'completed';
      default: return 'pending';
    }
  };

  return {
    id: serverData.id,
    tableId: serverData.table_id,
    type: serverData.request_content as CallType, // request_content를 type으로 변환
    status: transformStatus(serverData.status), // 서버 상태를 클라이언트 상태로 변환
    message: serverData.request_content, // request_content를 message로도 사용
    createdAt: serverData.created_at,
    updatedAt: serverData.updated_at || serverData.created_at,
    completedAt: serverData.completed_at
  };
};

// 서버 응답 데이터를 클라이언트 Table 타입으로 변환하는 함수
const transformServerTable = (serverData: any): Table => {
  return {
    id: serverData.id,
    number: parseInt(serverData.table_number, 10),
    status: serverData.status as TableStatus,
    capacity: serverData.capacity || 4, // 기본값 4
    currentOrderCount: serverData.current_order_count || 0,
    createdAt: serverData.created_at,
    updatedAt: serverData.updated_at
  };
};

// 메뉴 관련 API
export const menuApi = {
  // 고객용 메뉴 목록 조회
  getMenus: async (): Promise<ApiResponse<MenuItem[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus`);
      const data = await response.json();
      return { success: true, data: data.map((menu: any) => transformServerMenuItem(menu)) };
    } catch (error) {
      return { success: false, error: '메뉴 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 관리자용 메뉴 목록 조회 (품절 포함)
  getAdminMenus: async (): Promise<ApiResponse<MenuItem[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/menus`);
      const data = await response.json();
      return { success: true, data: data.map(transformServerMenuItem) };
    } catch (error) {
      return { success: false, error: '메뉴 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 메뉴 추가
  createMenu: async (menuData: Omit<MenuItem, 'id'>): Promise<ApiResponse<MenuItem>> => {
    try {
      // 서버 API와 맞는 필드명으로 변환
      const serverData = {
        name: menuData.name,
        price: menuData.price,
        category: menuData.category,
        image_url: menuData.image,
        is_available: menuData.isAvailable
      };

      const response = await fetch(`${API_BASE_URL}/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '메뉴 추가에 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data: transformServerMenuItem(data) };
    } catch (error) {
      return { success: false, error: '메뉴 추가에 실패했습니다.' };
    }
  },

  // 메뉴 수정
  updateMenu: async (id: string, menuData: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> => {
    try {
      // 서버 API와 맞는 필드명으로 변환
      const serverData: any = {};
      if (menuData.name !== undefined) serverData.name = menuData.name;
      if (menuData.price !== undefined) serverData.price = menuData.price;
      if (menuData.category !== undefined) serverData.category = menuData.category;
      if (menuData.image !== undefined) serverData.image_url = menuData.image;
      if (menuData.isAvailable !== undefined) serverData.is_available = menuData.isAvailable;

      const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '메뉴 수정에 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data: transformServerMenuItem(data) };
    } catch (error) {
      console.error('메뉴 수정 네트워크 에러:', error);
      return { success: false, error: '메뉴 수정에 실패했습니다.' };
    }
  },

  // 메뉴 삭제
  deleteMenu: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '메뉴 삭제에 실패했습니다.' };
      }
      
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
      // 테이블 번호를 숫자로 변환 시도
      const tableIdNumber = parseInt(callData.tableId);
      const isTableIdNumber = !isNaN(tableIdNumber);

      // 서버가 기대하는 형식으로 데이터 변환
      const serverCallData = {
        table_id: isTableIdNumber ? tableIdNumber : 1, // 숫자로 변환 가능하면 숫자, 아니면 기본값 1
        request_content: callData.type // type을 request_content로 변환
      };

      console.log('호출 생성 요청:', callData);
      console.log('호출 생성 요청 (서버):', serverCallData);
      console.log('테이블 ID 변환:', { original: callData.tableId, converted: serverCallData.table_id, isNumber: isTableIdNumber });
      
      const response = await fetch(`${API_BASE_URL}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverCallData),
      });

      console.log('호출 생성 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('호출 생성 서버 에러:', errorData);
        return { success: false, error: errorData.error || errorData.message || '호출 생성에 실패했습니다.' };
      }

      const data = await response.json();
      console.log('호출 생성 성공:', data);
      return { success: true, data: transformServerCall(data) };
    } catch (error) {
      console.error('호출 생성 네트워크 에러:', error);
      return { success: false, error: '호출 생성에 실패했습니다.' };
    }
  },

  // 관리자용 호출 목록 조회
  getAdminCalls: async (): Promise<ApiResponse<Call[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/calls`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('호출 목록 조회 서버 에러:', errorData);
        return { success: false, error: errorData.error || '호출 목록을 불러오는데 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data: data.map(transformServerCall) };
    } catch (error) {
      console.error('호출 목록 조회 네트워크 에러:', error);
      return { success: false, error: '호출 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 호출 상태 변경
  updateCallStatus: async (callId: string, status: CallStatus): Promise<ApiResponse<Call>> => {
    try {
      // 클라이언트 상태를 서버 상태로 변환
      const transformToServerStatus = (clientStatus: CallStatus): string => {
        switch (clientStatus) {
          case 'pending': return 'waiting';
          case 'completed': return 'completed';
          default: return 'waiting';
        }
      };

      const serverStatus = transformToServerStatus(status);

      console.log('호출 상태 변경 요청:', { callId, clientStatus: status, serverStatus });
      
      const response = await fetch(`${API_BASE_URL}/calls/${callId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: serverStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('호출 상태 변경 서버 에러:', errorData);
        return { success: false, error: errorData.error || '호출 상태 변경에 실패했습니다.' };
      }

      const data = await response.json();
      return { success: true, data: transformServerCall(data) };
    } catch (error) {
      console.error('호출 상태 변경 네트워크 에러:', error);
      return { success: false, error: '호출 상태 변경에 실패했습니다.' };
    }
  },

  // 테이블별 호출 목록 조회
  getTableCalls: async (tableId: string): Promise<ApiResponse<Call[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/table/${tableId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('테이블별 호출 조회 서버 에러:', errorData);
        return { success: false, error: errorData.error || '테이블별 호출을 불러오는데 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data: data.map(transformServerCall) };
    } catch (error) {
      console.error('테이블별 호출 조회 네트워크 에러:', error);
      return { success: false, error: '테이블별 호출을 불러오는데 실패했습니다.' };
    }
  },

  // 호출 완료 처리
  completeCall: async (callId: string): Promise<ApiResponse<Call>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/${callId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }), // 서버는 'completed' 상태를 사용
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('호출 완료 처리 서버 에러:', errorData);
        return { success: false, error: errorData.error || '호출 완료 처리에 실패했습니다.' };
      }

      const data = await response.json();
      return { success: true, data: transformServerCall(data) };
    } catch (error) {
      console.error('호출 완료 처리 네트워크 에러:', error);
      return { success: false, error: '호출 완료 처리에 실패했습니다.' };
    }
  }
};

// 테이블 관련 API
export const tableApi = {
  // 테이블 목록 조회
  getTables: async (): Promise<ApiResponse<Table[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('테이블 목록 조회 서버 에러:', errorData);
        return { success: false, error: errorData.error || '테이블 목록을 불러오는데 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data: data.map(transformServerTable) };
    } catch (error) {
      console.error('테이블 목록 조회 네트워크 에러:', error);
      return { success: false, error: '테이블 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 테이블 상세 정보 조회
  getTable: async (tableId: string): Promise<ApiResponse<Table>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('테이블 조회 서버 에러:', errorData);
        return { success: false, error: errorData.error || '테이블 정보를 불러오는데 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data: transformServerTable(data) };
    } catch (error) {
      console.error('테이블 조회 네트워크 에러:', error);
      return { success: false, error: '테이블 정보를 불러오는데 실패했습니다.' };
    }
  },

  // 테이블 생성
  createTable: async (tableData: Omit<Table, 'id'> & { id: string }): Promise<ApiResponse<Table>> => {
    try {
      // 서버가 기대하는 형식으로 데이터 변환
      const serverTableData = {
        table_number: tableData.number.toString(), // 숫자를 문자열로 변환
        status: tableData.status
      };

      console.log('테이블 생성 요청:', tableData);
      console.log('테이블 생성 요청 (서버):', serverTableData);
      
      const response = await fetch(`${API_BASE_URL}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverTableData),
      });

      console.log('테이블 생성 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('테이블 생성 서버 에러:', errorData);
        return { success: false, error: errorData.error || '테이블 생성에 실패했습니다.' };
      }

      const data = await response.json();
      console.log('테이블 생성 성공:', data);
      return { success: true, data: transformServerTable(data) };
    } catch (error) {
      console.error('테이블 생성 네트워크 에러:', error);
      return { success: false, error: '테이블 생성에 실패했습니다.' };
    }
  },

  // 테이블 정보 수정
  updateTable: async (tableId: string, tableData: Partial<Table>): Promise<ApiResponse<Table>> => {
    try {
      // 서버가 기대하는 형식으로 데이터 변환
      const serverTableData: any = {};
      if (tableData.number !== undefined) {
        serverTableData.table_number = tableData.number.toString();
      }
      if (tableData.status !== undefined) {
        serverTableData.status = tableData.status;
      }

      console.log('테이블 수정 요청:', { tableId, tableData });
      console.log('테이블 수정 요청 (서버):', serverTableData);
      
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverTableData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('테이블 수정 서버 에러:', errorData);
        return { success: false, error: errorData.error || '테이블 수정에 실패했습니다.' };
      }

      const data = await response.json();
      return { success: true, data: transformServerTable(data) };
    } catch (error) {
      console.error('테이블 수정 네트워크 에러:', error);
      return { success: false, error: '테이블 수정에 실패했습니다.' };
    }
  },

  // 테이블 상태 변경
  updateTableStatus: async (tableId: string, status: TableStatus): Promise<ApiResponse<Table>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('테이블 상태 변경 서버 에러:', errorData);
        return { success: false, error: errorData.error || '테이블 상태 변경에 실패했습니다.' };
      }

      const data = await response.json();
      return { success: true, data: transformServerTable(data) };
    } catch (error) {
      console.error('테이블 상태 변경 네트워크 에러:', error);
      return { success: false, error: '테이블 상태 변경에 실패했습니다.' };
    }
  },

  // 테이블 삭제
  deleteTable: async (tableId: string): Promise<ApiResponse<Table>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('테이블 삭제 서버 에러:', errorData);
        return { success: false, error: errorData.error || '테이블 삭제에 실패했습니다.' };
      }

      const data = await response.json();
      return { success: true, data: transformServerTable(data.deleted) };
    } catch (error) {
      console.error('테이블 삭제 네트워크 에러:', error);
      return { success: false, error: '테이블 삭제에 실패했습니다.' };
    }
  }
}; 