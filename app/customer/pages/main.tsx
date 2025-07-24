import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Phone, Sun, Moon, Languages, Clock } from 'lucide-react';
import CategoryList from '../components/categoryList';
import MenuCard from '../components/menuCard';
import CartDrawer from '../components/cartDrawer';
import CallModal from '../components/callModal';
import Footer from '../components/footer';
import { menuApi, orderApi, callApi } from '../../lib/api';
import { initSocket, joinTableRoom, onMenuUpdate, offMenuUpdate } from '../../lib/socket';
import type { MenuItem, Category, CartItem } from '../../types/menu';
import type { Order, CreateCallRequest } from '../../types/api';
import { i18n, initializeLanguage, type Language } from '../../utils/i18n';

export default function CustomerMain() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ko');
  const [menuStatusNotification, setMenuStatusNotification] = useState<string | null>(null);
  
  // 타이머 관련 상태
  const [timeLeft, setTimeLeft] = useState(300); // 300초 (5분)
  const [showTimer, setShowTimer] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousMenuCountRef = useRef<number>(0);

  // 테이블 ID (URL 파라미터에서 가져오거나 기본값 사용)
  const tableId = new URLSearchParams(window.location.search).get('table') || '1';

  // 타이머 리셋 함수
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeLeft(300);
    setShowTimer(true);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 시간 초과 시 모든 리스트 비우고 홈 화면으로 이동
          clearInterval(timerRef.current!);
          setMenus([]);
          setCategories([]);
          setCartItems([]);
          setIsCartOpen(false);
          setIsCallModalOpen(false);
          setShowTimer(false);
          
          // 홈 화면으로 이동
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 타이머 정리 함수
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setShowTimer(false);
  };

  useEffect(() => {
    // Socket.IO 초기화 및 테이블 룸 참가
    const socket = initSocket();
    joinTableRoom(tableId);
    setSocketConnected(socket.connected);

    // Socket.IO 연결 상태 모니터링
    const handleConnect = () => {
      console.log('Socket.IO 연결됨');
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Socket.IO 연결 해제');
      setSocketConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // 실시간 메뉴 업데이트 리스너
    const handleMenuUpdate = (data: any) => {
      console.log('메뉴 업데이트 수신:', data);
      loadMenus();
    };

    onMenuUpdate(handleMenuUpdate);

    // 초기 데이터 로드
    loadMenus();
    loadCategories();
    
    // 타이머 시작
    resetTimer();

    // 30초 간격으로 메뉴 상태 실시간 업데이트
    const menuInterval = setInterval(() => {
      console.log('메뉴 상태 실시간 업데이트 중...');
      loadMenus();
    }, 30000);

    // 클린업
    return () => {
      clearInterval(menuInterval);
      clearTimer();
      offMenuUpdate(handleMenuUpdate);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [tableId]);

  // 메뉴 개수 변화 감지하여 타이머 리셋
  useEffect(() => {
    if (menus.length > previousMenuCountRef.current) {
      // 새 메뉴가 추가되었을 때 타이머 리셋
      console.log('새 메뉴가 추가되어 타이머를 리셋합니다.');
      resetTimer();
    }
    previousMenuCountRef.current = menus.length;
  }, [menus.length]);

  // 다크모드 초기화
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 언어 초기화
  useEffect(() => {
    initializeLanguage();
    const savedLanguage = localStorage.getItem('language') as Language || 'ko';
    setCurrentLanguage(savedLanguage);
  }, []);

  // 시간 포맷팅 함수
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const loadMenus = async () => {
    try {
      const response = await menuApi.getMenus();
      if (response.success) {
        const newMenus = response.data || [];
        
        // 메뉴 상태 변경 감지
        if (menus.length > 0) {
          const soldOutMenus = newMenus.filter(newMenu => {
            const oldMenu = menus.find(oldMenu => oldMenu.id === newMenu.id);
            return oldMenu && oldMenu.isAvailable !== false && newMenu.isAvailable === false;
          });
          
          const availableMenus = newMenus.filter(newMenu => {
            const oldMenu = menus.find(oldMenu => oldMenu.id === newMenu.id);
            return oldMenu && oldMenu.isAvailable === false && newMenu.isAvailable !== false;
          });
          
          if (soldOutMenus.length > 0) {
            setMenuStatusNotification(`${soldOutMenus.map(menu => menu.name).join(', ')} 메뉴가 품절되었습니다.`);
            setTimeout(() => setMenuStatusNotification(null), 5000);
          }
          
          if (availableMenus.length > 0) {
            setMenuStatusNotification(`${availableMenus.map(menu => menu.name).join(', ')} 메뉴가 다시 판매됩니다.`);
            setTimeout(() => setMenuStatusNotification(null), 5000);
          }
        }
        
        setMenus(newMenus);
      }
    } catch (error) {
      console.error('메뉴 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // 카테고리 데이터 (동적으로 생성)
      const categoriesData: Category[] = [
        { id: 'all', name: i18n.t('all') },
        { id: 'main', name: i18n.t('main') },
        { id: 'side', name: i18n.t('side') },
        { id: 'drink', name: i18n.t('drink') },
        { id: 'dessert', name: i18n.t('dessert') },
      ];
      setCategories(categoriesData);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  const addToCart = (menu: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.menuId === menu.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuId === menu.id
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { 
        menuId: menu.id, 
        menuName: menu.name, 
        price: menu.price, 
        quantity: 1, 
        totalPrice: menu.price,
        image: menu.image 
      }];
    });
  };

  const removeFromCart = (menuId: string) => {
    setCartItems(prev => prev.filter(item => item.menuId !== menuId));
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.menuId === menuId ? { ...item, quantity, totalPrice: quantity * item.price } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) return;

    try {
      const orderData = {
        tableId,
        items: cartItems.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
      };

      const response = await orderApi.createOrder(orderData);
      if (response.success) {
        alert(i18n.t('orderSuccess'));
        clearCart();
        setIsCartOpen(false);
      } else {
        alert(i18n.t('orderFailed'));
      }
    } catch (error) {
      console.error('주문 실패:', error);
      alert(i18n.t('orderFailed'));
    }
  };

  const handleCallSubmit = async (callData: CreateCallRequest) => {
    try {
      const response = await callApi.createCall(callData);
      if (response.success) {
        alert(i18n.t('callSuccess'));
        setIsCallModalOpen(false);
      } else {
        alert(i18n.t('callFailed'));
      }
    } catch (error) {
      console.error('호출 실패:', error);
      alert(i18n.t('callFailed'));
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    i18n.setLanguage(language);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{i18n.t('loadingMenu')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {i18n.t('restaurantName')}
              </h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {socketConnected ? i18n.t('connected') : i18n.t('disconnected')}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* 타이머 표시 */}
              {showTimer && (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                  timeLeft <= 60 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300' 
                    : timeLeft <= 120 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold text-lg">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {i18n.t('tableNumber')} {tableId}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메뉴 상태 변경 알림 */}
      {menuStatusNotification && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {menuStatusNotification}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setMenuStatusNotification(null)}
                className="inline-flex text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <span className="sr-only">닫기</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 카테고리 사이드바 */}
          <div className="lg:col-span-1">
            <CategoryList
              categories={categories}
              selectedCategory="all"
              onCategorySelect={(categoryId) => {
                // 카테고리 필터링 로직 (필요시 구현)
              }}
            />
          </div>

          {/* 메뉴 그리드 */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {menus.map((menu) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  onAddToCart={(menuId, quantity) => {
                    const menuItem = menus.find(m => m.id === menuId);
                    if (menuItem) {
                      for (let i = 0; i < quantity; i++) {
                        addToCart(menuItem);
                      }
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <Footer
        totalItems={totalItems}
        totalAmount={totalAmount}
        onCartClick={() => setIsCartOpen(true)}
        onCallClick={() => setIsCallModalOpen(true)}
        onLanguageChange={handleLanguageChange}
        onDarkModeToggle={toggleDarkMode}
        currentLanguage={currentLanguage}
        darkMode={darkMode}
      />

      {/* 장바구니 드로어 */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleOrder}
      />

      {/* 호출 모달 */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onSubmit={handleCallSubmit}
        tableId={tableId}
      />
    </div>
  );
}