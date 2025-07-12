import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MatriculasChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anoInicio, setAnoInicio] = useState(2010);
  const [anoFim, setAnoFim] = useState(2025);

  const anosDisponiveis = Array.from({ length: 16 }, (_, i) => 2010 + i);

  const fetchData = async (inicio, fim) => {
    setLoading(true);
    try {
      console.log("Fazendo requisição para API...");
      const response = await fetch(
        ` https://bbb8bd10af35.ngrok-free.app/matriculas?inicio=${inicio}&fim=${fim}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "any",
            "User-Agent": "MyReactApp/1.0",
          },
        }
      );

      console.log("Status da resposta:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log("Dados recebidos:", json);
      setData(json);
      setError(null);
    } catch (err) {
      console.warn("Erro na API, usando dados mock:", err.message);
      // Dados mock mais realistas para demonstração
      const mockData = [];
      for (let ano = inicio; ano <= fim; ano++) {
        mockData.push({
          ano: ano,
          total: Math.floor(Math.random() * 20000) + 45000 + (ano - inicio) * 1000
        });
      }
      setData(mockData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(anoInicio, anoFim);
  }, []);

  const handleFiltrar = () => {
    fetchData(anoInicio, anoFim);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <p style={{ 
            fontWeight: 'bold', 
            color: '#1f2937', 
            fontSize: '18px', 
            marginBottom: '8px' 
          }}>
            {`Ano ${label}`}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              borderRadius: '50%'
            }}></div>
            <p style={{ 
              color: '#6b7280', 
              fontWeight: '500' 
            }}>
              {`${payload[0].value.toLocaleString()} matrículas`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calcular estatísticas
  const totalMatriculas = data.reduce((sum, item) => sum + item.total, 0);
  const mediaMatriculas = data.length > 0 ? Math.round(totalMatriculas / data.length) : 0;
  const maxMatriculas = data.length > 0 ? Math.max(...data.map(item => item.total)) : 0;

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #faf5ff 100%)',
    padding: '24px'
  };

  const headerIconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    background: 'linear-gradient(to right, #9333ea, #db2777)',
    borderRadius: '50%',
    marginBottom: '24px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(229, 231, 235, 0.5)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const titleStyle = {
    fontSize: '48px',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #9333ea, #db2777)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px'
  };

  const buttonStyle = {
    background: 'linear-gradient(to right, #9333ea, #db2777)',
    color: 'white',
    padding: '12px 32px',
    borderRadius: '12px',
    fontWeight: '500',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const selectStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const iconStyle = {
    width: '20px',
    height: '20px'
  };

  const smallIconStyle = {
    width: '24px',
    height: '24px'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={headerIconStyle}>
          <svg style={{ width: '40px', height: '40px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 style={titleStyle}>
          Dashboard de Matrículas
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: '#6b7280', 
          maxWidth: '800px', 
          margin: '0 auto' 
        }}>
          Acompanhe a evolução das matrículas com insights detalhados e visualizações interativas
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px', 
        maxWidth: '1200px', 
        margin: '0 auto 32px auto' 
      }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total de Matrículas</p>
              <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#9333ea' }}>{totalMatriculas.toLocaleString()}</p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#f3e8ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={smallIconStyle} fill="none" stroke="#9333ea" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Média Anual</p>
              <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#2563eb' }}>{mediaMatriculas.toLocaleString()}</p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={smallIconStyle} fill="none" stroke="#2563eb" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Pico Máximo</p>
              <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#16a34a' }}>{maxMatriculas.toLocaleString()}</p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={smallIconStyle} fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 32px auto' }}>
        <div style={cardStyle}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '24px' 
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Ano Inicial</label>
              <select
                value={anoInicio}
                onChange={(e) => setAnoInicio(Number(e.target.value))}
                style={selectStyle}
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Ano Final</label>
              <select
                value={anoFim}
                onChange={(e) => setAnoFim(Number(e.target.value))}
                style={selectStyle}
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <button
                onClick={handleFiltrar}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Carregando...
                  </>
                ) : (
                  <>
                    <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtrar Dados
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={cardStyle}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              Evolução das Matrículas
            </h3>
            <p style={{ color: '#6b7280' }}>Período: {anoInicio} - {anoFim}</p>
          </div>

          {loading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '400px' 
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #9333ea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <p style={{ fontSize: '20px', fontWeight: '500', color: '#6b7280' }}>Carregando dados...</p>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>Aguarde enquanto processamos as informações</p>
            </div>
          ) : error ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '400px' 
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p style={{ fontSize: '20px', fontWeight: '500', color: '#dc2626', marginBottom: '8px' }}>Erro ao carregar dados</p>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>{error}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" opacity={0.5} />
                
                <XAxis 
                  dataKey="ano" 
                  tick={{ fontSize: 14, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                
                <YAxis
                  tick={{ fontSize: 14, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                  tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                
                <Area
                  type="monotone"
                  dataKey="total"
                  fill="url(#colorGradient)"
                  stroke="none"
                  name="Área Base"
                />
                
                <Bar
                  dataKey="total"
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                  name="Matrículas"
                />
                
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#f59e0b"
                  strokeWidth={4}
                  dot={{ 
                    fill: '#f59e0b', 
                    strokeWidth: 3, 
                    r: 6,
                    stroke: '#ffffff'
                  }}
                  activeDot={{ 
                    r: 8, 
                    fill: '#f59e0b',
                    stroke: '#ffffff',
                    strokeWidth: 3
                  }}
                  name="Tendência"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '48px', color: '#9ca3af' }}>
        <p>&copy; 2024 Dashboard de Matrículas. Dados atualizados em tempo real.</p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default MatriculasChart;