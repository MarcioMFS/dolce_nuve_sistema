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
  MonthlySales
} from '../types';
import { 
  processProductWithCalculations, 
  processRecipeWithCalculations, 
  processGeladinhoWithCalculations 
} from '../utils/calculations';
import { supabase } from '../lib/supabase';

interface StoreState {
  products: ProductWithCalculations[];
  recipes: RecipeWithCalculations[];
  geladinhos: GeladinhoWithCalculations[];
  sales: Sale[];
  monthlySales: MonthlySales[];

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => ProductWithCalculations | undefined;
  fetchProducts: () => Promise<void>;

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

  // Sales actions
  addSale: (sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSale: (id: string, sale: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  getSale: (id: string) => Sale | undefined;
  fetchSales: () => Promise<void>;
  fetchMonthlySales: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      recipes: [],
      geladinhos: [],
      sales: [],
      monthlySales: [],

      // Product actions
      fetchProducts: async () => {
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        const processedProducts = products.map(processProductWithCalculations);
        set({ products: processedProducts });
      },

      addProduct: async (product) => {
        // Remove calculated fields before inserting
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: product.name,
            unit_of_measure: product.unit_of_measure,
            total_quantity: product.total_quantity,
            total_value: product.total_value,
            purchase_date: product.purchase_date,
            supplier: product.supplier
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error adding product:', error);
          return;
        }
        
        const finalProcessedProduct = processProductWithCalculations(data);
        set((state) => ({
          products: [...state.products, finalProcessedProduct],
        }));
      },

      updateProduct: async (id, updatedFields) => {
        // Remove calculated fields before updating
        const updateData = {
          ...updatedFields,
        };
        
        // Ensure calculated fields are not sent to the database
        delete (updateData as any).unit_price;
        delete (updateData as any).standard_price;

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
        
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? processProductWithCalculations(data) : product
          ),
        }));

        // Fetch updated recipes and geladinhos since they might be affected
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

        // Fetch updated recipes and geladinhos since they might be affected
        await get().fetchRecipes();
        await get().fetchGeladinhos();
      },

      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },

      // Recipe actions
      fetchRecipes: async () => {
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
        
        const processedRecipes = recipes.map((recipe) => {
          const formattedRecipe = {
            ...recipe,
            ingredients: recipe.ingredients.map((ingredient: any) => ({
              id: ingredient.id,
              product_id: ingredient.product_id,
              quantity: ingredient.quantity,
              product: ingredient.products ? processProductWithCalculations(ingredient.products) : undefined,
            })),
          };
          return processRecipeWithCalculations(formattedRecipe);
        });
        
        set({ recipes: processedRecipes });
      },

      addRecipe: async (recipe) => {
        // First create the recipe
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

        // Then add ingredients
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

        // Fetch all recipes to get the updated data
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

        // If ingredients were updated, handle that separately
        if (updatedFields.ingredients) {
          // Delete existing ingredients
          await supabase
            .from('recipe_ingredients')
            .delete()
            .eq('recipe_id', id);

          // Add new ingredients
          const ingredients = updatedFields.ingredients.map((ingredient) => ({
            recipe_id: id,
            product_id: ingredient.product_id,
            quantity: ingredient.quantity,
          }));

          await supabase
            .from('recipe_ingredients')
            .insert(ingredients);
        }

        // Fetch all recipes and geladinhos to get the updated data
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

        // Fetch updated geladinhos since they might be affected
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

        // Fetch all recipes and geladinhos to get the updated data
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

        // Fetch all recipes and geladinhos to get the updated data
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

        // Fetch all recipes and geladinhos to get the updated data
        await get().fetchRecipes();
        await get().fetchGeladinhos();
      },

      // Geladinho actions
      fetchGeladinhos: async () => {
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
            )
          `)
          .order('name');
        
        if (error) {
          console.error('Error fetching geladinhos:', error);
          return;
        }
        
        const processedGeladinhos = geladinhos.map((geladinho) => {
          const formattedGeladinho = {
            ...geladinho,
            recipe: geladinho.recipe ? {
              ...geladinho.recipe,
              ingredients: geladinho.recipe.ingredients.map((ingredient: any) => ({
                id: ingredient.id,
                product_id: ingredient.product_id,
                quantity: ingredient.quantity,
                product: ingredient.products ? processProductWithCalculations(ingredient.products) : undefined,
              })),
            } : undefined,
          };
          return processGeladinhoWithCalculations(formattedGeladinho);
        });
        
        set({ geladinhos: processedGeladinhos });
      },

      addGeladinho: async (geladinho) => {
        const { data, error } = await supabase
          .from('geladinhos')
          .insert([geladinho])
          .select()
          .single();
        
        if (error) {
          console.error('Error adding geladinho:', error);
          return;
        }
        
        // Fetch all geladinhos to get the updated data with recipes
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
        
        // Fetch all geladinhos to get the updated data with recipes
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

      // Sales actions
      fetchSales: async () => {
        const { data, error } = await supabase
          .from('sales')
          .select('*, geladinho:geladinho_id(*)')
          .order('sale_date', { ascending: false });

        if (error) {
          console.error('Error fetching sales:', error);
          return;
        }

        const processed = data.map((sale: any) => ({
          ...sale,
          geladinho: sale.geladinho
            ? processGeladinhoWithCalculations(sale.geladinho)
            : undefined,
        }));

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
    }),
    {
      name: 'geladinho-store',
    }
  )
);

// Fetch initial data
useStore.getState().fetchProducts();
useStore.getState().fetchRecipes();
useStore.getState().fetchGeladinhos();
useStore.getState().fetchSales();
useStore.getState().fetchMonthlySales();
