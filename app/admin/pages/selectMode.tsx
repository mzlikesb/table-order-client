import { useState, useEffect } from 'react';
import { Users, ShoppingCart, Table, ArrowRight, User, Settings, X } from 'lucide-react';
import { tableApi } from '../../lib/api';
import type { Table as TableType } from '../../types/api';
import ProtectedRoute from '../components/ProtectedRoute';

function SelectModeContent() {
  const [tables, setTables] = useState<TableType[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    console.log('showTableModal 상태 변경:', showTableModal);
  }, [showTableModal]);

  const loadTables = async () => {
    try {
      setError(null);
      const response = await tableApi.getTables();
      if (response.success) {
        setTables(response.data || []);
      } else {
        console.warn('테이블 목록 로드 실패:', response.error);
        setError('테이블 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('테이블 목록 로드 실패:', error);
      setError('테이블 목록을 불러오는데 실패했습니다. API 서버 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerMode = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowTableModal(true);
  };

  const handleTableSelect = (tableNumber: string) => {
    setSelectedTable(tableNumber);
    // 테이블 정보를 localStorage에 저장하고 고객 페이지로 이동
    localStorage.setItem('table_number', tableNumber);
    window.location.href = `/menu?table=${tableNumber}`;
  };

  const handleAdminMode = () => {
    if (!selectedTable) {
      alert('테이블을 먼저 선택해주세요.');
      return;
    }
    // 관리자 모드: 관리자 대시보드로 이동
    window.location.href = '/admin';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '사용 가능';
      case 'occupied': return '사용 중';
      case 'reserved': return '예약됨';
      case 'maintenance': return '점검 중';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">테이블 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 모드 선택 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              모드 선택
            </h3>
            
            <div className="space-y-4">
              {/* 고객 모드 */}
              <button
                onClick={handleCustomerMode}
                className="w-full p-6 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 flex items-center justify-between"
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
                disabled={!selectedTable}
                className={`w-full p-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                  selectedTable
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
                    {selectedTable && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        테이블 {selectedTable} 관리
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 선택 안내 */}
            {!selectedTable && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                  관리자 모드를 사용하려면 먼저 테이블을 선택해주세요.
                </p>
              </div>
            )}
          </div>

          {/* 테이블 선택 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Table className="w-5 h-5 mr-2" />
              테이블 선택
            </h3>
            
            {tables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">등록된 테이블이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.number)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedTable === table.number
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {table.number}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {table.capacity}인석
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(table.status)}`}>
                        {getStatusText(table.status)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 빠른 이동 버튼 */}
        <div className="mt-8 text-center">
          <div className="inline-flex space-x-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              관리자 대시보드로 바로 이동
            </button>
            <button
              onClick={handleCustomerMode}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              고객 페이지로 바로 이동
            </button>
          </div>
        </div>

        {/* 테이블 선택 모달 */}
        {showTableModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ zIndex: 9999 }}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{ zIndex: 10000 }}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    테이블 선택
                  </h3>
                  <button
                    onClick={() => setShowTableModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  고객 모드에서 사용할 테이블을 선택하세요.
                </p>

                {tables.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">등록된 테이블이 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {tables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => handleTableSelect(table.number)}
                        className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {table.number}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {table.capacity}인석
                          </div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(table.status)}`}>
                            {getStatusText(table.status)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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