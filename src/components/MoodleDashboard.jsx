import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Activity,
  UserMinus,
  GraduationCap,
  MessageCircle,
  Monitor,
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  TrendingDown,
  Award,
  HelpCircle,
  Search,
  Filter,
  Download,
  Settings,
  Bell,
  ChevronRight,
  Eye,
  Smartphone,
  Globe,
  BookOpen
} from 'lucide-react';

const MoodleDashboard = () => {
  const [activeCategory, setActiveCategory] = useState('perfil');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const categories = [
    {
      id: 'perfil',
      title: 'Perfil e Comportamento',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'Análise demográfica e comportamental dos alunos',
      metrics: ['4.2k Alunos', '68% CE', '32% Outros Estados'],
      questions: [
        'Perfil demográfico dos alunos matriculados',
        'Percentual de alunos de fora do Ceará',
        'Taxa de conclusão por perfil de aluno',
        'Relação entre perfil demográfico e evasão'
      ]
    },
    {
      id: 'engajamento',
      title: 'Engajamento Moodle',
      icon: Activity,
      color: 'from-green-500 to-green-600',
      description: 'Padrões de uso e interação na plataforma',
      metrics: ['2.1h Média/Sessão', '18h-22h Pico', '85% Móvel'],
      questions: [
        'Horários e dias de maior acesso',
        'Recursos mais utilizados na plataforma',
        'Tempo médio de acesso por sessão',
        'Percentual de acesso nos primeiros 7/30 dias',
        'Padrões comportamentais antes da evasão'
      ]
    },
    {
      id: 'evasao',
      title: 'Evasão e Permanência',
      icon: UserMinus,
      color: 'from-red-500 to-red-600',
      description: 'Análise de abandono e fatores de risco',
      metrics: ['23% Taxa Evasão', '3ª Semana Pico', '67% Disciplinas'],
      questions: [
        'Taxa média de evasão por curso e turma',
        'Momento de maior desistência',
        'Cursos com maior taxa de evasão',
        'Correlação entre atividades não entregues',
        'Fatores associados à evasão'
      ]
    },
    {
      id: 'desempenho',
      title: 'Desempenho Acadêmico',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      description: 'Notas, aprovações e evolução acadêmica',
      metrics: ['7.2 Média Geral', '12% Reprovação', '↗ Evolução'],
      questions: [
        'Média de notas por curso/disciplina',
        'Correlação entre acesso e desempenho',
        'Taxa de reprovação por disciplina',
        'Evolução do desempenho ao longo do curso'
      ]
    },
    {
      id: 'tutoria',
      title: 'Tutoria e Mediação',
      icon: MessageCircle,
      color: 'from-orange-500 to-orange-600',
      description: 'Interações e suporte pedagógico',
      metrics: ['2.4h Resp. Média', '156 Interações', '89% Satisfação'],
      questions: [
        'Número médio de interações tutor-aluno',
        'Tempo médio de resposta dos tutores',
        'Impacto da tutoria na conclusão e evasão'
      ]
    },
    {
      id: 'tecnico',
      title: 'Aspectos Técnicos',
      icon: Monitor,
      color: 'from-gray-500 to-gray-600',
      description: 'Infraestrutura e experiência do usuário',
      metrics: ['1.2s Carregamento', '78% Chrome', '22% Problemas'],
      questions: [
        'Principais problemas técnicos reportados',
        'Dispositivos e navegadores mais usados',
        'Percentual de acessos via móvel',
        'Problemas de performance reportados'
      ]
    },
    {
        id: 'oferta',
        title: 'Perfil da Oferta',
        icon: BookOpen,
        color: 'from-yellow-500 to-yellow-600',
        description: 'Análise da oferta de cursos e matrículas',
        metrics: ['10 Cursos', '5k Matrículas', '2 Polos'],
        questions: [
          { text: 'Qual a quantidade de matrículas totais por ano', link: '/matriculas-por-ano' },
          'Como estão distribuídas por campus/polos',
          'Como estão distribuídas por cursos'
        ]
      }
  ];

  const quickStats = [
    { label: 'Total de Alunos', value: '4.247', change: '+12%', icon: Users },
    { label: 'Taxa de Conclusão', value: '77%', change: '+5%', icon: Award },
    { label: 'Cursos Ativos', value: '28', change: '+3', icon: GraduationCap },
    { label: 'Acessos Hoje', value: '1.234', change: '+8%', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Moodle Analytics</h1>
                  <p className="text-sm text-slate-600">Dashboard de Análise Educacional</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="1y">Último ano</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Categorias de Análise</h2>
                <Filter className="w-5 h-5 text-slate-500" />
              </div>

              <div className="space-y-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <category.icon className="w-5 h-5" />
                      <div className="flex-1">
                        <h3 className="font-medium">{category.title}</h3>
                        <p className={`text-sm ${activeCategory === category.id ? 'text-white/80' : 'text-slate-500'}`}>
                          {category.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {(() => {
                const category = categories.find(c => c.id === activeCategory);
                return (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color}`}>
                          <category.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{category.title}</h2>
                          <p className="text-slate-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Metrics Overview */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {category.metrics.map((metric, index) => (
                        <div key={index} className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-sm text-slate-600 mb-1">Métrica {index + 1}</p>
                          <p className="font-semibold text-slate-900">{metric}</p>
                        </div>
                      ))}
                    </div>

                    {/* Questions List */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Questões de Negócio</h3>
                      <div className="space-y-3">
                        {category.questions.map((question, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              {typeof question === 'string' ? (
                                <p className="text-slate-700">{question}</p>
                              ) : (
                                <Link to={question.link} className="text-slate-700 hover:underline">{question.text}</Link>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-slate-200">
                      <button className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r ${category.color} text-white font-medium hover:shadow-lg transition-shadow`}>
                        Explorar Análises de {category.title}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 text-left hover:bg-slate-50 rounded-lg transition-colors">
              <Search className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium text-slate-900">Buscar Aluno</p>
              <p className="text-sm text-slate-600">Localizar perfil específico</p>
            </button>
            <button className="p-4 text-left hover:bg-slate-50 rounded-lg transition-colors">
              <Download className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium text-slate-900">Exportar Dados</p>
              <p className="text-sm text-slate-600">Gerar relatórios</p>
            </button>
            <button className="p-4 text-left hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="w-6 h-6 text-orange-600 mb-2" />
              <p className="font-medium text-slate-900">Alertas</p>
              <p className="text-sm text-slate-600">Configurar notificações</p>
            </button>
            <button className="p-4 text-left hover:bg-slate-50 rounded-lg transition-colors">
              <HelpCircle className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-slate-900">Ajuda</p>
              <p className="text-sm text-slate-600">Guia de uso</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodleDashboard;
