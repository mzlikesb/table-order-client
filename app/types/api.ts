// 기존 MenuItem 타입 확장
export interface MenuItem {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  storeName?: string;
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
  tableNumber?: string; // 테이블 번호 추가
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
  store_id: string;
  table_id: string;
  items: {
    menu_id: string;
    quantity: number;
    unit_price: number;
    notes?: string | null;
  }[];
  total_amount: number;
  notes?: string | null;
}

// 호출 관련 타입
export interface Call {
  id: string;
  tableId: string;
  tableNumber?: string; // 테이블 번호 추가
  type: CallType;
  status: CallStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type CallType = 'service' | 'bill' | 'help' | 'custom';

export type CallStatus = 'pending' | 'completed';

export interface CreateCallRequest {
  storeId: string;
  tableId: string;
  type: CallType;
  message?: string;
}

// 테이블 관련 타입
export interface Table {
  id: string;
  storeId: string;
  number: string;
  name?: string;
  status: TableStatus;
  capacity: number;
  isActive: boolean;
  storeName?: string;
  currentOrderCount: number;
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