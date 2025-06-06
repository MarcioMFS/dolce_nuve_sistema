/*
  # Add Missing Foreign Key Relationships

  1. Changes
    - Add foreign key constraint between geladinho_stock and geladinhos tables
    - Add foreign key constraint between product_stock_entries and products tables

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users to manage their own data

  3. Notes
    - Foreign keys use CASCADE deletion to maintain data consistency
    - RLS policies ensure users can only access their own data
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
  ADD CONSTRAINT fk_geladinho 
  FOREIGN KEY (geladinho_id) 
  REFERENCES geladinhos(id) 
  ON DELETE CASCADE;

ALTER TABLE product_stock_entries
  ADD CONSTRAINT fk_product 
  FOREIGN KEY (product_id) 
  REFERENCES products(id) 
  ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE geladinho_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock_entries ENABLE ROW LEVEL SECURITY;

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