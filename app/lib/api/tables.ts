import type { Table, TableStatus, ApiResponse } from '../../types/api';
import { apiRequest } from './common';

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
    
    const result = await apiRequest(
      `${API_BASE_URL}/stores/${storeId}/tables`,
      {},
      '테이블 목록을 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: (result.data || []).map(transformServerTable) };
    }
    
    return result;
  },
  getTablesByStore: async (storeId: string): Promise<ApiResponse<Table[]>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/stores/${storeId}/tables`,
      {},
      '스토어별 테이블 목록을 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: (result.data || []).map(transformServerTable) };
    }
    
    return result;
  },
  getTable: async (tableId: string): Promise<ApiResponse<Table>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/tables/${tableId}`,
      {},
      '테이블 정보를 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerTable(result.data) };
    }
    
    return result;
  },
  createTable: async (tableData: Omit<Table, 'id'> & { id: string }): Promise<ApiResponse<Table>> => {
    const serverTableData = {
      store_id: tableData.storeId,
      table_number: tableData.number,
      name: tableData.name,
      capacity: tableData.capacity,
      status: tableData.status
    };
    
    const result = await apiRequest(
      `${API_BASE_URL}/tables`,
      {
        method: 'POST',
        body: JSON.stringify(serverTableData),
      },
      '테이블 생성에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerTable(result.data) };
    }
    
    return result;
  },
  updateTable: async (tableId: string, tableData: Partial<Table>): Promise<ApiResponse<Table>> => {
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
    
    const result = await apiRequest(
      `${API_BASE_URL}/tables/${tableId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(serverTableData),
      },
      '테이블 수정에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerTable(result.data) };
    }
    
    return result;
  },
  updateTableStatus: async (tableId: string, status: TableStatus): Promise<ApiResponse<Table>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/tables/${tableId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      '테이블 상태 변경에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerTable(result.data) };
    }
    
    return result;
  },
  deleteTable: async (tableId: string): Promise<ApiResponse<Table>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/tables/${tableId}`,
      { method: 'DELETE' },
      '테이블 삭제에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerTable(result.data.deleted) };
    }
    
    return result;
  }
}; 