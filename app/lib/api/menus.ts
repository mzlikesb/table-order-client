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

  // 고객용 메뉴 API (임시로 인증 토큰 사용)
  getCustomerMenus: async (storeId?: string): Promise<ApiResponse<MenuItem[]>> => {
    if (!storeId) return { success: true, data: [] };
    
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/menus/store/${storeId}`, {
        headers,
      });
      
      if (!response.ok) {
        return { success: false, error: '메뉴 목록을 불러오는데 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data: data.map(transformServerMenuItem) };
    } catch (error) {
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