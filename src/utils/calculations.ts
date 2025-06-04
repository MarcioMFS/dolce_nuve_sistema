import { UnitOfMeasure, Product, Ingredient, Recipe, Geladinho } from '../types';

// 🧮 Calcula o preço por unidade base (g, ml ou un)
export const calculateUnitPrice = (
  totalValue: number,
  totalQuantity: number,
  unitOfMeasure: UnitOfMeasure
): number => {
  if (totalQuantity <= 0) return 0;

  // Retorna o preço por grama, mililitro ou unidade
  return totalValue / totalQuantity;
};

// 📏 Converte para unidade padrão (kg, L ou un)
export const calculateStandardPrice = (
  unitPrice: number,
  unitOfMeasure: UnitOfMeasure
): number => {
  switch (unitOfMeasure) {
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
  return ingredientQuantity * unitPrice;
};

// 📋 Soma total do custo da receita (todos os ingredientes)
export const calculateRecipeTotalCost = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((total, ingredient) => {
    if (!ingredient.product) return total;
    return total + calculateIngredientCost(ingredient.quantity, ingredient.product.unitPrice);
  }, 0);
};

// 📤 Divide o custo total pelo rendimento
export const calculateRecipeUnitCost = (
  totalCost: number,
  yield_: number
): number => {
  if (yield_ <= 0) return 0;
  return totalCost / yield_;
};

// 💰 Calcula o preço sugerido com base na margem desejada
export const calculateSuggestedPrice = (
  unitCost: number,
  profitMargin: number
): number => {
  return unitCost * (1 + profitMargin / 100);
};

// 📈 Lucro por unidade
export const calculateUnitProfit = (
  suggestedPrice: number,
  unitCost: number
): number => {
  return suggestedPrice - unitCost;
};

// 📊 Margem real com base no lucro e preço
export const calculateRealMargin = (
  unitProfit: number,
  suggestedPrice: number
): number => {
  if (suggestedPrice <= 0) return 0;
  return (unitProfit / suggestedPrice) * 100;
};

// 🧾 Processa um produto individual para exibir preços
export const processProductWithCalculations = (product: Product) => {
  const unitPrice = calculateUnitPrice(
    product.totalValue,
    product.totalQuantity,
    product.unitOfMeasure
  );

  const standardPrice = calculateStandardPrice(unitPrice, product.unitOfMeasure);

  return {
    ...product,
    unitPrice,
    formattedUnitPrice: formatCurrency(unitPrice),
    formattedStandardPrice: formatCurrency(standardPrice),
  };
};

// 🍦 Processa uma receita completa
export const processRecipeWithCalculations = (recipe: Recipe) => {
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
  if (!geladinho.recipe) {
    return {
      ...geladinho,
      totalCost: 0,
      unitCost: 0,
      suggestedPrice: 0,
      unitProfit: 0,
      realMargin: 0,
    };
  }

  const totalCost = geladinho.recipe.totalCost;
  const unitCost = geladinho.recipe.unitCost;
  const suggestedPrice = calculateSuggestedPrice(unitCost, geladinho.profitMargin);
  const unitProfit = calculateUnitProfit(suggestedPrice, unitCost);
  const realMargin = calculateRealMargin(unitProfit, suggestedPrice);

  return {
    ...geladinho,
    totalCost,
    unitCost,
    suggestedPrice,
    unitProfit,
    realMargin,
  };
};
