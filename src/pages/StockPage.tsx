import React, { useState } from 'react';
import { useStore } from '../store';
import { StockOverview } from '../components/stock/StockOverview';
import { StockAdjustmentForm } from '../components/stock/StockAdjustmentForm';
import { StockAlerts } from '../components/stock/StockAlerts';
import { StockHistory } from '../components/stock/StockHistory';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Plus, Package, AlertTriangle, History } from 'lucide-react';

export const StockPage: React.FC = () => {
  const { products, geladinhos } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'adjustments' | 'alerts' | 'history'>('overview');
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Package },
    { id: 'adjustments', label: 'Ajustes', icon: Plus },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
    { id: 'history', label: 'Histórico', icon: History },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-gray-600 mt-1">Controle completo do seu inventário</p>
        </div>
        
        <Button
          onClick={() => setShowAdjustmentForm(true)}
          leftIcon={<Plus size={18} />}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          Novo Ajuste
        </Button>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon size={18} className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <StockOverview products={products} geladinhos={geladinhos} />
        )}
        
        {activeTab === 'adjustments' && (
          <div className="space-y-6">
            {showAdjustmentForm && (
              <StockAdjustmentForm
                onCancel={() => setShowAdjustmentForm(false)}
                onSubmit={() => setShowAdjustmentForm(false)}
              />
            )}
            <Card>
              <CardHeader>
                <CardTitle>Ajustes de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Plus className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Nenhum ajuste pendente
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Clique em "Novo Ajuste" para registrar movimentações de estoque.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'alerts' && (
          <StockAlerts products={products} geladinhos={geladinhos} />
        )}
        
        {activeTab === 'history' && (
          <StockHistory products={products} geladinhos={geladinhos} />
        )}
      </div>
    </div>
  );
};