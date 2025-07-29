import type { MenuCategory, ApiResponse } from '../../types/api';
import { apiRequest, publicApiRequest } from './common';

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
    if (!storeId) return { success: true, data: [] };
    
    const result = await apiRequest(
      `${API_BASE_URL}/menu-categories/store/${storeId}`,
      {},
      '카테고리 목록을 불러오는데 실패했습니다.'
    );
    
    if (result.success) {
      return { success: true, data: (result.data || []).map(transformServerMenuCategory) };
    }
    
    return result;
  },

  // 고객용 공개 카테고리 API (인증 없이)
  getPublicCategories: async (storeId: string): Promise<ApiResponse<MenuCategory[]>> => {
    if (!storeId) return { success: true, data: [] };
    
    try {
      console.log('getPublicCategories 호출 - storeId:', storeId);
      console.log('API_BASE_URL:', API_BASE_URL);
      
      const url = `${API_BASE_URL}/menu-categories/customer?store_id=${storeId}`;
      console.log('공개 카테고리 API 요청 URL:', url);
      console.log('전체 URL 구성:', {
        base: API_BASE_URL,
        path: '/menu-categories/customer',
        query: `store_id=${storeId}`,
        full: url
      });
      
      const result = await publicApiRequest(
        url,
        {},
        '카테고리 목록을 불러오는데 실패했습니다.'
      );
      
      if (result.success) {
        console.log('공개 카테고리 API 성공 응답:', result.data);
        return { success: true, data: (result.data || []).map(transformServerMenuCategory) };
      } else {
        console.error('공개 카테고리 API 오류 응답:', result.error);
        return result;
      }
    } catch (error) {
      console.error('카테고리 API 네트워크 오류:', error);
      return { success: false, error: '카테고리 목록을 불러오는데 실패했습니다.' };
    }
  },

  createCategory: async (category: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MenuCategory>> => {
    try {
      console.log('카테고리 생성 시도:', category);
      
      // 사용자 스토어 정보 확인
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        return { success: false, error: '인증이 필요합니다.' };
      }
      
      // 사용자 스토어 목록 확인
      const userStores = localStorage.getItem('userStores');
      let userStoresData: any[] = [];
      
      if (userStores) {
        try {
          userStoresData = JSON.parse(userStores);
          console.log('사용자 스토어 목록:', userStoresData);
        } catch (error) {
          console.error('사용자 스토어 정보 파싱 오류:', error);
        }
      }
      
      // If user has no stores, try to get stores from server
      if (userStoresData.length === 0) {
        console.log('User has no stores, attempting to fetch stores...');
        try {
          const storesResult = await apiRequest(
            `${API_BASE_URL}/stores`,
            {},
            '스토어 목록을 불러오는데 실패했습니다.'
          );
          
          if (storesResult.success) {
            const storesData = storesResult.data;
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