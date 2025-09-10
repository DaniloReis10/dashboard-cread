import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useApiData } from '../../hooks/useApiData';
import { Card } from '../ui/Card';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige o problema do ícone padrão do marcador do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export const MapChartLeaflet = ({ title, endpoint }) => {
  // Usaremos o endpoint que retorna os dados anuais, pois ele já tem as coordenadas.
  const { data: yearlyPoloData, loading, error } = useApiData(endpoint);

  // O centro do mapa, focado no Ceará.
  const mapCenter = [-5.20, -39.5];

  // Processa os dados para agregar o total de matrículas por polo em todos os anos
  const aggregatePoloData = (data) => {
    if (!data || data.length === 0) return [];
    
    const poloTotals = data.reduce((acc, item) => {
      const { polo, absoluteFrequency, lat, lng } = item;
      if (lat && lng) {
        if (!acc[polo]) {
          acc[polo] = { name: polo, lat, lng, value: 0 };
        }
        acc[polo].value += absoluteFrequency;
      }
      return acc;
    }, {});
    
    return Object.values(poloTotals);
  };
  
  const aggregatedData = aggregatePoloData(yearlyPoloData);

  return (
    <Card className="h-[500px] p-0 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-700 p-6 pb-2">{title}</h3>
      <div className="flex-grow">
        {loading && <div className="flex items-center justify-center h-full"><p>Carregando mapa...</p></div>}
        {error && <div className="flex items-center justify-center h-full"><p className="text-red-500">Erro: {error.message}</p></div>}
        {aggregatedData.length > 0 && (
          <MapContainer center={mapCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {aggregatedData.map(polo => (
              <Marker key={polo.name} position={[polo.lat, polo.lng]}>
                <Popup>
                  <div className="font-semibold">{polo.name}</div>
                  <div>Matrículas: {polo.value.toLocaleString('pt-BR')}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </Card>
  );
};