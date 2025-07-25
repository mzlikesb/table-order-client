import { useState, useEffect } from 'react';
import { Store as StoreIcon, ChevronDown, Check } from 'lucide-react';
import { storeApi } from '../lib/api';
import type { Store } from '../types/api';

interface StoreSelectorProps {
  selectedStoreId?: string;
  onStoreSelect: (store: Store) => void;
  className?: string;
}

export default function StoreSelector({ selectedStoreId, onStoreSelect, className = '' }: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId && stores.length > 0) {
      const store = stores.find(s => s.id === selectedStoreId);
      if (store) {
        setSelectedStore(store);
      }
    }
  }, [selectedStoreId, stores]);

  const loadStores = async () => {
    try {
      setError(null);
      const response = await storeApi.getStores();
      if (response.success) {
        setStores(response.data || []);
      } else {
        setError(response.error || '스토어 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('스토어 목록 로드 실패:', error);
      setError('스토어 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    onStoreSelect(store);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">스토어 목록을 불러오는 중...</span>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full p-3 border border-red-300 rounded-lg bg-red-50">
          <span className="text-red-600 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
      >
        <div className="flex items-center">
          <StoreIcon className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-900">
            {selectedStore ? selectedStore.name : '스토어를 선택하세요'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {stores.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              등록된 스토어가 없습니다.
            </div>
          ) : (
            <div className="py-1">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleStoreSelect(store)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <StoreIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                      <div className="text-xs text-gray-500">{store.code}</div>
                    </div>
                  </div>
                  {selectedStore?.id === store.id && (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 