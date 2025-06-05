import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/layout/AuthGuard';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ProductsPage } from './pages/ProductsPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeFormPage } from './pages/RecipeFormPage';
import { GeladinhosPage } from './pages/GeladinhosPage';
import { GeladinhoFormPage } from './pages/GeladinhoFormPage';
import { ReportsPage } from './pages/ReportsPage';
import { SalesPage } from './pages/SalesPage';
import { SaleFormPage } from './pages/SaleFormPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<ProductsPage />} />
          <Route path="produtos/novo" element={<ProductFormPage />} />
          <Route path="produtos/editar/:id" element={<ProductFormPage />} />
          <Route path="receitas" element={<RecipesPage />} />
          <Route path="receitas/nova" element={<RecipeFormPage />} />
          <Route path="receitas/editar/:id" element={<RecipeFormPage />} />
          <Route path="geladinhos" element={<GeladinhosPage />} />
          <Route path="geladinhos/novo" element={<GeladinhoFormPage />} />
          <Route path="geladinhos/editar/:id" element={<GeladinhoFormPage />} />
          <Route path="vendas" element={<SalesPage />} />
          <Route path="vendas/nova" element={<SaleFormPage />} />
          <Route path="relatorios" element={<ReportsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/\" replace />} />
      </Routes>
    </Router>
  );
}

export default App;