/*
  # Create sales table with user_id and policies

  1. New Tables
    - `sales` with user ownership
  2. Security
    - Enable RLS
    - Add policies for user data access
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;

-- Create sales table if not exists
CREATE TABLE IF NOT EXISTS public.sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_date date NOT NULL,
    geladinho_id uuid NOT NULL REFERENCES public.geladinhos(id) ON DELETE RESTRICT,
    quantity numeric NOT NULL CHECK (quantity > 0),
    unit_price numeric NOT NULL CHECK (unit_price >= 0),
    total_price numeric NOT NULL CHECK (total_price >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_geladinho_id ON public.sales(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read their own sales" ON public.sales;
  DROP POLICY IF EXISTS "Users can insert their own sales" ON public.sales;
  DROP POLICY IF EXISTS "Users can update their own sales" ON public.sales;
  DROP POLICY IF EXISTS "Users can delete their own sales" ON public.sales;
END $$;

-- Create RLS policies
CREATE POLICY "Users can read their own sales"
    ON public.sales
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
    ON public.sales
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
    ON public.sales
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
    ON public.sales
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create monthly sales view
DROP VIEW IF EXISTS public.monthly_sales;
CREATE VIEW public.monthly_sales AS
SELECT 
    date_trunc('month', s.sale_date)::date as month,
    SUM(s.total_price) as total_sales
FROM 
    public.sales s
GROUP BY 
    date_trunc('month', s.sale_date)::date
ORDER BY 
    month;