import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Phone, Sun, Moon, Languages, Clock, Store } from 'lucide-react';
import CategoryList from '../components/categoryList';
import MenuCard from '../components/menuCard';
import CartDrawer from '../components/cartDrawer';
import CallModal from '../components/callModal';
import Footer from '../components/footer';
import { menuApi, orderApi, callApi, menuCategoryApi } from '../../lib/api';
import { initSocket, joinTableRoom, onMenuUpdate, offMenuUpdate } from '../../lib/socket';
import type { MenuItem, Category, CartItem } from '../../types/menu';
import type { Order, CreateCallRequest, Store as StoreType } from '../../types/api';
import { i18n, initializeLanguage, type Language } from '../../utils/i18n';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

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
  const [tableId, setTableId] = useState<string>('1');
  const [store, setStore] = useState<StoreType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [actualTableId, setActualTableId] = useState<string>(''); // 실제 테이블 ID
  const [error, setError] = useState<string | null>(null);
  
  // 타이머 관련 상태
  const [timeLeft, setTimeLeft] = useState(300); // 300초 (5분)
  const [showTimer, setShowTimer] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousMenuCountRef = useRef<number>(0);

  // 테이블 ID 가져오기 함수
  const getTableId = () => {
    const urlTable = new URLSearchParams(window.location.search).get('table');
    const localTable = localStorage.getItem('table_number');
    return urlTable || localTable || '1';
  };

  // 스토어 정보 가져오기 함수
  const getStoreInfo = () => {
    const savedStore = localStorage.getItem('admin_store');
    if (savedStore) {
      try {
        return JSON.parse(savedStore);
      } catch {
        return null;
      }
    }
    return null;
  };

  // storeId 추출
  const storeId = store?.id;

  // 스토어 존재 여부 확인
  const checkStoreExists = async (storeId: string) => {
    try {
      // 먼저 인증 없이 시도
      let response = await fetch(`${API_BASE_URL}/stores/${storeId}`);
      
      // 401 에러가 나면 인증 토큰과 함께 다시 시도
      if (response.status === 401) {
        const token = localStorage.getItem('authToken');
        if (token) {
          response = await fetch(`${API_BASE_URL}/stores/${storeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
        }
      }
      
      return response.ok;
    } catch (error) {
      console.error('스토어 존재 확인 실패:', error);
      return false;
    }
  };

  // 사용 가능한 스토어 목록 가져오기
  const loadAvailableStores = async () => {
    try {
      // 먼저 인증 없이 시도
      let response = await fetch(`${API_BASE_URL}/stores`);
      
      // 401 에러가 나면 인증 토큰과 함께 다시 시도
      if (response.status === 401) {
        const token = localStorage.getItem('authToken');
        if (token) {
          response = await fetch(`${API_BASE_URL}/stores`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
        }
      }
      
      if (response.ok) {
        const stores = await response.json();
        return stores;
      }
    } catch (error) {
      console.error('스토어 목록 로드 실패:', error);
    }
    return [];
  };

  // 테이블 번호로 테이블 ID 찾기
  const findTableIdByNumber = async (tableNumber: string, storeId: string) => {
    try {
      // 고객용 테이블 API 호출 (임시로 인증 토큰 사용)
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/tables/store/${storeId}`, {
        headers,
      });
      
      if (response.ok) {
        const tables = await response.json();
        const table = tables.find((t: any) => String(t.table_number) === tableNumber);
        return table ? table.id : null;
      } else {
        console.error('테이블 API 에러:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('테이블 ID 찾기 실패:', error);
    }
    return null;
  };

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
    // 스토어 정보 초기화
    const storeInfo = getStoreInfo();
    setStore(storeInfo);
    
    // 테이블 번호 초기화
    const currentTableId = getTableId();
    setTableId(currentTableId);
    
    // Socket.IO 초기화 및 테이블 룸 참가
    const socket = initSocket();
    joinTableRoom(currentTableId);
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

    // 타이머 시작
    resetTimer();

    // 클린업
    return () => {
      clearTimer();
      offMenuUpdate(handleMenuUpdate);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []); // 초기 설정만

  // storeId가 설정되면 데이터 로드
  useEffect(() => {
    if (storeId) {
      console.log('스토어 ID 설정됨:', storeId);
      
      // 스토어 존재 여부 확인 후 메뉴 로드
      const validateAndLoadData = async () => {
        try {
          const storeExists = await checkStoreExists(storeId);
          if (!storeExists) {
            console.error(`스토어 ID ${storeId}가 존재하지 않습니다.`);
            
            // 사용 가능한 스토어 목록 가져오기
            const availableStores = await loadAvailableStores();
            if (availableStores.length > 0) {
              const firstStore = availableStores[0];
              console.log('첫 번째 사용 가능한 스토어로 변경:', firstStore);
              setStore(firstStore);
              setError(`스토어 ID ${storeId}를 찾을 수 없어서 첫 번째 사용 가능한 스토어(${firstStore.name})로 변경했습니다.`);
            } else {
              console.log('스토어 API 실패로 인해 기본 스토어 정보를 사용합니다.');
              // 스토어 API 실패 시에도 메뉴 로드 계속 진행
              setError(`스토어 정보를 불러올 수 없어 기본 메뉴를 표시합니다.`);
            }
          }
        } catch (error) {
          console.error('스토어 검증 실패:', error);
          console.log('스토어 검증 실패로 인해 기본 메뉴를 로드합니다.');
          setError('스토어 정보를 확인할 수 없어 기본 메뉴를 표시합니다.');
        }
        
        // 스토어 검증 결과와 관계없이 메뉴 로드 진행
        loadMenus();
        loadCategories();
        
        // 테이블 번호로 실제 테이블 ID 찾기
        const findTableId = async () => {
          const actualId = await findTableIdByNumber(tableId, storeId);
          if (actualId) {
            setActualTableId(actualId);
          } else {
            console.error('테이블 ID를 찾을 수 없음:', tableId);
          }
        };
        findTableId();
      };
      
      validateAndLoadData();
    }
  }, [storeId]);

  // 테이블 번호 변경 감지
  useEffect(() => {
    const currentTableId = getTableId();
    if (currentTableId !== tableId) {
      setTableId(currentTableId);
      console.log('테이블 번호 변경됨:', currentTableId);
    }
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
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 언어 초기화
  useEffect(() => {
    initializeLanguage();
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 하드코딩된 메뉴 데이터 (API 실패 시 사용)
  const getFallbackMenus = (): MenuItem[] => {
    return [
      {
        id: '1',
        name: '아메리카노',
        price: 4500,
        image: '',
        description: '깔끔한 아메리카노',
        category: '커피',
        categoryId: '1',
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: '카페라떼',
        price: 5000,
        image: '',
        description: '부드러운 카페라떼',
        category: '커피',
        categoryId: '1',
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: '치즈케이크',
        price: 6500,
        image: '',
        description: '진한 치즈케이크',
        category: '디저트',
        categoryId: '2',
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  };

  // 하드코딩된 카테고리 데이터 (API 실패 시 사용)
  const getFallbackCategories = (): Category[] => {
    return [
      { id: '1', name: '커피' },
      { id: '2', name: '디저트' },
    ];
  };

  const loadMenus = async () => {
    try {
      console.log('메뉴 로드 시작 - storeId:', storeId);
      setError(null); // 에러 상태 초기화
      
      // storeId가 없으면 조기 반환
      if (!storeId) {
        console.log('storeId가 없어서 메뉴 로드를 건너뜁니다.');
        setLoading(false);
        return;
      }
      
      // 1. 먼저 키오스크 API 시도
      console.log('키오스크 API 시도 중...');
      const kioskResponse = await menuApi.getKioskMenus(storeId);
      console.log('키오스크 API 응답:', kioskResponse);
      
      if (kioskResponse.success) {
        // 키오스크 API 성공
        const menusForFrontend = (kioskResponse.data || []).map((item: any) => {
          return {
            id: item.id,
            name: item.name,
            price: Math.round(Number(item.price)),
            image: item.image,
            description: item.description,
            category: item.categoryName || item.category || '',
            categoryId: item.categoryId || item.category_id,
            isAvailable: item.isAvailable,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        });
        console.log('키오스크 API 성공 - 변환된 메뉴:', menusForFrontend);
        setMenus(menusForFrontend);
        setLoading(false);
        return;
      }
      
      // 2. 키오스크 API 실패 시 기존 고객용 API 시도
      console.log('키오스크 API 실패, 고객용 API 시도 중...');
      const response = await menuApi.getCustomerMenus(storeId);
      console.log('고객용 메뉴 API 응답:', response);
      
      if (response.success) {
        // API 타입을 프론트 MenuItem 타입으로 변환
        const menusForFrontend = (response.data || []).map((item: any) => {
          return {
            id: item.id,
            name: item.name,
            price: Math.round(Number(item.price)), // 문자열을 숫자로 변환하고 소수점 제거
            image: item.image,
            description: item.description,
            category: item.categoryName || item.category || '',
            categoryId: item.categoryId || item.category_id,
            isAvailable: item.isAvailable,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        });
        console.log('고객용 API 성공 - 변환된 메뉴:', menusForFrontend);
        setMenus(menusForFrontend);
      } else {
        console.error('메뉴 로드 실패:', response.error);
        
        // API 실패 시 하드코딩된 메뉴 사용
        console.log('API 실패로 인해 하드코딩된 메뉴를 사용합니다.');
        const fallbackMenus = getFallbackMenus();
        setMenus(fallbackMenus);
        setError('서버 연결에 실패하여 기본 메뉴를 표시합니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('메뉴 로드 에러:', error);
      
      // 에러 시 하드코딩된 메뉴 사용
      console.log('네트워크 오류로 인해 하드코딩된 메뉴를 사용합니다.');
      const fallbackMenus = getFallbackMenus();
      setMenus(fallbackMenus);
      setError('네트워크 오류로 인해 기본 메뉴를 표시합니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await menuCategoryApi.getCategories(storeId);
      if (response.success) {
        setCategories(response.data || []);
      } else {
        console.error('카테고리 로드 실패:', response.error);
        // API 실패 시 하드코딩된 카테고리 사용
        console.log('API 실패로 인해 하드코딩된 카테고리를 사용합니다.');
        const fallbackCategories = getFallbackCategories();
        setCategories(fallbackCategories);
      }
    } catch (error) {
      console.error('카테고리 로드 에러:', error);
      // 에러 시 하드코딩된 카테고리 사용
      console.log('네트워크 오류로 인해 하드코딩된 카테고리를 사용합니다.');
      const fallbackCategories = getFallbackCategories();
      setCategories(fallbackCategories);
    }
  };

  const addToCart = (menu: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.menuId === menu.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuId === menu.id
            ? { ...item, quantity: item.quantity + 1, totalPrice: Math.round((item.quantity + 1) * item.price) }
            : item
        );
      }
      return [...prev, { 
        menuId: menu.id, 
        menuName: menu.name, 
        price: Math.round(menu.price), 
        quantity: 1, 
        totalPrice: Math.round(menu.price),
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
        item.menuId === menuId ? { ...item, quantity, totalPrice: Math.round(quantity * item.price) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) return;
    if (!store?.id) {
      alert('스토어 정보가 없습니다.');
      return;
    }
    if (!actualTableId) {
      alert('테이블 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const orderData = {
        store_id: store.id, // 스네이크 케이스로 변경
        table_id: actualTableId,  // 실제 테이블 ID 사용
        items: cartItems.map(item => ({
          menu_id: item.menuId,     // 스네이크 케이스로 변경
          quantity: item.quantity,
          unit_price: item.price,   // unit_price로 변경
          notes: null
        })),
        total_amount: cartItems.reduce((sum, item) => sum + item.totalPrice, 0), // 스네이크 케이스로 변경
        notes: null
      };

      console.log('주문 데이터:', orderData);

      const response = await orderApi.createOrder(orderData);
      if (response.success) {
        alert(i18n.t('orderSuccess'));
        clearCart();
        setIsCartOpen(false);
      } else {
        alert(response.error || i18n.t('orderFailed'));
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
        alert(response.error || i18n.t('callFailed'));
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
    localStorage.setItem('language', language);
    i18n.setLanguage(language);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Math.round(cartItems.reduce((sum, item) => sum + item.totalPrice, 0));

  // 카테고리별 메뉴 필터링
  const filteredMenus = menus.filter(menu => {
    if (selectedCategory === 'all') return true;
    return String(menu.categoryId) === String(selectedCategory);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">메뉴를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {store ? store.name : i18n.t('restaurantName')}
              </h1>
              {store && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <Store className="w-4 h-4" />
                  <span>{store.code}</span>
                </div>
              )}
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

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
            <div className="ml-3 flex items-center space-x-2">
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  loadMenus();
                }}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 dark:text-red-300 dark:bg-red-800 dark:border-red-600 dark:hover:bg-red-700"
              >
                다시 시도
              </button>
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-500 hover:text-red-700 dark:hover:text-red-300"
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
              selectedCategory={selectedCategory}
              onCategorySelect={(categoryId) => {
                setSelectedCategory(categoryId);
              }}
            />
          </div>

          {/* 메뉴 그리드 */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMenus.map((menu) => (
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
        tableId={actualTableId || tableId}
        storeId={storeId || ''}
      />
    </div>
  );
}