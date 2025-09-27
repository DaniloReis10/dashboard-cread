

import { API_BASE_URL } from '../config';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ReferenceLine,
  Scatter,
  ScatterChart,
  ComposedChart,
  LabelList
} from 'recharts';
import {
  Search,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  BarChart3,
  Activity,
  Calculator,
  Brain,
  Target,
  Zap,
  RefreshCcw
} from 'lucide-react';
import * as math from 'mathjs';

// Types
interface PoloData {
  id: string;
  polo: string;
  frequenciaAbsoluta: number;
  frequenciaRelativa: number;
  year: number;
  month?: number;
  region?: string;
  coordinates?: { lat: number; lng: number };
  historicalData?: { year: number; total: number }[];
}

interface ChartData extends PoloData {
  growth?: number;
  trend?: 'up' | 'down' | 'stable';
  predicted?: number;
  residual?: number;
  zScore?: number;
}

interface StatisticalAnalysis {
  correlation: number;
  regression: {
    slope: number;
    intercept: number;
    rSquared: number;
    equation: string;
  };
  forecast: {
    next3Months: number[];
    confidence: number;
    trend: 'growing' | 'declining' | 'stable';
  };
  outliers: string[];
  clusters: {
    [key: string]: string[];
  };
}

interface FilterOptions {
  year: number;
  region: string[];
  minFrequency: number;
  maxFrequency: number;
  searchTerm: string;
  sortBy: 'polo' | 'frequenciaAbsoluta' | 'frequenciaRelativa' | 'growth' | 'predicted';
  sortOrder: 'asc' | 'desc';
}

