import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Papa from 'papaparse';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [abcData, setAbcData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('menu');
  
  // Filtros globais
  const [selectedCourse, setSelectedCourse] = useState('todos');
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2025);

  // Paleta de cores verde
  const greenColors = ['#10B981', '#059669', '#1d755cff', '#344a44ff', '#064E3B', '#022C22'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Dados estudantes
      const studentsCsvData = `ID,Matricula,Ano de Ingresso,Campus,Cidade,Idade,Estado_Residencia,CPF,course_id,course_shortname
16,202112410390311,2021,GUARAMIRANGA,BATURITE,23.54,Ceará,075.369.653-38,1937.0,INTRODUÇÃO AO TURISMO
16,202112410390311,2021,GUARAMIRANGA,BATURITE,23.54,Ceará,075.369.653-38,1981.0,ASPECTOS SOCIOCULTURAIS
16,202112410390311,2021,GUARAMIRANGA,BATURITE,23.54,Ceará,075.369.653-38,2178.0,PROCEDIMENTOS ADMINISTRATIVOS
16,202112410390311,2021,GUARAMIRANGA,BATURITE,23.54,Ceará,075.369.653-38,2179.0,ASPECTOS CULTURAIS
16,202112410390311,2021,GUARAMIRANGA,BATURITE,23.54,Ceará,075.369.653-38,2317.0,LINGUAGEM E COMUNICAÇÃO
16,202112410390311,2021,GUARAMIRANGA,BATURITE,23.54,Ceará,075.369.653-38,2347.0,LEGISLAÇÃO APLICADA
16,202112410390311,2021,GUARAMIRANGA,BATURITE,23.54,Ceará,075.369.653-38,2425.0,GESTÃO FINANCEIRA
16,202112410390311,2021,GUARAMIRANGA,BATURITE,23.54,Ceará,075.369.653-38,2447.0,CRIATIVIDADE E RECREAÇÃO
34,202012410330355,2020,GUARAMIRANGA,FORTALEZA,31.47,Ceará,792.352.123-91,2367.0,CAPACITAÇÃO PROFISSIONAL
54,20242242030251,2024,GUARAMIRANGA,GUARAMIRANGA,39.83,Ceará,017.618.913-08,1993.0,ASPECTOS LEGAIS
54,20242242030251,2024,GUARAMIRANGA,GUARAMIRANGA,39.83,Ceará,017.618.913-08,1994.0,COMUNICAÇÃO E REDAÇÃO
54,20242242030251,2024,GUARAMIRANGA,GUARAMIRANGA,39.83,Ceará,017.618.913-08,1995.0,EMPREENDEDORISMO
54,20242242030251,2024,GUARAMIRANGA,GUARAMIRANGA,39.83,Ceará,017.618.913-08,1996.0,GESTÃO DE PESSOAS
54,20242242030251,2024,GUARAMIRANGA,GUARAMIRANGA,39.83,Ceará,017.618.913-08,1997.0,INGLÊS INSTRUMENTAL
54,20242242030251,2024,GUARAMIRANGA,GUARAMIRANGA,39.83,Ceará,017.618.913-08,1998.0,INTRODUÇÃO À ADMINISTRAÇÃO
54,20242242030251,2024,GUARAMIRANGA,GUARAMIRANGA,39.83,Ceará,017.618.913-08,1999.0,MATEMÁTICA BÁSICA
54,20242242030251,2024,GUARAMIRANGA,GUARAMIRANGA,39.83,Ceará,017.618.913-08,506.0,Coordenação de Curso
54,20242242030251,2024,GUARAMIRANGA,FORTALEZA,24.98,Ceará,017.618.913-08,2369.0,INFORMÁTICA APLICADA
87,20251242030001,2025,GUARAMIRANGA,FORTALEZA,24.98,Ceará,083.900.943-71,2869.0,Aspectos Legais de Gestão Empresarial
87,20251242030001,2025,GUARAMIRANGA,FORTALEZA,24.98,Ceará,083.900.943-71,2857.0,Matemática Básica e Lógica`;

      // Dados dos anos
      const yearsCsvData = `Ano de Ingresso,Frequência Absoluta,Frequência Relativa (%)
2024,6248,27.966519
2025,3125,13.987736
2023,3057,13.683362
2022,2282,10.214404
2021,1748,7.82418
2020,1389,6.217269
2019,948,4.243319
2018,724,3.240679
2017,648,2.900497
2016,426,1.906808
2015,291,1.302538
2013,262,1.172732
2014,212,0.948928
2012,199,0.890739
2011,144,0.644555
2010,118,0.528177
2008,88,0.393895
2009,82,0.367038
2007,56,0.25066
2005,44,0.196947
2006,44,0.196947
2004,41,0.183519
2003,36,0.161139
2002,25,0.111902
1995,19,0.085045
2001,18,0.080569
2000,14,0.062665
1998,14,0.062665
1996,14,0.062665
1999,12,0.053713
1997,6,0.026856
1950,2,0.008952
1977,1,0.004476
1985,1,0.004476
1984,1,0.004476
1993,1,0.004476
1994,1,0.004476`;

      // Dados ABC
      const abcCsvData = `course_shortname,Frequência Absoluta,Frequência Relativa (%),Percentual Acumulado (%),Classe ABC
5594. 2024/2 - 621100 - CAPACITAÇÃO PROFISSIONAL EM SISTEMAS EMBARCADOS,962,1.533288,1.533288,A
4987. 2024/1 - 592304 - DISCIPLINA PRÁTICA,396,0.631166,2.164454,A
4980. 2024/1 - 592305 - INTRODUÇÃO AO DESENVOLVIMENTO IOS,394,0.627979,2.792432,A
4783. 2024/1 - 583685 - INTRODUÇÃO DA ADMINISTRAÇÃO,36,0.057379,50.113961,B
6091. 2025/1 - 643529 - PROTÓTIPO DE SOFTWARE,22,0.035065,80.016257,C
4878. 2024/1 - 584457 - DESENVOLVIMENTO WEB III,1,0.001594,100.0,C`;

      const parsedStudents = Papa.parse(studentsCsvData, { header: true, dynamicTyping: true, skipEmptyLines: true });
      const parsedYears = Papa.parse(yearsCsvData, { header: true, dynamicTyping: true, skipEmptyLines: true });
      const parsedAbc = Papa.parse(abcCsvData, { header: true, dynamicTyping: true, skipEmptyLines: true });

      setStudentData(parsedStudents.data);
      setYearData(parsedYears.data);
      setAbcData(parsedAbc.data);

      const uniqueCourses = [...new Set(parsedStudents.data.map(item => item.course_shortname))].filter(Boolean);
      setCourses(uniqueCourses.sort());

      const years = parsedYears.data.map(item => item['Ano de Ingresso']).filter(Boolean).sort((a, b) => b - a);
      setAvailableYears(years);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const getFilteredYearData = () => {
    let filtered = yearData.filter(item => 
      item['Ano de Ingresso'] >= startYear && item['Ano de Ingresso'] <= endYear
    );

    if (selectedCourse !== 'todos') {
      const courseStudents = studentData.filter(student => student.course_shortname === selectedCourse);
      const courseYears = courseStudents.reduce((acc, student) => {
        const year = student['Ano de Ingresso'];
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {});

      filtered = Object.entries(courseYears)
        .filter(([year]) => year >= startYear && year <= endYear)
        .map(([year, count]) => ({
          'Ano de Ingresso': parseInt(year),
          'Frequência Absoluta': count,
          'Frequência Relativa (%)': 0
        }));
    }

    return filtered.sort((a, b) => a['Ano de Ingresso'] - b['Ano de Ingresso']);
  };

  const getAbcChartData = () => {
    const classGroups = abcData.reduce((acc, item) => {
      const classe = item['Classe ABC'];
      if (!acc[classe]) {
        acc[classe] = { classe, cursos: 0, frequencia: 0 };
      }
      acc[classe].cursos += 1;
      acc[classe].frequencia += item['Frequência Absoluta'];
      return acc;
    }, {});

    return Object.values(classGroups).sort((a, b) => a.classe.localeCompare(b.classe));
  };

  const MenuPrincipal = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Dashboard de Análise de Estudantes</h1>
          <p className="text-lg text-gray-600">Selecione uma análise para visualizar os dados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card Análise Temporal */}
          <div 
            onClick={() => setCurrentView('temporal')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500 hover:border-green-600"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Análise Temporal</h3>
              <p className="text-gray-600">Visualize a evolução de ingressos por ano com filtros de período e curso</p>
            </div>
          </div>

          {/* Card Análise ABC */}
          <div 
            onClick={() => setCurrentView('abc')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500 hover:border-green-600"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Classificação ABC</h3>
              <p className="text-gray-600">Análise de cursos por classe ABC baseada na frequência de estudantes</p>
            </div>
          </div>

          {/* Card Distribuição Geográfica */}
          <div 
            onClick={() => setCurrentView('geografica')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500 hover:border-green-600"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Distribuição Geográfica</h3>
              <p className="text-gray-600">Visualize a distribuição de estudantes por cidade e campus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AnaliseTemporalView = () => {
    const filteredData = getFilteredYearData();
    const totalStudents = filteredData.reduce((sum, item) => sum + item['Frequência Absoluta'], 0);
    const avgPerYear = Math.round(totalStudents / filteredData.length) || 0;

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Análise Temporal</h1>
            <button 
              onClick={() => setCurrentView('menu')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              ← Voltar ao Menu
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano Inicial</label>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano Final</label>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="todos">Todos os Cursos</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Total de Estudantes</h3>
              <p className="text-3xl font-bold">{totalStudents.toLocaleString()}</p>
              <p className="text-green-100 text-sm mt-1">No período selecionado</p>
            </div>
            <div className="bg-green-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Média por Ano</h3>
              <p className="text-3xl font-bold">{avgPerYear.toLocaleString()}</p>
              <p className="text-green-100 text-sm mt-1">Estudantes por ano</p>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Evolução de Ingressos por Ano {selectedCourse !== 'todos' ? `- ${selectedCourse}` : ''}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Ano de Ingresso" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [value.toLocaleString(), 'Estudantes']}
                  labelFormatter={(label) => `Ano: ${label}`}
                />
                <Bar dataKey="Frequência Absoluta" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const AnaliseAbcView = () => {
    const abcChartData = getAbcChartData();
    const classA = abcData.filter(item => item['Classe ABC'] === 'A').length;
    const classB = abcData.filter(item => item['Classe ABC'] === 'B').length;
    const classC = abcData.filter(item => item['Classe ABC'] === 'C').length;

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Classificação ABC dos Cursos</h1>
            <button 
              onClick={() => setCurrentView('menu')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              ← Voltar ao Menu
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Classe A</h3>
              <p className="text-3xl font-bold">{classA}</p>
              <p className="text-green-100 text-sm mt-1">Cursos de alta demanda</p>
            </div>
            <div className="bg-green-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Classe B</h3>
              <p className="text-3xl font-bold">{classB}</p>
              <p className="text-green-100 text-sm mt-1">Cursos de média demanda</p>
            </div>
            <div className="bg-green-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Classe C</h3>
              <p className="text-3xl font-bold">{classC}</p>
              <p className="text-green-100 text-sm mt-1">Cursos de baixa demanda</p>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribuição de Estudantes por Classe ABC</h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={abcChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ classe, percent }) => `Classe ${classe}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="frequencia"
                  nameKey="classe"
                >
                  {abcChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={greenColors[index % greenColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Estudantes']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const AnaliseGeograficaView = () => {
    const cidadeData = studentData.reduce((acc, student) => {
      const cidade = student.Cidade;
      if (cidade) {
        acc[cidade] = (acc[cidade] || 0) + 1;
      }
      return acc;
    }, {});

    const chartData = Object.entries(cidadeData).map(([cidade, count]) => ({
      cidade,
      estudantes: count
    })).sort((a, b) => b.estudantes - a.estudantes);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Distribuição Geográfica</h1>
            <button 
              onClick={() => setCurrentView('menu')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              ← Voltar ao Menu
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Total de Cidades</h3>
              <p className="text-3xl font-bold">{Object.keys(cidadeData).length}</p>
              <p className="text-green-100 text-sm mt-1">Cidades atendidas</p>
            </div>
            <div className="bg-green-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Maior Concentração</h3>
              <p className="text-3xl font-bold">{chartData[0]?.estudantes || 0}</p>
              <p className="text-green-100 text-sm mt-1">Estudantes em {chartData[0]?.cidade || 'N/A'}</p>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Estudantes por Cidade</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="cidade" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Estudantes']} />
                <Bar dataKey="estudantes" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-600">Carregando dados...</div>
      </div>
    );
  }

  // Renderização condicional baseada na view atual
  switch (currentView) {
    case 'temporal':
      return <AnaliseTemporalView />;
    case 'abc':
      return <AnaliseAbcView />;
    case 'geografica':
      return <AnaliseGeograficaView />;
    default:
      return <MenuPrincipal />;
  }
};

export default StudentDashboard;