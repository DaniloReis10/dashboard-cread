import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
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

/* ===================== AMPULHETA (overlay fixo) ===================== */
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
          <div className="text-xs text-slate-500">Processando dados de ativação…</div>
        </div>
      </div>
    </>
  );
};

const ActivationDashboard = () => {
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
  const [activationData, setActivationData] = useState(null);

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

    const di = new Date(dataInicial);
    const df = new Date(dataFinal);
    if (isFinite(di) && isFinite(df) && di > df) {
      console.error("[activation-dashboard] Intervalo inválido", { dataInicial, dataFinal });
      setActivationData(null);
      setLoading(false);
      return;
    }

    const endExclusive = addDaysISO(dataFinal, 1);
    const params = new URLSearchParams({ start: dataInicial, end: endExclusive });

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
         const activationRes = await fetch(`${BASE_URL}/analytics_behavour/activation?${params.toString()}`);
         if (!activationRes.ok) {
           throw new Error("Falha ao carregar activation");
         }
         const raw = await activationRes.json();
         if (reqId !== lastRequestIdRef.current) return;
 
         // Normaliza o payload do backend (lista de linhas) para o formato esperado pela UI
         const rows = Array.isArray(raw?.data) ? raw.data : [];
         let total = 0, act7 = 0, act30 = 0;
         for (const r of rows) {
           const t = Number(r?.total_matriculados) || 0;
           const p7 = Number(r?.pct_7d) || 0;
           const p30 = Number(r?.pct_30d) || 0;
           total += t;
           act7  += Math.round((p7  / 100) * t);
           act30 += Math.round((p30 / 100) * t);
         }
         setActivationData({
           activated_within_7_days: act7,
           activated_within_30_days: act30,
           total_enrolled: total,
        });        

      } catch (e) {
        console.error("[activation-dashboard] Erro no fetch:", e);
        if (reqId === lastRequestIdRef.current) {
          setActivationData(null);
        }
      } finally {
        if (reqId === lastRequestIdRef.current) {
          setLoading(false);
        }
        console.info("⏱ [activation-dashboard] Duração:", `${(performance.now() - t0).toFixed(0)} ms`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [dataInicial, dataFinal, cursosSelecionados, campusSelecionado, tipoLocal, mapaCursoNomeParaId]);

  // Força o ResponsiveContainer a recalcular quando dados chegam
  useEffect(() => {
    if (activationData) {
      const id = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 0);
      return () => clearTimeout(id);
    }
  }, [activationData]);

  // ===================== KPIs =====================
  const stats = useMemo(() => {
    if (!activationData) return { activated7: 0, activated30: 0, total: 0, rate7: 0, rate30: 0 };
    
    const act7 = activationData.activated_within_7_days || 0;
    const act30 = activationData.activated_within_30_days || 0;
    const total = activationData.total_enrolled || 0;
    
    return {
      activated7: act7,
      activated30: act30,
      total: total,
      rate7: total > 0 ? ((act7 / total) * 100).toFixed(1) : 0,
      rate30: total > 0 ? ((act30 / total) * 100).toFixed(1) : 0
    };
  }, [activationData]);

  // Dados para gráficos
  const pieData = useMemo(() => {
    if (!activationData) return [];
    const act7 = activationData.activated_within_7_days || 0;
    const act30 = activationData.activated_within_30_days || 0;
    const total = activationData.total_enrolled || 0;
    const notActivated = Math.max(0, total - act30);
    
    return [
      { name: "Ativados em 7 dias", value: act7, color: "#10b981" },
      { name: "Ativados em 8-30 dias", value: Math.max(0, act30 - act7), color: "#3b82f6" },
      { name: "Não ativados", value: notActivated, color: "#ef4444" }
    ].filter(item => item.value > 0);
  }, [activationData]);

  const barData = useMemo(() => {
    if (!activationData) return [];
    return [
      {
        period: "7 dias",
        ativados: activationData.activated_within_7_days || 0,
        percentual: parseFloat(stats.rate7)
      },
      {
        period: "30 dias",
        ativados: activationData.activated_within_30_days || 0,
        percentual: parseFloat(stats.rate30)
      }
    ];
  }, [activationData, stats]);

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

  const Card = ({ title, value, subtitle, variant = "default" }) => (
    <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border-none rounded-xl shadow-xl p-3">
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }} className="font-semibold">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // ===================== Render =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <LoadingOverlay show={loading} label="Aguarde: carregando dados de ativação" />

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-100">
                Dashboard de Ativação de Usuários
              </h1>
              <h2 className="text-xl font-medium text-white/90 mb-4">Análise de engajamento nos primeiros dias após matrícula</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v9H4V7z"
                    clipRule="evenodd"
                  />
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            <Card
              title="Total de Matrículas"
              value={stats.total.toLocaleString("pt-BR")}
              subtitle="usuários matriculados"
            />
            <Card
              title="Ativação em 7 dias"
              value={stats.activated7.toLocaleString("pt-BR")}
              subtitle={`${stats.rate7}% do total`}
              variant="success"
            />
            <Card
              title="Taxa de Ativação (7d)"
              value={`${stats.rate7}%`}
              subtitle="dos matriculados"
              variant="success"
            />
            <Card
              title="Ativação em 30 dias"
              value={stats.activated30.toLocaleString("pt-BR")}
              subtitle={`${stats.rate30}% do total`}
              variant="warning"
            />
            <Card
              title="Taxa de Ativação (30d)"
              value={`${stats.rate30}%`}
              subtitle="dos matriculados"
              variant="warning"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Gráfico de Pizza - Distribuição */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Distribuição de Ativação</h2>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                {pieData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomPieLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                    />
                  </PieChart>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-slate-400">
                    Sem dados no período selecionado
                  </div>
                )}
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Barras - Comparação */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Comparação de Períodos</h2>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                {barData.length > 0 ? (
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="period" stroke="#64748b" />
                    <YAxis 
                      yAxisId="left"
                      orientation="left" 
                      stroke="#3b82f6"
                      label={{ value: "Usuários", angle: -90, position: "insideLeft" }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right" 
                      stroke="#10b981"
                      label={{ value: "Percentual (%)", angle: 90, position: "insideRight" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="ativados" 
                      fill="#3b82f6" 
                      name="Usuários Ativados"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="percentual" 
                      fill="#10b981" 
                      name="Taxa de Ativação (%)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-slate-400">
                    Sem dados no período selecionado
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detalhamento */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Resumo Detalhado</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl">
                      <div className="h-4 bg-slate-300 rounded w-48" />
                      <div className="h-4 bg-slate-300 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activationData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">Total de Usuários Matriculados</h3>
                      <p className="text-sm text-slate-500">No período selecionado</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-800">
                      {stats.total.toLocaleString("pt-BR")}
                    </div>
                    <div className="text-sm text-slate-500">usuários</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">Ativados nos Primeiros 7 Dias</h3>
                      <p className="text-sm text-emerald-600">Engajamento rápido</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">
                      {stats.activated7.toLocaleString("pt-BR")}
                    </div>
                    <div className="text-sm font-semibold text-emerald-600">{stats.rate7}% do total</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">Ativados nos Primeiros 30 Dias</h3>
                      <p className="text-sm text-blue-600">Engajamento expandido</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.activated30.toLocaleString("pt-BR")}
                    </div>
                    <div className="text-sm font-semibold text-blue-600">{stats.rate30}% do total</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-rose-50 to-white rounded-xl border border-rose-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-red-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">Não Ativados em 30 Dias</h3>
                      <p className="text-sm text-rose-600">Requerem atenção</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-rose-600">
                      {(stats.total - stats.activated30).toLocaleString("pt-BR")}
                    </div>
                    <div className="text-sm font-semibold text-rose-600">
                      {stats.total > 0 ? (((stats.total - stats.activated30) / stats.total * 100).toFixed(1)) : 0}% do total
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-slate-500 mb-2">Nenhum dado encontrado</h3>
                <p className="text-slate-400">Ajuste os filtros para visualizar os dados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationDashboard;