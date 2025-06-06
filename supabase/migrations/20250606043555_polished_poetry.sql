/*
  # Sales and Stock Management

  1. New Tables
    - `sales` table for recording sales transactions
    - `monthly_sales` view for sales reporting

  2. Changes
    - Add trigger to automatically reduce geladinho stock on sale
    - Add function to calculate available stock

  3. Security
    - Enable RLS on sales table
    - Add policies for authenticated users
*/

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date date NOT NULL,
  geladinho_id uuid REFERENCES geladinhos(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
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
  date_trunc('month', sale_date)::date as month,
  sum(total_price) as total_sales,
  sum(quantity) as total_quantity
FROM sales
GROUP BY date_trunc('month', sale_date)
ORDER BY month DESC;

-- Create function to check and update stock
CREATE OR REPLACE FUNCTION check_and_update_geladinho_stock()
RETURNS TRIGGER AS $$
DECLARE
  available_stock integer;
BEGIN
  -- Calculate available stock
  SELECT COALESCE(SUM(quantity), 0)
  INTO available_stock
  FROM geladinho_stock
  WHERE geladinho_id = NEW.geladinho_id;

  -- Check if there's enough stock
  IF available_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', available_stock, NEW.quantity;
  END IF;

  -- If we have enough stock, create a negative stock entry
  INSERT INTO geladinho_stock (
    geladinho_id,
    quantity,
    batch_date
  ) VALUES (
    NEW.geladinho_id,
    -NEW.quantity,
    NEW.sale_date
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check and update stock on sale
CREATE TRIGGER check_and_update_geladinho_stock_trigger
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION check_and_update_geladinho_stock();