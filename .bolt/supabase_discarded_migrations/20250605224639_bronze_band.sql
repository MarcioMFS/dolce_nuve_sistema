-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;

-- Create sales table if not exists
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date date NOT NULL,
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create trigger for updated_at
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_geladinho_id ON sales(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read their own sales"
  ON sales FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
  ON sales FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create monthly sales view
DROP VIEW IF EXISTS monthly_sales;
CREATE VIEW monthly_sales AS
SELECT 
  date_trunc('month', sale_date)::date as month,
  sum(total_price) as total_sales
FROM sales
GROUP BY date_trunc('month', sale_date)::date
ORDER BY month;