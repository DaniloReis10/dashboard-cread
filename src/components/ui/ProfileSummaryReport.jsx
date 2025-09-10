import React from 'react';
import { Card } from './Card';

export const ProfileSummaryReport = ({ data, loading, profileLabel }) => {
  if (loading) return <p>Carregando relatório detalhado...</p>;
  if (!data || Object.keys(data).length === 0) return null;

  const profileCategories = Object.keys(data).sort();

  return (
    <div>
      <h3 className="text-xl font-semibold text-ifce-gray-dark dark:text-dark-text-primary mb-4">
        Relatório Detalhado por {profileLabel}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {profileCategories.map(categoryName => {
          const statuses = data[categoryName];
          const categoryTotal = Object.values(statuses).reduce((sum, val) => sum + val, 0);
          
          const concluded = statuses['Concluído'] || 0;
          const dropout = statuses['Evasão'] || 0;
          const active = statuses['Ativo'] || 0;
          const atRisk = statuses['Em Risco'] || 0;

          const concludedRate = categoryTotal > 0 ? ((concluded / categoryTotal) * 100).toFixed(1) : 0;
          const dropoutRate = categoryTotal > 0 ? ((dropout / categoryTotal) * 100).toFixed(1) : 0;

          return (
            <Card key={categoryName} className="p-4 flex flex-col">
              <h4 className="font-bold text-lg text-ifce-gray-dark dark:text-dark-text-primary">{categoryName}</h4>
              <p className="text-sm text-slate-500 dark:text-dark-text-secondary mb-3">
                Total de {categoryTotal.toLocaleString('pt-BR')} estudantes
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Concluído</span>
                  <span className="font-medium">{concluded.toLocaleString('pt-BR')} ({concludedRate}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-500">Evasão</span>
                  <span className="font-medium">{dropout.toLocaleString('pt-BR')} ({dropoutRate}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500">Ativo</span>
                  <span className="font-medium">{active.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-500">Em Risco</span>
                  <span className="font-medium">{atRisk.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};