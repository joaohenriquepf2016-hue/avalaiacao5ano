import React, { useState, useEffect } from "react";
import { Student, FirebaseConfig } from "./types";
import { 
  fetchStudents, 
  saveStudents, 
  getFirebaseConfig, 
  saveFirebaseConfig,
  isFirebaseConnected
} from "./firebaseService";
import StudentGrid from "./components/StudentGrid";
import StudentDashboard from "./components/StudentDashboard";
import AdminPanel from "./components/AdminPanel";
import { 
  GraduationCap, 
  Lock, 
  LogOut, 
  Settings, 
  Sparkles, 
  X,
  ShieldAlert,
  HelpCircle,
  Download
} from "lucide-react";
import { generateSingleHtml } from "./utils/exportHtml";

export default function App() {
  // Navigation / Views: 'grid' | 'dashboard' | 'admin'
  const [view, setView] = useState<"grid" | "dashboard" | "admin">("grid");
  
  // Student selection
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<string>("5º A");
  
  // Database connection statuses
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig | null>(null);
  const [connectionSource, setConnectionSource] = useState<string>("Carregando...");
  const [searchQuery, setSearchQuery] = useState("");

  // Admin security
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // On mount: fetch records
  useEffect(() => {
    const config = getFirebaseConfig();
    setFirebaseConfig(config);
    loadStudents();
  }, []);

  // Fetch student roster
  const loadStudents = async () => {
    setConnectionSource("Conectando...");
    const result = await fetchStudents();
    setStudents(result.students);
    
    // Label connection status nicely
    if (result.source === "firebase") {
      setConnectionSource("Firebase Realtime DB");
    } else if (result.source === "local") {
      setConnectionSource("Cache Local (Navegador)");
    } else {
      setConnectionSource("Demonstração (5º Ano A)");
    }
  };

  // Save student roster
  const handleSaveStudents = async (updatedList: Student[]) => {
    setStudents(updatedList);
    const success = await saveStudents(updatedList);
    
    // If we updated the currently displayed student in dashboard or admin, update their active reference
    if (selectedStudent) {
      const refreshed = updatedList.find(s => s.id === selectedStudent.id);
      if (refreshed) setSelectedStudent(refreshed);
    }
    return success;
  };

  // Save Firebase configuration and trigger sync
  const handleSaveFirebaseConfig = async (newConfig: FirebaseConfig | null) => {
    saveFirebaseConfig(newConfig);
    setFirebaseConfig(newConfig);
    
    if (newConfig) {
      setConnectionSource("Sincronizando...");
      // Re-run save to upload current list immediately to the new database
      const success = await saveStudents(students);
      if (success) {
        setConnectionSource("Firebase Realtime DB");
        return true;
      } else {
        setConnectionSource("Cache Local (Navegador)");
        return false;
      }
    } else {
      setConnectionSource("Cache Local (Navegador)");
      return true;
    }
  };

  // Handle Admin Auth Challenge
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "spabb123") {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPasswordInput("");
      setView("admin");
    } else {
      alert("Senha administrativa inválida! Utilize: spabb123");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f9] flex flex-col font-sans selection:bg-[#1a60a0]/10 selection:text-[#1a60a0]">
      
      {/* ══ TOP NAVIGATION BAR ══ */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-30 shadow-sm">
        <div 
          onClick={() => { setView("grid"); setSelectedStudent(null); }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <GraduationCap className="text-emerald-600 group-hover:scale-105 transition-transform" size={32} />
          <div className="flex flex-col">
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-tighter leading-none">
              SPABB
            </h1>
            <span className="text-[9px] font-black tracking-widest text-emerald-700 uppercase leading-none mt-1">
              Avaliações Escolares
            </span>
          </div>
        </div>

        {/* Database Connectivity and User Controls */}
        <div className="flex items-center gap-4">
          {/* Connection status pills */}
          <div 
            onClick={loadStudents}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase select-none cursor-pointer border shadow-sm transition ${
              connectionSource.includes("Firebase") 
                ? "bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100" 
                : connectionSource.includes("Conectando")
                ? "bg-sky-50 text-sky-800 border-sky-100 animate-pulse"
                : "bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              connectionSource.includes("Firebase") 
                ? "bg-emerald-500 shadow-sm animate-pulse" 
                : connectionSource.includes("Conectando")
                ? "bg-sky-500 animate-spin"
                : "bg-amber-500 shadow-sm"
            }`}></span>
            {connectionSource}
          </div>

          {/* Router Action Controls */}
          {isAdmin ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setView("admin")}
                className={`text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
                  view === "admin"
                    ? "bg-[#1a60a0] text-white shadow-md shadow-[#1a60a0]/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Settings size={14} /> Painel Admin
              </button>
              <button 
                onClick={() => { setIsAdmin(false); setView("grid"); setSelectedStudent(null); }}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowLoginModal(true)}
                className="bg-[#1a60a0] hover:bg-[#154a7c] text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-md shadow-[#1a60a0]/15"
              >
                <Lock size={14} /> Administrador
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ══ MAIN BODY CONTAINER ══ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        
        {/* View Switching Router Router */}
        {view === "grid" && (
          <StudentGrid
            students={students}
            selectedTurma={selectedTurma}
            setSelectedTurma={setSelectedTurma}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectStudent={(s) => {
              setSelectedStudent(s);
              setView("dashboard");
            }}
          />
        )}

        {view === "dashboard" && selectedStudent && (
          <StudentDashboard
            student={selectedStudent}
            onBack={() => {
              setView("grid");
              setSelectedStudent(null);
            }}
            allStudents={students}
            firebaseConfig={firebaseConfig}
          />
        )}

        {view === "admin" && isAdmin && (
          <AdminPanel
            students={students}
            onSaveStudents={handleSaveStudents}
            firebaseConfig={firebaseConfig}
            onSaveFirebaseConfig={handleSaveFirebaseConfig}
            connectionSource={connectionSource}
            onSelectStudentForDashboard={(s) => {
              setSelectedStudent(s);
              setView("dashboard");
            }}
          />
        )}

      </main>

      {/* ══ FOOTER ══ */}
      <footer className="text-center text-[10px] text-slate-400 font-bold tracking-widest uppercase py-8 border-t border-slate-200/50 bg-white/50 select-none">
        SPABB · EMEF ANTONIO BARROSO BRAGA · DASHBOARD DE AVALIAÇÕES ESCOLARES
      </footer>

      {/* ══ ADMIN AUTHENTICATION SECURITY DIALOG ══ */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-amber-50 text-amber-600 rounded-full p-3 mb-3 border border-amber-100">
                <ShieldAlert size={24} />
              </div>
              <h3 className="font-display font-black text-slate-800 text-lg">
                Identificação do Administrador
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Acesse com a senha do sistema para lançar notas e conectar o banco de dados.
              </p>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  SENHA DE ACESSO
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Senha padrão: spabb123"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1a60a0]"
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#1a60a0] hover:bg-[#124b80] text-white font-black text-xs py-3 rounded-xl transition shadow-md shadow-[#1a60a0]/25"
              >
                Autenticar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
