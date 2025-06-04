import React from 'react';
import { useStore } from '../store';
import { RecipeList } from '../components/recipes/RecipeList';

export const RecipesPage: React.FC = () => {
  const { recipes } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
      </div>
      
      <RecipeList recipes={recipes} />
    </div>
  );
};