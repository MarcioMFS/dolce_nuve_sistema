import React from 'react';
import { useForm } from 'react-hook-form';
import { IceCream2, Save, X } from 'lucide-react';
import { useStore } from '../../store';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { GeladinhoWithCalculations } from '../../types';

interface GeladinhoProductionFormProps {
  onSubmit: (data: ProductionFormData) => void;
  onCancel: () => void;
}

export interface ProductionFormData {
  geladinho_id: string;
  quantity: number;
  batch_date: string;
}

export const GeladinhoProductionForm: React.FC<GeladinhoProductionFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { geladinhos } = useStore();
  
  const activeGeladinhos = geladinhos.filter(g => g.status === 'Ativo');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductionFormData>({
    defaultValues: {
      batch_date: new Date().toISOString().slice(0, 10),
    },
  });

  const watchedGeladinhoId = watch('geladinho_id');
  const selectedGeladinho = geladinhos.find(g => g.id === watchedGeladinhoId) as GeladinhoWithCalculations | undefined;

  const geladinhoOptions = activeGeladinhos.map(g => ({
    value: g.id,
    label: g.name,
  }));

  const onFormSubmit = (data: ProductionFormData) => {
    onSubmit({
      ...data,
      quantity: Number(data.quantity),
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardHeader>
          <CardTitle>Registrar Produção</CardTitle>
          <CardDescription>
            Registre a produção de geladinhos e atualize o estoque automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Geladinho"
            options={geladinhoOptions}
            leftIcon={<IceCream2 size={18} />}
            {...register('geladinho_id', {
              required: 'Selecione um geladinho',
            })}
            error={errors.geladinho_id?.message}
          />

          {selectedGeladinho && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-gray-600">
                Receita: {selectedGeladinho.recipe?.name}
              </p>
              <p className="text-sm text-gray-600">
                Rendimento por receita: {selectedGeladinho.recipe?.yield} unidades
              </p>
              <p className="text-sm text-gray-600">
                Estoque atual: {selectedGeladinho.available_quantity} unidades
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Quantidade Produzida"
              type="number"
              min="1"
              placeholder="Ex: 100"
              {...register('quantity', {
                required: 'Quantidade é obrigatória',
                min: {
                  value: 1,
                  message: 'A quantidade deve ser maior que zero',
                },
                valueAsNumber: true,
              })}
              error={errors.quantity?.message}
            />

            <Input
              label="Data de Produção"
              type="date"
              {...register('batch_date', {
                required: 'Data é obrigatória',
              })}
              error={errors.batch_date?.message}
            />
          </div>
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
            disabled={!selectedGeladinho}
          >
            Registrar Produção
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};