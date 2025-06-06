import { useState, useCallback } from 'react';
import { ProductWithCalculations } from '../types';

interface StockAlert {
  product: ProductWithCalculations;
  currentStock: number;
  alertLevel: 'critical' | 'low';
}

export const useStockAlerts = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const checkStockLevels = useCallback((products: ProductWithCalculations[]) => {
    const criticalThreshold = 10; // gramas
    const lowThreshold = 100; // gramas
    
    const newAlerts: StockAlert[] = [];

    products.forEach(product => {
      const currentStock = product.total_stock || 0;
      
      if (currentStock <= criticalThreshold) {
        newAlerts.push({
          product,
          currentStock,
          alertLevel: 'critical',
        });
      } else if (currentStock <= lowThreshold) {
        newAlerts.push({
          product,
          currentStock,
          alertLevel: 'low',
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(newAlerts);
      setIsModalOpen(true);
    }

    return newAlerts;
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setAlerts([]);
  }, []);

  return {
    alerts,
    isModalOpen,
    checkStockLevels,
    closeModal,
  };
};