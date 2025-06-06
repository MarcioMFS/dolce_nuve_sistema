import React from 'react';
import { AlertTriangle, Package, X, ShoppingCart } from 'lucide-react';
import { ProductWithCalculations } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface StockAlert {
  product: ProductWithCalculations;
  currentStock: number;
  alertLevel: 'critical' | 'low';
}

interface StockAlertModalProps {
  alerts: StockAlert[];
  onClose: () => void;
  isOpen: boolean;
}

export const StockAlertModal: React.FC<StockAlertModalProps> = ({
  alerts,
  onClose,
  isOpen,
}) => {
  if (!isOpen || alerts.length === 0) return null;

  const criticalAlerts = alerts.filter(alert => alert.alertLevel === 'critical');
  const lowAlerts = alerts.filter(alert => alert.alertLevel === 'low');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-warning-50 to-error-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-warning-800">
              <AlertTriangle className="h-6 w-6 mr-2 text-warning-600" />
              Alerta de Estoque
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-4">
            <p className="text-gray-700">
              Após registrar a produção, detectamos que alguns produtos ficaram com estoque baixo ou crítico:
            </p>
          </div>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-error-700 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Estoque Crítico (≤ 10g)
              </h3>
              <div className="space-y-3">
                {criticalAlerts.map((alert) => (
                  <div
                    key={alert.product.id}
                    className="flex items-center justify-between p-4 bg-error-50 border border-error-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-error-600 mr-3" />
                      <div>
                        <div className="font-medium text-error-900">
                          {alert.product.name}
                        </div>
                        <div className="text-sm text-error-700">
                          Preço: {formatCurrency(alert.product.unit_price)}/g
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="error" className="mb-1">
                        {alert.currentStock}g restante
                      </Badge>
                      <div className="text-xs text-error-600">
                        Reposição urgente!
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Alerts */}
          {lowAlerts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-warning-700 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Estoque Baixo (≤ 100g)
              </h3>
              <div className="space-y-3">
                {lowAlerts.map((alert) => (
                  <div
                    key={alert.product.id}
                    className="flex items-center justify-between p-4 bg-warning-50 border border-warning-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-warning-600 mr-3" />
                      <div>
                        <div className="font-medium text-warning-900">
                          {alert.product.name}
                        </div>
                        <div className="text-sm text-warning-700">
                          Preço: {formatCurrency(alert.product.unit_price)}/g
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="warning" className="mb-1">
                        {alert.currentStock}g restante
                      </Badge>
                      <div className="text-xs text-warning-600">
                        Planejar reposição
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Recomendações:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {criticalAlerts.length > 0 && (
                <li>• <strong>Urgente:</strong> {criticalAlerts.length} produto(s) precisam de reposição imediata</li>
              )}
              {lowAlerts.length > 0 && (
                <li>• <strong>Planejamento:</strong> {lowAlerts.length} produto(s) precisam de reposição em breve</li>
              )}
              <li>• Verifique seus fornecedores habituais para fazer os pedidos</li>
              <li>• Considere comprar quantidades maiores para produtos de uso frequente</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 flex justify-between">
          <div className="text-sm text-gray-600">
            Total de alertas: <strong>{alerts.length}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              leftIcon={<ShoppingCart size={16} />}
              onClick={() => {
                // Aqui você pode implementar uma função para gerar lista de compras
                // Por enquanto, vamos apenas mostrar um alert
                const productList = alerts.map(alert => 
                  `${alert.product.name}: ${alert.currentStock}g restante`
                ).join('\n');
                
                alert(`Lista de produtos para reposição:\n\n${productList}`);
              }}
            >
              Lista de Compras
            </Button>
            <Button onClick={onClose}>
              Entendi
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};