import React from 'react';
import { useStore } from '../store';
import { GeladinhoList } from '../components/geladinhos/GeladinhoList';

export const GeladinhosPage: React.FC = () => {
  const { geladinhos } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Geladinhos</h1>
      </div>
      
      <GeladinhoList geladinhos={geladinhos} />
    </div>
  );
};