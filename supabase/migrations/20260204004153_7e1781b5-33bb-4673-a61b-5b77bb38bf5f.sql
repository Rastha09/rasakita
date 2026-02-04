-- Create store_admins table for role management (separate from profiles)
CREATE TABLE IF NOT EXISTS public.store_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'STORE_ADMIN',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- Enable RLS
ALTER TABLE public.store_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_admins
CREATE POLICY "Users can view own store admin entries"
  ON public.store_admins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all store admins"
  ON public.store_admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- Function to check if user is admin of a store
CREATE OR REPLACE FUNCTION public.is_store_admin(p_user_id UUID, p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_admins
    WHERE user_id = p_user_id AND store_id = p_store_id
  )
$$;

-- Function to get user's store_id if they are an admin
CREATE OR REPLACE FUNCTION public.get_admin_store_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store_id FROM public.store_admins
  WHERE user_id = p_user_id
  LIMIT 1
$$;

-- Update products RLS to use store_admins
DROP POLICY IF EXISTS "Admins can manage own products" ON public.products;
CREATE POLICY "Store admins can manage own products"
  ON public.products FOR ALL
  USING (
    public.is_store_admin(auth.uid(), store_id)
    OR public.has_role(auth.uid(), 'SUPER_ADMIN')
  );

-- Update orders RLS to use store_admins
DROP POLICY IF EXISTS "Admins can manage store orders" ON public.orders;
CREATE POLICY "Store admins can manage store orders"
  ON public.orders FOR ALL
  USING (
    public.is_store_admin(auth.uid(), store_id)
    OR public.has_role(auth.uid(), 'SUPER_ADMIN')
  );

-- Update categories RLS to use store_admins
DROP POLICY IF EXISTS "Admins can manage own categories" ON public.categories;
CREATE POLICY "Store admins can manage own categories"
  ON public.categories FOR ALL
  USING (
    public.is_store_admin(auth.uid(), store_id)
    OR public.has_role(auth.uid(), 'SUPER_ADMIN')
  );

-- Update payments RLS to use store_admins
DROP POLICY IF EXISTS "Admins can manage store payments" ON public.payments;
CREATE POLICY "Store admins can manage store payments"
  ON public.payments FOR ALL
  USING (
    public.is_store_admin(auth.uid(), store_id)
    OR public.has_role(auth.uid(), 'SUPER_ADMIN')
  );

-- Update stores RLS for admin update
DROP POLICY IF EXISTS "Admins can update own store" ON public.stores;
CREATE POLICY "Store admins can update own store"
  ON public.stores FOR UPDATE
  USING (
    public.is_store_admin(auth.uid(), id)
    OR public.has_role(auth.uid(), 'SUPER_ADMIN')
  );

-- Update store_settings RLS for admin
DROP POLICY IF EXISTS "Admins can update own store settings" ON public.store_settings;
CREATE POLICY "Store admins can manage own store settings"
  ON public.store_settings FOR ALL
  USING (
    public.is_store_admin(auth.uid(), store_id)
    OR public.has_role(auth.uid(), 'SUPER_ADMIN')
  );

-- Migrate existing admin data from profiles to store_admins
INSERT INTO public.store_admins (store_id, user_id, role)
SELECT store_id, id, 'STORE_ADMIN'
FROM public.profiles
WHERE role = 'ADMIN' AND store_id IS NOT NULL
ON CONFLICT (store_id, user_id) DO NOTHING;