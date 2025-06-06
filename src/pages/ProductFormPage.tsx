import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { ProductForm, ProductFormData } from '../components/products/ProductForm';
import { StockEntryForm, StockEntryFormData } from '../components/products/StockEntryForm';
import { StockEntryHistory } from '../components/products/StockEntryHistory';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Plus } from 'lucide-react';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getProduct,
    addStockEntry,
    fetchStockEntries 
  } = useStore();
  
  const [showStockEntryForm, setShowStockEntryForm] = useState(false);
  
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

  const handleStockEntrySubmit = async (data: StockEntryFormData) => {
    if (!id) return;

    await addStockEntry({
      product_id: id,
      ...data,
    });

    setShowStockEntryForm(false);
    // Aguarda a atualização do histórico de entradas para
    // garantir que o registro recém-criado seja exibido ao
    // retornar para a página de edição
    await fetchStockEntries(id);
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
    <div className="max-w-3xl mx-auto space-y-6">
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
      
      {isEditing ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => setShowStockEntryForm(true)}
              leftIcon={<Plus size={18} />}
              disabled={showStockEntryForm}
            >
              Nova Entrada de Estoque
            </Button>
          </div>

          {showStockEntryForm && (
            <StockEntryForm
              productId={id}
              productName={product.name}
              onSubmit={handleStockEntrySubmit}
              onCancel={() => setShowStockEntryForm(false)}
            />
          )}

          <StockEntryHistory entries={product.stock_entries || []} />

          <ProductForm
            onSubmit={handleSubmit}
            defaultValues={product}
            onDelete={handleDelete}
            isEditing={true}
          />
        </div>
      ) : (
        <ProductForm
          onSubmit={handleSubmit}
          isEditing={false}
        />
      )}
    </div>
  );
};
