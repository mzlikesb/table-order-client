import type { Table, TableStatus, ApiResponse } from '../../types/api';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

export const transformServerTable = (serverData: any): Table => {
  const tableNumber = serverData.table_number;
  let number: string;
  if (typeof tableNumber === 'string') {
    number = tableNumber;
  } else if (typeof tableNumber === 'number') {
    number = tableNumber.toString();
  } else {
    number = '1';
  }
  return {
    id: serverData.id,
    storeId: serverData.store_id,
    number: number,
    name: serverData.name,
    status: serverData.status as TableStatus,
    capacity: serverData.capacity || 4,
    isActive: serverData.is_active,
    storeName: serverData.store_name,
    currentOrderCount: serverData.current_order_count || 0,
    createdAt: serverData.created_at,
    updatedAt: serverData.updated_at
  };
};

export const tableApi = {
  getTables: async (storeId?: string): Promise<ApiResponse<Table[]>> => {
    if (!storeId) return { success: true, data: [] };
    try {
      const token = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Tables API 호출 - storeId:', storeId, '토큰:', token ? '있음' : '없음');
      
      // 올바른 엔드포인트 사용: /stores/:storeId/tables
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}/tables`, {
        headers,
      });
      
      console.log('Tables API 응답 상태:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Tables API 인증 실패');
          return { success: false, error: '인증이 필요합니다. 다시 로그인해주세요.' };
        }
        const errorData = await response.json().catch(() => ({}));
        console.error('Tables API 오류:', errorData);
        return { success: false, error: errorData.error || '테이블 목록을 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: data.map(transformServerTable) };
    } catch (error) {
      console.error('Tables API 호출 오류:', error);
      return { success: false, error: '테이블 목록을 불러오는데 실패했습니다.' };
    }
  },
  getTablesByStore: async (storeId: string): Promise<ApiResponse<Table[]>> => {
    try {
      const token = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 올바른 엔드포인트 사용: /stores/:storeId/tables
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}/tables`, {
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: '인증이 필요합니다. 다시 로그인해주세요.' };
        }
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || '스토어별 테이블 목록을 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: data.map(transformServerTable) };
    } catch (error) {
      return { success: false, error: '스토어별 테이블 목록을 불러오는데 실패했습니다.' };
    }
  },
  getTable: async (tableId: string): Promise<ApiResponse<Table>> => {
    try {
      const token = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: '인증이 필요합니다. 다시 로그인해주세요.' };
        }
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || '테이블 정보를 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerTable(data) };
    } catch (error) {
      return { success: false, error: '테이블 정보를 불러오는데 실패했습니다.' };
    }
  },
  createTable: async (tableData: Omit<Table, 'id'> & { id: string }): Promise<ApiResponse<Table>> => {
    try {
      const token = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const serverTableData = {
        store_id: tableData.storeId,
        table_number: tableData.number,
        name: tableData.name,
        capacity: tableData.capacity,
        status: tableData.status
      };
      const response = await fetch(`${API_BASE_URL}/tables`, {
        method: 'POST',
        headers,
        body: JSON.stringify(serverTableData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: '인증이 필요합니다. 다시 로그인해주세요.' };
        }
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || '테이블 생성에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerTable(data) };
    } catch (error) {
      return { success: false, error: '테이블 생성에 실패했습니다.' };
    }
  },
  updateTable: async (tableId: string, tableData: Partial<Table>): Promise<ApiResponse<Table>> => {
    try {
      const token = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const serverTableData: any = {};
      if (tableData.storeId !== undefined) {
        serverTableData.store_id = tableData.storeId;
      }
      if (tableData.number !== undefined) {
        serverTableData.table_number = tableData.number;
      }
      if (tableData.name !== undefined) {
        serverTableData.name = tableData.name;
      }
      if (tableData.capacity !== undefined) {
        serverTableData.capacity = tableData.capacity;
      }
      if (tableData.status !== undefined) {
        serverTableData.status = tableData.status;
      }
      if (tableData.isActive !== undefined) {
        serverTableData.is_active = tableData.isActive;
      }
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(serverTableData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: '인증이 필요합니다. 다시 로그인해주세요.' };
        }
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || '테이블 수정에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerTable(data) };
    } catch (error) {
      return { success: false, error: '테이블 수정에 실패했습니다.' };
    }
  },
  updateTableStatus: async (tableId: string, status: TableStatus): Promise<ApiResponse<Table>> => {
    try {
      const token = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: '인증이 필요합니다. 다시 로그인해주세요.' };
        }
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || '테이블 상태 변경에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerTable(data) };
    } catch (error) {
      return { success: false, error: '테이블 상태 변경에 실패했습니다.' };
    }
  },
  deleteTable: async (tableId: string): Promise<ApiResponse<Table>> => {
    try {
      const token = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: '인증이 필요합니다. 다시 로그인해주세요.' };
        }
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || '테이블 삭제에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerTable(data.deleted) };
    } catch (error) {
      return { success: false, error: '테이블 삭제에 실패했습니다.' };
    }
  }
}; 