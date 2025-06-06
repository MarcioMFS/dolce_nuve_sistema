/*
  # Add sales table and monthly sales view

  1. New table: sales
     - Records each sale with date, product sold, quantity and price
  2. View: monthly_sales
     - Aggregates total sales per month
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date date NOT NULL,
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable row level security and generic policy
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sales" ON sales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_geladinho_id ON sales(geladinho_id);

-- Trigger to update timestamp
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Monthly sales view
CREATE OR REPLACE VIEW monthly_sales AS
SELECT
  date_trunc('month', sale_date)::date AS month,
  SUM(total_price) AS total_sales
FROM sales
GROUP BY month
ORDER BY month;
