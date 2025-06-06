import React, { useState } from 'react';
import { Search, Package, IceCream2, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { ProductWithCalculations, GeladinhoWithCalculations } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/calculations';

interface StockOverviewProps {
  products: ProductWithCalculations[];
  geladinhos: GeladinhoWithCalculations[];
}

export const StockOverview: React.FC<StockOverviewProps> = ({
  products,
  geladinhos,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  // Calculate stock levels
  const lowStockThreshold = 100; // grams for products, units for geladinhos
  const outOfStockThreshold = 10;

  const getProductStockStatus = (product: ProductWithCalculations) => {
    const stock = product.total_stock || 0;
    if (stock <= outOfStockThreshold) return 'out';
    if (stock <= lowStockThreshold) return 'low';
    return 'good';
  };

  const getGeladinhoStockStatus = (geladinho: GeladinhoWithCalculations) => {
    const stock = geladinho.available_quantity || 0;
    if (stock <= 5) return 'out';
    if (stock <= 20) return 'low';
    return 'good';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getProductStockStatus(product);
    
    if (filter === 'low') return matchesSearch && status === 'low';
    if (filter === 'out') return matchesSearch && status === 'out';
    return matchesSearch;
  });

  const filteredGeladinhos = geladinhos.filter(geladinho => {
    const matchesSearch = geladinho.name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getGeladinhoStockStatus(geladinho);
    
    if (filter === 'low') return matchesSearch && status === 'low';
    if (filter === 'out') return matchesSearch && status === 'out';
    return matchesSearch;
  });

  const getStockBadge = (status: string, value: number, unit: string) => {
    const variants = {
      good: 'success',
      low: 'warning',
      out: 'error',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {value} {unit}
      </Badge>
    );
  };

  // Summary stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => getProductStockStatus(p) === 'low').length;
  const outOfStockProducts = products.filter(p => getProductStockStatus(p) === 'out').length;

  const totalGeladinhos = geladinhos.length;
  const lowStockGeladinhos = geladinhos.filter(g => getGeladinhoStockStatus(g) === 'low').length;
  const outOfStockGeladinhos = geladinhos.filter(g => getGeladinhoStockStatus(g) === 'out').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Produtos</p>
                <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Geladinhos</p>
                <p className="text-3xl font-bold text-gray-900">{totalGeladinhos}</p>
              </div>
              <IceCream2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
                <p className="text-3xl font-bold text-gray-900">{lowStockProducts + lowStockGeladinhos}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sem Estoque</p>
                <p className="text-3xl font-bold text-gray-900">{outOfStockProducts + outOfStockGeladinhos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar produtos ou geladinhos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'low'
                ? 'bg-warning-100 text-warning-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Estoque Baixo
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'out'
                ? 'bg-error-100 text-error-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sem Estoque
          </button>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos (Ingredientes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor em Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const status = getProductStockStatus(product);
                  const stockValue = (product.total_stock || 0) * product.unit_price;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(product.unit_price)}/g
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.total_stock || 0}g
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(stockValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStockBadge(status, product.total_stock || 0, 'g')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Geladinhos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Geladinhos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Geladinho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor em Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGeladinhos.map((geladinho) => {
                  const status = getGeladinhoStockStatus(geladinho);
                  const stockValue = geladinho.available_quantity * geladinho.unit_cost;
                  
                  return (
                    <tr key={geladinho.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <IceCream2 className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {geladinho.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {geladinho.category} • {formatCurrency(geladinho.unit_cost)}/un
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {geladinho.available_quantity} unidades
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(stockValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStockBadge(status, geladinho.available_quantity, 'un')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};