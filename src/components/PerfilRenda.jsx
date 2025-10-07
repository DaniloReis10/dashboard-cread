import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../config';
import { DollarSign } from 'lucide-react';

const PerfilRenda = () => {
    const [modality, setModality] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = modality 
                    ? `${API_BASE_URL}/analysis/income?modality=${modality}` 
                    : `${API_BASE_URL}/analysis/income`;
                
                console.log('Buscando dados de:', url);

                const response = await fetch(url);
                if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
                
                const result = await response.json();
                setData(result || []);

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
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800">Perfil por Faixa de Renda</h1>
                    <p className="text-lg text-gray-600 mt-2">Distribuição dos alunos por faixas de renda familiar</p>
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
                    <div className="bg-white p-6 rounded-xl shadow-md">
                         <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Distribuição de Alunos por Renda</h2>
                        <ResponsiveContainer width="100%" height={500}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" name="Quantidade de Alunos" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerfilRenda;