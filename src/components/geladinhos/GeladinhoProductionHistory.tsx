import React from 'react';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { GeladinhoStock } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface GeladinhoProductionHistoryProps {
  entries: GeladinhoStock[];
}

export const GeladinhoProductionHistory: React.FC<GeladinhoProductionHistoryProps> = ({
  entries,
}) => {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.batch_date).getTime() - new Date(a.batch_date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma movimentação registrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Registre a primeira produção de geladinhos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(entry.batch_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={entry.movement_type === 'entrada' ? 'success' : 'error'}
                      >
                        {entry.movement_type === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.quantity} unidades
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};