/*
  # Initial Database Schema

  1. Tables
    - Creates products table
    - Creates product_stock_entries table
    - Creates recipes table
    - Creates recipe_ingredients table
    - Creates geladinhos table
    - Creates geladinho_stock table
    - Creates sales table
    - Creates monthly_sales view

  2. Security
    - Enables RLS on all tables
    - Adds appropriate policies for each table
*/

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit_of_measure text NOT NULL CHECK (unit_of_measure = 'gramas'),
  total_quantity numeric NOT NULL CHECK (total_quantity >= 0),
  total_value numeric NOT NULL CHECK (total_value >= 0),
  purchase_date timestamptz NOT NULL,
  supplier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read products"
  ON products FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products"
  ON products FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete products"
  ON products FOR DELETE TO authenticated
  USING (true);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create product_stock_entries table
CREATE TABLE IF NOT EXISTS product_stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL CHECK (quantity > 0),
  total_cost numeric NOT NULL CHECK (total_cost > 0),
  entry_date timestamptz NOT NULL,
  supplier text,
  note_photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_stock_entries_product_id ON product_stock_entries(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_entries_entry_date ON product_stock_entries(entry_date);

ALTER TABLE product_stock_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read stock entries"
  ON product_stock_entries FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert stock entries"
  ON product_stock_entries FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update stock entries"
  ON product_stock_entries FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete stock entries"
  ON product_stock_entries FOR DELETE TO authenticated
  USING (true);

CREATE TRIGGER update_product_stock_entries_updated_at
  BEFORE UPDATE ON product_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  yield integer NOT NULL CHECK (yield > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read recipes"
  ON recipes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert recipes"
  ON recipes FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update recipes"
  ON recipes FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete recipes"
  ON recipes FOR DELETE TO authenticated
  USING (true);

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_product_id ON recipe_ingredients(product_id);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read recipe ingredients"
  ON recipe_ingredients FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert recipe ingredients"
  ON recipe_ingredients FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update recipe ingredients"
  ON recipe_ingredients FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete recipe ingredients"
  ON recipe_ingredients FOR DELETE TO authenticated
  USING (true);

CREATE TRIGGER update_recipe_ingredients_updated_at
  BEFORE UPDATE ON recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create geladinhos table
CREATE TABLE IF NOT EXISTS geladinhos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
  category text NOT NULL CHECK (category IN ('Cremoso', 'Frutas', 'Especial', 'Gourmet')),
  profit_margin numeric NOT NULL CHECK (profit_margin >= 0 AND profit_margin <= 1000),
  status text NOT NULL CHECK (status IN ('Ativo', 'Inativo', 'Teste')),
  description text,
  prep_time integer CHECK (prep_time > 0),
  freezing_temp integer CHECK (freezing_temp <= 0),
  notes text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geladinhos_name ON geladinhos(name);
CREATE INDEX IF NOT EXISTS idx_geladinhos_status ON geladinhos(status);

ALTER TABLE geladinhos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read geladinhos"
  ON geladinhos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert geladinhos"
  ON geladinhos FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update geladinhos"
  ON geladinhos FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete geladinhos"
  ON geladinhos FOR DELETE TO authenticated
  USING (true);

CREATE TRIGGER update_geladinhos_updated_at
  BEFORE UPDATE ON geladinhos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create geladinho_stock table
CREATE TABLE IF NOT EXISTS geladinho_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  batch_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geladinho_stock_geladinho_id ON geladinho_stock(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_geladinho_stock_batch_date ON geladinho_stock(batch_date);

ALTER TABLE geladinho_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read geladinho stock"
  ON geladinho_stock FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert geladinho stock"
  ON geladinho_stock FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update geladinho stock"
  ON geladinho_stock FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete geladinho stock"
  ON geladinho_stock FOR DELETE TO authenticated
  USING (true);

CREATE TRIGGER update_geladinho_stock_updated_at
  BEFORE UPDATE ON geladinho_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date date NOT NULL,
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_geladinho_id ON sales(geladinho_id);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read sales"
  ON sales FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert sales"
  ON sales FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sales"
  ON sales FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete sales"
  ON sales FOR DELETE TO authenticated
  USING (true);

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create monthly sales view
CREATE OR REPLACE VIEW monthly_sales AS
SELECT 
  date_trunc('month', sale_date)::date as month,
  sum(total_price) as total_sales,
  sum(quantity) as total_quantity
FROM sales
GROUP BY date_trunc('month', sale_date)::date
ORDER BY month;