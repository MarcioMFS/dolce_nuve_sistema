import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Save,
  PackageOpen,
  Calculator
} from 'lucide-react';

import { useStore } from '../../store';
import { 
  Input 
} from '../ui/Input';
import { 
  Select 
} from '../ui/Select';
import { 
  Button 
} from '../ui/Button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '../ui/Card';
import { formatCurrency } from '../../utils/calculations';
import { Recipe, Ingredient } from '../../types';

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => void;
  defaultValues?: Partial<Recipe>;
  onDelete?: () => void;
  isEditing?: boolean;
}

export interface RecipeFormData {
  name: string;
  yield: number;
  ingredients: Omit<Ingredient, 'id' | 'product'>[];
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  onSubmit,
  defaultValues,
  onDelete,
  isEditing = false,
}) => {
  const { products } = useStore();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [ingredientQuantity, setIngredientQuantity] = useState<number>(0);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RecipeFormData>({
    defaultValues: {
      name: defaultValues?.name || '',
      yield: defaultValues?.yield || 1,
      ingredients: defaultValues?.ingredients.map((ingredient) => ({
        product_id: ingredient.product_id,
        quantity: ingredient.quantity,
      })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });
  
  const watchedIngredients = watch('ingredients');
  const watchedYield = watch('yield');
  
  // Calculate total cost
  const calculateTotalCost = () => {
    let total = 0;
    
    if (watchedIngredients) {
      watchedIngredients.forEach((ingredient, index) => {
        const product = products.find((p) => p.id === ingredient.product_id);
        if (product && ingredient.quantity) {
          total += product.unit_price * ingredient.quantity;
        }
      });
    }
    
    return total;
  };
  
  const totalCost = calculateTotalCost();
  const unitCost = watchedYield > 0 ? totalCost / watchedYield : 0;
  
  const handleAddIngredient = () => {
    if (!selectedProductId || ingredientQuantity <= 0) return;
    
    append({
      product_id: selectedProductId,
      quantity: ingredientQuantity,
    });
    
    setSelectedProductId('');
    setIngredientQuantity(0);
  };
  
  const productOptions = products.map(product => ({
    value: product.id,
    label: product.name,
  }));
  
  const onFormSubmit = (data: RecipeFormData) => {
    // Convert numeric strings to numbers
    const formattedData = {
      ...data,
      yield: Number(data.yield),
      ingredients: data.ingredients.map(ingredient => ({
        ...ingredient,
        quantity: Number(ingredient.quantity),
      })),
    };
    
    onSubmit(formattedData);
  };

  return (
    <Card className="max-w-3xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Receita' : 'Nova Receita'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Edite os ingredientes e informações da receita'
              : 'Crie uma receita listando todos os ingredientes necessários'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Receita"
              placeholder="Ex: Geladinho de Morango"
              leftIcon={<ClipboardList size={18} />}
              {...register('name', {
                required: 'Nome da receita é obrigatório',
                maxLength: {
                  value: 80,
                  message: 'O nome não pode ter mais de 80 caracteres',
                },
              })}
              error={errors.name?.message}
            />
            
            <Input
              label="Rendimento (Unidades)"
              type="number"
              min="1"
              step="1"
              placeholder="Ex: 10"
              leftIcon={<Calculator size={18} />}
              {...register('yield', {
                required: 'Rendimento é obrigatório',
                min: {
                  value: 1,
                  message: 'O rendimento deve ser pelo menos 1 unidade',
                },
                valueAsNumber: true,
              })}
              error={errors.yield?.message}
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Adicionar Ingredientes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="col-span-1 md:col-span-1">
                <Select
                  label="Ingrediente"
                  options={productOptions}
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                />
              </div>
              <div className="col-span-1 md:col-span-1">
                <Input
                  label="Quantidade (g)"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(Number(e.target.value))}
                />
              </div>
              <div className="col-span-1 md:col-span-1 flex items-end">
                <Button
                  type="button"
                  onClick={handleAddIngredient}
                  leftIcon={<Plus size={18} />}
                  fullWidth
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
          
          {fields.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Ingredientes da Receita</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ingrediente
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantidade
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Custo
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fields.map((field, index) => {
                      const product = products.find((p) => p.id === field.product_id);
                      const cost = product ? product.unit_price * field.quantity : 0;
                      
                      return (
                        <tr key={field.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                          <input
                              type="hidden"
                              {...register(`ingredients.${index}.product_id` as const)}
                            />
                            {product?.name || 'Ingrediente desconhecido'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              {...register(`ingredients.${index}.quantity` as const, {
                                required: true,
                                min: 0.1,
                                valueAsNumber: true,
                              })}
                              error={errors.ingredients?.[index]?.quantity?.message}
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatCurrency(cost)}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => remove(index)}
                              leftIcon={<Trash2 size={16} className="text-error-500" />}
                              className="text-error-600 hover:text-error-800"
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                        Custo Total:
                      </td>
                      <td className="px-4 py-2 text-sm font-bold text-gray-900">
                        {formatCurrency(totalCost)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                        Custo por Unidade:
                      </td>
                      <td className="px-4 py-2 text-sm font-bold text-primary-600">
                        {formatCurrency(unitCost)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sem ingredientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Adicione ingredientes à sua receita para calcular o custo.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              leftIcon={<Trash2 size={18} />}
            >
              Excluir
            </Button>
          )}
          <div className={isEditing ? '' : 'ml-auto'}>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save size={18} />}
              disabled={fields.length === 0}
            >
              {isEditing ? 'Atualizar' : 'Salvar'} Receita
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};