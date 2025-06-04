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
  Ingredient
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

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => ProductWithCalculations | undefined;
  fetchProducts: () => Promise<void>;

  // Recipe actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipe: (id: string) => RecipeWithCalculations | undefined;
  fetchRecipes: () => Promise<void>;
  
  // Ingredient actions
  addIngredientToRecipe: (recipeId: string, ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (recipeId: string, ingredientId: string, ingredient: Partial<Ingredient>) => Promise<void>;
  removeIngredientFromRecipe: (recipeId: string, ingredientId: string) => Promise<void>;

  // Geladinho actions
  addGeladinho: (geladinho: Omit<Geladinho, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGeladinho: (id: string, geladinho: Partial<Geladinho>) => Promise<void>;
  deleteGeladinho: (id: string) => Promise<void>;
  getGeladinho: (id: string) => GeladinhoWithCalculations | undefined;
  fetchGeladinhos: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      recipes: [],
      geladinhos: [],

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
        const { data, error } = await supabase
          .from('products')
          .insert([product])
          .select()
          .single();
        
        if (error) {
          console.error('Error adding product:', error);
          return;
        }
        
        const processedProduct = processProductWithCalculations(data);
        set((state) => ({
          products: [...state.products, processedProduct],
        }));
      },

      updateProduct: async (id, updatedFields) => {
        const { data, error } = await supabase
          .from('products')
          .update(updatedFields)
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
              productId: ingredient.product_id,
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
          product_id: ingredient.productId,
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
        const { data, error } = await supabase
          .from('recipes')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();
        
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
            product_id: ingredient.productId,
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
      addIngredientToRecipe: async (recipeId, ingredient) => {
        const { error } = await supabase
          .from('recipe_ingredients')
          .insert([{
            recipe_id: recipeId,
            product_id: ingredient.productId,
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
      
      updateIngredient: async (recipeId, ingredientId, updatedFields) => {
        const { error } = await supabase
          .from('recipe_ingredients')
          .update({
            product_id: updatedFields.productId,
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
      
      removeIngredientFromRecipe: async (recipeId, ingredientId) => {
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
                productId: ingredient.product_id,
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