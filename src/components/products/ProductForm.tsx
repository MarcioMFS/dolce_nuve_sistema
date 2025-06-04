import React from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  Store, 
  Save,
  Trash
} from 'lucide-react';

import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Product, UnitOfMeasure } from '../../types';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  defaultValues?: Partial<Product>;
  onDelete?: () => void;
  isEditing?: boolean;
}

export interface ProductFormData {
  name: string;
  unitOfMeasure: UnitOfMeasure;
  totalQuantity: number;
  totalValue: number;
  purchaseDate: string;
  supplier?: string;
}

const unitOptions = [
  { value: 'gramas', label: 'Gramas' },
  { value: 'litros', label: 'Litros' },
  { value: 'unidades', label: 'Unidades' },
];

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  defaultValues,
  onDelete,
  isEditing = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: defaultValues?.name || '',
      unitOfMeasure: defaultValues?.unitOfMeasure || 'gramas',
      totalQuantity: defaultValues?.totalQuantity || 0,
      totalValue: defaultValues?.totalValue || 0,
      purchaseDate: defaultValues?.purchaseDate 
        ? format(new Date(defaultValues.purchaseDate), 'yyyy-MM-dd') 
        : format(new Date(), 'yyyy-MM-dd'),
      supplier: defaultValues?.supplier || '',
    },
  });

  const onFormSubmit = (data: ProductFormData) => {
    // Convert numeric strings to numbers
    const formattedData = {
      ...data,
      totalQuantity: Number(data.totalQuantity),
      totalValue: Number(data.totalValue),
    };
    
    onSubmit(formattedData);
  };

  return (
    <Card className="max-w-3xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Edite as informações do produto cadastrado'
              : 'Preencha os dados do produto que você está comprando'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Produto"
              placeholder="Ex: Leite Condensado"
              leftIcon={<Package size={18} />}
              {...register('name', {
                required: 'Nome do produto é obrigatório',
                maxLength: {
                  value: 100,
                  message: 'O nome não pode ter mais de 100 caracteres',
                },
              })}
              error={errors.name?.message}
            />
            
            <Select
              label="Unidade de Medida"
              options={unitOptions}
              {...register('unitOfMeasure', {
                required: 'Unidade de medida é obrigatória',
              })}
              error={errors.unitOfMeasure?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Quantidade Total"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ex: 1000"
              {...register('totalQuantity', {
                required: 'Quantidade é obrigatória',
                min: {
                  value: 0.01,
                  message: 'A quantidade deve ser maior que zero',
                },
                valueAsNumber: true,
              })}
              error={errors.totalQuantity?.message}
            />
            
            <Input
              label="Valor Total Pago (R$)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ex: 7.50"
              leftIcon={<DollarSign size={18} />}
              {...register('totalValue', {
                required: 'Valor é obrigatório',
                min: {
                  value: 0.01,
                  message: 'O valor deve ser maior que zero',
                },
                valueAsNumber: true,
              })}
              error={errors.totalValue?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data da Compra"
              type="date"
              leftIcon={<Calendar size={18} />}
              {...register('purchaseDate', {
                required: 'Data da compra é obrigatória',
              })}
              error={errors.purchaseDate?.message}
            />
            
            <Input
              label="Fornecedor (Opcional)"
              placeholder="Ex: Mercado Central"
              leftIcon={<Store size={18} />}
              {...register('supplier')}
              error={errors.supplier?.message}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              leftIcon={<Trash size={18} />}
            >
              Excluir
            </Button>
          )}
          <div className={isEditing ? '' : 'ml-auto'}>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save size={18} />}
            >
              {isEditing ? 'Atualizar' : 'Cadastrar'} Produto
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};