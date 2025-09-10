import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Função para normalizar texto para usar como chave nos mapeamentos de cor
const normalizeText = (text) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
};

const STATUS_COLORS = {
  'CONCLUIDO': '#2f9e41',
  'EVADIDO': '#ef4444',
  'ATIVO': '#03a9f4',
  'EM RISCO': '#ff9800',
  'default': '#9e9e9e'
};

const getStatusColor = (status) => STATUS_COLORS[normalizeText(status)] || STATUS_COLORS.default;

// --- ATUALIZAÇÃO: O componente agora recebe 'data', 'loading' e 'error' como props ---
export const NormalizedStackedBarChart = ({ title, data, loading, error }) => {
  const { chartData, statusKeys } = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return { chartData: [], statusKeys: [] };

    const allStatusKeys = new Set();
    const formattedData = Object.entries(data).map(([profileCategory, statuses]) => {
      let total = 0;
      Object.values(statuses).forEach(value => (total += value));
      
      const percentages = {};
      Object.entries(statuses).forEach(([status, value]) => {
        allStatusKeys.add(status);
        percentages[status] = total > 0 ? (value / total) * 100 : 0;
      });
      
      return { name: profileCategory, ...percentages };
    });

    const sortedKeys = Array.from(allStatusKeys).sort((a, b) => {
      const order = ['Concluído', 'Ativo', 'Em Risco', 'Evasão'];
      return order.indexOf(a) - order.indexOf(b);
    });

    return { chartData: formattedData, statusKeys: sortedKeys };
  }, [data]);

  const renderTooltipContent = (props) => {
    const { payload, label } = props;
    if (!payload || payload.length === 0) return null;

    return (
      <div className="bg-white p-3 shadow-md rounded border border-gray-200">
        <p className="font-semibold mb-2">{label}</p>
        {payload.slice().reverse().map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toFixed(1)}%`}
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card className="min-h-[500px] flex flex-col p-6">
      <h3 className="text-xl font-semibold text-ifce-gray-dark">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">Comparativo proporcional de status por perfil</p>
      
      <div className="flex-grow w-full h-full relative">
        {loading && <p className="absolute inset-0 flex items-center justify-center">Carregando dados...</p>}
        {error && <p className="absolute inset-0 flex items-center justify-center text-red-500">Erro: {error.message}</p>}
        
        {!loading && !error && chartData.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                <YAxis type="category" dataKey="name" width={120} interval={0} />
                <Tooltip content={renderTooltipContent} />
                <Legend />
                {statusKeys.map((status) => (
                  <Bar 
                    key={status} 
                    dataKey={status} 
                    stackId="a" 
                    fill={getStatusColor(status)} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {!loading && !error && chartData.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center">Nenhum dado encontrado para os filtros selecionados.</p>
        )}
      </div>
    </Card>
  );
};