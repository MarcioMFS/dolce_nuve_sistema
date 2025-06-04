import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MonthlySales } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../utils/calculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  monthlySales: MonthlySales[];
}

export const SalesChart: React.FC<SalesChartProps> = ({
  monthlySales,
}) => {
  const sortedSales = [...monthlySales].sort((a, b) => 
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );
  
  const chartData = {
    labels: sortedSales.map(sale => 
      new Date(sale.month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    ),
    datasets: [
      {
        label: 'Vendas Mensais',
        data: sortedSales.map(sale => sale.total_sales),
        backgroundColor: 'rgba(235, 132, 145, 0.7)',
        borderColor: 'rgba(235, 132, 145, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Total: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formatCurrency(value),
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Mensais</CardTitle>
      </CardHeader>
      <CardContent>
        {monthlySales.length > 0 ? (
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={options} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
            <p className="text-gray-500">Nenhuma venda registrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};