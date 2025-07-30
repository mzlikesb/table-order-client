import type { Order, CreateOrderRequest, OrderStatus, ApiResponse } from '../../types/api';
import { apiRequest, publicApiRequest } from './common';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

export const orderApi = {
  // 관리자용 주문 생성 (인증 필요)
  createOrder: async (orderData: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    try {
      const result = await apiRequest(
        `${API_BASE_URL}/orders`,
        {
          method: 'POST',
          body: JSON.stringify(orderData),
        },
        '주문 생성에 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '주문 생성에 실패했습니다.' };
    }
  },

  // 고객용 주문 생성 (인증 없이)
  createPublicOrder: async (orderData: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    try {
      const result = await publicApiRequest(
        `/orders/public`,
        {
          method: 'POST',
          body: JSON.stringify(orderData),
        },
        '주문 생성에 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '주문 생성에 실패했습니다.' };
    }
  },

  getTableOrders: async (tableId: string): Promise<ApiResponse<Order[]>> => {
    try {
      const result = await apiRequest(
        `${API_BASE_URL}/orders/table/${tableId}`,
        {},
        '주문 내역을 불러오는데 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '주문 내역을 불러오는데 실패했습니다.' };
    }
  },
  cancelOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    try {
      const result = await apiRequest(
        `${API_BASE_URL}/orders/${orderId}/cancel`,
        {
          method: 'PATCH',
        },
        '주문 취소에 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '주문 취소에 실패했습니다.' };
    }
  },
  getAdminOrders: async (storeId?: string): Promise<ApiResponse<Order[]>> => {
    try {
      if (!storeId) {
        return { success: false, error: '스토어 ID가 필요합니다.' };
      }
      
      return await apiRequest(
        `${API_BASE_URL}/orders/store/${storeId}`,
        {},
        '주문 목록을 불러오는데 실패했습니다.'
      );
    } catch (error) {
      return { success: false, error: '주문 목록을 불러오는데 실패했습니다.' };
    }
  },
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
    try {
      const result = await apiRequest(
        `${API_BASE_URL}/orders/${orderId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: String(status) }), // 명시적으로 문자열로 변환
        },
        '주문 상태 변경에 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '주문 상태 변경에 실패했습니다.' };
    }
  },
  adminCancelOrder: async (orderId: string, reason?: string): Promise<ApiResponse<Order>> => {
    try {
      const result = await apiRequest(
        `${API_BASE_URL}/admin/orders/${orderId}/cancel`,
        {
          method: 'PATCH',
          body: JSON.stringify({ reason }),
        },
        '주문 취소에 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '주문 취소에 실패했습니다.' };
    }
  },
}; 