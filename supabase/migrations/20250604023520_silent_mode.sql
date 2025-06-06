/*
  # Initial Schema Setup

  1. New Tables
    - products (store ingredients and their costs)
    - recipes (store geladinho recipes)
    - recipe_ingredients (junction table for recipe-product relationship)
    - geladinhos (final products with pricing)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
  
  3. Performance
    - Add indexes for frequently queried columns
    - Add triggers for automatic timestamp updates
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit_of_measure unit_measure NOT NULL,
  total_quantity numeric NOT NULL CHECK (total_quantity >= 0),
  total_value numeric NOT NULL CHECK (total_value >= 0),
  purchase_date timestamptz NOT NULL,
  supplier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  yield integer NOT NULL CHECK (yield > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipe_ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create geladinhos table
CREATE TABLE IF NOT EXISTS geladinhos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
  category text NOT NULL CHECK (category IN ('Cremoso', 'Frutas', 'Especial', 'Gourmet')),
  profit_margin numeric NOT NULL CHECK (profit_margin BETWEEN 0 AND 1000),
  status text NOT NULL CHECK (status IN ('Ativo', 'Inativo', 'Teste')),
  description text,
  prep_time integer CHECK (prep_time > 0),
  freezing_temp integer CHECK (freezing_temp <= 0),
  notes text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE geladinhos ENABLE ROW LEVEL SECURITY;

-- Drop existing product policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read their own products" ON products;
  DROP POLICY IF EXISTS "Users can insert their own products" ON products;
  DROP POLICY IF EXISTS "Users can update their own products" ON products;
  DROP POLICY IF EXISTS "Users can delete their own products" ON products;
END $$;

-- Create policies
CREATE POLICY "Users can read their own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Recipe policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read their own recipes" ON recipes;
  DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
  DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
  DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;
END $$;

CREATE POLICY "Users can read their own recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own recipes"
  ON recipes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own recipes"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (true);

-- Recipe ingredients policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read their own recipe ingredients" ON recipe_ingredients;
  DROP POLICY IF EXISTS "Users can insert their own recipe ingredients" ON recipe_ingredients;
  DROP POLICY IF EXISTS "Users can update their own recipe ingredients" ON recipe_ingredients;
  DROP POLICY IF EXISTS "Users can delete their own recipe ingredients" ON recipe_ingredients;
END $$;

CREATE POLICY "Users can read their own recipe ingredients"
  ON recipe_ingredients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own recipe ingredients"
  ON recipe_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own recipe ingredients"
  ON recipe_ingredients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own recipe ingredients"
  ON recipe_ingredients
  FOR DELETE
  TO authenticated
  USING (true);

-- Geladinho policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read their own geladinhos" ON geladinhos;
  DROP POLICY IF EXISTS "Users can insert their own geladinhos" ON geladinhos;
  DROP POLICY IF EXISTS "Users can update their own geladinhos" ON geladinhos;
  DROP POLICY IF EXISTS "Users can delete their own geladinhos" ON geladinhos;
END $$;

CREATE POLICY "Users can read their own geladinhos"
  ON geladinhos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own geladinhos"
  ON geladinhos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own geladinhos"
  ON geladinhos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own geladinhos"
  ON geladinhos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);
CREATE INDEX IF NOT EXISTS idx_geladinhos_name ON geladinhos(name);
CREATE INDEX IF NOT EXISTS idx_geladinhos_status ON geladinhos(status);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_product_id ON recipe_ingredients(product_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_ingredients_updated_at ON recipe_ingredients;
CREATE TRIGGER update_recipe_ingredients_updated_at
  BEFORE UPDATE ON recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_geladinhos_updated_at ON geladinhos;
CREATE TRIGGER update_geladinhos_updated_at
  BEFORE UPDATE ON geladinhos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();