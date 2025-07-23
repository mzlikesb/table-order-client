import { useState } from 'react';
import { Phone, ShoppingCart, Bell } from 'lucide-react';
import MenuCard from '../../menus/components/menuCard';
import CategoryList from '../../menus/components/categoryList';
import type { MenuItem, Category } from '../../types/menu';

// 샘플 데이터
const categories: Category[] = [
  { id: 'all', name: '전체' },
  { id: 'main', name: '메인' },
  { id: 'side', name: '사이드' },
  { id: 'drink', name: '음료' },
  { id: 'dessert', name: '디저트' },
];

const sampleMenus: MenuItem[] = [
  {
    id: '1',
    name: '불고기',
    price: 15000,
    image: '/images/bulgogi.jpg',
    description: '맛있는 불고기입니다',
    category: 'main'
  },
  {
    id: '2',
    name: '김치찌개',
    price: 12000,
    image: '/images/kimchi-jjigae.jpg',
    description: '얼큰한 김치찌개',
    category: 'main'
  },
  {
    id: '3',
    name: '콜라',
    price: 3000,
    image: '/images/cola.jpg',
    description: '시원한 콜라',
    category: 'drink'
  },
  {
    id: '4',
    name: '치킨가라아게',
    price: 18000,
    image: '/images/chicken-karaage.jpg',
    description: '바삭한 치킨가라아게',
    category: 'main'
  },
  {
    id: '5',
    name: '김밥',
    price: 8000,
    image: '/images/kimbap.jpg',
    description: '신선한 김밥',
    category: 'side'
  },
  {
    id: '6',
    name: '아이스크림',
    price: 5000,
    image: '/images/ice-cream.jpg',
    description: '달콤한 아이스크림',
    category: 'dessert'
  }
];

export default function Main() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const filteredMenus = selectedCategory === 'all' 
    ? sampleMenus 
    : sampleMenus.filter(menu => menu.category === selectedCategory);

  const handleAddToCart = (menuId: string, quantity: number) => {
    setCartItems(prev => ({
      ...prev,
      [menuId]: (prev[menuId] || 0) + quantity
    }));
  };

  const getCartTotalCount = () => {
    return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
  };

  const handleCall = () => {
    setIsCallModalOpen(true);
    // 실제로는 서버에 호출 요청을 보내는 로직
    setTimeout(() => setIsCallModalOpen(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col table-container">
      {/* Header */}
      <header className="table-header shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-600 dark:bg-gray-400 rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-gray-900 font-bold text-lg">🍽️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold table-text-primary">맛있는 식당</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm table-text-secondary">테이블 5번</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Categories */}
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Right Content - Menu Grid */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          
          {filteredMenus.length === 0 && (
            <div className="text-center py-12">
              <p className="table-text-secondary text-lg">해당 카테고리의 메뉴가 없습니다.</p>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="table-header shadow-lg border-t px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleCall}
            className="flex items-center gap-2 border-2 border-gray-600 dark:border-gray-400 text-gray-600 dark:text-gray-400 px-6 py-3 rounded-lg font-medium hover:bg-gray-600 hover:text-white dark:hover:bg-gray-400 dark:hover:text-gray-900 transition-colors"
          >
            <Bell size={20} />
            호출하기
          </button>

          <button
            className="flex items-center gap-2 bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors relative"
          >
            <ShoppingCart size={20} />
            장바구니
            {getCartTotalCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartTotalCount()}
              </span>
            )}
          </button>
        </div>
      </footer>

      {/* Call Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="table-card rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold table-text-primary mb-2">호출 완료!</h3>
            <p className="table-text-secondary">직원이 곧 방문하겠습니다.</p>
          </div>
        </div>
      )}
    </div>
  );
}