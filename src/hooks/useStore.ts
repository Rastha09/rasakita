import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Store {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  logo_path: string | null;
  banner_path: string | null;
  theme_color: string | null;
  is_active: boolean;
  created_at: string;
}

export function useStore() {
  return useQuery({
    queryKey: ['store'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', 'makka-bakerry')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Store;
    },
    staleTime: 10 * 60 * 1000,
  });
}
