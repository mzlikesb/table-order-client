import { useState, useEffect } from 'react';
import { Phone, ShoppingCart, Bell, Sun, Moon } from 'lucide-react';
import MenuCard from '../components/menuCard';
import CategoryList from '../components/categoryList';
import LanguageSelector from '../../common/components/languageSelector';
import CartDrawer from '../components/cartDrawer';
import CallModal from '../components/callModal';
import type { MenuItem, Category, CartItem } from '../../types/menu';
import type { CreateCallRequest } from '../../types/api';
import { menuApi, orderApi, callApi } from '../../lib/api';
import { i18n, initializeLanguage, type Language } from '../../utils/i18n';

// 카테고리 데이터 (동적으로 생성)
const getCategories = (): Category[] => [
  { id: 'all', name: i18n.t('all') },
  { id: 'main', name: i18n.t('main') },
  { id: 'side', name: i18n.t('side') },
  { id: 'drink', name: i18n.t('drink') },
  { id: 'dessert', name: i18n.t('dessert') },
];



export default function Main() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isCallSuccessModalOpen, setIsCallSuccessModalOpen] = useState(false);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ko');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 언어 초기화
  useEffect(() => {
    initializeLanguage();
    setCurrentLanguage(i18n.getLanguage());
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
          setMenus([]);
        }
      } catch (err) {
        setError('메뉴를 불러오는데 실패했습니다.');
        setMenus([]);
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

  const handleUpdateQuantity = (menuId: string, quantity: number) => {
    setCartItems(prev => ({
      ...prev,
      [menuId]: quantity
    }));
  };

  const handleRemoveItem = (menuId: string) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      delete newCart[menuId];
      return newCart;
    });
  };

  const getCartItemsArray = (): CartItem[] => {
    return Object.entries(cartItems).map(([menuId, quantity]) => {
      const menu = menus.find(m => m.id == menuId); // 느슨한 비교 사용
      
      return {
        menuId,
        menuName: menu?.name || `메뉴 ${menuId}`,
        price: menu?.price || 0,
        quantity,
        totalPrice: (menu?.price || 0) * quantity,
        image: menu?.image
      };
    });
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
        setIsCartDrawerOpen(false); // drawer 닫기
      } else {
        alert(response.error || '주문에 실패했습니다.');
      }
    } catch (err) {
      alert('주문에 실패했습니다.');
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    const lang = languageCode as Language;
    setCurrentLanguage(lang);
    i18n.setLanguage(lang);
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

  const handleCall = () => {
    setIsCallModalOpen(true);
  };

  const handleCallSubmit = async (callData: CreateCallRequest) => {
    try {
      const response = await callApi.createCall(callData);
      
      if (response.success) {
        setIsCallSuccessModalOpen(true);
        setTimeout(() => setIsCallSuccessModalOpen(false), 2000);
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
              <h1 className="text-xl font-bold table-text-primary">{i18n.t('restaurantName')}</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm table-text-secondary">{i18n.t('tableNumber')}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Categories */}
        <CategoryList
          categories={getCategories()}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Right Content - Menu Grid */}
        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="table-text-secondary text-lg">{i18n.t('loadingMenu')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
              <p className="table-text-secondary text-sm mt-2">{i18n.t('menuLoadError')}</p>
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
                  <p className="table-text-secondary text-lg">{i18n.t('noMenuInCategory')}</p>
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
            {i18n.t('call')}
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
              title={i18n.t('themeToggle')}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* 장바구니 버튼 */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2 bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors relative"
            >
              <ShoppingCart size={20} />
              {i18n.t('cart')}
              {getCartTotalCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartTotalCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={getCartItemsArray()}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Call Modal */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onSubmit={handleCallSubmit}
        tableId="5"
      />

      {/* Call Success Modal */}
      {isCallSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="table-card rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold table-text-primary mb-2">{i18n.t('callSuccess')}</h3>
            <p className="table-text-secondary">{i18n.t('callSuccessMessage')}</p>
          </div>
        </div>
      )}
    </div>
  );
}