/*// Complete CSV data integration
const CSV_DATA = [
  { polo: 'FORTALEZA', frequenciaAbsoluta: 3833, frequenciaRelativa: 16.057140463323698, region: 'Metropolitana' },
  { polo: 'JAGUARUANA', frequenciaAbsoluta: 531, frequenciaRelativa: 2.224456453437225, region: 'Jaguaribe' },
  { polo: 'CAUCAIA', frequenciaAbsoluta: 487, frequenciaRelativa: 2.040132378199489, region: 'Metropolitana' },
  { polo: 'GUARAMIRANGA', frequenciaAbsoluta: 460, frequenciaRelativa: 1.927024422939969, region: 'Maciço de Baturité' },
  { polo: 'HORIZONTE', frequenciaAbsoluta: 421, frequenciaRelativa: 1.7636462653428848, region: 'Metropolitana' },
  { polo: 'PARACURU', frequenciaAbsoluta: 304, frequenciaRelativa: 1.2735117925516317, region: 'Litoral Oeste' },
  { polo: 'ITAPIPOCA', frequenciaAbsoluta: 296, frequenciaRelativa: 1.2399983243265889, region: 'Litoral Oeste' },
  { polo: 'Baturité', frequenciaAbsoluta: 265, frequenciaRelativa: 1.1101336349545474, region: 'Maciço de Baturité' },
  { polo: 'TABULEIRO DO NORTE', frequenciaAbsoluta: 245, frequenciaRelativa: 1.0263499643919398, region: 'Baixo Jaguaribe' },
  { polo: 'LIMOEIRO DO NORTE', frequenciaAbsoluta: 238, frequenciaRelativa: 0.9970256796950275, region: 'Baixo Jaguaribe' },
  { polo: 'PECÉM', frequenciaAbsoluta: 221, frequenciaRelativa: 0.9258095597168112, region: 'Metropolitana' },
  { polo: 'BOA VIAGEM', frequenciaAbsoluta: 209, frequenciaRelativa: 0.8755393573792468, region: 'Centro Sul' },
  { polo: 'TIANGUÁ', frequenciaAbsoluta: 197, frequenciaRelativa: 0.8252691550416824, region: 'Ibiapaba' },
  { polo: 'UBAJARA', frequenciaAbsoluta: 193, frequenciaRelativa: 0.8085124209291609, region: 'Ibiapaba' },
  { polo: 'MARANGUAPE', frequenciaAbsoluta: 188, frequenciaRelativa: 0.7875665032885091, region: 'Metropolitana' },
  { polo: 'QUIXADÁ', frequenciaAbsoluta: 187, frequenciaRelativa: 0.7833773197603786, region: 'Sertão Central' },
  { polo: 'SOBRAL', frequenciaAbsoluta: 176, frequenciaRelativa: 0.7372963009509447, region: 'Norte' },
  { polo: 'CAMOCIM', frequenciaAbsoluta: 150, frequenciaRelativa: 0.628377529219555, region: 'Litoral Norte' },
  { polo: 'CEDRO', frequenciaAbsoluta: 124, frequenciaRelativa: 0.5194587574881656, region: 'Centro Sul' },
  { polo: 'ORÓS', frequenciaAbsoluta: 117, frequenciaRelativa: 0.490134472791253, region: 'Sertão Central' },
  { polo: 'IGUATÚ', frequenciaAbsoluta: 112, frequenciaRelativa: 0.46918855515060115, region: 'Centro Sul' },
  { polo: 'ACARAÚ', frequenciaAbsoluta: 102, frequenciaRelativa: 0.4272967198692974, region: 'Litoral Norte' },
  { polo: 'CAUCAIA JUREMA', frequenciaAbsoluta: 96, frequenciaRelativa: 0.4021616187005153, region: 'Metropolitana' },
  { polo: 'QUIXERAMOBIM', frequenciaAbsoluta: 93, frequenciaRelativa: 0.3895940681161242, region: 'Sertão Central' },
  { polo: 'CRATEÚS', frequenciaAbsoluta: 90, frequenciaRelativa: 0.37702651753173305, region: 'Sertão dos Inhamuns' },
  { polo: 'ARACATI', frequenciaAbsoluta: 89, frequenciaRelativa: 0.3728373340036027, region: 'Jaguaribe' },
  { polo: 'Umirim', frequenciaAbsoluta: 76, frequenciaRelativa: 0.31837794813790793, region: 'Litoral Norte' },
  { polo: 'JUAZEIRO DO NORTE', frequenciaAbsoluta: 74, frequenciaRelativa: 0.3099995810816472, region: 'Cariri' },
  { polo: 'MARACANAÚ', frequenciaAbsoluta: 73, frequenciaRelativa: 0.3058103975535168, region: 'Metropolitana' },
  { polo: 'MERUOCA', frequenciaAbsoluta: 71, frequenciaRelativa: 0.2974320304972561, region: 'Norte' },
  { polo: 'TAUÁ', frequenciaAbsoluta: 69, frequenciaRelativa: 0.2890536634409953, region: 'Sertão dos Inhamuns' },
  { polo: 'CANINDÉ', frequenciaAbsoluta: 67, frequenciaRelativa: 0.2806752963847346, region: 'Sertão Central' },
  { polo: 'SÃO GONÇALO', frequenciaAbsoluta: 64, frequenciaRelativa: 0.2681077458003435, region: 'Centro Sul' },
  { polo: 'ACOPIARA', frequenciaAbsoluta: 45, frequenciaRelativa: 0.18851325876586653, region: 'Centro Sul' },
  { polo: 'Lavras da Mangabeira', frequenciaAbsoluta: 43, frequenciaRelativa: 0.18013489170960578, region: 'Cariri' },
  { polo: 'JAGUARIBE', frequenciaAbsoluta: 21, frequenciaRelativa: 0.08797285409073771, region: 'Jaguaribe' },
  { polo: 'MORADA NOVA', frequenciaAbsoluta: 20, frequenciaRelativa: 0.08378367056260735, region: 'Baixo Jaguaribe' },
  { polo: 'MADALENA', frequenciaAbsoluta: 17, frequenciaRelativa: 0.07121611997821625, region: 'Sertão Central' },
  { polo: 'Mombaça', frequenciaAbsoluta: 15, frequenciaRelativa: 0.06283775292195551, region: 'Sertão dos Inhamuns' },
  { polo: 'PACAJÚS', frequenciaAbsoluta: 8, frequenciaRelativa: 0.03351346822504294, region: 'Metropolitana' },
  { polo: 'CAMPOS SALES', frequenciaAbsoluta: 5, frequenciaRelativa: 0.02094591764065184, region: 'Cariri' },
  { polo: 'RUSSAS', frequenciaAbsoluta: 5, frequenciaRelativa: 0.02094591764065184, region: 'Baixo Jaguaribe' },
  { polo: 'BARBALHA', frequenciaAbsoluta: 4, frequenciaRelativa: 0.01675673411252147, region: 'Cariri' },
  { polo: 'Beberibe', frequenciaAbsoluta: 4, frequenciaRelativa: 0.01675673411252147, region: 'Litoral Leste' },
  { polo: 'PORTUÁRIO', frequenciaAbsoluta: 4, frequenciaRelativa: 0.01675673411252147, region: 'Metropolitana' },
  { polo: 'MAURITI', frequenciaAbsoluta: 4, frequenciaRelativa: 0.01675673411252147, region: 'Cariri' },
  { polo: 'CRATO', frequenciaAbsoluta: 3, frequenciaRelativa: 0.012567550584391103, region: 'Cariri' },
  { polo: 'FLORIANÓPOLIS', frequenciaAbsoluta: 3, frequenciaRelativa: 0.012567550584391103, region: 'Especial' },
  { polo: 'Aracoiaba', frequenciaAbsoluta: 2, frequenciaRelativa: 0.008378367056260735, region: 'Maciço de Baturité' },
  { polo: 'LAGAMAR', frequenciaAbsoluta: 1, frequenciaRelativa: 0.0041891835281303675, region: 'Norte' }
];*/

