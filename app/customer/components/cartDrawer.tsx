import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '../../common/ui/drawer';
import type { CartDrawerProps } from '../../types/menu';
import { i18n } from '../../utils/i18n';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleIncrement = (menuId: string, currentQuantity: number) => {
    onUpdateQuantity(menuId, currentQuantity + 1);
  };

  const handleDecrement = (menuId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      onUpdateQuantity(menuId, currentQuantity - 1);
    } else {
      onRemoveItem(menuId);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingCart size={24} />
            {i18n.t('cart')}
            {totalCount > 0 && (
              <span className="bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">{i18n.t('cartEmpty')}</p>
              <p className="text-gray-400 text-sm mt-2">{i18n.t('cartEmptyMessage')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.menuId}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {/* 메뉴 이미지 */}
                  {item.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.menuName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* 메뉴 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold table-text-primary truncate">
                      {item.menuName}
                    </h3>
                    <p className="text-sm table-text-secondary">
                      ₩{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* 수량 조절 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrement(item.menuId, item.quantity)}
                      className="p-1 rounded-full table-hover"
                    >
                      <Minus size={16} className="table-text-secondary" />
                    </button>
                    <span className="w-8 text-center font-medium table-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrement(item.menuId, item.quantity)}
                      className="p-1 rounded-full table-hover"
                    >
                      <Plus size={16} className="table-text-secondary" />
                    </button>
                  </div>

                  {/* 개별 가격 */}
                  <div className="text-right min-w-[80px]">
                    <p className="font-semibold table-text-primary">
                      ₩{item.totalPrice.toLocaleString()}
                    </p>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => onRemoveItem(item.menuId)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <DrawerFooter>
            <div className="space-y-4">
              {/* 총 금액 */}
              <div className="flex justify-between items-center py-4 border-t">
                <span className="text-lg font-semibold table-text-primary">
                  {i18n.t('totalAmount')}
                </span>
                <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                  ₩{totalAmount.toLocaleString()}
                </span>
              </div>

              {/* 주문하기 버튼 */}
              <button
                onClick={onCheckout}
                className="w-full table-accent table-accent-hover py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                {i18n.t('checkout')}
              </button>
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
} 