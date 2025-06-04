import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Plus, Search, Package } from 'lucide-react';

import { ProductWithCalculations } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface ProductListProps {
  products: ProductWithCalculations[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <Link to="/produtos/novo">
          <Button leftIcon={<Plus size={18} />}>Novo Produto</Button>
        </Link>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando um novo produto ao sistema.'}
          </p>
          <div className="mt-6">
            <Link to="/produtos/novo">
              <Button leftIcon={<Plus size={18} />}>Novo Produto</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço por grama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço por kg
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data da Compra
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Editar</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.supplier && (
                        <div className="text-xs text-gray-500">{product.supplier}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.total_quantity}g
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.unit_price)}/g
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(product.standard_price)}/kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.purchase_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/produtos/editar/${product.id}`}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1"
                      >
                        <Edit size={16} />
                        <span>Editar</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};