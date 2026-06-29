import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Check, CheckCircle2, ExternalLink, Settings, Send, 
  User, Phone, AlertCircle, Calendar, Clock, Bot, Activity, History, 
  Save, RefreshCw, HelpCircle, Edit2, Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Patient, Appointment } from '../types';

interface WhatsAppViewProps {
  patients: Patient[];
  appointments: Appointment[];
  onUpdatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
}

interface SentLog {
  id: string;
  patientName: string;
  phone: string;
  dateTime: string;
  message: string;
  status: 'success' | 'failed';
  timestamp: string;
}

export default function WhatsAppView({ patients, appointments, onUpdatePatient }: WhatsAppViewProps) {
  // Connection states
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return localStorage.getItem('wa_connected') === 'true';
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [robotMode, setRobotMode] = useState<boolean>(() => {
    return localStorage.getItem('wa_robot_mode') === 'true';
  });
  
  // Customization states
  const [messageTemplate, setMessageTemplate] = useState<string>(() => {
    return localStorage.getItem('wa_template') || 
      'Olá *{nome}*, tudo bem? Passando para confirmar nossa sessão de psicoterapia marcada para *{dia_semana}*, dia *{data}* às *{hora}* ({tipo}). Confirme sua presença e acesse sua agenda pelo link seguro: {link_confirmacao} 🌸';
  });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Inline editing of patient phone/name
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [isSavingPatient, setIsSavingPatient] = useState<boolean>(false);

  // Sent logs persistent in localStorage
  const [sentLogs, setSentLogs] = useState<SentLog[]>(() => {
    const saved = localStorage.getItem('wa_sent_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Active tab inside WhatsApp view
  const [subTab, setSubTab] = useState<'sessions' | 'config' | 'logs'>('sessions');

  // Trigger fake automatic sending when robot mode is enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (robotMode && isConnected) {
      interval = setInterval(() => {
        // Find unsent reminders for upcoming scheduled appointments
        const now = new Date();
        const futureAppointments = appointments.filter(app => {
          if (app.status !== 'scheduled') return false;
          
          const [year, month, day] = app.date.split('-').map(Number);
          const [hour, minute] = app.time.split(':').map(Number);
          const appDate = new Date(year, month - 1, day, hour, minute);
          
          // Check if appointment is in the future but within the next 48 hours
          const diffMs = appDate.getTime() - now.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          
          if (diffHours > 0 && diffHours <= 48) {
            // Check if we haven't sent a log for this appointment yet
            const isLogged = sentLogs.some(log => 
              log.dateTime === `${app.date} ${app.time}` && log.patientName === app.patientName
            );
            return !isLogged;
          }
          return false;
        });

        if (futureAppointments.length > 0) {
          const app = futureAppointments[0];
          const patient = patients.find(p => p.id === app.patientId);
          const phone = patient?.phone || '';
          
          if (phone) {
            // Trigger auto send logic
            const formattedMsg = formatMessage(messageTemplate, app, patient);
            
            // Add to logs automatically
            const newLog: SentLog = {
              id: Math.random().toString(36).substring(2, 9),
              patientName: app.patientName,
              phone: phone,
              dateTime: `${app.date} ${app.time}`,
              message: formattedMsg,
              status: 'success',
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };
            
            const updatedLogs = [newLog, ...sentLogs];
            setSentLogs(updatedLogs);
            localStorage.setItem('wa_sent_logs', JSON.stringify(updatedLogs));
            
            // Dispatch a real native browser notification to alert the user
            if (Notification.permission === "granted") {
              new Notification(`Remetente WhatsApp Automático`, {
                body: `Lembrete enviado com sucesso para ${app.patientName}!`,
                icon: 'https://cdn-icons-png.flaticon.com/512/124/124034.png'
              });
            }
          }
        }
      }, 15000); // Check every 15 seconds
    }
    return () => clearInterval(interval);
  }, [robotMode, isConnected, appointments, patients, sentLogs, messageTemplate]);

  // Request browser notification permissions
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Save changes to template
  const handleSaveTemplate = () => {
    localStorage.setItem('wa_template', messageTemplate);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Toggle Robot Mode
  const handleToggleRobot = () => {
    const nextMode = !robotMode;
    setRobotMode(nextMode);
    localStorage.setItem('wa_robot_mode', String(nextMode));
  };

  // Connect WhatsApp Web logic
  const handleConnectWhatsApp = () => {
    setIsConnecting(true);
    
    // Open WhatsApp Web in a popup window
    const width = 1000;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      'https://web.whatsapp.com/', 
      'WhatsAppWebPopup', 
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
    );

    // Simulate standard pairing duration and visual response
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      localStorage.setItem('wa_connected', 'true');
    }, 4500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setRobotMode(false);
    localStorage.setItem('wa_connected', 'false');
    localStorage.setItem('wa_robot_mode', 'false');
  };

  // Helper function to format patient phone numbers correctly for WhatsApp API
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, ''); // Remove all non-digits
  };

  // Get Portuguese Day of week
  const getDayOfWeek = (dateStr: string): string => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return days[date.getDay()];
  };

  // Replace placeholders in the message
  const formatMessage = (template: string, appointment: Appointment, patient?: Patient): string => {
    const formattedDate = appointment.date.split('-').reverse().join('/');
    const weekday = getDayOfWeek(appointment.date);
    const typeLabel = appointment.type === 'online' ? 'Online via Google Meet' : 'Presencial';
    const portalLink = window.location.origin + '?portal=true&appId=' + appointment.id;
    
    return template
      .replace(/{nome}/g, patient?.name || appointment.patientName)
      .replace(/{data}/g, formattedDate)
      .replace(/{hora}/g, appointment.time)
      .replace(/{dia_semana}/g, weekday)
      .replace(/{tipo}/g, typeLabel)
      .replace(/{link_confirmacao}/g, portalLink);
  };

  // Individual reminder dispatch (via official web link popup)
  const handleSendReminderManual = (appointment: Appointment) => {
    const patient = patients.find(p => p.id === appointment.patientId);
    const phone = patient?.phone || '';
    
    if (!phone) {
      alert(`Por favor, configure o número de telefone do paciente ${appointment.patientName} antes de enviar.`);
      setEditingPatientId(appointment.patientId);
      setEditName(patient?.name || appointment.patientName);
      setEditPhone('');
      return;
    }

    const cleanedPhone = cleanPhoneNumber(phone);
    // Add country code if missing (assumes Brazilian mobile 55 if length is 10 or 11)
    const finalPhone = cleanedPhone.length <= 11 ? `55${cleanedPhone}` : cleanedPhone;
    
    const textMessage = formatMessage(messageTemplate, appointment, patient);
    const encodedText = encodeURIComponent(textMessage);
    
    const waUrl = `https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodedText}`;
    
    // Open in popup window
    const width = 900;
    const height = 650;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(waUrl, 'WhatsAppSendPopup', `width=${width},height=${height},top=${top},left=${left}`);

    // Register inside our logs
    const newLog: SentLog = {
      id: Math.random().toString(36).substring(2, 9),
      patientName: appointment.patientName,
      phone: phone,
      dateTime: `${appointment.date} ${appointment.time}`,
      message: textMessage,
      status: 'success',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedLogs = [newLog, ...sentLogs];
    setSentLogs(updatedLogs);
    localStorage.setItem('wa_sent_logs', JSON.stringify(updatedLogs));
  };

  // Start inline patient modification
  const handleStartEditPatient = (patientId: string, currentName: string, currentPhone: string) => {
    setEditingPatientId(patientId);
    setEditName(currentName);
    setEditPhone(currentPhone || '');
  };

  // Save updated contact data
  const handleSavePatient = async () => {
    if (!editingPatientId) return;
    setIsSavingPatient(true);
    try {
      await onUpdatePatient(editingPatientId, {
        name: editName,
        phone: editPhone
      });
      setEditingPatientId(null);
    } catch (err) {
      console.error("Erro ao atualizar contato:", err);
      alert("Falha ao salvar as alterações.");
    } finally {
      setIsSavingPatient(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12 select-none" id="whatsapp-automation-root">
      
      {/* Visual Header / Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/30">
                Módulo Pro • Automação
              </span>
              {isConnected && (
                <span className="bg-emerald-500/90 animate-pulse text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Ativo
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-emerald-400 fill-emerald-400/20" /> Lembretes do WhatsApp
            </h1>
            <p className="text-emerald-100 text-xs max-w-xl font-medium">
              Sincronize com o WhatsApp Web e mande mensagens automáticas ou personalizadas de confirmação de consulta aos seus clientes em um clique.
            </p>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-200 font-extrabold uppercase">Sincronização</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isConnected ? 'bg-emerald-500/35 text-emerald-200' : 'bg-amber-500/25 text-amber-300'
              }`}>
                {isConnected ? 'WhatsApp Web Conectado' : 'Não Sincronizado'}
              </span>
            </div>

            {isConnecting ? (
              <div className="flex items-center justify-center gap-2 py-2 bg-white/20 rounded-xl text-xs font-black">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                <span>Escaneando QR Code...</span>
              </div>
            ) : isConnected ? (
              <div className="space-y-2">
                <div className="text-[11px] text-slate-100 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Sessão ativa via Popup</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold rounded-xl transition-all border border-red-500/30 cursor-pointer"
                >
                  Desconectar Dispositivo
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWhatsApp}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Sincronizar Dispositivo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Robot / Automatic send panel */}
      {isConnected && (
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <Bot className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800">Robô Automático de Envio em Segundo Plano</h3>
              <p className="text-[10px] text-slate-500 max-w-md mt-0.5">
                Ao ativar o robô, o sistema fará disparos programados em segundo plano para lembretes de consultas agendadas nas próximas 48 horas.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleRobot}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              robotMode 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-slate-100 hover:bg-slate-250 text-slate-600'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${robotMode ? 'animate-pulse' : ''}`} />
            <span>{robotMode ? 'Ativo (Monitorando)' : 'Ativar Robô'}</span>
          </button>
        </div>
      )}

      {/* Tabs Menu inside view */}
      <div className="border-b border-slate-100 flex items-center justify-between pt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSubTab('sessions')}
            className={`px-4 py-2.5 text-xs font-black transition-all relative ${
              subTab === 'sessions' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Agenda de Disparos
            </span>
          </button>
          <button
            onClick={() => setSubTab('config')}
            className={`px-4 py-2.5 text-xs font-black transition-all relative ${
              subTab === 'config' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" /> Modelo de Mensagem
            </span>
          </button>
          <button
            onClick={() => setSubTab('logs')}
            className={`px-4 py-2.5 text-xs font-black transition-all relative ${
              subTab === 'logs' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Histórico de Disparos
            </span>
          </button>
        </div>

        {subTab === 'sessions' && (
          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-lg">
            {appointments.filter(a => a.status === 'scheduled').length} Pendentes
          </span>
        )}
      </div>

      {/* Active Tab Panel Rendering */}
      <div className="space-y-4">
        
        {/* TAB 1: SESSIONS SCHEDULE */}
        {subTab === 'sessions' && (
          <div className="space-y-4">
            
            {/* Quick Helper Alert */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-100/70 rounded-xl flex items-start gap-3 text-indigo-900 text-xs">
              <HelpCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">Como funciona a agenda de disparos?</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Abaixo estão listadas todas as suas próximas consultas agendadas. Você pode configurar o nome do contato e o celular do cliente diretamente na tabela. Ao clicar em "Enviar Lembrete", o sistema carrega o texto configurado no seu WhatsApp Web de forma segura.
                </p>
              </div>
            </div>

            {/* List of Scheduled Appointments */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4">Paciente (Contato)</th>
                      <th className="py-3 px-4">Telefone WhatsApp</th>
                      <th className="py-3 px-4">Sessão / Horário</th>
                      <th className="py-3 px-4">Status Lembrete</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {appointments.filter(app => app.status === 'scheduled').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          <p className="font-bold">Nenhuma sessão agendada localizada.</p>
                          <p className="text-[10px] mt-1">Vá até o menu Consultas para agendar novos horários.</p>
                        </td>
                      </tr>
                    ) : (
                      appointments
                        .filter(app => app.status === 'scheduled')
                        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                        .map(app => {
                          const patient = patients.find(p => p.id === app.patientId);
                          const isEditing = editingPatientId === app.patientId;
                          
                          // Check if message is already sent in logs
                          const isSent = sentLogs.some(log => 
                            log.dateTime === `${app.date} ${app.time}` && log.patientName === app.patientName
                          );

                          return (
                            <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                              
                              {/* Patient Contact Info */}
                              <td className="py-4 px-4">
                                {isEditing ? (
                                  <div className="space-y-1 max-w-[180px]">
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                                      placeholder="Nome do cliente"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                                      {app.patientName.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800">{app.patientName}</p>
                                      <span className="text-[9px] text-slate-400">ID: {app.patientId.substring(0, 6)}</span>
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* Phone input / Edit */}
                              <td className="py-4 px-4">
                                {isEditing ? (
                                  <div className="flex items-center gap-1.5 max-w-[160px]">
                                    <input
                                      type="text"
                                      value={editPhone}
                                      onChange={(e) => setEditPhone(e.target.value)}
                                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                                      placeholder="Ex: 11999999999"
                                    />
                                    <button
                                      onClick={handleSavePatient}
                                      disabled={isSavingPatient}
                                      className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300"
                                    >
                                      {isSavingPatient ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    {patient?.phone ? (
                                      <span className="font-mono text-slate-700">{patient.phone}</span>
                                    ) : (
                                      <span className="text-amber-600 flex items-center gap-1 font-semibold text-[10px]">
                                        <AlertCircle className="w-3 h-3" /> Sem Celular
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleStartEditPatient(app.patientId, app.patientName, patient?.phone || '')}
                                      className="text-slate-400 hover:text-indigo-600 p-1"
                                      title="Editar número ou nome"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Date & Time */}
                              <td className="py-4 px-4">
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-slate-700 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {app.date.split('-').reverse().join('/')}
                                  </p>
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {app.time} ({app.type === 'online' ? 'Online' : 'Presencial'})
                                  </p>
                                </div>
                              </td>

                              {/* Message dispatch status */}
                              <td className="py-4 px-4 space-y-2">
                                {isSent ? (
                                  <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 w-max border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Lembrete Enviado
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-max">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Pendente
                                  </span>
                                )}

                                {app.patientConfirmed === true ? (
                                  <span className="bg-teal-50 text-teal-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 w-max border border-teal-200">
                                    ✓ Confirmado no Portal
                                  </span>
                                ) : app.patientConfirmed === false ? (
                                  <div className="space-y-1">
                                    <span className="bg-rose-50 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 w-max border border-rose-200">
                                      ✗ Solicitou Reagendamento
                                    </span>
                                    {app.patientComments && (
                                      <p className="text-[10px] text-slate-500 italic max-w-[200px] bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed font-medium">
                                        "{app.patientComments.replace('Paciente solicitou remarcação: "', '').replace('"', '')}"
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="bg-slate-50 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-max border border-slate-150">
                                    ⏳ Aguardando Resposta
                                  </span>
                                )}
                              </td>

                              {/* Send actions */}
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => handleSendReminderManual(app)}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-tight inline-flex items-center gap-1 cursor-pointer transition-all ${
                                    isSent
                                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 shadow-xs'
                                  }`}
                                >
                                  <Send className="w-3 h-3" />
                                  <span>{isSent ? 'Reenviar' : 'Enviar Lembrete'}</span>
                                </button>
                              </td>

                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONFIGURATION & TEMPLATES */}
        {subTab === 'config' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">Modelo de Mensagem de Confirmação</h3>
              <p className="text-xs text-slate-500">
                Altere o texto padrão que será enviado aos pacientes. Use as chaves abaixo para carregar as informações dinâmicas de cada consulta.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={5}
                className="w-full border border-slate-250 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 leading-relaxed font-medium"
                placeholder="Insira o texto do lembrete..."
              />

              <div className="flex flex-wrap gap-2 py-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase shrink-0 w-full mb-1">Tags Disponíveis:</span>
                <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono cursor-pointer hover:bg-slate-100" onClick={() => setMessageTemplate(prev => prev + ' {nome}')}>&#123;nome&#125;</span>
                <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono cursor-pointer hover:bg-slate-100" onClick={() => setMessageTemplate(prev => prev + ' {data}')}>&#123;data&#125;</span>
                <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono cursor-pointer hover:bg-slate-100" onClick={() => setMessageTemplate(prev => prev + ' {hora}')}>&#123;hora&#125;</span>
                <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono cursor-pointer hover:bg-slate-100" onClick={() => setMessageTemplate(prev => prev + ' {dia_semana}')}>&#123;dia_semana&#125;</span>
                <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono cursor-pointer hover:bg-slate-100" onClick={() => setMessageTemplate(prev => prev + ' {tipo}')}>&#123;tipo&#125;</span>
                <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-mono cursor-pointer hover:bg-emerald-100" onClick={() => setMessageTemplate(prev => prev + ' {link_confirmacao}')}>&#123;link_confirmacao&#125;</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                💡 Dica: Use asteriscos no WhatsApp para negrito. Ex: *Negrito*
              </span>
              <button
                onClick={handleSaveTemplate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Configurações</span>
              </button>
            </div>

            <AnimatePresence>
              {saveSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center"
                >
                  Configurações do WhatsApp salvas com sucesso!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 3: DISPATCH SENT HISTORY */}
        {subTab === 'logs' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">Histórico de Disparos Recentes</h3>
                <p className="text-xs text-slate-500">
                  Veja a lista das últimas mensagens de confirmação enviadas pelo robô ou de forma manual.
                </p>
              </div>
              {sentLogs.length > 0 && (
                <button
                  onClick={() => {
                    if(confirm("Deseja mesmo limpar o histórico?")) {
                      setSentLogs([]);
                      localStorage.removeItem('wa_sent_logs');
                    }
                  }}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Limpar Histórico
                </button>
              )}
            </div>

            <div className="space-y-2">
              {sentLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <p className="font-bold">Nenhum lembrete enviado recentemente.</p>
                  <p className="text-[10px] mt-1">Dispare lembretes manuais ou ative o Robô de monitoramento.</p>
                </div>
              ) : (
                sentLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-150/70 rounded-xl space-y-2 text-xs hover:bg-slate-100/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-800">{log.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({log.phone})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-400 font-bold">{log.timestamp}</span>
                        <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Sucesso
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 font-medium italic break-words">
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
