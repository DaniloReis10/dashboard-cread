import React from 'react';
import { useApiData } from '../../hooks/useApiData';
import { Card } from '../ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

export const BarChartCard = ({ title, endpoint }) => {
  const { data, loading, error } = useApiData(endpoint);

  // Adapta os dados para o formato { name, value } de forma segura
  const formattedData = React.useMemo(() => {
    if (!data) return [];
    return data.map(item => ({
      name: String(item.name || item.ano || 'N/A'),
      value: Number(item.value || item.total || item.totalEnrollments || 0)
    }));
  }, [data]);

  // *** DEBUG: Adicionado para você ver os dados no console do navegador (F12) ***
  React.useEffect(() => {
    if (data) {
      console.log(`[Debug] Dados para "${title}":`, formattedData);
    }
  }, [title, data, formattedData]);

  const formatTooltipValue = (value) => new Intl.NumberFormat('pt-BR').format(value);

  return (
    <Card className="h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>

      {/* Container principal para o conteúdo do card */}
      <div className="flex-grow w-full h-full relative">
        {loading && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Carregando dados...</p>}
        {error && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500">Erro: {error.message}</p>}
        
        {/* Garante que a renderização só ocorra com dados válidos */}
        {!loading && !error && formattedData.length > 0 && (
          // *** CORREÇÃO: Posição absoluta para preencher o espaço do pai ***
          <div className="absolute top-0 left-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" height={50} interval={0} tickFormatter={(tick) => tick.substring(0, 15)} />
                <YAxis tickFormatter={formatTooltipValue} />
                <Tooltip formatter={formatTooltipValue} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Legend />
                {/* ATUALIZAÇÃO: Cor primária do IFCE aplicada aqui */}
                <Bar dataKey="value" fill="#2f9e41" name="Total" />
              </BarChart>
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