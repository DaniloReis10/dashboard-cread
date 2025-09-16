import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis,
  ResponsiveContainer
} from "recharts";

// ========================= Config =========================
const BASE_URL = "https://web-production-3163.up.railway.app";

// Normaliza rótulos de dias da semana (remove acentos e deixa minúsculo)
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

  const Card = ({ title, value, subtitle, variant="default" }) => (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-3xl font-bold">{loading ? "…" : value}</div>
      {subtitle && (
        <div
          className={
            "mt-1 text-sm font-medium " +
            (variant === "success" ? "text-emerald-600" : variant === "danger" ? "text-rose-600" : "text-slate-600")
          }
        >
          {subtitle}
        </div>
      )}
    </div>
  );

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

      {/* KPIs */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total de Acessos" value={totalAcessos.toLocaleString("pt-BR")} />
        <Card title="Média por Dia" value={mediaAcessosPorDia.toLocaleString("pt-BR")} />
        <Card
          title="Dia com Mais Acesso"
          value={diaComMaisAcesso.label || "-"}
          subtitle={`(${(diaComMaisAcesso.total || 0).toLocaleString("pt-BR")} acessos)`}
          variant="success"
        />
        <Card
          title="Dia com Menos Acesso"
          value={diaComMenosAcesso.label || "-"}
          subtitle={`(${(diaComMenosAcesso.total || 0).toLocaleString("pt-BR")} acessos)`}
          variant="danger"
        />
      </div>

      {/* Filtros (único card) */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
            {/* Data inicial */}
            <div>
              <label className="block text-sm text-slate-500 mb-1">Data Inicial</label>
              <input type="date" className="w-full border rounded-lg p-2" value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)} />
            </div>

            {/* Data final */}
            <div>
              <label className="block text-sm text-slate-500 mb-1">Data Final</label>
              <input type="date" className="w-full border rounded-lg p-2" value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)} />
            </div>

            {/* Cursos (dropdown de múltipla seleção) */}
            <div className="relative" ref={cursosRef}>
              <label className="block text-sm text-slate-500 mb-1">Curso(s)</label>
              <button className="border rounded-lg px-3 py-2 w-full text-left" onClick={() => setDropdownCursosOpen(v => !v)}>
                {cursosSelecionados.includes("Todos") ? "Todos os cursos" : `${cursosSelecionados.length} selecionado(s)`}
              </button>
              {dropdownCursosOpen && (
                <div className="absolute z-10 mt-2 w-full max-h-64 overflow-auto border bg-white rounded-lg shadow">
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

            {/* Campus/Polo */}
            <div className="relative" ref={campusRef}>
              <label className="block text-sm text-slate-500 mb-1">Campus/Polo</label>
              <button className="border rounded-lg px-3 py-2 w-full text-left" onClick={() => setDropdownCampusOpen(v => !v)}>
                {campusSelecionado}
              </button>
              {dropdownCampusOpen && (
                <div className="absolute z-10 mt-2 w-full max-h-64 overflow-auto border bg-white rounded-lg shadow">
                  {opcoesCampus.map((nome) => (
                    <button key={nome} className="w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-slate-50"
                            onClick={() => { setCampusSelecionado(nome); setDropdownCampusOpen(false); }}>
                      {nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm text-slate-500 mb-1">Tipo</label>
              <select className="w-full border rounded-lg p-2" value={tipoLocal} onChange={(e) => setTipoLocal(e.target.value)}>
                <option value="campus">Campus</option>
                <option value="polo">Polo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico por dia (barras) */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Acessos por Dia da Semana</h2>
            <span className="text-sm text-slate-500">Clique em um dia para focar no gráfico de horários</span>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={dadosAcesso} onClick={(e) => {
              const x = e && e.activeLabel;
              if (!x) return;
              const key = normalize(String(x));
              if (ORDEM_DIAS.includes(key)) setDiaSelecionado(key);
            }}>
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

      {/* Gráfico por hora do dia selecionado (seletor movido para cá) */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-12">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Distribuição por Hora</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Dia:</span>
              <select className="border rounded-lg p-2" value={diaSelecionado} onChange={(e) => setDiaSelecionado(e.target.value)}>
                {ORDEM_DIAS.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

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
