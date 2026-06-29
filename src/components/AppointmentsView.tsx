import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, CalendarIcon,
  Video, Home, HelpCircle, Plus, Search, Filter, Eye, ChevronRight, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Patient, AppointmentStatus, AppointmentType } from '../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (appt: Omit<Appointment, 'id'>) => Promise<string>;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  preselectedPatientId?: string | null;
  onClearPreselectedPatient?: () => void;
  onNavigateToRecordsOf: (patientId: string) => void;
}

export default function AppointmentsView({
  appointments,
  patients,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  preselectedPatientId,
  onClearPreselectedPatient,
  onNavigateToRecordsOf
}: AppointmentsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM-DD

  // Form appointment states
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState<number>(50);
  const [type, setType] = useState<AppointmentType>('online');
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');
  const [notes, setNotes] = useState('');
  const [errorMess, setErrorMess] = useState('');

  // Confirmation Modal and Notification states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Handle pre-selected patient trigger
  useEffect(() => {
    if (preselectedPatientId) {
      setPatientId(preselectedPatientId);
      // Automatically open the form!
      const todayString = new Date().toISOString().split('T')[0];
      setDate(todayString);
      setTime('14:00');
      setDuration(50);
      setType('online');
      setStatus('scheduled');
      setNotes('');
      setErrorMess('');
      setIsFormOpen(true);
    }
  }, [preselectedPatientId]);

  const handleOpenAdd = () => {
    setPatientId(patients.length > 0 ? patients[0].id : '');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
    setTime('09:00');
    setDuration(50);
    setType('online');
    setStatus('scheduled');
    setNotes('');
    setErrorMess('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess('');

    if (!patientId) {
      setErrorMess('Selecione um paciente cadastrado.');
      return;
    }
    if (!date) {
      setErrorMess('A data da consulta é obrigatória.');
      return;
    }
    if (!time) {
      setErrorMess('O horário da consulta é obrigatório.');
      return;
    }

    const selectedPatient = patients.find(p => p.id === patientId);
    if (!selectedPatient) {
      setErrorMess('Paciente selecionado é inválido.');
      return;
    }

    try {
      await onAddAppointment({
        psychologistId: selectedPatient.psychologistId,
        patientId,
        patientName: selectedPatient.name,
        date,
        time,
        duration,
        type,
        status,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setIsFormOpen(false);
      if (onClearPreselectedPatient) onClearPreselectedPatient();
    } catch (err) {
      setErrorMess('Erro ao agendar consulta. Tente novamente.');
    }
  };

  const handleStatusChange = async (assemblyId: string, newStatus: AppointmentStatus) => {
    try {
      setActionError(null);
      await onUpdateAppointment(assemblyId, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setActionError("Erro ao atualizar status da sessão.");
    }
  };

  const handleDelete = (id: string, patentName: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmName(patentName);
  };

  // Close and clean pre-selected state
  const handleCloseForm = () => {
    setIsFormOpen(false);
    if (onClearPreselectedPatient) onClearPreselectedPatient();
  };

  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter(a => {
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchPatient = patientFilter === 'all' || a.patientId === patientFilter;
      const matchDate = !dateFilter || a.date === dateFilter;
      return matchStatus && matchPatient && matchDate;
    })
    .sort((x, y) => {
      // Sort by date then time desc
      const dateTimeX = `${x.date}T${x.time}`;
      const dateTimeY = `${y.date}T${y.time}`;
      return dateTimeX.localeCompare(dateTimeY);
    });

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
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="text-indigo-600" /> Agenda Dinâmica de Atendimento
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Planeje horários clínicas, acompanhe status e atualize o andamento das terapias.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            id="btn-schedule-appointment"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4.5 h-4.5" /> Nova Sessão
          </button>
        </div>

        {/* Filters Panel - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-6">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold mb-1 ml-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-200 bg-white text-xs font-semibold text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Sessões (Filtro: Todos)</option>
              <option value="scheduled">Scheduled / Agendado</option>
              <option value="completed">Completed / Terapia Finalizada</option>
              <option value="canceled">Canceled / Cancelado</option>
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold mb-1 ml-1 flex items-center gap-1">
              <Search className="w-3 h-3" /> Paciente
            </span>
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 bg-white text-xs font-semibold text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos os Pacientes</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold mb-1 ml-1 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" /> Filtrar por Dia
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 bg-white text-xs font-semibold text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => { setStatusFilter('all'); setPatientFilter('all'); setDateFilter(''); }}
              className="w-full text-center py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* appointments agenda list */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 font-medium text-sm">Nenhum agendamento para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appt) => {
              const formattedDate = appt.date.split('-').reverse().join('/');
              return (
                <motion.div
                  key={appt.id}
                  layout
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    appt.status === 'completed'
                      ? 'bg-slate-50/70 border-slate-200 opacity-80'
                      : appt.status === 'canceled'
                      ? 'bg-red-50/40 border-red-150/40 opacity-70'
                      : 'bg-white border-slate-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl text-center shrink-0 w-16 ${
                      appt.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : appt.status === 'canceled'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      <span className="block text-xs font-bold leading-none uppercase tracking-wider">
                        {appt.time}
                      </span>
                      <span className="block text-[10px] font-semibold mt-1 opacity-75">
                        {appt.duration} min
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-800 text-base">{appt.patientName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          appt.status === 'scheduled'
                            ? 'bg-indigo-100 text-indigo-800'
                            : appt.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appt.status === 'scheduled' && 'Agendado'}
                          {appt.status === 'completed' && 'Finalizado'}
                          {appt.status === 'canceled' && 'Cancelado'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs text-slate-400 font-medium ml-1">
                          {appt.type === 'online' ? (
                            <><Video className="w-3.5 h-3.5 text-indigo-500" /> Online</>
                          ) : (
                            <><Home className="w-3.5 h-3.5 text-slate-500" /> Presencial</>
                          )}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> {formattedDate} no consultório
                      </p>

                      {appt.notes && (
                        <p className="text-xs text-slate-400 font-medium italic mt-1.5 line-clamp-1">
                          Observação: {appt.notes}
                        </p>
                      )}

                      {appt.status === 'scheduled' && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {appt.patientConfirmed === true ? (
                            <span className="bg-teal-50 text-teal-800 text-[10px] px-2 py-0.5 rounded-lg font-extrabold flex items-center gap-1 border border-teal-200">
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                              ✓ Presença confirmada pelo paciente
                            </span>
                          ) : appt.patientConfirmed === false ? (
                            <div className="flex flex-col gap-1 w-full mt-1">
                              <span className="bg-rose-50 text-rose-800 text-[10px] px-2 py-0.5 rounded-lg font-extrabold flex items-center gap-1 border border-rose-200 w-max">
                                ✗ Paciente solicitou reagendamento
                              </span>
                              {appt.patientComments && (
                                <p className="text-[11px] bg-slate-50 p-2 rounded-xl text-slate-600 font-medium italic border border-slate-100 max-w-xl leading-relaxed mt-1">
                                  Mensagem: "{appt.patientComments.replace('Paciente solicitou remarcação: "', '').replace('"', '')}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="bg-slate-50 text-slate-400 text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 border border-slate-150">
                              ⏳ Aguardando confirmação no portal
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Status transitions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {appt.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appt.id, 'completed')}
                          id={`btn-complete-appt-${appt.id}`}
                          className="px-2.5 py-1.5 hover:bg-emerald-100 text-emerald-800 bg-emerald-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Finalizado
                        </button>
                        <button
                          onClick={() => handleStatusChange(appt.id, 'canceled')}
                          className="px-2.5 py-1.5 hover:bg-red-100 text-red-700 bg-red-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancelar
                        </button>
                      </>
                    )}

                    {appt.status === 'completed' && (
                      <button
                        onClick={() => onNavigateToRecordsOf(appt.patientId)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-850 rounded-lg text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        Escrever Prontuário <ChevronRight className="w-3 h-3 text-indigo-650" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(appt.id, appt.patientName)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* SCHEDULING FORM POP-OVER */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 bg-indigo-600 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Agendar Nova Sessão Terapêutica</h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    Preencha as informações para registrar na agenda clínica.
                  </p>
                </div>
                <button 
                  onClick={handleCloseForm}
                  className="rounded-lg p-1.5 text-indigo-100 hover:text-white hover:bg-indigo-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {errorMess && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">{errorMess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Selecionar Paciente *
                  </label>
                  {patients.length === 0 ? (
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-xs font-medium">
                      Nenhum paciente cadastrado encontrado. Por favor, cadastre um paciente primeiro no diretório.
                    </div>
                  ) : (
                    <select
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    >
                      <option value="">-- Selecione o Paciente --</option>
                      {patients.filter(p => p.status === 'active').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Data da Consulta *
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Horário de Início *
                    </label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Duração (min)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 50)}
                      min="10"
                      max="300"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Formato
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as AppointmentType)}
                      className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    >
                      <option value="online">🎥 Online (Vídeochamada)</option>
                      <option value="presential">🏢 Presencial (Consultório)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Status Inicial
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                      className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    >
                      <option value="scheduled">Agendado</option>
                      <option value="completed">Realizado</option>
                      <option value="canceled">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Observações de Agenda (ex: enviar link de reunião)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Link do meet, urgência terapêutica, cancelamentos programados..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-save-appointment"
                    disabled={patients.length === 0}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                  >
                    Salvar na Agenda
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM CONFIRMATION DIALOG (IFRAME PROOF COGNITIVE MODAL) */}
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
                <h3 className="text-lg font-bold text-slate-800">Confirmar Exclusão</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Tem certeza que deseja excluir permanentemente a consulta agendada de <strong className="text-slate-800">{deleteConfirmName}</strong>? 
                Esta ação é definitiva e não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmId(null); setDeleteConfirmName(''); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = deleteConfirmId;
                    setDeleteConfirmId(null);
                    setDeleteConfirmName('');
                    try {
                      setActionError(null);
                      await onDeleteAppointment(id);
                    } catch (err) {
                      setActionError('Não foi possível excluir o agendamento. Verifique sua conexão.');
                    }
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
