import React, { useState, useEffect } from 'react';
import { Plus, Filter, Eye, EyeOff, Edit, Trash2, Tag } from 'lucide-react';
import AdminLayout from '../components/adminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AddMenuModal from '../components/addMenuModal';
import AddCategoryModal from '../components/addCategoryModal';
import { menuApi } from '../../lib/api/menus';
import { menuCategoryApi } from '../../lib/api/menuCategories';
import type { MenuItem, MenuCategory } from '../../types/api';

function AdminMenusContent() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [categoryLoading, setCategoryLoading] = useState(false);

  // 스토어 정보 가져오기
  const getStoreInfo = () => {
    const storeInfo = localStorage.getItem('admin_store');
    const parsed = storeInfo ? JSON.parse(storeInfo) : null;
    console.log('Store info from localStorage:', parsed);
    return parsed;
  };

  const store = getStoreInfo();

  // 메뉴 목록 로드
  const loadMenus = async (storeId?: string) => {
    if (!storeId) return;
    
    setLoading(true);
    try {
      const response = await menuApi.getMenus(storeId);
      if (response.success) {
        setMenus(response.data || []);
      } else {
        console.error('메뉴 로드 실패:', response.error);
        setMenus([]);
      }
    } catch (error) {
      console.error('메뉴 로드 실패:', error);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 목록 로드
  const loadCategories = async (storeId?: string) => {
    if (!storeId) return;
    
    setCategoryLoading(true);
    try {
      const response = await menuCategoryApi.getCategories(storeId);
      if (response.success) {
        setMenuCategories(response.data || []);
      } else {
        console.error('카테고리 로드 실패:', response.error);
        setMenuCategories([]);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
      setMenuCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (store?.id) {
      loadMenus(store.id);
      loadCategories(store.id);
    }
  }, [store?.id]);

  // 메뉴 추가
  const handleAddMenu = async (menuData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // AddMenuModal에서 이미 storeId를 포함해서 보내므로 그대로 사용
      const response = await menuApi.createMenu(menuData);
      
      if (response.success) {
        alert('메뉴가 성공적으로 추가되었습니다!');
        // 새로 추가된 메뉴를 상태에 추가하여 즉시 화면 업데이트
        setMenus(prev => [...prev, response.data!]);
      } else {
        console.error('메뉴 추가 실패:', response.error);
        alert(`메뉴 추가에 실패했습니다: ${response.error}`);
      }
    } catch (error) {
      console.error('메뉴 추가 실패:', error);
      alert('메뉴 추가에 실패했습니다. API 서버 연결을 확인해주세요.');
    }
  };

  // 카테고리 추가
  const handleAddCategory = async (categoryName: string) => {
    if (!store?.id) {
      alert('스토어가 선택되지 않았습니다.');
      return;
    }

    console.log('Creating category for store:', store.id, 'with name:', categoryName);

    try {
      const response = await menuCategoryApi.createCategory({
        storeId: store.id,
        name: categoryName,
        sortOrder: menuCategories.length
      });
      
      if (response.success) {
        alert('카테고리가 성공적으로 추가되었습니다!');
        setIsAddCategoryModalOpen(false);
        // 새로 추가된 카테고리를 상태에 추가하여 즉시 화면 업데이트
        setMenuCategories(prev => [...prev, response.data!]);
      } else {
        console.error('카테고리 추가 실패:', response.error);
        alert(`카테고리 추가에 실패했습니다: ${response.error}`);
      }
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
      alert('카테고리 추가에 실패했습니다. API 서버 연결을 확인해주세요.');
    }
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('정말로 이 카테고리를 삭제하시겠습니까? 이 카테고리의 모든 메뉴도 함께 삭제됩니다.')) {
      return;
    }

    try {
      const response = await menuCategoryApi.deleteCategory(categoryId);
      
      if (response.success) {
        alert('카테고리가 성공적으로 삭제되었습니다!');
        // 삭제된 카테고리를 상태에서 제거하여 즉시 화면 업데이트
        setMenuCategories(prev => prev.filter(cat => cat.id !== categoryId));
        // 해당 카테고리의 메뉴들도 함께 제거
        setMenus(prev => prev.filter(menu => menu.categoryId !== categoryId));
      } else {
        console.error('카테고리 삭제 실패:', response.error);
        alert(`카테고리 삭제에 실패했습니다: ${response.error}`);
      }
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      alert('카테고리 삭제에 실패했습니다. API 서버 연결을 확인해주세요.');
    }
  };

  const toggleMenuAvailability = async (menuId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      // 메뉴 전체 정보 필요 (storeId 등)
      const menu = menus.find(m => m.id === menuId);
      if (!menu) return;
      const response = await menuApi.updateMenu(menuId, {
        storeId: menu.storeId,
        categoryId: menu.categoryId,
        name: menu.name,
        price: menu.price,
        sortOrder: menu.sortOrder,
        isAvailable: newStatus,
        description: menu.description,
        image: menu.image,
      });
      
      if (response.success) {
        // 해당 메뉴의 상태만 업데이트하여 즉시 화면 업데이트
        setMenus(prev => prev.map(m => 
          m.id === menuId ? { ...m, isAvailable: newStatus } : m
        ));
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
        // 삭제된 메뉴를 상태에서 제거하여 즉시 화면 업데이트
        setMenus(prev => prev.filter(menu => menu.id !== menuId));
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
    const categoryMatch = categoryFilter === 'all' || String(menu.categoryId) === String(categoryFilter);
    const availabilityMatch = availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && menu.isAvailable !== false) ||
      (availabilityFilter === 'soldout' && menu.isAvailable === false);
    
    return categoryMatch && availabilityMatch;
  });

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
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Tag className="w-4 h-4" />
            <span>카테고리 추가</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>메뉴 추가</span>
          </button>
        </div>
      </div>

      {/* 카테고리 관리 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          카테고리 관리
        </h2>
        
        {categoryLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">카테고리 로딩 중...</p>
          </div>
        ) : menuCategories.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">등록된 카테고리가 없습니다.</p>
            <button 
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              첫 번째 카테고리 추가
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuCategories.map((category) => {
              const menuCount = menus.filter(menu => menu.categoryId === category.id).length;
              return (
                <div key={category.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{menuCount}개의 메뉴</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="카테고리 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
            {menuCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({menus.filter(menu => menu.categoryId === category.id).length}개)
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
                      ₩{Math.round(menu.price).toLocaleString()}
                    </span>
                  </div>
                  
                  {menu.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {menu.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {menuCategories.find(cat => cat.id === menu.categoryId)?.name || '카테고리 없음'}
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
        storeId={store?.id}
      />

      {/* 카테고리 추가 모달 */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAdd={handleAddCategory}
      />
    </AdminLayout>
  );
}

export default function AdminMenus() {
  return (
    <ProtectedRoute>
      <AdminMenusContent />
    </ProtectedRoute>
  );
} 