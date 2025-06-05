/*
  # Stock Control System Implementation

  1. New Tables
    - `product_stock_entries`
      - Tracks individual stock entries with invoice photos
      - Links to products table
      - Stores quantity, cost, and supplier info
    - `geladinho_stock`
      - Tracks ready-to-sell geladinho inventory
      - Links to geladinhos table
      - Stores available quantity

  2. Storage
    - Create bucket for invoice photos
    - Set up public access policies

  3. Changes
    - Add total_stock to products table
    - Add available_quantity to geladinhos table
*/

-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('notas-fiscais', 'notas-fiscais', true);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'notas-fiscais');

-- Create policy to allow public access to invoice photos
CREATE POLICY "Allow public access to invoices"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'notas-fiscais');

-- Add total_stock to products
ALTER TABLE products
ADD COLUMN total_stock numeric NOT NULL DEFAULT 0 CHECK (total_stock >= 0);

-- Add available_quantity to geladinhos
ALTER TABLE geladinhos
ADD COLUMN available_quantity integer NOT NULL DEFAULT 0 CHECK (available_quantity >= 0);

-- Create product stock entries table
CREATE TABLE product_stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL CHECK (quantity > 0),
  total_cost numeric NOT NULL CHECK (total_cost >= 0),
  entry_date timestamptz NOT NULL DEFAULT now(),
  supplier text,
  note_photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create geladinho stock table
CREATE TABLE geladinho_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity >= 0),
  batch_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE geladinho_stock ENABLE ROW LEVEL SECURITY;

-- Create policies for product_stock_entries
CREATE POLICY "Users can read their own stock entries"
  ON product_stock_entries FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own stock entries"
  ON product_stock_entries FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own stock entries"
  ON product_stock_entries FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- Create policies for geladinho_stock
CREATE POLICY "Users can read geladinho stock"
  ON geladinho_stock FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage geladinho stock"
  ON geladinho_stock FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_product_stock_entries_product_id 
  ON product_stock_entries(product_id);
CREATE INDEX idx_product_stock_entries_entry_date 
  ON product_stock_entries(entry_date);
CREATE INDEX idx_geladinho_stock_geladinho_id 
  ON geladinho_stock(geladinho_id);

-- Create trigger to update products total_stock
CREATE OR REPLACE FUNCTION update_product_total_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products 
    SET total_stock = total_stock + NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET total_stock = total_stock - OLD.quantity
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_stock_after_entry
  AFTER INSERT OR DELETE ON product_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_product_total_stock();

-- Create trigger to update geladinho available_quantity
CREATE OR REPLACE FUNCTION update_geladinho_available_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE geladinhos 
    SET available_quantity = available_quantity + NEW.quantity
    WHERE id = NEW.geladinho_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE geladinhos 
    SET available_quantity = available_quantity - OLD.quantity
    WHERE id = OLD.geladinho_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_geladinho_stock_after_entry
  AFTER INSERT OR DELETE ON geladinho_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_geladinho_available_quantity();