import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  Plus, 
  Search, 
  IceCream2, 
  Filter,
  DollarSign,
  Tag,
  Clock,
  Thermometer
} from 'lucide-react';

import { GeladinhoWithCalculations, Category, Status } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface GeladinhoListProps {
  geladinhos: GeladinhoWithCalculations[];
}

const getCategoryBadgeVariant = (category: Category) => {
  switch (category) {
    case 'Cremoso':
      return 'primary';
    case 'Frutas':
      return 'success';
    case 'Especial':
      return 'secondary';
    case 'Gourmet':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusBadgeVariant = (status: Status) => {
  switch (status) {
    case 'Ativo':
      return 'success';
    case 'Inativo':
      return 'error';
    case 'Teste':
      return 'warning';
    default:
      return 'default';
  }
};

export const GeladinhoList: React.FC<GeladinhoListProps> = ({ geladinhos }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const categoryOptions = [
    { value: '', label: 'Todas' },
    { value: 'Cremoso', label: 'Cremoso' },
    { value: 'Frutas', label: 'Frutas' },
    { value: 'Especial', label: 'Especial' },
    { value: 'Gourmet', label: 'Gourmet' },
  ];

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Inativo', label: 'Inativo' },
    { value: 'Teste', label: 'Teste' },
  ];

  const filteredGeladinhos = geladinhos.filter((geladinho) => {
    const matchesSearch = geladinho.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter 
      ? geladinho.category === categoryFilter 
      : true;
    
    const matchesStatus = statusFilter 
      ? geladinho.status === statusFilter 
      : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Buscar geladinho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <div className="w-full sm:w-40">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              leftIcon={<Filter size={16} />}
              placeholder="Categoria"
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              leftIcon={<Filter size={16} />}
              placeholder="Status"
            />
          </div>
          <Link to="/gela
dinhos/novo">
            <Button leftIcon={<Plus size={18} />}>Novo Geladinho</Button>
          </Link>
        </div>
      </div>

      {filteredGeladinhos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <IceCream2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum geladinho encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter || statusFilter
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando um novo geladinho ao sistema.'}
          </p>
          <div className="mt-6">
            <Link to="/geladinhos/novo">
              <Button leftIcon={<Plus size={18} />}>Novo Geladinho</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGeladinhos.map((geladinho) => (
            <Link
              key={geladinho.id}
              to={`/geladinhos/editar/${geladinho.id}`}
              className="block h-full"
            >
              <Card className="h-full hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="relative h-32 bg-gradient-to-r from-primary-500 to-secondary-500">
                  {geladinho.image_url && (
                    <img
                      src={geladinho.image_url}
                      alt={geladinho.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                    <h3 className="text-lg font-medium text-white">{geladinho.name}</h3>
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Badge variant={getCategoryBadgeVariant(geladinho.category)}>
                      {geladinho.category}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(geladinho.status)}>
                      {geladinho.status}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="flex-1 flex flex-col p-4">
                  {geladinho.description && (
                    <p className="text-sm text-gray-600 mb-3">{geladinho.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    <div className="flex items-center">
                      <DollarSign size={16} className="text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">Custo:</span>
                      <span className="text-sm font-medium ml-1">
                        {formatCurrency(geladinho.unitCost)}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign size={16} className="text-green-500 mr-1" />
                      <span className="text-sm text-gray-600">Venda:</span>
                      <span className="text-sm font-bold text-primary-600 ml-1">
                        {formatCurrency(geladinho.suggestedPrice)}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Tag size={16} className="text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">Margem:</span>
                      <span className="text-sm font-medium ml-1">
                        {geladinho.profit_margin}%
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign size={16} className="text-success-500 mr-1" />
                      <span className="text-sm text-gray-600">Lucro:</span>
                      <span className="text-sm font-medium text-success-600 ml-1">
                        {formatCurrency(geladinho.unitProfit)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2 text-xs text-gray-500">
                    {geladinho.prepTime && (
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>Preparo: {geladinho.prepTime} min</span>
                      </div>
                    )}
                    
                    {geladinho.freezingTemp && (
                      <div className="flex items-center">
                        <Thermometer size={14} className="mr-1" />
                        <span>Temp: {geladinho.freezingTemp}°C</span>
                      </div>
                    )}
                    
                    {geladinho.recipe && (
                      <div className="col-span-2 truncate">
                        Receita: {geladinho.recipe.name}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <div className="px-4 py-3 bg-gray-50 flex justify-end mt-auto">
                  <span className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800">
                    <Edit size={16} className="mr-1" />
                    Editar geladinho
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};