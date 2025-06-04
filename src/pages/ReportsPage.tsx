import React from 'react';
import { useStore } from '../store';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, FileBarChart } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

export const ReportsPage: React.FC = () => {
  const { products, recipes, geladinhos, monthlySales } = useStore();
  
  const handleExportPricing = () => {
    const activeGeladinhos = geladinhos.filter(g => g.status === 'Ativo');
    
    const csvContent = [
      ['Nome', 'Categoria', 'Custo', 'Preço de Venda', 'Lucro', 'Margem'],
      ...activeGeladinhos.map(g => [
        g.name,
        g.category,
        g.unit_cost.toFixed(2),
        g.suggested_price.toFixed(2),
        g.unit_profit.toFixed(2),
        `${g.real_margin.toFixed(1)}%`
      ])
    ]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'precos_geladinhos.csv');
    link.click();
  };
  
  const handleExportIngredients = () => {
    const csvContent = [
      ['Nome', 'Unidade', 'Quantidade', 'Valor Total', 'Preço Unitário', 'Preço por kg/L'],
      ...products.map(p => [
        p.name,
        p.unit_of_measure,
        p.total_quantity.toString(),
        p.total_value.toFixed(2),
        p.unit_price.toFixed(4),
        p.unit_of_measure === 'unidades' ? '' : (p.unit_price * 1000).toFixed(2)
      ])
    ]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ingredientes.csv');
    link.click();
  };
  
  const handleExportRecipes = () => {
    const csvContent = recipes.map(recipe => {
      const header = `"${recipe.name}","Rendimento: ${recipe.yield} unidades","Custo Total: ${formatCurrency(recipe.total_cost)}","Custo por Unidade: ${formatCurrency(recipe.unit_cost)}"`;
      
      const ingredients = recipe.ingredients.map(ing => {
        const product = ing.product;
        if (!product) return `"Ingrediente não encontrado","0g","${formatCurrency(0)}"`;
        return `"${product.name}","${ing.quantity}g","${formatCurrency(product.unit_price * ing.quantity)}"`;
      }).join('\n');
      
      return `${header}\n"Ingrediente","Quantidade","Custo"\n${ingredients}\n\n`;
    }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'receitas.csv');
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Preços de Geladinhos</CardTitle>
            <CardDescription>
              Relatório com todos os preços e margens de lucro dos geladinhos ativos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>Total de geladinhos:</span>
                <span className="font-medium">{geladinhos.filter(g => g.status === 'Ativo').length}</span>
              </div>
              
              <Button 
                onClick={handleExportPricing}
                leftIcon={<Download size={18} />}
                fullWidth
                disabled={geladinhos.length === 0}
              >
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ingredientes</CardTitle>
            <CardDescription>
              Relatório com todos os ingredientes e seus preços unitários.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>Total de ingredientes:</span>
                <span className="font-medium">{products.length}</span>
              </div>
              
              <Button 
                onClick={handleExportIngredients}
                leftIcon={<Download size={18} />}
                fullWidth
                disabled={products.length === 0}
              >
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
        
      <Card>
        <CardHeader>
          <CardTitle>Receitas Detalhadas</CardTitle>
          <CardDescription>
            Relatório detalhado de todas as receitas e seus ingredientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>Total de receitas:</span>
              <span className="font-medium">{recipes.length}</span>
            </div>

            <Button
              onClick={handleExportRecipes}
              leftIcon={<Download size={18} />}
              fullWidth
              disabled={recipes.length === 0}
            >
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendas Mensais</CardTitle>
          <CardDescription>Resumo consolidado das vendas registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlySales.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma venda registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de Vendas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlySales.map((ms) => (
                    <tr key={ms.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ms.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(ms.total_sales)}
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
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Análise de Rentabilidade</CardTitle>
            <CardDescription>
              Relatório completo com análise de rentabilidade dos geladinhos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <FileBarChart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Relatório em Desenvolvimento</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Estamos trabalhando em análises avançadas para ajudar você a otimizar seus lucros.
                Esta funcionalidade estará disponível em breve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};