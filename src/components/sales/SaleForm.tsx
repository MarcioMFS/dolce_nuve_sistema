import React from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Sale } from '../../types';
import { Calendar, IceCream2, Hash, Save } from 'lucide-react';

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
  const total = watchedQuantity * watchedUnit;

  const geladinhoOptions = geladinhos.map(g => ({ value: g.id, label: g.name }));

  const onFormSubmit = (data: SaleFormData) => {
    const formatted = {
      ...data,
      quantity: Number(data.quantity),
      unit_price: Number(data.unit_price),
      total_price: Number(data.quantity) * Number(data.unit_price),
    };
    onSubmit(formatted);
  };

  return (
    <Card className="max-w-xl mx-auto animate-fade-in">
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantidade"
              type="number"
              min="1"
              leftIcon={<Hash size={18} />}
              {...register('quantity', { required: true, valueAsNumber: true, min: 1 })}
              error={errors.quantity?.message}
            />
            <Input
              label="Preço Unitário"
              type="number"
              step="0.01"
              min="0"
              leftIcon={<Save size={18} />}
              {...register('unit_price', { required: true, valueAsNumber: true, min: 0 })}
              error={errors.unit_price?.message}
            />
          </div>
          <p className="text-sm text-gray-700">Total: R$ {total.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={18} />}>Salvar Venda</Button>
        </CardFooter>
      </form>
    </Card>
  );
};
