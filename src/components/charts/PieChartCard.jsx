import React from 'react';
import { useApiData } from '../../hooks/useApiData';
import { Card } from '../ui/Card';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// --- ATUALIZAÇÃO: Nova paleta de cores com melhor apelo visual ---
// Começa com o verde do IFCE e segue com cores complementares agradáveis.
const IFCE_CHART_COLORS = ['#2f9e41', '#03a9f4', '#ff9800', '#8bc34a', '#673ab7', '#ff5722'];

export const PieChartCard = ({ title, endpoint }) => {
  const { data, loading, error } = useApiData(endpoint);

  const formattedData = React.useMemo(() => {
    if (!data) return [];
    return data.map(item => ({
      name: String(item.name || 'N/A'),
      value: Number(item.value || item.total || 0)
    }));
  }, [data]);

  React.useEffect(() => {
    if (data) {
      console.log(`[Debug] Dados para "${title}":`, formattedData);
    }
  }, [title, data, formattedData]);
  
  const formatLabel = (value) => new Intl.NumberFormat('pt-BR').format(value);

  return (
    <Card className="h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>
      
      <div className="flex-grow w-full h-full relative">
        {loading && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Carregando dados...</p>}
        {error && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500">Erro: {error.message}</p>}
        
        {!loading && !error && formattedData.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {/* Usando a nova paleta de cores */}
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={IFCE_CHART_COLORS[index % IFCE_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatLabel} />
                <Legend formatter={(name) => name} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && !error && formattedData.length === 0 && (
          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Nenhum dado encontrado.</p>
        )}
      </div>
    </Card>
  );
};