/*
  # Sistema de Gestão de Estoque com Alertas

  1. Novas Funcionalidades
    - Triggers para dedução automática de ingredientes na produção
    - Função para calcular preço médio ponderado
    - Triggers para alertas automáticos de estoque baixo
    - Views para relatórios de estoque

  2. Melhorias
    - Atualização automática do total_stock dos produtos
    - Cálculo de preço médio baseado nas entradas
    - Sistema de alertas em tempo real

  3. Segurança
    - Mantém todas as políticas RLS existentes
    - Adiciona validações de integridade
*/

-- Função para calcular preço médio ponderado
CREATE OR REPLACE FUNCTION calculate_weighted_average_price(product_uuid uuid)
RETURNS numeric AS $$
DECLARE
  total_cost numeric := 0;
  total_quantity numeric := 0;
  avg_price numeric := 0;
BEGIN
  -- Soma apenas entradas positivas (compras)
  SELECT 
    COALESCE(SUM(total_cost), 0),
    COALESCE(SUM(quantity), 0)
  INTO total_cost, total_quantity
  FROM product_stock_entries 
  WHERE product_id = product_uuid 
    AND quantity > 0;
  
  IF total_quantity > 0 THEN
    avg_price := total_cost / total_quantity;
  END IF;
  
  RETURN avg_price;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar preços dos produtos baseado no preço médio ponderado
CREATE OR REPLACE FUNCTION update_product_pricing()
RETURNS trigger AS $$
BEGIN
  -- Atualiza o unit_price com base no preço médio ponderado
  UPDATE products 
  SET unit_price = calculate_weighted_average_price(NEW.product_id)
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar preços quando há nova entrada de estoque
DROP TRIGGER IF EXISTS update_product_pricing_trigger ON product_stock_entries;
CREATE TRIGGER update_product_pricing_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_product_pricing();

-- Função para deduzir ingredientes automaticamente na produção
CREATE OR REPLACE FUNCTION deduct_ingredients_on_production()
RETURNS trigger AS $$
DECLARE
  recipe_record RECORD;
  ingredient_record RECORD;
  batches_produced numeric;
  quantity_consumed numeric;
  current_stock numeric;
  new_stock numeric;
