import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/format-currency';
import { getProductImageUrl } from '@/lib/product-image';

export default function SuperAdminProdukPage() {
  const [search, setSearch] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['sa-all-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, stores(name), categories(name)')
        .order('created_at', { ascending: false });
      return (data || []).map(p => ({
        ...p,
        images: Array.isArray(p.images) ? p.images as string[] : [],
        storeName: (p.stores as any)?.name || '-',
        categoryName: (p.categories as any)?.name || '-',
      }));
    },
  });

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <SuperAdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Semua Produk</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((product) => {
              const thumbUrl = product.images[0] ? getProductImageUrl(product.images[0]) : '/placeholder.svg';
              return (
                <Card key={product.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <img src={thumbUrl} alt={product.name} className="w-14 h-14 rounded-lg object-cover bg-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-primary">{formatCurrency(product.price)}</span>
                        <span className="text-xs text-muted-foreground">Stok: {product.stock}</span>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-xs">{product.storeName}</Badge>
                        <Badge variant="outline" className="text-xs">{product.categoryName}</Badge>
                      </div>
                    </div>
                    <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                      {product.is_active ? 'Aktif' : 'Off'}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
