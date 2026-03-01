import { createContext, useContext, ReactNode } from 'react';
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

interface StoreContextValue {
  store: Store | null;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data: store, isLoading } = useQuery({
    queryKey: ['store'],
    queryFn: async () => {
      // Single business: fetch the Makka Bakerry store by slug
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', 'makka-bakerry')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching store:', error);
        return null;
      }
      return data as Store;
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <StoreContext.Provider value={{ store: store ?? null, isLoading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
}
