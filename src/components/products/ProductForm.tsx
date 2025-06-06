import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Package, 
  Save,
  Trash
} from 'lucide-react';

import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Product } from '../../types';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  defaultValues?: Partial<Product>;
  onDelete?: () => void;
  isEditing?: boolean;
}

export interface ProductFormData {
  name: string;
  unit_of_measure: 'gramas';
}

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
      unit_of_measure: 'gramas',
    },
  });

  const onFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="max-w-3xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Edite as informações básicas do produto'
              : 'Defina um novo produto (ingrediente) no sistema. Após criar o produto, você poderá registrar a primeira compra.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            label="Nome do Produto"
            placeholder="Ex: Leite Condensado, Açúcar, Morango..."
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
          
          <input type="hidden" {...register('unit_of_measure')} value="gramas" />
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Informação</h3>
            <p className="text-sm text-blue-700">
              {isEditing 
                ? 'Você pode alterar apenas o nome do produto. Para registrar novas compras, use o formulário de "Nova Entrada de Estoque".'
                : 'Todos os produtos são medidos em gramas para facilitar os cálculos. Após criar o produto, você será direcionado para registrar a primeira compra.'
              }
            </p>
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
              {isEditing ? 'Atualizar' : 'Criar'} Produto
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};