import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  store_id: string;
}

export function useCategories(storeId: string | undefined) {
  return useQuery({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, store_id')
        .eq('store_id', storeId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!storeId,
  });
}
