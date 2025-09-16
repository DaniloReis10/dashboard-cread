import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis,
  ResponsiveContainer
} from "recharts";

// ========================= Config =========================
const BASE_URL = "https://web-production-3163.up.railway.app"; // mesma origem dos microserviços

// Normaliza rótulos de dias da semana vindos do backend (remove acentos e deixa minúsculo)
const normalize = (s) => (s || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Ordem canônica usada na UI
const ORDEM_DIAS = [
  "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"
];

const HORA_LABEL = (h) => `${String(h).padStart(2, "0")}:00`;

export default function Analytics_Behavour() {
  // ===================== Estados de filtros =====================
  const [dataInicial, setDataInicial] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); // 30 dias
    return d.toISOString().slice(0,10);
  });
  const [dataFinal, setDataFinal] = useState(() => new Date().toISOString().slice(0,10));

  const [opcoesCursos, setOpcoesCursos] = useState(["Todos"]);
  const [mapaCursoNomeParaId, setMapaCursoNomeParaId] = useState(new Map());
  const [cursosSelecionados, setCursosSelecionados] = useState(["Todos"]);

  const [tipoLocal, setTipoLocal] = useState("campus"); // "campus" | "polo"
  const [opcoesCampus, setOpcoesCampus] = useState(["Todos"]);
  const [campusSelecionado, setCampusSelecionado] = useState("Todos");

  // ===================== Estados de dados =====================
  const [loading, setLoading] = useState(false);
  const [dadosAcesso, setDadosAcesso] = useState([]); // agregados por dia (min/med/max/total)
  const [dadosHorarios, setDadosHorarios] = useState([]); // horas do dia selecionado
  const [diaSelecionado, setDiaSelecionado] = useState("segunda");

  // ===================== Carregamento Dinâmico =====================
  // Cursos (usa /courses → retorna [{id, name}, ...])
  useEffect(() => {
    fetch(`${BASE_URL}/courses`)
      .then((r) => r.json())
      .then((lista) => {
        const opts = ["Todos", ...lista.map((c) => c.name)];
        const mapa = new Map(lista.map((c) => [c.name, c.id]));
        setOpcoesCursos(opts);
        setMapaCursoNomeParaId(mapa);
        setCursosSelecionados(["Todos"]);
      })
      .catch((e) => console.error("Falha ao carregar cursos:", e));
  }, []);

  // Polos/Campi
  useEffect(() => {
    const endpoint = tipoLocal === "polo" ? "/polos" : "/campus";
    fetch(`${BASE_URL}${endpoint}`)
      .then((r) => r.json())
      .then((arr) => {
        const arrLimpo = Array.isArray(arr) ? arr.filter(Boolean) : [];
        setOpcoesCampus(["Todos", ...arrLimpo]);
        setCampusSelecionado("Todos");
      })
      .catch((e) => console.error("Falha ao carregar polos/campi:", e));
  }, [tipoLocal]);

  // ===================== Buscar dados (Top Hours x Days) =====================
  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams({ start: dataInicial, end: dataFinal });

    // Se exatamente 1 curso (≠ Todos) → filtra por course_id, senão mantém agregado
    const apenasUmCurso = cursosSelecionados.length === 1 && cursosSelecionados[0] !== "Todos";
    if (apenasUmCurso) {
      const nome = cursosSelecionados[0];
      const id = mapaCursoNomeParaId.get(nome);
      if (id != null) params.set("course_id", String(id));
    }

    fetch(`${BASE_URL}/analytics_behavour/top-hours-days?${params.toString()}`)
      .then((r) => r.json())
      .then((payload) => {
        const rows = Array.isArray(payload?.data) ? payload.data : [];

        // Agrupa por dia-da-semana (rótulo vindo do backend, ex.: "Segunda", "Terça"...)
        const agrupado = new Map(); // key: dia normalizado → valores por hora
        const rotuloOriginal = new Map(); // preserva o rótulo exibível

        for (const r of rows) {
          const diaLabel = r?.dow_label ?? ""; // string
          const diaKey = normalize(diaLabel);   // normalizado (ex.: "terca")
          const hits = Number(r?.hits ?? 0);
          if (!agrupado.has(diaKey)) agrupado.set(diaKey, Array(24).fill(0));
          rotuloOriginal.set(diaKey, diaLabel);
          const hour = Number(r?.hour ?? 0);
          if (hour >= 0 && hour < 24) agrupado.get(diaKey)[hour] = hits;
        }

        // Constrói série agregada por dia para o gráfico de barras (mín/med/máx/total)
        const porDia = Array.from(agrupado.entries()).map(([diaKey, horas]) => {
          const total = horas.reduce((a, b) => a + b, 0);
          const minimo = Math.min(...horas);
          const maximo = Math.max(...horas);
          const medio = Math.round(total / (horas.length || 1));
          return {
            dia: diaKey, // normalizado → usado internamente
            label: rotuloOriginal.get(diaKey) || diaKey,
            minimo, medio, maximo, total,
          };
        });

        // Ordena na sequência desejada (segunda → domingo)
        porDia.sort((a, b) => ORDEM_DIAS.indexOf(a.dia) - ORDEM_DIAS.indexOf(b.dia));
        setDadosAcesso(porDia);

        // Mantém dia selecionado coerente (se vazio, usa o primeiro disponível)
        const diaAtual = porDia.some(d => d.dia === diaSelecionado)
          ? diaSelecionado
          : (porDia[0]?.dia || "segunda");
        setDiaSelecionado(diaAtual);

        // Série por hora do dia selecionado
        const horasSel = agrupado.get(diaAtual) || Array(24).fill(0);
        const mediaConst = Math.round(horasSel.reduce((a,b) => a+b, 0) / (horasSel.length || 1));
        const porHora = horasSel.map((v, h) => ({
          dia: diaAtual,
          horario: HORA_LABEL(h),
          acessos: v,
          media: mediaConst,
        }));
        setDadosHorarios(porHora);
      })
      .catch((e) => {
        console.error("Erro ao buscar top-hours-days:", e);
        setDadosAcesso([]);
        setDadosHorarios([]);
      })
      .finally(() => setLoading(false));
  }, [dataInicial, dataFinal, cursosSelecionados]);

  // ===================== Estatísticas simples =====================
  const totalAcessos = useMemo(
    () => dadosAcesso.reduce((acc, d) => acc + (d.total || 0), 0),
    [dadosAcesso]
  );
  const diaComMaisAcesso = useMemo(
    () => (dadosAcesso.length ? dadosAcesso.reduce((max, d) => d.total > max.total ? d : max, dadosAcesso[0]) : {label:"-", total:0}),
    [dadosAcesso]
  );
  const diaComMenosAcesso = useMemo(
    () => (dadosAcesso.length ? dadosAcesso.reduce((min, d) => d.total < min.total ? d : min, dadosAcesso[0]) : {label:"-", total:0}),
    [dadosAcesso]
  );
  const mediaAcessosPorDia = useMemo(
    () => (dadosAcesso.length ? Math.round(totalAcessos / dadosAcesso.length) : 0),
    [dadosAcesso, totalAcessos]
  );

  // ===================== UI helpers =====================
  const cursosRef = useRef(null);
  const campusRef = useRef(null);
  const [dropdownCursosOpen, setDropdownCursosOpen] = useState(false);
  const [dropdownCampusOpen, setDropdownCampusOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cursosRef.current && !cursosRef.current.contains(e.target)) setDropdownCursosOpen(false);
      if (campusRef.current && !campusRef.current.contains(e.target)) setDropdownCampusOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCursoCheckboxChange = (cursoNome) => {
    if (cursoNome === "Todos") {
      setCursosSelecionados(["Todos"]);
      return;
    }
    let atual = cursosSelecionados.includes("Todos") ? [] : [...cursosSelecionados];
    if (atual.includes(cursoNome)) {
      atual = atual.filter((c) => c !== cursoNome);
    } else {
      atual.push(cursoNome);
    }
    // Se marcou todos manualmente → vira "Todos"
    if (atual.length === opcoesCursos.length - 1) {
      setCursosSelecionados(["Todos"]);
    } else {
      setCursosSelecionados(atual.length ? atual : ["Todos"]);
    }
  };

  // ===================== Render =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Analytics de Comportamento — Acessos por Dia e Hora</h1>
        <p className="text-slate-600 mt-2">Intervalo: {dataInicial} → {dataFinal}</p>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Data inicial/final */}
        <div className="bg-white rounded-2xl shadow p-4">
          <label className="block text-sm text-slate-500 mb-1">Data inicial</label>
          <input type="date" className="w-full border rounded-lg p-2" value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)} />
          <label className="block text-sm text-slate-500 mt-3 mb-1">Data final</label>
          <input type="date" className="w-full border rounded-lg p-2" value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)} />
        </div>

        {/* Cursos (dinâmico) */}
        <div className="bg-white rounded-2xl shadow p-4" ref={cursosRef}>
          <label className="block text-sm text-slate-500 mb-2">Cursos</label>
          <button className="border rounded-lg px-3 py-2 w-full text-left" onClick={() => setDropdownCursosOpen(v => !v)}>
            {cursosSelecionados.includes("Todos") ? "Todos os cursos" : `${cursosSelecionados.length} selecionado(s)`}
          </button>
          {dropdownCursosOpen && (
            <div className="mt-2 max-h-64 overflow-auto border rounded-lg">
              {opcoesCursos.map((nome) => (
                <label key={nome} className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0">
                  <input type="checkbox"
                         checked={cursosSelecionados.includes("Todos") ? nome === "Todos" : cursosSelecionados.includes(nome)}
                         onChange={() => handleCursoCheckboxChange(nome)} />
                  <span>{nome}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Campus / Polo (dinâmico) */}
        <div className="bg-white rounded-2xl shadow p-4" ref={campusRef}>
          <label className="block text-sm text-slate-500 mb-2">Tipo de Local</label>
          <select className="w-full border rounded-lg p-2 mb-3" value={tipoLocal} onChange={(e) => setTipoLocal(e.target.value)}>
            <option value="campus">Campus</option>
            <option value="polo">Polo</option>
          </select>

          <label className="block text-sm text-slate-500 mb-2">{tipoLocal === "polo" ? "Polo" : "Campus"}</label>
          <button className="border rounded-lg px-3 py-2 w-full text-left" onClick={() => setDropdownCampusOpen(v => !v)}>
            {campusSelecionado}
          </button>
          {dropdownCampusOpen && (
            <div className="mt-2 max-h-64 overflow-auto border rounded-lg">
              {opcoesCampus.map((nome) => (
                <button key={nome} className="w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-slate-50"
                        onClick={() => { setCampusSelecionado(nome); setDropdownCampusOpen(false); }}>
                  {nome}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="text-sm text-slate-500">Acessos no período</div>
          <div className="text-2xl font-bold">{loading ? "…" : totalAcessos}</div>
          <div className="mt-3 text-sm">Maior tráfego: <b>{diaComMaisAcesso.label}</b> ({diaComMaisAcesso.total || 0})</div>
          <div className="text-sm">Menor tráfego: <b>{diaComMenosAcesso.label}</b> ({diaComMenosAcesso.total || 0})</div>
          <div className="text-sm">Média/dia: <b>{mediaAcessosPorDia}</b></div>
        </div>
      </div>

      {/* Gráfico por dia (barras) */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Acessos por dia da semana</h2>
            <select className="border rounded-lg p-2" value={diaSelecionado} onChange={(e) => setDiaSelecionado(e.target.value)}>
              {ORDEM_DIAS.map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={dadosAcesso}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(d) => (d.label || d.dia)} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="minimo" name="Mínimo" fill="#8884d8" />
              <Bar dataKey="medio"  name="Médio"  fill="#82ca9d" />
              <Bar dataKey="maximo" name="Máximo" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico por hora do dia selecionado */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-12">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Distribuição por hora — {diaSelecionado}</h2>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={dadosHorarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="horario" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="acessos" name="Acessos" stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="media"   name="Média"   stroke="#82ca9d" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
