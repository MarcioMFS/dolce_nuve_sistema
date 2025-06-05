import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <img src="/logodolcenuve.svg" alt="Dolce Nuve" className="h-24 w-24 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Painel Dolce Nuve</h1>
            <p className="text-sm text-gray-500 mt-2">Faça login para acessar o sistema</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User size={18} />}
              error={error}
            />
            <Input
              type="password"
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<KeyRound size={18} />}
              error={error}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" fullWidth>
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};