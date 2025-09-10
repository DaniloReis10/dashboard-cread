import React, { useState, useMemo } from 'react';
import { NormalizedStackedBarChart } from '../components/charts/NormalizedStackedBarChart';
import { MetricCard } from '../components/ui/MetricCard';
import { useApiData } from '../hooks/useApiData';
import { ProfileSummaryReport } from '../components/ui/ProfileSummaryReport';
import { FiLogOut } from 'react-icons/fi';

const profileOptions = [
  { value: 'gender', label: 'Gênero' },
  { value: 'race', label: 'Etnia' },
  { value: 'marital_status', label: 'Estado Civil' },
  { value: 'income', label: 'Faixa de Renda' },
  { value: 'age', label: 'Faixa Etária' },
  { value: 'origin_state', label: 'Origem (Estado)' },
];

const GlobalSummaryWidget = ({ summary, loading }) => (
  <div>
    {loading ? <p>Calculando resumo geral...</p> : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Taxa de Conclusão (Geral)" 
          value={`${summary.concludedRate}%`}
          description={`${summary.concluded.toLocaleString('pt-BR')} de ${summary.total.toLocaleString('pt-BR')}`}
          colorClass="text-ifce-green-primary"
        />
        <MetricCard 
          title="Taxa de Evasão (Geral)" 
          value={`${summary.dropoutRate}%`}
          description={`${summary.dropout.toLocaleString('pt-BR')} de ${summary.total.toLocaleString('pt-BR')}`}
          colorClass="text-red-500"
        />
        <MetricCard 
          title="Ativos (Geral)"
          value={summary.active.toLocaleString('pt-BR')}
          colorClass="text-blue-500"
        />
        <MetricCard 
          title="Em Risco (Geral)"
          value={summary.atRisk.toLocaleString('pt-BR')}
          colorClass="text-orange-500"
        />
      </div>
    )}
  </div>
);

export const DropoutAnalysisPage = () => {
  const [profile, setProfile] = useState('gender');
  const [modality, setModality] = useState('ALL');

  const endpoint = `/analysis/status_by_profile?profile=${profile}&modality=${modality}`;
  const { data, loading, error } = useApiData(endpoint, { skipValidation: true });

  const globalSummary = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return { total: 0, concluded: 0, dropout: 0, active: 0, atRisk: 0, concludedRate: 0, dropoutRate: 0 };
    }
    let total = 0, concluded = 0, dropout = 0, active = 0, atRisk = 0;
    Object.values(data).forEach(statuses => {
      total += Object.values(statuses).reduce((sum, val) => sum + val, 0);
      concluded += statuses['Concluído'] || 0;
      dropout += statuses['Evasão'] || 0;
      active += statuses['Ativo'] || 0;
      atRisk += statuses['Em Risco'] || 0;
    });
    return {
      total, concluded, dropout, active, atRisk,
      concludedRate: total > 0 ? ((concluded / total) * 100).toFixed(1) : 0,
      dropoutRate: total > 0 ? ((dropout / total) * 100).toFixed(1) : 0,
    };
  }, [data]);

  const selectedProfileLabel = profileOptions.find(p => p.value === profile)?.label;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex items-center">
          <FiLogOut size={32} className="text-ifce-green-primary mr-3" />
          <h1 className="text-3xl font-bold text-ifce-gray-dark dark:text-dark-text-primary">Análise de Evasão e Conclusão</h1>
        </div>
        <p className="text-slate-600 dark:text-dark-text-secondary mt-1">
          Relação entre o perfil demográfico e o status dos estudantes.
        </p>
      </header>
      
      <GlobalSummaryWidget summary={globalSummary} loading={loading} />

      <div className="bg-white dark:bg-dark-card p-4 rounded-lg border border-ifce-gray-medium dark:border-dark-border shadow-sm flex items-center gap-6">
        <div>
          <label htmlFor="profile-select" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
            Analisar por Perfil
          </label>
          <select
            id="profile-select"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white dark:bg-dark-bg dark:border-dark-border"
          >
            {profileOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
            Modalidade
          </label>
          <div className="flex items-center bg-ifce-gray-light dark:bg-dark-bg rounded-md p-1">
            <button onClick={() => setModality('ALL')} className={`px-3 py-1 text-sm rounded ${modality === 'ALL' ? 'bg-ifce-green-primary text-white' : 'dark:text-dark-text-secondary'}`}>Todas</button>
            <button onClick={() => setModality('EAD')} className={`px-3 py-1 text-sm rounded ${modality === 'EAD' ? 'bg-ifce-green-primary text-white' : 'dark:text-dark-text-secondary'}`}>EAD</button>
          </div>
        </div>
      </div>

      <main className="flex flex-col gap-8">
        <NormalizedStackedBarChart
          title={`Análise Visual por ${selectedProfileLabel}`}
          data={data}
          loading={loading}
          error={error}
        />
        
        <ProfileSummaryReport
          data={data}
          loading={loading}
          profileLabel={selectedProfileLabel}
        />
      </main>
    </div>
  );
};