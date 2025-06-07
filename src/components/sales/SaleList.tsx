import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SaleWithProfitCalculations } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Plus, Search, ShoppingCart, Trash2, TrendingUp, DollarSign, Target } from 'lucide-react';

interface SaleListProps {
  sales: SaleWithProfitCalculations[];
  onDelete?: (id: string) => void;
}

export const SaleList: React.FC<SaleListProps> = ({ sales, onDelete }) => {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = sales.filter((s) =>
    s.geladinho?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    
    const confirmed = window.confirm('Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate summary statistics
  const totalSales = filtered.reduce((sum, sale) => sum + sale.net_total, 0);
  const totalProfit = filtered.reduce((sum, sale) => sum + sale.total_profit, 0);
  const averageMargin = filtered.length > 0 
    ? filtered.reduce((sum, sale) => sum + sale.profit_margin, 0) / filtered.length 
    : 0;

  const getProfitMarginBadge = (margin: number) => {
    if (margin >= 50) return <Badge variant="success">Excelente ({margin.toFixed(1)}%)</Badge>;
    if (margin >= 30) return <Badge variant="primary">Bom ({margin.toFixed(1)}%)</Badge>;
    if (margin >= 15) return <Badge variant="warning">Regular ({margin.toFixed(1)}%)</Badge>;
    return <Badge variant="error">Baixo ({margin.toFixed(1)}%)</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Vendas</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalSales)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {filtered.length} {filtered.length === 1 ? 'venda' : 'vendas'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Lucro</p>
                <p className="text-2xl font-bold text-success-600">{formatCurrency(totalProfit)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Lucro obtido nas vendas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Margem Média</p>
                <p className="text-2xl font-bold text-secondary-600">{averageMargin.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Margem de lucro média
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Buscar venda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <Link to="/vendas/nova">
          <Button leftIcon={<Plus size={18} />}>Nova Venda</Button>
        </Link>
      </div>

      {/* Sales Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma venda registrada</h3>
          <p className="mt-1 text-sm text-gray-500">Adicione suas vendas para acompanhar o desempenho.</p>
          <div className="mt-6">
            <Link to="/vendas/nova">
              <Button leftIcon={<Plus size={18} />}>Nova Venda</Button>
            </Link>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Unit.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bruto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Líquido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sale.geladinho?.name || 'Produto'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sale.geladinho?.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(sale.unit_price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(sale.unit_cost)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(sale.total_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.discount > 0 ? formatCurrency(sale.discount) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                        {formatCurrency(sale.net_total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600">
                        {formatCurrency(sale.total_profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getProfitMarginBadge(sale.profit_margin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(sale.id)}
                            leftIcon={<Trash2 size={16} />}
                            className="text-error-600 hover:text-error-800 hover:bg-error-50"
                            isLoading={deletingId === sale.id}
                            disabled={deletingId === sale.id}
                          >
                            Excluir
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};