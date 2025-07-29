import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { alunosPorEstado } from '../AlunosPorEstado';

function removerAcentos(str) {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const getColor = (alunos) => {
  if (alunos > 10000) return '#800026';
  if (alunos > 5000) return '#BD0026';
  if (alunos > 2000) return '#E31A1C';
  if (alunos > 1000) return '#FC4E2A';
  if (alunos > 500) return '#FD8D3C';
  return '#FEB24C';
};

function normalizarNomeEstado(nome) {
  return removerAcentos(nome.trim().toUpperCase());
}
const style = (feature) => {
  const nomeOriginal = feature.properties.nome || feature.properties.name || feature.properties.sigla || feature.properties.NM_ESTADO;
  const nome = normalizarNomeEstado(nomeOriginal);
  const alunos = alunosPorEstado[nome] || 0;    
  return {
    fillColor: getColor(alunos),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
};

const onEachFeature = (feature, layer) => {
  const nomeOriginal = feature.properties.nome || feature.properties.name || feature.properties.sigla || feature.properties.NM_ESTADO;
  const nome = normalizarNomeEstado(nomeOriginal);
  const alunos = alunosPorEstado[nome] || 0;
  layer.bindTooltip(
    `Estado: ${nomeOriginal}<br>Alunos matriculados: ${alunos}`,
    {
      sticky: true,
      direction: 'top',
      className: 'tooltip-estado',
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
    return () => legend.remove();
  }, [map]);
  return null;
};

const MapaEstadosBrasil = () => {
  const [geoData, setGeoData] = useState(null);
  const [anoInicial, setAnoInicial] = useState(new Date().getFullYear() - 1);
  const [anoFinal, setAnoFinal] = useState(new Date().getFullYear());
  const [cursosSelecionados, setCursosSelecionados] = useState(['Todos']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cursosRef = useRef(null);

  const anosDisponiveis = Array.from({ length: 16 }, (_, i) => 2010 + i);
  const opcoesCursos = ['Informática', 'Administração', 'Enfermagem'];

  useEffect(() => {
    fetch('/brazil-states.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Erro ao carregar GeoJSON:', err));
  }, []);

  const handleCursoCheckboxChange = (curso) => {
    if (curso === 'Todos') {
      setCursosSelecionados(['Todos']);
    } else {
      let atualizados = cursosSelecionados.includes('Todos') ? [] : [...cursosSelecionados];
      if (atualizados.includes(curso)) {
        atualizados = atualizados.filter(c => c !== curso);
      } else {
        atualizados.push(curso);
      }
      if (atualizados.length === opcoesCursos.length) {
        setCursosSelecionados(['Todos']);
      } else {
        setCursosSelecionados(atualizados);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cursosRef.current && !cursosRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  


  const estados = Object.keys(alunosPorEstado);
  const totalEstados = estados.length;
  const maxAlunos = Math.max(...Object.values(alunosPorEstado));
  const minAlunos = Math.min(...Object.values(alunosPorEstado));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center py-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">Matrículas por Estados</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">Acompanhe os dados de matrículas por estado com filtros interativos.</p>
        <div className="mt-4">
          <Link to="/" className="text-blue-500 hover:underline">&larr; Voltar para o Dashboard Principal</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-6 z-20 relative">
        <div className="bg-white/70 rounded-2xl p-6 shadow border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total de Estados</p>
          <p className="text-3xl font-bold text-purple-600">{totalEstados}</p>
        </div>
        <div className="bg-white/70 rounded-2xl p-6 shadow border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Pico Máximo</p>
          <p className="text-3xl font-bold text-green-600">{maxAlunos.toLocaleString()}</p>
        </div>
        <div className="bg-white/70 rounded-2xl p-6 shadow border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Mínimo</p>
          <p className="text-3xl font-bold text-red-600">{minAlunos.toLocaleString()}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-6 px-6 z-20 relative">
        <div className="bg-white/70 rounded-2xl p-6 shadow border border-slate-200">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Ano Inicial</label>
              <select
                value={anoInicial}
                onChange={(e) => setAnoInicial(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-xl py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Ano Final</label>
              <select
                value={anoFinal}
                onChange={(e) => setAnoFinal(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-xl py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col relative" ref={cursosRef} style={{ zIndex: 1000 }}>
              <label className="text-sm font-medium text-slate-700 mb-2">Curso(s)</label>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-white border border-slate-300 rounded-xl py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {cursosSelecionados.includes('Todos') ? 'Todos os cursos' : `${cursosSelecionados.length} selecionado(s)`}
              </button>
              {dropdownOpen && (
                <div className="absolute z-50 top-full mt-2 bg-white border border-slate-300 rounded-xl shadow-lg py-2 px-4 max-h-48 overflow-y-auto space-y-1 w-64">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="Todos"
                      checked={cursosSelecionados.includes('Todos')}
                      onChange={() => handleCursoCheckboxChange('Todos')}
                    />
                    Todos
                  </label>
                  {opcoesCursos.map((curso) => (
                    <label key={curso} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={curso}
                        checked={cursosSelecionados.includes('Todos') || cursosSelecionados.includes(curso)}
                        onChange={() => handleCursoCheckboxChange(curso)}
                      />
                      {curso}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MapContainer center={[-14.235, -51.9253]} zoom={4} style={{ height: '80vh', width: '100%', zIndex: 0 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geoData && (
          <GeoJSON data={geoData} style={style} onEachFeature={onEachFeature} />
        )}
        <Legend />
      </MapContainer>
    </div>
  );
};

export default MapaEstadosBrasil;
