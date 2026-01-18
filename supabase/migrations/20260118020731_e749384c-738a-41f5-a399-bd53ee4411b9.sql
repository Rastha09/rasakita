-- Function to update sold_count when order becomes COMPLETED + PAID
CREATE OR REPLACE FUNCTION public.handle_order_sold_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  v_product_id uuid;
  v_qty integer;
BEGIN
  -- Only process if order is COMPLETED + PAID and not yet counted
  IF NEW.order_status = 'COMPLETED' 
     AND NEW.payment_status = 'PAID' 
     AND NEW.sold_counted = false THEN
    
    -- Loop through each item in the order
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      v_product_id := (item->>'product_id')::uuid;
      v_qty := COALESCE((item->>'qty')::integer, 1);
      
      -- Update sold_count for this product
      UPDATE public.products
      SET sold_count = COALESCE(sold_count, 0) + v_qty
      WHERE id = v_product_id;
    END LOOP;
    
    -- Mark order as counted to prevent double counting
    NEW.sold_counted := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on orders table (BEFORE UPDATE to modify NEW.sold_counted)
DROP TRIGGER IF EXISTS trigger_order_sold_count ON public.orders;
CREATE TRIGGER trigger_order_sold_count
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_sold_count();

-- Backfill: Recalculate sold_count for all products from COMPLETED+PAID orders
-- First reset all sold_count to 0
UPDATE public.products SET sold_count = 0;

-- Then recalculate from orders that are COMPLETED+PAID
WITH order_items AS (
  SELECT 
    (item->>'product_id')::uuid AS product_id,
    COALESCE((item->>'qty')::integer, 1) AS qty
  FROM public.orders,
       jsonb_array_elements(items) AS item
  WHERE order_status = 'COMPLETED' 
    AND payment_status = 'PAID'
),
aggregated AS (
  SELECT product_id, SUM(qty) AS total_sold
  FROM order_items
  GROUP BY product_id
)
UPDATE public.products p
SET sold_count = a.total_sold
FROM aggregated a
WHERE p.id = a.product_id;

-- Mark all COMPLETED+PAID orders as sold_counted = true
UPDATE public.orders
SET sold_counted = true
WHERE order_status = 'COMPLETED' 
  AND payment_status = 'PAID'
  AND sold_counted = false;