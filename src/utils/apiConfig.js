const getApiUrl = () => {
  const environment = process.env.REACT_APP_ENVIRONMENT;
  // A URL 'http://127.0.0.1:5000' é usada como padrão para o ambiente de desenvolvimento.
  const isDevelopment = environment === 'development' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
  
  return isDevelopment 
    ? 'http://127.0.0.1:5000' 
    : process.env.REACT_APP_API_URL;
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: parseInt(process.env.REACT_APP_TIMEOUT_REQUEST) || 10000,
};