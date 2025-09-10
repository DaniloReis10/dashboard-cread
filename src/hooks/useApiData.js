import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../utils/apiConfig';
import { validateApiResponse } from '../utils/dataValidator';

export const useApiData = (endpoint, options = {}) => { // Adicionado o parâmetro 'options'
  const [data, setData] = useState(options.skipValidation ? {} : []); // Inicia com objeto se a validação for pulada
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Valida a estrutura da resposta da API antes de atualizar o estado.
      // --- ATUALIZAÇÃO: A validação só ocorre se 'skipValidation' não for true ---
      if (!options.skipValidation) {
        validateApiResponse(result, endpoint);
      }
      
      setData(result);
    } catch (err) {
      console.error("Failed to fetch or validate data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options.skipValidation]); // Adiciona a dependência

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Permite que o componente re-faça o fetch dos dados se necessário.
  return { data, loading, error, refetch: fetchData };
};