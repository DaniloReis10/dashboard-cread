import React, { useMemo } from 'react';
import { useApiData } from '../../hooks/useApiData';
import { Card } from '../ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

const STATUS_COLORS = ['#2f9e41', '#ef4444', '#ff9800', '#03a9f4', '#673ab7'];

export const StackedBarChartCard = ({ title, endpoint }) => {
  // --- ATUALIZAÇÃO: Passando a opção para pular a validação do formato da resposta ---
  const { data, loading, error } = useApiData(endpoint, { skipValidation: true });

  const { chartData, statusKeys } = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return { chartData: [], statusKeys: [] };
    }

    const allStatusKeys = new Set();
    const formattedData = Object.entries(data).map(([profileCategory, statuses]) => {
      Object.keys(statuses).forEach(status => allStatusKeys.add(status));
      return {
        name: profileCategory,
        ...statuses,
      };
    });

    return { chartData: formattedData, statusKeys: Array.from(allStatusKeys) };
  }, [data]);

  return (
    <Card className="h-[550px] flex flex-col">
      <h3 className="text-lg font-semibold text-ifce-gray-dark mb-4">{title}</h3>
      <div className="flex-grow w-full h-full relative">
        {loading && <p className="absolute inset-0 flex items-center justify-center">Carregando dados...</p>}
        {error && <p className="absolute inset-0 flex items-center justify-center text-red-500">Erro: {error.message}</p>}
        
        {!loading && !error && chartData.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                {statusKeys.map((status, index) => (
                  <Bar 
                    key={status} 
                    dataKey={status} 
                    stackId="a" 
                    fill={STATUS_COLORS[index % STATUS_COLORS.length]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};