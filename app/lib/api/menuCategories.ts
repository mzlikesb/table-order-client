import type { MenuCategory, ApiResponse } from '../../types/api';
import { apiRequest } from './common';

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
    const url = storeId
      ? `${API_BASE_URL}/menu-categories?store_id=${storeId}`
      : `${API_BASE_URL}/menu-categories`;
    
    const result = await apiRequest(
      url,
      {},
      '카테고리 목록을 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: (result.data || []).map(transformServerMenuCategory) };
    }
    
    return result;
  },
  getCategory: async (id: string): Promise<ApiResponse<MenuCategory>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/menu-categories/${id}`,
      {},
      '카테고리 정보를 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerMenuCategory(result.data) };
    }
    
    return result;
  },
  createCategory: async (category: { storeId: string; name: string; sortOrder?: number }): Promise<ApiResponse<MenuCategory>> => {
    try {
      // Log current user info
      const userInfo = localStorage.getItem('userInfo');
      const userStores = localStorage.getItem('userStores');
      const authToken = localStorage.getItem('authToken');
      
      console.log('Current user info:', userInfo ? JSON.parse(userInfo) : 'No user info');
      console.log('User stores:', userStores ? JSON.parse(userStores) : 'No user stores');
      console.log('Auth token exists:', !!authToken);
      
      // Check user roles and permissions
      const userData = userInfo ? JSON.parse(userInfo) : null;
      if (userData) {
        console.log('User roles:', userData.roles || 'No roles');
        console.log('User permissions:', userData.permissions || 'No permissions');
        console.log('Is super admin:', userData.isSuperAdmin);
      }
      
      // Check if user is connected to any store
      const userStoresData = userStores ? JSON.parse(userStores) : [];
      console.log('User stores data:', userStoresData);
      
      // If user has no stores, try to get stores from server
      if (userStoresData.length === 0) {
        console.log('User has no stores, attempting to fetch stores...');
        try {
          const storesResponse = await fetch(`${API_BASE_URL}/stores`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (storesResponse.ok) {
            const storesData = await storesResponse.json();
            console.log('Available stores:', storesData);
            
            // Update userStores in localStorage
            localStorage.setItem('userStores', JSON.stringify(storesData));
            console.log('Updated userStores in localStorage');
            
            // Check if selected store is in available stores
            const selectedStoreId = category.storeId;
            const selectedStore = storesData.find((store: any) => store.id == selectedStoreId);
            console.log('Selected store ID:', selectedStoreId);
            console.log('Selected store found:', selectedStore);
            
            if (!selectedStore) {
              console.error('Selected store not found in available stores');
              return { success: false, error: '선택된 스토어에 대한 권한이 없습니다.' };
            }
          }
        } catch (error) {
          console.error('Failed to fetch stores:', error);
        }
      }
      
      // Server expects: name, sort_order, description (optional)
      // Server gets store_id from req.tenant.storeId automatically
      // But if that fails, we'll include it in the request body as fallback
      const requestData = {
        name: category.name,
        sort_order: category.sortOrder || 0,
        description: null, // Optional field that server handles
        store_id: category.storeId // Fallback: include store_id in request body
      };
      
      console.log('Creating category with data:', requestData);
      
      const result = await apiRequest(
        `${API_BASE_URL}/menu-categories`,
        {
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: {
            'X-Store-ID': category.storeId // Add store_id to headers
          }
        },
        '카테고리 추가에 실패했습니다.'
      );
      
      console.log('Create category response:', result);
      
      if (result.success) {
        return { success: true, data: transformServerMenuCategory(result.data) };
      }
      
      return result;
    } catch (error) {
      console.error('Create category error:', error);
      return { success: false, error: '카테고리 추가 중 오류가 발생했습니다.' };
    }
  },
  updateCategory: async (id: string, update: { name?: string; sortOrder?: number; isActive?: boolean }): Promise<ApiResponse<MenuCategory>> => {
    const result = await apiRequest(
      `${API_BASE_URL}/menu-categories/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: update.name,
          sort_order: update.sortOrder,
          is_active: update.isActive,
        }),
      },
      '카테고리 수정에 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: transformServerMenuCategory(result.data) };
    }
    
    return result;
  },
  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    return await apiRequest(
      `${API_BASE_URL}/menu-categories/${id}`,
      { method: 'DELETE' },
      '카테고리 삭제에 실패했습니다.'
    );
  },
}; 