import type { Category, CategoryListProps } from '../../types/menu';
import { i18n } from '../../utils/i18n';

export default function CategoryList({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoryListProps) {
  return (
    <aside className="w-64 table-sidebar shadow-sm border-r">
      <div className="p-4">
        <h2 className="text-lg font-semibold table-text-primary mb-4">카테고리</h2>
        <nav className="space-y-2">
          {/* 전체 카테고리 옵션 */}
          <button
            onClick={() => onCategorySelect('all')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'table-accent table-accent-hover'
                : 'table-text-primary table-hover'
            }`}
          >
            {i18n.t('all')}
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'table-accent table-accent-hover'
                  : 'table-text-primary table-hover'
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
} 