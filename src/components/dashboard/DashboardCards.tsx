import React from 'react';
import { 
  Package, 
  Clipboard, 
  IceCream2, 
  TrendingUp,
  DollarSign,
  BadgeDollarSign,
  Calendar,
  Target
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { 
  ProductWithCalculations, 
  RecipeWithCalculations, 
  GeladinhoWithCalculations,
  SaleWithProfitCalculations,
  DailySales
} from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface DashboardCardsProps {
  products: ProductWithCalculations[];
  recipes: RecipeWithCalculations[];
  geladinhos: GeladinhoWithCalculations[];
  sales: SaleWithProfitCalculations[];
  dailySales: DailySales[];
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  products,
  recipes,
  geladinhos,
  sales,
  dailySales,
}) => {
  // Calculate total products
  const totalProducts = products.length;
  
  // Calculate total recipes
  const totalRecipes = recipes.length;
  
  // Calculate total active geladinhos
  const activeGeladinhos = geladinhos.filter(g => g.status === 'Ativo').length;
  
  // Calculate average profit margin
  const avgProfitMargin = geladinhos.length > 0
    ? geladinhos.reduce((sum, g) => sum + (g.profit_margin || 0), 0) / geladinhos.length
    : 0;
  
  // Find most profitable geladinho
  const mostProfitable = geladinhos.length > 0
    ? geladinhos.reduce((prev, current) =>
        ((prev.unit_profit || 0) > (current.unit_profit || 0)) ? prev : current
      )
    : null;
  
  // Calculate average cost per unit
  const avgCost = geladinhos.length > 0
    ? geladinhos.reduce((sum, g) => sum + (g.unit_cost || 0), 0) / geladinhos.length
    : 0;

  // Today's sales and profit
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = dailySales.find(d => d.date === today);
  const todayRevenue = todaySales?.total_sales || 0;
  const todayProfit = todaySales?.total_profit || 0;

  // This month's sales and profit
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthSales = dailySales.filter(d => d.date.startsWith(currentMonth));
  const monthRevenue = thisMonthSales.reduce((sum, d) => sum + d.total_sales, 0);
  const monthProfit = thisMonthSales.reduce((sum, d) => sum + d.total_profit, 0);
  const monthAvgMargin = thisMonthSales.length > 0
    ? thisMonthSales.reduce((sum, d) => sum + d.average_margin, 0) / thisMonthSales.length
    : 0;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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

      <Card className="bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Vendas de Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Calendar size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {todayRevenue > 0 
              ? `Receita do dia ${new Date().toLocaleDateString('pt-BR')}` 
              : 'Nenhuma venda hoje ainda'}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Lucro de Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(todayProfit)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <BadgeDollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {todayProfit > 0 
              ? `Lucro obtido hoje` 
              : 'Nenhum lucro registrado hoje'}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Lucro do Mês</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(monthProfit)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Target size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {monthProfit > 0 
              ? `Margem média: ${monthAvgMargin.toFixed(1)}%` 
              : 'Nenhum lucro este mês ainda'}
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
    </div>
  );
};