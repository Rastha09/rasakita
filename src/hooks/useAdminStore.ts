import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

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

export interface StoreSettings {
  store_id: string;
  payment_cod_enabled: boolean;
  payment_qris_enabled: boolean;
  shipping_courier_enabled: boolean;
  shipping_pickup_enabled: boolean;
  shipping_fee_flat: number;
  shipping_fee_type: string;
  pickup_address: string | null;
  updated_at: string;
}

export function useAdminStore() {
  const { storeAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use store_id from store_admins table instead of profile
  const storeId = storeAdmin?.store_id;

  const storeQuery = useQuery({
    queryKey: ['admin-store', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (error) throw error;
      return data as Store;
    },
    enabled: !!storeId,
  });

  const settingsQuery = useQuery({
    queryKey: ['admin-store-settings', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as StoreSettings | null;
    },
    enabled: !!storeId,
  });

  const updateStore = useMutation({
    mutationFn: async (updates: Partial<Store>) => {
      if (!storeId) throw new Error('Store ID not found');

      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store'] });
      // Also invalidate customer-facing store queries to sync changes
      queryClient.invalidateQueries({ queryKey: ['store'] });
      toast({ title: 'Informasi toko berhasil diperbarui' });
    },
    onError: (error) => {
      toast({ title: 'Gagal memperbarui toko', description: error.message, variant: 'destructive' });
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<StoreSettings>) => {
      if (!storeId) throw new Error('Store ID not found');

      const { data, error } = await supabase
        .from('store_settings')
        .upsert({ store_id: storeId, ...updates })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store-settings'] });
      toast({ title: 'Pengaturan toko berhasil diperbarui' });
    },
    onError: (error) => {
      toast({ title: 'Gagal memperbarui pengaturan', description: error.message, variant: 'destructive' });
    },
  });

  const uploadImage = async (file: File, type: 'logo' | 'banner'): Promise<string> => {
    if (!storeId) throw new Error('Store ID not found');

    const fileExt = file.name.split('.').pop();
    const fileName = `${storeId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    return fileName;
  };

  return {
    store: storeQuery.data,
    storeId,
    settings: settingsQuery.data,
    isLoading: storeQuery.isLoading || settingsQuery.isLoading,
    updateStore,
    updateSettings,
    uploadImage,
  };
}
