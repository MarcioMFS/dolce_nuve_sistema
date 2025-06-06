import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, Package, IceCream2, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { ProductWithCalculations, GeladinhoWithCalculations } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/calculations';

interface StockHistoryProps {
  products: ProductWithCalculations[];
  geladinhos: GeladinhoWithCalculations[];
}

export const StockHistory: React.FC<StockHistoryProps> = ({
  products,
  geladinhos,
}) => {
  const [filter, setFilter] = useState<'all' | 'products' | 'geladinhos'>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Combine all stock movements
  const allMovements = [
    // Product stock entries
    ...products.flatMap(product => 
      (product.stock_entries || []).map(entry => ({
        id: entry.id,
        type: 'product' as const,
        item_name: product.name,
        item_id: product.id,
        date: entry.entry_date,
        quantity: entry.quantity,
        movement_type: entry.quantity > 0 ? 'entrada' : 'saida',
        cost: entry.total_cost,
        supplier: entry.supplier,
        unit: 'g',
      }))
    ),
    // Geladinho stock movements
    ...geladinhos.flatMap(geladinho =>
      (geladinho.stock || []).map(stock => ({
        id: stock.id,
        type: 'geladinho' as const,
        item_name: geladinho.name,
        item_id: geladinho.id,
        date: stock.batch_date,
        quantity: stock.quantity,
        movement_type: stock.movement_type,
        cost: stock.quantity * geladinho.unit_cost,
        supplier: null,
        unit: 'un',
      }))
    ),
  ];

  // Sort by date (most recent first)
  const sortedMovements = allMovements.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Apply filters
  const filteredMovements = sortedMovements.filter(movement => {
    const matchesType = filter === 'all' || 
      (filter === 'products' && movement.type === 'product') ||
      (filter === 'geladinhos' && movement.type === 'geladinho');
    
    const matchesDate = !dateFilter || 
      movement.date.startsWith(dateFilter);
    
    return matchesType && matchesDate;
  });

  const filterOptions = [
    { value: 'all', label: 'Todos os Itens' },
    { value: 'products', label: 'Apenas Produtos' },
    { value: 'geladinhos', label: 'Apenas Geladinhos' },
  ];

  const getMovementIcon = (type: string, movementType: string) => {
    if (type === 'product') {
      return <Package className="h-4 w-4" />;
    } else {
      return <IceCream2 className="h-4 w-4" />;
    }
  };

  const getMovementBadge = (movementType: string, quantity: number, unit: string) => {
    const isPositive = movementType === 'entrada';
    return (
      <Badge variant={isPositive ? 'success' : 'error'}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {isPositive ? '+' : '-'}{Math.abs(quantity)} {unit}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                options={filterOptions}
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                leftIcon={<Filter size={16} />}
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filtrar por data"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Histórico de Movimentações
            <Badge variant="secondary" className="ml-2">
              {filteredMovements.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhuma movimentação encontrada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros ou registre novas movimentações.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Movimentação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMovements.map((movement) => (
                    <tr key={`${movement.type}-${movement.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(movement.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getMovementIcon(movement.type, movement.movement_type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {movement.item_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {movement.type === 'product' ? 'Produto' : 'Geladinho'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMovementBadge(movement.movement_type, movement.quantity, movement.unit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(movement.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.supplier || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};