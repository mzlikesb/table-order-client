import { useState, useEffect } from "react";
import { TableConfig } from "~/utils/tableConfig";
import { tableApi } from "../../lib/api";
import type { Table } from "../../types/api";

export default function Standby() {
  const [tableNumber, setTableNumber] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const config = TableConfig.getInstance();
    const storedTable = config.getTableNumber();
    setTableNumber(storedTable);
    
    // 저장된 테이블이 없으면 모달 표시
    if (!storedTable || storedTable === '') {
      loadTables();
      setShowTableModal(true);
    }
  }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      const response = await tableApi.getTables();
      if (response.success) {
        setTables(response.data || []);
      }
    } catch (error) {
      console.error('테이블 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (selectedTable: Table) => {
    const config = TableConfig.getInstance();
    config.setTableNumber(selectedTable.number);
    setTableNumber(selectedTable.number);
    setShowTableModal(false);
  };

  const handleClick = () => {
    if (tableNumber) {
      const url = `/menu?table=${tableNumber}`;
      window.location.href = url;
    } else {
      loadTables();
      setShowTableModal(true);
    }
  };

  return (
    <>
      <div 
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center cursor-pointer"
        onClick={handleClick}
      >
        <div className="text-center p-8">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              🍽️
            </h1>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Table Order System
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              테이블 주문 시스템
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              테이블 번호
            </p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {tableNumber || '선택 필요'}
            </p>
            {!tableNumber && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                클릭하여 테이블을 선택하세요
              </p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {tableNumber ? '메뉴 보기' : '테이블 선택'}
            </p>
          </div>
        </div>
      </div>

      {/* 테이블 선택 모달 */}
      {showTableModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTableModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                테이블을 선택해주세요
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                주문할 테이블을 선택하세요
              </p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">테이블 목록을 불러오는 중...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tables
                    .filter(table => table.status === 'available')
                    .map((table) => (
                      <button
                        key={table.id}
                        onClick={() => handleTableSelect(table)}
                        className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-center"
                      >
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {table.number}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {table.capacity}인용
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          사용 가능
                        </div>
                      </button>
                    ))}
                </div>
              )}

              {!loading && tables.filter(t => t.status === 'available').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    사용 가능한 테이블이 없습니다.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowTableModal(false)}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}