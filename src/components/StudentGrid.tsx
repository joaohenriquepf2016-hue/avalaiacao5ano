import React from "react";
import { Student } from "../types";
import { Search, GraduationCap, AlertTriangle } from "lucide-react";

interface StudentGridProps {
  students: Student[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectStudent: (student: Student) => void;
  selectedTurma: string;
  setSelectedTurma: (turma: string) => void;
}

export default function StudentGrid({
  students,
  searchQuery,
  setSearchQuery,
  onSelectStudent,
  selectedTurma,
  setSelectedTurma
}: StudentGridProps) {
  
  // Dynamically extract all unique classes (turmas)
  const turmas = Array.from(new Set(students.map((s) => s.turma || "5º A")));
  if (turmas.length === 0) {
    turmas.push("5º A");
  }
  turmas.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  // Ensure selectedTurma is still valid, else select first one
  React.useEffect(() => {
    if (!turmas.includes(selectedTurma) && turmas.length > 0) {
      setSelectedTurma(turmas[0]);
    }
  }, [students, turmas, selectedTurma, setSelectedTurma]);

  const studentsInTurma = students.filter((s) => (s.turma || "5º A") === selectedTurma);

  const filteredStudents = studentsInTurma.filter((s) =>
    s.name.toUpperCase().includes(searchQuery.toUpperCase())
  );

  return (
    <div className="w-full">
      {/* Search and Subtitle Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="font-display font-black text-3xl text-slate-800 tracking-tight">
            Alunos Matriculados
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Selecione um aluno da turma para visualizar seu Boletim e Simulados
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 shadow-sm rounded-xl">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a60a0]/20 focus:border-[#1a60a0] transition-all"
          />
        </div>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-8 bg-white border border-slate-200/80 p-1.5 rounded-xl w-fit shadow-sm">
        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase px-3 py-1">
          Selecione a Turma:
        </span>
        {turmas.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTurma(t)}
            className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all duration-200 cursor-pointer ${
              selectedTurma === t
                ? "bg-[#1a60a0] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid and Big Badge Container */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Student Cards Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 w-full">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => {
              // Quick check if the student is falling behind in the latest Simulado
              const isCriticalS3 =
                (student.simulados?.s3?.portugues !== null && student.simulados.s3.portugues < 70) ||
                (student.simulados?.s3?.matematica !== null && student.simulados.s3.matematica < 70);

              return (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="group cursor-pointer bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_4px_22px_rgba(74,128,196,0.18)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                    <img
                      referrerPolicy="no-referrer"
                      src={student.photo}
                      alt={student.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    
                    {/* Critical Alert Indicator */}
                    {isCriticalS3 && (
                      <div
                        className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md border border-white"
                        title="Necessita Atenção nos Simulados"
                      >
                        <AlertTriangle size={12} className="animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Student Name Blue Bar - matches screenshot */}
                  <div className="bg-[#1a60a0] text-white text-center py-2 px-1 font-display font-black tracking-wider text-[11px] truncate uppercase">
                    {student.name}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center bg-white border rounded-xl w-full">
              <GraduationCap className="mx-auto text-slate-300 mb-2" size={40} />
              <p className="text-sm text-slate-400 font-bold">Nenhum aluno encontrado nesta turma</p>
            </div>
          )}
        </div>

        {/* Dynamic Class Big Badge - matches screenshot but dynamic */}
        <div className="w-full lg:w-72 bg-gradient-to-br from-[#cce8f8] to-[#92c5eb] border-2 border-[#70b0d8] rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden shrink-0 min-h-[300px]">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <GraduationCap size={200} className="text-sky-950" />
          </div>
          <h2 className="font-display font-black text-5xl lg:text-7xl text-sky-800 tracking-wider drop-shadow-md break-all">
            {selectedTurma}
          </h2>
          <p className="font-bold text-sky-900 tracking-widest text-xs uppercase mt-4">
            Ensino Fundamental I
          </p>
          <p className="text-[10px] text-sky-700/80 font-bold uppercase mt-1">
            EMEF Antonio Barroso Braga
          </p>
          <div className="mt-6 border-t border-sky-400/30 pt-4 w-full">
            <p className="text-2xl font-mono font-black text-sky-950">
              {studentsInTurma.length}
            </p>
            <p className="text-[9px] text-sky-800 font-bold uppercase tracking-widest">
              Alunos Registrados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
