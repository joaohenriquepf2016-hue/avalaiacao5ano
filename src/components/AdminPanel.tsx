import React, { useState, useEffect } from "react";
import { Student, FirebaseConfig, SUBJECT_LIST } from "../types";
import { 
  Lock, Settings, Plus, Trash2, Edit2, Save, Database, Brain, 
  Download, Loader2, Sparkles, Upload, FileText, Check, AlertCircle, TrendingUp
} from "lucide-react";
import { generateSingleHtml } from "../utils/exportHtml";

interface AdminPanelProps {
  students: Student[];
  onSaveStudents: (updatedStudents: Student[]) => Promise<boolean>;
  firebaseConfig: FirebaseConfig | null;
  onSaveFirebaseConfig: (config: FirebaseConfig | null) => Promise<boolean>;
  connectionSource: string;
  onSelectStudentForDashboard: (student: Student) => void;
}

export default function AdminPanel({
  students,
  onSaveStudents,
  firebaseConfig,
  onSaveFirebaseConfig,
  connectionSource,
  onSelectStudentForDashboard
}: AdminPanelProps) {
  
  // Tab states: 'roster' | 'grades' | 'firebase'
  const [activeTab, setActiveTab] = useState<"roster" | "grades" | "firebase">("roster");
  
  // Selected student to edit grades
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form student details
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhoto, setNewStudentPhoto] = useState("");
  const [newStudentTurma, setNewStudentTurma] = useState("5º A");

  // Roster listing filters
  const [rosterClassFilter, setRosterClassFilter] = useState("TODOS");

  // Grade edit spreadsheet states
  const [editBoletim, setEditBoletim] = useState<{ [subject: string]: any }>({});
  const [editSimulados, setEditSimulados] = useState<{ [key: string]: { portugues: string; matematica: string; portuguesLevel?: string; matematicaLevel?: string } }>({
    s1: { portugues: "", matematica: "", portuguesLevel: "", matematicaLevel: "" },
    s2: { portugues: "", matematica: "", portuguesLevel: "", matematicaLevel: "" },
    s3: { portugues: "", matematica: "", portuguesLevel: "", matematicaLevel: "" }
  });
  const [editAnalysis, setEditAnalysis] = useState("");
  const [editTurma, setEditTurma] = useState("");

  // Firebase configuration form
  const [dbURL, setDbURL] = useState(firebaseConfig?.databaseURL || "");
  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || "");

  // Processing indicators
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync Firebase form fields if config prop changes
  useEffect(() => {
    if (firebaseConfig) {
      setDbURL(firebaseConfig.databaseURL);
      setApiKey(firebaseConfig.apiKey);
    }
  }, [firebaseConfig]);

  // Load student grades into form when selected
  const loadStudentIntoForm = (student: Student) => {
    const boletimCopy: { [subj: string]: any } = {};
    SUBJECT_LIST.forEach((subj) => {
      boletimCopy[subj] = student.boletim?.[subj] 
        ? { ...student.boletim[subj] } 
        : { b1: null, b2: null, b3: null, b4: null, rec: null };
    });
    setEditBoletim(boletimCopy);

    // Dynamic keys load
    const loadedSims: { [key: string]: { portugues: string; matematica: string; portuguesLevel?: string; matematicaLevel?: string } } = {};
    const keysSet = new Set<string>(["s1", "s2", "s3"]);
    students.forEach((s) => {
      if (s.simulados) {
        Object.keys(s.simulados).forEach((k) => keysSet.add(k));
      }
    });
    keysSet.forEach((key) => {
      loadedSims[key] = {
        portugues: student.simulados?.[key]?.portugues?.toString() || "",
        matematica: student.simulados?.[key]?.matematica?.toString() || "",
        portuguesLevel: student.simulados?.[key]?.portuguesLevel || "",
        matematicaLevel: student.simulados?.[key]?.matematicaLevel || ""
      };
    });
    setEditSimulados(loadedSims);

    setEditAnalysis(student.analysis || "");
    setEditTurma(student.turma || "5º A");
  };

  // Handle adding a new simulado
  const handleAddSimulado = () => {
    const keys = Object.keys(editSimulados);
    let maxNum = 0;
    keys.forEach((k) => {
      const m = k.match(/\d+/);
      if (m) {
        const num = parseInt(m[0], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    const nextKey = `s${nextNum}`;
    
    setEditSimulados((prev) => ({
      ...prev,
      [nextKey]: { portugues: "", matematica: "", portuguesLevel: "", matematicaLevel: "" }
    }));
  };

  // Select first student automatically when switching to Grades Tab
  useEffect(() => {
    if (activeTab === "grades" && students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
      loadStudentIntoForm(students[0]);
    }
  }, [activeTab, students, selectedStudent]);

  // Handle saving student grades
  const handleSaveGrades = async () => {
    if (!selectedStudent) return;
    setIsSaving(true);

    const formattedSimulados: { [key: string]: { portugues: number | null; matematica: number | null; portuguesLevel?: string; matematicaLevel?: string } } = {};
    Object.keys(editSimulados).forEach((key) => {
      const portVal = editSimulados[key].portugues;
      const matVal = editSimulados[key].matematica;
      const portLevel = editSimulados[key].portuguesLevel;
      const matLevel = editSimulados[key].matematicaLevel;
      formattedSimulados[key] = {
        portugues: portVal === "" ? null : parseFloat(portVal),
        matematica: matVal === "" ? null : parseFloat(matVal),
        portuguesLevel: portLevel || "",
        matematicaLevel: matLevel || ""
      };
    });

    const updatedStudent: Student = {
      ...selectedStudent,
      boletim: { ...editBoletim },
      simulados: formattedSimulados,
      analysis: editAnalysis,
      turma: editTurma.trim() || "5º A"
    };

    const updatedList = students.map((s) => (s.id === selectedStudent.id ? updatedStudent : s));
    const success = await onSaveStudents(updatedList);
    
    setIsSaving(false);
    if (success) {
      setSelectedStudent(updatedStudent);
      alert("Notas de " + selectedStudent.name + " salvas com sucesso!");
    } else {
      alert("Falha ao salvar as notas.");
    }
  };

  // AI Scanner flow: call Express /api/extract-grades
  const handleAiScanReportCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result?.toString().split(",")[1];
        const mimeType = file.type;

        const response = await fetch("/api/extract-grades", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ imageBase64: base64Data, mimeType })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Merge extracted Boletim grades (B1)
          if (data.boletim) {
            const mergedBoletim = { ...editBoletim };
            Object.keys(data.boletim).forEach((subj) => {
              const upperSubj = subj.toUpperCase().trim();
              if (SUBJECT_LIST.includes(upperSubj)) {
                if (!mergedBoletim[upperSubj]) {
                  mergedBoletim[upperSubj] = { b1: null, b2: null, b3: null, b4: null, rec: null };
                }
                mergedBoletim[upperSubj].b1 = data.boletim[subj]?.b1 ?? null;
              }
            });
            setEditBoletim(mergedBoletim);
          }

          // Merge extracted Simulados results
          if (data.simulados) {
            const mergedSimulados = { ...editSimulados };
            Object.keys(data.simulados).forEach((simKey) => {
              if (!mergedSimulados[simKey]) {
                mergedSimulados[simKey] = { portugues: "", matematica: "" };
              }
              if (data.simulados[simKey].portugues !== undefined && data.simulados[simKey].portugues !== null) {
                mergedSimulados[simKey].portugues = data.simulados[simKey].portugues.toString();
              }
              if (data.simulados[simKey].matematica !== undefined && data.simulados[simKey].matematica !== null) {
                mergedSimulados[simKey].matematica = data.simulados[simKey].matematica.toString();
              }
            });
            setEditSimulados(mergedSimulados);
          }

          alert("Escaneamento concluído! As notas detectadas pelo Gemini foram preenchidas no formulário. Revise-as e clique em 'Salvar Alterações'.");
        } else {
          const err = await response.json();
          alert("Falha no escaneamento por IA: " + (err.error || "Erro desconhecido"));
        }
      } catch (error) {
        console.error(error);
        alert("Erro de conexão ao processar imagem.");
      } finally {
        setIsScanning(false);
      }
    };
  };

  // AI Pedagogical Analysis Generator: call Express /api/generate-analysis
  const handleAiGenerateAnalysis = async () => {
    if (!selectedStudent) return;
    setIsGeneratingAnalysis(true);

    try {
      const response = await fetch("/api/generate-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          boletim: editBoletim,
          simulados: editSimulados
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEditAnalysis(data.analysis || "");
      } else {
        const err = await response.json();
        alert("Erro ao gerar análise por IA: " + (err.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o serviço de Inteligência Artificial.");
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Save Firebase RTDB configurations
  const handleSaveFirebaseConfig = async () => {
    if (!dbURL.trim()) {
      alert("URL do Realtime Database é obrigatória!");
      return;
    }
    const success = await onSaveFirebaseConfig({
      databaseURL: dbURL.trim(),
      apiKey: apiKey.trim()
    });

    if (success) {
      alert("Configurações do Firebase salvas e sincronizadas com sucesso!");
    } else {
      alert("Não foi possível conectar ao Firebase. Verifique a URL e as permissões.");
    }
  };

  // Export full app as single downloadable HTML file
  const handleExportSingleHtmlFile = () => {
    const htmlContent = generateSingleHtml(students, firebaseConfig);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
      {/* Tab Select Side Rail */}
      <div className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase px-2 mb-2 select-none">
          GERENCIAMENTO
        </p>

        <button
          onClick={() => setActiveTab("roster")}
          className={`w-full text-left font-bold text-xs px-3 py-3 rounded-lg flex items-center gap-2.5 transition ${
            activeTab === "roster"
              ? "bg-[#1a60a0] text-white shadow-md shadow-[#1a60a0]/20"
              : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
          }`}
        >
          <Settings size={15} /> Relação de Alunos
        </button>

        <button
          onClick={() => setActiveTab("grades")}
          className={`w-full text-left font-bold text-xs px-3 py-3 rounded-lg flex items-center gap-2.5 transition ${
            activeTab === "grades"
              ? "bg-[#1a60a0] text-white shadow-md shadow-[#1a60a0]/20"
              : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
          }`}
        >
          <Edit2 size={15} /> Lançamento de Notas
        </button>

        <button
          onClick={() => setActiveTab("firebase")}
          className={`w-full text-left font-bold text-xs px-3 py-3 rounded-lg flex items-center gap-2.5 transition ${
            activeTab === "firebase"
              ? "bg-[#1a60a0] text-white shadow-md shadow-[#1a60a0]/20"
              : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
          }`}
        >
          <Database size={15} /> Conexão Firebase RTDB
        </button>
      </div>

      {/* Main Form Working Panel */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm w-full min-h-[500px]">
        
        {/* ==================== 1. ROSTER TAB ==================== */}
        {activeTab === "roster" && (
          <div>
            <div className="border-b pb-4 mb-6">
              <h3 className="font-display font-black text-xl text-slate-800">
                Alunos Matriculados
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Cadastre novos registros escolares ou remova perfis de todas as turmas
              </p>
            </div>

            {/* Registration Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 shadow-inner">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3.5 flex items-center gap-1">
                <Plus size={14} className="text-emerald-500" /> Cadastrar Novo Aluno
              </h4>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    NOME COMPLETO DO ESTUDANTE
                  </label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value.toUpperCase())}
                    placeholder="EX: ANDRÉ COSTA"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1a60a0] focus:ring-1 focus:ring-[#1a60a0]/10 transition-all"
                  />
                </div>

                <div className="w-full sm:w-44">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    TURMA DO ESTUDANTE
                  </label>
                  <input
                    type="text"
                    list="existing-turmas"
                    value={newStudentTurma}
                    onChange={(e) => setNewStudentTurma(e.target.value.toUpperCase())}
                    placeholder="EX: 5º A"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1a60a0] focus:ring-1 focus:ring-[#1a60a0]/10 transition-all"
                  />
                  <datalist id="existing-turmas">
                    {Array.from(new Set(students.map((st) => st.turma || "5º A"))).sort().map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    FOTO DE PERFIL DO ALUNO (PNG/JPG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setNewStudentPhoto(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-slate-500 font-bold file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer focus:outline-none"
                  />
                </div>

                <button
                  onClick={async () => {
                    if (!newStudentName.trim()) {
                      alert("Digite o nome do estudante!");
                      return;
                    }
                    const sId = newStudentName.trim().toLowerCase().replace(/\s+/g, "-");
                    
                    const emptyBoletim: { [subj: string]: any } = {};
                    SUBJECT_LIST.forEach((subj) => {
                      emptyBoletim[subj] = { b1: null, b2: null, b3: null, b4: null, rec: null };
                    });

                    const freshStudent: Student = {
                      id: sId,
                      name: newStudentName.trim(),
                      photo: newStudentPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newStudentName)}`,
                      boletim: emptyBoletim,
                      simulados: (() => {
                        const initialSimulados: { [key: string]: { portugues: null; matematica: null } } = {};
                        const keysSet = new Set<string>(["s1", "s2", "s3"]);
                        students.forEach((s) => {
                          if (s.simulados) {
                            Object.keys(s.simulados).forEach((k) => keysSet.add(k));
                          }
                        });
                        keysSet.forEach((key) => {
                          initialSimulados[key] = { portugues: null, matematica: null };
                        });
                        return initialSimulados;
                      })(),
                      analysis: "",
                      turma: newStudentTurma.trim() || "5º A"
                    };

                    const updated = [...students, freshStudent];
                    const success = await onSaveStudents(updated);
                    if (success) {
                      setNewStudentName("");
                      setNewStudentPhoto("");
                      alert("Estudante " + freshStudent.name + " matriculado com sucesso!");
                    } else {
                      alert("Erro ao registrar novo estudante.");
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl inline-flex items-center gap-1.5 transition shadow-sm h-[40px] shrink-0"
                >
                  <Plus size={15} /> Confirmar Matrícula
                </button>
              </div>
            </div>

            {/* Roster Class Filter */}
            <div className="flex flex-wrap items-center gap-1.5 mb-6 bg-slate-50 border p-2.5 rounded-xl">
              <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase px-2 py-1">
                Filtrar por Turma:
              </span>
              {["TODOS", ...Array.from(new Set(students.map((st) => st.turma || "5º A"))).sort()].map((t) => (
                <button
                  key={t}
                  onClick={() => setRosterClassFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all duration-200 cursor-pointer ${
                    rosterClassFilter === t
                      ? "bg-[#1a60a0] text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 bg-white/50 border border-slate-200/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Student List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students
                .filter((s) => rosterClassFilter === "TODOS" || (s.turma || "5º A") === rosterClassFilter)
                .map((s) => (
                <div
                  key={s.id}
                  className="border border-slate-200 rounded-xl p-3.5 flex justify-between items-center bg-white hover:border-[#1a60a0]/30 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      referrerPolicy="no-referrer"
                      src={s.photo}
                      alt={s.name}
                      className="w-11 h-11 rounded-full object-cover bg-slate-50 border border-slate-100 shadow-inner"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 leading-tight uppercase flex flex-wrap items-center gap-1.5">
                        {s.name}
                        <span className="bg-[#eef2f9] text-[#1a60a0] border border-slate-200/60 rounded-md px-1.5 py-0.5 text-[8px] font-black tracking-wider uppercase">
                          {s.turma || "5º A"}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                        Cod: {s.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onSelectStudentForDashboard(s)}
                      className="p-2 text-slate-400 hover:text-[#1a60a0] hover:bg-[#1a60a0]/5 rounded-lg transition"
                      title="Ver Dashboard"
                    >
                      <FileText size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("grades");
                        setSelectedStudent(s);
                        loadStudentIntoForm(s);
                      }}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Lançar Notas"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Deseja realmente desmatricular o aluno(a) ${s.name}?`)) {
                          const filtered = students.filter((st) => st.id !== s.id);
                          await onSaveStudents(filtered);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Excluir Aluno"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 2. GRADES TAB ==================== */}
        {activeTab === "grades" && (
          <div>
            <div className="border-b pb-4 mb-6">
              <h3 className="font-display font-black text-xl text-slate-800">
                Lançador de Notas
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Modifique as notas escolares e simulados manualmente, ou use a IA para escanear um boletim.
              </p>
            </div>

            {/* Selector list & AI tools panel */}
            <div className="mb-6 flex flex-wrap gap-4 items-center bg-slate-50 border p-4 rounded-xl">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  SELECIONE O ALUNO DA TURMA
                </label>
                <select
                  value={selectedStudent?.id || ""}
                  onChange={(e) => {
                    const found = students.find((s) => s.id === e.target.value);
                    if (found) {
                      setSelectedStudent(found);
                      loadStudentIntoForm(found);
                    }
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1a60a0]"
                >
                  <option value="" disabled>
                    Escolha um estudante...
                  </option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.turma || "5º A"})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="w-full md:w-48">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    TURMA DO ALUNO
                  </label>
                  <input
                    type="text"
                    value={editTurma}
                    onChange={(e) => setEditTurma(e.target.value.toUpperCase())}
                    placeholder="EX: 5º A"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1a60a0]"
                  />
                </div>
              )}

              {selectedStudent && (
                <div className="flex flex-wrap gap-2 pt-5">
                  {/* AI Scanner Button */}
                  <label className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 transition shadow-sm h-[36px]">
                    {isScanning ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-amber-800" />
                        Lendo Boletim...
                      </>
                    ) : (
                      <>
                        <Brain size={14} className="text-amber-700" />
                        Escanear Boletim (Foto/IA)
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAiScanReportCard}
                      disabled={isScanning}
                      className="hidden"
                    />
                  </label>

                  {/* AI Analysis Button */}
                  <button
                    onClick={handleAiGenerateAnalysis}
                    disabled={isGeneratingAnalysis}
                    className="bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm h-[36px]"
                  >
                    {isGeneratingAnalysis ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-sky-800" />
                        Gerando parecer...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-sky-700" />
                        Gerar Parecer Pedagógico
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {selectedStudent ? (
              <div className="space-y-6">
                {/* Simulados Segment */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <h4 className="text-[10px] font-black text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                      <TrendingUp size={15} className="text-[#1a60a0]" /> Resultados de Simulados (% de Acertos)
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddSimulado}
                      className="text-[10px] font-bold bg-[#1a60a0] hover:bg-[#154d80] text-white px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-sm"
                    >
                      <Plus size={12} /> Acrescentar Simulado
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 divide-y md:divide-y-0 divide-slate-100">
                    {Object.keys(editSimulados).sort((a, b) => {
                      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
                    }).map((simId, idx) => {
                      const sKey = simId;
                      const num = simId.match(/\d+/);
                      const label = num ? `${num[0]}º SIMULADO SPABB` : simId.toUpperCase();
                      return (
                        <div key={simId} className="pt-4 md:pt-0 sm:px-2 first:pl-0">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-black text-[10px] text-[#1a60a0]">
                              {label}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditSimulados((prev) => {
                                  const copy = { ...prev };
                                  delete copy[sKey];
                                  return copy;
                                });
                              }}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded transition duration-150 flex items-center justify-center"
                              title="Excluir este simulado"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">
                                  PORT (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={editSimulados[sKey]?.portugues || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    let calculatedLvl = editSimulados[sKey]?.portuguesLevel;
                                    const numVal = parseFloat(val);
                                    if (!isNaN(numVal)) {
                                      if (numVal >= 85) calculatedLvl = "ADEQUADO";
                                      else if (numVal >= 70) calculatedLvl = "INTERMEDIÁRIO";
                                      else if (numVal >= 50) calculatedLvl = "CRÍTICO";
                                      else calculatedLvl = "MUITO CRÍTICO";
                                    } else {
                                      calculatedLvl = "";
                                    }
                                    setEditSimulados({
                                      ...editSimulados,
                                      [sKey]: { ...editSimulados[sKey], portugues: val, portuguesLevel: calculatedLvl }
                                    });
                                  }}
                                  placeholder="0.0"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold mt-1 text-slate-700 focus:outline-none focus:border-[#1a60a0]"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">
                                  MAT (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={editSimulados[sKey]?.matematica || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    let calculatedLvl = editSimulados[sKey]?.matematicaLevel;
                                    const numVal = parseFloat(val);
                                    if (!isNaN(numVal)) {
                                      if (numVal >= 85) calculatedLvl = "ADEQUADO";
                                      else if (numVal >= 70) calculatedLvl = "INTERMEDIÁRIO";
                                      else if (numVal >= 50) calculatedLvl = "CRÍTICO";
                                      else calculatedLvl = "MUITO CRÍTICO";
                                    } else {
                                      calculatedLvl = "";
                                    }
                                    setEditSimulados({
                                      ...editSimulados,
                                      [sKey]: { ...editSimulados[sKey], matematica: val, matematicaLevel: calculatedLvl }
                                    });
                                  }}
                                  placeholder="0.0"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold mt-1 text-slate-700 focus:outline-none focus:border-[#1a60a0]"
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <label className="text-[8px] font-black text-[#1a60a0]/80 uppercase block">
                                  Nível PORT
                                </label>
                                <select
                                  value={editSimulados[sKey]?.portuguesLevel || ""}
                                  onChange={(e) =>
                                    setEditSimulados({
                                      ...editSimulados,
                                      [sKey]: { ...editSimulados[sKey], portuguesLevel: e.target.value }
                                    })
                                  }
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-[#1a60a0] bg-white cursor-pointer mt-0.5"
                                >
                                  <option value="">Auto (Nota)</option>
                                  <option value="MUITO CRÍTICO">MUITO CRÍTICO</option>
                                  <option value="CRÍTICO">CRÍTICO</option>
                                  <option value="INTERMEDIÁRIO">INTERMEDIÁRIO</option>
                                  <option value="ADEQUADO">ADEQUADO</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="text-[8px] font-black text-[#e05a00]/80 uppercase block">
                                  Nível MAT
                                </label>
                                <select
                                  value={editSimulados[sKey]?.matematicaLevel || ""}
                                  onChange={(e) =>
                                    setEditSimulados({
                                      ...editSimulados,
                                      [sKey]: { ...editSimulados[sKey], matematicaLevel: e.target.value }
                                    })
                                  }
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-[#1a60a0] bg-white cursor-pointer mt-0.5"
                                >
                                  <option value="">Auto (Nota)</option>
                                  <option value="MUITO CRÍTICO">MUITO CRÍTICO</option>
                                  <option value="CRÍTICO">CRÍTICO</option>
                                  <option value="INTERMEDIÁRIO">INTERMEDIÁRIO</option>
                                  <option value="ADEQUADO">ADEQUADO</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Boletim Table Segment */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-500 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                    <FileText size={15} className="text-[#1a60a0]" /> Boletim (Notas Escolares 0.0 - 10.0)
                  </h4>
                  <div className="overflow-x-auto max-h-[400px] border border-slate-150 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="p-3 pl-4">COMPONENTE</th>
                          <th>1º BIM.</th>
                          <th>2º BIM.</th>
                          <th>3º BIM.</th>
                          <th>4º BIM.</th>
                          <th>REC.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {SUBJECT_LIST.map((subj) => (
                          <tr key={subj} className="hover:bg-slate-50/50">
                            <td className="p-2.5 pl-4 font-bold text-slate-800 text-xs">
                              {subj}
                            </td>
                            {["b1", "b2", "b3", "b4", "rec"].map((bKey) => (
                              <td key={bKey} className="py-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={
                                    editBoletim[subj]?.[bKey] !== undefined &&
                                    editBoletim[subj]?.[bKey] !== null
                                      ? editBoletim[subj][bKey]
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const valStr = e.target.value;
                                    const copy = { ...editBoletim };
                                    if (!copy[subj]) {
                                      copy[subj] = { b1: null, b2: null, b3: null, b4: null, rec: null };
                                    }
                                    copy[subj][bKey] = valStr === "" ? null : parseFloat(valStr);
                                    setEditBoletim(copy);
                                  }}
                                  placeholder="—"
                                  className="w-16 border border-slate-200 rounded-lg py-1 font-mono font-bold text-center focus:outline-none focus:border-[#1a60a0] focus:ring-1 focus:ring-[#1a60a0]/10"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Review Text Block */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <Brain size={15} className="text-[#1a60a0]" /> Parecer / Análise Pedagógica
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold mb-3">
                    Relatório geral do conselho de classe ou análise dinâmica de progresso gerada por IA.
                  </p>
                  <textarea
                    rows={4}
                    value={editAnalysis}
                    onChange={(e) => setEditAnalysis(e.target.value)}
                    placeholder="Escreva a análise acadêmica de forma manual, ou use a ferramenta de Inteligência Artificial para gerar um parecer pedagógico baseado nas notas atuais."
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs leading-relaxed font-semibold text-slate-700 focus:outline-none focus:border-[#1a60a0]"
                  ></textarea>
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveGrades}
                    disabled={isSaving}
                    className="bg-[#1a60a0] hover:bg-[#124b80] text-white font-black text-xs px-6 py-3 rounded-xl inline-flex items-center gap-1.5 transition shadow-md h-[42px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white" />
                        Salvando Notas...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Salvar Avaliações do Aluno
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Nenhum estudante selecionado
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. FIREBASE CONFIG TAB ==================== */}
        {activeTab === "firebase" && (
          <div>
            <div className="border-b pb-4 mb-6">
              <h3 className="font-display font-black text-xl text-slate-800">
                Conectar Banco de Dados Firebase
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Utilize o Firebase Realtime Database para salvar e ler as notas na nuvem em tempo real de qualquer lugar.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 shadow-inner space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  URL DO SEU BANCO DE DADOS (Realtime Database URL)
                </label>
                <input
                  type="text"
                  value={dbURL}
                  onChange={(e) => setDbURL(e.target.value)}
                  placeholder="EX: https://minha-escola-rtdb.firebaseio.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1a60a0]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  CHAVE API WEB (Opcional - caso utilize regras de autenticação)
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Sua Web API Key do Firebase ou database secret"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1a60a0]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleSaveFirebaseConfig}
                className="bg-[#1a60a0] hover:bg-[#124b80] text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-md"
              >
                <Database size={15} /> Salvar e Sincronizar Nuvem
              </button>

              <button
                onClick={async () => {
                  if (confirm("Confirmar exclusão da conexão Firebase? Seus dados permanecerão salvos apenas em cache local do navegador.")) {
                    const success = await onSaveFirebaseConfig(null);
                    if (success) {
                      setDbURL("");
                      setApiKey("");
                      alert("Conexão Firebase deletada com sucesso!");
                    }
                  }
                }}
                className="border border-rose-200 text-rose-600 hover:bg-rose-50 font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
              >
                <Trash2 size={15} /> Remover Conexão
              </button>

              <button
                onClick={handleExportSingleHtmlFile}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-md ml-auto"
              >
                <Download size={15} /> Exportar como HTML Único
              </button>
            </div>

            {/* Instruction Segment */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-1">
                <Check size={14} className="text-emerald-500" /> Como publicar no GitHub Pages?
              </h4>
              <ul className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
                <li>
                  Crie um repositório no seu <span className="font-bold text-[#1a60a0]">GitHub</span>.
                </li>
                <li>
                  Gere o arquivo consolidado clicando em <span className="font-bold text-emerald-600">"Exportar como HTML Único"</span>. O arquivo baixado conterá todas as notas atuais e o endereço do seu Firebase de forma integrada.
                </li>
                <li>
                  Faça o upload do arquivo com o nome exato de <span className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">index.html</span> para o repositório.
                </li>
                <li>
                  Acesse as configurações do repositório no GitHub, procure por <span className="font-bold">Pages</span> e ative-o selecionando a branch principal (<span className="font-mono bg-slate-100 px-1 rounded">main</span>).
                </li>
                <li>
                  Seu site estará no ar! Qualquer alteração ou visualização lerá e escreverá diretamente no seu Firebase Realtime Database.
                </li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
