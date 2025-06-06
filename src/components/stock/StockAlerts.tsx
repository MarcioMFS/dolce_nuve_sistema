import React from 'react';
import { AlertTriangle, Package, IceCream2, TrendingDown, ShoppingCart, Download } from 'lucide-react';
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

  // Generate shopping list function
  const handleGenerateShoppingList = () => {
    const itemsToRestock = [
      ...criticalProducts.map(product => ({
        name: product.name,
        type: 'Produto',
        currentStock: product.total_stock || 0,
        unit: 'g',
        suggestedQuantity: productLowThreshold * 2, // Double the low threshold for critical items
        unitPrice: product.unit_price,
        estimatedCost: (productLowThreshold * 2) * product.unit_price,
      })),
      ...lowProducts.map(product => ({
        name: product.name,
        type: 'Produto',
        currentStock: product.total_stock || 0,
        unit: 'g',
        suggestedQuantity: productLowThreshold,
        unitPrice: product.unit_price,
        estimatedCost: productLowThreshold * product.unit_price,
      })),
    ];

    if (itemsToRestock.length === 0) {
      alert('Não há produtos que precisam de reposição no momento.');
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Nome do Produto', 'Tipo', 'Estoque Atual', 'Unidade', 'Quantidade Sugerida', 'Preço Unitário', 'Custo Estimado'],
      ...itemsToRestock.map(item => [
        item.name,
        item.type,
        item.currentStock.toString(),
        item.unit,
        item.suggestedQuantity.toString(),
        item.unitPrice.toFixed(4),
        item.estimatedCost.toFixed(2)
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    // Add summary at the end
    const totalEstimatedCost = itemsToRestock.reduce((sum, item) => sum + item.estimatedCost, 0);
    const summaryContent = `\n\nResumo da Lista de Compras:\nTotal de itens: ${itemsToRestock.length}\nCusto total estimado: R$ ${totalEstimatedCost.toFixed(2)}\nData de geração: ${new Date().toLocaleDateString('pt-BR')}`;

    const finalContent = csvContent + summaryContent;

    // Download CSV file
    const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lista_compras_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export alerts report function
  const handleExportAlertsReport = () => {
    const allAlerts = [
      ...criticalProducts.map(product => ({
        name: product.name,
        type: 'Produto',
        category: 'Ingrediente',
        currentStock: product.total_stock || 0,
        unit: 'g',
        alertLevel: 'Crítico',
        unitPrice: product.unit_price,
        stockValue: (product.total_stock || 0) * product.unit_price,
        supplier: product.supplier || 'Não informado',
      })),
      ...lowProducts.map(product => ({
        name: product.name,
        type: 'Produto',
        category: 'Ingrediente',
        currentStock: product.total_stock || 0,
        unit: 'g',
        alertLevel: 'Baixo',
        unitPrice: product.unit_price,
        stockValue: (product.total_stock || 0) * product.unit_price,
        supplier: product.supplier || 'Não informado',
      })),
      ...criticalGeladinhos.map(geladinho => ({
        name: geladinho.name,
        type: 'Geladinho',
        category: geladinho.category,
        currentStock: geladinho.available_quantity,
        unit: 'unidades',
        alertLevel: 'Crítico',
        unitPrice: geladinho.unit_cost,
        stockValue: geladinho.available_quantity * geladinho.unit_cost,
        supplier: 'Produção própria',
      })),
      ...lowGeladinhos.map(geladinho => ({
        name: geladinho.name,
        type: 'Geladinho',
        category: geladinho.category,
        currentStock: geladinho.available_quantity,
        unit: 'unidades',
        alertLevel: 'Baixo',
        unitPrice: geladinho.unit_cost,
        stockValue: geladinho.available_quantity * geladinho.unit_cost,
        supplier: 'Produção própria',
      })),
    ];

    if (allAlerts.length === 0) {
      alert('Não há alertas de estoque no momento. Todos os itens estão com estoque adequado.');
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Nome', 'Tipo', 'Categoria', 'Estoque Atual', 'Unidade', 'Nível de Alerta', 'Preço Unitário', 'Valor em Estoque', 'Fornecedor/Origem'],
      ...allAlerts.map(alert => [
        alert.name,
        alert.type,
        alert.category,
        alert.currentStock.toString(),
        alert.unit,
        alert.alertLevel,
        alert.unitPrice.toFixed(4),
        alert.stockValue.toFixed(2),
        alert.supplier
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    // Add summary statistics
    const criticalCount = allAlerts.filter(a => a.alertLevel === 'Crítico').length;
    const lowCount = allAlerts.filter(a => a.alertLevel === 'Baixo').length;
    const totalStockValue = allAlerts.reduce((sum, alert) => sum + alert.stockValue, 0);

    const summaryContent = `\n\nResumo do Relatório de Alertas:\nTotal de alertas: ${allAlerts.length}\nAlertas críticos: ${criticalCount}\nAlertas de estoque baixo: ${lowCount}\nValor total em estoque (itens em alerta): R$ ${totalStockValue.toFixed(2)}\nData de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;

    const finalContent = csvContent + summaryContent;

    // Download CSV file
    const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_alertas_estoque_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

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
                onClick={handleGenerateShoppingList}
                className="hover:bg-primary-50 hover:border-primary-300"
              >
                Gerar Lista de Compras
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Download size={16} />}
                onClick={handleExportAlertsReport}
                className="hover:bg-secondary-50 hover:border-secondary-300"
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