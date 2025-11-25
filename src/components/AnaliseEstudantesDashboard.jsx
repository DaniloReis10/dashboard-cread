import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, FileText, BarChart3, PieChart, Layers, Settings, Filter, RotateCcw, Search, CheckCircle } from 'lucide-react';

// >>> Ajuste aqui se o backend estiver em outro host/porta
const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// Util: monta querystring com os filtros do back
const buildQS = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  return params.toString();
};

const StudentDashboard = () => {
  const [filters, setFilters] = useState({
    anoInicial: '2010',
    anoFinal: '2024',
    curso: 'Todos',
    campus: 'Todos',
    search: '',
    // Parâmetro opcional suportado pelo back (filtra Nature of Participation quando EAD)
    // modality: 'EAD',
  });

  const [activeChart, setActiveChart] = useState('Barras');

  // Estado remoto
  const [series, setSeries] = useState([]);          // /conclusoes_ano
  const [stats, setStats] = useState(null);          // /conclusoes_ano/stats
  const [options, setOptions] = useState({           // /conclusoes_ano/meta/options
    anos: [], cursos: ['Todos'], campi: ['Todos']
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Carrega opções para os selects
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/conclusoes_ano/meta/options`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setOptions({
          anos: json.anos || [],
          cursos: json.cursos || ['Todos'],
          campi: json.campi || ['Todos'],
        });
      } catch (e) {
        // Mantém opções mínimas mesmo com erro
        setOptions((prev) => prev);
      }
    };
    loadOptions();
  }, []);

  // Carrega série e stats sempre que filtros mudarem
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const qs = buildQS(filters);

        const [seriesRes, statsRes] = await Promise.all([
          fetch(`${BASE_URL}/conclusoes_ano?${qs}`, { signal: controller.signal }),
          fetch(`${BASE_URL}/conclusoes_ano/stats?${qs}`, { signal: controller.signal }),
        ]);

        const [seriesJson, statsJson] = await Promise.all([seriesRes.json(), statsRes.json()]);
        if (seriesJson.error) throw new Error(seriesJson.error);
        if (statsJson.error) throw new Error(statsJson.error);

        // Backend retorna [{year, value}] na série (agregado por ano) :contentReference[oaicite:2]{index=2}
        setSeries(Array.isArray(seriesJson) ? seriesJson : []);
        setStats(statsJson || null);
      } catch (e) {
        if (e.name !== 'AbortError') setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [filters]);

  // Estatísticas exibidas nos cards (agora vindas do back)
  const dynamicStats = useMemo(() => {
    const total = stats?.totalStudents ?? series.reduce((s, it) => s + (it.value || 0), 0);
    const peakLabel = stats?.peakYear ?? (series[0]?.year ?? 'N/A');
    const peakValue = stats?.peakValue ?? (series[0]?.value ?? 0);
    const growth = stats?.avgGrowthPercent != null ? `${stats.avgGrowthPercent}% crescimento médio` : 'N/A';
    const yearsSpan = stats?.yearsSpan ?? series.length;

    return [
      {
        title: `${filters.anoInicial}-${filters.anoFinal}`,
        percentage: growth,
        color: '#22c55e',
        icon: <CheckCircle className="w-6 h-6" />
      },
      {
        title: peakLabel,
        percentage: `Pico: ${peakValue} conclusões`,
        color: '#3b82f6',
        icon: <FileText className="w-6 h-6" />
      },
      {
        title: filters.curso,
        percentage: `${total} total conclusões`,
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
  }, [series, stats, filters]);

  // Contagem de filtros ativos (para UX)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.anoInicial !== '2010' || filters.anoFinal !== '2024') count++;
    if (filters.curso !== 'Todos') count++;
    if (filters.campus !== 'Todos') count++;
    if (filters.search !== '') count++;
    // if (filters.modality) count++; // se usar
    return count;
  }, [filters]);

  // Export URLs com os mesmos filtros
  const qs = buildQS(filters);
  const csvUrl = `${BASE_URL}/conclusoes_ano/export/csv?${qs}`;
  const jsonUrl = `${BASE_URL}/conclusoes_ano/export/json?${qs}`;

  // Helpers de UI
  const resetFilters = () => {
    setFilters({
      anoInicial: '2010',
      anoFinal: '2024',
      curso: 'Todos',
      campus: 'Todos',
      search: '',
    });
  };

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

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
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

        {/* Filters */}
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
            <button onClick={resetFilters} className="flex items-center text-gray-500 hover:text-gray-700">
              <RotateCcw className="w-4 h-4 mr-1" />
              Restaurar
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar curso ou campus..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* Anos */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano Inicial <span className="text-blue-600 font-normal">({filters.anoInicial})</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.anoInicial}
                onChange={(e) => setFilters({ ...filters, anoInicial: e.target.value })}
              >
                {(options.anos.length ? options.anos : Array.from({ length: 15 }, (_, i) => (2010 + i).toString())).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano Final <span className="text-blue-600 font-normal">({filters.anoFinal})</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.anoFinal}
                onChange={(e) => setFilters({ ...filters, anoFinal: e.target.value })}
              >
                {(options.anos.length ? options.anos : Array.from({ length: 15 }, (_, i) => (2010 + i).toString())).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Demais filtros */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.curso}
                onChange={(e) => setFilters({ ...filters, curso: e.target.value })}
              >
                {(options.cursos || ['Todos']).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.campus}
                onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
              >
                {(options.campi || ['Todos']).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Export */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <input type="checkbox" id="mostrar-comparacao" className="mr-2" />
              <label htmlFor="mostrar-comparacao" className="text-sm text-gray-700">
                Mostrar Comparação
              </label>
            </div>
            <div className="flex space-x-3">
              <a
                href={csvUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200"
                title="Baixar CSV"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">CSV</span>
              </a>
              <a
                href={jsonUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-md border border-green-200"
                title="Baixar JSON"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">JSON</span>
              </a>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Filtros ativos: {activeFiltersCount === 0 ? 'Nenhum filtro aplicado' : `${activeFiltersCount} filtro(s) aplicado(s)`}
            {series.length > 0 && (
              <span className="ml-2 text-green-600">
                • {series.reduce((sum, item) => sum + (item.value || 0), 0)} conclusões encontradas
              </span>
            )}
          </p>

          {err && (
            <p className="mt-3 text-sm text-red-600">
              Erro ao carregar dados: {err}
            </p>
          )}
        </div>

        {/* Cards */}
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

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Gráfico - Período: {filters.anoInicial} a {filters.anoFinal}
            </h3>
            <div className="text-sm text-gray-600">
              {series.length} ano{series.length !== 1 ? 's' : ''} exibido{series.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="h-80 flex items-center justify-center text-gray-500">Carregando…</div>
          ) : series.length === 0 ? (
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
                <BarChart data={series} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value} conclusões`, 'Total']}
                    labelFormatter={(label) => `Ano: ${label}`}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={Math.min(40, Math.max(20, 400 / series.length))} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Métricas detalhadas (com base na série) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas dos Dados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total de Conclusões</div>
              <div className="text-xl font-bold mb-1 text-gray-900">
                {series.reduce((sum, item) => sum + (item.value || 0), 0).toLocaleString()}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Período Analisado</span>
                <span className="text-sm font-medium text-green-600">{series.length} ano{series.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Média por Ano</div>
              <div className="text-xl font-bold mb-1 text-gray-900">
                {series.length > 0 ? Math.round(series.reduce((s, it) => s + (it.value || 0), 0) / series.length) : 0}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conclusões/Ano</span>
                <span className="text-sm font-medium text-green-600">Média</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Maior Ano</div>
              <div className="text-xl font-bold mb-1 text-gray-900">
                {series.reduce((max, it) => (it.value > max.value ? it : max), series[0] || { year: 'N/A', value: 0 }).year}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pico</span>
                <span className="text-sm font-medium text-green-600">
                  {series.reduce((max, it) => (it.value > max.value ? it : max), series[0] || { year: 'N/A', value: 0 }).value}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Crescimento</div>
              <div className="text-xl font-bold mb-1 text-gray-900">
                {series.length > 1
                  ? `${(((series[series.length - 1].value || 0) - (series[0].value || 0)) / Math.max(1, (series[0].value || 0)) * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Período Total</span>
                <span className="text-sm font-medium text-green-600">{series.length > 1 ? 'Crescimento' : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm">
            © 2025 Dashboard de Matrículas. Dados atualizados em tempo real.
          </p>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Instituto Federal de Educação, Ciência<br />
            e Tecnologia do Estado do Ceará
          </h4>
          <p className="text-sm text-gray-600 mb-1">
            Rua Jorge Dumar, 1703 - Jardim América - Fortaleza-CE
          </p>
          <p className="text-sm text-gray-600 mb-1"><strong>CEP:</strong> 60410-426</p>
          <p className="text-sm text-gray-600 mb-1"><strong>E-mail:</strong> reitoria@ifce.edu.br</p>
          <p className="text-sm text-gray-600"><strong>Telefone:</strong> (85) 3401 2300</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;