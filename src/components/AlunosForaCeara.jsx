import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { API_BASE_URL } from '../config.js';
import { Globe } from 'lucide-react';

const AlunosForaCeara = () => {
    const [modality, setModality] = useState('');
    const [data, setData] = useState({ percentage: 0, absolute: { ceara: 0, fora: 0 } });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = modality 
                    ? `${API_BASE_URL}/analysis/origin_state?modality=${modality}` 
                    : `${API_BASE_URL}/analysis/origin_state`;
                
                console.log('Buscando dados de:', url);

                const response = await fetch(url);
                if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
                
                const result = await response.json();

                if (Array.isArray(result) && result.length > 0) {
                    const foraDoCeara = result.find(item => item.name === "Fora do Ceará");
                    const ceara = result.find(item => item.name === "Ceará");

                    const foraValue = foraDoCeara ? foraDoCeara.value : 0;
                    const cearaValue = ceara ? ceara.value : 0;
                    const total = foraValue + cearaValue;
                    
                    const calculatedPercentage = total > 0 ? (foraValue / total) * 100 : 0;
                    
                    setData({
                        percentage: calculatedPercentage,
                        absolute: { ceara: cearaValue, fora: foraValue }
                    });
                } else {
                    setData({ percentage: 0, absolute: { ceara: 0, fora: 0 } });
                }

            } catch (e) {
                console.error("Falha na busca de dados:", e);
                setError('Falha na comunicação com o servidor.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [modality]);

    const pieData = [
        { name: 'Alunos do Ceará', value: data.absolute.ceara },
        { name: 'Alunos de Fora do Ceará', value: data.absolute.fora },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800">Origem dos Alunos</h1>
                    <p className="text-lg text-gray-600 mt-2">Percentual e números absolutos de alunos matriculados de fora do Ceará</p>
                </div>
                
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
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Proporção de Alunos</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                                            <Cell fill="#00C49F" />
                                            <Cell fill="#0088FE" />
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value.toLocaleString('pt-BR')} alunos`]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Legendas com percentuais e números absolutos */}
                            <div className="space-y-8">
                                <div className="text-center p-4 rounded-lg bg-green-50">
                                    <p className="text-4xl font-bold text-green-600">{(100 - data.percentage).toFixed(2)}%</p>
                                    <p className="text-gray-600">são do Ceará ({data.absolute.ceara.toLocaleString('pt-BR')})</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-blue-50">
                                    <p className="text-4xl font-bold text-blue-600">{data.percentage.toFixed(2)}%</p>
                                    <p className="text-gray-600">são de outros estados ({data.absolute.fora.toLocaleString('pt-BR')})</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlunosForaCeara;