import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { RecipeForm, RecipeFormData } from '../components/recipes/RecipeForm';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const RecipeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes, addRecipe, updateRecipe, deleteRecipe, getRecipe } = useStore();
  
  const isEditing = Boolean(id);
  const recipe = id ? getRecipe(id) : undefined;
  
  const handleSubmit = (data: RecipeFormData) => {
    if (isEditing && id) {
      updateRecipe(id, data);
    } else {
      addRecipe(data);
    }
    navigate('/receitas');
  };
  
  const handleDelete = () => {
    if (id) {
      deleteRecipe(id);
      navigate('/receitas');
    }
  };
  
  if (isEditing && !recipe) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-2">Receita não encontrada</h2>
        <p className="text-gray-500 mb-6">A receita que você está tentando editar não existe.</p>
        <Button onClick={() => navigate('/receitas')}>
          Voltar para Receitas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/receitas')}
          className="mr-4"
          leftIcon={<ArrowLeft size={16} />}
        >
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Receita' : 'Nova Receita'}
        </h1>
      </div>
      
      <RecipeForm
        onSubmit={handleSubmit}
        defaultValues={recipe}
        onDelete={isEditing ? handleDelete : undefined}
        isEditing={isEditing}
      />
    </div>
  );
};