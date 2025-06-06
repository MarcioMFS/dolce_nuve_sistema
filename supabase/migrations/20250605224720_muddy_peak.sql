-- Drop existing tables and views if they exist
DROP VIEW IF EXISTS monthly_sales CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS product_stock_entries CASCADE;
DROP TABLE IF EXISTS geladinho_stock CASCADE;

-- Recreate product_stock_entries table
CREATE TABLE IF NOT EXISTS product_stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  total_cost numeric NOT NULL CHECK (total_cost >= 0),
  entry_date timestamptz NOT NULL DEFAULT now(),
  supplier text,
  note_photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_product_stock_entries_product_id
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
);

-- Ensure products table has user_id column for RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE products ADD COLUMN user_id UUID DEFAULT auth.uid();
  END IF;
END $$;

-- Recreate geladinho_stock table
CREATE TABLE IF NOT EXISTS geladinho_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geladinho_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity >= 0),
  batch_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_geladinho_stock_geladinho_id
    FOREIGN KEY (geladinho_id)
    REFERENCES geladinhos(id)
    ON DELETE CASCADE
);

-- Recreate sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date timestamptz NOT NULL,
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_stock_entries_product_id 
  ON product_stock_entries(product_id);
CREATE INDEX IF NOT EXISTS idx_geladinho_stock_geladinho_id 
  ON geladinho_stock(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date 
  ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_geladinho_id 
  ON sales(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id 
  ON sales(user_id);

-- Enable RLS
ALTER TABLE product_stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE geladinho_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create policies for product_stock_entries
CREATE POLICY "Users can manage their own product stock entries"
  ON product_stock_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_stock_entries.product_id
      AND p.user_id = auth.uid()
    )
  );

-- Create policies for geladinho_stock
CREATE POLICY "Users can manage their own geladinho stock"
  ON geladinho_stock
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM geladinhos g
      WHERE g.id = geladinho_stock.geladinho_id
    )
  );

-- Create policies for sales
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

-- Create triggers for updated_at
CREATE TRIGGER update_product_stock_entries_updated_at
  BEFORE UPDATE ON product_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geladinho_stock_updated_at
  BEFORE UPDATE ON geladinho_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create monthly sales view
CREATE OR REPLACE VIEW monthly_sales AS
SELECT 
  date_trunc('month', sale_date) as month,
  sum(total_price) as total_sales
FROM sales
GROUP BY date_trunc('month', sale_date)
ORDER BY month;
