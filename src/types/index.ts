export type UnitOfMeasure = 'gramas' | 'litros' | 'unidades';
export type Category = 'Cremoso' | 'Frutas' | 'Especial' | 'Gourmet';
export type Status = 'Ativo' | 'Inativo' | 'Teste';

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
}

export interface ProductWithCalculations extends Product {
  unitPrice: number;
  formattedUnitPrice: string;
  formattedStandardPrice: string;
}

export interface Ingredient {
  id: string;
  productId: string;
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
  totalCost: number;
  unitCost: number;
}

export interface Geladinho {
  id: string;
  name: string;
  recipe_id: string;
  category: Category;
  profit_margin: number;
  status: Status;
  description?: string;
  prepTime?: number;
  freezingTemp?: number;
  notes?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  recipe?: RecipeWithCalculations;
}

export interface GeladinhoWithCalculations extends Geladinho {
  totalCost: number;
  unitCost: number;
  suggestedPrice: number;
  unitProfit: number;
  realMargin: number;
}