import { useState, useEffect } from 'react';
import { Home, Utensils, ShoppingCart, Phone, Table, LogOut, User, Settings, Store, Menu, X } from 'lucide-react';
import StoreSelector from '../../components/storeSelector';
import type { Store as StoreType } from '../../types/api';

export default function AdminNav() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [store, setStore] = useState<StoreType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    // 클라이언트 사이드에서만 window 객체에 접근
    setCurrentPath(window.location.pathname);
    
    // 로그인된 관리자 정보 가져오기
    const username = localStorage.getItem('admin_username');
    if (username) {
      setAdminUsername(username);
    }

    // 스토어 정보 초기화
    const storeInfo = getStoreInfo();
    setStore(storeInfo);
  }, []);

  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      localStorage.removeItem('admin_logged_in');
      localStorage.removeItem('admin_username');
      localStorage.removeItem('admin_store');
      window.location.href = '/admin/login';
    }
  };

  const handleModeSelect = () => {
    window.location.href = '/admin/select-mode';
  };

  const handleStoreSelect = (selectedStore: StoreType) => {
    setStore(selectedStore);
    localStorage.setItem('admin_store', JSON.stringify(selectedStore));
    // 페이지 새로고침하여 모든 컴포넌트에 스토어 변경 반영
    window.location.reload();
  };

  const navItems = [
    { path: '/admin', label: '대시보드', icon: Home },
    { path: '/admin/orders', label: '주문 관리', icon: ShoppingCart },
    { path: '/admin/calls', label: '호출 관리', icon: Phone },
    { path: '/admin/menus', label: '메뉴 관리', icon: Utensils },
    { path: '/admin/tables', label: '테이블 관리', icon: Table },
    { path: '/admin/stores', label: '스토어 관리', icon: Store },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* 로고/브랜드 영역 */}
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              관리자 패널
            </h1>
          </div>

          {/* 데스크톱 네비게이션 (아이콘만) */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <a
                  key={item.path}
                  href={item.path}
                  title={item.label}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          {/* 우측 영역 */}
          <div className="flex items-center space-x-3">
            {/* 스토어 선택기 */}
            <div className="hidden md:block w-40">
              <StoreSelector
                selectedStoreId={store?.id}
                onStoreSelect={handleStoreSelect}
                className="text-sm"
              />
            </div>

            {/* 사용자 정보 및 버튼들 */}
            <div className="hidden md:flex items-center space-x-2">
              {adminUsername && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <User className="w-3 h-3 mr-1" />
                  <span>{adminUsername}</span>
                </div>
              )}
              <button
                onClick={handleModeSelect}
                title="모드 선택"
                className="flex items-center justify-center w-8 h-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                title="로그아웃"
                className="flex items-center justify-center w-8 h-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* 햄버거 메뉴 버튼 */}
            <button
              onClick={toggleMenu}
              className="lg:hidden flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 dark:bg-gray-700 rounded-lg mt-2 mb-4">
              {/* 스토어 선택기 (모바일) */}
              <div className="px-3 py-2">
                <StoreSelector
                  selectedStoreId={store?.id}
                  onStoreSelect={handleStoreSelect}
                  className="text-sm"
                />
              </div>
              
              {/* 선택된 스토어 정보 (모바일) */}
              {store && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mx-3 mb-3">
                  <Store className="w-4 h-4 text-blue-500" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 dark:text-blue-100">{store.name}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">{store.code}</div>
                  </div>
                </div>
              )}

              {/* 네비게이션 메뉴 (모바일) */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </a>
                );
              })}

              {/* 사용자 정보 및 버튼들 (모바일) */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                {adminUsername && (
                  <div className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span>{adminUsername}</span>
                  </div>
                )}
                <button
                  onClick={handleModeSelect}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  모드 선택
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 