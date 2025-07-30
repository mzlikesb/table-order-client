import { useState, useEffect } from 'react';
import { Key, ArrowRight, Store } from 'lucide-react';
import { i18n, initializeLanguage, type Language } from '../../utils/i18n';
import { tableApi, storeApi } from '../../lib/api';

export default function TableSetup() {
  const [tableIdInput, setTableIdInput] = useState('');
  const [tableIdLoading, setTableIdLoading] = useState(false);
  const [tableIdError, setTableIdError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ko');

  useEffect(() => {
    initializeLanguage();
  }, [currentLanguage]);

  // 테이블 ID로 자동 설정
  const handleTableIdSubmit = async () => {
    if (!tableIdInput.trim()) {
      setTableIdError('테이블 ID를 입력해주세요.');
      return;
    }

    setTableIdLoading(true);
    setTableIdError(null);

    try {
      console.log('테이블 ID로 설정 시도:', tableIdInput);
      
      // 1. 테이블 정보 조회: GET /api/tables/public/{tableId}
      const tableResult = await tableApi.getPublicTable(tableIdInput);
      
      if (!tableResult.success || !tableResult.data) {
        // 백엔드 API 미구현 시 더 명확한 메시지
        if (tableResult.error?.includes('404') || tableResult.error?.includes('Not Found')) {
          setTableIdError('백엔드 API가 아직 구현되지 않았습니다. 관리자에게 문의하세요.');
        } else {
          setTableIdError('테이블 정보를 찾을 수 없습니다. 테이블 ID를 확인해주세요.');
        }
        return;
      }

      const tableInfo = tableResult.data;
      console.log('테이블 정보 조회 성공:', tableInfo);

      // 2. 스토어 정보 조회: GET /api/stores/public/{storeId}
      const storeResult = await storeApi.getPublicStore(tableInfo.storeId);
      
      if (!storeResult.success || !storeResult.data) {
        setTableIdError('스토어 정보를 찾을 수 없습니다. 관리자에게 문의하세요.');
        return;
      }
      
      const storeData = storeResult.data;

      console.log('스토어 정보 조회 성공:', storeData);

      // 3. localStorage에 정보 저장
      localStorage.setItem('table_number', tableInfo.number);
      localStorage.setItem('admin_store', JSON.stringify(storeData));

      console.log('테이블 ID 설정 완료:', {
        tableId: tableInfo.id,
        tableNumber: tableInfo.number,
        storeId: tableInfo.storeId,
        storeName: storeData.name
      });

      // 4. 메뉴 페이지로 이동
      window.location.href = `/menu?table=${tableInfo.number}`;

    } catch (error) {
      console.error('테이블 ID 설정 실패:', error);
      setTableIdError('테이블 ID 설정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setTableIdLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              테이블 설정
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              테이블 ID를 입력하여 자동으로 스토어와 테이블 정보를 설정하세요.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="tableId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                테이블 ID
              </label>
              <input
                type="text"
                id="tableId"
                value={tableIdInput}
                onChange={(e) => setTableIdInput(e.target.value)}
                placeholder="예: 5"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTableIdSubmit();
                  }
                }}
                autoFocus
              />
            </div>

            {tableIdError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {tableIdError}
              </div>
            )}

            <button
              onClick={handleTableIdSubmit}
              disabled={tableIdLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {tableIdLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>설정 중...</span>
                </>
              ) : (
                <>
                  <span>설정하기</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 text-center space-y-2">
            <p>테이블 ID는 매장에서 제공하는 고유 번호입니다.</p>
            <p>백엔드 API 구현이 완료되면 자동으로 스토어와 테이블 정보가 설정됩니다.</p>
          </div>

          {/* 언어 변경 버튼 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                const newLang = currentLanguage === 'ko' ? 'en' : 'ko';
                setCurrentLanguage(newLang);
              }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {currentLanguage === 'ko' ? 'English' : '한국어'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 