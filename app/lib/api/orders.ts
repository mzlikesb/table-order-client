import type { Order, CreateOrderRequest, OrderStatus, ApiResponse } from '../../types/api';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

export const orderApi = {
  createOrder: async (orderData: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 생성에 실패했습니다.' };
    }
  },
  getTableOrders: async (tableId: string): Promise<ApiResponse<Order[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/table/${tableId}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 내역을 불러오는데 실패했습니다.' };
    }
  },
  cancelOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 취소에 실패했습니다.' };
    }
  },
  getAdminOrders: async (): Promise<ApiResponse<Order[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 목록을 불러오는데 실패했습니다.' };
    }
  },
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 상태 변경에 실패했습니다.' };
    }
  },
  adminCancelOrder: async (orderId: string, reason?: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '주문 취소에 실패했습니다.' };
    }
  },
}; 