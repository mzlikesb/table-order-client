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
      // 인증 토큰 가져오기 (localStorage에서)
      const token = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Stores API 호출 헤더:', headers);
      console.log('현재 토큰:', token ? '있음' : '없음');
      
      const response = await fetch(`${API_BASE_URL}/stores`, {
        headers,
      });
      
      console.log('Stores API 응답 상태:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('인증 실패 - 토큰:', token);
          return { success: false, error: '인증이 필요합니다. 다시 로그인해주세요.' };
        }
        if (response.status === 403) {
          console.error('권한 없음 - 토큰:', token);
          return { success: false, error: '스토어 권한이 없습니다. 관리자에게 문의하세요.' };
        }
        if (response.status === 500) {
          console.error('서버 내부 오류 - 토큰:', token);
          const errorText = await response.text().catch(() => '서버 오류');
          console.error('서버 오류 상세:', errorText);
          return { success: false, error: '서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.' };
        }
        const errorData = await response.json().catch(() => ({}));
        console.error('Stores API 오류:', errorData);
        return { success: false, error: errorData.error || '스토어 목록을 불러오는데 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data: data.map(transformServerStore) };
    } catch (error) {
      console.error('Stores API 호출 오류:', error);
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