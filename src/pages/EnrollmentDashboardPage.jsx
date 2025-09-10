import React from 'react';
import { AreaChartCard } from '../components/charts/AreaChartCard';
import { MapChartLeaflet } from '../components/charts/MapChartLeaflet';
import { ChoroplethMapLeaflet } from '../components/charts/ChoroplethMapLeaflet';
import { ChoroplethMapBrazilLeaflet } from '../components/charts/ChoroplethMapBrazilLeaflet';

export const EnrollmentDashboardPage = () => {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-dark dark:text-dark-text-primary">
          Análise de Matrículas e Ofertas
        </h1>
        <p className="text-slate-600 dark:text-dark-text-secondary mt-1">
          Evolução anual e distribuição geográfica de estudantes.
        </p>
      </header>
      
      <main className="flex flex-col gap-8">
        <AreaChartCard 
          title="Evolução de Matrículas por Ano" 
          endpoint="/enrollments/total_yearly" 
        />
        
        <MapChartLeaflet 
            title="Matrículas por Polos (CE)" 
            endpoint="/enrollments/by_polo_yearly"
        />

        <ChoroplethMapLeaflet 
            title="Matrículas por Município (CE)" 
            endpoint="/enrollments/by_location?typelocal=municipio"
        />

        <ChoroplethMapBrazilLeaflet 
            title="Matrículas por Estado" 
            endpoint="/enrollments/by_location?typelocal=estado" 
        />
      </main>
    </div>
  );
};