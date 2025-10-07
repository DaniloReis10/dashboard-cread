import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API_BASE_URL } from '../config';
import { Users } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChartCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
        <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">{title}</h2>
        {children}
    </div>
);

// Função para renderizar a porcentagem dentro do gráfico de pizza
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const PerfilGeneroEstadoCivilIdade = () => {
    const [modality, setModality] = useState('');
    const [genderData, setGenderData] = useState([]);
    const [maritalStatusData, setMaritalStatusData] = useState([]);
    const [ageDistributionData, setAgeDistributionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const modalityQuery = modality ? `?modality=${modality}` : '';
                
                const [genderRes, maritalRes, ageRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/analysis/gender${modalityQuery}`),
                    fetch(`${API_BASE_URL}/analysis/marital_status${modalityQuery}`),
                    fetch(`${API_BASE_URL}/analysis/age_distribution${modalityQuery}`)
                ]);

                if (!genderRes.ok || !maritalRes.ok || !ageRes.ok) {
                    throw new Error('Falha ao buscar um ou mais recursos de análise');
                }

                const gender = await genderRes.json();
                const marital = await maritalRes.json();
                const age = await ageRes.json();

                const filteredGender = (gender || []).filter(item => item.name && item.name.toLowerCase() !== 'indefinido');

                setGenderData(filteredGender);
                setMaritalStatusData(marital || []);
                setAgeDistributionData(age || []);

            } catch (e) {
                console.error("Falha na busca de dados:", e);
                setError('Falha na comunicação com o servidor.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [modality]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Cabeçalho */}
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800">Perfil Demográfico</h1>
                    <p className="text-lg text-gray-600 mt-2">Análise por gênero, estado civil e faixa etária</p>
                </div>

                {/* Filtros */}
                <div className="flex justify-center mb-8">
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
                
                {loading && <div className="text-center py-10">Carregando dados...</div>}
                {error && <div className="text-center text-red-500 py-10">Erro ao carregar dados: {error}</div>}
                
                {!loading && !error && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ChartCard title="Distribuição por Gênero">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie 
                                            data={genderData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={120} 
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                        >
                                            {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [value.toLocaleString('pt-BR'), name]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                            <ChartCard title="Distribuição por Estado Civil">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={maritalStatusData} layout="vertical" margin={{ left: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={80} />
                                        <Tooltip formatter={(value) => value.toLocaleString('pt-BR')} />
                                        <Bar dataKey="value" name="Quantidade" fill="#FFBB28" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                        <ChartCard title="Distribuição por Faixa Etária">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={ageDistributionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => value.toLocaleString('pt-BR')} />
                                    <Legend />
                                    <Bar dataKey="value" name="Quantidade" fill="#00C49F" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerfilGeneroEstadoCivilIdade;

