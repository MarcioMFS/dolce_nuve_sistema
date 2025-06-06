export type UnitOfMeasure = 'gramas';
export type Category = 'Cremoso' | 'Frutas' | 'Especial' | 'Gourmet';
export type Status = 'Ativo' | 'Inativo' | 'Teste';
export type MovementType = 'entrada' | 'saida';

export interface Product {
  id: string;
  name: string;
  unit_of_measure: UnitOfMeasure;
  total_quantity: number;
  total_value: number;
  purchase_date: string;
  supplier?: string;
  created_at: string;
  updated_at: string;
  total_stock: number;
}

export interface ProductStockEntry {
  id: string;
  product_id: string;
  quantity: number;
  total_cost: number;
  entry_date: string;
  supplier?: string;
  note_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCalculations extends Product {
  unit_price: number;
  standard_price: number;
  formatted_unit_price: string;
  formatted_standard_price: string;
  stock_entries?: ProductStockEntry[];
}

export interface Ingredient {
  id: string;
  product_id: string;
  quantity: number;
  product?: ProductWithCalculations;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  yield: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeWithCalculations extends Recipe {
  total_cost: number;
  unit_cost: number;
}

export interface Geladinho {
  id: string;
  name: string;
  recipe_id: string;
  category: Category;
  profit_margin: number;
  status: Status;
  description?: string;
  prep_time?: number;
  freezing_temp?: number;
  notes?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  recipe?: RecipeWithCalculations;
}

export interface GeladinhoStock {
  id: string;
  geladinho_id: string;
  quantity: number;
  batch_date: string;
  movement_type: MovementType;
  created_at: string;
  updated_at: string;
}

export interface GeladinhoWithCalculations extends Geladinho {
  total_cost: number;
  unit_cost: number;
  suggested_price: number;
  unit_profit: number;
  real_margin: number;
  available_quantity: number;
  stock?: GeladinhoStock[];
}

export interface Sale {
  id: string;
  sale_date: string;
  geladinho_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  geladinho?: GeladinhoWithCalculations;
}

export interface MonthlySales {
  month: string;
  total_sales: number;
  total_quantity: number;
}