import { useState, useEffect } from 'react';
import { Users, ArrowRight, User, Settings } from 'lucide-react';
import type { Store } from '../../types/api';
import ProtectedRoute from '../components/ProtectedRoute';
import StoreSelector from '../../components/storeSelector';

function SelectModeContent() {
  const [store, setStore] = useState<Store | null>(null);



  useEffect(() => {
    // localStorage에서 store 정보 불러오기
    const savedStore = localStorage.getItem('admin_store');
    if (savedStore) {
      try {
        setStore(JSON.parse(savedStore));
      } catch {}
    }
  }, []);



  const handleStoreSelect = (selected: Store) => {
    setStore(selected);
    localStorage.setItem('admin_store', JSON.stringify(selected));
  };

  const handleCustomerMode = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // 고객 모드: 테이블 설정 페이지로 이동
    window.location.href = '/table-setup';
  };



  const handleAdminMode = () => {
    if (!store) {
      alert('스토어를 먼저 선택해주세요.');
      return;
    }
    // 관리자 모드: 관리자 대시보드로 이동 (테이블 선택 불필요)
    window.location.href = '/admin';
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🍽️
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            모드 선택
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            사용할 모드를 선택하세요
          </p>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 스토어 선택 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />스토어 선택
            </h3>
            <StoreSelector
              selectedStoreId={store?.id}
              onStoreSelect={handleStoreSelect}
            />
            {!store && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                  먼저 스토어를 선택하세요.
                </p>
              </div>
            )}
          </div>

          {/* 모드 선택 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              모드 선택
            </h3>
            <div className="space-y-4">
              {/* 고객 모드 */}
              <button
                onClick={handleCustomerMode}
                disabled={!store}
                className={`w-full p-6 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 flex items-center justify-between ${!store ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500 text-white mr-4">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      고객 모드
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      메뉴 주문 및 호출 서비스
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      테이블 선택 후 이동
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* 관리자 모드 */}
              <button
                onClick={handleAdminMode}
                disabled={!store}
                className={`w-full p-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                  store
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500 text-white mr-4">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      관리자 모드
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      주문 관리 및 매장 운영
                    </p>
                    {store && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {store.name} 관리
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {/* 선택 안내 */}
            {(!store) && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                  먼저 스토어를 선택하세요.
                </p>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}

export default function SelectMode() {
  return (
    <ProtectedRoute>
      <SelectModeContent />
    </ProtectedRoute>
  );
} 