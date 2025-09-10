import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useApiData } from '../../hooks/useApiData';
import { Card } from '../ui/Card';
import { scaleQuantile } from 'd3-scale';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Componente para a legenda do mapa
function Legend({ scale, title }) {
  const legendDiv = L.DomUtil.create('div', 'info legend');
  const grades = scale.quantiles();
  const colors = scale.range();

  let labels = [`<strong>${title}</strong>`];
  if (grades.length > 0) {
    // Adiciona a faixa inicial
    labels.push(`<i style="background:${colors[0]}"></i> 1 &ndash; ${Math.round(grades[0]).toLocaleString('pt-BR')}`);
    
    for (let i = 0; i < grades.length; i++) {
      const from = Math.round(grades[i]);
      const to = grades[i + 1] ? Math.round(grades[i + 1]) : '+';
      labels.push(
        `<i style="background:${colors[i + 1]}"></i> ${from.toLocaleString('pt-BR')} &ndash; ${to.toLocaleString('pt-BR')}`
      );
    }
  }

  legendDiv.innerHTML = labels.join('<br>');
  return legendDiv;
}

// Estilos CSS para a legenda
const legendStyle = `
  .info.legend { padding: 6px 8px; font: 14px/16px Arial, Helvetica, sans-serif; background: white; background: rgba(255,255,255,0.8); box-shadow: 0 0 15px rgba(0,0,0,0.2); border-radius: 5px; line-height: 18px; color: #555; }
  .info.legend i { width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; }
`;

export const ChoroplethMapBrazilLeaflet = ({ title, endpoint }) => {
  const { data: apiData, loading } = useApiData(endpoint);
  const [geoJson, setGeoJson] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    fetch('/brazil-states.geojson')
      .then(res => res.json())
      .then(data => setGeoJson(data));
  }, []);

  const { colorScale, dataMap } = useMemo(() => {
    if (!apiData || apiData.length === 0) {
      return { colorScale: () => '#EEE', dataMap: new Map() };
    }
    const scale = scaleQuantile()
      .domain(apiData.map(d => d.value))
      .range(['#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c']);
    
    const map = new Map();
    apiData.forEach(item => map.set(item.name.toUpperCase(), item.value));
    return { colorScale: scale, dataMap: map };
  }, [apiData]);

  const styleGeoJSON = (feature) => {
    const sigla = feature.properties.sigla?.toUpperCase();
    const total = dataMap.get(sigla) || 0;
    return {
      fillColor: total > 0 ? colorScale(total) : "#EEE",
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const geoName = feature.properties.nome?.toUpperCase() || 'Sem nome';
        const sigla = feature.properties.sigla?.toUpperCase();
        const total = dataMap.get(sigla) || 0;
        const content = `<strong>${geoName}</strong><br/>Matrículas: ${total.toLocaleString('pt-BR')}`;
        layer.bindTooltip(content).openTooltip();
        e.target.setStyle({ weight: 2, color: '#333' });
      },
      mouseout: (e) => {
        layer.closeTooltip();
        e.target.setStyle(styleGeoJSON(feature));
      },
    });
  };
  
  useEffect(() => {
    if (mapInstance && apiData && apiData.length > 0) {
      const legend = new L.Control({ position: 'bottomright' });
      legend.onAdd = () => Legend({ scale: colorScale, title: 'Matrículas' });
      legend.addTo(mapInstance);
      return () => { if (legend) legend.remove(); };
    }
  }, [mapInstance, colorScale, apiData]);

  return (
    <Card className="h-[500px] flex flex-col p-6">
      <style>{legendStyle}</style>
      <h3 className="text-xl font-semibold text-gray-dark dark:text-dark-text-primary">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-dark-text-secondary mb-4">Distribuição de estudantes por estado de origem</p>
      <div className="flex-grow">
        {(loading || !geoJson) && <p className="flex items-center justify-center h-full">Carregando mapa...</p>}
        {geoJson && (
          <MapContainer center={[-14, -54]} zoom={4} style={{ height: '100%', width: '100%' }} ref={setMapInstance}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
            <GeoJSON 
              key={JSON.stringify(apiData)}
              data={geoJson} 
              style={styleGeoJSON} 
              onEachFeature={onEachFeature} 
            />
          </MapContainer>
        )}
      </div>
    </Card>
  );
};