import React from "react";
import { Student, StudentSimulados, SUBJECT_LIST } from "../types";
import { ChevronLeft, FileText, Award, TrendingUp, BarChart2, AlertTriangle, Download } from "lucide-react";
import SvgChart from "./SvgChart";
import { generateSingleHtml } from "../utils/exportHtml";

interface StudentDashboardProps {
  student: Student;
  onBack: () => void;
  allStudents?: Student[];
  firebaseConfig?: any;
}

export default function StudentDashboard({ student, onBack, allStudents, firebaseConfig }: StudentDashboardProps) {
  
  // Calculate quarterly B1 average dynamically
  const b1Grades = Object.values(student.boletim || {})
    .map((subj) => subj.b1)
    .filter((v): v is number => v !== null && v !== undefined);
  
  const gpa = b1Grades.length > 0 ? b1Grades.reduce((a, b) => a + b, 0) / b1Grades.length : 0;

  // Highest and lowest grades
  const maxGrade = b1Grades.length > 0 ? Math.max(...b1Grades) : 0;
  const minGrade = b1Grades.length > 0 ? Math.min(...b1Grades) : 0;

  // Find subjects with max and min grades
  const bestSubjects = Object.keys(student.boletim || {}).filter(
    (subj) => student.boletim[subj]?.b1 === maxGrade
  );
  const worstSubjects = Object.keys(student.boletim || {}).filter(
    (subj) => student.boletim[subj]?.b1 === minGrade
  );

  // Extract Simulado grades
  const sims = student.simulados || {};
  const simKeys = Object.keys(sims).sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  });

  const simGrades: number[] = [];
  simKeys.forEach((k) => {
    const valPort = sims[k]?.portugues;
    const valMat = sims[k]?.matematica;
    if (valPort !== null && valPort !== undefined) simGrades.push(valPort);
    if (valMat !== null && valMat !== undefined) simGrades.push(valMat);
  });

  const bestSimulado = simGrades.length > 0 ? Math.max(...simGrades) : 0;
  const worstSimulado = simGrades.length > 0 ? Math.min(...simGrades) : 0;

  // Determine if student has any critical scores in the latest Simulado
  const latestSimKey = simKeys.length > 0 ? simKeys[simKeys.length - 1] : null;
  const latestSim = latestSimKey ? sims[latestSimKey] : null;
  const isLatestCritical = latestSim ?
    (latestSim.portugues !== null && latestSim.portugues !== undefined && latestSim.portugues < 70) ||
    (latestSim.matematica !== null && latestSim.matematica !== undefined && latestSim.matematica < 70)
    : false;

  const getSimuladoName = (key: string | null) => {
    if (!key) return "";
    const num = key.match(/\d+/);
    if (num) {
      return `${num[0]}º SIMULADO`;
    }
    return key.toUpperCase();
  };

  // Grade formatting CSS helpers
  const getGradeClass = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return "text-slate-400";
    if (val >= 10) return "text-emerald-700 font-extrabold";
    if (val >= 9.0) return "text-emerald-600 font-bold";
    if (val >= 8.5) return "text-teal-600 font-bold";
    if (val >= 7.5) return "text-sky-600 font-bold";
    if (val >= 6.5) return "text-amber-600 font-bold";
    if (val >= 6.0) return "text-orange-600 font-bold";
    return "text-rose-600 font-extrabold";
  };

  const getSimuladoLevelColor = (val: number | null | undefined, level?: string) => {
    if (level) {
      const lvl = level.toUpperCase();
      if (lvl === "ADEQUADO") return "bg-emerald-600 text-white";
      if (lvl === "INTERMEDIÁRIO") return "bg-amber-500 text-white";
      if (lvl === "CRÍTICO") return "bg-rose-500 text-white";
      if (lvl === "MUITO CRÍTICO") return "bg-rose-700 text-white";
    }
    if (val === null || val === undefined) return "bg-slate-400 text-white";
    if (val >= 85) return "bg-emerald-600 text-white"; // Adequado
    if (val >= 70) return "bg-amber-500 text-white"; // Intermediário
    if (val >= 50) return "bg-rose-500 text-white"; // Crítico
    return "bg-rose-700 text-white"; // Muito crítico
  };

  const getSimuladoLevelText = (val: number | null | undefined, level?: string) => {
    if (level) return level.toUpperCase();
    if (val === null || val === undefined) return "SEM DADOS";
    if (val >= 85) return "ADEQUADO";
    if (val >= 70) return "INTERMEDIÁRIO";
    if (val >= 50) return "CRÍTICO";
    return "MUITO CRÍTICO";
  };

  return (
    <div className="w-full">
      {/* Back button and Download options */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl px-4 py-2.5 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition duration-200 shadow-sm"
        >
          <ChevronLeft size={15} /> Voltar para Turma
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Option A: Download only this student's report */}
          <button
            onClick={() => {
              const htmlContent = generateSingleHtml([student], null);
              const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `boletim_${student.name.toLowerCase().replace(/\s+/g, "_")}.html`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl px-4 py-2.5 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition duration-200 shadow-sm"
            title="Baixar apenas esta ficha do aluno como um arquivo HTML offline"
          >
            <Download size={14} /> Baixar Ficha do Aluno (HTML)
          </button>

          {/* Option B: Download entire school system app if available */}
          {allStudents && (
            <button
              onClick={() => {
                const htmlContent = generateSingleHtml(allStudents, firebaseConfig || null);
                const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sistema_completo.html";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition duration-200 shadow-md"
              title="Baixar o sistema completo contendo todos os alunos e histórico"
            >
              <Download size={14} /> Baixar Sistema Completo (HTML)
            </button>
          )}
        </div>
      </div>

      {/* ══ HEADER CARD (Aesthetic matches original HTML) ══ */}
      <header className="bg-white border-2 border-[#cdddf0] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md mb-6">
        <div className="text-center md:text-left">
          <h1 className="font-display font-black text-5xl text-emerald-600 tracking-tight leading-none">
            SPABB
          </h1>
          <h2 className="text-lg font-black text-amber-500 tracking-widest uppercase mt-1">
            SISTEMA DE AVALIAÇÕES
          </h2>
          <h3 className="text-[10px] font-black text-emerald-700 tracking-widest uppercase mt-1">
            EMEF ANTONIO BARROSO BRAGA
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Student profile tag */}
          <div className="bg-gradient-to-br from-[#f0fbff] to-[#cce8f8] border-2 border-[#70b0d8] rounded-xl px-6 py-2 text-center shadow-inner">
            <p className="text-[9px] font-black text-[#3880c0] tracking-widest">
              ALUNO(A) &bull; {student.turma || "5º A"}
            </p>
            <p className="font-display font-black text-xl text-[#1a60a0] tracking-wider mt-0.5 uppercase">
              {student.name}
            </p>
          </div>

          {/* Average Grade Pill */}
          <div className="bg-gradient-to-br from-[#7da7e0] to-[#4a80c4] rounded-xl text-white px-5 py-2.5 text-center shadow-md">
            <p className="text-3xl font-black leading-none font-mono">
              {gpa.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-[9px] font-black tracking-widest uppercase mt-1.5 leading-none">
              MÉDIA 1º BIM.
            </p>
          </div>

          {/* S3 Warning Alert Pill */}
          {isLatestCritical && (
            <div className="bg-gradient-to-br from-[#f5c842] to-[#e09000] rounded-xl text-white px-5 py-2.5 text-center shadow-md">
              <p className="text-3xl font-black leading-none font-mono">⚠️</p>
              <p className="text-[9px] font-black tracking-widest uppercase mt-1.5 leading-none">
                ATENÇÃO SIMULADOS
              </p>
            </div>
          )}
        </div>
      </header>

      {/* ══ PEDAGOGICAL ANALYSIS HIGHLIGHT ══ */}
      {student.analysis && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border-2 border-amber-300 rounded-2xl p-6 mb-6 shadow-sm flex gap-4 items-start">
          <div className="text-3xl select-none">📊</div>
          <div>
            <h4 className="font-display font-black text-xs text-amber-900 tracking-wider uppercase mb-1">
              ANÁLISE DE DESEMPENHO PEDAGÓGICO
            </h4>
            <p className="text-sm leading-relaxed text-amber-950 font-medium">
              {student.analysis}
            </p>
          </div>
        </div>
      )}

      {/* ══ KPI STRIP ══ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border-2 border-[#cdddf0] rounded-2xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
          <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
            MÉDIA 1º BIM.
          </p>
          <p className="text-3xl font-black font-mono text-[#4a80c4] mt-1.5">
            {gpa.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5">
            Boletim Escolar
          </p>
        </div>

        <div className="bg-white border-2 border-[#cdddf0] rounded-2xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
          <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
            NOTA MÁXIMA
          </p>
          <p className="text-3xl font-black font-mono text-emerald-600 mt-1.5">
            {maxGrade.toFixed(1).replace(".", ",")}
          </p>
          <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase truncate" title={bestSubjects[0] || ""}>
            {bestSubjects[0] || "Arte"}
          </p>
        </div>

        <div className="bg-white border-2 border-[#cdddf0] rounded-2xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
          <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
            NOTA MÍNIMA
          </p>
          <p className="text-3xl font-black font-mono text-rose-500 mt-1.5">
            {minGrade.toFixed(1).replace(".", ",")}
          </p>
          <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase truncate" title={worstSubjects[0] || ""}>
            {worstSubjects[0] || "História"}
          </p>
        </div>

        <div className="bg-white border-2 border-[#cdddf0] rounded-2xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
          <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
            MELHOR SIMULADO
          </p>
          <p className="text-3xl font-black font-mono text-amber-500 mt-1.5">
            {bestSimulado.toFixed(1).replace(".", ",")}%
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5">
            Port. e Mat.
          </p>
        </div>

        <div className="bg-white border-2 border-[#cdddf0] rounded-2xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
          <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
            PIOR SIMULADO
          </p>
          <p className="text-3xl font-black font-mono text-rose-600 mt-1.5">
            {worstSimulado.toFixed(1).replace(".", ",")}%
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5">
            Reforço focado
          </p>
        </div>
      </div>

      {/* ══ BOLETIM TABLE CARD ══ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 overflow-x-auto">
        <p className="text-sm font-black text-slate-700 tracking-wider uppercase mb-4 flex items-center gap-2">
          <FileText className="text-sky-500" size={18} /> Resultado da Aprendizagem por Período — Boletim
        </p>

        <table className="boletim-table w-full min-w-[700px] border-collapse">
          <thead>
            <tr>
              <th style={{ width: "38%" }}>COMPONENTES CURRICULARES</th>
              <th colSpan={7}>RESULTADO DA APRENDIZAGEM POR PERÍODO</th>
            </tr>
            <tr>
              <th className="pl-4">COMPONENTES CURRICULARES</th>
              <th>1º</th>
              <th>2º</th>
              <th>3º</th>
              <th>4º</th>
              <th>MÉDIA ANUAL</th>
              <th>RECUPERAÇÃO</th>
              <th>MÉDIA FINAL</th>
            </tr>
          </thead>
          <tbody>
            {SUBJECT_LIST.map((subject) => {
              const grades = student.boletim?.[subject] || {
                b1: null,
                b2: null,
                b3: null,
                b4: null,
                rec: null,
              };

              const activeQuarters = [grades.b1, grades.b2, grades.b3, grades.b4].filter(
                (v): v is number => v !== null && v !== undefined
              );

              const mediaAnual =
                activeQuarters.length > 0
                  ? activeQuarters.reduce((a, b) => a + b, 0) / activeQuarters.length
                  : null;

              const isRecovered = grades.rec !== null;
              const mediaFinal =
                isRecovered && mediaAnual !== null
                  ? Math.max(mediaAnual, grades.rec)
                  : mediaAnual;

              return (
                <tr key={subject} className="hover:bg-slate-50/50 transition">
                  <td className="font-sans font-bold text-slate-800 text-xs pl-4 py-2.5">
                    {subject}
                  </td>
                  <td className={`font-mono font-bold text-center ${getGradeClass(grades.b1)}`}>
                    {grades.b1 !== null ? grades.b1.toFixed(1).replace(".", ",") : "—"}
                  </td>
                  <td className={`font-mono font-semibold text-center ${getGradeClass(grades.b2)}`}>
                    {grades.b2 !== null ? grades.b2.toFixed(1).replace(".", ",") : "—"}
                  </td>
                  <td className={`font-mono font-semibold text-center ${getGradeClass(grades.b3)}`}>
                    {grades.b3 !== null ? grades.b3.toFixed(1).replace(".", ",") : "—"}
                  </td>
                  <td className={`font-mono font-semibold text-center ${getGradeClass(grades.b4)}`}>
                    {grades.b4 !== null ? grades.b4.toFixed(1).replace(".", ",") : "—"}
                  </td>
                  <td className={`font-mono font-extrabold text-center ${getGradeClass(mediaAnual)}`}>
                    {mediaAnual !== null ? mediaAnual.toFixed(1).replace(".", ",") : "—"}
                  </td>
                  <td className={`font-mono font-semibold text-center ${getGradeClass(grades.rec)}`}>
                    {grades.rec !== null ? grades.rec.toFixed(1).replace(".", ",") : "—"}
                  </td>
                  <td className={`font-mono font-black text-center ${getGradeClass(mediaFinal)}`}>
                    {mediaFinal !== null ? mediaFinal.toFixed(1).replace(".", ",") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#ddeaf8]/60 font-bold border-t border-slate-200">
              <td className="py-3 pl-4 font-extrabold text-[#1a60a0] text-xs">MÉDIAS POR PERÍODO</td>
              <td className="text-center font-mono font-black text-[#1a60a0] text-sm">
                {gpa.toFixed(2).replace(".", ",")}
              </td>
              <td className="text-center font-mono text-[#1a60a0] text-sm">—</td>
              <td className="text-center font-mono text-[#1a60a0] text-sm">—</td>
              <td className="text-center font-mono text-[#1a60a0] text-sm">—</td>
              <td className="text-center font-mono font-black text-[#1a60a0] text-sm">
                {gpa.toFixed(2).replace(".", ",")}
              </td>
              <td className="text-center font-mono text-[#1a60a0] text-sm">—</td>
              <td className="text-center font-mono font-black text-[#1a60a0] text-sm">
                {gpa.toFixed(2).replace(".", ",")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ══ WARNING STRIP FOR CRITICAL SIMULADOS ══ */}
      {isLatestCritical && (
        <div className="bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-xl py-3 px-6 text-center font-black text-xs tracking-wider shadow-md mb-6 animate-pulse select-none uppercase">
          ⚠️ &nbsp; ATENÇÃO: NÍVEL CRÍTICO EM AMBAS AS DISCIPLINAS NO {getSimuladoName(latestSimKey)} — INTERVENÇÃO NECESSÁRIA &nbsp; ⚠️
        </div>
      )}

      {/* ══ SIMULADO CARDS ══ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <p className="text-sm font-black text-slate-700 tracking-wider uppercase mb-4 flex items-center gap-2">
          <Award className="text-[#1a60a0]" size={18} /> SPABB — Cards de Resultado por Simulado
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {simKeys.map((simId) => {
            const data = sims[simId];
            return (
              <div key={simId} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="bg-gradient-to-r from-[#7da7e0] to-[#4a80c4] text-white text-center py-2.5 font-display font-black tracking-wider text-xs uppercase">
                  {getSimuladoName(simId)}
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50/50">
                  <div className="p-4 text-center">
                    <p
                      className="text-2xl font-black font-mono"
                      style={{
                        color:
                          data?.portugues !== null && data?.portugues !== undefined && data.portugues >= 85
                            ? "#1a6e2a"
                            : data?.portugues !== null && data?.portugues !== undefined && data.portugues >= 70
                            ? "#f0a500"
                            : "#c0392b",
                      }}
                    >
                      {data?.portugues !== null && data?.portugues !== undefined ? data.portugues.toFixed(1).replace(".", ",") + "%" : "—"}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">PORTUGUÊS</p>
                  </div>
                  <div className="p-4 text-center">
                    <p
                      className="text-2xl font-black font-mono"
                      style={{
                        color:
                          data?.matematica !== null && data?.matematica !== undefined && data.matematica >= 85
                            ? "#1a6e2a"
                            : data?.matematica !== null && data?.matematica !== undefined && data.matematica >= 70
                            ? "#f0a500"
                            : "#c0392b",
                      }}
                    >
                      {data?.matematica !== null && data?.matematica !== undefined ? data.matematica.toFixed(1).replace(".", ",") + "%" : "—"}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">MATEMÁTICA</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 text-[10px] font-black text-center border-t">
                  <div className={`py-2 ${getSimuladoLevelColor(data?.portugues, data?.portuguesLevel)}`}>
                    {getSimuladoLevelText(data?.portugues, data?.portuguesLevel)}
                  </div>
                  <div className={`py-2 ${getSimuladoLevelColor(data?.matematica, data?.matematicaLevel)}`}>
                    {getSimuladoLevelText(data?.matematica, data?.matematicaLevel)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ EVOLUTION LINE CHART ══ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <p className="text-sm font-black text-slate-700 tracking-wider uppercase mb-3 flex items-center gap-2">
          <TrendingUp className="text-sky-500" size={18} /> Evolução de Desempenho — Gráfico de Linhas
        </p>

        {/* Legend */}
        <div className="flex gap-4 mb-2 font-bold text-xs pl-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#4a80c4]"></span>Língua Portuguesa
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#e05a00]"></span>Matemática
          </div>
        </div>

        <SvgChart
          portugues={simKeys.map((k) => sims[k]?.portugues || 0)}
          matematica={simKeys.map((k) => sims[k]?.matematica || 0)}
          labels={simKeys.map((k) => {
            const num = k.match(/\d+/);
            return num ? `${num[0]}º Sim.` : k.toUpperCase();
          })}
        />
      </div>

      {/* ══ DETAIL PROGRESS BARS ══ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-black text-slate-700 tracking-wider uppercase mb-5 flex items-center gap-2">
          <BarChart2 className="text-emerald-500" size={18} /> Comparativo de Evolução por Disciplina
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Português column */}
          <div>
            <h5 className="font-display font-black text-xs text-[#4a80c4] tracking-wider uppercase mb-4 border-b border-[#4a80c4]/20 pb-2">
              LÍNGUA PORTUGUESA
            </h5>

            {simKeys.map((key) => {
              const num = key.match(/\d+/);
              const label = num ? `${num[0]}º Simulado` : key.toUpperCase();
              const val = sims[key]?.portugues;
              const level = sims[key]?.portuguesLevel;
              return { id: key, val, label, level };
            }).map((item) => {
              const levelText = getSimuladoLevelText(item.val, item.level);
              const textCol = levelText === "ADEQUADO" ? "#1a6e2a" : levelText === "INTERMEDIÁRIO" ? "#c07800" : levelText === "CRÍTICO" ? "#d97706" : "#c0392b";
              const bgGrad = levelText === "ADEQUADO" ? "linear-gradient(90deg, #5cb85c, #2e7d2e)" : levelText === "INTERMEDIÁRIO" ? "linear-gradient(90deg, #f0a500, #c07800)" : levelText === "CRÍTICO" ? "linear-gradient(90deg, #f43f5e, #be123c)" : "linear-gradient(90deg, #e08080, #c0392b)";
              return (
                <div key={item.id} className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>{item.label}</span>
                    {item.val !== null && item.val !== undefined ? (
                      <span style={{ color: textCol }}>
                        {item.val.toFixed(1).replace(".", ",")}% — {levelText}
                      </span>
                    ) : (
                      <span className="text-slate-400">Sem dados</span>
                    )}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden shadow-inner">
                    {item.val !== null && item.val !== undefined && (
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-3.5 text-[10px] font-extrabold text-white transition-all duration-1000"
                        style={{
                          width: `${item.val}%`,
                          background: bgGrad,
                        }}
                      >
                        {item.val > 15 ? `${item.val.toFixed(1).replace(".", ",")}%` : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Matemática column */}
          <div>
            <h5 className="font-display font-black text-xs text-[#e05a00] tracking-wider uppercase mb-4 border-b border-[#e05a00]/20 pb-2">
              MATEMÁTICA
            </h5>

            {simKeys.map((key) => {
              const num = key.match(/\d+/);
              const label = num ? `${num[0]}º Simulado` : key.toUpperCase();
              const val = sims[key]?.matematica;
              const level = sims[key]?.matematicaLevel;
              return { id: key, val, label, level };
            }).map((item) => {
              const levelText = getSimuladoLevelText(item.val, item.level);
              const textCol = levelText === "ADEQUADO" ? "#1a6e2a" : levelText === "INTERMEDIÁRIO" ? "#c07800" : levelText === "CRÍTICO" ? "#d97706" : "#c0392b";
              const bgGrad = levelText === "ADEQUADO" ? "linear-gradient(90deg, #5cb85c, #2e7d2e)" : levelText === "INTERMEDIÁRIO" ? "linear-gradient(90deg, #f0a500, #c07800)" : levelText === "CRÍTICO" ? "linear-gradient(90deg, #f43f5e, #be123c)" : "linear-gradient(90deg, #e08080, #c0392b)";
              return (
                <div key={item.id} className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>{item.label}</span>
                    {item.val !== null && item.val !== undefined ? (
                      <span style={{ color: textCol }}>
                        {item.val.toFixed(1).replace(".", ",")}% — {levelText}
                      </span>
                    ) : (
                      <span className="text-slate-400">Sem dados</span>
                    )}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden shadow-inner">
                    {item.val !== null && item.val !== undefined && (
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-3.5 text-[10px] font-extrabold text-white transition-all duration-1000"
                        style={{
                          width: `${item.val}%`,
                          background: bgGrad,
                        }}
                      >
                        {item.val > 15 ? `${item.val.toFixed(1).replace(".", ",")}%` : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
