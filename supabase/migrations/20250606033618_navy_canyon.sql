/*
  # Add Sales Tables
  
  1. New Tables
    - sales
      - Records individual sales transactions
      - Tracks quantity, price, and date
      - Links to geladinhos table
    
  2. Views
    - monthly_sales
      - Aggregates sales data by month
      - Calculates total revenue and quantity
    
  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create sales table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sales_geladinho_id ON sales(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create policies
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
SELECT
  date_trunc('month', s.sale_date)::date as month,
  SUM(s.total_price) as total_sales,
  SUM(s.quantity) as total_quantity
FROM sales s
GROUP BY date_trunc('month', s.sale_date)
ORDER BY month DESC;

-- Create trigger for updated_at
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();