import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, 
  User, ShieldCheck, MapPin, Video, Send, Check, Heart, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Psychologist, Patient } from '../types';
import { getAppointmentById, getAppointmentsByPatient, updateAppointment, getPsychologistProfile } from '../dbService';

interface PatientPortalViewProps {
  appId: string;
}

export default function PatientPortalView({ appId }: PatientPortalViewProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [therapist, setTherapist] = useState<Psychologist | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive flow states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<'confirmed' | 'reschedule' | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [showRescheduleForm, setShowRescheduleForm] = useState<boolean>(false);

  useEffect(() => {
    async function loadPortalData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch current appointment
        const appt = await getAppointmentById(appId);
        if (!appt) {
          setError("Consulta não localizada. Verifique o link ou entre em contato com seu psicólogo(a).");
          setLoading(false);
          return;
        }
        setAppointment(appt);

        // 2. Fetch psychologist/therapist profile
        if (appt.psychologistId) {
          const profileData = await getPsychologistProfile(appt.psychologistId);
          setTherapist(profileData);
        }

        // 3. Fetch other appointments for the same patient to build the personal agenda
        if (appt.patientId) {
          const patientAppts = await getAppointmentsByPatient(appt.patientId);
          // Sort by date & time
          const sorted = patientAppts.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
          setAllAppointments(sorted);
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados do portal:", err);
        setError("Ocorreu um erro ao carregar as informações da sua consulta.");
      } finally {
        setLoading(false);
      }
    }

    if (appId) {
      loadPortalData();
    }
  }, [appId]);

  // Handle click on confirmation
  const handleConfirm = async () => {
    if (!appointment) return;
    setSubmitting(true);
    try {
      await updateAppointment(appointment.id, {
        patientConfirmed: true,
        patientComments: 'Presença confirmada pelo paciente no portal.'
      });
      
      // Update local state
      setAppointment(prev => prev ? { ...prev, patientConfirmed: true, patientComments: 'Presença confirmada pelo paciente no portal.' } : null);
      setActionSuccess('confirmed');
      
      // Update list of all appointments as well
      setAllAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, patientConfirmed: true } : a));
    } catch (err) {
      console.error(err);
      alert("Houve um erro ao registrar sua confirmação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle click on reschedule / can't attend
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !commentText.trim()) return;
    setSubmitting(true);
    try {
      await updateAppointment(appointment.id, {
        patientConfirmed: false,
        patientComments: `Paciente solicitou remarcação: "${commentText}"`,
        // We can optionally keep status as scheduled or cancelled, let's keep scheduled but flagged
      });

      setAppointment(prev => prev ? { 
        ...prev, 
        patientConfirmed: false, 
        patientComments: `Paciente solicitou remarcação: "${commentText}"` 
      } : null);
      
      setActionSuccess('reschedule');
      setShowRescheduleForm(false);
      
      // Update list of all appointments
      setAllAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, patientConfirmed: false, patientComments: `Paciente solicitou remarcação: "${commentText}"` } : a));
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const getDayOfWeek = (dateStr: string): string => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return days[date.getDay()];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-bold text-slate-600">Carregando detalhes da sua sessão...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-800">Ops! Algo deu errado</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error || "Link inválido ou expirado."}</p>
        </div>
      </div>
    );
  }

  const formattedDate = appointment.date.split('-').reverse().join('/');
  const weekday = getDayOfWeek(appointment.date);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none pb-12" id="patient-portal-container">
      
      {/* Top clean navigation banner */}
      <header className="bg-white border-b border-slate-100 py-4 shadow-xs sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Portal do Paciente</span>
              <h1 className="text-sm font-black text-slate-800">Confirmação de Consulta</h1>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
            Ambiente Seguro
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 w-full space-y-6">
        
        {/* Therapist Branding Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-base">
                {therapist?.name.charAt(0) || 'P'}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800">{therapist?.name || 'Psicólogo(a) Clínico'}</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{therapist?.crp || 'CRP Ativo'}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xl">
              {therapist?.specialties || 'Psicoterapia humanizada e especializada em saúde mental.'}
            </p>
          </div>
          <div className="shrink-0 bg-emerald-50 p-3 rounded-2xl border border-emerald-100/50 text-center">
            <span className="text-[10px] text-emerald-800 font-black uppercase block tracking-wider">Contato Profissional</span>
            <span className="text-xs font-bold text-emerald-700 font-mono block mt-1">{therapist?.email || 'santosflaviabarros@gmail.com'}</span>
          </div>
        </div>

        {/* Main interactive session card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-lg overflow-hidden border-t-4 border-indigo-600">
          
          <div className="p-6 md:p-8 space-y-6">
            
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Sua Próxima Sessão Agendada
              </span>
              <h2 className="text-xl font-black text-slate-800 mt-2">Olá, {appointment.patientName}!</h2>
              <p className="text-xs text-slate-500">Por favor, confirme se você poderá comparecer ao horário reservado para você:</p>
            </div>

            {/* Session Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-xs shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Data</span>
                  <span className="text-xs font-black text-slate-800">{formattedDate}</span>
                  <span className="text-[10px] text-slate-500 block">({weekday})</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-xs shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Horário</span>
                  <span className="text-xs font-black text-slate-800">{appointment.time}</span>
                  <span className="text-[10px] text-slate-500 block">Duração: {appointment.duration} min</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-xs shrink-0">
                  {appointment.type === 'online' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Modalidade</span>
                  <span className="text-xs font-black text-slate-800">
                    {appointment.type === 'online' ? 'Online (Google Meet)' : 'Presencial no Consultório'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {appointment.type === 'online' ? 'Link enviado por e-mail/WhatsApp' : 'Consulte o endereço cadastrado'}
                  </span>
                </div>
              </div>

            </div>

            {/* Current Status Feedback */}
            {appointment.patientConfirmed === true ? (
              <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-emerald-900">Presença Confirmada com Sucesso!</h4>
                  <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5">
                    Sua psicóloga já foi notificada da sua confirmação. Nos vemos no dia da sua sessão! Caso precise cancelar depois, entre em contato diretamente.
                  </p>
                </div>
              </div>
            ) : appointment.patientConfirmed === false ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-amber-900">Você informou que não poderá comparecer</h4>
                  <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5">
                    Sua mensagem de reagendamento foi registrada com sucesso. O consultório entrará em contato para te oferecer novos horários disponíveis.
                  </p>
                  {appointment.patientComments && (
                    <p className="text-[10px] bg-white p-2 rounded-lg border border-amber-100 text-slate-500 mt-2 font-medium italic">
                      Sua mensagem: "{appointment.patientComments.replace('Paciente solicitou remarcação: "', '').replace('"', '')}"
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Actions block */}
            {appointment.patientConfirmed === undefined && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-black text-xs py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Sim, Confirmar Minha Presença</span>
                </button>

                <button
                  onClick={() => setShowRescheduleForm(true)}
                  disabled={submitting}
                  className="flex-1 bg-white hover:bg-slate-50 disabled:bg-slate-300 text-rose-600 border border-slate-200 font-black text-xs py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Não posso / Preciso Reagendar</span>
                </button>

              </div>
            )}

            {/* Reschedule comment text form */}
            <AnimatePresence>
              {showRescheduleForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleRescheduleSubmit}
                  className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-150 overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Mensagem para seu terapeuta</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-white focus:ring-2 focus:ring-indigo-150 leading-relaxed font-medium"
                      placeholder="Ex: Não vou conseguir ir nesse horário porque tenho médico. Conseguimos mudar para quarta à tarde?"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRescheduleForm(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Enviar Justificativa</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* Patient Personal Calendar (ONLY showing their marked sessions) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Sua Agenda Completa de Sessões
            </h3>
            <p className="text-xs text-slate-500">
              Veja abaixo todos os seus atendimentos agendados, realizados ou em aberto com este profissional.
            </p>
          </div>

          <div className="space-y-2.5">
            {allAppointments.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-bold">
                Nenhum outro horário localizado na sua agenda.
              </div>
            ) : (
              allAppointments.map(appt => {
                const isCurrent = appt.id === appointment.id;
                const dateParts = appt.date.split('-').reverse().join('/');
                const wday = getDayOfWeek(appt.date);
                
                return (
                  <div 
                    key={appt.id} 
                    className={`p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all border ${
                      isCurrent 
                        ? 'bg-indigo-50/50 border-indigo-200 shadow-xs' 
                        : 'bg-slate-50 border-slate-100/70 hover:bg-slate-100/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-slate-800">
                          {dateParts} às {appt.time} <span className="text-[10px] text-slate-400 font-bold">({appt.duration} min)</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {wday} • {appt.type === 'online' ? 'Online via Meet' : 'Atendimento Presencial'}
                          {isCurrent && <span className="ml-1.5 bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">Esta Sessão</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {appt.status === 'canceled' ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] px-2.5 py-0.5 rounded-full font-black">
                          Cancelado
                        </span>
                      ) : appt.status === 'completed' ? (
                        <span className="bg-slate-200 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-black">
                          Realizado
                        </span>
                      ) : appt.patientConfirmed === true ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Confirmado
                        </span>
                      ) : appt.patientConfirmed === false ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-black">
                          A remarcar
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                          Agendado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Confidentiality Footer disclosure block */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-[10px] text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
            🌸 Este portal é privado, criptografado e em total conformidade com a LGPD e o Código de Ética Profissional do Psicólogo (CFP). Suas informações são estritamente confidenciais.
          </p>
          <div className="flex items-center justify-center gap-1 text-[9px] text-indigo-500/75 font-bold">
            <Heart className="w-3 h-3 fill-indigo-500/10" />
            <span>NexPsi • Cuidado e Eficiência na Saúde Mental</span>
          </div>
        </div>

      </main>

    </div>
  );
}
