export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category: string;
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