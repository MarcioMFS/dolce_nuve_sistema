import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { SaleForm, SaleFormData } from '../components/sales/SaleForm';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const SaleFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { addSale } = useStore();

  const handleSubmit = (data: SaleFormData) => {
    addSale({
      sale_date: data.sale_date,
      geladinho_id: data.geladinho_id,
      quantity: data.quantity,
      unit_price: data.unit_price,
      discount: data.discount,
      total_price: data.quantity * data.unit_price,
    });
    navigate('/vendas');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/vendas')}
          className="mr-4"
          leftIcon={<ArrowLeft size={16} />}
        >
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Registrar Venda</h1>
      </div>

      <SaleForm onSubmit={handleSubmit} />
    </div>
  );
};
