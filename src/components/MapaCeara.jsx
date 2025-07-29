import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { alunosPorMunicipio } from '../AlunosPorMunicipio';

// Função para definir a cor com base no número de alunos
const getColor = (alunos) => {
  if (alunos > 10000) return '#800026';
  if (alunos > 5000) return '#BD0026';
  if (alunos > 2000) return '#E31A1C';
  if (alunos > 1000) return '#FC4E2A';
  if (alunos > 500) return '#FD8D3C';
  return '#FEB24C';
};

// Estilo aplicado a cada município
const style = (feature) => {
  const nome = feature.properties.name || feature.properties.NM_MUN;
  const alunos = alunosPorMunicipio[nome] || 0;

  return {
    fillColor: getColor(alunos),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
};

// Evento para adicionar o tooltip em cada município
const onEachFeature = (feature, layer) => {
  const nome = feature.properties.name || feature.properties.NM_MUN;
  const alunos = alunosPorMunicipio[nome] || 0;

  layer.bindTooltip(
    `Município: ${nome}<br>Alunos matriculados: ${alunos}`,
    {
      sticky: true,
      direction: 'top',
      className: 'tooltip-municipio',
      opacity: 0.9
    }
  );
};

const Legend = () => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: 'topright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 500, 1000, 2000, 5000, 10000];
      const labels = grades.map((from, i) => {
        const to = grades[i + 1];
        const color = getColor(from + 1);
        return `<div><span style="display:inline-block;width:18px;height:18px;margin-right:8px;background:${color};border:1px solid #999"></span>${from}${to ? '&ndash;' + to : '+'}</div>`;
      });

      div.innerHTML = `<h4>Alunos matriculados</h4>${labels.join('')}`;
      return div;
    };

    legend.addTo(map);
    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

const MapaCeara = () => {
  const [geoData, setGeoData] = useState(null);
  const [anoInicial, setAnoInicial] = useState(new Date().getFullYear() - 1);
  const [anoFinal, setAnoFinal] = useState(new Date().getFullYear());
  const [curso, setCurso] = useState('Todos');

  // Carregar arquivo GeoJSON com os limites dos municípios
  useEffect(() => {
    fetch('/ceara_municipios.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Erro ao carregar GeoJSON:', err));
  }, []);

  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
        <label>
          Ano Inicial:
          <input
            type="number"
            value={anoInicial}
            onChange={(e) => setAnoInicial(Number(e.target.value))}
            style={{ marginRight: '10px', marginLeft: '5px' }}
          />
        </label>
        <label>
          Ano Final:
          <input
            type="number"
            value={anoFinal}
            onChange={(e) => setAnoFinal(Number(e.target.value))}
            style={{ marginRight: '10px', marginLeft: '5px' }}
          />
        </label>
        <label>
          Curso:
          <select
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            <option value="Todos">Todos</option>
            <option value="Informática">Informática</option>
            <option value="Administração">Administração</option>
            <option value="Enfermagem">Enfermagem</option>
            {/* Adicione outros cursos conforme necessário */}
          </select>
        </label>
      </div>

      <MapContainer center={[-5.2, -39.2]} zoom={7} style={{ height: '90vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
        <Legend />
      </MapContainer>
    </div>
  );
};

export default MapaCeara;
