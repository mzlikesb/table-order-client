import type { Store, ApiResponse } from '../../types/api';
import { apiRequest } from './common';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

export const transformServerStore = (serverData: any): Store => {
  return {
    id: serverData.id,
    code: serverData.code,
    name: serverData.name,
    address: serverData.address,
    phone: serverData.phone,
    timezone: serverData.timezone,
    isActive: serverData.is_active,
    createdAt: serverData.created_at,
    updatedAt: serverData.updated_at
  };
};

export const storeApi = {
  getStores: async (): Promise<ApiResponse<Store[]>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/stores`,
      {},
      '스토어 목록을 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: (result.data || []).map(transformServerStore) };
    }
    
    return result;
  },
  getStore: async (storeId: string): Promise<ApiResponse<Store>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/stores/${storeId}`,
      {},
      '스토어 조회에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerStore(result.data) };
    }
    
    return result;
  },
  createStore: async (storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Store>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/stores`,
      {
        method: 'POST',
        body: JSON.stringify(storeData),
      },
      '스토어 추가에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerStore(result.data) };
    }
    
    return result;
  },
  updateStore: async (storeId: string, storeData: Partial<Store>): Promise<ApiResponse<Store>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/stores/${storeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(storeData),
      },
      '스토어 수정에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerStore(result.data) };
    }
    
    return result;
  },
  deleteStore: async (storeId: string): Promise<ApiResponse<void>> => {
    return await apiRequest(
      `${API_BASE_URL}/stores/${storeId}`,
      { method: 'DELETE' },
      '스토어 삭제에 실패했습니다.'
    );
  },
}; 