/*
  # Sales System Setup

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `geladinho_id` (uuid, foreign key to geladinhos)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `total_price` (numeric)
      - `sale_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Views
    - `monthly_sales`: Aggregates sales data by month
      - `month` (date)
      - `total_sales` (numeric)
      - `total_quantity` (integer)

  3. Security
    - Enable RLS on sales table
    - Add policies for CRUD operations
*/

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date timestamptz NOT NULL,
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_geladinho_id ON sales(geladinho_id);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read their own sales" ON sales;
  DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;
  DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
  DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;
END $$;

-- Create RLS policies
CREATE POLICY "Users can read their own sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (true);

-- Create monthly sales view
DROP VIEW IF EXISTS monthly_sales;
CREATE VIEW monthly_sales AS
SELECT 
  date_trunc('month', sale_date)::date as month,
  sum(total_price) as total_sales,
  sum(quantity) as total_quantity
FROM sales
GROUP BY date_trunc('month', sale_date)::date
ORDER BY month;