// src/config.js

const isProduction = process.env.NODE_ENV === 'production';

const productionURL = 'https://web-production-3163.up.railway.app';
const developmentURL = 'http://127.0.0.1:5000';

// Export the correct base URL based on the environment
export const API_BASE_URL = productionURL;