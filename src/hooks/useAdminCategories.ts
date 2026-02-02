import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  store_id: string;
  created_at: string;
}

export function useAdminCategories() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const storeId = profile?.store_id;

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!storeId,
  });

  const createCategory = useMutation({
    mutationFn: async (name: string) => {
      if (!storeId) throw new Error('Store ID not found');

      const { data, error } = await supabase
        .from('categories')
        .insert({ name, store_id: storeId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Kategori berhasil ditambahkan' });
    },
    onError: (error) => {
      toast({ title: 'Gagal menambah kategori', description: error.message, variant: 'destructive' });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Kategori berhasil diperbarui' });
    },
    onError: (error) => {
      toast({ title: 'Gagal memperbarui kategori', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Kategori berhasil dihapus' });
    },
    onError: (error) => {
      toast({ title: 'Gagal menghapus kategori', description: error.message, variant: 'destructive' });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
