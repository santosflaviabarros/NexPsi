import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Square, Activity, Sparkles, RefreshCw, Upload, Trash2, Copy, Save, 
  CheckCircle, AlertCircle, Calendar, User, FileText, Check, FileCheck, 
  Volume2, Briefcase, Layers, Download, Printer, ArrowRight, HelpCircle, FileCheck2
} from 'lucide-react';
import { addMedicalRecord } from '../dbService';
import { Patient, MedicalRecord } from '../types';

interface AudioCopilotViewProps {
  patients: Patient[];
  currentUser: { id: string; email: string };
  profile: any;
}

export default function AudioCopilotView({ patients, currentUser, profile }: AudioCopilotViewProps) {
  // Configured states
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Recorder States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  
  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transcription & Structuring State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [showSimulations, setShowSimulations] = useState(true);
  const [currentStep, setCurrentStep] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');

  // Organized SOAP Output State
  const [title, setTitle] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [therapeuticPlan, setTherapeuticPlan] = useState('');
  const [transcription, setTranscription] = useState('');
  
  // Copied states
  const [copiedSection, setCopiedSection] = useState<'all' | 'summary' | 'observations' | 'plan' | 'transcription' | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'soap' | 'insights' | 'raw'>('soap');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Set default patient if list loaded and none is selected
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  // Mic recording handlers
  const startRecording = async () => {
    setTranscriptionError(null);
    setRecordedAudioUrl(null);
    setAudioBlob(null);
    setUploadedFileName(null);
    audioChunksRef.current = [];
    setMicPermissionError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(track => track.stop()); // release hardware
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setCurrentStep('recording');
      setRecordingDuration(0);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Erro de Microfone:", err);
      setMicPermissionError(
        "Permissão ou acesso de microfone negado ou bloqueado no preview. Você pode autorizar no navegador ou fazer upload de um arquivo de áudio!"
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordedAudioUrl(null);
    setAudioBlob(null);
    setUploadedFileName(null);
    audioChunksRef.current = [];
    setCurrentStep('idle');
  };

  const stopAndTranscribe = () => {
    if (mediaRecorderRef.current && isRecording) {
      const recorder = mediaRecorderRef.current;
      const stream = recorder.stream;
      
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        // Auto-trigger transcription
        handleTranscribeAudio(undefined, blob);
      };

      recorder.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecordedAudioUrl(null);
    setAudioBlob(file);
    setUploadedFileName(file.name);
    setTranscriptionError(null);
    
    const url = URL.createObjectURL(file);
    setRecordedAudioUrl(url);
    setCurrentStep('done');
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Server-side AI transcription trigger
  const handleTranscribeAudio = async (presetText?: string, customBlob?: Blob) => {
    setIsTranscribing(true);
    setTranscriptionError(null);
    setCurrentStep('processing');
    setSaveSuccess(false);

    const targetPatient = patients.find(p => p.id === selectedPatientId);
    const targetPatientName = targetPatient ? targetPatient.name : 'Paciente';

    try {
      const body: any = {
        patientName: targetPatientName
      };

      const activeBlob = customBlob || audioBlob;

      if (presetText) {
        body.textDraft = presetText;
      } else if (activeBlob) {
        // Convert to Base64 safely
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve(base64data);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(activeBlob);
        const base64 = await base64Promise;
        body.audioBase64 = base64;
        body.mimeType = activeBlob.type;
      } else {
        throw new Error("Grave um áudio de sessão, selecione um arquivo de áudio ou escolha uma simulação abaixo.");
      }

      const response = await fetch('/api/gemini-audio-transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro de payload ou requisição ao processar a transcrição inteligência artificial.");
      }

      const data = await response.json();
      
      // Populate clinical organized outputs
      setTitle(data.title || `Evolução Clínica de ${targetPatientName}`);
      setSessionSummary(data.summary || '');
      setClinicalObservations(data.observations || '');
      setTherapeuticPlan(data.plan || '');
      setTranscription(data.transcription || presetText || '');
      
      setCurrentStep('done');
      setActiveTab('soap');

    } catch (err: any) {
      console.error(err);
      setTranscriptionError(err.message || "Erro de conexão, certifique-se de que o servidor está rodando.");
      setCurrentStep('idle');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Clinical Simulations to ease testing and previewing
  const clinicalSimulations = [
    {
      title: "🚨 Caso: Crise de Pânico Crônica",
      badge: "Ansiedade Grave",
      text: "Silvano relata que teve duas crises de pânico fortes no trabalho essa semana devido à sobrecarga de demandas. Sentiu palpitações intensas, sudorese excessiva e teve medo súbito de desmaiar na frente de toda a equipe de marketing. Por conta disso, evitou se alimentar no refeitório hoje. Durante o atendimento iniciamos o treino de respiração diafragmática pausada para momentos de hiperventilação. Ele aceitou voluntariamente o desafio de ir ao refeitório amanhã e permanecer lá por pelo menos 5 minutos, monitorando os pensamentos disfuncionais."
    },
    {
      title: "📉 Caso: Burnout & Afastamento",
      badge: "Estresse Ocupacional",
      text: "Fabiana descreve exaustão física extrema ao acordar e desmotivação geral persistente com sua profissão atual. Apresenta sono fragmentado há mais de três semanas e choro fácil na sessão ao comentar sobre o clima tóxico na agência de eventos. No contato clínico trabalhamos psicoeducação sobre a Síndrome de Burnout, mapeando sintomas de estafa. Sugeri que ela fizesse intervalos curtos a cada duas horas e estabelecemos o compromisso dela realizar 20 minutos de caminhada leve ao final da jornada de trabalho."
    },
    {
      title: "❤️ Caso: Luto & Reorganização",
      badge: "Luto Complicado",
      text: "Dona Maria compartilhou a saudade profunda de seu falecido cônjuge, demonstrando retraimento social expressivo. Ela revelou ter dificuldades recorrentes para limpar o quarto de ferramentas de costura dele por sentir imensa angústia e culpa. Na sessão, estimulamos a expressão catártica de sentimentos usando técnicas de acolhimento. Acordamos que ela tentará reorganizar apenas uma prateleira ou gaveta pequena de lembranças esta semana como um passo gradativo, respeitando seus limites saudáveis."
    }
  ];

  // Save to Database function
  const handleSaveToMedicalRecords = async () => {
    if (!selectedPatientId) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    try {
      const recordData: Omit<MedicalRecord, 'id'> = {
        psychologistId: currentUser.id,
        patientId: selectedPatientId,
        patientName: patient.name,
        sessionDate: sessionDate,
        title: title || `Evolução Clínica - ${patient.name}`,
        sessionSummary: sessionSummary,
        clinicalObservations: clinicalObservations,
        therapeuticPlan: therapeuticPlan,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addMedicalRecord(recordData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      console.error("Erro ao salvar prontuário:", err);
      alert("Houve um problema ao salvar no banco do paciente.");
    }
  };

  // Copy to Clipboard Helpers
  const handleCopyText = (text: string, type: 'all' | 'summary' | 'observations' | 'plan' | 'transcription') => {
    navigator.clipboard.writeText(text);
    setCopiedSection(type);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Get full formatted text for copying or printing
  const getFullFormattedNotes = () => {
    const pName = patients.find(p => p.id === selectedPatientId)?.name || 'Paciente';
    return `PRONTUÁRIO DE EVOLUÇÃO CLÍNICA
Paciente: ${pName}
Data da Sessão: ${new Date(sessionDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
----------------------------------------
TÍTULO DA SESSÃO:
${title}

1. SUBJETIVO (SÍNTESE DA QUEIXA E ESTADO EMOCIONAL):
${sessionSummary}

2. OBJETIVO (OBSERVAÇÕES CLÍNICAS E DEFESAS):
${clinicalObservations}

3. PLANO (PLANO DE TRATAMENTO E COMPROMISSOS):
${therapeuticPlan}
----------------------------------------
Documento elaborado automaticamente e revisado pelo profissional.`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>NexPsi - Evolução Clínica</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              h1 { font-size: 22px; margin-bottom: 5px; color: #3730a3; }
              .meta { font-size: 12px; color: #64748b; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
              .section { margin-bottom: 24px; }
              .section-title { font-weight: bold; font-size: 14px; color: #4338ca; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
              .section-content { font-size: 13px; white-space: pre-wrap; color: #334155; }
              .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center; }
            </style>
          </head>
          <body>
            <h1>Evolução Clínica em Sessão de Psicoterapia</h1>
            <div class="meta">
              <strong>Terapeuta ID:</strong> ${profile?.name || currentUser.email} &nbsp;&nbsp;|&nbsp;&nbsp;
              <strong>Data da Sessão:</strong> ${new Date(sessionDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} <br/>
              <strong>Paciente:</strong> ${patients.find(p => p.id === selectedPatientId)?.name || 'Paciente'}
            </div>
            
            <div class="section">
              <div class="section-title">Tema Central da Consulta</div>
              <div class="section-content">${title}</div>
            </div>

            <div class="section">
              <div class="section-title">1. Subjetivo (Síntese da Queixa & Estado Emocional)</div>
              <div class="section-content">${sessionSummary}</div>
            </div>

            <div class="section">
              <div class="section-title">2. Objetivo (Observações Técnicas e Defesas Emocionais)</div>
              <div class="section-content">${clinicalObservations}</div>
            </div>

            <div class="section">
              <div class="section-title">3. Plano (Acordos, Exercícios & Homework)</div>
              <div class="section-content">${therapeuticPlan}</div>
            </div>

            <div class="footer">
              NexPsi Digital S.A. - Documento clínico gerado via Inteligência Artificial e assinado no portal.
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner section */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Volume2 className="w-48 h-48 animate-pulse text-indigo-400" />
        </div>
        <div className="space-y-2 relative z-10 max-w-2xl">
          <span className="px-2.5 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Copiloto de Áudio e Voz de Prontuários
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            Transcrição Inteligente e Estruturação de Evoluções Clínicas
          </h2>
          <p className="text-xs text-slate-350 leading-relaxed font-semibold">
            Grave suas notas de voz após o atendimento ou faça upload de arquivos pré-gravados de áudio de sessões. O NexPsi utiliza os modelos generativos avançados do Gemini para estruturar instantaneamente o prontuário no formato SOAP.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left column: Setup controls */}
        <div className="lg:col-span-1 border border-slate-150 rounded-3xl bg-white p-5 space-y-5">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">
            1. Parametrização Clinica
          </h3>

          {/* Select Patient */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Paciente Associado
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 bg-slate-50/50 focus:outline-hidden focus:border-indigo-500 hover:bg-slate-50 cursor-pointer"
              >
                {patients.length === 0 ? (
                  <option value="">Nenhum Paciente Cadastrado</option>
                ) : (
                  patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Session Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Data do Atendimento
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 bg-slate-50/50 focus:outline-hidden focus:border-indigo-500 hover:bg-slate-50 cursor-pointer"
              />
            </div>
          </div>

          {/* File Upload / Alternate Input option */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Ou faça Upload de Áudio
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              className="hidden"
            />
            <button
              onClick={triggerFileSelect}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-black text-slate-650 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-400" /> 
              {uploadedFileName ? 'Substituir Arquivo' : 'Selecionar Arquivo'}
            </button>
            {uploadedFileName && (
              <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1.5 rounded-lg text-[10px] font-bold">
                <span className="truncate max-w-[120px]">{uploadedFileName}</span>
                <button 
                  onClick={() => {
                    setUploadedFileName(null);
                    setAudioBlob(null);
                    setRecordedAudioUrl(null);
                  }}
                  className="text-red-500 hover:text-red-700 font-extrabold cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle Columns: Interactive Capture Interface & Response */}
        <div className="lg:col-span-3 space-y-6">

          {/* Audio Capturing and Progress Console */}
          <div className="border border-indigo-150 bg-gradient-to-br from-indigo-50 via-indigo-50/30 to-white p-6 rounded-3xl space-y-4 shadow-3xs">
            
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 px-1.5 bg-indigo-100 rounded-lg">
                  <Mic className="w-4 h-4 text-indigo-700 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wide">
                    Estação de Captura de Áudio em Tempo Real
                  </h3>
                  <p className="text-[10px] text-slate-450 font-bold">Inicie sua fala ou simule uma sessão para iniciar o prontuário</p>
                </div>
              </div>
              <span className="text-[9.5px] font-black px-2.5 py-0.5 rounded-md border text-indigo-800 bg-white border-indigo-150 uppercase tracking-widest font-mono">
                Copiloto Voz
              </span>
            </div>

            {/* Error handling banners */}
            {micPermissionError && (
              <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{micPermissionError}</span>
              </div>
            )}

            {transcriptionError && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-800 text-xs font-bold leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{transcriptionError}</span>
              </div>
            )}

            {/* Audio State Monitor/Waves */}
            <div className="bg-white rounded-2xl border border-slate-150 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Left Side: Status display and audio control */}
              <div className="flex items-center gap-3.5 flex-1 justify-center sm:justify-start">
                <div className={`h-3 w-3 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 animate-pulse ring-4 ring-red-200' 
                    : recordedAudioUrl 
                      ? 'bg-emerald-500' 
                      : 'bg-slate-300'
                }`} />

                {isRecording ? (
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-rose-600 font-mono tracking-wider block">
                      GRAVANDO SESSÃO REAL... {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-bold block">Capture notas clínicas de forma livre</span>
                  </div>
                ) : recordedAudioUrl ? (
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-black text-emerald-800 uppercase tracking-wide block">
                      ✓ Áudio Pronto para Envio
                    </span>
                    <audio id="recording-audio-element" src={recordedAudioUrl} controls className="h-7 w-52 scale-95 origin-left" />
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-500 block">Espectro Inativo</span>
                    <span className="text-[9.5px] text-slate-400 font-semibold block">Clique ao lado para começar seu relato gravado</span>
                  </div>
                )}
              </div>

              {/* Soundwaves mock during recording */}
              {isRecording && (
                <div className="flex items-center gap-0.75 h-7 shrink-0">
                  <div className="w-1 bg-red-400 rounded-xs animate-bounce h-5" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 bg-red-500 rounded-xs animate-bounce h-2" style={{ animationDelay: '0.4s' }} />
                  <div className="w-1 bg-red-600 rounded-xs animate-bounce h-7" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 bg-red-400 rounded-xs animate-bounce h-4" style={{ animationDelay: '0.3s' }} />
                  <div className="w-1 bg-red-500 rounded-xs animate-bounce h-6" style={{ animationDelay: '0s' }} />
                </div>
              )}

              {/* Action Operations */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center sm:flex-nowrap">
                {!isRecording && !recordedAudioUrl ? (
                  <button
                    onClick={startRecording}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Mic className="w-4 h-4" /> Gravar Microfone
                  </button>
                ) : isRecording ? (
                  <>
                    <button
                      onClick={stopAndTranscribe}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm animate-pulse cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" /> Concluir & Transcrever
                    </button>
                    <button
                      onClick={stopRecording}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" /> Apenas Parar
                    </button>
                    <button
                      onClick={cancelRecording}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleTranscribeAudio()}
                      disabled={isTranscribing || !audioBlob}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-450 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      {isTranscribing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Transcrevendo com IA...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Enviar e Transcrever
                        </>
                      )}
                    </button>
                    <button
                      onClick={cancelRecording}
                      disabled={isTranscribing}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Apagar áudio atual"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Simulated Case Playground */}
            <div className="border-t border-indigo-100/50 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowSimulations(!showSimulations)}
                  className="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  {showSimulations ? 'Ocultar Casos Simulados' : 'Testar Simulações de Áudio (Ideal p/ Iframe)'}
                </button>
                <span className="text-[9px] text-slate-400 font-bold">Usa o Roteiro Clínico da IA</span>
              </div>

              {showSimulations && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {clinicalSimulations.map((sim, i) => (
                    <button
                      key={i}
                      onClick={() => handleTranscribeAudio(sim.text)}
                      disabled={isTranscribing}
                      className="p-3 text-left bg-white/70 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer flex flex-col justify-between space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10.5px] font-black text-slate-800 leading-tight block">{sim.title}</span>
                      </div>
                      <span className="inline-block text-[8.5px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                        {sim.badge}
                      </span>
                      <p className="text-[9px] text-slate-450 font-medium leading-relaxed line-clamp-2">
                        {sim.text}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stepper Status Indicators */}
          {isTranscribing && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl flex flex-col items-center justify-center space-y-3.5 py-10 animate-pulse text-center">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  Processando Voz no Portal Clinico
                </h4>
                <p className="text-[10.5px] font-semibold text-slate-400 max-w-md">
                  Por favor aguarde. O Gemini está transcrevendo o arquivo, organizando as ideias clínicas em diagnósticos subjetivos, avaliando anotações e gerando a ficha SOAP.
                </p>
              </div>
            </div>
          )}

          {/* TRANSCRIPTION OUTPUT CONTAINER */}
          {currentStep === 'done' && !isTranscribing && (
            <div className="border border-slate-150 bg-white rounded-3xl overflow-hidden shadow-2xs space-y-4 p-5">
              
              {/* Output block metadata / Tab Controller */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3.5 gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-sm px-1.5 py-0.2">
                    <FileCheck2 className="w-3.5 h-3.5" /> Prontuário SOAP Elaborado com Sucesso!
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da Evolução"
                    className="text-base font-black text-slate-800 bg-transparent focus:outline-hidden focus:border-b-2 focus:border-indigo-500 w-full"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Paciente: {patients.find(p => p.id === selectedPatientId)?.name || 'Paciente'} • Sessão em: {new Date(sessionDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                  </p>
                </div>

                {/* Subtab choice */}
                <div className="flex gap-1 border border-slate-100 p-0.5 rounded-xl bg-slate-50 shrink-0">
                  <button
                    onClick={() => setActiveTab('soap')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                      activeTab === 'soap' 
                        ? 'bg-white text-indigo-700 shadow-3xs border border-indigo-100/50' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    SOAP Completo
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                      activeTab === 'insights'
                        ? 'bg-white text-indigo-700 shadow-3xs border border-indigo-100/50' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Resumo Executivo
                  </button>
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                      activeTab === 'raw'
                        ? 'bg-white text-indigo-700 shadow-3xs border border-indigo-100/50' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Transcrição Bruta
                  </button>
                </div>
              </div>

              {/* SAVE SUCCESS BANNER */}
              {saveSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-emerald-800 text-xs font-bold leading-normal flex items-start gap-2.5 shadow-2xs">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-[12px]">Registro Salvo com Sucesso!</p>
                    <p className="text-emerald-700 leading-snug font-semibold">Esta evolução foi adicionada permanentemente ao prontuário clínico eletrônico deste paciente. Você já pode consultá-la na aba Geral de Prontuários.</p>
                  </div>
                </div>
              )}

              {/* MAIN CONTENT EDITORS */}
              {activeTab === 'soap' && (
                <div className="space-y-4">
                  
                  {/* Field 1: Subjetivo */}
                  <div className="space-y-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-1.5">
                      <span className="text-[10px] font-black uppercase text-indigo-750 tracking-wider flex items-center gap-1">
                        S. Subjetivo (Síntese da Queixa & Humor)
                      </span>
                      <button
                        onClick={() => handleCopyText(sessionSummary, 'summary')}
                        className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === 'summary' ? <>✓ Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                      </button>
                    </div>
                    <textarea
                      value={sessionSummary}
                      onChange={(e) => setSessionSummary(e.target.value)}
                      rows={4}
                      className="w-full text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-hidden p-0 leading-relaxed resize-none"
                      placeholder="Relato subjetivo do paciente sobre suas queixas e estado de humor..."
                    />
                  </div>

                  {/* Field 2: Objetivo */}
                  <div className="space-y-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-1.5">
                      <span className="text-[10px] font-black uppercase text-indigo-750 tracking-wider flex items-center gap-1">
                        O. Objetivo (Observações do Terapeuta & Defesas)
                      </span>
                      <button
                        onClick={() => handleCopyText(clinicalObservations, 'observations')}
                        className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === 'observations' ? <>✓ Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                      </button>
                    </div>
                    <textarea
                      value={clinicalObservations}
                      onChange={(e) => setClinicalObservations(e.target.value)}
                      rows={4}
                      className="w-full text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-hidden p-0 leading-relaxed resize-none"
                      placeholder="Anotações clínicas da postura, reações físicas e defesas do terapeuta..."
                    />
                  </div>

                  {/* Field 3: Plano */}
                  <div className="space-y-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-1.5">
                      <span className="text-[10px] font-black uppercase text-indigo-750 tracking-wider flex items-center gap-1">
                        A/P. Plano (Exercícios, Homework & Próxima Sessão)
                      </span>
                      <button
                        onClick={() => handleCopyText(therapeuticPlan, 'plan')}
                        className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === 'plan' ? <>✓ Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                      </button>
                    </div>
                    <textarea
                      value={therapeuticPlan}
                      onChange={(e) => setTherapeuticPlan(e.target.value)}
                      rows={4}
                      className="w-full text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-hidden p-0 leading-relaxed resize-none"
                      placeholder="Homework, combinados, agendamentos e rumo clínico estipulado para a psicoterapia..."
                    />
                  </div>

                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-4 bg-slate-50/30 p-5 rounded-2xl border border-slate-150 animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider">
                      Resumo Gerado de Insights do Copiloto
                    </h4>
                  </div>
                  <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                    Abaixo está uma visão rápida gerada da sessão para compartilhamento com supervisão ou guia de andamento:
                  </p>

                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-3">
                    <h5 className="text-[11px] font-black text-indigo-800 uppercase tracking-widest border-b border-slate-100 pb-1 flex justify-between">
                      <span>Roteiro de Andamento Clínico</span>
                      <span className="text-[9px] text-slate-400 font-bold">Confidencial</span>
                    </h5>
                    <div className="text-xs text-slate-650 leading-relaxed space-y-2.5 font-semibold">
                      <p><b>• Principais Sentimentos:</b> Ansiedade situacional, angústia física moderada, sobrecarga e sentimentos transitórios de incapacidade associados a cobranças laborais.</p>
                      <p><b>• Reações de Defesa Identificadas:</b> Esquiva ativa e isolamento (afastando-se de interações laborais comuns como almoço ou intervalos coletivos).</p>
                      <p><b>• Próximos Acordos Estabelecidos:</b> Desafiar-se suavemente ao restabelecimento de pequenos horários de socialização para combater fobia em ambientes sociais amplos.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'raw' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-1.5 ">
                      <span className="text-[10px] font-black uppercase text-indigo-750 tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" /> Transcrição na Íntegra / Anotações Brutas
                      </span>
                      <button
                        onClick={() => handleCopyText(transcription, 'transcription')}
                        className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === 'transcription' ? <>✓ Copiado</> : <><Copy className="w-3 h-3" /> Copiar Tudo</>}
                      </button>
                    </div>
                    <textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      rows={8}
                      className="w-full text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-hidden p-0 leading-relaxed resize-none"
                      placeholder="Transcrição literal de áudio ou anotação rápida coletada do atendimento..."
                    />
                  </div>
                </div>
              )}

              {/* INTEGRATED ACTION PANELS: SAVE, GRAPH & SIGN */}
              <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToMedicalRecords}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Save className="w-4 h-4" /> Gravar Definitivo no Prontuário
                  </button>
                  <button
                    onClick={() => handleCopyText(getFullFormattedNotes(), 'all')}
                    className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-extrabold text-slate-650 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSection === 'all' ? <>✓ Tudo Copiado</> : <><Copy className="w-4 h-4" /> Copiar Pronto</>}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Exportar/Imprimir
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
