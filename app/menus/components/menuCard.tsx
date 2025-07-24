import { Plus, Minus, ShoppingCart } from 'lucide-react';
import type { MenuItem, MenuCardProps } from '../../types/menu';

export default function MenuCard({ menu, onAddToCart }: MenuCardProps) {
  const handleAddToCart = () => {
    onAddToCart(menu.id, 1);
  };

  return (
    <div className="table-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
        </div>
      )}

      {/* 메뉴 정보 */}
      <div className="p-4">
        {!menu.image && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold table-text-primary line-clamp-2">
              {menu.name}
            </h3>
            {menu.category && (
              <div className="bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                {menu.category}
              </div>
            )}
          </div>
        )}
        
        {menu.image && (
          <h3 className="text-lg font-semibold table-text-primary mb-2 line-clamp-2">
            {menu.name}
          </h3>
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
          className="w-full table-accent table-accent-hover py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          담기
        </button>
      </div>
    </div>
  );
}