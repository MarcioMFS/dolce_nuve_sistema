import React from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  Store, 
  Save,
  Upload
} from 'lucide-react';

import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { supabase } from '../../lib/supabase';

interface StockEntryFormProps {
  productId: string;
  productName: string;
  onSubmit: (data: StockEntryFormData) => void;
  onCancel: () => void;
}

export interface StockEntryFormData {
  quantity: number;
  total_cost: number;
  entry_date: string;
  supplier?: string;
  note_photo_url?: string;
}

export const StockEntryForm: React.FC<StockEntryFormProps> = ({
  productId,
  productName,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<StockEntryFormData>({
    defaultValues: {
      entry_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `notas/${productId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notas-fiscais')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = await supabase.storage
        .from('notas-fiscais')
        .getPublicUrl(filePath);

      setValue('note_photo_url', data.publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const onFormSubmit = (data: StockEntryFormData) => {
    onSubmit({
      ...data,
      quantity: Number(data.quantity),
      total_cost: Number(data.total_cost),
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardHeader>
          <CardTitle>Nova Entrada de Estoque</CardTitle>
          <CardDescription>
            Registre uma nova entrada para {productName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Quantidade (gramas)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ex: 1000"
              leftIcon={<Package size={18} />}
              {...register('quantity', {
                required: 'Quantidade é obrigatória',
                min: {
                  value: 0.01,
                  message: 'A quantidade deve ser maior que zero',
                },
                valueAsNumber: true,
              })}
              error={errors.quantity?.message}
            />
            
            <Input
              label="Valor Total Pago (R$)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ex: 7.50"
              leftIcon={<DollarSign size={18} />}
              {...register('total_cost', {
                required: 'Valor é obrigatório',
                min: {
                  value: 0.01,
                  message: 'O valor deve ser maior que zero',
                },
                valueAsNumber: true,
              })}
              error={errors.total_cost?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data da Compra"
              type="date"
              leftIcon={<Calendar size={18} />}
              {...register('entry_date', {
                required: 'Data da compra é obrigatória',
              })}
              error={errors.entry_date?.message}
            />
            
            <Input
              label="Fornecedor (Opcional)"
              placeholder="Ex: Mercado Central"
              leftIcon={<Store size={18} />}
              {...register('supplier')}
              error={errors.supplier?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto da Nota Fiscal (Opcional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="note-photo"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Fazer upload de arquivo</span>
                    <input
                      id="note-photo"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF até 10MB
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Save size={18} />}
          >
            Registrar Entrada
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};