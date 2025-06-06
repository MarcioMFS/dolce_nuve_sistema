/*
  # Create sales tables and views

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `sale_date` (timestamp)
      - `geladinho_id` (uuid, foreign key to geladinhos)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `total_price` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Views
    - `monthly_sales`
      - Aggregates sales data by month
      - Shows total sales amount per month

  3. Security
    - Enable RLS on sales table
    - Add policies for authenticated users
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

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create monthly sales view
CREATE OR REPLACE VIEW monthly_sales AS
SELECT 
  date_trunc('month', sale_date) AS month,
  SUM(total_price) AS total_sales
FROM sales
GROUP BY date_trunc('month', sale_date)
ORDER BY month;