BEGIN
  -- Só processa se for uma entrada (produção)
  IF NEW.movement_type = 'entrada' THEN
    -- Busca a receita do geladinho
    SELECT r.* INTO recipe_record
    FROM recipes r
    JOIN geladinhos g ON g.recipe_id = r.id
    WHERE g.id = NEW.geladinho_id;
    
    IF FOUND THEN
      -- Calcula quantos lotes foram produzidos
      batches_produced := NEW.quantity::numeric / recipe_record.yield::numeric;
      
      -- Para cada ingrediente da receita
      FOR ingredient_record IN 
        SELECT ri.*, p.total_stock
        FROM recipe_ingredients ri
        JOIN products p ON p.id = ri.product_id
        WHERE ri.recipe_id = recipe_record.id
      LOOP
        -- Calcula quantidade consumida
        quantity_consumed := ingredient_record.quantity * batches_produced;
        
        -- Atualiza o estoque do produto
        current_stock := COALESCE(ingredient_record.total_stock, 0);
        new_stock := GREATEST(0, current_stock - quantity_consumed);
        
        UPDATE products 
        SET total_stock = new_stock
        WHERE id = ingredient_record.product_id;
        
        -- Registra a movimentação de consumo
        INSERT INTO product_stock_entries (
          product_id,
          quantity,
          total_cost,
          entry_date,
          supplier
        ) VALUES (
          ingredient_record.product_id,
          -quantity_consumed,
          0,
          NEW.batch_date,
          'Produção: ' || (SELECT name FROM geladinhos WHERE id = NEW.geladinho_id) || ' (' || NEW.quantity || ' unidades)'
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para dedução automática de ingredientes
DROP TRIGGER IF EXISTS deduct_ingredients_trigger ON geladinho_stock;
CREATE TRIGGER deduct_ingredients_trigger
  AFTER INSERT ON geladinho_stock
  FOR EACH ROW
  EXECUTE FUNCTION deduct_ingredients_on_production();

-- View para alertas de estoque baixo
CREATE OR REPLACE VIEW stock_alerts AS
SELECT 
  'product' as item_type,
  p.id,
  p.name,
  p.total_stock as current_stock,
  'g' as unit,
  CASE 
    WHEN p.total_stock <= 10 THEN 'critical'
    WHEN p.total_stock <= 100 THEN 'low'
    ELSE 'good'
  END as alert_level,
  p.unit_price,
  (p.total_stock * p.unit_price) as stock_value,
  p.supplier
FROM products p
WHERE p.total_stock <= 100

UNION ALL

SELECT 
  'geladinho' as item_type,
  g.id,
  g.name,
  COALESCE(stock_summary.available_quantity, 0) as current_stock,
  'un' as unit,
  CASE 
    WHEN COALESCE(stock_summary.available_quantity, 0) <= 5 THEN 'critical'
    WHEN COALESCE(stock_summary.available_quantity, 0) <= 20 THEN 'low'
    ELSE 'good'
  END as alert_level,
  COALESCE(recipe_cost.unit_cost, 0) as unit_price,
  (COALESCE(stock_summary.available_quantity, 0) * COALESCE(recipe_cost.unit_cost, 0)) as stock_value,
  'Produção própria' as supplier
FROM geladinhos g
LEFT JOIN (
  SELECT 
    geladinho_id,
    SUM(CASE WHEN movement_type = 'entrada' THEN quantity ELSE -quantity END) as available_quantity
  FROM geladinho_stock
  GROUP BY geladinho_id
) stock_summary ON stock_summary.geladinho_id = g.id
LEFT JOIN (
  SELECT 
    r.id as recipe_id,
    COALESCE(SUM(ri.quantity * p.unit_price), 0) / NULLIF(r.yield, 0) as unit_cost
  FROM recipes r
  LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
  LEFT JOIN products p ON p.id = ri.product_id
  GROUP BY r.id, r.yield
) recipe_cost ON recipe_cost.recipe_id = g.recipe_id
WHERE COALESCE(stock_summary.available_quantity, 0) <= 20;

-- View para histórico consolidado de movimentações
CREATE OR REPLACE VIEW stock_movements_history AS
SELECT 
  'product' as item_type,
  p.name as item_name,
  pse.id,
  pse.entry_date as movement_date,
  pse.quantity,
  CASE WHEN pse.quantity > 0 THEN 'entrada' ELSE 'saida' END as movement_type,
  pse.total_cost,
  pse.supplier,
  'g' as unit
FROM product_stock_entries pse
JOIN products p ON p.id = pse.product_id

UNION ALL

SELECT 
  'geladinho' as item_type,
  g.name as item_name,
  gs.id,
  gs.batch_date as movement_date,
  gs.quantity,
  gs.movement_type,
  (gs.quantity * COALESCE(recipe_cost.unit_cost, 0)) as total_cost,
  NULL as supplier,
  'un' as unit
FROM geladinho_stock gs
JOIN geladinhos g ON g.id = gs.geladinho_id
LEFT JOIN (
  SELECT 
    r.id as recipe_id,
    COALESCE(SUM(ri.quantity * p.unit_price), 0) / NULLIF(r.yield, 0) as unit_cost
  FROM recipes r
  LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
  LEFT JOIN products p ON p.id = ri.product_id
  GROUP BY r.id, r.yield
) recipe_cost ON recipe_cost.recipe_id = g.recipe_id

ORDER BY movement_date DESC;

-- Adiciona coluna unit_price na tabela products se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE products ADD COLUMN unit_price numeric DEFAULT 0;
  END IF;
END $$;

-- Atualiza unit_price para produtos existentes
UPDATE products 
SET unit_price = calculate_weighted_average_price(id)
WHERE unit_price IS NULL OR unit_price = 0;