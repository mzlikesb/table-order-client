import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { MenuItem } from '../../types/api';
import { menuCategoryApi } from '../../lib/api/menuCategories';
import type { MenuCategory } from '../../types/api';

interface AddMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (menuData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  storeId?: string; // 스토어 ID 추가
}

export default function AddMenuModal({ isOpen, onClose, onAdd, storeId }: AddMenuModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '', // categoryId로 변경
    image: '',
    isAvailable: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // 카테고리 목록 로드
  useEffect(() => {
    if (isOpen && storeId) {
      loadCategories();
    }
  }, [isOpen, storeId]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await menuCategoryApi.getCategories(storeId);
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        console.error('카테고리 로드 실패:', response.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '메뉴명을 입력해주세요.';
    }

    if (!formData.price.trim()) {
      newErrors.price = '가격을 입력해주세요.';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = '올바른 가격을 입력해주세요.';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '카테고리를 선택해주세요.';
    }

    if (!storeId) {
      newErrors.storeId = '스토어가 선택되지 않았습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const menuData = {
        storeId: storeId!, // 스토어 ID 추가
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description.trim() || undefined,
        categoryId: formData.categoryId, // categoryId로 변경
        image: formData.image.trim() || undefined,
        isAvailable: formData.isAvailable,
        sortOrder: 0 // 기본값 추가
      };

      await onAdd(menuData);
      
      // 폼 초기화
      setFormData({
        name: '',
        price: '',
        description: '',
        categoryId: '', // categoryId로 변경
        image: '',
        isAvailable: true
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('메뉴 추가 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">새 메뉴 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 스토어 ID 에러 표시 */}
          {errors.storeId && (
            <div className="text-red-500 text-sm">{errors.storeId}</div>
          )}

          {/* 메뉴명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              메뉴명 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
              placeholder="메뉴명을 입력하세요"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              가격 *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
              placeholder="가격을 입력하세요"
              min="0"
              step="1"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              카테고리 *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.categoryId 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <option value="">카테고리를 선택하세요</option>
              {categoriesLoading ? (
                <option value="">카테고리 로딩 중...</option>
              ) : categories.length === 0 ? (
                <option value="">등록된 카테고리가 없습니다.</option>
              ) : (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="메뉴 설명을 입력하세요 (선택사항)"
              rows={3}
            />
          </div>

          {/* 이미지 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이미지 URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="이미지 URL을 입력하세요 (선택사항)"
            />
          </div>

          {/* 판매 상태 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              판매 가능
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  메뉴 추가
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 