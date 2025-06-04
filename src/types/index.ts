export type UnitOfMeasure = 'gramas' | 'litros' | 'unidades';
export type Category = 'Cremoso' | 'Frutas' | 'Especial' | 'Gourmet';
export type Status = 'Ativo' | 'Inativo' | 'Teste';

export interface Product {
  id: string;
  name: string;
  unitOfMeasure: UnitOfMeasure;
  totalQuantity: number;
  totalValue: number;
  purchaseDate: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface RecipeWithCalculations extends Recipe {
  totalCost: number;
  unitCost: number;
}

export interface Geladinho {
  id: string;
  name: string;
  recipeId: string;
  category: Category;
  profitMargin: number;
  status: Status;
  description?: string;
  prepTime?: number;
  freezingTemp?: number;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  recipe?: RecipeWithCalculations;
}

export interface GeladinhoWithCalculations extends Geladinho {
  totalCost: number;
  unitCost: number;
  suggestedPrice: number;
  unitProfit: number;
  realMargin: number;
}