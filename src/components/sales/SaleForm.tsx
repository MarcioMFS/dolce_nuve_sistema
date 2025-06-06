import React from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Sale } from '../../types';
import { Calendar, IceCream2, Hash, Save, AlertTriangle } from 'lucide-react';

export interface SaleFormData {
  sale_date: string;
  geladinho_id: string;
  quantity: number;
  unit_price: number;
}

interface SaleFormProps {
  onSubmit: (data: SaleFormData) => void;
  defaultValues?: Partial<Sale>;
  isEditing?: boolean;
}

export const SaleForm: React.FC<SaleFormProps> = ({ onSubmit, defaultValues, isEditing = false }) => {
  const { geladinhos } = useStore();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormData>({
    defaultValues: {
      sale_date: defaultValues?.sale_date || new Date().toISOString().slice(0, 10),
      geladinho_id: defaultValues?.geladinho_id || (geladinhos[0]?.id || ''),
      quantity: defaultValues?.quantity || 1,
      unit_price: defaultValues?.unit_price || 0,
    },
  });

  const watchedQuantity = watch('quantity');
  const watchedUnit = watch('unit_price');
  const watchedGeladinhoId = watch('geladinho_id');
  
  const total = watchedQuantity * watchedUnit;

  // Find selected geladinho and check stock
  const selectedGeladinho = geladinhos.find(g => g.id === watchedGeladinhoId);
  const availableStock = selectedGeladinho?.available_quantity || 0;
  const hasInsufficientStock = watchedQuantity > availableStock;

  const geladinhoOptions = geladinhos.map(g => ({ 
    value: g.id, 
    label: `${g.name} (${g.available_quantity} unidades disponíveis)` 
  }));

  const onFormSubmit = (data: SaleFormData) => {
    // Final validation before submitting
    if (data.quantity > availableStock) {
      alert(`Estoque insuficiente! Disponível: ${availableStock} unidades`);
      return;
    }

    const formatted = {
      ...data,
      quantity: Number(data.quantity),
      unit_price: Number(data.unit_price),
      total_price: Number(data.quantity) * Number(data.unit_price),
    };
    onSubmit(formatted);
  };

  return (
    <Card className="max-w-3xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Venda' : 'Nova Venda'}</CardTitle>
          <CardDescription>Registre a venda de geladinhos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Data da Venda"
            type="date"
            leftIcon={<Calendar size={18} />}
            {...register('sale_date', { required: 'Data é obrigatória' })}
            error={errors.sale_date?.message}
          />
          
          <Select
            label="Geladinho"
            options={geladinhoOptions}
            leftIcon={<IceCream2 size={18} />}
            {...register('geladinho_id', { required: 'Produto é obrigatório' })}
            error={errors.geladinho_id?.message}
          />

          {/* Stock Information */}
          {selectedGeladinho && (
            <div className={`p-4 rounded-lg border ${
              availableStock === 0 
                ? 'bg-red-50 border-red-200' 
                : availableStock <= 5 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center mb-2">
                <IceCream2 className={`h-5 w-5 mr-2 ${
                  availableStock === 0 
                    ? 'text-red-600' 
                    : availableStock <= 5 
                    ? 'text-yellow-600' 
                    : 'text-blue-600'
                }`} />
                <h4 className={`font-medium ${
                  availableStock === 0 
                    ? 'text-red-800' 
                    : availableStock <= 5 
                    ? 'text-yellow-800' 
                    : 'text-blue-800'
                }`}>
                  Informações de Estoque
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Produto:</span>
                  <span className="ml-2 font-medium">{selectedGeladinho.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Estoque Disponível:</span>
                  <span className={`ml-2 font-bold ${
                    availableStock === 0 
                      ? 'text-red-600' 
                      : availableStock <= 5 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                  }`}>
                    {availableStock} unidades
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Categoria:</span>
                  <span className="ml-2">{selectedGeladinho.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Preço Sugerido:</span>
                  <span className="ml-2 font-medium">
                    R$ {selectedGeladinho.suggested_price.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {availableStock === 0 && (
                <div className="mt-3 flex items-center text-red-700">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Produto sem estoque! Não é possível realizar vendas.
                  </span>
                </div>
              )}
              
              {availableStock > 0 && availableStock <= 5 && (
                <div className="mt-3 flex items-center text-yellow-700">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Estoque baixo! Considere produzir mais unidades.
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantidade"
              type="number"
              min="1"
              max={availableStock}
              leftIcon={<Hash size={18} />}
              {...register('quantity', { 
                required: 'Quantidade é obrigatória', 
                valueAsNumber: true, 
                min: { value: 1, message: 'Quantidade deve ser pelo menos 1' },
                max: { value: availableStock, message: `Máximo disponível: ${availableStock}` }
              })}
              error={errors.quantity?.message || (hasInsufficientStock ? `Estoque insuficiente! Máximo: ${availableStock}` : undefined)}
            />
            <Input
              label="Preço Unitário"
              type="number"
              step="0.01"
              min="0"
              leftIcon={<Save size={18} />}
              {...register('unit_price', { required: 'Preço é obrigatório', valueAsNumber: true, min: 0 })}
              error={errors.unit_price?.message}
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total da Venda:</span>
              <span className="text-lg font-bold text-primary-600">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            isLoading={isSubmitting} 
            leftIcon={<Save size={18} />}
            disabled={availableStock === 0 || hasInsufficientStock}
          >
            {availableStock === 0 ? 'Sem Estoque' : 'Salvar Venda'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};