import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart
} from "recharts";

// ========================= Config =========================
const BASE_URL = "https://web-production-3163.up.railway.app";

// ==== Helpers de data (locais) ====
function toLocalISO(d) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}
function addDaysISO(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toLocalISO(d);
}
function hojeISO() {
  return toLocalISO(new Date());
}
function dozeMesesAtrasISO() {
  const d = new Date();
  d.setMonth(d.getMonth() - 12);
  return toLocalISO(d);
}

const PERIOD_TO_DAYS = {
  "7dias": 7,
  "30dias": 30,
  "90dias": 90,
};

/* ===================== AMPULHETA (overlay fixo) ===================== */
/* Componente isolado; não altera layout existente (usa position: fixed) */
const LoadingOverlay = ({ show, label = "Carregando…" }) => {
  if (!show) return null;
  return (
    <>
      <style>{`
        @keyframes flipHourglass { 0%,45%{transform:rotate(0)} 55%,100%{transform:rotate(180deg)} }
        @keyframes sandTop { 0%,50%{transform:scaleY(1);opacity:1} 55%,100%{transform:scaleY(0);opacity:.2} }
        @keyframes sandBottom { 0%,50%{transform:scaleY(0);opacity:.2} 55%,100%{transform:scaleY(1);opacity:1} }
      `}</style>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/35 backdrop-blur-sm cursor-wait" role="status" aria-busy="true">
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/90 shadow-2xl border border-white/60">
          <div className="w-16 h-16 relative" style={{animation:"flipHourglass 1.6s ease-in-out infinite"}}>
            <svg viewBox="0 0 64 64" className="absolute inset-0">
              <path d="M16 8h32a4 4 0 014 4v4a4 4 0 01-4 4c-8 4-12 8-16 12-4-4-8-8-16-12a4 4 0 01-4-4v-4a4 4 0 014-4zm0 48h32a4 4 0 004-4v-4a4 4 0 00-4-4c-8-4-12-8-16-12-4 4-8 8-16 12a4 4 0 00-4 4v4a4 4 0 004 4z"
                fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute left-[22px] top-[16px] w-5 origin-top bg-indigo-500/70 rounded-b-sm" style={{height:"14px",animation:"sandTop 1.6s linear infinite"}} />
            <div className="absolute left-[31px] top-[30px] w-1 h-12 bg-indigo-400/60 rounded-full animate-pulse" />
            <div className="absolute left-[18px] bottom-[16px] w-10 origin-bottom bg-indigo-500/80 rounded-t-sm" style={{height:"6px",animation:"sandBottom 1.6s linear infinite"}} />
          </div>
          <div className="text-slate-700 font-medium">{label}</div>
          <div className="text-xs text-slate-500">Consultando tempo médio de sessão…</div>
        </div>
      </div>
    </>
  );
};

