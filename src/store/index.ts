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

interface StoreState {
  products: ProductWithCalculations[];
  recipes: RecipeWithCalculations[];
  geladinhos: GeladinhoWithCalculations[];

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => ProductWithCalculations | undefined;

  // Recipe actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  getRecipe: (id: string) => RecipeWithCalculations | undefined;
  
  // Ingredient actions
  addIngredientToRecipe: (recipeId: string, ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (recipeId: string, ingredientId: string, ingredient: Partial<Ingredient>) => void;
  removeIngredientFromRecipe: (recipeId: string, ingredientId: string) => void;

  // Geladinho actions
  addGeladinho: (geladinho: Omit<Geladinho, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGeladinho: (id: string, geladinho: Partial<Geladinho>) => void;
  deleteGeladinho: (id: string) => void;
  getGeladinho: (id: string) => GeladinhoWithCalculations | undefined;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      recipes: [],
      geladinhos: [],

      // Product actions
      addProduct: (product) => {
        const now = new Date().toISOString();
        const newProduct = {
          id: uuidv4(),
          ...product,
          createdAt: now,
          updatedAt: now,
        };
        
        const processedProduct = processProductWithCalculations(newProduct);
        
        set((state) => ({
          products: [...state.products, processedProduct],
        }));
      },

      updateProduct: (id, updatedFields) => {
        set((state) => {
          const updatedProducts = state.products.map((product) => {
            if (product.id === id) {
              const updatedProduct = {
                ...product,
                ...updatedFields,
                updatedAt: new Date().toISOString(),
              };
              return processProductWithCalculations(updatedProduct);
            }
            return product;
          });

          // Update ingredients that use this product
          const updatedRecipes = state.recipes.map((recipe) => {
            const hasProductIngredient = recipe.ingredients.some(
              (ingredient) => ingredient.productId === id
            );

            if (hasProductIngredient) {
              const updatedIngredients = recipe.ingredients.map((ingredient) => {
                if (ingredient.productId === id) {
                  return {
                    ...ingredient,
                    product: updatedProducts.find((p) => p.id === id),
                  };
                }
                return ingredient;
              });

              const updatedRecipe = {
                ...recipe,
                ingredients: updatedIngredients,
                updatedAt: new Date().toISOString(),
              };

              return processRecipeWithCalculations(updatedRecipe);
            }

            return recipe;
          });

          // Update geladinhos that use the affected recipes
          const updatedGeladinhos = state.geladinhos.map((geladinho) => {
            const recipe = updatedRecipes.find((r) => r.id === geladinho.recipeId);
            if (recipe) {
              const updatedGeladinho = {
                ...geladinho,
                recipe,
                updatedAt: new Date().toISOString(),
              };
              return processGeladinhoWithCalculations(updatedGeladinho);
            }
            return geladinho;
          });

          return {
            products: updatedProducts,
            recipes: updatedRecipes,
            geladinhos: updatedGeladinhos,
          };
        });
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },

      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },

      // Recipe actions
      addRecipe: (recipe) => {
        const now = new Date().toISOString();
        
        // Get full product details for each ingredient
        const ingredientsWithProducts = recipe.ingredients.map((ingredient) => {
          const product = get().products.find((p) => p.id === ingredient.productId);
          return {
            ...ingredient,
            id: uuidv4(),
            product,
          };
        });
        
        const newRecipe = {
          id: uuidv4(),
          ...recipe,
          ingredients: ingredientsWithProducts,
          createdAt: now,
          updatedAt: now,
        };
        
        const processedRecipe = processRecipeWithCalculations(newRecipe);
        
        set((state) => ({
          recipes: [...state.recipes, processedRecipe],
        }));
      },

      updateRecipe: (id, updatedFields) => {
        set((state) => {
          const updatedRecipes = state.recipes.map((recipe) => {
            if (recipe.id === id) {
              const updatedRecipe = {
                ...recipe,
                ...updatedFields,
                updatedAt: new Date().toISOString(),
              };
              return processRecipeWithCalculations(updatedRecipe);
            }
            return recipe;
          });

          // Update geladinhos that use this recipe
          const updatedGeladinhos = state.geladinhos.map((geladinho) => {
            if (geladinho.recipeId === id) {
              const recipe = updatedRecipes.find((r) => r.id === id);
              const updatedGeladinho = {
                ...geladinho,
                recipe,
                updatedAt: new Date().toISOString(),
              };
              return processGeladinhoWithCalculations(updatedGeladinho);
            }
            return geladinho;
          });

          return {
            recipes: updatedRecipes,
            geladinhos: updatedGeladinhos,
          };
        });
      },

      deleteRecipe: (id) => {
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
          // Also remove any geladinhos that use this recipe
          geladinhos: state.geladinhos.filter((geladinho) => geladinho.recipeId !== id),
        }));
      },

      getRecipe: (id) => {
        return get().recipes.find((recipe) => recipe.id === id);
      },
      
      // Ingredient actions
      addIngredientToRecipe: (recipeId, ingredient) => {
        set((state) => {
          const product = state.products.find((p) => p.id === ingredient.productId);
          
          const updatedRecipes = state.recipes.map((recipe) => {
            if (recipe.id === recipeId) {
              const newIngredient = {
                ...ingredient,
                id: uuidv4(),
                product,
              };
              
              const updatedRecipe = {
                ...recipe,
                ingredients: [...recipe.ingredients, newIngredient],
                updatedAt: new Date().toISOString(),
              };
              
              return processRecipeWithCalculations(updatedRecipe);
            }
            return recipe;
          });
          
          // Update geladinhos that use this recipe
          const updatedGeladinhos = state.geladinhos.map((geladinho) => {
            if (geladinho.recipeId === recipeId) {
              const recipe = updatedRecipes.find((r) => r.id === recipeId);
              const updatedGeladinho = {
                ...geladinho,
                recipe,
                updatedAt: new Date().toISOString(),
              };
              return processGeladinhoWithCalculations(updatedGeladinho);
            }
            return geladinho;
          });
          
          return {
            recipes: updatedRecipes,
            geladinhos: updatedGeladinhos,
          };
        });
      },
      
      updateIngredient: (recipeId, ingredientId, updatedFields) => {
        set((state) => {
          const updatedRecipes = state.recipes.map((recipe) => {
            if (recipe.id === recipeId) {
              const updatedIngredients = recipe.ingredients.map((ingredient) => {
                if (ingredient.id === ingredientId) {
                  // If productId changed, get the new product
                  const productId = updatedFields.productId || ingredient.productId;
                  const product = state.products.find((p) => p.id === productId);
                  
                  return {
                    ...ingredient,
                    ...updatedFields,
                    product,
                  };
                }
                return ingredient;
              });
              
              const updatedRecipe = {
                ...recipe,
                ingredients: updatedIngredients,
                updatedAt: new Date().toISOString(),
              };
              
              return processRecipeWithCalculations(updatedRecipe);
            }
            return recipe;
          });
          
          // Update geladinhos that use this recipe
          const updatedGeladinhos = state.geladinhos.map((geladinho) => {
            if (geladinho.recipeId === recipeId) {
              const recipe = updatedRecipes.find((r) => r.id === recipeId);
              const updatedGeladinho = {
                ...geladinho,
                recipe,
                updatedAt: new Date().toISOString(),
              };
              return processGeladinhoWithCalculations(updatedGeladinho);
            }
            return geladinho;
          });
          
          return {
            recipes: updatedRecipes,
            geladinhos: updatedGeladinhos,
          };
        });
      },
      
      removeIngredientFromRecipe: (recipeId, ingredientId) => {
        set((state) => {
          const updatedRecipes = state.recipes.map((recipe) => {
            if (recipe.id === recipeId) {
              const updatedRecipe = {
                ...recipe,
                ingredients: recipe.ingredients.filter((i) => i.id !== ingredientId),
                updatedAt: new Date().toISOString(),
              };
              
              return processRecipeWithCalculations(updatedRecipe);
            }
            return recipe;
          });
          
          // Update geladinhos that use this recipe
          const updatedGeladinhos = state.geladinhos.map((geladinho) => {
            if (geladinho.recipeId === recipeId) {
              const recipe = updatedRecipes.find((r) => r.id === recipeId);
              const updatedGeladinho = {
                ...geladinho,
                recipe,
                updatedAt: new Date().toISOString(),
              };
              return processGeladinhoWithCalculations(updatedGeladinho);
            }
            return geladinho;
          });
          
          return {
            recipes: updatedRecipes,
            geladinhos: updatedGeladinhos,
          };
        });
      },

      // Geladinho actions
      addGeladinho: (geladinho) => {
        const now = new Date().toISOString();
        const recipe = get().recipes.find((r) => r.id === geladinho.recipeId);
        
        const newGeladinho = {
          id: uuidv4(),
          ...geladinho,
          recipe,
          createdAt: now,
          updatedAt: now,
        };
        
        const processedGeladinho = processGeladinhoWithCalculations(newGeladinho);
        
        set((state) => ({
          geladinhos: [...state.geladinhos, processedGeladinho],
        }));
      },

      updateGeladinho: (id, updatedFields) => {
        set((state) => {
          let recipeToUse;
          
          // If recipeId is updated, get the new recipe
          if (updatedFields.recipeId) {
            recipeToUse = state.recipes.find((r) => r.id === updatedFields.recipeId);
          }
          
          const updatedGeladinhos = state.geladinhos.map((geladinho) => {
            if (geladinho.id === id) {
              const updatedGeladinho = {
                ...geladinho,
                ...updatedFields,
                // Only update recipe if recipeId changed
                recipe: recipeToUse || geladinho.recipe,
                updatedAt: new Date().toISOString(),
              };
              return processGeladinhoWithCalculations(updatedGeladinho);
            }
            return geladinho;
          });
          
          return {
            geladinhos: updatedGeladinhos,
          };
        });
      },

      deleteGeladinho: (id) => {
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