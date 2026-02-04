import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
  store_id: string | null;
  created_at: string;
  store?: Store | null;
}

export interface StoreAdmin {
  id: string;
  store_id: string;
  user_id: string;
  role: string;
  created_at: string;
  store?: Store | null;
  profile?: Profile | null;
}

export interface DashboardStats {
  totalStores: number;
  totalUsers: number;
  totalOrders: number;
  totalGMV: number;
}

export function useSuperAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dashboard Stats
  const statsQuery = useQuery({
    queryKey: ['superadmin-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [storesRes, usersRes, ordersRes] = await Promise.all([
        supabase.from('stores').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total, payment_status'),
      ]);

      const paidOrders = ordersRes.data?.filter(o => o.payment_status === 'PAID') || [];
      const totalGMV = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      return {
        totalStores: storesRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalGMV,
      };
    },
  });

  // Stores
  const storesQuery = useQuery({
    queryKey: ['superadmin-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Store[];
    },
  });

  const createStore = useMutation({
    mutationFn: async (store: { name: string; slug: string; address?: string }) => {
      const { data, error } = await supabase
        .from('stores')
        .insert(store)
        .select()
        .single();

      if (error) throw error;

      // Create default store_settings
      await supabase.from('store_settings').insert({ store_id: data.id });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-stores'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-stats'] });
      toast({ title: 'Toko berhasil ditambahkan' });
    },
    onError: (error) => {
      toast({ title: 'Gagal menambah toko', description: error.message, variant: 'destructive' });
    },
  });

  const updateStore = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Store> & { id: string }) => {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-stores'] });
      toast({ title: 'Toko berhasil diperbarui' });
    },
    onError: (error) => {
      toast({ title: 'Gagal memperbarui toko', description: error.message, variant: 'destructive' });
    },
  });

  const toggleStoreActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('stores')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-stores'] });
      toast({ title: variables.is_active ? 'Toko diaktifkan' : 'Toko dinonaktifkan' });
    },
    onError: (error) => {
      toast({ title: 'Gagal mengubah status toko', description: error.message, variant: 'destructive' });
    },
  });

  // Users (profiles)
  const usersQuery = useQuery({
    queryKey: ['superadmin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Store Admins - separate table for admin assignments
  const storeAdminsQuery = useQuery({
    queryKey: ['superadmin-store-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_admins')
        .select(`
          *,
          store:stores(id, name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StoreAdmin[];
    },
  });

  // Assign admin to store
  const assignStoreAdmin = useMutation({
    mutationFn: async ({ user_id, store_id }: { user_id: string; store_id: string }) => {
      const { data, error } = await supabase
        .from('store_admins')
        .insert({ user_id, store_id, role: 'STORE_ADMIN' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-store-admins'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      toast({ title: 'Admin berhasil di-assign ke toko' });
    },
    onError: (error) => {
      toast({ title: 'Gagal assign admin', description: error.message, variant: 'destructive' });
    },
  });

  // Remove admin from store
  const removeStoreAdmin = useMutation({
    mutationFn: async ({ user_id, store_id }: { user_id: string; store_id: string }) => {
      const { error } = await supabase
        .from('store_admins')
        .delete()
        .eq('user_id', user_id)
        .eq('store_id', store_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-store-admins'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      toast({ title: 'Admin berhasil dihapus dari toko' });
    },
    onError: (error) => {
      toast({ title: 'Gagal hapus admin', description: error.message, variant: 'destructive' });
    },
  });

  // Update user role (for SUPER_ADMIN promotion only)
  const updateUserRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Profile['role'] }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      toast({ title: 'Role user berhasil diperbarui' });
    },
    onError: (error) => {
      toast({ title: 'Gagal mengubah role', description: error.message, variant: 'destructive' });
    },
  });

  // Orders
  const ordersQuery = useQuery({
    queryKey: ['superadmin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          store:stores(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  return {
    // Stats
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    
    // Stores
    stores: storesQuery.data || [],
    storesLoading: storesQuery.isLoading,
    createStore,
    updateStore,
    toggleStoreActive,
    
    // Users
    users: usersQuery.data || [],
    usersLoading: usersQuery.isLoading,
    updateUserRole,
    
    // Store Admins
    storeAdmins: storeAdminsQuery.data || [],
    storeAdminsLoading: storeAdminsQuery.isLoading,
    assignStoreAdmin,
    removeStoreAdmin,
    
    // Orders
    orders: ordersQuery.data || [],
    ordersLoading: ordersQuery.isLoading,
  };
}
