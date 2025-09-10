import React from 'react';
import { useApiData } from '../../hooks/useApiData';
import { Card } from '../ui/Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useUI } from '../../context/UIContext';

export const AreaChartCard = ({ title, endpoint }) => {
  const { data, loading, error } = useApiData(endpoint);
  const { theme } = useUI(); // Para ajustar as cores do gráfico com o tema

  const formattedData = React.useMemo(() => {
    if (!data) return [];
    return data.map(item => ({
      name: String(item.name || item.ano || 'N/A'),
      value: Number(item.value || item.total || item.totalEnrollments || 0)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);
  
  return (
    <Card className="h-[400px] flex flex-col p-6">
      <h3 className="text-xl font-semibold text-ifce-gray-dark dark:text-dark-text-primary">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-dark-text-secondary mb-4">Evolução anual do número de matrículas</p>
      <div className="flex-grow w-full h-full relative">
        {!loading && !error && formattedData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f9e41" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2f9e41" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e0e0e0' : '#4a5568'} />
              <XAxis dataKey="name" stroke={theme === 'light' ? '#424242' : '#a0aec0'} />
              <YAxis stroke={theme === 'light' ? '#424242' : '#a0aec0'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'light' ? '#ffffff' : '#2d3748',
                  borderColor: theme === 'light' ? '#e0e0e0' : '#4a5568'
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#2f9e41" fillOpacity={1} fill="url(#colorValue)" name="Matrículas" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};