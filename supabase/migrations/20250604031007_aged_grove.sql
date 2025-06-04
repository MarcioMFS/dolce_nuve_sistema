/*
  # Add sample data

  1. Sample Data
    - Products: Basic ingredients for geladinhos
    - Recipes: Common geladinho recipes
    - Geladinhos: Popular flavors with pricing
  
  2. Data Flow
    - First insert products
    - Then create recipes
    - Finally add geladinhos using the recipes
*/

-- Insert sample products
INSERT INTO products (name, unit_of_measure, total_quantity, total_value, purchase_date, supplier)
VALUES
  ('Leite Condensado', 'gramas', 5000, 89.90, now(), 'Atacadão'),
  ('Leite em Pó', 'gramas', 2000, 45.50, now(), 'Makro'),
  ('Morango', 'gramas', 3000, 35.90, now(), 'Feira Local'),
  ('Chocolate em Pó', 'gramas', 1000, 28.90, now(), 'Atacadão'),
  ('Creme de Leite', 'gramas', 4000, 52.80, now(), 'Makro'),
  ('Maracujá', 'gramas', 2500, 32.50, now(), 'Feira Local'),
  ('Coco Ralado', 'gramas', 1500, 42.90, now(), 'Atacadão'),
  ('Açúcar', 'gramas', 10000, 22.90, now(), 'Makro'),
  ('Leite Integral', 'litros', 10, 48.90, now(), 'Atacadão'),
  ('Nutella', 'gramas', 2000, 89.90, now(), 'Makro');

-- Insert sample recipes
INSERT INTO recipes (name, yield)
VALUES
  ('Base Cremosa de Leite', 50),
  ('Morango Cremoso', 40),
  ('Chocolate Premium', 45),
  ('Maracujá Especial', 40),
  ('Prestígio', 35);

-- Get recipe IDs
DO $$
DECLARE
  base_cremosa_id uuid;
  morango_id uuid;
  chocolate_id uuid;
  maracuja_id uuid;
  prestigio_id uuid;
BEGIN
  SELECT id INTO base_cremosa_id FROM recipes WHERE name = 'Base Cremosa de Leite' LIMIT 1;
  SELECT id INTO morango_id FROM recipes WHERE name = 'Morango Cremoso' LIMIT 1;
  SELECT id INTO chocolate_id FROM recipes WHERE name = 'Chocolate Premium' LIMIT 1;
  SELECT id INTO maracuja_id FROM recipes WHERE name = 'Maracujá Especial' LIMIT 1;
  SELECT id INTO prestigio_id FROM recipes WHERE name = 'Prestígio' LIMIT 1;

  -- Insert recipe ingredients for Base Cremosa
  INSERT INTO recipe_ingredients (recipe_id, product_id, quantity)
  SELECT base_cremosa_id, id, 2000 FROM products WHERE name = 'Leite Condensado'
  UNION ALL
  SELECT base_cremosa_id, id, 1000 FROM products WHERE name = 'Leite em Pó'
  UNION ALL
  SELECT base_cremosa_id, id, 500 FROM products WHERE name = 'Açúcar';

  -- Insert recipe ingredients for Morango Cremoso
  INSERT INTO recipe_ingredients (recipe_id, product_id, quantity)
  SELECT morango_id, id, 1500 FROM products WHERE name = 'Leite Condensado'
  UNION ALL
  SELECT morango_id, id, 1000 FROM products WHERE name = 'Morango'
  UNION ALL
  SELECT morango_id, id, 300 FROM products WHERE name = 'Açúcar';

  -- Insert recipe ingredients for Chocolate Premium
  INSERT INTO recipe_ingredients (recipe_id, product_id, quantity)
  SELECT chocolate_id, id, 1500 FROM products WHERE name = 'Leite Condensado'
  UNION ALL
  SELECT chocolate_id, id, 500 FROM products WHERE name = 'Chocolate em Pó'
  UNION ALL
  SELECT chocolate_id, id, 1000 FROM products WHERE name = 'Leite em Pó';

  -- Insert recipe ingredients for Maracujá Especial
  INSERT INTO recipe_ingredients (recipe_id, product_id, quantity)
  SELECT maracuja_id, id, 1500 FROM products WHERE name = 'Leite Condensado'
  UNION ALL
  SELECT maracuja_id, id, 800 FROM products WHERE name = 'Maracujá'
  UNION ALL
  SELECT maracuja_id, id, 300 FROM products WHERE name = 'Açúcar';

  -- Insert recipe ingredients for Prestígio
  INSERT INTO recipe_ingredients (recipe_id, product_id, quantity)
  SELECT prestigio_id, id, 1500 FROM products WHERE name = 'Leite Condensado'
  UNION ALL
  SELECT prestigio_id, id, 800 FROM products WHERE name = 'Coco Ralado'
  UNION ALL
  SELECT prestigio_id, id, 300 FROM products WHERE name = 'Chocolate em Pó';

  -- Insert sample geladinhos
  INSERT INTO geladinhos (name, recipe_id, category, profit_margin, status, description, prep_time, freezing_temp)
  VALUES
    ('Morango Cremoso', morango_id, 'Cremoso', 80, 'Ativo', 'Delicioso geladinho de morango com leite condensado', 30, -18),
    ('Chocolate Premium', chocolate_id, 'Gourmet', 100, 'Ativo', 'Geladinho premium de chocolate belga', 35, -18),
    ('Maracujá Especial', maracuja_id, 'Especial', 90, 'Ativo', 'Geladinho especial de maracujá natural', 25, -18),
    ('Prestígio', prestigio_id, 'Gourmet', 120, 'Ativo', 'Geladinho gourmet sabor prestígio', 40, -18);
END $$;