import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductThumb } from '@/lib/product-image';

interface ProductThumbProps {
  images?: unknown;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function ProductThumb({ images, name, size = 'md', className }: ProductThumbProps) {
  const thumbUrl = getProductThumb(images);
  const isPlaceholder = thumbUrl === '/placeholder.svg';

  return (
    <div
      className={cn(
        'rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {isPlaceholder ? (
        <ShoppingBag className={cn('text-muted-foreground', iconSizes[size])} />
      ) : (
        <img
          src={thumbUrl}
          alt={name || 'Product'}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement?.classList.add('fallback-icon');
          }}
        />
      )}
    </div>
  );
}

interface ThumbnailStackProps {
  items: Array<{ product_id: string; images?: unknown }>;
  productsMap?: Map<string, { id: string; images?: unknown }>;
  maxVisible?: number;
}

export function ThumbnailStack({ items, productsMap, maxVisible = 3 }: ThumbnailStackProps) {
  const visibleItems = items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleItems.map((item, index) => {
          const product = productsMap?.get(item.product_id);
          const images = product?.images || item.images;
          
          return (
            <div
              key={item.product_id}
              className="relative"
              style={{ zIndex: maxVisible - index }}
            >
              <ProductThumb
                images={images}
                size="sm"
                className="border-2 border-background"
              />
            </div>
          );
        })}
      </div>
      {remaining > 0 && (
        <span className="ml-1 text-xs text-muted-foreground font-medium">
          +{remaining}
        </span>
      )}
    </div>
  );
}
