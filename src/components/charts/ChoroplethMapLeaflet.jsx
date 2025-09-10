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
  for (let i = 0; i < grades.length; i++) {
    const from = Math.round(grades[i]);
    const to = grades[i + 1] ? Math.round(grades[i + 1]) : '+';
    labels.push(
      `<i style="background:${colors[i + 1]}"></i> ${from.toLocaleString('pt-BR')} &ndash; ${to.toLocaleString('pt-BR')}`
    );
  }
  
  // Adiciona a faixa inicial
  labels.splice(1, 0, `<i style="background:${colors[0]}"></i> 1 &ndash; ${Math.round(grades[0]).toLocaleString('pt-BR')}`);

  legendDiv.innerHTML = labels.join('<br>');
  return legendDiv;
}

// Estilos CSS para a legenda (adicione ao seu arquivo index.css se preferir)
const legendStyle = `
  .info.legend {
    padding: 6px 8px;
    font: 14px/16px Arial, Helvetica, sans-serif;
    background: white;
    background: rgba(255,255,255,0.8);
    box-shadow: 0 0 15px rgba(0,0,0,0.2);
    border-radius: 5px;
    line-height: 18px;
    color: #555;
  }
  .info.legend i {
    width: 18px;
    height: 18px;
    float: left;
    margin-right: 8px;
    opacity: 0.7;
  }
`;

export const ChoroplethMapLeaflet = ({ title, endpoint }) => {
  const { data: apiData, loading } = useApiData(endpoint);
  const [geoJson, setGeoJson] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Busca o arquivo GeoJSON dos municípios
  useEffect(() => {
    fetch('/ceara_municipios.geojson') //
      .then(res => res.json())
      .then(data => setGeoJson(data));
  }, []);

  // Cria a escala de cores e o mapa de dados
  const { colorScale, dataMap } = useMemo(() => {
    if (!apiData || apiData.length === 0) {
      return { colorScale: () => '#EEE', dataMap: new Map() };
    }
    const scale = scaleQuantile()
      .domain(apiData.map(d => d.value))
      .range(['#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20']);
    
    const map = new Map();
    apiData.forEach(item => map.set(item.name.toUpperCase(), item.value));

    return { colorScale: scale, dataMap: map };
  }, [apiData]);

  // Função para estilizar cada município
  const styleGeoJSON = (feature) => {
    const geoName = feature.properties.NM_MUN.toUpperCase();
    const total = dataMap.get(geoName) || 0;
    return {
      fillColor: colorScale(total),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  };

  // Função para adicionar interatividade (hover)
  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const geoName = feature.properties.NM_MUN.toUpperCase();
        const total = dataMap.get(geoName) || 0;
        const content = `<strong>${geoName}</strong><br/>Matrículas: ${total.toLocaleString('pt-BR')}`;
        layer.bindTooltip(content).openTooltip();
        e.target.setStyle({ weight: 3, color: '#666', dashArray: '' });
      },
      mouseout: (e) => {
        layer.closeTooltip();
        e.target.setStyle(styleGeoJSON(feature)); // Reseta para o estilo original
      },
    });
  };
  
  // Adiciona a legenda ao mapa
  useEffect(() => {
    if (mapInstance && apiData.length > 0) {
      const legend = new L.Control({ position: 'bottomright' });
      legend.onAdd = () => Legend({ scale: colorScale, title: 'Matrículas' });
      legend.addTo(mapInstance);
      
      return () => { // Função de limpeza para remover a legenda antiga
        if (legend) {
          legend.remove();
        }
      };
    }
  }, [mapInstance, colorScale, apiData]);

  return (
    <Card className="h-[500px] flex flex-col">
      <style>{legendStyle}</style> {/* Injeta o CSS da legenda */}
      <h3 className="text-lg font-semibold text-ifce-gray-dark mb-2 p-6 pb-0">{title}</h3>
      <div className="flex-grow p-1">
        {(loading || !geoJson) && <p className="flex items-center justify-center h-full">Carregando mapa...</p>}
        {geoJson && (
          <MapContainer
            center={[-5.20, -39.5]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            ref={setMapInstance}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <GeoJSON 
              key={JSON.stringify(apiData)} // Força a re-renderização quando os dados mudam
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