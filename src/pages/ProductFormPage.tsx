import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { ProductForm, ProductFormData } from '../components/products/ProductForm';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, getProduct } = useStore();
  
  const isEditing = Boolean(id);
  const product = id ? getProduct(id) : undefined;
  
  const handleSubmit = (data: ProductFormData) => {
    if (isEditing && id) {
      updateProduct(id, data);
    } else {
      addProduct(data);
    }
    navigate('/produtos');
  };
  
  const handleDelete = () => {
    if (id) {
      deleteProduct(id);
      navigate('/produtos');
    }
  };
  
  if (isEditing && !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-2">Produto não encontrado</h2>
        <p className="text-gray-500 mb-6">O produto que você está tentando editar não existe.</p>
        <Button onClick={() => navigate('/produtos')}>
          Voltar para Produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/produtos')}
          className="mr-4"
          leftIcon={<ArrowLeft size={16} />}
        >
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>
      
      <ProductForm
        onSubmit={handleSubmit}
        defaultValues={product}
        onDelete={isEditing ? handleDelete : undefined}
        isEditing={isEditing}
      />
    </div>
  );
};