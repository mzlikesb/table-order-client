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
      const response = await fetch(`${API_BASE_URL}/tables/store/${storeId}`);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '테이블 목록을 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: data.map(transformServerTable) };
    } catch (error) {
      return { success: false, error: '테이블 목록을 불러오는데 실패했습니다.' };
    }
  },
  getTablesByStore: async (storeId: string): Promise<ApiResponse<Table[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/store/${storeId}`);
      if (!response.ok) {
        const errorData = await response.json();
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
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`);
      if (!response.ok) {
        const errorData = await response.json();
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
      const serverTableData = {
        store_id: tableData.storeId,
        table_number: tableData.number,
        name: tableData.name,
        capacity: tableData.capacity,
        status: tableData.status
      };
      const response = await fetch(`${API_BASE_URL}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverTableData),
      });
      if (!response.ok) {
        const errorData = await response.json();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverTableData),
      });
      if (!response.ok) {
        const errorData = await response.json();
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
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
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
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '테이블 삭제에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerTable(data.deleted) };
    } catch (error) {
      return { success: false, error: '테이블 삭제에 실패했습니다.' };
    }
  }
}; 