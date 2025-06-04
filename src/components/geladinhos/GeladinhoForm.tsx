import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  IceCream, 
  Tag, 
  Save, 
  Trash2, 
  Percent, 
  Clock, 
  Thermometer, 
  FileText,
  Image
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
import { 
  Geladinho, 
  RecipeWithCalculations, 
  Category, 
  Status 
} from '../../types';

interface GeladinhoFormProps {
  onSubmit: (data: GeladinhoFormData) => void;
  defaultValues?: Partial<Geladinho>;
  onDelete?: () => void;
  isEditing?: boolean;
}

export interface GeladinhoFormData {
  name: string;
  recipeId: string;
  category: Category;
  profit_margin: number;
  status: Status;
  description?: string;
  prepTime?: number;
  freezingTemp?: number;
  notes?: string;
  image_url?: string;
}

const categoryOptions = [
  { value: 'Cremoso', label: 'Cremoso' },
  { value: 'Frutas', label: 'Frutas' },
  { value: 'Especial', label: 'Especial' },
  { value: 'Gourmet', label: 'Gourmet' },
];

const statusOptions = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Inativo', label: 'Inativo' },
  { value: 'Teste', label: 'Teste' },
];

export const GeladinhoForm: React.FC<GeladinhoFormProps> = ({
  onSubmit,
  defaultValues,
  onDelete,
  isEditing = false,
}) => {
  const { recipes } = useStore();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GeladinhoFormData>({
    defaultValues: {
      name: defaultValues?.name || '',
      recipeId: defaultValues?.recipeId || '',
      category: defaultValues?.category || 'Cremoso',
      profit_margin: defaultValues?.profit_margin || 50,
      status: defaultValues?.status || 'Ativo',
      description: defaultValues?.description || '',
      prepTime: defaultValues?.prepTime || undefined,
      freezingTemp: defaultValues?.freezingTemp || undefined,
      notes: defaultValues?.notes || '',
      image_url: defaultValues?.image_url || '',
    },
  });
  
  const watchedRecipeId = watch('recipeId');
  const watchedProfitMargin = watch('profit_margin');
  
  const selectedRecipe = recipes.find(
    (recipe) => recipe.id === watchedRecipeId
  ) as RecipeWithCalculations | undefined;
  
  const unitCost = selectedRecipe?.unitCost || 0;
  const suggestedPrice = unitCost * (1 + watchedProfitMargin / 100);
  const unitProfit = suggestedPrice - unitCost;
  const realMargin = suggestedPrice > 0 ? (unitProfit / suggestedPrice) * 100 : 0;
  
  const recipeOptions = recipes.map((recipe) => ({
    value: recipe.id,
    label: recipe.name,
  }));
  
  const onFormSubmit = (data: GeladinhoFormData) => {
    // Convert numeric strings to numbers
    const formattedData = {
      ...data,
      profit_margin: Number(data.profit_margin),
      prepTime: data.prepTime ? Number(data.prepTime) : undefined,
      freezingTemp: data.freezingTemp ? Number(data.freezingTemp) : undefined,
    };
    
    onSubmit(formattedData);
  };

  return (
    <Card className="max-w-3xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Geladinho' : 'Novo Geladinho'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Edite as informações do geladinho cadastrado'
              : 'Configure um novo geladinho com base em uma receita existente'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Geladinho"
              placeholder="Ex: Morango Cremoso"
              leftIcon={<IceCream size={18} />}
              {...register('name', {
                required: 'Nome do geladinho é obrigatório',
                maxLength: {
                  value: 80,
                  message: 'O nome não pode ter mais de 80 caracteres',
                },
              })}
              error={errors.name?.message}
            />
            
            <Select
              label="Receita Base"
              options={recipeOptions}
              {...register('recipeId', {
                required: 'Receita é obrigatória',
              })}
              error={errors.recipeId?.message}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Categoria"
              options={categoryOptions}
              leftIcon={<Tag size={18} />}
              {...register('category', {
                required: 'Categoria é obrigatória',
              })}
              error={errors.category?.message}
            />
            
            <Input
              label="Margem de Lucro (%)"
              type="number"
              min="0"
              max="1000"
              step="1"
              leftIcon={<Percent size={18} />}
              {...register('profit_margin', {
                required: 'Margem é obrigatória',
                min: {
                  value: 0,
                  message: 'A margem não pode ser negativa',
                },
                max: {
                  value: 1000,
                  message: 'A margem não pode exceder 1000%',
                },
                valueAsNumber: true,
              })}
              error={errors.profit_margin?.message}
            />
            
            <Select
              label="Status"
              options={statusOptions}
              {...register('status', {
                required: 'Status é obrigatório',
              })}
              error={errors.status?.message}
            />
          </div>
          
          {selectedRecipe && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Informações de Precificação</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Custo por Unidade</div>
                  <div className="font-medium text-gray-900">{formatCurrency(unitCost)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Preço de Venda Sugerido</div>
                  <div className="font-bold text-primary-600">{formatCurrency(suggestedPrice)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Lucro por Unidade</div>
                  <div className="font-medium text-success-600">{formatCurrency(unitProfit)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Margem Real</div>
                  <div className="font-medium text-gray-900">{realMargin.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}
          
          <h3 className="text-sm font-medium text-gray-700">Informações Adicionais (Opcional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Descrição"
              placeholder="Ex: Um delicioso geladinho com polpa natural..."
              leftIcon={<FileText size={18} />}
              {...register('description', {
                maxLength: {
                  value: 200,
                  message: 'A descrição não pode ter mais de 200 caracteres',
                },
              })}
              error={errors.description?.message}
            />
            
            <Input
              label="URL da Imagem"
              placeholder="https://example.com/image.jpg"
              leftIcon={<Image size={18} />}
              {...register('image_url')}
              error={errors.image_url?.message}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Tempo de Preparo (min)"
              type="number"
              min="1"
              placeholder="Ex: 30"
              leftIcon={<Clock size={18} />}
              {...register('prepTime', {
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: 'O tempo deve ser positivo',
                },
              })}
              error={errors.prepTime?.message}
            />
            
            <Input
              label="Temperatura (°C)"
              type="number"
              max="0"
              placeholder="Ex: -18"
              leftIcon={<Thermometer size={18} />}
              {...register('freezingTemp', {
                valueAsNumber: true,
                max: {
                  value: 0,
                  message: 'A temperatura deve ser negativa ou zero',
                },
              })}
              error={errors.freezingTemp?.message}
            />
          </div>
          
          <div className="w-full">
            <Input
              label="Observações Especiais"
              placeholder="Informações adicionais sobre o preparo, armazenamento, etc."
              {...register('notes')}
              error={errors.notes?.message}
            />
          </div>
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
              disabled={!selectedRecipe}
            >
              {isEditing ? 'Atualizar' : 'Salvar'} Geladinho
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};