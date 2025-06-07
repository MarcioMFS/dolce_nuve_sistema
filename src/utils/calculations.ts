import { UnitOfMeasure, Product, Ingredient, Recipe, Geladinho, GeladinhoStock, ProductStockEntry, Sale, SaleWithProfitCalculations } from '../types';

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
      return unitPrice * 1000; // Converte para preço por kg
    case 'litros':
      return unitPrice * 1000; // Converte para preço por L
    case 'unidades':
      return unitPrice; // Mantém o mesmo preço para unidades
    default:
      return 0;
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
    if (!ingredient?.product?.unit_price) return total;
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

// 💰 Calcula preço médio ponderado baseado nas entradas de estoque
export const calculateWeightedAveragePrice = (stockEntries: ProductStockEntry[]): number => {
  if (!stockEntries || stockEntries.length === 0) return 0;
  
  // Filtra apenas entradas positivas (compras)
  const positiveEntries = stockEntries.filter(entry => entry.quantity > 0);
  
  if (positiveEntries.length === 0) return 0;
  
  let totalCost = 0;
  let totalQuantity = 0;
  
  positiveEntries.forEach(entry => {
    totalCost += entry.total_cost;
    totalQuantity += entry.quantity;
  });
  
  return totalQuantity > 0 ? totalCost / totalQuantity : 0;
};

// 💵 Calcula lucro de uma venda específica
export const calculateSaleProfit = (
  sale: Sale,
  unitCost: number
): {
  unit_profit: number;
  total_profit: number;
  profit_margin: number;
  net_total: number;
} => {
  const netTotal = sale.total_price - (sale.discount || 0);
  const unitProfit = sale.unit_price - unitCost;
  const totalProfit = unitProfit * sale.quantity - (sale.discount || 0);
  const profitMargin = netTotal > 0 ? (totalProfit / netTotal) * 100 : 0;

  return {
    unit_profit: unitProfit,
    total_profit: totalProfit,
    profit_margin: profitMargin,
    net_total: netTotal,
  };
};

// 🧾 Processa um produto individual para exibir preços
export const processProductWithCalculations = (product: Product & { stock_entries?: ProductStockEntry[] }) => {
  if (!product) {
    console.warn('processProductWithCalculations: product is null/undefined');
    return null;
  }

  console.log(`Processing product ${product.name}:`, product);

  // Calcula preço médio ponderado baseado nas entradas de estoque
  // Se não houver entradas de estoque, usa os dados originais do produto
  let unitPrice = 0;
  
  if (product.stock_entries && product.stock_entries.length > 0) {
    unitPrice = calculateWeightedAveragePrice(product.stock_entries);
    console.log(`Weighted average price for ${product.name}: ${unitPrice}`);
  }
  
  // Se não conseguiu calcular o preço médio ponderado (sem entradas de estoque ou todas negativas),
  // usa o preço original do produto
  if (unitPrice === 0) {
    unitPrice = calculateUnitPrice(
      product.total_value,
      product.total_quantity,
      product.unit_of_measure
    );
    console.log(`Fallback unit price for ${product.name}: ${unitPrice}`);
  }

  const standardPrice = calculateStandardPrice(unitPrice, product.unit_of_measure);

  const result = {
    ...product,
    unit_price: unitPrice,
    standard_price: standardPrice,
    formatted_unit_price: formatCurrency(unitPrice),
    formatted_standard_price: formatCurrency(standardPrice),
  };

  console.log(`Final processed product ${product.name}:`, result);
  return result;
};

// 🍦 Processa uma receita completa
export const processRecipeWithCalculations = (recipe: Recipe) => {
  if (!recipe) {
    console.warn('processRecipeWithCalculations: recipe is null/undefined');
    return null;
  }
  
  console.log(`Processing recipe ${recipe.name}:`, recipe);
  
  // Ensure ingredients have their products processed
  const processedIngredients = recipe.ingredients.map(ingredient => {
    const processedProduct = ingredient.product ? ingredient.product : undefined;
    console.log(`Ingredient ${ingredient.product_id} product:`, processedProduct);
    
    return {
      ...ingredient,
      product: processedProduct
    };
  });
  
  const total_cost = calculateRecipeTotalCost(processedIngredients);
  const unit_cost = calculateRecipeUnitCost(total_cost, recipe.yield);

  console.log(`Recipe ${recipe.name} calculations:`, { total_cost, unit_cost });

  const result = {
    ...recipe,
    ingredients: processedIngredients,
    total_cost,
    unit_cost,
  };

  console.log(`Final processed recipe ${recipe.name}:`, result);
  return result;
};

// ❄️ Processa um geladinho completo (produto final)
export const processGeladinhoWithCalculations = (geladinho: Geladinho & { stock?: GeladinhoStock[] }) => {
  if (!geladinho) {
    console.warn('processGeladinhoWithCalculations: geladinho is null/undefined');
    return null;
  }

  console.log(`Processing geladinho ${geladinho.name}:`, geladinho);

  // Process the recipe first if it exists
  const processedRecipe = geladinho.recipe ? geladinho.recipe : null;
  
  const total_cost = processedRecipe?.total_cost || 0;
  const unit_cost = processedRecipe?.unit_cost || 0;
  const suggested_price = calculateSuggestedPrice(unit_cost, geladinho.profit_margin);
  const unit_profit = calculateUnitProfit(suggested_price, unit_cost);
  const real_margin = calculateRealMargin(unit_profit, suggested_price);

  // Calculate available quantity from stock entries
  const available_quantity = geladinho.stock?.reduce((total, entry) => {
    const qty = Math.abs(entry.quantity);
    return entry.movement_type === 'entrada'
      ? total + qty
      : total - qty;
  }, 0) || 0;

  console.log(`Geladinho ${geladinho.name} calculations:`, {
    total_cost,
    unit_cost,
    suggested_price,
    unit_profit,
    real_margin,
    available_quantity
  });

  const result = {
    ...geladinho,
    recipe: processedRecipe,
    total_cost,
    unit_cost,
    suggested_price,
    unit_profit,
    real_margin,
    available_quantity,
  };

  console.log(`Final processed geladinho ${geladinho.name}:`, result);
  return result;
};

// 🛒 Processa uma venda com cálculos de lucro
export const processSaleWithProfitCalculations = (
  sale: Sale,
  geladinho?: any
): SaleWithProfitCalculations => {
  const unitCost = geladinho?.unit_cost || 0;
  const profitCalcs = calculateSaleProfit(sale, unitCost);

  return {
    ...sale,
    unit_cost: unitCost,
    ...profitCalcs,
  };
};