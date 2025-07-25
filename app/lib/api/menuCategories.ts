import type { MenuCategory, ApiResponse } from '../../types/api';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

export const transformServerMenuCategory = (data: any): MenuCategory => ({
  id: data.id,
  storeId: data.store_id,
  name: data.name,
  sortOrder: data.sort_order,
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

export const menuCategoryApi = {
  getCategories: async (storeId?: string): Promise<ApiResponse<MenuCategory[]>> => {
    try {
      const url = storeId
        ? `${API_BASE_URL}/menu-categories?store_id=${storeId}`
        : `${API_BASE_URL}/menu-categories`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return { success: false, error: '카테고리 목록을 불러오는데 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data: data.map(transformServerMenuCategory) };
    } catch (error) {
      return { success: false, error: '카테고리 목록을 불러오는데 실패했습니다.' };
    }
  },
  getCategory: async (id: string): Promise<ApiResponse<MenuCategory>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-categories/${id}`);
      const data = await response.json();
      return { success: true, data: transformServerMenuCategory(data) };
    } catch (error) {
      return { success: false, error: '카테고리 정보를 불러오는데 실패했습니다.' };
    }
  },
  createCategory: async (category: { storeId: string; name: string; sortOrder?: number }): Promise<ApiResponse<MenuCategory>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: Number(category.storeId),
          name: category.name,
          sort_order: category.sortOrder || 0,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || '카테고리 추가 실패' };
      }
      
      const data = await response.json();
      return { success: true, data: transformServerMenuCategory(data) };
    } catch (error) {
      return { success: false, error: '카테고리 추가에 실패했습니다.' };
    }
  },
  updateCategory: async (id: string, update: { name?: string; sortOrder?: number; isActive?: boolean }): Promise<ApiResponse<MenuCategory>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: update.name,
          sort_order: update.sortOrder,
          is_active: update.isActive,
        }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || '카테고리 수정 실패' };
      return { success: true, data: transformServerMenuCategory(data) };
    } catch (error) {
      return { success: false, error: '카테고리 수정에 실패했습니다.' };
    }
  },
  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || '카테고리 삭제 실패' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: '카테고리 삭제에 실패했습니다.' };
    }
  },
}; 