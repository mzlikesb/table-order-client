import { Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import type { MenuItem, MenuCardProps } from '../../types/menu';

export default function MenuCard({ menu, onAddToCart }: MenuCardProps) {
  const handleAddToCart = () => {
    if (menu.isAvailable === false) return; // 품절 시 클릭 무시
    onAddToCart(menu.id, 1);
  };

  const isSoldOut = menu.isAvailable === false;

  return (
    <div className={`table-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
      isSoldOut ? 'opacity-60' : ''
    }`}>
      {/* 메뉴 이미지 (이미지가 있을 때만 표시) */}
      {menu.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none'; // 이미지 로드 실패 시 숨김
            }}
          />
          {menu.category && (
            <div className="absolute top-2 left-2 bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
              {menu.category}
            </div>
          )}
          {/* 품절 오버레이 */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-white mx-auto mb-2" />
                <span className="text-white font-bold text-lg">품절</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 메뉴 정보 */}
      <div className="p-4">
        {!menu.image && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold table-text-primary line-clamp-2">
              {menu.name}
            </h3>
            <div className="flex items-center gap-2">
              {menu.category && (
                <div className="bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                  {menu.category}
                </div>
              )}
              {isSoldOut && (
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <AlertCircle size={12} />
                  품절
                </div>
              )}
            </div>
          </div>
        )}
        
        {menu.image && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold table-text-primary line-clamp-2">
              {menu.name}
            </h3>
            {isSoldOut && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <AlertCircle size={12} />
                품절
              </div>
            )}
          </div>
        )}
        
        {menu.description && (
          <p className="text-sm table-text-secondary mb-3 line-clamp-2">
            {menu.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
            ₩{menu.price.toLocaleString()}
          </span>
        </div>

        {/* 장바구니 담기 버튼 */}
        <button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isSoldOut
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'table-accent table-accent-hover'
          }`}
        >
          <ShoppingCart size={16} />
          {isSoldOut ? '품절' : '담기'}
        </button>
      </div>
    </div>
  );
}