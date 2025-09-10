import React, { useState } from 'react';
import { PieChartCard } from '../components/charts/PieChartCard';

export const DemographicProfile = () => {
  // Estado para controlar a modalidade selecionada. 'ALL' é o valor padrão.
  const [modality, setModality] = useState('ALL');

  // Constrói a query string do parâmetro modality. Retorna uma string vazia se for 'ALL'.
  const modalityParam = modality === 'EAD' ? '?modality=EAD' : '';

  return (
    <div>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard de Análise Demográfica</h1>
          <p className="text-slate-600 mt-1">
            Análise de perfil dos estudantes — Modalidade: <span className="font-semibold">{modality === 'EAD' ? 'EAD' : 'Todas'}</span>
          </p>
        </div>
        {/* Botões para selecionar a modalidade */}
        <div className="flex items-center bg-slate-200 rounded-lg p-1">
          <button
            onClick={() => setModality('ALL')}
            className={`px-4 py-1 text-sm font-semibold rounded-md ${
              modality === 'ALL' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setModality('EAD')}
            className={`px-4 py-1 text-sm font-semibold rounded-md ${
              modality === 'EAD' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'
            }`}
          >
            EAD
          </button>
        </div>
      </header>
      
      <main className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Os endpoints agora incluem dinamicamente o parâmetro de modalidade */}
        <PieChartCard title="Gênero" endpoint={`/analysis/gender${modalityParam}`} />
        <PieChartCard title="Faixa Etária" endpoint={`/analysis/age_distribution${modalityParam}`} />
        <PieChartCard title="Estado Civil" endpoint={`/analysis/marital_status${modalityParam}`} />
        <PieChartCard title="Etnia" endpoint={`/analysis/race${modalityParam}`} />
        <PieChartCard title="Faixa de Renda" endpoint={`/analysis/income${modalityParam}`} />
        <PieChartCard title="Origem (Estado)" endpoint={`/analysis/origin_state${modalityParam}`} />
      </main>
    </div>
  );
};