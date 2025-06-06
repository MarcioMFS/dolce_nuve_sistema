/*
  # Sales Schema Setup

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `geladinho_id` (uuid, foreign key to geladinhos)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `total_price` (numeric)
      - `payment_method` (text)
      - `sale_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. New Views
    - `monthly_sales`
      - Aggregates sales data by month
      - Calculates total quantity, revenue, and profit

  3. Security
    - Enable RLS on `sales` table
    - Add policies for authenticated users to manage their sales data
*/

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito')),
  sale_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_geladinho_id ON sales(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

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
CREATE OR REPLACE VIEW monthly_sales AS
WITH monthly AS (
  SELECT
    date_trunc('month', s.sale_date) AS month,
    SUM(s.quantity) AS total_quantity,
    SUM(s.total_price) AS total_revenue,
    g.profit_margin,
    g.recipe_id
  FROM sales s
  JOIN geladinhos g ON g.id = s.geladinho_id
  GROUP BY
    date_trunc('month', s.sale_date),
    g.profit_margin,
    g.recipe_id
)
SELECT
  month,
  total_quantity,
  total_revenue,
  ROUND(total_revenue * profit_margin / 100, 2) AS total_profit
FROM monthly
ORDER BY month DESC;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();