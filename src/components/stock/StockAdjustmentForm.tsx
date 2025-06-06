import React from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Package, IceCream2, Save, X, Plus, Minus } from 'lucide-react';

interface StockAdjustmentFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

interface AdjustmentFormData {
  type: 'product' | 'geladinho';
  item_id: string;
  adjustment_type: 'positive' | 'negative';
  quantity: number;
  reason: string;
  notes?: string;
}

export const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { products, geladinhos, addStockEntry, addGeladinhoStock } = useStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdjustmentFormData>({
    defaultValues: {
      type: 'product',
      adjustment_type: 'positive',
      reason: '',
    },
  });

  const watchedType = watch('type');
  const watchedItemId = watch('item_id');
  const watchedAdjustmentType = watch('adjustment_type');

  const typeOptions = [
    { value: 'product', label: 'Produto (Ingrediente)' },
    { value: 'geladinho', label: 'Geladinho' },
  ];

  const adjustmentTypeOptions = [
    { value: 'positive', label: 'Entrada (+)' },
    { value: 'negative', label: 'Saída (-)' },
  ];

  const reasonOptions = [
    { value: 'inventory_count', label: 'Contagem de Inventário' },
    { value: 'damage', label: 'Produto Danificado' },
    { value: 'expiration', label: 'Produto Vencido' },
    { value: 'theft', label: 'Perda/Roubo' },
    { value: 'production_error', label: 'Erro de Produção' },
    { value: 'supplier_return', label: 'Devolução ao Fornecedor' },
    { value: 'other', label: 'Outro' },
  ];

  const itemOptions = watchedType === 'product'
    ? products.map(p => ({ value: p.id, label: p.name }))
    : geladinhos.map(g => ({ value: g.id, label: g.name }));

  const selectedItem = watchedType === 'product'
    ? products.find(p => p.id === watchedItemId)
    : geladinhos.find(g => g.id === watchedItemId);

  const onFormSubmit = async (data: AdjustmentFormData) => {
    try {
      if (data.type === 'product') {
        // For products, we'll add a stock entry with negative cost for adjustments
        await addStockEntry({
          product_id: data.item_id,
          quantity: data.adjustment_type === 'positive' ? data.quantity : -data.quantity,
          total_cost: 0, // Adjustments don't have cost
          entry_date: new Date().toISOString(),
          supplier: `Ajuste: ${data.reason}`,
        });
      } else {
        // For geladinhos, we'll add a stock movement
        await addGeladinhoStock({
          geladinho_id: data.item_id,
          quantity: data.quantity,
          batch_date: new Date().toISOString(),
          movement_type: data.adjustment_type === 'positive' ? 'entrada' : 'saida',
        });
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error submitting stock adjustment:', error);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardHeader>
          <CardTitle>Ajuste de Estoque</CardTitle>
          <CardDescription>
            Registre entradas ou saídas de estoque para correções de inventário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Item"
              options={typeOptions}
              leftIcon={watchedType === 'product' ? <Package size={18} /> : <IceCream2 size={18} />}
              {...register('type', { required: 'Tipo é obrigatório' })}
              error={errors.type?.message}
            />

            <Select
              label="Tipo de Ajuste"
              options={adjustmentTypeOptions}
              leftIcon={watchedAdjustmentType === 'positive' ? <Plus size={18} /> : <Minus size={18} />}
              {...register('adjustment_type', { required: 'Tipo de ajuste é obrigatório' })}
              error={errors.adjustment_type?.message}
            />
          </div>

          <Select
            label={watchedType === 'product' ? 'Produto' : 'Geladinho'}
            options={itemOptions}
            {...register('item_id', { required: 'Item é obrigatório' })}
            error={errors.item_id?.message}
          />

          {selectedItem && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Item</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nome:</span>
                  <span className="ml-2 font-medium">{selectedItem.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Estoque Atual:</span>
                  <span className="ml-2 font-medium">
                    {watchedType === 'product'
                      ? `${(selectedItem as any).total_stock || 0}g`
                      : `${(selectedItem as any).available_quantity || 0} unidades`
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Quantidade"
              type="number"
              min="0.01"
              step="0.01"
              placeholder={watchedType === 'product' ? 'Ex: 500' : 'Ex: 10'}
              {...register('quantity', {
                required: 'Quantidade é obrigatória',
                min: { value: 0.01, message: 'Quantidade deve ser maior que zero' },
                valueAsNumber: true,
              })}
              error={errors.quantity?.message}
              helperText={watchedType === 'product' ? 'Em gramas' : 'Em unidades'}
            />

            <Select
              label="Motivo do Ajuste"
              options={reasonOptions}
              {...register('reason', { required: 'Motivo é obrigatório' })}
              error={errors.reason?.message}
            />
          </div>

          <Input
            label="Observações (Opcional)"
            placeholder="Detalhes adicionais sobre o ajuste..."
            {...register('notes')}
            error={errors.notes?.message}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            leftIcon={<X size={18} />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Save size={18} />}
            disabled={!selectedItem}
          >
            Registrar Ajuste
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};