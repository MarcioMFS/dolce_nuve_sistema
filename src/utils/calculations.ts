import { UnitOfMeasure, Product, Ingredient, Recipe, Geladinho } from '../types';

// 🧮 Calcula o preço por unidade base (g, ml ou un)
export const calculateUnitPrice = (
  total_value: number,
  total_quantity: number,
  unit_of_measure: UnitOfMeasure
): number => {
  if (total_quantity <= 0) return 0;

  // Retorna o preço por grama, mililitro ou unidade
  return total_value / total_quantity;
};

// 📏 Converte para unidade padrão (kg, L ou un)
export const calculateStandardPrice = (
  unitPrice: number,
  unit_of_measure: UnitOfMeasure
): number => {
  switch (unit_of_measure) {
    case 'gramas':
      return unitPrice * 1000; // para kg
    case 'litros':
      return unitPrice * 1000; // para L
    case 'unidades':
    default:
      return unitPrice; // permanece como unidade
  }
};

// 💸 Formata valores em R$ brasileiro
export const formatCurrency = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// 📦 Calcula o custo de um ingrediente
export const calculateIngredientCost = (
  ingredientQuantity: number,
  unitPrice: number
): number => {
  if (!ingredientQuantity || !unitPrice) return 0;
  return ingredientQuantity * unitPrice;
};

// 📋 Soma total do custo da receita (todos os ingredientes)
export const calculateRecipeTotalCost = (ingredients: Ingredient[]): number => {
  if (!ingredients || !Array.isArray(ingredients)) return 0;
  
  return ingredients.reduce((total, ingredient) => {
    if (!ingredient.product) return total;
    return total + calculateIngredientCost(ingredient.quantity, ingredient.product.unit_price);
  }, 0);
};

// 📤 Divide o custo total pelo rendimento
export const calculateRecipeUnitCost = (
  totalCost: number,
  yield_: number
): number => {
  if (!yield_ || yield_ <= 0) return 0;
  return totalCost / yield_;
};

// 💰 Calcula o preço sugerido com base na margem desejada
export const calculateSuggestedPrice = (
  unitCost: number,
  profit_margin: number
): number => {
  if (typeof unitCost !== 'number' || typeof profit_margin !== 'number') return 0;
  if (isNaN(unitCost) || isNaN(profit_margin)) return 0;
  return unitCost * (1 + profit_margin / 100);
};

// 📈 Lucro por unidade
export const calculateUnitProfit = (
  suggestedPrice: number,
  unitCost: number
): number => {
  if (typeof suggestedPrice !== 'number' || typeof unitCost !== 'number') return 0;
  if (isNaN(suggestedPrice) || isNaN(unitCost)) return 0;
  return suggestedPrice - unitCost;
};

// 📊 Margem real com base no lucro e preço
export const calculateRealMargin = (
  unitProfit: number,
  suggestedPrice: number
): number => {
  if (!suggestedPrice || suggestedPrice <= 0) return 0;
  if (typeof unitProfit !== 'number' || isNaN(unitProfit)) return 0;
  return (unitProfit / suggestedPrice) * 100;
};

// 🧾 Processa um produto individual para exibir preços
export const processProductWithCalculations = (product: Product) => {
  if (!product) return null;

  const unitPrice = calculateUnitPrice(
    product.total_value,
    product.total_quantity,
    product.unit_of_measure
  );

  const standardPrice = calculateStandardPrice(unitPrice, product.unit_of_measure);

  return {
    ...product,
    unit_price: unitPrice,
    formatted_unit_price: formatCurrency(unitPrice),
    formatted_standard_price: formatCurrency(standardPrice),
  };
};

// 🍦 Processa uma receita completa
export const processRecipeWithCalculations = (recipe: Recipe) => {
  if (!recipe) return null;
  
  const totalCost = calculateRecipeTotalCost(recipe.ingredients);
  const unitCost = calculateRecipeUnitCost(totalCost, recipe.yield);

  return {
    ...recipe,
    totalCost,
    unitCost,
  };
};

// ❄️ Processa um geladinho completo (produto final)
export const processGeladinhoWithCalculations = (geladinho: Geladinho) => {
  if (!geladinho || !geladinho.recipe) {
    return {
      ...geladinho,
      total_cost: 0,
      unit_cost: 0,
      suggested_price: 0,
      unit_profit: 0,
      real_margin: 0,
    };
  }

  const total_cost = geladinho.recipe.totalCost || 0;
  const unit_cost = geladinho.recipe.unitCost || 0;
  const suggested_price = calculateSuggestedPrice(unit_cost, geladinho.profit_margin);
  const unit_profit = calculateUnitProfit(suggested_price, unit_cost);
  const real_margin = calculateRealMargin(unit_profit, suggested_price);

  return {
    ...geladinho,
    total_cost,
    unit_cost,
    suggested_price,
    unit_profit,
    real_margin,
  };
};