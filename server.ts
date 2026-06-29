import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "55mb" }));
  app.use(express.urlencoded({ limit: "55mb", extended: true }));

  // Initialize official Gemini SDK safely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Contextual AI clinical assistant
  app.post("/api/gemini-assistant", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Ocorreu um problema ao verificar as credenciais de inteligência artificial. Entre em Ajustes > Segredos para validar sua chave." 
        });
      }

      const { messages, patientInfo, clinicalRecords } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Parâmetro 'messages' é inválido ou ausente." });
      }

      // Format patient context details
      let patientContext = "Nenhum paciente selecionado.";
      if (patientInfo) {
        patientContext = `Paciente: ${patientInfo.name}
Idade/Data de Nasc.: ${patientInfo.birthDate || 'Não informada'}
Gênero/Identidade: ${patientInfo.gender || 'Não informada'}
CPF: ${patientInfo.cpf || 'Não informado'}
Status de Atendimento: ${patientInfo.status === 'active' ? 'Ativo' : 'Inativo / Arquivado'}
Status Financeiro: ${patientInfo.financialStatus === 'paid' ? 'Em dia / Pago' : patientInfo.financialStatus === 'pending' ? 'Pendente de acerto' : patientInfo.financialStatus === 'overdue' ? 'Em débito / Atrasado' : patientInfo.financialStatus === 'exempt' ? 'Isento / Pro bono' : 'Em dia'}
Notas Administrativas de Cadastro: ${patientInfo.notes || 'Nenhuma'}`;
      }

      // Format clinical records/evolutions history context
      let recordsContext = "Nenhum histórico ou evolução clínica encontrada para este paciente.";
      if (clinicalRecords && Array.isArray(clinicalRecords) && clinicalRecords.length > 0) {
        recordsContext = clinicalRecords.map((r: any, idx: number) => `
--- Registro ${idx + 1} ---
Data da Consulta: ${r.sessionDate.split('-').reverse().join('/')}
Título da Sessão: ${r.title}
Síntese Subjetiva (Relato): ${r.sessionSummary || 'Não registrada.'}
Observações Técnicas e Análise: ${r.clinicalObservations || 'Não registrada.'}
Plano Terapêutico e Homework: ${r.therapeuticPlan || 'Não registrado.'}
Modo do Registro: ${r.isLocked ? 'Assinado / Bloqueado de alterações' : 'Rascunho editável'}
`).join("\n");
      }

      // Build the contextual rules
      const systemInstruction = `Você é o Co-Piloto de Inteligência Artificial Clínica de um psicólogo.
Sua missão é dar suporte confidencial, ético e embasado em técnicas de psicologia (como TCC, Psicanálise, Humanismo etc.) para que o terapeuta compreenda padrões, organize resumos ou extraia diretrizes clínicas a partir das evoluções do prontuário do paciente.

DADOS DO PACIENTE ATUAL:
${patientContext}

HISTÓRICO COMPLETO DE PRONTUÁRIOS (EVOLUÇÕES CLÍNICAS) DESSE PACIENTE:
${recordsContext}

REGIMENTOS ÉTICOS E DIRETRIZES DE RESPOSTA:
1. Responda estritamente em PORTUGUÊS DO BRASIL de maneira muito acolhedora, objetiva, profissional e confidencial.
2. Seu tom deve ser o de um colega clínico sênior prestando assessoria técnica. Evite generalidades superficiais e jargões comerciais vazios. Forneça análises psicológicas textuais precisas.
3. Se o terapeuta solicitar resumos ou análises, destaque as evoluções emocionais e progressões cronológicas comparando as queixas iniciais e o estágio atual.
4. Jamais defina diagnósticos absolutos ou dispense a autoridade do profissional de psicologia humano. Apresente sugestões de intervenções de forma condicional/reco-mendativa.
5. Se for solicitado um plano de sessão ou homework, oriente-se pelas queixas mais recentes descritas nos registros.`;

      // Map communication history to Google GenAI schema
      // Only keep user / model roles
      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Call Gemini model with fallbacks to guarantee high availability (e.g. key/model load issues)
      const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      let responseText = "";
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Tentando processamento de IA clinicamente contextuada usando o modelo ${modelName}...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.6,
            }
          });
          
          if (response && response.text) {
            responseText = response.text;
            console.log(`Sucesso no processamento com o modelo de IA ${modelName}.`);
            break;
          }
        } catch (err: any) {
          console.error(`Falha temporária ao tentar o modelo ${modelName}:`, err.message || err);
          lastError = err;
        }
      }

      if (!responseText) {
        throw lastError || new Error("Nenhum modelo de IA disponível respondeu no momento. Por favor, tente novamente mais tarde.");
      }

      res.json({ text: responseText });
    } catch (err: any) {
      console.error("Erro na API de Assistente IA:", err);
      res.status(500).json({ error: err.message || "Falha de processamento no servidor." });
    }
  });

  // API Route for speech transcribing and clinical structuring
  app.post("/api/gemini-audio-transcribe", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Credenciais de inteligência artificial ausentes. Verifique suas chaves na aba de Ajustes." 
        });
      }

      const { audioBase64, mimeType, textDraft, patientName } = req.body;

      let prompt = `Você é um psicólogo clínico sênior focado na estruturação de evoluções de prontuário eletrônico.
Sua missão é extrair e organizar as informações de uma gravação ou de notas brutas tiradas após a sessão do paciente ${patientName || "do Paciente"}.

Você deve formatar a resposta estritamente como um objeto JSON em português brasileiro contendo as chaves exatas:
{
  "title": "Título curto resumindo o tema central desta sessão",
  "summary": "Um parágrafo de síntese subjetiva sobre as queixas relatadas, sentimentos do paciente e estado emocional",
  "observations": "Observações técnicas do psicólogo sobre postura, de-fesas inconscientes identificadas e técnicas sugeridas",
  "plan": "Plano terapêutico atual, de homework (tarefas) e acordos estabelecidos",
  "transcription": "A transcrição na íntegra das palavras ditas na gravação de áudio ou o próprio relato textual bruto adaptado"
}

Evite jargões promocionais. Seja estritamente clínico, empático e realista.`;

      let contents: any[] = [];

      if (audioBase64) {
        // Prepare multimodal part for audio
        contents = [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || "audio/webm",
                  data: audioBase64
                }
              },
              {
                text: prompt + "\nAnalise o áudio anexo da sessão clínica de psicoterapia e retorne a estruturação clínica no formato JSON solicitado."
              }
            ]
          }
        ];
      } else if (textDraft) {
        contents = [
          {
            parts: [
              {
                text: `${prompt}\nEste é o rascunho de voz ou anotação rápida coletada: "${textDraft}".\nEstruture rigorosamente no formato JSON.`
              }
            ]
          }
        ];
      } else {
        return res.status(400).json({ error: "Nenhum arquivo de áudio ou texto de rascunho foram fornecidos." });
      }

      const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest"];
      let responseText = "";
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              responseMimeType: "application/json",
              temperature: 0.4
            }
          });

          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          console.error(`Falha ao tentar transcrever com ${modelName}:`, err.message || err);
          lastError = err;
        }
      }

      if (!responseText) {
        // Fallback clinical mock generation if Gemini has an error or unavailability
        throw lastError || new Error("Não foi possível processar a transcrição automática no momento.");
      }

      // Try parsing the response to ensure valid JSON structure
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (jsonErr) {
        // Clean markdown backticks if any
        const cleanedText = responseText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        parsedData = JSON.parse(cleanedText);
      }

      res.json(parsedData);
    } catch (err: any) {
      console.error("Erro na API de Transcrição:", err);
      res.status(500).json({ 
        error: err.message || "Não foi possível transcrever ou formatar o áudio do prontuário." 
      });
    }
  });

  // Serve static UI / Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NexPsi running on port ${PORT}`);
  });
}

startServer();
