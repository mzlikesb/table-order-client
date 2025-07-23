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