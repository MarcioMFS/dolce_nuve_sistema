import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Sale, GeladinhoWithCalculations } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface TopSellingListProps {
  sales: Sale[];
  geladinhos: GeladinhoWithCalculations[];
}

interface GeladinhoSales {
  geladinho: GeladinhoWithCalculations;
  totalQuantity: number;
  totalRevenue: number;
}

export const TopSellingList: React.FC<TopSellingListProps> = ({
  sales,
  geladinhos,
}) => {
  // Calculate sales per geladinho
  const geladinhoSales = geladinhos.map(geladinho => {
    const geladinhoSales = sales.filter(sale => sale.geladinho_id === geladinho.id);
    const totalQuantity = geladinhoSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = geladinhoSales.reduce((sum, sale) => sum + sale.total_price, 0);
    
    return {
      geladinho,
      totalQuantity,
      totalRevenue,
    };
  });
  
  // Sort by quantity sold (descending) and get top 5
  const topSelling = geladinhoSales
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geladinhos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        {topSelling.length > 0 ? (
          <div className="space-y-4">
            {topSelling.map(({ geladinho, totalQuantity, totalRevenue }) => (
              <div 
                key={geladinho.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{geladinho.name}</h3>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {geladinho.category}
                      </Badge>
                      <span className="mx-2 text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {totalQuantity} unidades vendidas
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    receita total
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
            <p className="text-gray-500">Nenhuma venda registrada</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link 
          to="/vendas" 
          className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
        >
          Ver todas as vendas
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};