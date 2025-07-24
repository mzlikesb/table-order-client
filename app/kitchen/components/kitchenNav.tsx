import { Home, Utensils } from 'lucide-react';

export default function KitchenNav() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Utensils className="w-8 h-8 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">주방 관리 시스템</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/kitchen"
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>주문 관리</span>
            </a>
            <a
              href="/admin"
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span>관리자 페이지</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
} 