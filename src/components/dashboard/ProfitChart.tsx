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
import { DailySales } from '../../types';
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

interface ProfitChartProps {
  dailySales: DailySales[];
}

export const ProfitChart: React.FC<ProfitChartProps> = ({
  dailySales,
}) => {
  // Get last 7 days of sales
  const last7Days = dailySales.slice(0, 7).reverse();
  
  const chartData = {
    labels: last7Days.map(sale => 
      new Date(sale.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
    ),
    datasets: [
      {
        label: 'Vendas',
        data: last7Days.map(sale => sale.total_sales),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
      {
        label: 'Lucro',
        data: last7Days.map(sale => sale.total_profit),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = formatCurrency(context.raw);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valor (R$)',
        },
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
        <CardTitle>Vendas vs Lucro (Últimos 7 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        {last7Days.length > 0 ? (
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={options} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
            <p className="text-gray-500">Nenhuma venda registrada nos últimos 7 dias</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};