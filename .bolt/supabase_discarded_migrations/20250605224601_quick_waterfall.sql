/*
  # Fix Table Relationships

  1. Changes
    - Drop and recreate tables with proper relationships
    - Add missing foreign key constraints
    - Update RLS policies
    - Add necessary indexes
*/

-- Drop existing tables if they exist
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_stock_entries_product_id 
  ON product_stock_entries(product_id);
CREATE INDEX IF NOT EXISTS idx_geladinho_stock_geladinho_id 
  ON geladinho_stock(geladinho_id);

-- Enable RLS
ALTER TABLE product_stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE geladinho_stock ENABLE ROW LEVEL SECURITY;

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

-- Create triggers for updated_at
CREATE TRIGGER update_product_stock_entries_updated_at
  BEFORE UPDATE ON product_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geladinho_stock_updated_at
  BEFORE UPDATE ON geladinho_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();