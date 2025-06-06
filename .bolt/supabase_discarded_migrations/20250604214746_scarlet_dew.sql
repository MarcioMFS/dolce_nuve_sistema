/*
  # Create sales tables and relationships

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `sale_date` (date)
      - `geladinho_id` (uuid, foreign key to geladinhos)
      - `quantity` (numeric)
      - `unit_price` (numeric)
      - `total_price` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)

  2. New Views
    - `monthly_sales`
      - Aggregates sales data by month
      - Includes total quantity, revenue, and profit

  3. Security
    - Enable RLS on `sales` table
    - Add policies for authenticated users to manage their own sales
*/

-- Create sales table
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

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_geladinho_id ON public.sales(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

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
CREATE OR REPLACE VIEW public.monthly_sales AS
SELECT 
    date_trunc('month', s.sale_date)::date as month,
    COUNT(*) as total_sales,
    SUM(s.quantity) as total_quantity,
    SUM(s.total_price) as total_revenue,
    SUM(s.total_price - (s.quantity * g.cost_per_unit)) as total_profit
FROM 
    public.sales s
    JOIN public.geladinhos g ON s.geladinho_id = g.id
GROUP BY 
    date_trunc('month', s.sale_date)::date
ORDER BY 
    month;