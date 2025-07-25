import { useState, useEffect } from 'react';
import { Home, Utensils, ShoppingCart, Phone, Table, LogOut, User, Settings, Store } from 'lucide-react';
import StoreSelector from '../../components/storeSelector';
import type { Store as StoreType } from '../../types/api';

export default function AdminNav() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [store, setStore] = useState<StoreType | null>(null);

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

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* 네비게이션 메뉴 */}
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-all duration-300 ease-in-out transform ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 scale-105'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105'
                  }`}
                  style={{ 
                    willChange: 'transform, color, border-color',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)'
                  }}
                >
                  <Icon className="w-4 h-4 mr-2 transition-transform duration-200" />
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* 스토어 선택기 */}
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <StoreSelector
                selectedStoreId={store?.id}
                onStoreSelect={handleStoreSelect}
                className="text-sm"
              />
            </div>
            
            {/* 선택된 스토어 정보 */}
            {store && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Store className="w-4 h-4 text-blue-500" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900 dark:text-blue-100">{store.name}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">{store.code}</div>
                </div>
              </div>
            )}
          </div>

          {/* 사용자 정보 및 버튼들 */}
          <div className="flex items-center space-x-4">
            {adminUsername && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4 mr-2" />
                <span>{adminUsername}</span>
              </div>
            )}
            <button
              onClick={handleModeSelect}
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              모드 선택
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 