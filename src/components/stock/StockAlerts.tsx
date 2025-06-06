import React from 'react';
import { AlertTriangle, Package, IceCream2, TrendingDown, ShoppingCart } from 'lucide-react';
import { ProductWithCalculations, GeladinhoWithCalculations } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/calculations';

interface StockAlertsProps {
  products: ProductWithCalculations[];
  geladinhos: GeladinhoWithCalculations[];
}

export const StockAlerts: React.FC<StockAlertsProps> = ({
  products,
  geladinhos,
}) => {
  // Define thresholds
  const productLowThreshold = 100; // grams
  const productCriticalThreshold = 10; // grams
  const geladinhoLowThreshold = 20; // units
  const gelادinhoCriticalThreshold = 5; // units

  // Filter products by alert level
  const criticalProducts = products.filter(p => (p.total_stock || 0) <= productCriticalThreshold);
  const lowProducts = products.filter(p => {
    const stock = p.total_stock || 0;
    return stock > productCriticalThreshold && stock <= productLowThreshold;
  });

  // Filter geladinhos by alert level
  const criticalGeladinhos = geladinhos.filter(g => g.available_quantity <= gelادinhoCriticalThreshold);
  const lowGeladinhos = geladinhos.filter(g => {
    return g.available_quantity > gelادinhoCriticalThreshold && g.available_quantity <= geladinhoLowThreshold;
  });

  const AlertCard: React.FC<{
    title: string;
    items: (ProductWithCalculations | GeladinhoWithCalculations)[];
    type: 'product' | 'geladinho';
    severity: 'critical' | 'low';
  }> = ({ title, items, type, severity }) => {
    const Icon = type === 'product' ? Package : IceCream2;
    const bgColor = severity === 'critical' ? 'from-red-50 to-white' : 'from-yellow-50 to-white';
    const iconColor = severity === 'critical' ? 'text-red-600' : 'text-yellow-600';
    const badgeVariant = severity === 'critical' ? 'error' : 'warning';

    return (
      <Card className={`bg-gradient-to-br ${bgColor} border-l-4 ${severity === 'critical' ? 'border-red-500' : 'border-yellow-500'}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon className={`h-5 w-5 mr-2 ${iconColor}`} />
            {title}
            <Badge variant={badgeVariant} className="ml-2">
              {items.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum item nesta categoria.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {type === 'product' 
                          ? `${formatCurrency((item as ProductWithCalculations).unit_price)}/g`
                          : `${(item as GeladinhoWithCalculations).category} • ${formatCurrency((item as GeladinhoWithCalculations).unit_cost)}/un`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {type === 'product'
                        ? `${(item as ProductWithCalculations).total_stock || 0}g`
                        : `${(item as GeladinhoWithCalculations).available_quantity} un`
                      }
                    </div>
                    <div className="text-xs text-gray-500">restante</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const totalAlerts = criticalProducts.length + lowProducts.length + criticalGeladinhos.length + lowGeladinhos.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Resumo de Alertas</h3>
              <p className="text-sm text-gray-600 mt-1">
                {totalAlerts === 0 
                  ? 'Todos os itens estão com estoque adequado'
                  : `${totalAlerts} ${totalAlerts === 1 ? 'item precisa' : 'itens precisam'} de atenção`
                }
              </p>
            </div>
            <div className="flex items-center">
              {totalAlerts > 0 ? (
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-green-600" />
              )}
            </div>
          </div>
          
          {totalAlerts > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<ShoppingCart size={16} />}
              >
                Gerar Lista de Compras
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Package size={16} />}
              >
                Exportar Relatório
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertCard
          title="Produtos - Estoque Crítico"
          items={criticalProducts}
          type="product"
          severity="critical"
        />
        
        <AlertCard
          title="Geladinhos - Estoque Crítico"
          items={criticalGeladinhos}
          type="geladinho"
          severity="critical"
        />
        
        <AlertCard
          title="Produtos - Estoque Baixo"
          items={lowProducts}
          type="product"
          severity="low"
        />
        
        <AlertCard
          title="Geladinhos - Estoque Baixo"
          items={lowGeladinhos}
          type="geladinho"
          severity="low"
        />
      </div>

      {/* Recommendations */}
      {totalAlerts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalProducts.length > 0 && (
                <div className="flex items-start p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-800">
                      Ação Urgente Necessária
                    </div>
                    <div className="text-sm text-red-700">
                      {criticalProducts.length} produto(s) com estoque crítico. Faça pedidos imediatamente para evitar interrupção da produção.
                    </div>
                  </div>
                </div>
              )}
              
              {criticalGeladinhos.length > 0 && (
                <div className="flex items-start p-3 bg-red-50 rounded-lg">
                  <IceCream2 className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-800">
                      Produção Urgente
                    </div>
                    <div className="text-sm text-red-700">
                      {criticalGeladinhos.length} geladinho(s) com estoque muito baixo. Programe produção imediata.
                    </div>
                  </div>
                </div>
              )}
              
              {(lowProducts.length > 0 || lowGeladinhos.length > 0) && (
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">
                      Planejamento Necessário
                    </div>
                    <div className="text-sm text-yellow-700">
                      {lowProducts.length + lowGeladinhos.length} item(s) com estoque baixo. Planeje reposição nos próximos dias.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};