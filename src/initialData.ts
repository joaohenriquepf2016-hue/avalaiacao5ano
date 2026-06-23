import { Student } from "./types";

// Generates typical grades for mock students
const generateDefaultBoletim = (baseGrade: number) => {
  const subjects = [
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

  const boletim: { [subject: string]: any } = {};
  subjects.forEach((subj) => {
    // Add minor random variation
    const variation = (Math.random() - 0.5) * 1.5;
    const b1Val = Math.min(10, Math.max(5, Number((baseGrade + variation).toFixed(1))));
    
    boletim[subj] = {
      b1: b1Val,
      b2: null,
      b3: null,
      b4: null,
      rec: null
    };
  });

  // Specific overrides for standard look
  if (boletim["HABILIDADES EM FOCO – MA"]) boletim["HABILIDADES EM FOCO – MA"].b1 = 10;
  return boletim;
};

// Simple avatar API or high-quality styled fallback initials
export const getStudentAvatar = (name: string) => {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "arthur",
    name: "ARTHUR",
    photo: getStudentAvatar("Arthur"),
    boletim: {
      "ARTE": { b1: 8.5, b2: null, b3: null, b4: null, rec: null },
      "CIÊNCIAS": { b1: 8.0, b2: null, b3: null, b4: null, rec: null },
      "EDUCAÇÃO ÉTNICO-RACIAL": { b1: 6.5, b2: null, b3: null, b4: null, rec: null },
      "EDUCAÇÃO FINANCEIRA": { b1: 9.5, b2: null, b3: null, b4: null, rec: null },
      "EDUCAÇÃO SOCIOEMOCIONAL": { b1: 9.0, b2: null, b3: null, b4: null, rec: null },
      "FORMAÇÃO CIDADÃ": { b1: 9.5, b2: null, b3: null, b4: null, rec: null },
      "FORMAÇÃO DO LEITOR": { b1: 9.5, b2: null, b3: null, b4: null, rec: null },
      "GEOGRAFIA": { b1: 7.0, b2: null, b3: null, b4: null, rec: null },
      "HABILIDADES EM FOCO – LP": { b1: 9.0, b2: null, b3: null, b4: null, rec: null },
      "HABILIDADES EM FOCO – MA": { b1: 10.0, b2: null, b3: null, b4: null, rec: null },
      "HISTÓRIA": { b1: 6.0, b2: null, b3: null, b4: null, rec: null },
      "INGLÊS": { b1: 8.5, b2: null, b3: null, b4: null, rec: null },
      "LÍNGUA PORTUGUESA": { b1: 9.0, b2: null, b3: null, b4: null, rec: null },
      "MATEMÁTICA": { b1: 8.0, b2: null, b3: null, b4: null, rec: null },
      "RECREAÇÃO": { b1: 9.0, b2: null, b3: null, b4: null, rec: null }
    },
    simulados: {
      s1: { portugues: 68.2, matematica: 59.1 },
      s2: { portugues: 77.3, matematica: 77.3 },
      s3: { portugues: 50.0, matematica: 45.5 }
    },
    analysis: "Arthur apresenta média de 8,47 no 1º bimestre, com destaque para Habilidades em Foco MA (10,0). Porém, nos simulados SPABB, observa-se uma trajetória preocupante de queda: iniciou no nível Intermediário no 1º e 2º simulados, mas regrediu para o nível Crítico em ambas as disciplinas no 3º simulado. É necessário intervenção pedagógica imediata para reverter a tendência de queda."
  },
  {
    id: "j-thales",
    name: "J. THALES",
    photo: getStudentAvatar("Thales"),
    boletim: generateDefaultBoletim(8.0),
    simulados: {
      s1: { portugues: 75.0, matematica: 70.0 },
      s2: { portugues: 80.0, matematica: 75.0 },
      s3: { portugues: 85.0, matematica: 80.0 }
    },
    analysis: "J. Thales está em constante evolução. Mostrou melhoria contínua de desempenho nos simulados, atingindo nível Adequado em Português no 3º simulado. Mantém ótimas médias de bimestre."
  },
  {
    id: "andre",
    name: "ANDRÉ",
    photo: getStudentAvatar("Andre"),
    boletim: generateDefaultBoletim(8.2),
    simulados: {
      s1: { portugues: 80.0, matematica: 85.0 },
      s2: { portugues: 85.0, matematica: 90.0 },
      s3: { portugues: 90.0, matematica: 95.0 }
    },
    analysis: "Excelente desempenho! André permanece no nível Adequado em ambos os simulados e mantém notas altíssimas no boletim. Aluno exemplar e engajado."
  },
  {
    id: "francyne",
    name: "FRANCYNE",
    photo: getStudentAvatar("Francyne"),
    boletim: generateDefaultBoletim(7.8),
    simulados: {
      s1: { portugues: 70.0, matematica: 65.0 },
      s2: { portugues: 72.0, matematica: 70.0 },
      s3: { portugues: 75.0, matematica: 72.0 }
    },
    analysis: "Francyne demonstra estabilidade e empenho. Suas notas nos simulados estão no nível Intermediário, mostrando progresso consistente em Matemática."
  },
  {
    id: "bianca",
    name: "BIANCA",
    photo: getStudentAvatar("Bianca"),
    boletim: generateDefaultBoletim(8.5),
    simulados: {
      s1: { portugues: 90.0, matematica: 88.0 },
      s2: { portugues: 92.0, matematica: 90.0 },
      s3: { portugues: 95.0, matematica: 92.0 }
    },
    analysis: "Altíssimo rendimento! Bianca é destaque tanto no boletim escolar quanto nos Simulados, consolidando-se no nível Adequado em todas as etapas."
  },
  {
    id: "luara",
    name: "LUARA",
    photo: getStudentAvatar("Luara"),
    boletim: generateDefaultBoletim(8.1),
    simulados: {
      s1: { portugues: 75.0, matematica: 75.0 },
      s2: { portugues: 78.0, matematica: 80.0 },
      s3: { portugues: 82.0, matematica: 85.0 }
    },
    analysis: "Luara está de parabéns pela dedicação. Seus simulados subiram gradativamente de Intermediário para Adequado. Ótima postura de estudos."
  },
  {
    id: "diego",
    name: "DIEGO",
    photo: getStudentAvatar("Diego"),
    boletim: generateDefaultBoletim(7.5),
    simulados: {
      s1: { portugues: 60.0, matematica: 55.0 },
      s2: { portugues: 65.0, matematica: 60.0 },
      s3: { portugues: 68.0, matematica: 65.0 }
    },
    analysis: "Diego necessita de apoio focado em Matemática e Língua Portuguesa para superar o nível Crítico nos Simulados. Boas notas em Arte e Recreação."
  },
  {
    id: "monalisa",
    name: "MONALISA",
    photo: getStudentAvatar("Monalisa"),
    boletim: generateDefaultBoletim(8.3),
    simulados: {
      s1: { portugues: 85.0, matematica: 80.0 },
      s2: { portugues: 88.0, matematica: 85.0 },
      s3: { portugues: 90.0, matematica: 88.0 }
    },
    analysis: "Monalisa apresenta excelente desempenho acadêmico, consolidando-se no nível Adequado. É muito atenta e participativa nas aulas."
  },
  {
    id: "edmar",
    name: "EDMAR",
    photo: getStudentAvatar("Edmar"),
    boletim: generateDefaultBoletim(7.0),
    simulados: {
      s1: { portugues: 55.0, matematica: 50.0 },
      s2: { portugues: 58.0, matematica: 55.0 },
      s3: { portugues: 60.0, matematica: 58.0 }
    },
    analysis: "Edmar precisa intensificar os estudos de base em Língua Portuguesa e Matemática. Demonstra dedicação, mas requer intervenção pedagógica para avançar do nível Crítico."
  },
  {
    id: "thailon",
    name: "THAILON",
    photo: getStudentAvatar("Thailon"),
    boletim: generateDefaultBoletim(7.9),
    simulados: {
      s1: { portugues: 72.0, matematica: 68.0 },
      s2: { portugues: 75.0, matematica: 74.0 },
      s3: { portugues: 78.0, matematica: 76.0 }
    },
    analysis: "Thailon está com boa evolução nos simulados, mantendo-se firme no nível Intermediário. Recomenda-se focar em exercícios mais complexos para buscar o nível Adequado."
  },
  {
    id: "juliany",
    name: "JULIANY",
    photo: getStudentAvatar("Juliany"),
    boletim: generateDefaultBoletim(8.0),
    simulados: {
      s1: { portugues: 78.0, matematica: 75.0 },
      s2: { portugues: 80.0, matematica: 78.0 },
      s3: { portugues: 83.0, matematica: 82.0 }
    },
    analysis: "Juliany apresenta excelente constância. Suas notas são equilibradas e mostram preparação adequada para os simulados escolares."
  },
  {
    id: "raul",
    name: "RAUL",
    photo: getStudentAvatar("Raul"),
    boletim: generateDefaultBoletim(7.3),
    simulados: {
      s1: { portugues: 50.0, matematica: 52.0 },
      s2: { portugues: 62.0, matematica: 58.0 },
      s3: { portugues: 72.0, matematica: 70.0 }
    },
    analysis: "Grande superação! Raul iniciou o ano em nível Crítico, mas com muito esforço alcançou o nível Intermediário no 3º simulado. Parabéns pela evolução!"
  },
  {
    id: "kaio",
    name: "KAIO",
    photo: getStudentAvatar("Kaio"),
    boletim: generateDefaultBoletim(7.7),
    simulados: {
      s1: { portugues: 70.0, matematica: 72.0 },
      s2: { portugues: 74.0, matematica: 75.0 },
      s3: { portugues: 76.0, matematica: 78.0 }
    },
    analysis: "Kaio tem um perfil focado e regular. Mantém notas satisfatórias no boletim e níveis saudáveis de aproveitamento nos simulados."
  },
  {
    id: "felipe",
    name: "FELIPE",
    photo: getStudentAvatar("Felipe"),
    boletim: generateDefaultBoletim(8.2),
    simulados: {
      s1: { portugues: 80.0, matematica: 78.0 },
      s2: { portugues: 84.0, matematica: 82.0 },
      s3: { portugues: 88.0, matematica: 86.0 }
    },
    analysis: "Felipe demonstra alto comprometimento com as atividades escolares. Seus simulados refletem seu ótimo desempenho nas avaliações regulares."
  },
  {
    id: "juliano",
    name: "JULIANO",
    photo: getStudentAvatar("Juliano"),
    boletim: generateDefaultBoletim(7.6),
    simulados: {
      s1: { portugues: 68.0, matematica: 60.0 },
      s2: { portugues: 72.0, matematica: 65.0 },
      s3: { portugues: 75.0, matematica: 72.0 }
    },
    analysis: "Juliano mostra progresso consistente. Conseguiu sair do nível Crítico no 1º simulado e consolidou o nível Intermediário no 3º simulado."
  },
  {
    id: "kivia",
    name: "KÍVIA",
    photo: getStudentAvatar("Kivia"),
    boletim: generateDefaultBoletim(8.4),
    simulados: {
      s1: { portugues: 90.0, matematica: 85.0 },
      s2: { portugues: 92.0, matematica: 88.0 },
      s3: { portugues: 94.0, matematica: 90.0 }
    },
    analysis: "Desempenho brilhante! Kívia lidera com ótimas pontuações, sempre na zona de excelência (Adequado). Demonstra raciocínio lógico apurado."
  },
  {
    id: "marina",
    name: "MARINA",
    photo: getStudentAvatar("Marina"),
    boletim: generateDefaultBoletim(8.1),
    simulados: {
      s1: { portugues: 76.0, matematica: 78.0 },
      s2: { portugues: 80.0, matematica: 81.0 },
      s3: { portugues: 84.0, matematica: 85.0 }
    },
    analysis: "Marina exibe excelente postura acadêmica. Alcançou a zona Adequada no simulado de Matemática, refletindo dedicação aos estudos extraclasse."
  },
  {
    id: "kemilly",
    name: "KEMILLY",
    photo: getStudentAvatar("Kemilly"),
    boletim: generateDefaultBoletim(7.8),
    simulados: {
      s1: { portugues: 70.0, matematica: 68.0 },
      s2: { portugues: 75.0, matematica: 72.0 },
      s3: { portugues: 78.0, matematica: 76.0 }
    },
    analysis: "Kemilly mantém ótimo aproveitamento. Seus resultados são estáveis na faixa Intermediária e as notas em Habilidades em Foco são muito promissoras."
  },
  {
    id: "agatha",
    name: "AGATHA",
    photo: getStudentAvatar("Agatha"),
    boletim: generateDefaultBoletim(8.0),
    simulados: {
      s1: { portugues: 75.0, matematica: 72.0 },
      s2: { portugues: 78.0, matematica: 76.0 },
      s3: { portugues: 82.0, matematica: 80.0 }
    },
    analysis: "Agatha é muito esforçada e atenta. Mostrou evolução saudável ao longo dos simulados, aproximando-se do nível Adequado."
  },
  {
    id: "kevylla",
    name: "KEVYLLA",
    photo: getStudentAvatar("Kevylla"),
    boletim: generateDefaultBoletim(8.2),
    simulados: {
      s1: { portugues: 82.0, matematica: 80.0 },
      s2: { portugues: 86.0, matematica: 84.0 },
      s3: { portugues: 89.0, matematica: 87.0 }
    },
    analysis: "Excelente nível de aprendizado. Kevylla é dedicada, criativa e tem ótimos fundamentos nas disciplinas de exatas e humanas."
  },
  {
    id: "isabell",
    name: "ISABELL",
    photo: getStudentAvatar("Isabell"),
    boletim: generateDefaultBoletim(7.9),
    simulados: {
      s1: { portugues: 71.0, matematica: 69.0 },
      s2: { portugues: 74.0, matematica: 72.0 },
      s3: { portugues: 77.0, matematica: 75.0 }
    },
    analysis: "Isabell mantém consistência no nível Intermediário. Recomenda-se manter o ritmo de leitura e exercícios diários de raciocínio lógico."
  },
  {
    id: "hiago",
    name: "HIAGO",
    photo: getStudentAvatar("Hiago"),
    boletim: generateDefaultBoletim(7.6),
    simulados: {
      s1: { portugues: 65.0, matematica: 60.0 },
      s2: { portugues: 70.0, matematica: 68.0 },
      s3: { portugues: 74.0, matematica: 71.0 }
    },
    analysis: "Hiago demonstrou progresso ao avançar para a zona Intermediária no simulado. Necessita de reforço contínuo para consolidar os conteúdos básicos."
  },
  {
    id: "j-gabriel",
    name: "J. GABRIEL",
    photo: getStudentAvatar("Gabriel"),
    boletim: generateDefaultBoletim(7.7),
    simulados: {
      s1: { portugues: 70.0, matematica: 65.0 },
      s2: { portugues: 73.0, matematica: 70.0 },
      s3: { portugues: 76.0, matematica: 74.0 }
    },
    analysis: "J. Gabriel apresenta desempenho regular e satisfatório. Demonstra boa participação nas atividades práticas e esportivas."
  },
  {
    id: "messias",
    name: "MESSIAS",
    photo: getStudentAvatar("Messias"),
    boletim: generateDefaultBoletim(8.1),
    simulados: {
      s1: { portugues: 80.0, matematica: 75.0 },
      s2: { portugues: 83.0, matematica: 80.0 },
      s3: { portugues: 86.0, matematica: 84.0 }
    },
    analysis: "Messias destaca-se pela maturidade e foco. Apresenta ótimo crescimento acadêmico e seus resultados nos simulados já tocam a zona Adequada."
  },
  {
    id: "pedro-w",
    name: "PEDRO W.",
    photo: getStudentAvatar("Pedro"),
    boletim: generateDefaultBoletim(7.4),
    simulados: {
      s1: { portugues: 58.0, matematica: 50.0 },
      s2: { portugues: 65.0, matematica: 58.0 },
      s3: { portugues: 62.0, matematica: 54.0 }
    },
    analysis: "Pedro W. apresenta dificuldades pontuais que exigem acompanhamento psicopedagógico e reforço escolar focado para recuperar sua média."
  },
  {
    id: "emanuella",
    name: "EMANUELLA",
    photo: getStudentAvatar("Emanuella"),
    boletim: generateDefaultBoletim(8.3),
    simulados: {
      s1: { portugues: 84.0, matematica: 81.0 },
      s2: { portugues: 88.0, matematica: 85.0 },
      s3: { portugues: 91.0, matematica: 88.0 }
    },
    analysis: "Rendimento excepcional! Emanuella é muito empenhada, tem ótima interpretação de texto e domina com facilidade as operações matemáticas."
  },
  {
    id: "davi",
    name: "DAVI",
    photo: getStudentAvatar("Davi"),
    boletim: generateDefaultBoletim(7.8),
    simulados: {
      s1: { portugues: 72.0, matematica: 70.0 },
      s2: { portugues: 75.0, matematica: 73.0 },
      s3: { portugues: 78.0, matematica: 76.0 }
    },
    analysis: "Davi apresenta ótimo potencial de crescimento. É constante no nível Intermediário e exibe excelente comportamento em sala."
  }
];
