import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing with a higher limit for Base64 images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Initialize Google Gen AI
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

// API: Extract grades from image using Gemini AI
app.post("/api/extract-grades", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Image data and MIME type are required." });
    }

    const ai = getAiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "A chave API do Gemini não está configurada no servidor. Por favor, adicione GEMINI_API_KEY nos Secrets do AI Studio." 
      });
    }

    const systemPrompt = `Você é um assistente de secretaria escolar especializado em ler boletins de notas e convertê-los em dados JSON estruturados para o sistema SPABB.
Analise a imagem enviada. Ela pode ser um boletim, tabela de notas impressa ou anotação legível.
Tente encontrar notas de 0 a 10 para o 1º Bimestre (b1) das seguintes disciplinas:
ARTE, CIÊNCIAS, EDUCAÇÃO ÉTNICO-RACIAL, EDUCAÇÃO FINANCEIRA, EDUCAÇÃO SOCIOEMOCIONAL, FORMAÇÃO CIDADÃ, FORMAÇÃO DO LEITOR, GEOGRAFIA, HABILIDADES EM FOCO – LP, HABILIDADES EM FOCO – MA, HISTÓRIA, INGLÊS, LÍNGUA PORTUGUESA, MATEMÁTICA, RECREAÇÃO.

Também tente encontrar porcentagens de acerto (0% a 100%) para os simulados (1º, 2º e 3º Simulados) de Português e Matemática.

Retorne EXCLUSIVAMENTE um objeto JSON válido no seguinte formato:
{
  "boletim": {
    "ARTE": { "b1": 8.5 },
    "CIÊNCIAS": { "b1": 8.0 },
    "MATEMÁTICA": { "b1": 7.5 }
  },
  "simulados": {
    "s1": { "portugues": 68.2, "matematica": 59.1 },
    "s2": { "portugues": 77.3, "matematica": 77.3 },
    "s3": { "portugues": 50.0, "matematica": 45.5 }
  }
}

Importante:
1. Retorne apenas notas que encontrar. Se uma disciplina não for encontrada, não a inclua no JSON ou coloque o campo como null.
2. Certifique-se de que os números de notas estejam entre 0 e 10 e porcentagens entre 0 e 100.
3. Não use blocos de código markdown ou texto explicativo antes ou depois. Retorne apenas o JSON puro.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{}";
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let extractedData;
    try {
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return res.status(500).json({ error: "Falha ao processar os dados retornados pela IA.", raw: responseText });
    }

    res.json(extractedData);
  } catch (error: any) {
    console.error("Error in /api/extract-grades:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido ao processar imagem." });
  }
});

// API: Generate student pedagogical analysis paragraph using Gemini AI
app.post("/api/generate-analysis", async (req, res) => {
  try {
    const { studentName, boletim, simulados } = req.body;
    if (!studentName) {
      return res.status(400).json({ error: "Student name is required." });
    }

    const ai = getAiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "A chave API do Gemini não está configurada no servidor." 
      });
    }

    const prompt = `Você é um professor ou coordenador pedagógico da escola EMEF Antonio Barroso Braga.
Gere um parágrafo curto, profissional e acolhedor (com cerca de 3 a 5 linhas) de análise pedagógica em português analisando o desempenho do aluno ${studentName}.

Aqui estão as notas atuais dele:
Notas do 1º Bimestre:
${JSON.stringify(boletim, null, 2)}

Resultados dos Simulados:
${JSON.stringify(simulados, null, 2)}

Diretrizes para a análise:
- Analise a média geral do boletim e a tendência dos simulados.
- Se houver notas excelentes (como 9.0 ou 10.0), elogie.
- Se houver uma queda de rendimento nos simulados (ex: do 2º para o 3º simulado ou notas abaixo de 70% que é considerado Crítico), aponte de forma construtiva e ressalte a necessidade de intervenção ou acompanhamento pedagógico focado.
- Retorne APENAS o parágrafo de texto corrido em português, sem formatação markdown extra, sem títulos e sem saudações redundantes. Seja direto, humano e preciso.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    res.json({ analysis: response.text?.trim() });
  } catch (error: any) {
    console.error("Error in /api/generate-analysis:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido ao gerar análise." });
  }
});

// Setup Vite Development or Production mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static assets from dist/ in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://localhost:${PORT}`);
  });
}

startServer();
