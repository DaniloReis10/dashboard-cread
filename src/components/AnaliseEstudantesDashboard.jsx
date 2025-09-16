import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, FileText, BarChart3, PieChart, Layers, Settings, Filter, RotateCcw, Search, CheckCircle, Menu } from 'lucide-react';

const StudentDashboard = () => {
  const [filters, setFilters] = useState({
    anoInicial: '2010',
    anoFinal: '2024',
    curso: 'Todos',
    campus: 'Todos',
    modalidade: 'Todos',
    periodo: 'Todos',
    search: ''
  });

  const [activeChart, setActiveChart] = useState('Barras');

  // Dados completos do gráfico por curso e campus
  const completeData = [
    { year: '2010', value: 20, curso: 'Informática', campus: 'Fortaleza', modalidade: 'Presencial', periodo: 'Matutino' },
    { year: '2011', value: 40, curso: 'Informática', campus: 'Fortaleza', modalidade: 'Presencial', periodo: 'Matutino' },
    { year: '2012', value: 65, curso: 'Informática', campus: 'Fortaleza', modalidade: 'Presencial', periodo: 'Vespertino' },
    { year: '2013', value: 80, curso: 'Engenharia', campus: 'Maracanaú', modalidade: 'Presencial', periodo: 'Matutino' },
    { year: '2014', value: 75, curso: 'Engenharia', campus: 'Maracanaú', modalidade: 'Presencial', periodo: 'Noturno' },
    { year: '2015', value: 95, curso: 'Administração', campus: 'Caucaia', modalidade: 'EAD', periodo: 'Noturno' },
    { year: '2016', value: 130, curso: 'Informática', campus: 'Fortaleza', modalidade: 'Híbrido', periodo: 'Vespertino' },
    { year: '2017', value: 145, curso: 'Administração', campus: 'Fortaleza', modalidade: 'Presencial', periodo: 'Noturno' },
    { year: '2018', value: 170, curso: 'Engenharia', campus: 'Maracanaú', modalidade: 'Presencial', periodo: 'Matutino' },
    { year: '2019', value: 160, curso: 'Informática', campus: 'Caucaia', modalidade: 'EAD', periodo: 'Vespertino' },
    { year: '2020', value: 180, curso: 'Administração', campus: 'Fortaleza', modalidade: 'EAD', periodo: 'Noturno' },
    { year: '2021', value: 200, curso: 'Engenharia', campus: 'Maracanaú', modalidade: 'Híbrido', periodo: 'Matutino' },
    { year: '2022', value: 220, curso: 'Informática', campus: 'Fortaleza', modalidade: 'Presencial', periodo: 'Vespertino' },
    { year: '2023', value: 210, curso: 'Administração', campus: 'Caucaia', modalidade: 'EAD', periodo: 'Noturno' },
    { year: '2024', value: 240, curso: 'Informática', campus: 'Fortaleza', modalidade: 'Híbrido', periodo: 'Matutino' }
  ];

  // Função para filtrar e agrupar os dados
  const filteredData = useMemo(() => {
    let filtered = completeData.filter(item => {
      const year = parseInt(item.year);
      const anoInicial = parseInt(filters.anoInicial);
      const anoFinal = parseInt(filters.anoFinal);
      
      const yearInRange = year >= anoInicial && year <= anoFinal;
      const cursoMatch = filters.curso === 'Todos' || item.curso === filters.curso;
      const campusMatch = filters.campus === 'Todos' || item.campus === filters.campus;
      const modalidadeMatch = filters.modalidade === 'Todos' || item.modalidade === filters.modalidade;
      const periodoMatch = filters.periodo === 'Todos' || item.periodo === filters.periodo;
      
      const searchMatch = filters.search === '' || 
        item.curso.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.campus.toLowerCase().includes(filters.search.toLowerCase());
      
      return yearInRange && cursoMatch && campusMatch && modalidadeMatch && periodoMatch && searchMatch;
    });

    // Agrupa por ano e soma os valores
    const grouped = filtered.reduce((acc, item) => {
      const existing = acc.find(g => g.year === item.year);
      if (existing) {
        existing.value += item.value;
      } else {
        acc.push({ year: item.year, value: item.value });
      }
      return acc;
    }, []);

    // Ordena por ano
    return grouped.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [filters]);

  // Calcula estatísticas dinâmicas baseadas nos dados filtrados
  const dynamicStats = useMemo(() => {
    const totalStudents = filteredData.reduce((sum, item) => sum + item.value, 0);
    const avgGrowth = filteredData.length > 1 ? 
      ((filteredData[filteredData.length - 1]?.value - filteredData[0]?.value) / filteredData[0]?.value * 100).toFixed(1) : 0;
    const peakYear = filteredData.reduce((max, item) => item.value > max.value ? item : max, filteredData[0] || { year: 'N/A', value: 0 });
    const yearsSpan = filteredData.length;

    return [
      { 
        title: `${filters.anoInicial}-${filters.anoFinal}`, 
        percentage: `${avgGrowth}% crescimento médio`, 
        color: '#22c55e',
        icon: <CheckCircle className="w-6 h-6" />
      },
      { 
        title: peakYear.year, 
        percentage: `Pico: ${peakYear.value} conclusões`, 
        color: '#3b82f6',
        icon: <FileText className="w-6 h-6" />
      },
      { 
        title: filters.curso, 
        percentage: `${totalStudents} total conclusões`, 
        color: '#8b5cf6',
        icon: <BarChart3 className="w-6 h-6" />
      },
      { 
        title: `${yearsSpan} anos`, 
        percentage: `Período analisado`, 
        color: '#10b981',
        icon: <Settings className="w-6 h-6" />
      }
    ];
  }, [filteredData, filters]);

  // Função para resetar filtros
  const resetFilters = () => {
    setFilters({
      anoInicial: '2010',
      anoFinal: '2024',
      curso: 'Todos',
      campus: 'Todos',
      modalidade: 'Todos',
      periodo: 'Todos',
      search: ''
    });
  };

  // Conta filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.anoInicial !== '2010' || filters.anoFinal !== '2024') count++;
    if (filters.curso !== 'Todos') count++;
    if (filters.campus !== 'Todos') count++;
    if (filters.modalidade !== 'Todos') count++;
    if (filters.periodo !== 'Todos') count++;
    if (filters.search !== '') count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
          </div>
          <nav className="flex items-center space-x-8">
            <button className="text-gray-700 hover:text-gray-900 font-medium">Campi</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Institucional</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Acesso à Informação</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Contatos</button>
          </nav>
          <div className="flex items-center space-x-4 text-gray-600">
            <button className="hover:text-gray-900">contrast</button>
            <button className="hover:text-gray-900">🌙 dark_mode</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            Distribuição de Conclusão por Ano
          </h1>
          <p className="text-gray-600 mb-4">
            Acompanhe a distribuição de conclusão por anos específicos.
          </p>
          <button className="text-blue-500 hover:underline">
            ← Voltar para o Dashboard Principal
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Configurações e Filtros
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <button 
              onClick={resetFilters}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Restaurar
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar curso ou campus..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          
          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano Inicial 
                <span className="text-blue-600 font-normal">({filters.anoInicial})</span>
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.anoInicial}
                onChange={(e) => setFilters({...filters, anoInicial: e.target.value})}
              >
                {Array.from({length: 15}, (_, i) => 2010 + i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano Final 
                <span className="text-blue-600 font-normal">({filters.anoFinal})</span>
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.anoFinal}
                onChange={(e) => setFilters({...filters, anoFinal: e.target.value})}
              >
                {Array.from({length: 15}, (_, i) => 2010 + i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.curso}
                onChange={(e) => setFilters({...filters, curso: e.target.value})}
              >
                <option value="Todos">Todos</option>
                <option value="Informática">Informática</option>
                <option value="Engenharia">Engenharia</option>
                <option value="Administração">Administração</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.campus}
                onChange={(e) => setFilters({...filters, campus: e.target.value})}
              >
                <option value="Todos">Todos</option>
                <option value="Fortaleza">Fortaleza</option>
                <option value="Maracanaú">Maracanaú</option>
                <option value="Caucaia">Caucaia</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.modalidade}
                onChange={(e) => setFilters({...filters, modalidade: e.target.value})}
              >
                <option value="Todos">Todos</option>
                <option value="Presencial">Presencial</option>
                <option value="EAD">EAD</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.periodo}
                onChange={(e) => setFilters({...filters, periodo: e.target.value})}
              >
                <option value="Todos">Todos</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
              </select>
            </div>
          </div>

          {/* Chart Type Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Gráfico</label>
            <div className="flex space-x-2 flex-wrap">
              {[
                { name: 'Barras', icon: BarChart3 },
                { name: 'Pizza', icon: PieChart },
                { name: 'Linha', icon: FileText },
                { name: 'Área', icon: Layers },
                { name: 'Dispersão', icon: Settings },
                { name: 'Composto', icon: BarChart3 }
              ].map((type) => (
                <button
                  key={type.name}
                  onClick={() => setActiveChart(type.name)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeChart === type.name 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <input type="checkbox" id="mostrar-comparacao" className="mr-2" />
              <label htmlFor="mostrar-comparacao" className="text-sm text-gray-700">
                Mostrar Comparação
              </label>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">CSV</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-md border border-green-200">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">JSON</span>
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            Filtros ativos: {activeFiltersCount === 0 ? 'Nenhum filtro aplicado' : `${activeFiltersCount} filtro(s) aplicado(s)`}
            {filteredData.length > 0 && (
              <span className="ml-2 text-green-600">
                • {filteredData.reduce((sum, item) => sum + item.value, 0)} conclusões encontradas
              </span>
            )}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {dynamicStats.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center mr-2"
                    style={{ backgroundColor: card.color }}
                  >
                    <div className="text-white">
                      {card.icon}
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">{card.title}</div>
              <div className="text-sm text-green-600">{card.percentage}</div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Gráfico - Período: {filters.anoInicial} a {filters.anoFinal}
            </h3>
            <div className="text-sm text-gray-600">
              {filteredData.length} ano{filteredData.length !== 1 ? 's' : ''} exibido{filteredData.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {filteredData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nenhum dado encontrado</p>
                <p className="text-sm">Tente ajustar os filtros para ver mais dados</p>
              </div>
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [`${value} conclusões`, 'Total']}
                    labelFormatter={(label) => `Ano: ${label}`}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    barSize={Math.min(40, Math.max(20, 400 / filteredData.length))}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Detailed Metrics - Agora baseadas nos dados filtrados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas dos Dados Filtrados</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total de Conclusões</div>
              <div className="text-xl font-bold mb-1 text-gray-900">
                {filteredData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Período Analisado</span>
                <span className="text-sm font-medium text-green-600">
                  {filteredData.length} ano{filteredData.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Média por Ano</div>
              <div className="text-xl font-bold mb-1 text-gray-900">
                {filteredData.length > 0 ? 
                  Math.round(filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length) : 0
                }
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conclusões/Ano</span>
                <span className="text-sm font-medium text-green-600">Média</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Maior Ano</div>
              <div className="text-xl font-bold mb-1 text-gray-900">
                {filteredData.reduce((max, item) => item.value > max.value ? item : max, filteredData[0] || { year: 'N/A', value: 0 }).year}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pico</span>
                <span className="text-sm font-medium text-green-600">
                  {filteredData.reduce((max, item) => item.value > max.value ? item : max, filteredData[0] || { year: 'N/A', value: 0 }).value}
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Crescimento</div>
              <div className="text-xl font-bold mb-1 text-gray-900">
                {filteredData.length > 1 ? 
                  `${((filteredData[filteredData.length - 1]?.value - filteredData[0]?.value) / filteredData[0]?.value * 100).toFixed(1)}%` 
                  : 'N/A'
                }
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Período Total</span>
                <span className="text-sm font-medium text-green-600">
                  {filteredData.length > 1 ? 'Crescimento' : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm">
            © 2025 Dashboard de Matrículas. Dados atualizados em tempo real.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Instituto Federal de Educação, Ciência<br />
            e Tecnologia do Estado do Ceará
          </h4>
          <p className="text-sm text-gray-600 mb-1">
            Rua Jorge Dumar, 1703 - Jardim América - Fortaleza-CE
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>CEP:</strong> 60410-426
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>E-mail:</strong> reitoria@ifce.edu.br
          </p>
          <p className="text-sm text-gray-600">
            <strong>Telefone:</strong> (85) 3401 2300
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;