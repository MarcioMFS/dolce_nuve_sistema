\n\n-- Products (Geladinhos)\nCREATE TABLE products (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  name text NOT NULL,\n  category text NOT NULL,\n  recipe_yield integer NOT NULL,\n  sale_price decimal(10,2),\n  target_profit_margin decimal(5,2),\n  production_cost decimal(10,4) DEFAULT 0,\n  unit_cost decimal(10,4) DEFAULT 0,\n  active boolean DEFAULT true,\n  notes text,\n  created_at timestamptz DEFAULT now(),\n  updated_at timestamptz DEFAULT now()\n)
\n\n-- Recipes\nCREATE TABLE recipes (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  product_id uuid NOT NULL REFERENCES products(id),\n  ingredient_id uuid NOT NULL REFERENCES ingredients(id),\n  quantity_required decimal(10,3) NOT NULL,\n  unit_quantity decimal(10,4) DEFAULT 0,\n  ingredient_cost decimal(10,4) DEFAULT 0,\n  notes text,\n  created_at timestamptz DEFAULT now(),\n  UNIQUE(product_id, ingredient_id)\n)
\n\n-- Create function to update unit_quantity\nCREATE OR REPLACE FUNCTION update_recipe_unit_quantity()\nRETURNS TRIGGER AS $$\nBEGIN\n  NEW.unit_quantity := NEW.quantity_required / (\n    SELECT recipe_yield FROM products WHERE id = NEW.product_id\n  )
\n  RETURN NEW
\nEND
\n$$ LANGUAGE plpgsql
\n\n-- Create trigger to automatically update unit_quantity\nCREATE TRIGGER update_recipe_unit_quantity_trigger\n  BEFORE INSERT OR UPDATE ON recipes\n  FOR EACH ROW\n  EXECUTE FUNCTION update_recipe_unit_quantity()
\n\n-- Stock Movements\nCREATE TYPE movement_type AS ENUM ('entrada', 'saida', 'ajuste')
\n\nCREATE TABLE stock_movements (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  ingredient_id uuid NOT NULL REFERENCES ingredients(id),\n  movement_type movement_type NOT NULL,\n  quantity decimal(10,3) NOT NULL,\n  reason text NOT NULL,\n  notes text,\n  created_at timestamptz DEFAULT now()\n)
\n\n-- Enable RLS\nALTER TABLE products ENABLE ROW LEVEL SECURITY
\nALTER TABLE recipes ENABLE ROW LEVEL SECURITY
\nALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY
\n\n-- RLS Policies\nCREATE POLICY "Users can read products"\n  ON products FOR SELECT TO authenticated\n  USING (true)
\n\nCREATE POLICY "Users can insert products"\n  ON products FOR INSERT TO authenticated\n  WITH CHECK (true)
\n\nCREATE POLICY "Users can update products"\n  ON products FOR UPDATE TO authenticated\n  USING (true)
\n\nCREATE POLICY "Users can read recipes"\n  ON recipes FOR SELECT TO authenticated\n  USING (true)
\n\nCREATE POLICY "Users can insert recipes"\n  ON recipes FOR INSERT TO authenticated\n  WITH CHECK (true)
\n\nCREATE POLICY "Users can update recipes"\n  ON recipes FOR UPDATE TO authenticated\n  USING (true)
\n\nCREATE POLICY "Users can read stock movements"\n  ON stock_movements FOR SELECT TO authenticated\n  USING (true)
\n\nCREATE POLICY "Users can insert stock movements"\n  ON stock_movements FOR INSERT TO authenticated\n  WITH CHECK (true)
\n\n-- Create current stock view\nCREATE VIEW current_stock AS\nSELECT \n  i.id as ingredient_id,\n  i.name as ingredient_name,\n  i.unit_measure,\n  COALESCE(SUM(\n    CASE \n      WHEN sm.movement_type = 'entrada' THEN sm.quantity\n      WHEN sm.movement_type = 'saida' THEN -sm.quantity\n      WHEN sm.movement_type = 'ajuste' THEN sm.quantity\n    END\n  ), 0) as current_quantity\nFROM ingredients i\nLEFT JOIN stock_movements sm ON i.id = sm.ingredient_id\nGROUP BY i.id, i.name, i.unit_measure
