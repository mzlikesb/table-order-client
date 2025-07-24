import { useState, useEffect } from 'react';
import { Home, Utensils, ShoppingCart, Phone, Table } from 'lucide-react';

export default function AdminNav() {
  const [currentPath, setCurrentPath] = useState<string>('');

  useEffect(() => {
    // 클라이언트 사이드에서만 window 객체에 접근
    setCurrentPath(window.location.pathname);
  }, []);

  const navItems = [
    { path: '/admin', label: '대시보드', icon: Home },
    { path: '/admin/orders', label: '주문 관리', icon: ShoppingCart },
    { path: '/admin/calls', label: '호출 관리', icon: Phone },
    { path: '/admin/menus', label: '메뉴 관리', icon: Utensils },
    { path: '/admin/tables', label: '테이블 관리', icon: Table },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
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
      </div>
    </nav>
  );
} 