const MoodleSessionboard = () => {
  // ===================== Estados de filtros =====================
  const [dataInicial, setDataInicial] = useState(() => dozeMesesAtrasISO());
  const [dataFinal, setDataFinal] = useState(() => hojeISO());

  const [opcoesCursos, setOpcoesCursos] = useState(["Todos"]);
  const [mapaCursoNomeParaId, setMapaCursoNomeParaId] = useState(new Map());
  const [cursosSelecionados, setCursosSelecionados] = useState(["Todos"]);

  const [tipoLocal, setTipoLocal] = useState("campus");
  const [opcoesCampus, setOpcoesCampus] = useState(["Todos"]);
  const [campusSelecionado, setCampusSelecionado] = useState("Todos");

  // ===================== Estados de dados =====================
  const [loading, setLoading] = useState(false);
  const [avgWeekly, setAvgWeekly] = useState([]);
  const [avgGlobal, setAvgGlobal] = useState(null);
  const [resourcesUsage, setResourcesUsage] = useState([]);
  const [hourlyHits, setHourlyHits] = useState([]);

  // === NEW: loading dedicado ao endpoint avg-session-time ===
  const [loadingAvg, setLoadingAvg] = useState(false);

  // ===================== Carregamento Dinâmico =====================
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

  // ===================== Buscar dados =====================
  const lastRequestIdRef = useRef(0);

  useEffect(() => {
    setLoading(true);

    // Sanidade de datas
    const di = new Date(dataInicial);
    const df = new Date(dataFinal);
    if (isFinite(di) && isFinite(df) && di > df) {
      console.error("[session-dashboard] Intervalo inválido", { dataInicial, dataFinal });
      setAvgWeekly([]);
      setAvgGlobal(null);
      setResourcesUsage([]);
      setHourlyHits([]);
      setLoading(false);
      return;
    }

    // Fim inclusivo → envia end exclusivo (+1 dia)
    const endExclusive = addDaysISO(dataFinal, 1);

    // Monta params
    const params = new URLSearchParams({ start: dataInicial, end: endExclusive });

    // Regra: se houver só 1 curso selecionado, envia course_id
    let courseIdEnviado = null;
    const apenasUmCurso = cursosSelecionados.length === 1 && cursosSelecionados[0] !== "Todos";
    if (apenasUmCurso) {
      const nome = cursosSelecionados[0];
      const id = mapaCursoNomeParaId.get(nome);
      if (id != null) {
        params.set("course_id", String(id));
        courseIdEnviado = id;
      }
    }

    const reqId = ++lastRequestIdRef.current;
    const t0 = performance.now();

    const timer = setTimeout(async () => {
      try {
        /* ===================== SOMENTE AVG-SESSION-TIME ===================== */
        setLoadingAvg(true); // liga a ampulheta específica do AVG

        const avgRes = await fetch(`${BASE_URL}/analytics_behavour/avg-session-time?${params.toString()}`);
        if (!avgRes.ok) {
          throw new Error("Falha ao carregar avg-session-time");
        }
        const avgJson = await avgRes.json();

        if (reqId !== lastRequestIdRef.current) return;

        // Processar avg-session-time
        setAvgGlobal(
          avgJson?.global?.avg_minutes_per_session != null
            ? Math.round(Number(avgJson.global.avg_minutes_per_session))
            : null
        );
        setAvgWeekly(
          Array.isArray(avgJson?.weekly)
            ? avgJson.weekly
                .filter(d => d.avg_minutes_per_session != null)
                .map(d => ({
                  week_start: d.week_start,
                  label: new Date(d.week_start).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                  avg: Math.round(Number(d.avg_minutes_per_session)),
                }))
            : []
        );

        /* =================================================================== */

      } catch (e) {
        console.error("[session-dashboard] Erro no fetch:", e);
        if (reqId === lastRequestIdRef.current) {
          setAvgWeekly([]);
          setAvgGlobal(null);
          // mantém recursos/horas intactos (não estamos mexendo neles aqui)
        }
      } finally {
        if (reqId === lastRequestIdRef.current) {
          setLoading(false);
          setLoadingAvg(false); // desliga a ampulheta do AVG
        }
        console.info("⏱ [session-dashboard] Duração:", `${(performance.now() - t0).toFixed(0)} ms`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [dataInicial, dataFinal, cursosSelecionados, campusSelecionado, tipoLocal, mapaCursoNomeParaId]);

  // Força o ResponsiveContainer a recalcular quando dados chegam
  useEffect(() => {
    if (avgWeekly.length > 0 || resourcesUsage.length > 0 || hourlyHits.length > 0) {
      const id = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 0);
      return () => clearTimeout(id);
    }
  }, [avgWeekly.length, resourcesUsage.length, hourlyHits.length]);

  // ===================== KPIs =====================
  const stats = useMemo(() => {
    const avgOverall = avgGlobal ?? (avgWeekly.length ? 
      Math.round(avgWeekly.reduce((s, x) => s + x.avg, 0) / avgWeekly.length) : 0);
    const minWeekly = avgWeekly.length ? Math.min(...avgWeekly.map(d => d.avg)) : 0;
    const maxWeekly = avgWeekly.length ? Math.max(...avgWeekly.map(d => d.avg)) : 0;
    const totalHits = resourcesUsage.reduce((s, r) => s + r.hits, 0);

    return { avgOverall, minWeekly, maxWeekly, totalHits };
  }, [avgWeekly, avgGlobal, resourcesUsage]);

  // ===================== UI helpers =====================
  const cursosRef = useRef(null);
  const campusRef = useRef(null);
  const [dropdownCursosOpen, setDropdownCursosOpen] = useState(false);
  const [dropdownCampusOpen, setDropdownCampusOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cursosRef.current && !cursosRef.current.contains(e.target))
        setDropdownCursosOpen(false);
      if (campusRef.current && !campusRef.current.contains(e.target))
        setDropdownCampusOpen(false);
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
    if (atual.includes(cursoNome)) atual = atual.filter((c) => c !== cursoNome);
    else atual.push(cursoNome);

    if (atual.length === opcoesCursos.length - 1) setCursosSelecionados(["Todos"]);
    else setCursosSelecionados(atual.length ? atual : ["Todos"]);
  };

  const Card = ({ title, value, subtitle, variant = "default", icon }) => (
    <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        {icon || (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.25 10a7.75 7.75 0 1115.5 0 7.75 7.75 0 01-15.5 0zm8.25-3.5a1 1 0 10-2 0V10a1 1 0 00.553.894l2.5 1.25a1 1 0 10.894-1.788L10.5 9.382V6.5z" />
          </svg>
        )}
      </div>
      <div className="relative z-10">
        <div className="text-sm font-medium text-slate-500 mb-2">{title}</div>
        <div className="text-3xl font-bold text-slate-800 mb-1">
          {loading ? <div className="animate-pulse bg-slate-200 h-8 w-20 rounded" /> : value}
        </div>
        {subtitle && (
          <div
            className={`text-sm font-medium ${
              variant === "success"
                ? "text-emerald-600"
                : variant === "danger"
                ? "text-rose-600"
                : variant === "warning"
                ? "text-amber-600"
                : "text-slate-600"
            }`}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border-none rounded-xl shadow-xl p-3">
          <p className="font-semibold text-slate-800">{`Data: ${label}`}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ===================== Render =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Overlay da ampulheta (não altera layout) */}
      <LoadingOverlay show={loadingAvg} label="Aguarde: calculando média de sessão" />

      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white">
          <div className="max-w-7xl mx-auto px-4 pt-8 pb-12">
            <div className="mb-6">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 group"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-1 duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Voltar para o Dashboard Principal</span>
              </a>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-100">
                Dashboard de Tempo de Sessão
              </h1>
              <h2 className="text-xl font-medium text-white/90 mb-4">Análise de duração e padrões de uso da plataforma</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm font-medium">
                  {new Date(dataInicial).toLocaleDateString("pt-BR")} → {new Date(dataFinal).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card
              title="Tempo Médio Global"
              value={typeof stats.avgOverall === "number" ? `${stats.avgOverall} min` : "-"}
              subtitle="minutos por sessão"
            />
            <Card
              title="Menor Média Semanal"
              value={`${stats.minWeekly} min`}
              subtitle="semana com menor tempo"
              variant="success"
            />
            <Card
              title="Maior Média Semanal"
              value={`${stats.maxWeekly} min`}
              subtitle="semana com maior tempo"
              variant="warning"
            />
            <Card
              title="Total de Acessos"
              value={stats.totalHits.toLocaleString("pt-BR")}
              subtitle="recursos utilizados"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Filtros de Análise</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Data Inicial</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Data Final</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                />
              </div>

              <div className="relative" ref={cursosRef}>
                <label className="block text-sm font-medium text-slate-600 mb-2">Curso(s)</label>
                <button
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm text-left hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 flex items-center justify-between"
                  onClick={() => setDropdownCursosOpen((v) => !v)}
                >
                  <span>
                    {cursosSelecionados.includes("Todos")
                      ? "Todos os cursos"
                      : `${cursosSelecionados.length} selecionado(s)`}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${dropdownCursosOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownCursosOpen && (
                  <div className="absolute z-20 mt-2 w-full max-h-64 overflow-auto border border-slate-200 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl">
                    {opcoesCursos.map((nome) => (
                      <label
                        key={nome}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors duration-150 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={
                            cursosSelecionados.includes("Todos")
                              ? nome === "Todos"
                              : cursosSelecionados.includes(nome)
                          }
                          onChange={() => handleCursoCheckboxChange(nome)}
                        />
                        <span className="text-sm font-medium text-slate-700">{nome}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={campusRef}>
                <label className="block text-sm font-medium text-slate-600 mb-2">Campus/Polo</label>
                <button
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm text-left hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 flex items-center justify-between"
                  onClick={() => setDropdownCampusOpen((v) => !v)}
                >
                  <span>{campusSelecionado}</span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${dropdownCampusOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownCampusOpen && (
                  <div className="absolute z-20 mt-2 w-full max-h-64 overflow-auto border border-slate-200 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl">
                    {opcoesCampus.map((nome) => (
                      <button
                        key={nome}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors duration-150 border-b border-slate-100 last:border-b-0"
                        onClick={() => {
                          setCampusSelecionado(nome);
                          setDropdownCampusOpen(false);
                        }}
                      >
                        <span className="text-sm font-medium text-slate-700">{nome}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Tipo</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  value={tipoLocal}
                  onChange={(e) => setTipoLocal(e.target.value)}
                >
                  <option value="campus">Campus</option>
                  <option value="polo">Polo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Gráfico 1 – Evolução da média semanal */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Evolução do Tempo Médio de Sessão (semanal)</h2>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                {avgWeekly.length > 0 ? (
                  <AreaChart data={avgWeekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" stroke="#64748b" />
                    <YAxis label={{ value: "Minutos", angle: -90, position: "insideLeft" }} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="avg"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.25}
                      strokeWidth={2}
                      name="Média"
                    />
                  </AreaChart>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-slate-400">
                    Sem dados no período selecionado
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lista detalhada de recursos */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Detalhamento por Recurso</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-slate-300 rounded" />
                        <div className="h-4 bg-slate-300 rounded w-32" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-4 bg-slate-300 rounded w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {resourcesUsage.length > 0 ? resourcesUsage.map((recurso, index) => (
                  <div
                    key={recurso.module_bucket}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      />
                      <div>
                        <h3 className="font-semibold text-slate-800 capitalize">{recurso.module_bucket}</h3>
                        <div className="text-sm text-slate-500">Tipo de recurso</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-800">
                        {recurso.hits.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-sm text-slate-500">acessos</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="text-lg font-medium text-slate-500 mb-2">Nenhum dado encontrado</h3>
                    <p className="text-slate-400">Ajuste os filtros para visualizar os dados.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodleSessionboard;
