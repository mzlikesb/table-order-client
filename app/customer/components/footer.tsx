import { ShoppingCart, Phone, Sun, Moon, Languages } from 'lucide-react';
import LanguageSelector from '../../common/components/languageSelector';
import type { Language } from '../../utils/i18n';

interface FooterProps {
  totalItems: number;
  totalAmount: number;
  onCartClick: () => void;
  onCallClick: () => void;
  onLanguageChange: (language: Language) => void;
  onDarkModeToggle: () => void;
  currentLanguage: Language;
  darkMode: boolean;
}

export default function Footer({
  totalItems,
  totalAmount,
  onCartClick,
  onCallClick,
  onLanguageChange,
  onDarkModeToggle,
  currentLanguage,
  darkMode
}: FooterProps) {
  const handleLanguageChange = (languageCode: string) => {
    onLanguageChange(languageCode as Language);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 호출 버튼 */}
          <button
            onClick={onCallClick}
            className="flex items-center gap-2 border-2 border-gray-600 dark:border-gray-400 text-gray-600 dark:text-gray-400 px-6 py-3 rounded-lg font-medium hover:bg-gray-600 hover:text-white dark:hover:bg-gray-400 dark:hover:text-gray-900 transition-colors"
          >
            <Phone size={20} />
            호출
          </button>

          {/* 오른쪽 컨트롤들 */}
          <div className="flex items-center gap-3">
            {/* 언어 변경 버튼 */}
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
            />

            {/* 다크모드 전환 버튼 */}
            <button
              onClick={onDarkModeToggle}
              className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="테마 전환"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* 장바구니 버튼 */}
            <button
              onClick={onCartClick}
              className="flex items-center gap-2 bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors relative"
            >
              <ShoppingCart size={20} />
              장바구니
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              {totalAmount > 0 && (
                <span className="text-sm font-normal">
                  ₩{totalAmount.toLocaleString()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
} 