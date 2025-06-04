import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Plus, Search, Clipboard, Layers } from 'lucide-react';

import { RecipeWithCalculations } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface RecipeListProps {
  recipes: RecipeWithCalculations[];
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = recipes.filter((recipe) => {
    return recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Buscar receita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <Link to="/receitas/nova">
          <Button leftIcon={<Plus size={18} />}>Nova Receita</Button>
        </Link>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <Clipboard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma receita encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Tente ajustar sua busca'
              : 'Comece adicionando uma nova receita ao sistema.'}
          </p>
          <div className="mt-6">
            <Link to="/receitas/nova">
              <Button leftIcon={<Plus size={18} />}>Nova Receita</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/receitas/editar/${recipe.id}`}
              className="block"
            >
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {recipe.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      Rendimento: {recipe.yield} unidades
                    </Badge>
                    <div className="text-sm text-gray-500">
                      {recipe.ingredients.length} ingredientes
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-700">Custo Total</div>
                    <div className="font-medium">{formatCurrency(recipe.total_cost)}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-700">Custo por Unidade</div>
                    <div className="font-bold text-primary-600">{formatCurrency(recipe.unit_cost)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 mb-1">Ingredientes Principais:</div>
                    {recipe.ingredients.slice(0, 3).map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center text-sm">
                        <Layers size={14} className="text-gray-400 mr-1" />
                        <span className="truncate">
                          {ingredient.product?.name}: {ingredient.quantity}g
                        </span>
                      </div>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <div className="text-xs text-gray-500 italic">
                        +{recipe.ingredients.length - 3} mais ingredientes
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 flex justify-end">
                  <span className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800">
                    <Edit size={16} className="mr-1" />
                    Editar receita
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};