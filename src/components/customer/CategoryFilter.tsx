import { cn } from '@/lib/utils';
import { Tags } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
          selectedCategory === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        <Tags className="h-3.5 w-3.5" />
        Semua
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            selectedCategory === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
