import React from 'react';
import { useStore } from '../store';
import { DashboardCards } from '../components/dashboard/DashboardCards';
import { SalesChart } from '../components/dashboard/SalesChart';
import { TopSellingList } from '../components/dashboard/TopSellingList';

export const Dashboard: React.FC = () => {
  const { products, recipes, geladinhos, sales, monthlySales } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <DashboardCards 
        products={products}
        recipes={recipes}
        geladinhos={geladinhos}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart monthlySales={monthlySales} />
        <TopSellingList sales={sales} geladinhos={geladinhos} />
      </div>
    </div>
  );
};