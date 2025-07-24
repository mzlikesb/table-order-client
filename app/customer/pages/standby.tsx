import { useState, useEffect } from "react";
import { TableConfig } from "~/utils/tableConfig";

export default function Standby() {
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    const config = TableConfig.getInstance();
    setTableNumber(config.getTableNumber());
  }, []);

  const handleClick = () => {
    // 테이블 번호가 있으면 쿼리 파라미터로 포함하여 메뉴 페이지로 이동
    const url = tableNumber ? `/menu?table=${tableNumber}` : '/menu';
    window.location.href = url;
  };

  return (
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
            {tableNumber || 'N/A'}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            화면을 터치하여 메뉴를 확인하세요
          </p>
          <div className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <span className="text-lg">📱</span>
            <span className="font-semibold">터치하여 시작</span>
          </div>
        </div>
      </div>
    </div>
  );
}