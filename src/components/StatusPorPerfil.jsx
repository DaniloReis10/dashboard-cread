import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../config.js';
import { PieChart } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const StatusPorPerfil = () => {
    const [modality, setModality] = useState('');
    const [profile, setProfile] = useState('gender');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusKeys, setStatusKeys] = useState([]);

    const profileOptions = [
        { value: 'gender', label: 'Gênero' },
        { value: 'marital_status', label: 'Estado Civil' },
        { value: 'age', label: 'Faixa Etária' },
        { value: 'income', label: 'Faixa de Renda' },
        { value: 'origin_state', label: 'Estado de Origem' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setData([]);
            try {
                const modalityParam = modality ? `&modality=${modality}` : '';
                const url = `${API_BASE_URL}/analysis/status_by_profile?profile=${profile}${modalityParam}`;
                
                console.log('Buscando dados de:', url);

                const response = await fetch(url);
                if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
                
                const result = await response.json();

                if (result && typeof result === 'object' && Object.keys(result).length > 0) {
                    const firstKey = Object.keys(result)[0];
                    if (result[firstKey]) {
                        const keys = Object.keys(result[firstKey]);
                        setStatusKeys(keys);

                        const transformedData = Object.entries(result).map(([name, statuses]) => {
                            const total = Object.values(statuses).reduce((acc, value) => acc + value, 0);
                            const percentages = {};
                            for (const key in statuses) {
                                percentages[key] = total > 0 ? (statuses[key] / total) * 100 : 0;
                            }
                            return {
                                name,
                                ...percentages
                            };
                        });
                        setData(transformedData);
                    } else {
                         setStatusKeys([]);
                         setData([]);
                    }
                } else {
                    setStatusKeys([]);
                    setData([]);
                }

            } catch (e) {
                console.error("Falha na busca de dados:", e);
                setError('Falha na comunicação com o servidor.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [modality, profile]);
    
    const activeProfileLabel = profileOptions.find(p => p.value === profile)?.label || '';

    // Calcula altura dinâmica baseada no número de categorias 
    const chartHeight = Math.max(600, data.length * 100);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                 <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <PieChart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800">Análise de Status por Perfil</h1>
                    <p className="text-lg text-gray-600 mt-2">Compare as taxas de conclusão e evasão por perfil demográfico</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2">
                         <label htmlFor="profile-select" className="font-semibold text-gray-700">Analisar por:</label>
                        <select
                            id="profile-select"
                            value={profile}
                            onChange={(e) => setProfile(e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                            {profileOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex rounded-lg bg-gray-200 p-1">
                        <button 
                            onClick={() => setModality('')} 
                            className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${modality === '' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                        >
                            Todos
                        </button>
                        <button 
                            onClick={() => setModality('ead')} 
                            className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${modality === 'ead' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                        >
                            EAD
                        </button>
                    </div>
                </div>
                
                {loading && <div className="text-center py-10 text-gray-600">Carregando dados...</div>}
                {error && <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg py-10"><strong>Erro:</strong> {error}</div>}

                {!loading && !error && data.length > 0 && (
                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-gray-700 mb-6 text-center">Proporção por {activeProfileLabel}</h2>
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <BarChart 
                                data={data} 
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                                barSize={50}
                                barCategoryGap="20%"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    type="number" 
                                    domain={[0, 100]} 
                                    tickFormatter={(tick) => `${tick}%`}
                                />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    width={140}
                                />
                                <Tooltip 
                                    formatter={(value) => `${value.toFixed(1)}%`}
                                    contentStyle={{ fontSize: '14px' }}
                                />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                                {statusKeys.map((key, index) => (
                                    <Bar 
                                        key={key} 
                                        dataKey={key} 
                                        stackId="a" 
                                        fill={COLORS[index % COLORS.length]} 
                                        name={key}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
                
                 {!loading && !error && data.length === 0 && (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold">Nenhum dado encontrado</h3>
                        <p>Tente ajustar os filtros para obter resultados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusPorPerfil;