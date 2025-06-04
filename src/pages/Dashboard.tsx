import React from 'react';
import { useStore } from '../store';
import { DashboardCards } from '../components/dashboard/DashboardCards';
import { ProfitMarginChart } from '../components/dashboard/ProfitMarginChart';
import { TopGeladinhosList } from '../components/dashboard/TopGeladinhosList';

export const Dashboard: React.FC = () => {
  const { products, recipes, geladinhos } = useStore();

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
        <ProfitMarginChart geladinhos={geladinhos} />
        <TopGeladinhosList geladinhos={geladinhos} />
      </div>
    </div>
  );
};