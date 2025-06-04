import React from 'react';
import { 
  Package, 
  Clipboard, 
  IceCream2, 
  TrendingUp,
  DollarSign,
  BadgeDollarSign
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { 
  ProductWithCalculations, 
  RecipeWithCalculations, 
  GeladinhoWithCalculations 
} from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface DashboardCardsProps {
  products: ProductWithCalculations[];
  recipes: RecipeWithCalculations[];
  geladinhos: GeladinhoWithCalculations[];
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  products,
  recipes,
  geladinhos,
}) => {
  // Calculate total products
  const totalProducts = products.length;
  
  // Calculate total recipes
  const totalRecipes = recipes.length;
  
  // Calculate total active geladinhos
  const activeGeladinhos = geladinhos.filter(g => g.status === 'Ativo').length;
  
  // Calculate average profit margin
  const avgProfitMargin = geladinhos.length > 0
    ? geladinhos.reduce((sum, g) => sum + (g.profitMargin || 0), 0) / geladinhos.length
    : 0;
  
  // Find most profitable geladinho
  const mostProfitable = geladinhos.length > 0
    ? geladinhos.reduce((prev, current) => 
        ((prev.unitProfit || 0) > (current.unitProfit || 0)) ? prev : current
      )
    : null;
  
  // Calculate average cost per unit
  const avgCost = geladinhos.length > 0
    ? geladinhos.reduce((sum, g) => sum + (g.unitCost || 0), 0) / geladinhos.length
    : 0;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-gradient-to-br from-primary-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Produtos</p>
              <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <Package size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {totalProducts > 0 
              ? `${totalProducts} ingredientes cadastrados no sistema` 
              : 'Nenhum produto cadastrado ainda'}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Receitas</p>
              <p className="text-3xl font-bold text-gray-900">{totalRecipes}</p>
            </div>
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-600">
              <Clipboard size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {totalRecipes > 0 
              ? `${totalRecipes} receitas cadastradas no sistema` 
              : 'Nenhuma receita cadastrada ainda'}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Geladinhos Ativos</p>
              <p className="text-3xl font-bold text-gray-900">{activeGeladinhos}</p>
            </div>
            <div className="p-3 rounded-full bg-accent-100 text-accent-600">
              <IceCream2 size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {activeGeladinhos > 0 
              ? `${activeGeladinhos} geladinhos ativos para venda` 
              : 'Nenhum geladinho ativo ainda'}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-success-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Margem Média</p>
              <p className="text-3xl font-bold text-gray-900">{avgProfitMargin.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {geladinhos.length > 0 
              ? `Média de lucro em todos os geladinhos` 
              : 'Nenhum geladinho cadastrado ainda'}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-warning-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Custo Médio</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(avgCost)}</p>
            </div>
            <div className="p-3 rounded-full bg-warning-100 text-warning-600">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {geladinhos.length > 0 
              ? `Custo médio por unidade de geladinho` 
              : 'Nenhum geladinho cadastrado ainda'}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Mais Lucrativo</p>
              <p className="text-3xl font-bold text-gray-900">
                {mostProfitable ? formatCurrency(mostProfitable.unitProfit || 0) : '-'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <BadgeDollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {mostProfitable 
              ? `${mostProfitable.name} (${(mostProfitable.realMargin || 0).toFixed(1)}% de margem)` 
              : 'Nenhum geladinho cadastrado ainda'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};