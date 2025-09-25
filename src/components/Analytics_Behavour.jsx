import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis,
  ResponsiveContainer
} from "recharts";

// ========================= Config =========================
const BASE_URL = "https://web-production-3163.up.railway.app";

// Helpers de data (YYYY-MM-DD)
const hojeISO = () => new Date().toISOString().slice(0, 10);
const dozeMesesAtrasISO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 12);
  return d.toISOString().slice(0, 10);
};

// Normaliza rótulos de dias da semana (remove acentos e deixa minúsculo)
const normalize = (s) =>
  (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Ordem canônica usada na UI
const ORDEM_DIAS = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

const HORA_LABEL = (h) => `${String(h).padStart(2, "0")}:00`;

export default function Analytics_Behavour() {
  // ===================== Estados de filtros =====================
  const [dataInicial, setDataInicial] = useState(() => dozeMesesAtrasISO()); // ← 6 meses atrás
  const [dataFinal, setDataFinal] = useState(() => hojeISO()); // ← hoje

  const [opcoesCursos, setOpcoesCursos] = useState(["Todos"]);
  const [mapaCursoNomeParaId, setMapaCursoNomeParaId] = useState(new Map());
  const [cursosSelecionados, setCursosSelecionados] = useState(["Todos"]);

  // ===================== Derivar parâmetro estável de curso =====================
  const selectedCourseId = useMemo(() => {
  const unico =
    cursosSelecionados.length === 1 && cursosSelecionados[0] !== "Todos";
  if (!unico) return null;
  return mapaCursoNomeParaId.get(cursosSelecionados[0]) ?? null;
  }, [cursosSelecionados, mapaCursoNomeParaId]);


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
    const controller = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);

      const params = new URLSearchParams({ start: dataInicial, end: dataFinal });
      if (selectedCourseId != null) {
        params.set("course_id", String(selectedCourseId));
      }

      fetch(`${BASE_URL}/analytics_behavour/top-hours-days?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((payload) => {
          const rows = Array.isArray(payload?.data) ? payload.data : [];

          // Agrupa por dia-da-semana (rótulo vindo do backend, ex.: "Segunda", "Terça"...)
          const agrupado = new Map(); // key: dia normalizado → valores por hora
          const rotuloOriginal = new Map(); // preserva o rótulo exibível

          for (const r of rows) {
            const diaLabel = r?.dow_label ?? ""; // string
            const diaKey = normalize(diaLabel); // normalizado (ex.: "terca")
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
              minimo,
              medio,
              maximo,
              total,
            };
          });

          // Ordena na sequência desejada (segunda → domingo)
          porDia.sort((a, b) => ORDEM_DIAS.indexOf(a.dia) - ORDEM_DIAS.indexOf(b.dia));
          setDadosAcesso(porDia);

          // Mantém dia selecionado coerente (se vazio, usa o primeiro disponível)
          const diaAtual = porDia.some((d) => d.dia === diaSelecionado)
            ? diaSelecionado
            : porDia[0]?.dia || "segunda";
          setDiaSelecionado(diaAtual);

          // Série por hora do dia selecionado
          const horasSel = agrupado.get(diaAtual) || Array(24).fill(0);
          const mediaConst = Math.round(
            horasSel.reduce((a, b) => a + b, 0) / (horasSel.length || 1)
          );
          const porHora = horasSel.map((v, h) => ({
            dia: diaAtual,
            horario: HORA_LABEL(h),
            acessos: v,
            media: mediaConst,
          }));
          setDadosHorarios(porHora);
        })
        .catch((e) => {
          if (e.name !== "AbortError") {
            console.error("Erro ao buscar top-hours-days:", e);
            setDadosAcesso([]);
            setDadosHorarios([]);
          }
        })
        .finally(() => setLoading(false));
    }, 0);

    // Cleanup: cancela o primeiro ciclo (StrictMode) e qualquer requisição em voo
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [dataInicial, dataFinal, selectedCourseId]); // eslint-disable-line

  // ===================== Estatísticas simples =====================
  const totalAcessos = useMemo(
    () => dadosAcesso.reduce((acc, d) => acc + (d.total || 0), 0),
    [dadosAcesso]
  );
  const diaComMaisAcesso = useMemo(
    () =>
      dadosAcesso.length
        ? dadosAcesso.reduce(
            (max, d) => (d.total > max.total ? d : max),
            dadosAcesso[0]
          )
        : { label: "-", total: 0 },
    [dadosAcesso]
  );
  const diaComMenosAcesso = useMemo(
    () =>
      dadosAcesso.length
        ? dadosAcesso.reduce(
            (min, d) => (d.total < min.total ? d : min),
            dadosAcesso[0]
          )
        : { label: "-", total: 0 },
    [dadosAcesso]
  );
  const mediaAcessosPorDia = useMemo(
    () =>
      dadosAcesso.length ? Math.round(totalAcessos / dadosAcesso.length) : 0,
    [dadosAcesso, totalAcessos]
  );

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
    let atual = cursosSelecionados.includes("Todos")
      ? []
      : [...cursosSelecionados];
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

  const LoadingOverlay = () => (
    <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-sm flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-700">
        <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
          <path d="M7 3h10a1 1 0 0 1 1 1v2a5 5 0 0 1-2.2 4.16L13 12l2.8 1.84A5 5 0 0 1 18 18v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2a5 5 0 0 1 2.2-4.16L11 12 8.2 10.16A5 5 0 0 1 6 6V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="text-sm font-medium">Carregando dados…</span>
      </div>
    </div>
  );



  const Card = ({ title, value, subtitle, variant = "default" }) => (
    <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        {variant === "success" ? (
          <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : variant === "danger" ? (
          <svg className="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-sm font-medium text-slate-500 mb-2">{title}</div>
        <div className="text-3xl font-bold text-slate-800 mb-1">
          {loading ? (
            <div className="animate-pulse bg-slate-200 h-8 w-20 rounded"></div>
          ) : (
            value
          )}
        </div>
        {subtitle && (
          <div
            className={`text-sm font-medium ${
              variant === "success"
                ? "text-emerald-600"
                : variant === "danger"
                ? "text-rose-600"
                : "text-slate-600"
            }`}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  // ===================== Render =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative z-10">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white">
          <div className="max-w-7xl mx-auto px-4 pt-8 pb-12">
            <div className="mb-6">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Voltar para o Dashboard Principal</span>
              </a>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-100">
                Analytics de Comportamento
              </h1>
              <h2 className="text-xl font-medium text-white/90 mb-4">
                Acessos por Dia e Hora
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  {new Date(dataInicial).toLocaleDateString('pt-BR')} → {new Date(dataFinal).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card 
              title="Total de Acessos" 
              value={totalAcessos.toLocaleString("pt-BR")} 
            />
            <Card 
              title="Média por Dia" 
              value={mediaAcessosPorDia.toLocaleString("pt-BR")} 
            />
            <Card
              title="Dia com Mais Acesso"
              value={diaComMaisAcesso.label || "-"}
              subtitle={`${(diaComMaisAcesso.total || 0).toLocaleString("pt-BR")} acessos`}
              variant="success"
            />
            <Card
              title="Dia com Menos Acesso"
              value={diaComMenosAcesso.label || "-"}
              subtitle={`${(diaComMenosAcesso.total || 0).toLocaleString("pt-BR")} acessos`}
              variant="danger"
            />
          </div>
        </div>

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
                  <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${dropdownCursosOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${dropdownCampusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Acessos por Dia da Semana
                </h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
                <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 001-1v-1a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-indigo-700">
                  Clique para focar horários
                </span>
              </div>
            </div>

            {loading && <LoadingOverlay />}

            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={dadosAcesso}
                onClick={(e) => {
                  const x = e && e.activeLabel;
                  if (!x) return;
                  const key = normalize(String(x));
                  if (ORDEM_DIAS.includes(key)) setDiaSelecionado(key);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey={(d) => d.label || d.dia} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="minimo" name="Mínimo" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="medio" name="Médio" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                <Bar dataKey="maximo" name="Máximo" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mb-12">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Distribuição por Hora
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Dia:</span>
                <select
                  className="border border-slate-200 rounded-xl px-3 py-2 bg-white/70 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  value={diaSelecionado}
                  onChange={(e) => setDiaSelecionado(e.target.value)}
                >
                  {ORDEM_DIAS.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {loading && <LoadingOverlay />}
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={dadosHorarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="horario" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  interval={1}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="acessos"
                  name="Acessos"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
                <Line
                  type="monotone"
                  dataKey="media"
                  name="Média"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}