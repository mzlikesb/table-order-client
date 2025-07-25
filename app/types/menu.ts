export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category: string;
  categoryId?: string;
  isAvailable?: boolean; // 품절 여부
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface MenuCardProps {
  menu: MenuItem;
  onAddToCart: (menuId: string, quantity: number) => void;
}

export interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

// 장바구니 관련 타입
export interface CartItem {
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image?: string;
}

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (menuId: string, quantity: number) => void;
  onRemoveItem: (menuId: string) => void;
  onCheckout: () => void;
} 