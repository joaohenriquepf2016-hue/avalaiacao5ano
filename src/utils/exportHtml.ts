import { Student, FirebaseConfig } from "../types";

export function generateSingleHtml(students: Student[], firebaseConfig: FirebaseConfig | null): string {
  const studentsJson = JSON.stringify(students);
  const configJson = JSON.stringify(firebaseConfig || { databaseURL: "", apiKey: "" });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPABB · Sistema de Avaliações</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Segoe UI', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
  
  <!-- React & Babel -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
    
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      background: #eef2f9;
      color: #2c3e50;
    }

    .boletim-table thead tr:first-child th {
      background: #7da7e0; color: #fff; font-weight: 800; text-align: center; padding: 10px 8px;
    }
    .boletim-table thead tr:first-child th:first-child {
      background: #b8d0e8; color: #2c3e50; text-align: left; font-size: .75rem; border-radius: 8px 0 0 0;
    }
    .boletim-table thead tr:nth-child(2) th {
      background: #ddeaf8; color: #2c3e50; font-weight: 800; text-align: center; padding: 6px; font-size: .74rem; border-bottom: 2px solid #cdddf0;
    }
    .boletim-table tbody tr { border-bottom: 1px solid #e8eef8; }
    .boletim-table tbody tr:nth-child(even) { background: #fafcff; }
    .boletim-table tbody td { padding: 8px; text-align: center; font-size: .82rem; }

    .g10  { color: #1a6e2a; font-weight: 800; }
    .g9   { color: #2e7d2e; font-weight: 700; }
    .g85  { color: #4a8a00; font-weight: 700; }
    .g80  { color: #4a80c4; font-weight: 700; }
    .g70  { color: #c07800; font-weight: 700; }
    .g65  { color: #d06000; font-weight: 700; }
    .g60  { color: #c0392b; font-weight: 700; }
  </style>
</head>
<body>

  <div id="root"></div>

  <script type="text/babel" data-presets="env,react">
    const { useState, useEffect, useMemo } = React;

    const INITIAL_STUDENTS_EMBEDDED = ${studentsJson};
    const FIREBASE_CONFIG_EMBEDDED = ${configJson};
    const SUBJECTS = [
      "ARTE",
      "CIÊNCIAS",
      "EDUCAÇÃO ÉTNICO-RACIAL",
      "EDUCAÇÃO FINANCEIRA",
      "EDUCAÇÃO SOCIOEMOCIONAL",
      "FORMAÇÃO CIDADÃ",
      "FORMAÇÃO DO LEITOR",
      "GEOGRAFIA",
      "HABILIDADES EM FOCO – LP",
      "HABILIDADES EM FOCO – MA",
      "HISTÓRIA",
      "INGLÊS",
      "LÍNGUA PORTUGUESA",
      "MATEMÁTICA",
      "RECREAÇÃO"
    ];

    function LucideIcon({ name, size = 16, className = "" }) {
      const icons = {
        "graduation-cap": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.91a2 2 0 0 0 1.66 0z"/>
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
          </svg>
        ),
        "settings": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ),
        "log-out": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        ),
        "lock": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        ),
        "search": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        ),
        "alert-triangle": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        ),
        "chevron-left": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="m15 18-6-6 6-6"/>
          </svg>
        ),
        "file-text": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
            <path d="M10 9H8"/>
            <path d="M16 13H8"/>
            <path d="M16 17H8"/>
          </svg>
        ),
        "award": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        ),
        "trending-up": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            <polyline points="16 7 22 7 22 13"/>
          </svg>
        ),
        "bar-chart-2": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        ),
        "plus": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        ),
        "edit-2": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
        ),
        "trash-2": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        ),
        "brain": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        ),
        "sparkles": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
            <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/>
            <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
          </svg>
        ),
        "save": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
        ),
        "download": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        ),
        "x": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ),
        "database": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
          </svg>
        ),
        "plus-circle": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        ),
        "log-in": (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width={size} height={size}>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        )
      };

      return icons[name] || null;
    }

    // --- SVG Line Chart ---
    function SvgChart({ portugues, matematica, labels }) {
      const width = 600;
      const height = 340;
      const paddingLeft = 60;
      const paddingRight = 30;
      const paddingTop = 20;
      const paddingBottom = 50;

      const plotWidth = width - paddingLeft - paddingRight;
      const plotHeight = height - paddingTop - paddingBottom;

      const yMin = 30;
      const yMax = 100;
      const yRange = yMax - yMin;

      const pointsCount = portugues.length;

      const getX = (index) => {
        if (pointsCount <= 1) return paddingLeft + plotWidth / 2;
        return paddingLeft + index * (plotWidth / (pointsCount - 1));
      };
      
      const getY = (value) => {
        const clamped = Math.max(yMin, Math.min(yMax, value));
        return paddingTop + plotHeight - ((clamped - yMin) / yRange) * plotHeight;
      };

      const getPointColor = (val) => {
        if (val >= 85) return "#5cb85c";
        if (val >= 70) return "#f0a500";
        return "#c0392b";
      };

      const y70 = getY(70);
      const y85 = getY(85);
      const yBot = getY(30);
      const yTop = getY(100);

      const getStraightPathD = (data) => {
        if (data.length === 0) return "";
        const points = data.map((val, i) => ({ x: getX(i), y: getY(val) }));
        let path = "M " + points[0].x + " " + points[0].y;
        for (let i = 1; i < points.length; i++) {
          path += " L " + points[i].x + " " + points[i].y;
        }
        return path;
      };

      return (
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={\`0 0 \${width} \${height}\`} width="100%" height={height} className="min-w-[500px]">
            {/* Zones */}
            <rect x={paddingLeft} y={y85} width={plotWidth} height={y70 - y85} fill="rgba(240, 165, 0, 0.07)" />
            <rect x={paddingLeft} y={y70} width={plotWidth} height={yBot - y70} fill="rgba(192, 57, 43, 0.08)" />
            <rect x={paddingLeft} y={yTop} width={plotWidth} height={y85 - yTop} fill="rgba(92, 184, 92, 0.08)" />

            <line x1={paddingLeft} y1={y85} x2={width - paddingRight} y2={y85} stroke="#5cb85c" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.7" />
            <line x1={paddingLeft} y1={y70} x2={width - paddingRight} y2={y70} stroke="#f0a500" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6" />

            {[30, 40, 50, 60, 70, 80, 90, 100].map(tick => (
              <g key={tick}>
                <line x1={paddingLeft} y1={getY(tick)} x2={width - paddingRight} y2={getY(tick)} stroke="#e2e8f0" strokeWidth="1" opacity={0.3} />
                <text x={paddingLeft - 10} y={getY(tick) + 4} textAnchor="end" className="font-mono text-[10px] fill-slate-400 font-bold">{tick}%</text>
              </g>
            ))}

            {(labels || []).map((l, i) => (
              <g key={i}>
                <text x={getX(i)} y={paddingTop + plotHeight + 20} textAnchor="middle" className="font-sans text-[11px] font-bold fill-slate-500">{l}</text>
              </g>
            ))}

            {/* Portugues (Blue) */}
            <path d={getStraightPathD(portugues)} fill="none" stroke="#4a80c4" strokeWidth="3.5" />
            {portugues.map((v, i) => (
              <circle key={i} cx={getX(i)} cy={getY(v)} r="7" fill={getPointColor(v)} stroke="#fff" strokeWidth="2" />
            ))}

            {/* Matematica (Orange) */}
            <path d={getStraightPathD(matematica)} fill="none" stroke="#e05a00" strokeWidth="3.5" />
            {matematica.map((v, i) => (
              <circle key={i} cx={getX(i)} cy={getY(v)} r="7" fill={getPointColor(v)} stroke="#fff" strokeWidth="2" />
            ))}
          </svg>
        </div>
      );
    }

    // --- Main Application Component ---
    function App() {
      const [view, setView] = useState('grid'); // 'grid' | 'dashboard' | 'admin'
      const [students, setStudents] = useState([]);
      const [currentStudent, setCurrentStudent] = useState(null);
      const [selectedTurma, setSelectedTurma] = useState('5º A');
      const [searchQuery, setSearchQuery] = useState('');
      const [adminPassword, setAdminPassword] = useState('');
      const [isAdmin, setIsAdmin] = useState(false);
      const [showLoginModal, setShowLoginModal] = useState(false);
      const [firebaseConfig, setFirebaseConfig] = useState(FIREBASE_CONFIG_EMBEDDED);
      const [connectionSource, setConnectionSource] = useState('local');

      // Admin states
      const [adminTab, setAdminTab] = useState('roster'); // 'roster' | 'grades' | 'firebase'
      const [selectedAdminStudent, setSelectedAdminStudent] = useState(null);
      const [newStudentName, setNewStudentName] = useState('');
      const [newStudentPhoto, setNewStudentPhoto] = useState('');
      const [newStudentTurma, setNewStudentTurma] = useState('5º A');
      const [adminClassFilter, setAdminClassFilter] = useState('TODOS');

      // Form Grades States
      const [editBoletim, setEditBoletim] = useState({});
      const [editSimulados, setEditSimulados] = useState({
        s1: { portugues: '', matematica: '' },
        s2: { portugues: '', matematica: '' },
        s3: { portugues: '', matematica: '' }
      });
      const [editAnalysis, setEditAnalysis] = useState('');
      const [editTurma, setEditTurma] = useState('');

      useEffect(() => {
        // Load initial students config
        const localStudents = localStorage.getItem('spabb_students_local');
        const localConfig = localStorage.getItem('spabb_firebase_config');

        let loadedConfig = FIREBASE_CONFIG_EMBEDDED;
        if (localConfig) {
          try {
            loadedConfig = JSON.parse(localConfig);
            setFirebaseConfig(loadedConfig);
          } catch(e) {}
        }

        if (loadedConfig && loadedConfig.databaseURL) {
          fetchFromFirebase(loadedConfig);
        } else if (localStudents) {
          try {
            setStudents(JSON.parse(localStudents));
            setConnectionSource('cached');
          } catch(e) {}
        } else {
          setStudents(INITIAL_STUDENTS_EMBEDDED);
          setConnectionSource('embedded');
        }
      }, []);

      const fetchFromFirebase = async (config) => {
        try {
          const dbUrl = config.databaseURL.trim().replace(/\\/$/, '');
          const url = \`\${dbUrl}/students.json\${config.apiKey ? \`?auth=\${config.apiKey}\` : ''}\`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data) {
              const list = Array.isArray(data)
                ? data.filter(Boolean)
                : Object.keys(data).map(key => ({ ...data[key], id: key }));
              setStudents(list);
              setConnectionSource('firebase');
              localStorage.setItem('spabb_students_local', JSON.stringify(list));
            } else {
              setStudents(INITIAL_STUDENTS_EMBEDDED);
              setConnectionSource('local_empty');
            }
          }
        } catch(e) {
          console.error("Firebase fetch error", e);
          setConnectionSource('offline_cache');
          const cache = localStorage.getItem('spabb_students_local');
          if (cache) setStudents(JSON.parse(cache));
        }
      };

      const handleSaveAll = async (updatedStudents) => {
        setStudents(updatedStudents);
        localStorage.setItem('spabb_students_local', JSON.stringify(updatedStudents));

        if (firebaseConfig && firebaseConfig.databaseURL) {
          try {
            const dbUrl = firebaseConfig.databaseURL.trim().replace(/\\/$/, '');
            const url = \`\${dbUrl}/students.json\${firebaseConfig.apiKey ? \`?auth=\${firebaseConfig.apiKey}\` : ''}\`;
            
            const dataMap = {};
            updatedStudents.forEach(s => { dataMap[s.id] = s; });

            await fetch(url, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dataMap)
            });
          } catch(e) {
            console.error(e);
          }
        }
      };

      const handleLogin = (e) => {
        e.preventDefault();
        if (adminPassword === 'spabb123') {
          setIsAdmin(true);
          setShowLoginModal(false);
          setAdminPassword('');
        } else {
          alert('Senha incorreta! Use "spabb123".');
        }
      };

      const turmas = useMemo(() => {
        const list = Array.from(new Set(students.map(s => s.turma || "5º A")));
        if (list.length === 0) list.push("5º A");
        return list.sort();
      }, [students]);

      useEffect(() => {
        if (!turmas.includes(selectedTurma) && turmas.length > 0) {
          setSelectedTurma(turmas[0]);
        }
      }, [students, turmas, selectedTurma]);

      const filteredStudents = useMemo(() => {
        return students
          .filter(s => (s.turma || "5º A") === selectedTurma)
          .filter(s => s.name.toUpperCase().includes(searchQuery.toUpperCase()));
      }, [students, searchQuery, selectedTurma]);

      // Grade formatting helper
      const getGradeClass = (val) => {
        if (val === null || val === undefined || isNaN(val)) return "text-slate-400";
        if (val >= 10) return "g10";
        if (val >= 9) return "g9";
        if (val >= 8.5) return "g85";
        if (val >= 7.5) return "g80";
        if (val >= 6.5) return "g70";
        if (val >= 6.0) return "g65";
        return "g60";
      };

      const getSimuladoLevelColor = (val, level) => {
        if (level) {
          const lvl = level.toUpperCase();
          if (lvl === "ADEQUADO") return "bg-[#5cb85c] text-white";
          if (lvl === "INTERMEDIÁRIO") return "bg-[#f0a500] text-white";
          if (lvl === "CRÍTICO") return "bg-[#e06d53] text-white";
          if (lvl === "MUITO CRÍTICO") return "bg-[#c0392b] text-white";
        }
        if (val === null || val === undefined) return "bg-[#94a3b8] text-white";
        if (val >= 85) return "bg-[#5cb85c] text-white";
        if (val >= 70) return "bg-[#f0a500] text-white";
        if (val >= 50) return "bg-[#e06d53] text-white";
        return "bg-[#c0392b] text-white";
      };

      const getSimuladoLevelText = (val, level) => {
        if (level) return level.toUpperCase();
        if (val === null || val === undefined) return "SEM DADOS";
        if (val >= 85) return "ADEQUADO";
        if (val >= 70) return "INTERMEDIÁRIO";
        if (val >= 50) return "CRÍTICO";
        return "MUITO CRÍTICO";
      };

      const getSimuladoLevelColorHex = (val, level) => {
        if (level) {
          const lvl = level.toUpperCase();
          if (lvl === "ADEQUADO") return "#1a6e2a";
          if (lvl === "INTERMEDIÁRIO") return "#c07800";
          if (lvl === "CRÍTICO") return "#d97706";
          if (lvl === "MUITO CRÍTICO") return "#c0392b";
        }
        if (val === null || val === undefined) return "#64748b";
        if (val >= 85) return "#1a6e2a";
        if (val >= 70) return "#c07800";
        if (val >= 50) return "#d97706";
        return "#c0392b";
      };

      const getSimuladoLevelGradient = (val, level) => {
        if (level) {
          const lvl = level.toUpperCase();
          if (lvl === "ADEQUADO") return "linear-gradient(90deg, #5cb85c, #2e7d2e)";
          if (lvl === "INTERMEDIÁRIO") return "linear-gradient(90deg, #f0a500, #c07800)";
          if (lvl === "CRÍTICO") return "linear-gradient(90deg, #f43f5e, #be123c)";
          if (lvl === "MUITO CRÍTICO") return "linear-gradient(90deg, #e08080, #c0392b)";
        }
        if (val === null || val === undefined) return "linear-gradient(90deg, #94a3b8, #64748b)";
        if (val >= 85) return "linear-gradient(90deg, #5cb85c, #2e7d2e)";
        if (val >= 70) return "linear-gradient(90deg, #f0a500, #c07800)";
        if (val >= 50) return "linear-gradient(90deg, #f43f5e, #be123c)";
        return "linear-gradient(90deg, #e08080, #c0392b)";
      };

      return (
        <div className="min-h-screen flex flex-col pb-8">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('grid')}>
              <LucideIcon name="graduation-cap" className="text-emerald-600" size={28} />
              <span className="font-display font-black text-slate-800 tracking-tight text-xl">SPABB</span>
            </div>

            <div className="flex items-center gap-3">
              <span className={\`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold \${
                connectionSource === 'firebase' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }\`}>
                <span className={\`w-2 h-2 rounded-full \${connectionSource === 'firebase' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}\`}></span>
                {connectionSource === 'firebase' ? 'Conectado ao Firebase' : 'Armazenamento Local'}
              </span>

              {isAdmin ? (
                <div className="flex gap-2">
                  <button onClick={() => { setView('admin'); setAdminTab('roster'); }} className="bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-700 transition">
                    <LucideIcon name="settings" size={14} /> Admin
                  </button>
                  <button onClick={() => { setIsAdmin(false); setView('grid'); }} className="border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-50 transition">
                    <LucideIcon name="log-out" size={14} /> Sair
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="bg-[#1a60a0] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#154a7c] transition">
                  <LucideIcon name="lock" size={14} /> Admin Login
                </button>
              )}
            </div>
          </header>

          {/* Grid View */}
          {view === 'grid' && (
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h1 className="font-display font-black text-3xl text-slate-800 tracking-tight">Painel de Alunos</h1>
                  <p className="text-sm text-slate-500">Selecione um aluno da turma para visualizar seu Boletim e Simulados</p>
                </div>

                <div className="relative w-full md:w-80">
                  <LucideIcon name="search" className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a60a0]/30 focus:border-[#1a60a0] transition"
                  />
                </div>
              </div>

              {/* Class Selector Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 mb-8 bg-white border border-slate-200/80 p-1.5 rounded-xl w-fit shadow-sm">
                <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase px-3 py-1">Selecione a Turma:</span>
                {turmas.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTurma(t)}
                    className={selectedTurma === t ? "px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all duration-200 cursor-pointer bg-[#1a60a0] text-white shadow-sm" : "px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all duration-200 cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-950"}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-5 w-full">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => { setCurrentStudent(student); setView('dashboard'); }}
                      className="group cursor-pointer bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_4px_20px_rgba(74,128,196,0.18)] hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                        <img
                          src={student.photo || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + student.name}
                          alt={student.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {student.simulados?.s3?.portugues < 70 && (
                          <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1" title="Atenção nos Simulados">
                            <LucideIcon name="alert-triangle" size={14} />
                          </div>
                        )}
                      </div>
                      <div className="bg-[#1a60a0] text-white text-center py-2 px-1 font-display font-black tracking-wider text-xs truncate">
                        {student.name}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic Class Big Badge */}
                <div className="w-full lg:w-72 bg-gradient-to-br from-[#cce8f8] to-[#92c5eb] border-2 border-[#70b0d8] rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden shrink-0 min-h-[300px]">
                  <div className="absolute -right-10 -bottom-10 opacity-10">
                    <LucideIcon name="graduation-cap" size={200} />
                  </div>
                  <h2 className="font-display font-black text-5xl lg:text-7xl text-sky-800 tracking-wider drop-shadow-md break-all">{selectedTurma}</h2>
                  <p className="font-bold text-sky-900 tracking-widest text-sm uppercase mt-4">Ensino Fundamental I</p>
                  <p className="text-xs text-sky-700/80 font-semibold mt-1">EMEF Antonio Barroso Braga</p>
                  <div className="mt-6 border-t border-sky-400/30 pt-4 w-full">
                    <p className="text-2xl font-mono font-black text-sky-950">
                      {students.filter(s => (s.turma || "5º A") === selectedTurma).length}
                    </p>
                    <p className="text-[10px] text-sky-800 font-bold uppercase tracking-wider">Alunos Registrados</p>
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* Student Dashboard View */}
          {view === 'dashboard' && currentStudent && (
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6">
              <button
                onClick={() => setView('grid')}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-4 py-2 font-bold text-xs inline-flex items-center gap-1.5 transition mb-6 shadow-sm"
              >
                <LucideIcon name="chevron-left" size={14} /> Voltar para Turma
              </button>

              {/* Top Header Card */}
              <div className="bg-white border-2 border-[#cdddf0] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md mb-6">
                <div>
                  <h1 className="font-display font-black text-4xl text-emerald-600 tracking-tight leading-none">SPABB</h1>
                  <h2 className="text-lg font-black text-amber-500 tracking-wider mt-1">SISTEMA DE AVALIAÇÕES</h2>
                  <h3 className="text-xs font-bold text-emerald-700 tracking-widest uppercase mt-0.5">EMEF ANTONIO BARROSO BRAGA</h3>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="bg-gradient-to-br from-[#f0fbff] to-[#cce8f8] border-2 border-[#70b0d8] rounded-xl px-6 py-2 text-center shadow-inner">
                    <p className="text-[10px] font-bold text-[#3880c0] tracking-widest">ALUNO(A) &bull; {currentStudent.turma || "5º A"}</p>
                    <p className="font-display font-black text-lg text-[#1a60a0] tracking-wider mt-0.5">{currentStudent.name}</p>
                  </div>

                  {/* Average KPI Pill */}
                  <div className="bg-gradient-to-br from-[#7da7e0] to-[#4a80c4] rounded-xl text-white px-5 py-2.5 text-center shadow-lg">
                    <p className="text-[1.8rem] font-black leading-none font-mono">
                      {(() => {
                        const grades = Object.values(currentStudent.boletim || {}).map(g => g.b1).filter(v => v !== null && v !== undefined);
                        const avg = grades.length > 0 ? grades.reduce((acc, curr) => acc + curr, 0) / grades.length : 0;
                        return avg.toFixed(2).replace('.', ',');
                      })()}
                    </p>
                    <p className="text-[9px] font-black tracking-widest uppercase mt-1">MÉDIA 1º BIM.</p>
                  </div>

                  {currentStudent.simulados?.s3?.portugues < 70 && (
                    <div className="bg-gradient-to-br from-[#f5c842] to-[#e09000] rounded-xl text-white px-5 py-2.5 text-center shadow-lg">
                      <p className="text-[1.8rem] font-black leading-none font-mono">⚠️</p>
                      <p className="text-[9px] font-black tracking-widest uppercase mt-1">ALERTA SIMULADO</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Box */}
              {currentStudent.analysis && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-400 rounded-xl p-5 md:p-6 mb-6 shadow-sm flex gap-4 items-start">
                  <div className="text-3xl">📊</div>
                  <div>
                    <h4 className="font-display font-black text-sm text-amber-900 tracking-wider uppercase mb-1">Análise do Desempenho Escolar</h4>
                    <p className="text-sm leading-relaxed text-amber-950 font-medium">{currentStudent.analysis}</p>
                  </div>
                </div>
              )}

              {/* KPI Strip */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white border-2 border-[#cdddf0] rounded-xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">MÉDIA 1º BIM.</p>
                  <p className="text-3xl font-black font-mono text-[#4a80c4] mt-1">
                    {(() => {
                      const grades = Object.values(currentStudent.boletim || {}).map(g => g.b1).filter(v => v !== null && v !== undefined);
                      const avg = grades.length > 0 ? grades.reduce((acc, curr) => acc + curr, 0) / grades.length : 0;
                      return avg.toFixed(2).replace('.', ',');
                    })()}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Média do boletim</p>
                </div>

                <div className="bg-white border-2 border-[#cdddf0] rounded-xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">NOTA MÁXIMA</p>
                  <p className="text-3xl font-black font-mono text-emerald-600 mt-1">
                    {(() => {
                      const grades = Object.values(currentStudent.boletim || {}).map(g => g.b1).filter(v => v !== null && v !== undefined);
                      const max = grades.length > 0 ? Math.max(...grades) : 0;
                      return max.toFixed(1).replace('.', ',');
                    })()}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Melhor rendimento</p>
                </div>

                <div className="bg-white border-2 border-[#cdddf0] rounded-xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">NOTA MÍNIMA</p>
                  <p className="text-3xl font-black font-mono text-rose-500 mt-1">
                    {(() => {
                      const grades = Object.values(currentStudent.boletim || {}).map(g => g.b1).filter(v => v !== null && v !== undefined);
                      const min = grades.length > 0 ? Math.min(...grades) : 0;
                      return min.toFixed(1).replace('.', ',');
                    })()}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Atenção nesta área</p>
                </div>

                <div className="bg-white border-2 border-[#cdddf0] rounded-xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">MELHOR SIMULADO</p>
                  <p className="text-3xl font-black font-mono text-amber-500 mt-1">
                    {(() => {
                      const sims = currentStudent.simulados || {};
                      const vals = [
                        sims.s1?.portugues, sims.s1?.matematica,
                        sims.s2?.portugues, sims.s2?.matematica,
                        sims.s3?.portugues, sims.s3?.matematica
                      ].filter(v => v !== null && v !== undefined);
                      const max = vals.length > 0 ? Math.max(...vals) : 0;
                      return max.toFixed(1).replace('.', ',') + '%';
                    })()}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Recorde de acertos</p>
                </div>

                <div className="bg-white border-2 border-[#cdddf0] rounded-xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition duration-200">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">PIOR SIMULADO</p>
                  <p className="text-3xl font-black font-mono text-rose-600 mt-1">
                    {(() => {
                      const sims = currentStudent.simulados || {};
                      const vals = [
                        sims.s1?.portugues, sims.s1?.matematica,
                        sims.s2?.portugues, sims.s2?.matematica,
                        sims.s3?.portugues, sims.s3?.matematica
                      ].filter(v => v !== null && v !== undefined);
                      const min = vals.length > 0 ? Math.min(...vals) : 0;
                      return min.toFixed(1).replace('.', ',') + '%';
                    })()}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Exige reforço de base</p>
                </div>
              </div>

              {/* Boletim Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 overflow-x-auto">
                <p className="text-sm font-black text-slate-700 tracking-wider uppercase mb-4 flex items-center gap-1.5">
                  <LucideIcon name="file-text" className="text-blue-500" /> Resultado da Aprendizagem por Período — Boletim
                </p>

                <table className="boletim-table w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th style={{ width: "35%" }}>COMPONENTES CURRICULARES</th>
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
                    {SUBJECTS.map((subject) => {
                      const grades = currentStudent.boletim?.[subject] || { b1: null, b2: null, b3: null, b4: null, rec: null };
                      const filledQuarters = [grades.b1, grades.b2, grades.b3, grades.b4].filter(v => v !== null && v !== undefined);
                      const averageAnual = filledQuarters.length > 0 ? filledQuarters.reduce((acc, c) => acc + c, 0) / filledQuarters.length : null;
                      const hasRec = grades.rec !== null;
                      const mediaFinal = hasRec && averageAnual !== null ? Math.max(averageAnual, grades.rec) : averageAnual;

                      return (
                        <tr key={subject} className="hover:bg-sky-50/40 transition">
                          <td className="font-sans font-bold text-slate-800 text-xs pl-4">{subject}</td>
                          <td className={\`font-mono font-semibold \${getGradeClass(grades.b1)}\`}>{grades.b1 !== null ? grades.b1.toFixed(1).replace('.', ',') : '—'}</td>
                          <td className={\`font-mono font-semibold \${getGradeClass(grades.b2)}\`}>{grades.b2 !== null ? grades.b2.toFixed(1).replace('.', ',') : '—'}</td>
                          <td className={\`font-mono font-semibold \${getGradeClass(grades.b3)}\`}>{grades.b3 !== null ? grades.b3.toFixed(1).replace('.', ',') : '—'}</td>
                          <td className={\`font-mono font-semibold \${getGradeClass(grades.b4)}\`}>{grades.b4 !== null ? grades.b4.toFixed(1).replace('.', ',') : '—'}</td>
                          <td className={\`font-mono font-bold \${getGradeClass(averageAnual)}\`}>{averageAnual !== null ? averageAnual.toFixed(1).replace('.', ',') : '—'}</td>
                          <td className={\`font-mono font-semibold \${getGradeClass(grades.rec)}\`}>{grades.rec !== null ? grades.rec.toFixed(1).replace('.', ',') : '—'}</td>
                          <td className={\`font-mono font-black \${getGradeClass(mediaFinal)}\`}>{mediaFinal !== null ? mediaFinal.toFixed(1).replace('.', ',') : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Warnings Banner & Simulado Processing */}
              {(() => {
                const sims = currentStudent.simulados || {};
                const simKeys = Object.keys(sims).sort((a, b) => {
                  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
                });
                const getSimName = (key) => {
                  if (!key) return '';
                  const num = key.match(/\d+/);
                  return num ? \`\${num[0]}º SIMULADO\` : key.toUpperCase();
                };
                const latestSimKey = simKeys.length > 0 ? simKeys[simKeys.length - 1] : null;
                const latestSim = latestSimKey ? sims[latestSimKey] : null;
                const isLatestCritical = latestSim ?
                  (latestSim.portugues !== null && latestSim.portugues !== undefined && latestSim.portugues < 70) ||
                  (latestSim.matematica !== null && latestSim.matematica !== undefined && latestSim.matematica < 70)
                  : false;

                return (
                  <>
                    {isLatestCritical && (
                      <div className="bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-xl py-3 px-6 text-center font-bold text-sm tracking-wide shadow-md mb-6 animate-pulse select-none uppercase">
                        ⚠️ &nbsp; ATENÇÃO: NÍVEL CRÍTICO EM AMBAS AS DISCIPLINAS NO {getSimName(latestSimKey)} — INTERVENÇÃO NECESSÁRIA &nbsp; ⚠️
                      </div>
                    )}

                    {/* Simulado Cards Grid */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                      <p className="text-sm font-black text-slate-700 tracking-wider uppercase mb-5 flex items-center gap-1.5">
                        <LucideIcon name="award" className="text-[#1a60a0]" /> SPABB — Cards de Resultado por Simulado
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {simKeys.map((simId) => {
                          const data = sims[simId];
                          return (
                            <div key={simId} className="border-2 border-slate-100 rounded-xl overflow-hidden shadow-inner bg-slate-50/50">
                              <div className="bg-gradient-to-r from-sky-400 to-sky-600 text-white text-center py-2.5 font-display font-black tracking-wider text-sm uppercase">
                                {getSimName(simId)}
                              </div>
                              <div className="grid grid-cols-2 divide-x divide-slate-100">
                                <div className="p-4 text-center">
                                  <p className="text-[1.8rem] font-black font-mono" style={{ color: getSimuladoLevelColorHex(data?.portugues, data?.portuguesLevel) }}>
                                    {data?.portugues !== null && data?.portugues !== undefined ? data.portugues.toFixed(1).replace('.', ',') + '%' : '—'}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">PORTUGUÊS</p>
                                </div>
                                <div className="p-4 text-center">
                                  <p className="text-[1.8rem] font-black font-mono" style={{ color: getSimuladoLevelColorHex(data?.matematica, data?.matematicaLevel) }}>
                                    {data?.matematica !== null && data?.matematica !== undefined ? data.matematica.toFixed(1).replace('.', ',') + '%' : '—'}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">MATEMÁTICA</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 text-[10px] font-black text-center border-t border-slate-100">
                                <div className={\`py-2 px-1 \${getSimuladoLevelColor(data?.portugues, data?.portuguesLevel)}\`}>{getSimuladoLevelText(data?.portugues, data?.portuguesLevel)}</div>
                                <div className={\`py-2 px-1 \${getSimuladoLevelColor(data?.matematica, data?.matematicaLevel)}\`}>{getSimuladoLevelText(data?.matematica, data?.matematicaLevel)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Line Chart Component Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                      <p className="text-sm font-black text-slate-700 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                        <LucideIcon name="trending-up" className="text-sky-500" /> Evolução de Desempenho — Gráfico de Linhas
                      </p>

                      {/* Zone Legend */}
                      <div className="flex gap-4 flex-wrap text-xs font-semibold text-slate-500 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5"><span className="w-4 h-3.5 rounded bg-[#c0392b]/20 border border-[#c0392b]/40"></span>Crítico (&lt; 70%)</div>
                        <div className="flex items-center gap-1.5"><span className="w-4 h-3.5 rounded bg-[#f0a500]/20 border border-[#f0a500]/40"></span>Intermediário (70-84%)</div>
                        <div className="flex items-center gap-1.5"><span className="w-4 h-3.5 rounded bg-[#5cb85c]/20 border border-[#5cb85c]/40"></span>Adequado (≥ 85%)</div>
                      </div>

                      <div className="flex gap-6 mb-2 font-bold text-xs pl-2">
                        <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-[#4a80c4]"></span>Língua Portuguesa</div>
                        <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-[#e05a00]"></span>Matemática</div>
                      </div>

                      <SvgChart
                        portugues={simKeys.map(k => sims[k]?.portugues || 0)}
                        matematica={simKeys.map(k => sims[k]?.matematica || 0)}
                        labels={simKeys.map(k => {
                          const num = k.match(/\d+/);
                          return num ? \`\${num[0]}º Sim.\` : k.toUpperCase();
                        })}
                      />
                    </div>

                    {/* Detailed Progress Bars */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <p className="text-sm font-black text-slate-700 tracking-wider uppercase mb-5 flex items-center gap-1.5">
                        <LucideIcon name="bar-chart-2" className="text-emerald-500" /> Comparativo de Progresso por Disciplina
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Português Block */}
                        <div>
                          <h5 className="font-display font-black text-xs text-[#4a80c4] tracking-wider uppercase mb-4 border-b border-[#4a80c4]/20 pb-1.5">LÍNGUA PORTUGUESA</h5>
                          
                          {simKeys.map((key) => {
                            const val = sims[key]?.portugues || 0;
                            const level = sims[key]?.portuguesLevel;
                            const num = key.match(/\d+/);
                            const label = num ? \`\${num[0]}º Simulado\` : key.toUpperCase();
                            return (
                              <div key={key} className="mb-4">
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                  <span>{label}</span>
                                  <span style={{ color: getSimuladoLevelColorHex(val, level) }}>{val.toFixed(1)}% — {getSimuladoLevelText(val, level)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden shadow-inner">
                                  <div
                                    className="h-full rounded-full flex items-center justify-end pr-3 text-[10px] font-black text-white transition-all duration-1000"
                                    style={{
                                      width: \`\${val}%\`,
                                      background: getSimuladoLevelGradient(val, level)
                                    }}
                                  >
                                    {val > 15 ? \`\${val.toFixed(1)}%\` : ''}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Matemática Block */}
                        <div>
                          <h5 className="font-display font-black text-xs text-[#e05a00] tracking-wider uppercase mb-4 border-b border-[#e05a00]/20 pb-1.5">MATEMÁTICA</h5>
                          
                          {simKeys.map((key) => {
                            const val = sims[key]?.matematica || 0;
                            const level = sims[key]?.matematicaLevel;
                            const num = key.match(/\d+/);
                            const label = num ? \`\${num[0]}º Simulado\` : key.toUpperCase();
                            return (
                              <div key={key} className="mb-4">
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                  <span>{label}</span>
                                  <span style={{ color: getSimuladoLevelColorHex(val, level) }}>{val.toFixed(1)}% — {getSimuladoLevelText(val, level)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden shadow-inner">
                                  <div
                                    className="h-full rounded-full flex items-center justify-end pr-3 text-[10px] font-black text-white transition-all duration-1000"
                                    style={{
                                      width: \`\${val}%\`,
                                      background: getSimuladoLevelGradient(val, level)
                                    }}
                                  >
                                    {val > 15 ? \`\${val.toFixed(1)}%\` : ''}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </main>
          )}

          {/* Admin Screen */}
          {view === 'admin' && isAdmin && (
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6">
              <button
                onClick={() => setView('grid')}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-4 py-2 font-bold text-xs inline-flex items-center gap-1.5 transition mb-6 shadow-sm"
              >
                <LucideIcon name="chevron-left" size={14} /> Voltar para Painel Geral
              </button>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Admin Sidebar Menu */}
                <div className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase px-2 mb-2">GERENCIAMENTO</p>
                  
                  <button
                    onClick={() => setAdminTab('roster')}
                    className={\`w-full text-left font-bold text-sm px-3 py-2.5 rounded-lg flex items-center gap-2 transition \${
                      adminTab === 'roster' ? 'bg-[#1a60a0] text-white' : 'text-slate-700 hover:bg-slate-50'
                    }\`}
                  >
                    <LucideIcon name="graduation-cap" size={16} /> Alunos da Turma
                  </button>

                  <button
                    onClick={() => {
                      setAdminTab('grades');
                      if (students.length > 0 && !selectedAdminStudent) {
                        setSelectedAdminStudent(students[0]);
                        loadStudentIntoForm(students[0]);
                      }
                    }}
                    className={\`w-full text-left font-bold text-sm px-3 py-2.5 rounded-lg flex items-center gap-2 transition \${
                      adminTab === 'grades' ? 'bg-[#1a60a0] text-white' : 'text-slate-700 hover:bg-slate-50'
                    }\`}
                  >
                    <LucideIcon name="edit-2" size={16} /> Lançar Notas & Boletim
                  </button>

                  <button
                    onClick={() => setAdminTab('firebase')}
                    className={\`w-full text-left font-bold text-sm px-3 py-2.5 rounded-lg flex items-center gap-2 transition \${
                      adminTab === 'firebase' ? 'bg-[#1a60a0] text-white' : 'text-slate-700 hover:bg-slate-50'
                    }\`}
                  >
                    <LucideIcon name="database" size={16} /> Conectar Firebase RTDB
                  </button>
                </div>

                {/* Admin Tab Content */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[500px]">
                  
                  {/* ROSTER TAB */}
                  {adminTab === 'roster' && (
                    <div>
                      <h3 className="font-display font-black text-lg text-slate-800 mb-2">Alunos Matriculados</h3>
                      <p className="text-xs text-slate-500 mb-6">Cadastre novos alunos ou remova perfis de todas as turmas</p>

                      {/* Add student form */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Novo Registro de Aluno</h4>
                        <div className="flex flex-wrap gap-4 items-end">
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">NOME COMPLETO</label>
                            <input
                              type="text"
                              value={newStudentName}
                              onChange={(e) => setNewStudentName(e.target.value.toUpperCase())}
                              placeholder="EX: JOÃO SILVA"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1a60a0]"
                            />
                          </div>

                          <div className="w-full sm:w-44">
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">TURMA</label>
                            <input
                              type="text"
                              list="existing-admin-turmas"
                              value={newStudentTurma}
                              onChange={(e) => setNewStudentTurma(e.target.value.toUpperCase())}
                              placeholder="EX: 5º A"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1a60a0]"
                            />
                            <datalist id="existing-admin-turmas">
                              {Array.from(new Set(students.map(st => st.turma || "5º A"))).sort().map(t => (
                                <option key={t} value={t} />
                              ))}
                            </datalist>
                          </div>

                          <div className="w-full sm:w-auto">
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">FOTO DO ALUNO (OPCIONAL)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onloadend = () => setNewStudentPhoto(r.result as string);
                                  r.readAsDataURL(file);
                                }
                              }}
                              className="text-xs text-slate-600 focus:outline-none cursor-pointer"
                            />
                          </div>

                          <button
                            onClick={() => {
                              if (!newStudentName.trim()) return alert('Insira o nome do aluno!');
                              const newId = newStudentName.trim().toLowerCase().replace(/\s+/g, '-');
                              
                              // Initialize with empty grades structure
                              const initialBoletimObj = {};
                              SUBJECTS.forEach(s => {
                                initialBoletimObj[s] = { b1: null, b2: null, b3: null, b4: null, rec: null };
                              });

                              const newStudent = {
                                id: newId,
                                name: newStudentName.trim(),
                                photo: newStudentPhoto || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + newStudentName,
                                boletim: initialBoletimObj,
                                simulados: {
                                  s1: { portugues: null, matematica: null },
                                  s2: { portugues: null, matematica: null },
                                  s3: { portugues: null, matematica: null }
                                },
                                analysis: '',
                                turma: newStudentTurma.trim() || '5º A'
                              };

                              handleSaveAll([...students, newStudent]);
                              setNewStudentName('');
                              setNewStudentPhoto('');
                              alert('Aluno cadastrado com sucesso!');
                            }}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition shadow-sm h-[34px]"
                          >
                            <LucideIcon name="plus" size={14} /> Adicionar Aluno
                          </button>
                        </div>
                      </div>

                      {/* Admin Class Filter */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-6 bg-slate-50 border p-2 rounded-xl">
                        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase px-2 py-1">Filtrar por Turma:</span>
                        {['TODOS', ...Array.from(new Set(students.map(st => st.turma || "5º A"))).sort()].map((t) => (
                          <button
                            key={t}
                            onClick={() => setAdminClassFilter(t)}
                            className={adminClassFilter === t ? "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all duration-200 cursor-pointer bg-[#1a60a0] text-white shadow-sm" : "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all duration-200 cursor-pointer text-slate-600 hover:bg-white hover:text-slate-900 bg-white/50 border border-slate-200/50"}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Student list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {students
                          .filter(s => adminClassFilter === 'TODOS' || (s.turma || '5º A') === adminClassFilter)
                          .map(s => (
                          <div key={s.id} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center bg-white hover:border-[#1a60a0]/30 hover:shadow-sm transition">
                            <div className="flex items-center gap-3">
                              <img src={s.photo} alt={s.name} className="w-10 h-10 rounded-full object-cover bg-slate-50 border border-slate-100" />
                              <div>
                                <h4 className="font-bold text-xs text-slate-800 leading-tight flex items-center gap-1.5">
                                  {s.name}
                                  <span className="bg-[#eef2f9] text-[#1a60a0] border border-slate-200/60 rounded px-1 py-0.5 text-[8px] font-black tracking-wider uppercase">
                                    {s.turma || '5º A'}
                                  </span>
                                </h4>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Código: {s.id}</span>
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setAdminTab('grades');
                                  setSelectedAdminStudent(s);
                                  loadStudentIntoForm(s);
                                }}
                                className="p-1.5 text-[#1a60a0] hover:bg-[#1a60a0]/5 rounded-lg transition"
                                title="Lançar Notas"
                              >
                                <LucideIcon name="edit-2" size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(\`Deseja realmente excluir o aluno \${s.name}?\`)) {
                                    handleSaveAll(students.filter(st => st.id !== s.id));
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                title="Excluir Aluno"
                              >
                                <LucideIcon name="trash-2" size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GRADES TAB */}
                  {adminTab === 'grades' && (
                    <div>
                      <h3 className="font-display font-black text-lg text-slate-800 mb-2">Lançamento de Avaliações</h3>
                      <p className="text-xs text-slate-500 mb-6">Edite notas do Boletim e resultados de simulados, ou faça o escaneamento inteligente de boletins via IA.</p>

                      {/* Select Student dropdown */}
                      <div className="mb-6 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">SELECIONE O ALUNO</label>
                          <select
                            value={selectedAdminStudent?.id || ''}
                            onChange={(e) => {
                              const student = students.find(s => s.id === e.target.value);
                              if (student) {
                                setSelectedAdminStudent(student);
                                loadStudentIntoForm(student);
                              }
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1a60a0]"
                          >
                            <option value="" disabled>Selecione um aluno...</option>
                            {students.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.turma || '5º A'})</option>
                            ))}
                          </select>
                        </div>

                        {selectedAdminStudent && (
                          <div className="w-full md:w-48">
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">TURMA DO ALUNO</label>
                            <input
                              type="text"
                              value={editTurma}
                              onChange={(e) => setEditTurma(e.target.value.toUpperCase())}
                              placeholder="EX: 5º A"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1a60a0]"
                            />
                          </div>
                        )}

                        {selectedAdminStudent && (
                          <div className="flex gap-2">
                            {/* Gemini AI Scan Photo zone */}
                            <label className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition shadow-sm self-end h-[34px]">
                              <LucideIcon name="brain" size={14} /> Escanear Boletim (Foto/IA)
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAiExtractGrades}
                                className="hidden"
                              />
                            </label>

                            <button
                              onClick={handleAiGenerateAnalysis}
                              className="bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-sm self-end h-[34px]"
                            >
                              <LucideIcon name="sparkles" size={14} /> Gerar Análise Pedagógica
                            </button>
                          </div>
                        )}
                      </div>

                      {selectedAdminStudent && (
                        <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                            <img src={selectedAdminStudent.photo} alt={selectedAdminStudent.name} className="w-12 h-12 rounded-full object-cover bg-white border" />
                            <div>
                              <h4 className="font-display font-black text-slate-800 tracking-wide text-md">{selectedAdminStudent.name}</h4>
                              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">FICHA ATIVA DE NOTAS</p>
                            </div>
                          </div>

                          {/* Simulados Score Form */}
                          <div className="mb-6">
                            <h5 className="text-xs font-black text-slate-700 tracking-wider uppercase mb-3 flex items-center gap-1"><LucideIcon name="trending-up" size={14} /> RESULTADOS DE SIMULADOS (%)</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 border border-slate-200 rounded-xl">
                              {['s1', 's2', 's3'].map((simId, idx) => (
                                <div key={simId} className="border-r last:border-r-0 border-slate-100 pr-2">
                                  <p className="font-bold text-[10px] text-slate-400 mb-2">{idx+1}º SIMULADO</p>
                                  <div className="flex gap-2">
                                    <div>
                                      <label className="text-[9px] font-black text-slate-400">PORTUGUÊS (%)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={editSimulados[simId]?.portugues || ''}
                                        onChange={(e) => {
                                          setEditSimulados({
                                            ...editSimulados,
                                            [simId]: { ...editSimulados[simId], portugues: e.target.value }
                                          });
                                        }}
                                        placeholder="Ex: 77.3"
                                        className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] font-black text-slate-400">MATEMÁTICA (%)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={editSimulados[simId]?.matematica || ''}
                                        onChange={(e) => {
                                          setEditSimulados({
                                            ...editSimulados,
                                            [simId]: { ...editSimulados[simId], matematica: e.target.value }
                                          });
                                        }}
                                        placeholder="Ex: 45.5"
                                        className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bulletin Table Form */}
                          <div className="mb-6">
                            <h5 className="text-xs font-black text-slate-700 tracking-wider uppercase mb-3 flex items-center gap-1"><LucideIcon name="file-text" size={14} /> BOLETIM (NOTAS DE 0.0 A 10.0)</h5>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto max-h-[400px]">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                  <tr>
                                    <th className="p-3">DISCIPLINA</th>
                                    <th>1º BIMESTRE</th>
                                    <th>2º BIMESTRE</th>
                                    <th>3º BIMESTRE</th>
                                    <th>4º BIMESTRE</th>
                                    <th>RECUPERAÇÃO</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {SUBJECTS.map(subj => (
                                    <tr key={subj} className="hover:bg-slate-50/50">
                                      <td className="p-2.5 font-bold text-slate-700">{subj}</td>
                                      {['b1', 'b2', 'b3', 'b4', 'rec'].map(bKey => (
                                        <td key={bKey} className="py-1">
                                          <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={editBoletim[subj]?.[bKey] !== undefined ? editBoletim[subj][bKey] : ''}
                                            onChange={(e) => {
                                              const updated = { ...editBoletim };
                                              if (!updated[subj]) updated[subj] = { b1: null, b2: null, b3: null, b4: null, rec: null };
                                              updated[subj][bKey] = e.target.value === '' ? null : parseFloat(e.target.value);
                                              setEditBoletim(updated);
                                            }}
                                            placeholder="—"
                                            className="w-16 border border-slate-200 rounded-md px-2 py-0.5 font-mono font-bold text-center focus:border-[#1a60a0]"
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Analysis paragraph form */}
                          <div className="mb-6">
                            <h5 className="text-xs font-black text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1"><LucideIcon name="brain" size={14} /> ANÁLISE PEDAGÓGICA (AUTO OU MANUAL)</h5>
                            <textarea
                              rows={4}
                              value={editAnalysis}
                              onChange={(e) => setEditAnalysis(e.target.value)}
                              placeholder="Análise do desempenho escolar do aluno..."
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs leading-relaxed font-semibold focus:outline-none focus:border-[#1a60a0]"
                            ></textarea>
                          </div>

                          {/* Save Student Active grades */}
                          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                            <button
                              onClick={handleSaveStudentGrades}
                              className="bg-[#1a60a0] hover:bg-[#124b80] text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm h-[38px]"
                            >
                              <LucideIcon name="save" size={16} /> Salvar Alterações
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FIREBASE TAB */}
                  {adminTab === 'firebase' && (
                    <div>
                      <h3 className="font-display font-black text-lg text-slate-800 mb-2">Conectar Firebase Realtime Database</h3>
                      <p className="text-xs text-slate-500 mb-6">Ao configurar o seu Firebase, todas as notas serão sincronizadas na nuvem automaticamente. Use os mesmos campos para o seu arquivo HTML que será hospedado no GitHub.</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border rounded-xl p-5 mb-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">URL DO BANCO DE DADOS (Realtime Database URL)</label>
                          <input
                            type="text"
                            value={firebaseConfig?.databaseURL || ''}
                            onChange={(e) => setFirebaseConfig({ ...firebaseConfig, databaseURL: e.target.value })}
                            placeholder="EX: https://meu-projeto-rtdb.firebaseio.com"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1a60a0]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">CHAVE API (Opcional - para Segurança do Banco)</label>
                          <input
                            type="text"
                            value={firebaseConfig?.apiKey || ''}
                            onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                            placeholder="Sua Web API Key ou Secret"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1a60a0]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={handleSaveFirebaseSettings}
                          className="bg-[#1a60a0] hover:bg-[#124b80] text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                        >
                          <LucideIcon name="save" size={14} /> Salvar e Sincronizar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Deseja realmente limpar a configuração do Firebase? O aplicativo voltará a salvar apenas em cache local.')) {
                              localStorage.removeItem('spabb_firebase_config');
                              setFirebaseConfig({ databaseURL: '', apiKey: '' });
                              setConnectionSource('local');
                              alert('Configuração de Firebase excluída!');
                            }
                          }}
                          className="border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                        >
                          <LucideIcon name="trash-2" size={14} /> Limpar Conexão
                        </button>

                        <button
                          onClick={handleExportHtmlFile}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm ml-auto"
                        >
                          <LucideIcon name="download" size={14} /> Exportar como HTML Único
                        </button>
                      </div>

                      <div className="mt-8 border-t border-slate-100 pt-6">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Como hospedar no GitHub com Firebase?</h4>
                        <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
                          <li>Crie um repositório público no seu <span className="font-bold text-[#1a60a0]">GitHub</span>.</li>
                          <li>Clique no botão acima <span className="font-bold text-emerald-600">"Exportar como HTML Único"</span> para baixar o arquivo <span className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">index.html</span>.</li>
                          <li>Suba o arquivo <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">index.html</span> baixado diretamente no seu repositório no GitHub.</li>
                          <li>Ative o <span className="font-bold text-slate-800">GitHub Pages</span> nas configurações do repositório para gerar o link do site!</li>
                          <li>Todas as alterações feitas por você ou visualizadas pelos alunos lerão e escreverão no mesmo <span className="font-bold">Firebase Realtime Database</span> em tempo real!</li>
                        </ol>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </main>
          )}

          {/* Login Modal */}
          {showLoginModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-black text-slate-800 text-lg flex items-center gap-1.5">
                    <LucideIcon name="lock" className="text-[#1a60a0]" /> Área de Administração
                  </h3>
                  <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-full transition">
                    <LucideIcon name="x" size={18} />
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Senha de Acesso</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Use: spabb123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1a60a0]"
                      autoFocus
                    />
                  </div>

                  <button type="submit" className="w-full bg-[#1a60a0] text-white hover:bg-[#124b80] font-bold text-xs py-2 rounded-lg transition shadow-sm">
                    Entrar com Senha
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center text-[10px] text-slate-400 font-bold tracking-widest mt-auto uppercase pt-8">
            SPABB · EMEF ANTONIO BARROSO BRAGA · DASHBOARD DE AVALIAÇÕES ESCOLARES
          </footer>
        </div>
      );

      // --- Admin helper functions ---
      function loadStudentIntoForm(student) {
        // Load grades
        const gradesCopy = {};
        SUBJECTS.forEach(s => {
          gradesCopy[s] = student.boletim?.[s] ? { ...student.boletim[s] } : { b1: null, b2: null, b3: null, b4: null, rec: null };
        });
        setEditBoletim(gradesCopy);

        // Load simulados
        setEditSimulados({
          s1: student.simulados?.s1 ? { ...student.simulados.s1 } : { portugues: '', matematica: '' },
          s2: student.simulados?.s2 ? { ...student.simulados.s2 } : { portugues: '', matematica: '' },
          s3: student.simulados?.s3 ? { ...student.simulados.s3 } : { portugues: '', matematica: '' }
        });

        // Load analysis and turma
        setEditAnalysis(student.analysis || '');
        setEditTurma(student.turma || '5º A');
      }

      async function handleSaveStudentGrades() {
        if (!selectedAdminStudent) return;
        
        const updatedStudent = {
          ...selectedAdminStudent,
          boletim: { ...editBoletim },
          simulados: {
            s1: {
              portugues: editSimulados.s1.portugues === '' ? null : parseFloat(editSimulados.s1.portugues),
              matematica: editSimulados.s1.matematica === '' ? null : parseFloat(editSimulados.s1.matematica)
            },
            s2: {
              portugues: editSimulados.s2.portugues === '' ? null : parseFloat(editSimulados.s2.portugues),
              matematica: editSimulados.s2.matematica === '' ? null : parseFloat(editSimulados.s2.matematica)
            },
            s3: {
              portugues: editSimulados.s3.portugues === '' ? null : parseFloat(editSimulados.s3.portugues),
              matematica: editSimulados.s3.matematica === '' ? null : parseFloat(editSimulados.s3.matematica)
            }
          },
          analysis: editAnalysis,
          turma: editTurma.trim() || '5º A'
        };

        const updatedList = students.map(st => st.id === selectedAdminStudent.id ? updatedStudent : st);
        await handleSaveAll(updatedList);
        setSelectedAdminStudent(updatedStudent);
        alert('Notas salvas com sucesso!');
      }

      async function handleSaveFirebaseSettings() {
        if (!firebaseConfig?.databaseURL) return alert('Por favor, insira a URL do Firebase Realtime Database!');
        
        localStorage.setItem('spabb_firebase_config', JSON.stringify(firebaseConfig));
        setConnectionSource('connecting...');
        
        try {
          const dbUrl = firebaseConfig.databaseURL.trim().replace(/\\/$/, '');
          const url = \`\${dbUrl}/students.json\${firebaseConfig.apiKey ? \`?auth=\${firebaseConfig.apiKey}\` : ''}\`;
          
          // Post current cached list to sync
          const dataMap = {};
          students.forEach(s => { dataMap[s.id] = s; });

          const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataMap)
          });

          if (res.ok) {
            setConnectionSource('firebase');
            alert('Firebase conectado e dados sincronizados com sucesso!');
          } else {
            setConnectionSource('cached');
            alert('Falha ao conectar ao Firebase Realtime Database. Verifique a URL e as chaves.');
          }
        } catch(e) {
          console.error(e);
          setConnectionSource('cached');
          alert('Erro de rede ao conectar ao Firebase. Verifique a internet e a URL.');
        }
      }

      async function handleAiExtractGrades(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64 = reader.result.toString().split(',')[1];
          const mime = file.type;

          try {
            setEditAnalysis('Escaneando boletim com Inteligência Artificial do Gemini... Por favor, aguarde.');
            const res = await fetch('/api/extract-grades', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: base64, mimeType: mime })
            });

            if (res.ok) {
              const data = await res.json();
              
              // Apply extracted boletim grades
              if (data.boletim) {
                const mergedBoletim = { ...editBoletim };
                Object.keys(data.boletim).forEach(subj => {
                  const upperSubj = subj.toUpperCase();
                  if (SUBJECTS.includes(upperSubj)) {
                    if (!mergedBoletim[upperSubj]) {
                      mergedBoletim[upperSubj] = { b1: null, b2: null, b3: null, b4: null, rec: null };
                    }
                    mergedBoletim[upperSubj].b1 = data.boletim[subj].b1;
                  }
                });
                setEditBoletim(mergedBoletim);
              }

              // Apply extracted simulado results
              if (data.simulados) {
                const mergedSims = { ...editSimulados };
                ['s1', 's2', 's3'].forEach(simKey => {
                  if (data.simulados[simKey]) {
                    if (data.simulados[simKey].portugues !== undefined) {
                      mergedSims[simKey].portugues = data.simulados[simKey].portugues;
                    }
                    if (data.simulados[simKey].matematica !== undefined) {
                      mergedSims[simKey].matematica = data.simulados[simKey].matematica;
                    }
                  }
                });
                setEditSimulados(mergedSims);
              }

              setEditAnalysis('');
              alert('Escaneamento concluído! Notas preenchidas e prontas para revisão.');
            } else {
              const err = await res.json();
              alert('Erro no escaneamento por IA: ' + err.error);
            }
          } catch(err) {
            console.error(err);
            alert('Falha de rede ao conectar com a API de escaneamento.');
          }
        };
      }

      async function handleAiGenerateAnalysis() {
        if (!selectedAdminStudent) return;
        setEditAnalysis('Gerando análise pedagógica de alta qualidade com a Inteligência Artificial do Gemini... Por favor, aguarde.');
        try {
          const res = await fetch('/api/generate-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentName: selectedAdminStudent.name,
              boletim: editBoletim,
              simulados: editSimulados
            })
          });

          if (res.ok) {
            const data = await res.json();
            setEditAnalysis(data.analysis || '');
          } else {
            const err = await res.json();
            alert('Erro ao gerar análise por IA: ' + err.error);
          }
        } catch(err) {
          console.error(err);
          alert('Erro de rede ao solicitar geração de análise.');
        }
      }

      function handleExportHtmlFile() {
        const htmlCode = generateSingleHtml(students, firebaseConfig);
        const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  </script>
</body>
</html>`;
}
