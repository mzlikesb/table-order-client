import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Filter } from 'lucide-react';
import { menuApi } from '../../lib/api';
import type { MenuItem } from '../../types/api';
import AdminNav from '../components/adminNav';

export default function AdminMenus() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      const response = await menuApi.getAdminMenus();
      if (response.success) {
        setMenus(response.data || []);
      }
    } catch (error) {
      console.error('메뉴 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenuAvailability = async (menuId: string, currentStatus: boolean) => {
    try {
      const response = await menuApi.updateMenu(menuId, { isAvailable: !currentStatus });
      if (response.success) {
        loadMenus(); // 메뉴 목록 새로고침
      } else {
        alert('메뉴 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('메뉴 상태 변경 실패:', error);
      alert('메뉴 상태 변경에 실패했습니다.');
    }
  };

  const deleteMenu = async (menuId: string) => {
    if (!confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await menuApi.deleteMenu(menuId);
      if (response.success) {
        loadMenus(); // 메뉴 목록 새로고침
      } else {
        alert('메뉴 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('메뉴 삭제 실패:', error);
      alert('메뉴 삭제에 실패했습니다.');
    }
  };

  const filteredMenus = menus.filter(menu => {
    const categoryMatch = categoryFilter === 'all' || menu.category === categoryFilter;
    const availabilityMatch = availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && menu.isAvailable !== false) ||
      (availabilityFilter === 'soldout' && menu.isAvailable === false);
    return categoryMatch && availabilityMatch;
  });

  const categories = Array.from(new Set(menus.map(menu => menu.category)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">메뉴 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">메뉴 관리</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">메뉴를 관리하고 품절 상태를 변경하세요</p>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>메뉴 추가</span>
          </button>
        </div>

        {/* 필터 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">필터:</span>
            </div>
            
            {/* 카테고리 필터 */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 카테고리</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* 판매 상태 필터 */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 상태</option>
              <option value="available">판매 가능</option>
              <option value="soldout">품절</option>
            </select>
          </div>
        </div>

        {/* 메뉴 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              메뉴 목록 ({filteredMenus.length}개)
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredMenus.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">메뉴가 없습니다.</p>
              </div>
            ) : (
              filteredMenus.map((menu) => (
                <div key={menu.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {/* 메뉴 이미지 */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-600">
                    {menu.image ? (
                      <img
                        src={menu.image}
                        alt={menu.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500">이미지 없음</span>
                      </div>
                    )}
                    {/* 품절 오버레이 */}
                    {menu.isAvailable === false && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">품절</span>
                      </div>
                    )}
                  </div>

                  {/* 메뉴 정보 */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{menu.name}</h3>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₩{menu.price.toLocaleString()}
                      </span>
                    </div>
                    
                    {menu.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {menu.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {menu.category}
                      </span>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleMenuAvailability(menu.id, menu.isAvailable ?? true)}
                          className={`p-2 rounded-lg transition-colors ${
                            (menu.isAvailable ?? true)
                              ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                          }`}
                          title={(menu.isAvailable ?? true) ? '품절 처리' : '판매 재개'}
                        >
                          {(menu.isAvailable ?? true) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteMenu(menu.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 