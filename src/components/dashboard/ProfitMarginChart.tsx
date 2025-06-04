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
import { GeladinhoWithCalculations } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProfitMarginChartProps {
  geladinhos: GeladinhoWithCalculations[];
}

export const ProfitMarginChart: React.FC<ProfitMarginChartProps> = ({
  geladinhos,
}) => {
  // Get active geladinhos only
  const activeGeladinhos = geladinhos.filter(g => g.status === 'Ativo');
  
  // Sort by real margin (descending)
  const sortedGeladinhos = [...activeGeladinhos].sort((a, b) => b.realMargin - a.realMargin);
  
  // Take top 10
  const topGeladinhos = sortedGeladinhos.slice(0, 10);
  
  const chartData = {
    labels: topGeladinhos.map(g => g.name),
    datasets: [
      {
        label: 'Margem Real (%)',
        data: topGeladinhos.map(g => g.realMargin),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
      {
        label: 'Margem Desejada (%)',
        data: topGeladinhos.map(g => g.profitMargin),
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgba(14, 165, 233, 1)',
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
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Porcentagem (%)',
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Margem de Lucro por Geladinho</CardTitle>
      </CardHeader>
      <CardContent>
        {topGeladinhos.length > 0 ? (
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={options} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
            <p className="text-gray-500">Nenhum geladinho ativo cadastrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};