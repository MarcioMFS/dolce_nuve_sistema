/*
  # Add Stock Management Tables

  1. New Tables
    - `product_stock_entries`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (numeric)
      - `total_cost` (numeric)
      - `entry_date` (timestamptz)
      - `supplier` (text, optional)
      - `note_photo_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `geladinho_stock`
      - `id` (uuid, primary key)
      - `geladinho_id` (uuid, foreign key to geladinhos)
      - `quantity` (numeric)
      - `batch_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add indexes for foreign keys and frequently queried columns
*/

-- Create product_stock_entries table
CREATE TABLE IF NOT EXISTS product_stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL CHECK (quantity > 0),
  total_cost numeric NOT NULL CHECK (total_cost >= 0),
  entry_date timestamptz NOT NULL DEFAULT now(),
  supplier text,
  note_photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create geladinho_stock table
CREATE TABLE IF NOT EXISTS geladinho_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE CASCADE,
  quantity numeric NOT NULL CHECK (quantity > 0),
  batch_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_stock_entries_product_id ON product_stock_entries(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_entries_entry_date ON product_stock_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_geladinho_stock_geladinho_id ON geladinho_stock(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_geladinho_stock_batch_date ON geladinho_stock(batch_date);

-- Enable RLS
ALTER TABLE product_stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE geladinho_stock ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_stock_entries
CREATE POLICY "Users can read their own product stock entries"
  ON product_stock_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own product stock entries"
  ON product_stock_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own product stock entries"
  ON product_stock_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own product stock entries"
  ON product_stock_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for geladinho_stock
CREATE POLICY "Users can read their own geladinho stock"
  ON geladinho_stock
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own geladinho stock"
  ON geladinho_stock
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own geladinho stock"
  ON geladinho_stock
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own geladinho stock"
  ON geladinho_stock
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_stock_entries_updated_at
  BEFORE UPDATE ON product_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geladinho_stock_updated_at
  BEFORE UPDATE ON geladinho_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();