import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Product, 
  ProductWithCalculations, 
  Recipe, 
  RecipeWithCalculations, 
  Geladinho,
  GeladinhoWithCalculations,
  Ingredient,
  Sale,
  SaleWithProfitCalculations,
  MonthlySales,
  DailySales,
  ProductStockEntry,
  GeladinhoStock
} from '../types';
import { 
  processProductWithCalculations, 
  processRecipeWithCalculations, 
  processGeladinhoWithCalculations,
  processSaleWithProfitCalculations
} from '../utils/calculations';
import { supabase } from '../lib/supabase';

interface StoreState {
  products: ProductWithCalculations[];
  recipes: RecipeWithCalculations[];
  geladinhos: GeladinhoWithCalculations[];
  sales: SaleWithProfitCalculations[];
  monthlySales: MonthlySales[];
  dailySales: DailySales[];

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'total_stock' | 'total_quantity' | 'total_value' | 'purchase_date' | 'supplier'>) => Promise<string | null>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => ProductWithCalculations | undefined;
  fetchProducts: () => Promise<void>;

  // Stock entry actions
  addStockEntry: (entry: Omit<ProductStockEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  fetchStockEntries: (productId: string) => Promise<void>;

  // Recipe actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipe: (id: string) => RecipeWithCalculations | undefined;
  fetchRecipes: () => Promise<void>;
  
  // Ingredient actions
  addIngredientToRecipe: (recipe_id: string, ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (recipe_id: string, ingredientId: string, ingredient: Partial<Ingredient>) => Promise<void>;
  removeIngredientFromRecipe: (recipe_id: string, ingredientId: string) => Promise<void>;

  // Geladinho actions
  addGeladinho: (geladinho: Omit<Geladinho, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGeladinho: (id: string, geladinho: Partial<Geladinho>) => Promise<void>;
  deleteGeladinho: (id: string) => Promise<void>;
  getGeladinho: (id: string) => GeladinhoWithCalculations | undefined;
  fetchGeladinhos: () => Promise<void>;

  // Geladinho stock actions
  addGeladinhoStock: (stock: Omit<GeladinhoStock, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  fetchGeladinhoStock: (geladinhoId: string) => Promise<void>;

  // Sales actions
  addSale: (sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSale: (id: string, sale: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  getSale: (id: string) => SaleWithProfitCalculations | undefined;
  fetchSales: () => Promise<void>;
  fetchMonthlySales: () => Promise<void>;
  fetchDailySales: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      recipes: [],
      geladinhos: [],
      sales: [],
      monthlySales: [],
      dailySales: [],

      // Product actions
      fetchProducts: async () => {
        try {
          const { data: products, error } = await supabase
            .from('products')
            .select('*, stock_entries:product_stock_entries(*)')
            .order('name');
          
          if (error) {
            console.error('Error fetching products:', error);
            return;
          }
          
          console.log('Raw products from DB:', products);
          
          const processedProducts = products.map(product => {
            const processed = processProductWithCalculations({
              ...product,
              stock_entries: product.stock_entries || [],
            });
            console.log(`Processed product ${product.name}:`, processed);
            return processed;
          });
          
          console.log('All processed products:', processedProducts);
          
          set({ products: processedProducts });
        } catch (error) {
          console.error('Error in fetchProducts:', error);
        }
      },

      addProduct: async (product) => {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: product.name,
            unit_of_measure: product.unit_of_measure,
            total_quantity: 0, // Initialize with 0
            total_value: 0, // Initialize with 0
            purchase_date: new Date().toISOString(), // Set current date as placeholder
            total_stock: 0, // Initialize with 0
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error adding product:', error);
          return null;
        }
        
        const processedProduct = processProductWithCalculations(data);
        set((state) => ({
          products: [...state.products, processedProduct],
        }));
        
        return data.id;
      },

      updateProduct: async (id, updatedFields) => {
        // Only allow updating name and unit_of_measure
        const updateData = {
          name: updatedFields.name,
          unit_of_measure: updatedFields.unit_of_measure,
        };

        const { data, error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating product:', error);
          return;
        }
        
        // Refresh all data to ensure consistency
        await get().fetchProducts();
        await get().fetchRecipes();
        await get().fetchGeladinhos();
      },

      deleteProduct: async (id) => {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting product:', error);
          return;
        }
        
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));

        await get().fetchRecipes();
        await get().fetchGeladinhos();
      },

      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },

      // Stock entry actions
      addStockEntry: async (entry) => {
        const { error } = await supabase
          .from('product_stock_entries')
          .insert([entry]);
        
        if (error) {
          console.error('Error adding stock entry:', error);
          return;
        }
        
        await get().fetchProducts();
      },

      fetchStockEntries: async (productId) => {
        const { data, error } = await supabase
          .from('product_stock_entries')
          .select('*')
          .eq('product_id', productId)
          .order('entry_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching stock entries:', error);
          return;
        }
        
        set((state) => ({
          products: state.products.map(product =>
            product.id === productId
              ? { ...product, stock_entries: data }
              : product
          ),
        }));
      },

      // Recipe actions
      fetchRecipes: async () => {
        try {
          const { data: recipes, error } = await supabase
            .from('recipes')
            .select(`
              *,
              ingredients:recipe_ingredients (
                id,
                product_id,
                quantity,
                products (*)
              )
            `)
            .order('name');
          
          if (error) {
            console.error('Error fetching recipes:', error);
            return;
          }
          
          console.log('Raw recipes from DB:', recipes);
          
          // Get current products to ensure we have the latest data
          const currentProducts = get().products;
          
          const processedRecipes = recipes.map((recipe) => {
            const formattedRecipe = {
              ...recipe,
              ingredients: recipe.ingredients.map((ingredient: any) => {
                // Find the product in our current products list (which has calculations)
                const productWithCalculations = currentProducts.find(p => p.id === ingredient.product_id);
                
                return {
                  id: ingredient.id,
                  product_id: ingredient.product_id,
                  quantity: ingredient.quantity,
                  product: productWithCalculations || (ingredient.products ? processProductWithCalculations(ingredient.products) : undefined),
                };
              }),
            };
            
            const processed = processRecipeWithCalculations(formattedRecipe);
            console.log(`Processed recipe ${recipe.name}:`, processed);
            return processed;
          });
          
          console.log('All processed recipes:', processedRecipes);
          
          set({ recipes: processedRecipes });
        } catch (error) {
          console.error('Error in fetchRecipes:', error);
        }
      },

      addRecipe: async (recipe) => {
        const { data: newRecipe, error: recipeError } = await supabase
          .from('recipes')
          .insert([{
            name: recipe.name,
            yield: recipe.yield,
          }])
          .select()
          .single();
        
        if (recipeError) {
          console.error('Error adding recipe:', recipeError);
          return;
        }

        const ingredients = recipe.ingredients.map((ingredient) => ({
          recipe_id: newRecipe.id,
          product_id: ingredient.product_id,
          quantity: ingredient.quantity,
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredients);

        if (ingredientsError) {
          console.error('Error adding recipe ingredients:', ingredientsError);
          return;
        }

        await get().fetchRecipes();
      },

      updateRecipe: async (id, updatedFields) => {
        const updateData = { ...updatedFields } as Partial<Recipe> & {
          ingredients?: Omit<Ingredient, 'id' | 'product'>[];
        };
        delete updateData.ingredients;

        const { error } = await supabase
          .from('recipes')
          .update(updateData)
          .eq('id', id);
        
        if (error) {
          console.error('Error updating recipe:', error);
          return;
        }

        if (updatedFields.ingredients) {
          await supabase
            .from('recipe_ingredients')
            .delete()
            .eq('recipe_id', id);

          const ingredients = updatedFields.ingredients.map((ingredient) => ({
            recipe_id: id,
            product_id: ingredient.product_id,
            quantity: ingredient.quantity,
          }));

          await supabase
            .from('recipe_ingredients')
            .insert(ingredients);
        }

        await get().fetchRecipes();
        await get().fetchGeladinhos();
      },

      deleteRecipe: async (id) => {
        const { error } = await supabase
          .from('recipes')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting recipe:', error);
          return;
        }
        
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
        }));

        await get().fetchGeladinhos();
      },

      getRecipe: (id) => {
        return get().recipes.find((recipe) => recipe.id === id);
      },
      
      // Ingredient actions
      addIngredientToRecipe: async (recipe_id, ingredient) => {
        const { error } = await supabase
          .from('recipe_ingredients')
          .insert([{
            recipe_id,
            product_id: ingredient.product_id,
            quantity: ingredient.quantity,
          }]);
        
        if (error) {
          console.error('Error adding ingredient:', error);
          return;
        }

        await get().fetchRecipes();
        await get().fetchGeladinhos();
      },
      
      updateIngredient: async (recipe_id, ingredientId, updatedFields) => {
        const { error } = await supabase
          .from('recipe_ingredients')
          .update({
            product_id: updatedFields.product_id,
            quantity: updatedFields.quantity,
          })
          .eq('id', ingredientId);
        
        if (error) {
          console.error('Error updating ingredient:', error);
          return;
        }

        await get().fetchRecipes();
        await get().fetchGeladinhos();
      },
      
      removeIngredientFromRecipe: async (recipe_id, ingredientId) => {
        const { error } = await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('id', ingredientId);
        
        if (error) {
          console.error('Error removing ingredient:', error);
          return;
        }

        await get().fetchRecipes();
        await get().fetchGeladinhos();
      },

      // Geladinho actions
      fetchGeladinhos: async () => {
        try {
          const { data: geladinhos, error } = await supabase
            .from('geladinhos')
            .select(`
              *,
              recipe:recipes (
                *,
                ingredients:recipe_ingredients (
                  id,
                  product_id,
                  quantity,
                  products (*)
                )
              ),
              stock:geladinho_stock(*)
            `)
            .order('name');
          
          if (error) {
            console.error('Error fetching geladinhos:', error);
            return;
          }
          
          console.log('Raw geladinhos from DB:', geladinhos);
          
          // Get current products and recipes to ensure we have the latest data
          const currentProducts = get().products;
          const currentRecipes = get().recipes;
          
          const processedGeladinhos = geladinhos.map((geladinho) => {
            let processedRecipe = null;
            
            if (geladinho.recipe) {
              // Try to find the recipe in our current recipes list first
              processedRecipe = currentRecipes.find(r => r.id === geladinho.recipe.id);
              
              // If not found, process it from the raw data
              if (!processedRecipe) {
                const formattedRecipe = {
                  ...geladinho.recipe,
                  ingredients: geladinho.recipe.ingredients.map((ingredient: any) => {
                    // Find the product in our current products list (which has calculations)
                    const productWithCalculations = currentProducts.find(p => p.id === ingredient.product_id);
                    
                    return {
                      id: ingredient.id,
                      product_id: ingredient.product_id,
                      quantity: ingredient.quantity,
                      product: productWithCalculations || (ingredient.products ? processProductWithCalculations(ingredient.products) : undefined),
                    };
                  }),
                };
                processedRecipe = processRecipeWithCalculations(formattedRecipe);
              }
            }
            
            const formattedGeladinho = {
              ...geladinho,
              recipe: processedRecipe,
              stock: geladinho.stock || [],
            };
            
            const processed = processGeladinhoWithCalculations(formattedGeladinho);
            console.log(`Processed geladinho ${geladinho.name}:`, processed);
            return processed;
          });
          
          console.log('All processed geladinhos:', processedGeladinhos);
          
          set({ geladinhos: processedGeladinhos });
        } catch (error) {
          console.error('Error in fetchGeladinhos:', error);
        }
      },

      addGeladinho: async (geladinho) => {
        const { data, error } = await supabase
          .from('geladinhos')
          .insert([{
            name: geladinho.name,
            recipe_id: geladinho.recipe_id,
            category: geladinho.category,
            profit_margin: geladinho.profit_margin,
            status: geladinho.status,
            description: geladinho.description,
            prep_time: geladinho.prep_time,
            freezing_temp: geladinho.freezing_temp,
            notes: geladinho.notes,
            image_url: geladinho.image_url,
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error adding geladinho:', error);
          return;
        }
        
        await get().fetchGeladinhos();
      },

      updateGeladinho: async (id, updatedFields) => {
        const { error } = await supabase
          .from('geladinhos')
          .update(updatedFields)
          .eq('id', id);
        
        if (error) {
          console.error('Error updating geladinho:', error);
          return;
        }
        
        await get().fetchGeladinhos();
      },

      deleteGeladinho: async (id) => {
        const { error } = await supabase
          .from('geladinhos')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting geladinho:', error);
          return;
        }
        
        set((state) => ({
          geladinhos: state.geladinhos.filter((geladinho) => geladinho.id !== id),
        }));
      },

      getGeladinho: (id) => {
        return get().geladinhos.find((geladinho) => geladinho.id === id);
      },

      // Geladinho stock actions
      addGeladinhoStock: async (stock) => {
        // First, insert the geladinho stock entry
        const { error: stockError } = await supabase
          .from('geladinho_stock')
          .insert([stock]);
        
        if (stockError) {
          console.error('Error adding geladinho stock:', stockError);
          return;
        }

        // If this is a production entry (entrada), we need to deduct ingredients from product stock
        if (stock.movement_type === 'entrada') {
          try {
            // Get the geladinho details with its recipe
            const geladinho = get().geladinhos.find(g => g.id === stock.geladinho_id);
            
            if (!geladinho || !geladinho.recipe) {
              console.error('Geladinho or recipe not found for stock deduction');
              await get().fetchGeladinhos();
              return;
            }

            const recipe = geladinho.recipe;
            const quantityProduced = stock.quantity;
            const recipeYield = recipe.yield;

            // Calculate how many recipe batches were made
            const batchesProduced = quantityProduced / recipeYield;

            console.log(`Produzindo ${quantityProduced} unidades de ${geladinho.name}`);
            console.log(`Receita rende ${recipeYield} unidades, então foram feitos ${batchesProduced} lotes`);

            // For each ingredient in the recipe, calculate consumption and update product stock
            for (const ingredient of recipe.ingredients) {
              if (!ingredient.product) {
                console.warn(`Product not found for ingredient ${ingredient.product_id}`);
                continue;
              }

              // Calculate total quantity consumed of this ingredient
              const quantityConsumed = ingredient.quantity * batchesProduced;
              
              console.log(`Consumindo ${quantityConsumed}g de ${ingredient.product.name}`);

              // Get current product stock from database to ensure we have the latest value
              const { data: currentProduct, error: fetchError } = await supabase
                .from('products')
                .select('total_stock')
                .eq('id', ingredient.product_id)
                .single();

              if (fetchError) {
                console.error(`Error fetching current stock for product ${ingredient.product_id}:`, fetchError);
                continue;
              }

              const currentStock = currentProduct.total_stock || 0;
              const newStock = currentStock - quantityConsumed;

              console.log(`Estoque atual de ${ingredient.product.name}: ${currentStock}g`);
              console.log(`Novo estoque: ${newStock}g`);

              // Check if there's enough stock
              if (newStock < 0) {
                console.warn(`Insufficient stock for ${ingredient.product.name}. Current: ${currentStock}g, Required: ${quantityConsumed}g`);
                // You might want to throw an error here or handle this case differently
                // For now, we'll continue but log the warning
              }

              // Update the product's total_stock
              const { error: updateError } = await supabase
                .from('products')
                .update({ total_stock: Math.max(0, newStock) }) // Ensure stock doesn't go negative
                .eq('id', ingredient.product_id);

              if (updateError) {
                console.error(`Error updating stock for product ${ingredient.product_id}:`, updateError);
                continue;
              }

              // Also create a stock entry record for tracking
              const { error: entryError } = await supabase
                .from('product_stock_entries')
                .insert([{
                  product_id: ingredient.product_id,
                  quantity: -quantityConsumed, // Negative quantity for consumption
                  total_cost: 0, // No cost for consumption entries
                  entry_date: stock.batch_date,
                  supplier: `Produção: ${geladinho.name} (${quantityProduced} unidades)`,
                }]);

              if (entryError) {
                console.error(`Error creating stock entry for product ${ingredient.product_id}:`, entryError);
              }
            }

            // Refresh products data to reflect the updated stock levels
            await get().fetchProducts();
            
          } catch (error) {
            console.error('Error processing ingredient stock deduction:', error);
          }
        }
        
        await get().fetchGeladinhos();
      },

      fetchGeladinhoStock: async (geladinhoId) => {
        const { data, error } = await supabase
          .from('geladinho_stock')
          .select('*')
          .eq('geladinho_id', geladinhoId)
          .order('batch_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching geladinho stock:', error);
          return;
        }
        
        set((state) => ({
          geladinhos: state.geladinhos.map(geladinho =>
            geladinho.id === geladinhoId
              ? { ...geladinho, stock: data }
              : geladinho
          ),
        }));
      },

      // Sales actions
      fetchSales: async () => {
        const { data, error } = await supabase
          .from('sales')
          .select('*, geladinho:geladinhos(*)')
          .order('sale_date', { ascending: false });

        if (error) {
          console.error('Error fetching sales:', error);
          return;
        }

        // Get current geladinhos to ensure we have the latest data with calculations
        const currentGeladinhos = get().geladinhos;

        const processed = data.map((sale: any) => {
          // Find the geladinho in our current list (which has calculations)
          const geladinhoWithCalculations = currentGeladinhos.find(g => g.id === sale.geladinho_id);
          
          return processSaleWithProfitCalculations(
            sale,
            geladinhoWithCalculations
          );
        });

        set({ sales: processed });
      },

      addSale: async (sale) => {
        const { error } = await supabase.from('sales').insert([sale]);

        if (error) {
          console.error('Error adding sale:', error);
          return;
        }

        await get().fetchSales();
        await get().fetchMonthlySales();
        await get().fetchDailySales();
        // Refresh geladinhos to update stock levels after sale
        await get().fetchGeladinhos();
      },

      updateSale: async (id, updatedFields) => {
        const { error } = await supabase
          .from('sales')
          .update(updatedFields)
          .eq('id', id);

        if (error) {
          console.error('Error updating sale:', error);
          return;
        }

        await get().fetchSales();
        await get().fetchMonthlySales();
        await get().fetchDailySales();
        // Refresh geladinhos to update stock levels after sale update
        await get().fetchGeladinhos();
      },

      deleteSale: async (id) => {
        const { error } = await supabase.from('sales').delete().eq('id', id);

        if (error) {
          console.error('Error deleting sale:', error);
          return;
        }

        set((state) => ({
          sales: state.sales.filter((sale) => sale.id !== id),
        }));
        await get().fetchMonthlySales();
        await get().fetchDailySales();
        // Refresh geladinhos to update stock levels after sale deletion
        await get().fetchGeladinhos();
      },

      getSale: (id) => {
        return get().sales.find((sale) => sale.id === id);
      },

      fetchMonthlySales: async () => {
        const { data, error } = await supabase
          .from('monthly_sales')
          .select('*')
          .order('month');

        if (error) {
          console.error('Error fetching monthly sales:', error);
          return;
        }

        set({ monthlySales: data });
      },

      fetchDailySales: async () => {
        // Calculate daily sales from the sales data
        const sales = get().sales;
        
        const dailySalesMap = new Map<string, {
          total_sales: number;
          total_profit: number;
          total_quantity: number;
          margins: number[];
        }>();

        sales.forEach(sale => {
          const date = sale.sale_date;
          const existing = dailySalesMap.get(date) || {
            total_sales: 0,
            total_profit: 0,
            total_quantity: 0,
            margins: []
          };

          existing.total_sales += sale.net_total;
          existing.total_profit += sale.total_profit;
          existing.total_quantity += sale.quantity;
          existing.margins.push(sale.profit_margin);

          dailySalesMap.set(date, existing);
        });

        const dailySales: DailySales[] = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
          date,
          total_sales: data.total_sales,
          total_profit: data.total_profit,
          total_quantity: data.total_quantity,
          average_margin: data.margins.length > 0 
            ? data.margins.reduce((sum, margin) => sum + margin, 0) / data.margins.length 
            : 0,
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        set({ dailySales });
      },
    }),
    {
      name: 'geladinho-store',
    }
  )
);

// Initialize store with proper loading sequence
const initializeStore = async () => {
  console.log('Initializing store...');
  
  // Load products first (they are the foundation)
  await useStore.getState().fetchProducts();
  console.log('Products loaded');
  
  // Then load recipes (they depend on products)
  await useStore.getState().fetchRecipes();
  console.log('Recipes loaded');
  
  // Then load geladinhos (they depend on recipes)
  await useStore.getState().fetchGeladinhos();
  console.log('Geladinhos loaded');
  
  // Finally load sales and monthly sales
  await useStore.getState().fetchSales();
  await useStore.getState().fetchMonthlySales();
  await useStore.getState().fetchDailySales();
  console.log('Sales loaded');
  
  console.log('Store initialization complete');
};

// Initialize the store
initializeStore();