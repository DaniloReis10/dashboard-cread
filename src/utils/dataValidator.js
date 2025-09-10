export const validateApiResponse = (response, endpoint) => {
  if (!response) {
    throw new Error(`Invalid or empty response from ${endpoint}`);
  }
  
  // A API atual retorna diretamente um array de dados.
  // Esta validação foi ajustada para refletir o formato real da API.
  if (!Array.isArray(response)) {
    // Se a API retornar um objeto com uma chave 'error', lança o erro.
    if (response.error) {
        throw new Error(`API Error from ${endpoint}: ${response.error}`);
    }
    throw new Error(`Expected an array in the response from ${endpoint}, but received type ${typeof response}`);
  }
  
  // Valida se cada item no array tem as propriedades 'name' e 'value'.
  return response.every(item => 
    typeof item.name === 'string' && 
    typeof item.value === 'number'
  );
};