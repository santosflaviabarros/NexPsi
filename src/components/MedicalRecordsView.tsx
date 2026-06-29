import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ShieldAlert, Lock, Unlock, Eye, Edit3, Trash2, Search, Plus, 
  Calendar, CheckCircle, FileCheck2, ScrollText, AlertTriangle, X, AlertCircle,
  Sparkles, Bot, Send, RotateCcw, Mic, Square, Play, Pause, Volume2, Info, Check,
  HelpCircle, Activity, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MedicalRecord, Patient } from '../types';

interface MedicalRecordsViewProps {
  records: MedicalRecord[];
  patients: Patient[];
  onAddRecord: (record: Omit<MedicalRecord, 'id'>) => Promise<string>;
  onUpdateRecord: (id: string, updates: Partial<MedicalRecord>) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  preselectedPatientId?: string | null;
  onClearPreselectedPatient?: () => void;
}

export default function MedicalRecordsView({
  records,
  patients,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  preselectedPatientId,
  onClearPreselectedPatient
}: MedicalRecordsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientFilter, setPatientFilter] = useState('all');
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);

  // Form states
  const [patientId, setPatientId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [title, setTitle] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [therapeuticPlan, setTherapeuticPlan] = useState('');
  const [errorMess, setErrorMess] = useState('');
  const [evolutionFormat, setEvolutionFormat] = useState<'standard' | 'soap'>('standard');

  // Confirmation and operations notification states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState<string>('');
  
  const [actionError, setActionError] = useState<string | null>(null);

  // Session Recording and AI Transcription states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showSimulatedOptions, setShowSimulatedOptions] = useState(true);
  const [focusOnRecorder, setFocusOnRecorder] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setTranscriptionError(null);
    setRecordedAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    
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
        
        // Stop all tracks to release the hardware mic
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(250); // Slice chunks every 250ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Erro ao acessar microfone", err);
      setTranscriptionError(
        "Permissão ou acesso de microfone bloqueado pelo navegador (comum em previsualização em iframe). Mas você pode testar todo o fluxo imediatamente com as simulações interativas abaixo!"
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

  const stopAndTranscribe = () => {
    if (mediaRecorderRef.current && isRecording) {
      const recorder = mediaRecorderRef.current;
      const stream = recorder.stream;
      
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        
        // Release hardware mic
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

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null; // detach stop callback to ignore
      mediaRecorderRef.current.stop();
      // release mic tracks
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
    audioChunksRef.current = [];
  };

  const handleTranscribeAudio = async (presetText?: string, customBlob?: Blob) => {
    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      let body: any = {
        patientName: patients.find(p => p.id === patientId)?.name || 'Paciente'
      };

      const activeBlob = customBlob || audioBlob;

      if (presetText) {
        body.textDraft = presetText;
      } else if (activeBlob) {
        // Convert audio Blob to Base64
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
        throw new Error("Grave um áudio de sessão primeiro ou selecione uma simulação prática abaixo.");
      }

      const response = await fetch('/api/gemini-audio-transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Ocorreu um erro ao processar a transcrição inteligência artificial.");
      }

      const data = await response.json();
      
      // Populate clinical sections from organized JSON
      if (data.title) setTitle(data.title);
      if (data.summary) setSessionSummary(data.summary);
      if (data.observations) setClinicalObservations(data.observations);
      if (data.plan) setTherapeuticPlan(data.plan);

    } catch (err: any) {
      console.error("Transcription error:", err);
      setTranscriptionError(err.message || "Erro desconhecido de processamento da audição da sessão.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Contextual AI Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  const activePatientForAi = patients.find(p => p.id === patientFilter);
  const activeRecordsForAi = records.filter(r => r.patientId === patientFilter);

  useEffect(() => {
    if (patientFilter && patientFilter !== 'all') {
      const patient = patients.find(p => p.id === patientFilter);
      if (patient) {
        const patientRecs = records.filter(r => r.patientId === patientFilter);
        setChatMessages([
          { 
            role: 'assistant', 
            content: `Olá, Dr(a). Sou seu Assistente Clínico IA de Prontuário. Carreguei com segurança o histórico clínico de **${patient.name}** contendo **${patientRecs.length} evolução(ões) clínica(s)**.\n\nComo posso apoiar seu raciocínio clínico hoje? Você pode usar as opções de análise rápida abaixo ou formular perguntas específicas.` 
          }
        ]);
        setChatError('');
      }
    } else {
      setChatMessages([
        { 
          role: 'assistant', 
          content: 'Selecione um paciente específico acima para iniciar uma análise clínica contextual com inteligência artificial sobre os prontuários dele.' 
        }
      ]);
      setChatError('');
    }
  }, [patientFilter]);

  const handleSendChatMessage = async (presetPrompt?: string) => {
    const textToSend = presetPrompt || chatInput.trim();
    if (!textToSend || isChatLoading) return;

    if (!presetPrompt) {
      setChatInput('');
    }

    const newMessages = [...chatMessages, { role: 'user' as const, content: textToSend }];
    setChatMessages(newMessages);
    setIsChatLoading(true);
    setChatError('');

    try {
      const response = await fetch('/api/gemini-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: mappersToBackend(newMessages),
          patientInfo: activePatientForAi,
          clinicalRecords: activeRecordsForAi
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro de comunicação de rede.');
      }

      const resData = await response.json();
      setChatMessages([...newMessages, { role: 'assistant' as const, content: resData.text || '' }]);
    } catch (err: any) {
      setChatError(err.message || 'Falha de comunicação com o assistente clínico.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const mappersToBackend = (msgs: { role: 'user' | 'assistant'; content: string }[]) => {
    return msgs.map(m => m);
  };

  const handleClearHistory = () => {
    if (patientFilter !== 'all' && activePatientForAi) {
      const patientRecs = records.filter(r => r.patientId === patientFilter);
      setChatMessages([
        { 
          role: 'assistant', 
          content: `Chat secular reiniciado. Histórico de prontuários de **${activePatientForAi.name}** mantidos no contexto. Como posso te ajudar hoje com os **${patientRecs.length} registros** deste prontuário?` 
        }
      ]);
    } else {
      setChatMessages([
        { 
          role: 'assistant', 
          content: 'Selecione um paciente específico no filtro acima para carregar o histórico clínico.' 
        }
      ]);
    }
    setChatError('');
  };

  // Handle preselected triggers
  useEffect(() => {
    if (preselectedPatientId) {
      setPatientFilter(preselectedPatientId);
      // Auto pre-fill the creation modal form patient selection
      setPatientId(preselectedPatientId);
      const today = new Date().toISOString().split('T')[0];
      setSessionDate(today);
      setTitle('Sessão - Evolução Clínica Terapêutica');
      setSessionSummary('');
      setClinicalObservations('');
      setTherapeuticPlan('');
      setEvolutionFormat('standard');
      setEditingRecord(null);
      setErrorMess('');
      setIsFormOpen(true);
    }
  }, [preselectedPatientId]);

  const applySoapTemplate = () => {
    setSessionSummary(
      `[S - SUBJETIVO]\n` +
      `- Queixa Principal / Relato do Paciente:\n` +
      `- Estado mental e humor descritos pelo paciente:\n` +
      `- Eventos de relevo na semana discutidos:`
    );
    setClinicalObservations(
      `[O - OBJETIVO]\n` +
      `- Apresentação, contato visual e comportamento observados:\n` +
      `- Linguagem, orientação e afeto:\n` +
      `- Sinais corporais ou autonômicos da ansiedade/choro:\n\n` +
      `[A - AVALIAÇÃO]\n` +
      `- Técnicas aplicadas e reações / intervenção utilizada:\n` +
      `- Nível de insight e progressos rumo aos objetivos clínicos:\n` +
      `- Hipóteses ou evolução do caso no período:`
    );
    setTherapeuticPlan(
      `[P - PLANO]\n` +
      `- Próximo encontro (frequência, foco terapêutico):\n` +
      `- Atividades terapêuticas acordadas (homework / diários):\n` +
      `- Medidas de suporte adicionais ou encaminhamentos:`
    );
    setTitle('Evolução Clínica - Registro SOAP');
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setPatientId(patients.length > 0 ? patients[0].id : '');
    setSessionDate(new Date().toISOString().split('T')[0]);
    setTitle('Evolução Psicoterapêutica');
    setSessionSummary('');
    setClinicalObservations('');
    setTherapeuticPlan('');
    setEvolutionFormat('standard');
    setErrorMess('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec: MedicalRecord) => {
    setEditingRecord(rec);
    setPatientId(rec.patientId);
    setSessionDate(rec.sessionDate);
    setTitle(rec.title);
    setSessionSummary(rec.sessionSummary);
    setClinicalObservations(rec.clinicalObservations || '');
    setTherapeuticPlan(rec.therapeuticPlan || '');
    
    const isSoap = (rec.sessionSummary || '').includes('[S - ') || (rec.clinicalObservations || '').includes('[O - ');
    setEvolutionFormat(isSoap ? 'soap' : 'standard');
    
    setErrorMess('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess('');

    if (!patientId) {
      setErrorMess('Por favor, selecione o paciente.');
      return;
    }
    if (!title.trim()) {
      setErrorMess('O título do prontuário é obrigatório.');
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      setErrorMess('Paciente inválido.');
      return;
    }

    try {
      const payload = {
        psychologistId: patient.psychologistId,
        patientId,
        patientName: patient.name,
        sessionDate,
        title: title.trim(),
        sessionSummary: sessionSummary.trim(),
        clinicalObservations: clinicalObservations.trim(),
        therapeuticPlan: therapeuticPlan.trim(),
        isLocked: false,
        createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingRecord) {
        await onUpdateRecord(editingRecord.id, payload);
      } else {
        await onAddRecord(payload);
      }

      setIsFormOpen(false);
      setFocusOnRecorder(false);
      if (onClearPreselectedPatient) onClearPreselectedPatient();
    } catch (err) {
      setErrorMess('Erro ao gravar prontuário. Reveja suas permissões.');
    }
  };

  const handleDelete = (rec: MedicalRecord) => {
    setDeleteConfirmId(rec.id);
    setDeleteConfirmTitle(rec.title);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFocusOnRecorder(false);
    if (onClearPreselectedPatient) onClearPreselectedPatient();
  };

  const filteredRecords = records
    .filter(r => {
      const matchPatient = patientFilter === 'all' || r.patientId === patientFilter;
      const matchSearch = r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.sessionSummary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPatient && matchSearch;
    })
    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));

  return (
    <div className="font-sans">
      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="p-1 hover:bg-red-100/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-indigo-600" /> Registro de Prontuários Digitais
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Histórico médico confidencial e evolução do paciente com bloqueio de integridade.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                handleOpenAdd();
                setFocusOnRecorder(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-100 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Mic className="w-4 h-4 animate-pulse" />🎙️ Gravar Sessão / IA
            </button>
            <button
              onClick={handleOpenAdd}
              id="btn-new-medical-record"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4.5 h-4.5" /> Escrever Manualmente
            </button>
          </div>
        </div>

        {/* Copiloto de Sessão Feature Banner */}
        <div className="mb-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-indigo-900 text-white p-5 rounded-3xl relative overflow-hidden border border-indigo-850 shadow-xs">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
            <Mic className="w-28 h-28 text-white" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-550">
                <Sparkles className="w-3 h-3 text-indigo-400" /> NOVIDADE: COPILOTO CLÍNICO
              </span>
              <h3 className="text-base font-extrabold text-white">
                Grave Áudios da Sessão e Transcreva Clínicamente com Gemini! 🎙️
              </h3>
              <p className="text-xs text-indigo-200 leading-relaxed font-semibold">
                Esqueça os relatórios manuais demorados. Agora você pode gravar a sessão diretamente do microfone ou colar anotações de voz rápidas. A inteligência artificial NexPsi transcreve, sintetiza e organiza o prontuário estruturado (Subjetivo, Objetivo, Avaliação e Plano) automaticamente!
              </p>
            </div>
            <button
              onClick={() => {
                handleOpenAdd();
                setFocusOnRecorder(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white font-black text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start md:self-auto border border-emerald-500 hover:scale-[1.02]"
            >
              <Mic className="w-4 h-4 text-white animate-pulse" />
              Testar Gravação Grátis
            </button>
          </div>
        </div>

        {/* Searching & Filter directory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Buscar histórico clínico por palavras chave no prontuário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-slate-700 placeholder-slate-400"
            />
          </div>

          <div>
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white text-xs font-semibold text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Filtro: Todos os Pacientes</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2-Column Desktop layout: List of Records + Contextual AI Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Record History List (takes 2 of 3 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-white">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium text-sm">Nenhum registro clínico localizado.</p>
                <p className="text-slate-400 text-xs mt-0.5">Inicie uma nova evolução terapêutica para guardar observações seguras.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecords.map((rec) => {
                  const formattedDate = rec.sessionDate.split('-').reverse().join('/');
                  return (
                    <motion.div
                      key={rec.id}
                      layout
                      className="p-5 rounded-2xl border flex flex-col justify-between transition-all bg-white border-slate-200 shadow-sm hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {rec.patientName}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-800 text-base mt-1 line-clamp-1">
                          {rec.title}
                        </h3>

                        <p className="text-xs font-semibold text-slate-500 mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Sessão em: {formattedDate}
                        </p>

                        {/* text excerpts */}
                        <div className="mt-3 space-y-1.5 border-l-2 border-slate-100 pl-2.5">
                          <p className="text-xs text-slate-600 line-clamp-2">
                            <strong className="text-slate-700">Resumo:</strong> {rec.sessionSummary || 'Nenhum resumo.'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => setViewingRecord(rec)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 hover:underline"
                        >
                          <Eye className="w-4 h-4" /> Ler Prontuário Completo
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            title="Editar evolução"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec)}
                            title="Excluir prontuário"
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2: AI Clinical Assistant (takes 1 of 3 columns) */}
          <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-3xl p-5 sticky top-6 shadow-xs flex flex-col max-h-[640px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1">
                    Assistente IA de Prontuário
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">Suporte e Análise Contextual</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearHistory}
                title="Limpar histórico"
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Focus Information Banner */}
            <div className="my-3 py-1.5 px-3 bg-white border border-slate-150 rounded-xl flex items-center justify-between shrink-0">
              <span className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1 truncate max-w-[70%]">
                <span className={`w-2 h-2 rounded-full shrink-0 ${patientFilter === 'all' ? 'bg-slate-350' : 'bg-emerald-500'}`}></span>
                Foco: {patientFilter === 'all' ? "Nenhum selecionado" : activePatientForAi?.name}
              </span>
              {patientFilter !== 'all' && (
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 shrink-0">
                  {activeRecordsForAi.length} evolução(ões)
                </span>
              )}
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 text-xs font-semibold max-h-[300px]">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[92%] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm font-semibold' 
                      : 'bg-white text-slate-700 border border-slate-150 rounded-tl-none shadow-2xs font-normal'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-indigo-600 p-2 bg-indigo-50/40 rounded-xl w-max border border-indigo-50 animate-pulse">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[11px] font-bold">Analisando dados do prontuário...</span>
                </div>
              )}
              {chatError && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-700 rounded-xl text-[11px] font-bold">
                  {chatError}
                </div>
              )}
            </div>

            {/* Presets and Guidance suggestions */}
            {patientFilter !== 'all' && chatMessages.length <= 1 && (
              <div className="space-y-1.5 pt-3 border-t border-slate-200 shrink-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Análises Sugeridas:</p>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("Faça uma síntese profissional e estruturada do histórico de evoluções deste paciente.")}
                    className="p-2 text-left bg-white hover:bg-slate-100 border border-slate-150 rounded-xl text-[11px] text-slate-600 font-bold transition-all truncate cursor-pointer hover:border-indigo-200 hover:text-indigo-700"
                  >
                    📝 Resumir prontuário do paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("Com base nos registros clínicos, indique tendências ou mudanças observadas no humor e no nível de sofrimento do paciente.")}
                    className="p-2 text-left bg-white hover:bg-slate-100 border border-slate-150 rounded-xl text-[11px] text-slate-600 font-bold transition-all truncate cursor-pointer hover:border-indigo-200 hover:text-indigo-700"
                  >
                    📈 Detectar evolução de humor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("Sugira técnicas psicoterápicas e planos de intervenção baseados nas queixas e históricos anotados.")}
                    className="p-2 text-left bg-white hover:bg-slate-100 border border-slate-150 rounded-xl text-[11px] text-slate-600 font-bold transition-all truncate cursor-pointer hover:border-indigo-200 hover:text-indigo-700"
                  >
                    🎯 Sugerir técnicas/objetivos
                  </button>
                </div>
              </div>
            )}

            {/* Form Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }} 
              className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-1.5 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={patientFilter === 'all' || isChatLoading}
                placeholder={patientFilter === 'all' ? "Selecione o paciente para falar..." : "Pergunte algo sobre este paciente..."}
                className="flex-1 px-3 py-2.5 border border-slate-250 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-xs text-slate-700 placeholder-slate-400 disabled:bg-slate-100/50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading || patientFilter === 'all'}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors flex items-center justify-center cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* VIEW DIALOG MODAL (READ ONLY DETAIL COVERS COGNITIVE SEPARATION) */}
      <AnimatePresence>
        {viewingRecord && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              layoutId={`record-modal-${viewingRecord.id}`}
              className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 pb-2"
            >
              <div className="p-6 bg-slate-900 text-white relative">
                <button 
                  onClick={() => setViewingRecord(null)}
                  className="absolute right-4 top-4 hover:bg-slate-800 p-2 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  {viewingRecord.patientName} • PRONTUÁRIO CLÍNICO INDIVIDUALE
                </span>
                <h3 className="text-xl font-extrabold mt-1">{viewingRecord.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Sessão realizada dia: {viewingRecord.sessionDate.split('-').reverse().join('/')}
                </p>
              </div>

              {/* Secure stamp certified view */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wilder mb-2 flex items-center gap-1.5">
                      <ScrollText className="w-4 h-4 text-indigo-600" /> 1. SÍNTESE SUBJETIVA (Queixas e Estado do Paciente)
                    </h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {viewingRecord.sessionSummary || "Não registrado."}
                    </p>
                  </div>

                  {/* Observations */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wilder mb-2 flex items-center gap-1.5">
                      <ScrollText className="w-4 h-4 text-indigo-600" /> 2. OBSERVAÇÕES E ANÁLISE CLÍNICA (Técnica / Exame de Estado Mental)
                    </h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {viewingRecord.clinicalObservations || "Não registrado."}
                    </p>
                  </div>

                  {/* Therapeutic Plan */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wilder mb-2 flex items-center gap-1.5">
                      <ScrollText className="w-4 h-4 text-indigo-600" /> 3. DIRETRIZES E PLANO TERAPÊUTICO (Tarefas de casa / Metas)
                    </h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {viewingRecord.therapeuticPlan || "Não registrado."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-between gap-3 items-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono">
                  REF_DOC: {viewingRecord.id}
                </span>

                <div className="flex gap-2">

                  <button
                    onClick={() => setViewingRecord(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-150 text-slate-700 rounded-xl text-xs font-bold transition-colors bg-white"
                  >
                    Fechar Visualização
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RECORD WRITER FORM DIALOG POP-OVER */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 bg-indigo-600 text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-bold">
                    {editingRecord ? 'Editar Evolução Clínica' : 'Redigir Prontuário de Evolução'}
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    Preencha os dados em estrita observância ética e sigilo terapêutico.
                  </p>
                </div>
                <button 
                  onClick={handleCloseForm}
                  className="rounded-lg p-1.5 text-indigo-100 hover:text-white hover:bg-indigo-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  {errorMess && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex gap-2 items-center">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">{errorMess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Paciente Associado *
                      </label>
                      <select
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        disabled={!!editingRecord}
                        className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800 disabled:opacity-60"
                      >
                        <option value="">-- Selecione o Paciente --</option>
                        {patients.filter(p => p.status === 'active').map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Data da Consulta / Evolução *
                      </label>
                      <input
                        type="date"
                        required
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Título do Registro Clínico *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="ex: Sessão 6 - Manejo de crises de pânico sob TCC"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    />
                  </div>

                  <div className="space-y-4">
                    {/* Format Selector */}
                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-indigo-850 tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-505 animate-pulse" />
                          Modelos de Prontuário / Evolução
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">Estrutura de registro clínico</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEvolutionFormat('standard');
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            evolutionFormat === 'standard'
                              ? 'bg-white border-indigo-200 text-indigo-700 shadow-xs'
                              : 'bg-transparent border-slate-200 text-slate-500 hover:text-slate-705'
                          }`}
                        >
                          Evolução Livre / Padrão
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEvolutionFormat('soap');
                            // If fields are empty, let's pre-populate them with the SOAP template!
                            if (!sessionSummary && !clinicalObservations && !therapeuticPlan) {
                              applySoapTemplate();
                            }
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            evolutionFormat === 'soap'
                              ? 'bg-white border-indigo-200 text-indigo-700 shadow-xs'
                              : 'bg-transparent border-slate-200 text-slate-500 hover:text-slate-705'
                          }`}
                        >
                          📋 Modelo de Ficha SOAP
                        </button>
                      </div>

                      {evolutionFormat === 'soap' && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1.5">
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">
                            O registro <b>SOAP</b> organiza a evolução médica/psicológica em: <b>Subjetivo</b>, <b>Objetivo</b>, <b>Avaliação</b> e <b>Plano</b>.
                          </p>
                          <button
                            type="button"
                            onClick={applySoapTemplate}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9.5px] font-extrabold shrink-0 border border-indigo-100 transition-colors cursor-pointer"
                          >
                            Reiniciar Modelo
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Copiloto de Sessão: Gravador de Sessão e Transcrição com IA */}
                    <div className={`transition-all duration-500 p-5 rounded-2xl space-y-3 shadow-2xs ${
                      focusOnRecorder 
                        ? 'bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50 border-2 border-indigo-600 ring-4 ring-indigo-200 ring-offset-2 scale-[1.01]' 
                        : 'bg-gradient-to-br from-indigo-50 to-indigo-55/40 border border-indigo-150'
                    }`}>
                      {focusOnRecorder && (
                        <div className="bg-indigo-600 text-white text-[10.5px] font-black py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-sm animate-bounce w-max uppercase tracking-wider mb-2">
                          <Sparkles className="w-4.5 h-4.5 text-indigo-200" />
                          Excelente! Comece gravando seu relato abaixo ou use as simulações!
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Mic className="w-4 h-4 text-indigo-650 animate-pulse" />
                          <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1">
                            Gravador de Sessão com Transcrição IA
                          </h4>
                        </div>
                        <span className="text-[9px] text-indigo-650 font-black bg-indigo-100/60 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-wide">
                          Copiloto Gemini
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-550 font-semibold leading-relaxed">
                        Grave áudios rápidos de atendimentos ou resuma anotações para que a inteligência artificial organize instantaneamente as evoluções clínicas estruturadas (preenchendo os campos abaixo de forma automática).
                      </p>

                      {/* Exibir erro de transcrição se houver */}
                      {transcriptionError && (
                        <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-bold leading-relaxed flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p>{transcriptionError}</p>
                          </div>
                        </div>
                      )}

                      {/* Área de Captura */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-slate-150 rounded-xl">
                        {/* Status/Duração */}
                        <div className="flex items-center gap-2.5 flex-1 w-full justify-center sm:justify-start">
                          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : recordedAudioUrl ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          
                          {isRecording ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-red-600 font-mono tracking-wider">
                                GRAVANDO SESSÃO: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                              </span>
                              <Activity className="w-4 h-4 text-red-500 animate-bounce shrink-0" />
                            </div>
                          ) : recordedAudioUrl ? (
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-emerald-600">Áudio Gravado com Sucesso!</span>
                              <audio src={recordedAudioUrl} controls className="h-7 w-48 mt-1 scale-95 origin-left" />
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">Pronto para capturar áudio...</span>
                          )}
                        </div>

                        {/* Controles de Gravação de Áudio Real */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-center">
                          {!isRecording && !recordedAudioUrl ? (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Mic className="w-3.5 h-3.5" /> Gravar Microfone
                            </button>
                          ) : isRecording ? (
                            <>
                              <button
                                type="button"
                                onClick={stopAndTranscribe}
                                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" /> Concluir e Transcrever
                              </button>
                              <button
                                type="button"
                                onClick={stopRecording}
                                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Square className="w-3.5 h-3.5" /> Apenas Parar
                              </button>
                              <button
                                type="button"
                                onClick={cancelRecording}
                                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleTranscribeAudio()}
                                disabled={isTranscribing || !audioBlob}
                                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-450 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                {isTranscribing ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Transcrevendo com IA...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5 font-bold" /> Transcrever Áudio
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={cancelRecording}
                                disabled={isTranscribing}
                                className="px-1.5 py-2 text-slate-400 hover:text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Limpar
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Caixa de Entrada Clínico Alternativa / Simulações */}
                      <div className="pt-2 border-t border-indigo-150/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setShowSimulatedOptions(!showSimulatedOptions)}
                            className="text-[10px] font-black uppercase text-indigo-850 tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                            {showSimulatedOptions ? "Ocultar Simulações de Consulta" : "Mostrar Simulações de Áudio/Relato"}
                          </button>
                          <span className="text-[9px] text-slate-400 font-bold">Alternativa de Teste Rápido</span>
                        </div>

                        {showSimulatedOptions && (
                          <div className="space-y-2 bg-white/50 border border-slate-150 p-2.5 rounded-xl">
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                              Selecione um caso clínico simulado de áudio abaixo para conferir instantaneamente como a inteligência artificial ouve e estrutura o prontuário:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                disabled={isTranscribing}
                                onClick={() => handleTranscribeAudio(
                                  "Silvano relata que teve duas crises de pânico fortes no trabalho essa semana devido à sobrecarga. Sentiu palpitações severas, sudorese e pensou que iria desmaiar na frente dos colegas. Ele evitou ir ao refeitório de novo por receio de sofrer outra crise. Usei técnicas de respiração diafragmática rápida com ele e acordamos que ele tentará expor-se gradualmente ao refeitório por 5 minutos esta semana."
                                )}
                                className="p-2 text-left bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-xl text-[10.5px] leading-snug font-bold text-slate-650 transition-all cursor-pointer flex flex-col justify-between"
                              >
                                <span className="text-indigo-650 font-black mb-0.5 block flex items-center gap-1">🚨 Crise de Pânico</span>
                                <span className="line-clamp-2 text-[9px] font-medium text-slate-450 leading-normal">Silvano relata crises de pânico sob sobrecarga de trabalho.</span>
                              </button>

                              <button
                                type="button"
                                disabled={isTranscribing}
                                onClick={() => handleTranscribeAudio(
                                  "Juliana relata exaustão extrema com a dupla jornada após retorno da licença maternidade. Expressa sentimentos intensos de culpa e inadequação como mãe e profissional, chorando bastante ao falar da falta de apoio de sua família imediata. Analisamos os pensamentos automáticos de 'tenho que dar conta de tudo sozinho' usando reestruturação cognitiva. Ficamos de estabelecer uma conversa assertiva com o marido e lista de divisões."
                                )}
                                className="p-2 text-left bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-xl text-[10.5px] leading-snug font-bold text-slate-650 transition-all cursor-pointer flex flex-col justify-between"
                              >
                                <span className="text-indigo-650 font-black mb-0.5 block flex items-center gap-1">👶 Exaustão Materna</span>
                                <span className="line-clamp-2 text-[9px] font-medium text-slate-450 leading-normal">Juliana expressa sentimentos intensos de cansaço extremo e culpa.</span>
                              </button>

                              <button
                                type="button"
                                disabled={isTranscribing}
                                onClick={() => handleTranscribeAudio(
                                  "Gustavo discute sua insatisfação crônica com o setor corporativo atual e o medo incapacitante de largar a estabilidade financeira para mudar de carreira. Sente-se preso e angustiado. Mapeamos seus valores fundamentais e identificamos as barreiras de ansiedade. Traçamos um homework para ele listar 3 opções de cursos e entrevistar 1 profissional da área de interesse esta semana."
                                )}
                                className="p-2 text-left bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-xl text-[10.5px] leading-snug font-bold text-slate-650 transition-all cursor-pointer flex flex-col justify-between"
                              >
                                <span className="text-indigo-650 font-black mb-0.5 block flex items-center gap-1">💼 Carreira & Medo</span>
                                <span className="line-clamp-2 text-[9px] font-medium text-slate-450 leading-normal">Gustavo discute insatisfação com o setor corporativo e insegurança.</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        1. Síntese Subjetiva (Relato do Paciente, queixas, humor)
                      </label>
                      <textarea
                        rows={2}
                        value={sessionSummary}
                        onChange={(e) => setSessionSummary(e.target.value)}
                        placeholder="Paciente reporta que conseguiu aplicar o controle de pânico no trabalho, relatando sentimentos de..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        2. Observações e Análise Clínicas (Exame de Estado Mental, técnicas aplicadas)
                      </label>
                      <textarea
                        rows={2}
                        value={clinicalObservations}
                        onChange={(e) => setClinicalObservations(e.target.value)}
                        placeholder="Redução na ansiedade situacional. Aplicada técnica cognitiva socrática. Identificados pensamentos automáticos de inadequação..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        3. Plano e Intervenções Terapêuticas (Metas, homework)
                      </label>
                      <textarea
                        rows={2}
                        value={therapeuticPlan}
                        onChange={(e) => setTherapeuticPlan(e.target.value)}
                        placeholder="Leitura de biblioterapia e monitoramento semanal até o próximo encontro..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700"
                      ></textarea>
                    </div>
                  </div>


                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-save-record"
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-semibold transition-colors shadow-sm"
                  >
                    Salvar Prontuário
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE RECORD CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 p-6"
            >
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Remover Prontuário</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Tem certeza que deseja remover o prontuário <strong className="text-slate-800">"{deleteConfirmTitle}"</strong>? Esta alteração é irreversível e confidencial.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmId(null); setDeleteConfirmTitle(''); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = deleteConfirmId;
                    setDeleteConfirmId(null);
                    setDeleteConfirmTitle('');
                    try {
                      setActionError(null);
                      await onDeleteRecord(id);
                    } catch (err) {
                      setActionError('Não foi possível remover o prontuário clínico.');
                    }
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Confirmar Remoção
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
