import { useState, useEffect } from 'react';
import { Phone, ShoppingCart, Bell, Sun, Moon } from 'lucide-react';
import MenuCard from '../../menus/components/menuCard';
import CategoryList from '../../menus/components/categoryList';
import LanguageSelector from '../../components/languageSelector';
import type { MenuItem, Category } from '../../types/menu';
import { menuApi, orderApi, callApi } from '../../lib/api';

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
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 언어 설정 초기화
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // 다크모드 설정 초기화
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 메뉴 데이터 로드
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);
        const response = await menuApi.getMenus();
        if (response.success && response.data) {
          setMenus(response.data);
        } else {
          setError(response.error || '메뉴를 불러오는데 실패했습니다.');
          // API 실패 시 샘플 데이터 사용
          setMenus(sampleMenus);
        }
      } catch (err) {
        setError('메뉴를 불러오는데 실패했습니다.');
        // 에러 시 샘플 데이터 사용
        setMenus(sampleMenus);
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  const filteredMenus = selectedCategory === 'all' 
    ? menus 
    : menus.filter(menu => menu.category === selectedCategory);

  const handleAddToCart = (menuId: string, quantity: number) => {
    setCartItems(prev => ({
      ...prev,
      [menuId]: (prev[menuId] || 0) + quantity
    }));
  };

  const handleCheckout = async () => {
    if (getCartTotalCount() === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    try {
      const orderItems = Object.entries(cartItems).map(([menuId, quantity]) => ({
        menuId,
        quantity
      }));

      const response = await orderApi.createOrder({
        tableId: '5', // 현재 테이블 번호
        items: orderItems
      });

      if (response.success) {
        alert('주문이 완료되었습니다!');
        setCartItems({}); // 장바구니 비우기
      } else {
        alert(response.error || '주문에 실패했습니다.');
      }
    } catch (err) {
      alert('주문에 실패했습니다.');
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    // 언어 변경 시 로컬 스토리지에 저장
    localStorage.setItem('language', languageCode);
    // 페이지 새로고침으로 언어 적용 (실제로는 i18n 라이브러리 사용)
    window.location.reload();
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const getCartTotalCount = () => {
    return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
  };

  const handleCall = async () => {
    try {
      const response = await callApi.createCall({
        tableId: '5', // 현재 테이블 번호
        type: 'staff',
        message: '직원 호출'
      });
      
      if (response.success) {
        setIsCallModalOpen(true);
        setTimeout(() => setIsCallModalOpen(false), 2000);
      } else {
        alert(response.error || '호출에 실패했습니다.');
      }
    } catch (err) {
      alert('호출에 실패했습니다.');
    }
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
          {loading ? (
            <div className="text-center py-12">
              <p className="table-text-secondary text-lg">메뉴를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
              <p className="table-text-secondary text-sm mt-2">샘플 데이터를 사용합니다.</p>
            </div>
          ) : (
            <>
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
            </>
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

          <div className="flex items-center gap-3">
            {/* 언어 변경 버튼 */}
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
            />

            {/* 다크모드 전환 버튼 */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="테마 변경"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* 장바구니 버튼 */}
            <button
              onClick={handleCheckout}
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