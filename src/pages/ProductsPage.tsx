import React from 'react';
import { useStore } from '../store';
import { ProductList } from '../components/products/ProductList';

export const ProductsPage: React.FC = () => {
  const { products } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
      </div>
      
      <ProductList products={products} />
    </div>
  );
};