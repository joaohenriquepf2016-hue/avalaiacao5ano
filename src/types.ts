export interface SubjectGrades {
  b1: number | null;
  b2: number | null;
  b3: number | null;
  b4: number | null;
  rec: number | null;
}

export interface SimuladoData {
  portugues: number | null; // percentage, e.g., 68.2
  matematica: number | null; // percentage, e.g., 59.1
  portuguesLevel?: string; // "MUITO CRÍTICO", "CRÍTICO", "INTERMEDIÁRIO", "ADEQUADO"
  matematicaLevel?: string; // "MUITO CRÍTICO", "CRÍTICO", "INTERMEDIÁRIO", "ADEQUADO"
}

export interface StudentSimulados {
  [key: string]: SimuladoData;
}

export interface Student {
  id: string;
  name: string;
  photo: string; // Base64 image data or URL
  boletim: { [subject: string]: SubjectGrades };
  simulados: StudentSimulados;
  analysis?: string; // Teacher feedback / AI summary
  turma?: string; // Class identifier, e.g., "5º A", "5º B"
}

export interface FirebaseConfig {
  databaseURL: string;
  apiKey: string;
}

export const SUBJECT_LIST = [
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
