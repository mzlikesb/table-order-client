import type { MenuItem, ApiResponse } from '../../types/api';
import { apiRequest } from './common';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

export const transformServerMenuItem = (serverData: any): MenuItem => ({
  id: serverData.id,
  storeId: serverData.store_id,
  categoryId: serverData.category_id,
  name: serverData.name,
  description: serverData.description,
  price: serverData.price,
  image: serverData.image_url,
  isAvailable: serverData.is_available,
  sortOrder: serverData.sort_order,
  createdAt: serverData.created_at,
  updatedAt: serverData.updated_at,
  categoryName: serverData.category_name,
  storeName: serverData.store_name,
});

export const menuApi = {
  getMenus: async (storeId?: string): Promise<ApiResponse<MenuItem[]>> => {
    if (!storeId) return { success: true, data: [] };
    
    const result = await apiRequest(
      `${API_BASE_URL}/menus/store/${storeId}`,
      {},
      '메뉴 목록을 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: result.data.map(transformServerMenuItem) };
    }
    
    return result;
  },

  // 키오스크용 메뉴 API (고객용)
  getKioskMenus: async (storeId?: string): Promise<ApiResponse<MenuItem[]>> => {
    if (!storeId) return { success: true, data: [] };
    
    try {
      console.log('getKioskMenus 호출 - storeId:', storeId);
      
      // URL에서 테이블 번호 가져오기
      const urlParams = new URLSearchParams(window.location.search);
      const tableNumber = urlParams.get('table') || '1';
      
      // 키오스크용 엔드포인트 사용
      const url = `${API_BASE_URL}/menus/kiosk`;
      console.log('키오스크 메뉴 API 요청 URL:', url);
      
      // 키오스크 인증 헤더 (테이블 정보 포함)
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Store-ID': storeId,
        'X-Table-Number': tableNumber,
      };
      
      console.log('키오스크 메뉴 API 요청 헤더:', headers);
      
      const response = await fetch(url, { headers });
      
      console.log('키오스크 메뉴 API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '응답 텍스트를 읽을 수 없습니다.');
        console.error('키오스크 메뉴 API 오류 응답:', errorText);
        
        if (response.status === 400) {
          return { success: false, error: `잘못된 요청입니다. storeId: ${storeId}, 응답: ${errorText}` };
        }
        if (response.status === 401) {
          return { success: false, error: '인증이 필요합니다.' };
        }
        if (response.status === 404) {
          return { success: false, error: `스토어 ID ${storeId}를 찾을 수 없습니다.` };
        }
        
        return { success: false, error: `메뉴 목록을 불러오는데 실패했습니다. (${response.status}: ${errorText})` };
      }
      
      const data = await response.json();
      console.log('키오스크 메뉴 API 성공 응답:', data);
      return { success: true, data: data.map(transformServerMenuItem) };
    } catch (error) {
      console.error('키오스크 메뉴 API 네트워크 오류:', error);
      return { success: false, error: '메뉴 목록을 불러오는데 실패했습니다.' };
    }
  },

  // 고객용 메뉴 API (임시로 인증 토큰 사용)
  getCustomerMenus: async (storeId?: string): Promise<ApiResponse<MenuItem[]>> => {
    if (!storeId) return { success: true, data: [] };
    
    try {
      console.log('getCustomerMenus 호출 - storeId:', storeId);
      const token = localStorage.getItem('authToken');
      
      // 여러 엔드포인트 시도
      const endpoints = [
        `${API_BASE_URL}/menus/store?store_id=${storeId}`,
        `${API_BASE_URL}/menus?store_id=${storeId}`,
        `${API_BASE_URL}/menus/store/${storeId}`,
        `${API_BASE_URL}/menus/customer/store/${storeId}`,
      ];
      
      let response: Response | null = null;
      let lastError = '';
      
      for (const url of endpoints) {
        try {
          console.log('메뉴 API 요청 URL 시도:', url);
          
          // 먼저 인증 없이 시도
          let headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          response = await fetch(url, { headers });
          
          // 401 에러가 나면 인증 토큰과 함께 다시 시도
          if (response.status === 401 && token) {
            console.log('인증 토큰으로 재시도:', url);
            headers['Authorization'] = `Bearer ${token}`;
            response = await fetch(url, { headers });
          }
          
          console.log('메뉴 API 응답 상태:', response.status, response.statusText);
          console.log('메뉴 API 요청 헤더:', headers);
          
          if (response.ok) {
            const data = await response.json();
            console.log('메뉴 API 성공 응답:', data);
            return { success: true, data: data.map(transformServerMenuItem) };
          } else {
            const errorText = await response.text().catch(() => '응답 텍스트를 읽을 수 없습니다.');
            console.error('메뉴 API 오류 응답:', errorText);
            lastError = `(${response.status}: ${errorText})`;
          }
        } catch (error) {
          console.error('엔드포인트 시도 실패:', url, error);
          lastError = `네트워크 오류: ${error}`;
        }
      }
      
      // 모든 엔드포인트 실패
      return { success: false, error: `메뉴 목록을 불러오는데 실패했습니다. ${lastError}` };
    } catch (error) {
      console.error('메뉴 API 네트워크 오류:', error);
      return { success: false, error: '메뉴 목록을 불러오는데 실패했습니다.' };
    }
  },
  
  getMenusByStore: async (storeId: string): Promise<ApiResponse<MenuItem[]>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/menus/store/${storeId}`,
      {},
      '스토어별 메뉴 목록을 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: result.data.map(transformServerMenuItem) };
    }
    
    return result;
  },
  
  getMenu: async (id: string): Promise<ApiResponse<MenuItem>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/menus/${id}`,
      {},
      '메뉴 정보를 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerMenuItem(result.data) };
    }
    
    return result;
  },
  
  createMenu: async (menuData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'categoryName' | 'storeName'>): Promise<ApiResponse<MenuItem>> => {
    const serverData = {
      store_id: Number(menuData.storeId),
      category_id: Number(menuData.categoryId),
      name: menuData.name,
      description: menuData.description || null,
      price: Number(menuData.price),
      image_url: menuData.image || null,
      is_available: menuData.isAvailable,
      sort_order: Number(menuData.sortOrder),
    };
    
    const result = await apiRequest(
      `${API_BASE_URL}/menus`,
      {
        method: 'POST',
        body: JSON.stringify(serverData),
      },
      '메뉴 추가에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerMenuItem(result.data) };
    }
    
    return result;
  },
  
  updateMenu: async (id: string, menuData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'categoryName' | 'storeName'>): Promise<ApiResponse<MenuItem>> => {
    const serverData = {
      store_id: Number(menuData.storeId),
      category_id: Number(menuData.categoryId),
      name: menuData.name,
      description: menuData.description || null,
      price: Number(menuData.price),
      image_url: menuData.image || null,
      is_available: menuData.isAvailable,
      sort_order: Number(menuData.sortOrder),
    };
    
    const result = await apiRequest(
      `${API_BASE_URL}/menus/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(serverData),
      },
      '메뉴 수정에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerMenuItem(result.data) };
    }
    
    return result;
  },
  
  deleteMenu: async (id: string): Promise<ApiResponse<void>> => {
    return await apiRequest(
      `${API_BASE_URL}/menus/${id}`,
      { method: 'DELETE' },
      '메뉴 삭제에 실패했습니다.'
    );
  },
  
  updateMenuStatus: async (id: string, isAvailable: boolean): Promise<ApiResponse<MenuItem>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/menus/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ is_available: isAvailable }),
      },
      '메뉴 상태 변경에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerMenuItem(result.data) };
    }
    
    return result;
  },
}; 