// Statistical Analysis Functions
const performStatisticalAnalysis = (data: ChartData[]): StatisticalAnalysis => {
  const frequencies = data.map(d => d.frequenciaAbsoluta);
  const indices = data.map((_, i) => i + 1);

  // Correlation Analysis
  const correlation = calculateCorrelation(indices, frequencies);

  // Regression Analysis
  const regression = performLinearRegression(indices, frequencies);

  // Forecasting
  const forecast = generateForecast(frequencies, regression);

  // Outlier Detection using Z-Score
  const outliers = detectOutliers(data);

  // K-means clustering by frequency ranges
  const clusters = performClustering(data);

  return {
    correlation,
    regression,
    forecast,
    outliers,
    clusters
  };
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumYY = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

const performLinearRegression = (x: number[], y: number[]) => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const totalSumSquares = y.reduce((acc, yi) => acc + (yi - yMean) ** 2, 0);
  const residualSumSquares = y.reduce((acc, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return acc + (yi - predicted) ** 2;
  }, 0);
  const rSquared = 1 - (residualSumSquares / totalSumSquares);

  return {
    slope,
    intercept,
    rSquared,
    equation: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`
  };
};

const generateForecast = (data: number[], regression: any) => {
  const lastIndex = data.length;
  const next3Months = [
    regression.slope * (lastIndex + 1) + regression.intercept,
    regression.slope * (lastIndex + 2) + regression.intercept,
    regression.slope * (lastIndex + 3) + regression.intercept
  ];

  const confidence = Math.abs(regression.rSquared) * 100;
  const trend = regression.slope > 5 ? 'growing' : regression.slope < -5 ? 'declining' : 'stable';

  return {
    next3Months: next3Months.map(v => Math.max(0, Math.round(v))),
    confidence,
    trend
  };
};

const detectOutliers = (data: ChartData[]): string[] => {
  const frequencies = data.map(d => d.frequenciaAbsoluta);
  const mean = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
  const std = Math.sqrt(frequencies.reduce((acc, freq) => acc + (freq - mean) ** 2, 0) / frequencies.length);

  return data.filter(d => Math.abs(d.frequenciaAbsoluta - mean) > 2 * std).map(d => d.polo);
};

const performClustering = (data: ChartData[]) => {
  const sorted = [...data].sort((a, b) => b.frequenciaAbsoluta - a.frequenciaAbsoluta);
  const total = sorted.length;
  
  return {
    'Alto Desempenho': sorted.slice(0, Math.floor(total * 0.2)).map(d => d.polo),
    'Desempenho Médio': sorted.slice(Math.floor(total * 0.2), Math.floor(total * 0.8)).map(d => d.polo),
    'Baixo Desempenho': sorted.slice(Math.floor(total * 0.8)).map(d => d.polo)
  };
};

// --- NEW, DYNAMIC usePoloData HOOK ---
// This hook's only job is to get the raw data from the API.
const usePoloData = () => {
  // State to hold all data fetched from the API
  const [allData, setAllData] = useState<PoloData[]>([]);
  // State to track if data is currently being fetched
  const [loading, setLoading] = useState(true);
  // State to store any errors that occur during fetching
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data from your new Flask API endpoint for current enrollments
      const response = await fetch(`${API_BASE_URL}/poles/comprehensive`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const comprehensiveData = await response.json();
      setAllData(comprehensiveData);

      } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error("Failed to fetch polo data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect runs the fetchData function once when the component is first rendered
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // The hook returns the raw data, loading status, and any errors.
  return {allData, loading, error, refetch: fetchData };
};

// Data processing utilities
const processChartData = (currentViewData: PoloData[], allHistoricalData: PoloData[], comparisonYear?: number): ChartData[] => {
  const currentData = currentViewData;
  // Note: Comparison logic will not work with "Todos" selected. This is expected.
  const comparisonData = comparisonYear ? allHistoricalData.filter(item => item.year === comparisonYear) : [];

  const allFrequencies = currentData.map(d => d.frequenciaAbsoluta);
  const mean = allFrequencies.length > 0 ? allFrequencies.reduce((a, b) => a + b, 0) / allFrequencies.length : 0;
  const std = allFrequencies.length > 0 ? Math.sqrt(allFrequencies.reduce((acc, freq) => acc + (freq - mean) ** 2, 0) / allFrequencies.length) : 0;
  
  return currentData.map(current => {
    const previous = comparisonData.find(p => p.polo === current.polo);
    const growth = previous && previous.frequenciaAbsoluta > 0 ? 
      ((current.frequenciaAbsoluta - previous.frequenciaAbsoluta) / previous.frequenciaAbsoluta) * 100 : 0;
    
    const trend: 'up' | 'down' | 'stable' = 
      growth > 5 ? 'up' : growth < -5 ? 'down' : 'stable';

    // Calculate Z-score for outlier detection
    const allFrequencies = currentData.map(d => d.frequenciaAbsoluta);
    //const mean = allFrequencies.reduce((a, b) => a + b, 0) / allFrequencies.length;
    //const std = Math.sqrt(allFrequencies.reduce((acc, freq) => acc + (freq - mean) ** 2, 0) / allFrequencies.length);
    const zScore = std > 0 ? (current.frequenciaAbsoluta - mean) / std : 0;

    return {
      ...current,
      growth,
      trend,
      zScore
    };
  });
};

const calculateStatistics = (data: ChartData[]) => {
  if (data.length === 0) {
    return { total: 0, mean: 0, median: 0, max: 0, min: 0, count: 0, variance: 0, stdDev: 0, skewness: 0, kurtosis: 0 };
  }
  const frequencies = data.map(d => d.frequenciaAbsoluta);
  const total = frequencies.reduce((sum, freq) => sum + freq, 0);
  const mean = total / frequencies.length;
  const sortedFreqs = [...frequencies].sort((a, b) => a - b);
  const median = sortedFreqs[Math.floor(sortedFreqs.length / 2)];
  const max = Math.max(...frequencies);
  const min = Math.min(...frequencies);
  
  // Additional statistical measures
  const variance = frequencies.reduce((acc, freq) => acc + (freq - mean) ** 2, 0) / frequencies.length;
  const stdDev = Math.sqrt(variance);
  const skewness = frequencies.reduce((acc, freq) => acc + Math.pow((freq - mean) / stdDev, 3), 0) / frequencies.length;
  const kurtosis = frequencies.reduce((acc, freq) => acc + Math.pow((freq - mean) / stdDev, 4), 0) / frequencies.length - 3;
  
  return { total, mean, median, max, min, count: data.length, variance, stdDev, skewness, kurtosis };
};

const CustomScatterLabel = (props: any) => {
  
  const { x, y, polo, zScore } = props;

  // Only render the label if the zScore is a significant outlier
  if (zScore && Math.abs(zScore) > 1.5) {
    return (
      <text x={x} y={y} dy={-10} fill="#555" fontSize={10} textAnchor="middle">
        {polo}
      </text>
    );
  }

  return null; // Render nothing otherwise
};

// Main component
const EnhancedEADPoloChart: React.FC = () => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'area' | 'scatter' | 'composed'>('bar');
  const [showTop, setShowTop] = useState(20);
  const [comparisonYear, setComparisonYear] = useState<number | null>(2023);
  const [showComparison, setShowComparison] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [mobileView, setMobileView] = useState(false);
  
  // Initial filter values for reset functionality
  const initialFilters: FilterOptions = {
    year: 0,
    region: [],
    minFrequency: 0,
    maxFrequency: 10000,
    searchTerm: '',
    sortBy: 'frequenciaAbsoluta',
    sortOrder: 'desc'
  };

  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  // --- Use the new dynamic hook ---

  // 1. Get the raw data from our simplified hook.
  const { allData, loading, error } = usePoloData();

  // 2. Filter and sort the raw data based on UI controls.
  const filteredData = useMemo(() => {
  let dataToProcess: PoloData[];

  // Case 1: "Todos" (All Years) is selected
  if (filters.year === 0) {
    // We need to aggregate the data for each polo across all years.
    const poloMap = new Map<string, PoloData>();
    
    allData.forEach(item => {
      if (poloMap.has(item.polo)) {
        // If we've seen this polo before, add to its frequency
        const existing = poloMap.get(item.polo)!;
        existing.frequenciaAbsoluta += item.frequenciaAbsoluta;
      } else {
        // If it's a new polo, add it to our map
        poloMap.set(item.polo, { ...item, frequenciaRelativa: 0 }); // Reset relative freq
      }
    });

    dataToProcess = Array.from(poloMap.values());

    // Recalculate relative frequency for the aggregated totals
    const totalSum = dataToProcess.reduce((sum, item) => sum + item.frequenciaAbsoluta, 0);
    if (totalSum > 0) {
      dataToProcess.forEach(item => {
        item.frequenciaRelativa = (item.frequenciaAbsoluta / totalSum) * 100;
      });
    }

  } else {
    // Case 2: A specific year is selected
    dataToProcess = allData.filter(item => item.year === filters.year);
  }

  // Now, apply the search, region and sort filters to the result
  return dataToProcess
    .filter(item => 
      item.polo.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      (filters.region.length === 0 || filters.region.includes(item.region || ''))
    )
    .sort((a, b) => {
      const valA = a[filters.sortBy as keyof PoloData] as number | string;
      const valB = b[filters.sortBy as keyof PoloData] as number | string;
      if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
}, [allData, filters]); // This logic now depends on allData and the filters state

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 3. Process the filtered data for charting (slice to 'Top X', add statistics).
  const processedData = useMemo(() => 
  processChartData(filteredData, allData, comparisonYear || undefined).slice(0, showTop), 
  [filteredData, allData, comparisonYear, showTop]
);

// 4. These calculations now correctly use the processed or raw data.
  const statistics = useMemo(() => calculateStatistics(processedData), [processedData]);
  const analysis = useMemo(() => performStatisticalAnalysis(processedData), [processedData]);

  const availableYears = useMemo(() => 
  [...new Set(allData.map(d => d.year))].sort((a, b) => b - a), 
  [allData]
);

  const availableRegions = useMemo(() => 
  [...new Set(allData.map(d => d.region).filter(Boolean))], 
  [allData]
);

  // Enhanced color palette
  const colorPalette = [
    '#10b981', '#059669', '#047857', '#065f46', '#064e3b',
    '#16a34a', '#15803d', '#166534', '#14532d', '#052e16',
    '#22c55e', '#17a34a', '#13803c', '#0f652f', '#0a4d21'
  ];

  const handleExport = useCallback((format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exporting data as ${format}`);
  }, []);

  // Enhanced tooltip with statistical info
  const StatisticalTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload as ChartData;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg transform transition-all duration-200 scale-105 max-w-xs">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <p className="text-green-600 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Frequência: {payload[0].value?.toLocaleString()}
          </p>
          <p className="text-blue-600">
            Percentual: {data.frequenciaRelativa.toFixed(2)}%
          </p>
          {data.growth !== undefined && (
            <p className={`flex items-center gap-1 ${
              data.trend === 'up' ? 'text-green-600' : 
              data.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendingUp className="w-3 h-3" />
              Crescimento: {data.growth > 0 ? '+' : ''}{data.growth.toFixed(1)}%
            </p>
          )}
          {data.zScore !== undefined && (
            <p className="text-purple-600">
              Z-Score: {data.zScore.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg border-l-4 border-red-500">
          <p className="text-red-600 font-semibold mb-2">Erro ao carregar dados</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Análise dos Polos EAD
          </h1>
          <p className="text-gray-600 mb-4">
            Análise estatística completa com correlação, regressão e previsões
          </p>
          {/*{cached && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Dados em cache
            </div>
          )}*/}
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Total Polos', value: statistics.count, color: 'blue', format: (v: number) => v.toString() },
            { label: 'Total Geral', value: statistics.total, color: 'green', format: (v: number) => v.toLocaleString() },
            { label: 'Média', value: statistics.mean, color: 'yellow', format: (v: number) => v.toFixed(0) },
            { label: 'Mediana', value: statistics.median, color: 'purple', format: (v: number) => v.toLocaleString() },
            { label: 'Desvio Padrão', value: statistics.stdDev, color: 'indigo', format: (v: number) => v.toFixed(1) },
            { label: 'Correlação', value: analysis.correlation, color: 'pink', format: (v: number) => v.toFixed(3) }
          ].map(({ label, value, color, format }) => (
            <div key={label} className={`bg-white p-4 rounded-xl shadow-lg border-l-4 border-${color}-500 transform hover:scale-105 transition-all duration-200`}>
              <p className={`text-2xl font-bold text-${color}-600`}>
                {format(value)}
              </p>
              <p className="text-gray-600 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Configurações e Filtros 
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFilters(initialFilters);
                  setShowTop(20);
                  setComparisonYear(2023);
                  setShowComparison(false);
                  setChartType('bar');
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-105"
                title="Restaurar configurações iniciais"
              >
                <RefreshCcw className="w-4 h-4" />
                Restaurar
              </button>
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  showAnalysis
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Brain className="w-4 h-4" />
                Análise Estatística
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Polo</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nome do polo..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <select
                value={filters.year}
                
                onChange={(e) => {
                  //Remover: const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                  setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }));
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                {/* Add the "All Years" option */}
                <option value={0}>Todos</option>
                 
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Região</label>
              <select
                multiple
                value={filters.region}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFilters(prev => ({ ...prev, region: values }));
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                {availableRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Show Top */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mostrar Top</label>
              <select
                value={showTop}
                onChange={(e) => setShowTop(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={filteredData.length}>Todos ({filteredData.length})</option>
              </select>
            </div>
          </div>

          {/* Enhanced Chart Type Selection */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { type: 'bar', icon: BarChart3, label: 'Barras' },
              { type: 'pie', icon: Target, label: 'Pizza' },
              { type: 'line', icon: TrendingUp, label: 'Linha' },
              { type: 'area', icon: Activity, label: 'Área' },
              { type: 'scatter', icon: Zap, label: 'Dispersão' },
              { type: 'composed', icon: Calculator, label: 'Composto' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  chartType === type
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Comparison and Export Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  // ADD THIS 'disabled' PROPERTY 
                  disabled={filters.year === 0}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar Comparação</span>
              </label>
              
              {showComparison && (
                <select
                  value={comparisonYear || ''}
                  onChange={(e) => setComparisonYear(parseInt(e.target.value) || null)}
                  className="p-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">Selecione o ano</option>
                  {availableYears.filter(year => year !== filters.year).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-2">
              
            </div>
          </div>
        </div>

        {/* Statistical Analysis Panel */}
        {showAnalysis && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Análise Estatística 
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Regression Analysis */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Análise de Regressão
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Equação:</strong> {analysis.regression.equation}</p>
                  <p><strong>R²:</strong> {analysis.regression.rSquared.toFixed(4)}</p>
                  <p><strong>Correlação:</strong> {analysis.correlation.toFixed(4)}</p>
                  <div className="mt-3">
                    <div className={`w-full bg-gray-200 rounded-full h-2`}>
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.abs(analysis.regression.rSquared) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">Qualidade do Modelo: {(Math.abs(analysis.regression.rSquared) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Forecasting */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Previsões
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Tendência:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      analysis.forecast.trend === 'growing' ? 'bg-green-200 text-green-800' :
                      analysis.forecast.trend === 'declining' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {analysis.forecast.trend === 'growing' ? 'Crescimento' :
                       analysis.forecast.trend === 'declining' ? 'Declínio' : 'Estável'}
                    </span>
                  </p>
                  <p><strong>Confiança:</strong> {analysis.forecast.confidence.toFixed(1)}%</p>
                  <div className="mt-3">
                    <p className="font-medium">Próximos 3 períodos:</p>
                    {analysis.forecast.next3Months.map((value, index) => (
                      <p key={index} className="text-xs">
                        Período {index + 1}: {value.toLocaleString()}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outliers and Clustering */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Outliers e Clusters
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Outliers Detectados:</p>
                    <div className="max-h-20 overflow-y-auto">
                      {analysis.outliers.length > 0 ? analysis.outliers.map(polo => (
                        <span key={polo} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {polo}
                        </span>
                      )) : <p className="text-gray-500 text-xs">Nenhum outlier detectado</p>}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Distribuição por Performance:</p>
                    {Object.entries(analysis.clusters).map(([cluster, polos]) => (
                      <div key={cluster} className="mt-1">
                        <p className="text-xs font-medium">{cluster}: {polos.length}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <ResponsiveContainer width="100%" height={mobileView ? 400 : 600} key={JSON.stringify(filters)}>
            {chartType === 'bar' ? (
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: mobileView ? 80 : 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="polo"
                  angle={mobileView ? -90 : -45}
                  textAnchor="end"
                  height={mobileView ? 100 : 150}
                  interval={0}
                  fontSize={mobileView ? 10 : 12}
                  stroke="#666"
                />
                <YAxis stroke="#666" />
                <Tooltip content={<StatisticalTooltip />} />
                <Legend />
                <Bar 
                  dataKey="frequenciaAbsoluta"
                  fill="#10b981"
                  name="Frequência Absoluta"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationBegin={0}
                >
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                  ))}
                </Bar>
                {showAnalysis && (
                  <>
                    <ReferenceLine 
                      y={statistics.mean} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5" 
                      label="Média"
                    />
                    <ReferenceLine 
                      y={statistics.mean + statistics.stdDev} 
                      stroke="#f59e0b" 
                      strokeDasharray="3 3" 
                      label="+1σ"
                    />
                  </>
                )}
              </BarChart>
            ) : chartType === 'scatter' ? (
              <ScatterChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="zScore" 
                  type="number" 
                  name="Z-Score (Desvio da Média)"
                  domain={[-3, 3]} // Set a typical domain for Z-scores
                  stroke="#8d8a8aff"
                />
                <YAxis 
                  dataKey="frequenciaAbsoluta" 
                  type="number" 
                  name="Frequência Absoluta"
                  stroke="#818080ff"
                />
                <Tooltip content={<StatisticalTooltip />} />
                <Legend />
                <Scatter 
                  dataKey="frequenciaAbsoluta" 
                  fill="#10b981"
                  name="Polos EAD"
                >
                  <LabelList dataKey="polo" content={<CustomScatterLabel />} />
                  
                </Scatter>

                
                {/* Add reference lines to easily spot outliers */}
                <ReferenceLine x={2} stroke="red" strokeDasharray="3 3" label="Outlier (+2σ)" />
                <ReferenceLine x={-2} stroke="red" strokeDasharray="3 3" label="Outlier (-2σ)" />
              </ScatterChart>
            ) : chartType === 'composed' ? (
              <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="polo" angle={-45} textAnchor="end" height={100} fontSize={10} interval={0} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<StatisticalTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="frequenciaAbsoluta" 
                  fill="#10b981" 
                  name="Frequência Absoluta"
                  radius={[2, 2, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="frequenciaRelativa" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Frequência Relativa (%)"
                  dot={{ fill: '#ef4444', r: 4 }}
                />
              </ComposedChart>
            ) : chartType === 'line' ? (
              <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="polo" angle={-45} textAnchor="end" height={100} fontSize={10} interval={0} />
                <YAxis />
                <Tooltip content={<StatisticalTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="frequenciaAbsoluta" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 6 }}
                  activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  animationDuration={2000}
                />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="polo" angle={-45} textAnchor="end" height={100} fontSize={10} interval={0} />
                <YAxis />
                <Tooltip content={<StatisticalTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="frequenciaAbsoluta" 
                  stroke="#10b981" 
                  fill="url(#greenGradient)"
                  animationDuration={2000}
                />
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            ) : (
              <PieChart>
                <Pie
                  data={processedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ polo, frequenciaRelativa }) => 
                    frequenciaRelativa > 1 ? `${polo.slice(0, 10)}... (${frequenciaRelativa.toFixed(1)}%)` : ''
                  }
                  outerRadius={mobileView ? 120 : 200}
                  fill="#10b981"
                  dataKey="frequenciaAbsoluta"
                  animationDuration={1500}
                >
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<StatisticalTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Enhanced Comparison View */}
        {showComparison && comparisonYear && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Análise Comparativa Detalhada ({filters.year === 0 ? 'Todos os Anos' : filters.year} vs {comparisonYear})
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Growth Leaders */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Maiores Crescimentos</h4>
                <div className="space-y-2">
                  {processedData
                    .filter(d => d.growth !== undefined && d.growth > 0)
                    .sort((a, b) => (b.growth || 0) - (a.growth || 0))
                    .slice(0, 5)
                    .map(polo => (
                      <div key={polo.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 truncate">{polo.polo}</span>
                        <span className="text-green-600 font-bold text-sm">+{polo.growth?.toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Decline Leaders */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-3">Maiores Declínios</h4>
                <div className="space-y-2">
                  {processedData
                    .filter(d => d.growth !== undefined && d.growth < 0)
                    .sort((a, b) => (a.growth || 0) - (b.growth || 0))
                    .slice(0, 5)
                    .map(polo => (
                      <div key={polo.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 truncate">{polo.polo}</span>
                        <span className="text-red-600 font-bold text-sm">{polo.growth?.toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Stable Performers */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Performance Estável</h4>
                <div className="space-y-2">
                  {processedData
                    .filter(d => d.trend === 'stable')
                    .slice(0, 5)
                    .map(polo => (
                      <div key={polo.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 truncate">{polo.polo}</span>
                        <span className="text-blue-600 font-bold text-sm">{polo.growth?.toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Regional Analysis */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">Análise Regional</h4>
                <div className="space-y-2 text-sm">
                  {[...new Set(processedData.map(d => d.region).filter(Boolean))].slice(0, 5).map(region => {
                    const regionData = processedData.filter(d => d.region === region);
                    const avgGrowth = regionData.reduce((acc, d) => acc + (d.growth || 0), 0) / regionData.length;
                    return (
                      <div key={region} className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 text-xs truncate">{region}</span>
                        <span className={`font-bold text-xs ${
                          avgGrowth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {avgGrowth > 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table with Statistical Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Dados Detalhados com Métricas Estatísticas
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Polo</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Região</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Freq. Absoluta</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Freq. Relativa (%)</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Z-Score</th>
                  {showComparison && <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Crescimento (%)</th>}
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedData.map((polo, index) => (
                  <tr key={polo.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-25' : ''}`}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{polo.polo}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{polo.region}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">{polo.frequenciaAbsoluta.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">{polo.frequenciaRelativa.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      <span className={`${
                        Math.abs(polo.zScore || 0) > 2 ? 'text-red-600 font-bold' :
                        Math.abs(polo.zScore || 0) > 1 ? 'text-yellow-600 font-medium' : 'text-gray-600'
                      }`}>
                        {polo.zScore?.toFixed(2)}
                      </span>
                    </td>
                    {showComparison && (
                      <td className="px-4 py-2 text-sm text-right">
                        <span className={`${
                          polo.trend === 'up' ? 'text-green-600' :
                          polo.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        } font-medium`}>
                          {polo.growth !== undefined ? `${polo.growth > 0 ? '+' : ''}${polo.growth.toFixed(1)}%` : 'N/A'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        Math.abs(polo.zScore || 0) > 2 ? 'bg-red-100 text-red-800' :
                        polo.trend === 'up' ? 'bg-green-100 text-green-800' :
                        polo.trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {Math.abs(polo.zScore || 0) > 2 ? 'Outlier' :
                         polo.trend === 'up' ? 'Crescendo' :
                         polo.trend === 'down' ? 'Declínio' : 'Estável'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEADPoloChart;
