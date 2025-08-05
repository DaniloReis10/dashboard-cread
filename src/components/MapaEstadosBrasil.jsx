import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const URL_BASE_API = 'https://web-production-3163.up.railway.app';
const URL_ALUNOS = `${URL_BASE_API}/studentbycities`;
const URL_YEARS = `${URL_BASE_API}/years_suap`;
const URL_COURSES = `${URL_BASE_API}/courses`;

const normalizarSigla = (sigla) => (sigla || '').trim().toLowerCase();

const getColor = (alunos, grades) => {
  if (alunos === null || alunos === undefined) return '#eeeeee';
  const cores = ['#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
  for (let i = grades.length - 1; i >= 0; i--) {
    if (alunos > grades[i]) return cores[i] || cores[0];
  }
  return cores[0];
};

const Legend = ({ grades }) => {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: 'topright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      const cores = ['#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
      const labels = grades.map((from, i) => {
        const to = grades[i + 1];
        const cor = cores[i] || cores[0];
        return `<div><span style="display:inline-block;width:18px;height:18px;margin-right:8px;background:${cor};border:1px solid #999"></span>${from}${to ? '&ndash;' + (to - 1) : '+'}</div>`;
      });
      labels.push(`<div><span style="display:inline-block;width:18px;height:18px;margin-right:8px;background:#eeeeee;border:1px solid #999"></span>Sem dados</div>`);
      div.innerHTML = `<h4>Alunos matriculados</h4>${labels.join('')}`;
      return div;
    };
    legend.addTo(map);
    return () => legend.remove();
  }, [map, grades]);
  return null;
};

const MapaEstadosBrasil = () => {
  const [geoData, setGeoData] = useState(null);
  const [anoInicial, setAnoInicial] = useState(new Date().getFullYear() - 1);
  const [anoFinal, setAnoFinal] = useState(new Date().getFullYear());
  const [cursosSelecionados, setCursosSelecionados] = useState(['Todos']);
  const [modalidade, setModalidade] = useState('EAD');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [anosDisponiveis, setAnosDisponiveis] = useState([]);
  const [opcoesCursos, setOpcoesCursos] = useState([]);
  const [alunosPorEstado, setAlunosPorEstado] = useState({});
  const [grades, setGrades] = useState([]);
  const cursosRef = useRef(null);

  useEffect(() => {
    fetch(URL_YEARS)
      .then(res => res.json())
      .then(data => {
        const years = data.map(item => item.ano);
        setAnosDisponiveis(years);
      });
  }, []);

  useEffect(() => {
    fetch(URL_COURSES)
      .then(res => res.json())
      .then(data => {
        const nomes = data.cursos.map(curso => curso.nome).sort();
        setOpcoesCursos(nomes);
      });
  }, []);

  useEffect(() => {
    fetch('/brazil-states.geojson')
      .then(res => res.json())
      .then(setGeoData);
  }, []);

  useEffect(() => {
    const cursos = cursosSelecionados.includes('Todos') ? [] : cursosSelecionados;
    const query = new URLSearchParams({
      inicio: anoInicial,
      fim: anoFinal,
      cursos: cursos.join(','),
      coverage: modalidade,
      typelocal: 'estado'
    }).toString();

    const url = `${URL_ALUNOS}?${query}`;
    console.log("🔗 URL da requisição:", url);

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const mapa = {};
        data.forEach(item => {
          const sigla = normalizarSigla(item.estado);
          mapa[sigla] = item.total;
        });
        setAlunosPorEstado(mapa);

        const valores = Object.values(mapa).filter(v => v > 0);
        if (valores.length === 0) {
          setGrades([]);
          return;
        }

        const max = Math.max(...valores);
        const min = Math.min(...valores);
        const numFaixas = 6;
        const logMin = Math.log10(min || 1);
        const logMax = Math.log10(max || 10);
        const step = (logMax - logMin) / numFaixas;
        const faixas = Array.from({ length: numFaixas }, (_, i) =>
          Math.floor(Math.pow(10, logMin + step * i))
        );

        setGrades(faixas);
      })
      .catch(err => {
        console.error("Erro ao buscar dados:", err);
        setAlunosPorEstado({});
      });
  }, [anoInicial, anoFinal, cursosSelecionados, modalidade]);

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

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cursosRef.current && !cursosRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const style = (feature) => {
    const sigla = normalizarSigla(feature.properties.sigla || feature.properties.SIGLA || feature.properties.name);
    const alunos = alunosPorEstado[sigla];
    return {
      fillColor: getColor(alunos, grades),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    const sigla = normalizarSigla(feature.properties.sigla || feature.properties.SIGLA || feature.properties.name);
    const alunos = alunosPorEstado[sigla] ?? 'Sem dados';
    layer.bindTooltip(`Estado: ${sigla.toUpperCase()}<br>Alunos matriculados: ${alunos}`, {
      sticky: true,
      direction: 'top',
      className: 'tooltip-estado',
      opacity: 0.9
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">Matrículas por Estado - Brasil</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">Distribuição de matrículas por estado da federação com filtros dinâmicos.</p>
        <div className="mt-4">
          <Link to="/" className="text-blue-500 hover:underline">&larr; Voltar para o Dashboard Principal</Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto mt-6 px-4 z-20 relative">
        <div className="bg-white/70 rounded-2xl p-6 shadow border border-slate-200">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Ano Inicial</label>
              <select value={anoInicial} onChange={(e) => setAnoInicial(Number(e.target.value))} className="bg-white border border-slate-300 rounded-xl py-2 px-4 shadow-sm">
                {anosDisponiveis.map((ano) => <option key={ano} value={ano}>{ano}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Ano Final</label>
              <select value={anoFinal} onChange={(e) => setAnoFinal(Number(e.target.value))} className="bg-white border border-slate-300 rounded-xl py-2 px-4 shadow-sm">
                {anosDisponiveis.map((ano) => <option key={ano} value={ano}>{ano}</option>)}
              </select>
            </div>
            <div className="flex flex-col relative" ref={cursosRef} style={{ zIndex: 1000 }}>
              <label className="text-sm font-medium text-slate-700 mb-2">Curso(s)</label>
              <button onClick={toggleDropdown} className="bg-white border border-slate-300 rounded-xl py-2 px-4 shadow-sm">
                {cursosSelecionados.includes('Todos') ? 'Todos os cursos' : `${cursosSelecionados.length} selecionado(s)`}
              </button>
              {dropdownOpen && (
                <div className="absolute z-50 top-full mt-2 bg-white border border-slate-300 rounded-xl shadow-lg py-2 px-4 max-h-48 overflow-y-auto space-y-1 w-64">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" value="Todos" checked={cursosSelecionados.includes('Todos')} onChange={() => handleCursoCheckboxChange('Todos')} />
                    Todos
                  </label>
                  {opcoesCursos.map((curso) => (
                    <label key={curso} className="flex items-center gap-2">
                      <input type="checkbox" value={curso} checked={cursosSelecionados.includes('Todos') || cursosSelecionados.includes(curso)} onChange={() => handleCursoCheckboxChange(curso)} />
                      {curso}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Alunos</label>
              <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className="bg-white border border-slate-300 rounded-xl py-2 px-4 shadow-sm">
                <option value="EAD">EAD</option>
                <option value="IFCE">IFCE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <MapContainer center={[-12.5, -52]} zoom={4} style={{ height: '80vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geoData && (
          <GeoJSON
            key={JSON.stringify(alunosPorEstado)}
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
        <Legend grades={grades} />
      </MapContainer>
    </div>
  );
};

export default MapaEstadosBrasil;
