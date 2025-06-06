import React from 'react';
import { useStore } from '../store';
import { SaleList } from '../components/sales/SaleList';

export const SalesPage: React.FC = () => {
  const { sales, deleteSale } = useStore();

  const handleDelete = async (id: string) => {
    await deleteSale(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
      </div>

      <SaleList sales={sales} onDelete={handleDelete} />
    </div>
  );
};