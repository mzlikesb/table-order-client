import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Filter } from 'lucide-react';
import { menuApi } from '../../lib/api';
import type { MenuItem } from '../../types/api';
import AdminLayout from '../components/adminLayout';
import AddMenuModal from '../components/addMenuModal';

export default function AdminMenus() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setError(null);
      const response = await menuApi.getMenus();
      
      if (response.success) {
        setMenus(response.data || []);
      } else {
        console.warn('메뉴 목록 로드 실패:', response.error);
        setError('메뉴 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('메뉴 목록 로드 실패:', error);
      setError('메뉴 목록을 불러오는데 실패했습니다. API 서버 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenu = async (menuData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await menuApi.createMenu(menuData);
      
      if (response.success) {
        alert('메뉴가 성공적으로 추가되었습니다!');
        loadMenus(); // 메뉴 목록 새로고침
      } else {
        console.error('메뉴 추가 실패:', response.error);
        alert(`메뉴 추가에 실패했습니다: ${response.error}`);
      }
    } catch (error) {
      console.error('메뉴 추가 실패:', error);
      alert('메뉴 추가에 실패했습니다. API 서버 연결을 확인해주세요.');
    }
  };

  const toggleMenuAvailability = async (menuId: string, currentStatus: boolean) => {
    try {
      const response = await menuApi.updateMenu(menuId, { isAvailable: !currentStatus });
      
      if (response.success) {
        loadMenus(); // 메뉴 목록 새로고침
      } else {
        console.error('메뉴 상태 변경 실패:', response.error);
        alert(`메뉴 상태 변경에 실패했습니다: ${response.error}`);
      }
    } catch (error) {
      console.error('메뉴 상태 변경 실패:', error);
      alert('메뉴 상태 변경에 실패했습니다. API 서버 연결을 확인해주세요.');
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
        console.error('메뉴 삭제 실패:', response.error);
        alert(`메뉴 삭제에 실패했습니다: ${response.error}`);
      }
    } catch (error) {
      console.error('메뉴 삭제 실패:', error);
      alert('메뉴 삭제에 실패했습니다. API 서버 연결을 확인해주세요.');
    }
  };

  const filteredMenus = menus.filter(menu => {
    const categoryMatch = categoryFilter === 'all' || menu.category === categoryFilter;
    const availabilityMatch = availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && menu.isAvailable !== false) ||
      (availabilityFilter === 'soldout' && menu.isAvailable === false);
    return categoryMatch && availabilityMatch;
  });

  // 서버에서 가져온 메뉴 데이터를 기반으로 카테고리 목록 생성
  const categories = Array.from(new Set(menus.map(menu => menu.category))).sort();

  // 카테고리별 메뉴 개수 계산
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = menus.filter(menu => menu.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  // 판매 상태별 메뉴 개수 계산
  const availableCount = menus.filter(menu => menu.isAvailable !== false).length;
  const soldoutCount = menus.filter(menu => menu.isAvailable === false).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">메뉴 목록을 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* 헤더 */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">메뉴 관리</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">메뉴를 관리하고 품절 상태를 변경하세요</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>메뉴 추가</span>
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">전체 메뉴</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{menus.length}개</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">📋</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">판매 가능</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{availableCount}개</p>
            </div>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">✅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">품절</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{soldoutCount}개</p>
            </div>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-sm font-medium">❌</span>
            </div>
          </div>
        </div>
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
            <option value="all">모든 카테고리 ({menus.length}개)</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category} ({categoryCounts[category]}개)
              </option>
            ))}
          </select>

          {/* 판매 상태 필터 */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 상태 ({menus.length}개)</option>
            <option value="available">판매 가능 ({availableCount}개)</option>
            <option value="soldout">품절 ({soldoutCount}개)</option>
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
              <p className="text-gray-500 dark:text-gray-400">
                {menus.length === 0 ? '등록된 메뉴가 없습니다.' : '필터 조건에 맞는 메뉴가 없습니다.'}
              </p>
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

      {/* 메뉴 추가 모달 */}
      <AddMenuModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMenu}
        existingCategories={categories}
      />
    </AdminLayout>
  );
} 