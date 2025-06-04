import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { GeladinhoForm, GeladinhoFormData } from '../components/geladinhos/GeladinhoForm';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const GeladinhoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { geladinhos, addGeladinho, updateGeladinho, deleteGeladinho, getGeladinho } = useStore();
  
  const isEditing = Boolean(id);
  const geladinho = id ? getGeladinho(id) : undefined;
  
  const handleSubmit = (data: GeladinhoFormData) => {
    if (isEditing && id) {
      updateGeladinho(id, data);
    } else {
      addGeladinho(data);
    }
    navigate('/geladinhos');
  };
  
  const handleDelete = () => {
    if (id) {
      deleteGeladinho(id);
      navigate('/geladinhos');
    }
  };
  
  if (isEditing && !geladinho) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-2">Geladinho não encontrado</h2>
        <p className="text-gray-500 mb-6">O geladinho que você está tentando editar não existe.</p>
        <Button onClick={() => navigate('/geladinhos')}>
          Voltar para Geladinhos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/geladinhos')}
          className="mr-4"
          leftIcon={<ArrowLeft size={16} />}
        >
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Geladinho' : 'Novo Geladinho'}
        </h1>
      </div>
      
      <GeladinhoForm
        onSubmit={handleSubmit}
        defaultValues={geladinho}
        onDelete={isEditing ? handleDelete : undefined}
        isEditing={isEditing}
      />
    </div>
  );
};