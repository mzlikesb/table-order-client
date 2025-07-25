// 기존 MenuItem 타입 확장
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category: string;
  isAvailable?: boolean; // 품절 여부
  createdAt?: string;
  updatedAt?: string;
}

// 주문 관련 타입
export interface OrderItem {
  menuId: string;
  menuName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface CreateOrderRequest {
  tableId: string;
  items: {
    menuId: string;
    quantity: number;
  }[];
}

// 호출 관련 타입
export interface Call {
  id: string;
  tableId: string;
  type: CallType;
  status: CallStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type CallType = 'water' | 'plate' | 'staff' | 'other';

export type CallStatus = 'pending' | 'completed';

export interface CreateCallRequest {
  tableId: string;
  type: CallType;
  message?: string;
}

// 테이블 관련 타입
export interface Table {
  id: string;
  number: string; // 문자열로 변경 (DB에서 table_number가 문자열이므로)
  status: TableStatus;
  capacity: number;
  currentOrderCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

// 카테고리 타입
export interface Category {
  id: string;
  name: string;
  icon?: string;
  order?: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 페이지네이션 타입
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 필터링 옵션 타입
export interface OrderFilter {
  status?: OrderStatus;
  tableId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CallFilter {
  status?: CallStatus;
  type?: CallType;
  tableId?: string;
}

// 스토어 관련 타입
export interface Store {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  storeId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 