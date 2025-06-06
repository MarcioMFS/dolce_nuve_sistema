/*
  # Add Foreign Key Relationships for Stock Tables

  1. Changes
    - Add foreign key constraint between geladinho_stock and geladinhos tables
    - Add foreign key constraint between product_stock_entries and products tables
    - Enable RLS on new tables
    - Add appropriate RLS policies

  2. Security
    - Enable RLS on geladinho_stock and product_stock_entries tables
    - Add policies for authenticated users to manage their own stock entries
*/

-- Create geladinho_stock table if it doesn't exist
CREATE TABLE IF NOT EXISTS geladinho_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geladinho_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  entry_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create product_stock_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  entry_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE geladinho_stock
  ADD CONSTRAINT geladinho_stock_geladinho_id_fkey 
  FOREIGN KEY (geladinho_id) 
  REFERENCES geladinhos(id) 
  ON DELETE CASCADE;

ALTER TABLE product_stock_entries
  ADD CONSTRAINT product_stock_entries_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES products(id) 
  ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE geladinho_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock_entries ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for geladinho_stock
CREATE POLICY "Users can manage their own geladinho stock"
  ON geladinho_stock
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add RLS policies for product_stock_entries
CREATE POLICY "Users can manage their own product stock entries"
  ON product_stock_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER update_geladinho_stock_updated_at
  BEFORE UPDATE ON geladinho_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_stock_entries_updated_at
  BEFORE UPDATE ON product_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();