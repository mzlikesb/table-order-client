import type { MenuItem, ApiResponse } from '../../types/api';

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
    try {
      const response = await fetch(`${API_BASE_URL}/menus/store/${storeId}`);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '메뉴 목록을 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: data.map(transformServerMenuItem) };
    } catch (error) {
      return { success: false, error: '메뉴 목록을 불러오는데 실패했습니다.' };
    }
  },
  getMenusByStore: async (storeId: string): Promise<ApiResponse<MenuItem[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/store/${storeId}`);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '스토어별 메뉴 목록을 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: data.map(transformServerMenuItem) };
    } catch (error) {
      return { success: false, error: '스토어별 메뉴 목록을 불러오는데 실패했습니다.' };
    }
  },
  getMenu: async (id: string): Promise<ApiResponse<MenuItem>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '메뉴 정보를 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerMenuItem(data) };
    } catch (error) {
      return { success: false, error: '메뉴 정보를 불러오는데 실패했습니다.' };
    }
  },
  createMenu: async (menuData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'categoryName' | 'storeName'>): Promise<ApiResponse<MenuItem>> => {
    try {
      const serverData = {
        store_id: menuData.storeId,
        category_id: menuData.categoryId,
        name: menuData.name,
        description: menuData.description,
        price: menuData.price,
        image_url: menuData.image,
        is_available: menuData.isAvailable,
        sort_order: menuData.sortOrder,
      };
      const response = await fetch(`${API_BASE_URL}/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || '메뉴 추가 실패' };
      return { success: true, data: transformServerMenuItem(data) };
    } catch (error) {
      return { success: false, error: '메뉴 추가에 실패했습니다.' };
    }
  },
  updateMenu: async (id: string, menuData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'categoryName' | 'storeName'>): Promise<ApiResponse<MenuItem>> => {
    try {
      const serverData = {
        store_id: menuData.storeId,
        category_id: menuData.categoryId,
        name: menuData.name,
        description: menuData.description,
        price: menuData.price,
        image_url: menuData.image,
        is_available: menuData.isAvailable,
        sort_order: menuData.sortOrder,
      };
      const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || '메뉴 수정 실패' };
      return { success: true, data: transformServerMenuItem(data) };
    } catch (error) {
      return { success: false, error: '메뉴 수정에 실패했습니다.' };
    }
  },
  patchMenu: async (id: string, patch: Partial<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'categoryName' | 'storeName'>>): Promise<ApiResponse<MenuItem>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || '메뉴 수정 실패' };
      return { success: true, data: transformServerMenuItem(data) };
    } catch (error) {
      return { success: false, error: '메뉴 수정에 실패했습니다.' };
    }
  },
  deleteMenu: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || '메뉴 삭제 실패' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: '메뉴 삭제에 실패했습니다.' };
    }
  },
  getMenusByCategory: async (categoryId: string): Promise<ApiResponse<MenuItem[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/category/${categoryId}`);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '카테고리별 메뉴 목록을 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: data.map(transformServerMenuItem) };
    } catch (error) {
      return { success: false, error: '카테고리별 메뉴 목록을 불러오는데 실패했습니다.' };
    }
  },
}; 