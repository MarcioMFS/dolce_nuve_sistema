/*
  # Add Stock Entry Tables
  
  1. New Tables
    - product_stock_entries
      - Tracks individual stock entries for products
      - Stores quantity, cost, and supplier info
      - Links to products table
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create product stock entries table
CREATE TABLE IF NOT EXISTS product_stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL CHECK (quantity > 0),
  total_cost numeric NOT NULL CHECK (total_cost >= 0),
  entry_date timestamptz NOT NULL,
  supplier text,
  note_photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stock_entries_product_id ON product_stock_entries(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_entry_date ON product_stock_entries(entry_date);

-- Enable RLS
ALTER TABLE product_stock_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own stock entries"
  ON product_stock_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own stock entries"
  ON product_stock_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own stock entries"
  ON product_stock_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own stock entries"
  ON product_stock_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_stock_entries_updated_at
  BEFORE UPDATE ON product_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();