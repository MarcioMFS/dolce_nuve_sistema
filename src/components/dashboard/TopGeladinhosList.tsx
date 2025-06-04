import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, IceCream2 } from 'lucide-react';
import { GeladinhoWithCalculations } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface TopGeladinhosListProps {
  geladinhos: GeladinhoWithCalculations[];
}

export const TopGeladinhosList: React.FC<TopGeladinhosListProps> = ({
  geladinhos,
}) => {
  // Get active geladinhos only
  const activeGeladinhos = geladinhos.filter(g => g.status === 'Ativo');
  
  // Sort by profit (descending)
  const sortedGeladinhos = [...activeGeladinhos].sort((a, b) => b.unitProfit - a.unitProfit);
  
  // Take top 5
  const topGeladinhos = sortedGeladinhos.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geladinhos Mais Lucrativos</CardTitle>
      </CardHeader>
      <CardContent>
        {topGeladinhos.length > 0 ? (
          <div className="space-y-4">
            {topGeladinhos.map((geladinho) => (
              <div 
                key={geladinho.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                    <IceCream2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{geladinho.name}</h3>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {geladinho.category}
                      </Badge>
                      <span className="mx-2 text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        Custo: {formatCurrency(geladinho.unitCost)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">
                    {formatCurrency(geladinho.unitProfit)}
                  </div>
                  <div className="text-xs text-gray-500">
                    lucro por unidade
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
            <p className="text-gray-500">Nenhum geladinho ativo cadastrado</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link 
          to="/geladinhos" 
          className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
        >
          Ver todos os geladinhos
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};