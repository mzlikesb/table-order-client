import type { Store, ApiResponse } from '../../types/api';

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
    try {
      const response = await fetch(`${API_BASE_URL}/stores`);
      const data = await response.json();
      return { success: true, data: data.map(transformServerStore) };
    } catch (error) {
      return { success: false, error: '스토어 목록을 불러오는데 실패했습니다.' };
    }
  },
  getStore: async (storeId: string): Promise<ApiResponse<Store>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}`);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '스토어 조회에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerStore(data) };
    } catch (error) {
      return { success: false, error: '스토어 조회에 실패했습니다.' };
    }
  },
  createStore: async (storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Store>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '스토어 추가에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerStore(data) };
    } catch (error) {
      return { success: false, error: '스토어 추가에 실패했습니다.' };
    }
  },
  updateStore: async (storeId: string, storeData: Partial<Store>): Promise<ApiResponse<Store>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '스토어 수정에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerStore(data) };
    } catch (error) {
      return { success: false, error: '스토어 수정에 실패했습니다.' };
    }
  },
  deleteStore: async (storeId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '스토어 삭제에 실패했습니다.' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: '스토어 삭제에 실패했습니다.' };
    }
  },
}; 