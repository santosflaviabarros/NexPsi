import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Edit3, Trash2, Mail, Phone, Calendar as CalendarIcon, 
  FileText, ArrowRight, UserCheck, UserX, X, AlertCircle, Plus, Link, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Patient, PatientStatus, PatientFinancialStatus } from '../types';

interface PatientsViewProps {
  psychologistId: string;
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id'>) => Promise<string>;
  onUpdatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  onDeletePatient: (id: string) => Promise<void>;
  onNavigateToRecordsOf: (patientId: string) => void;
  onNavigateToAppointmentsOf: (patientId: string) => void;
}

export default function PatientsView({ 
  psychologistId,
  patients, 
  onAddPatient, 
  onUpdatePatient, 
  onDeletePatient,
  onNavigateToRecordsOf,
  onNavigateToAppointmentsOf
}: PatientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTextId(id);
      setTimeout(() => setCopiedTextId(null), 2000);
    });
  };

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<PatientStatus>('active');
  const [financialStatus, setFinancialStatus] = useState<PatientFinancialStatus>('paid');
  const [paymentLink, setPaymentLink] = useState('');
  const [errorMess, setErrorMess] = useState('');

  // Confirmation Modal and Notification banner states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  // Handle open Form for Add
  const handleOpenAdd = () => {
    setEditingPatient(null);
    setName('');
    setEmail('');
    setPhone('');
    setBirthDate('');
    setCpf('');
    setNotes('');
    setStatus('active');
    setFinancialStatus('paid');
    setPaymentLink('');
    setErrorMess('');
    setIsFormOpen(true);
  };

  // Handle open Form for Edit
  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setEmail(p.email || '');
    setPhone(p.phone || '');
    setBirthDate(p.birthDate || '');
    setCpf(p.cpf || '');
    setNotes(p.notes || '');
    setStatus(p.status);
    setFinancialStatus(p.financialStatus || 'paid');
    setPaymentLink(p.paymentLink || '');
    setErrorMess('');
    setIsFormOpen(true);
  };

  const calculateAge = (bDate: string) => {
    if (!bDate) return '';
    const birth = new Date(bDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age} anos` : '';
  };

  // Handle save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess('');

    if (!name.trim()) {
      setErrorMess('O nome do paciente é obrigatório.');
      return;
    }

    try {
      const payload = {
        psychologistId,
        name,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        birthDate: birthDate || undefined,
        cpf: cpf.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
        financialStatus,
        paymentLink: paymentLink.trim() || undefined,
        createdAt: editingPatient ? editingPatient.createdAt : new Date().toISOString(),
      };

      if (editingPatient) {
        await onUpdatePatient(editingPatient.id, payload);
      } else {
        await onAddPatient(payload);
      }

      setIsFormOpen(false);
    } catch (err: any) {
      setErrorMess('Não foi possível salvar o paciente. Tente novamente.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmName(name);
  };

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.phone && p.phone.includes(query)) ||
      (p.cpf && p.cpf.includes(query))
    );
  });

  return (
    <div className="font-sans">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-indigo-600" /> Diretório de Pacientes
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Visualize, edite, adicione ou remova cadastros clínicos confidenciais.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            id="btn-register-patient"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-colors self-start md:self-auto"
          >
            <UserPlus className="w-4.5 h-4.5" /> Cadastrar Paciente
          </button>
        </div>

        {/* Search controls */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar paciente pelo nome, e-mail, telefone ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 focus:border-indigo-600 text-sm text-slate-700 placeholder-slate-400 font-medium"
          />
        </div>

        {/* List Grid / Bento List */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">Nenhum paciente cadastrado foi localizado.</p>
            <p className="text-slate-400 text-xs mt-1">Experimente mudar o termo de pesquisa ou adicione um novo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map((p) => {
              const ageStr = calculateAge(p.birthDate || '');
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-base">{p.name}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {p.status === 'active' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativo
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inativo
                          </>
                        )}
                      </span>

                      {/* Financial Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        p.financialStatus === 'overdue'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : p.financialStatus === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : p.financialStatus === 'exempt'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100' // default is 'paid' or empty
                      }`}>
                        {p.financialStatus === 'overdue' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Financeiro: Atrasado
                          </>
                        ) : p.financialStatus === 'pending' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Financeiro: Pendente
                          </>
                        ) : p.financialStatus === 'exempt' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Financeiro: Isento
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Financeiro: Em dia
                          </>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4 mt-3 text-slate-500 text-xs font-semibold">
                      {p.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phone}
                        </span>
                      )}
                      {p.email && (
                        <span className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {p.email}
                        </span>
                      )}
                      {p.birthDate && (
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> {p.birthDate} {ageStr ? `(${ageStr})` : ''}
                        </span>
                      )}
                    </div>

                    {p.notes && (
                      <p className="text-xs text-slate-400 italic line-clamp-1 mt-2.5 max-w-2xl bg-white p-2 rounded-lg border border-slate-100">
                        Observação: {p.notes}
                      </p>
                    )}

                    {/* Cobrança / Link & PIX Info */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/70 p-3 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Cobrança</span>
                        {p.paymentLink ? (
                          <a 
                            href={p.paymentLink.startsWith('http') ? p.paymentLink : `https://${p.paymentLink}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100/50"
                          >
                            <Link className="w-3.5 h-3.5" /> Link de Pagamento
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sem link de pagamento cadastrado</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-500">Chaves PIX:</span>
                        
                        {/* PIX E-mail */}
                        <button
                          type="button"
                          onClick={() => handleCopy('fbspsico@proton.me', `${p.id}-pix-email`)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copiar PIX fbspsico@proton.me"
                        >
                          {copiedTextId === `${p.id}-pix-email` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-[10px] text-emerald-700 font-medium">E-mail Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span className="text-[10px] font-mono">fbspsico@proton.me</span>
                            </>
                          )}
                        </button>

                        {/* PIX CPF */}
                        <button
                          type="button"
                          onClick={() => handleCopy('95065946604', `${p.id}-pix-cpf`)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copiar PIX CPF 95065946604"
                        >
                          {copiedTextId === `${p.id}-pix-cpf` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-[10px] text-emerald-700 font-medium">CPF Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span className="text-[10px] font-mono">95065946604</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Operational navigation links */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <button
                      onClick={() => onNavigateToAppointmentsOf(p.id)}
                      title="Agendar nova sessão"
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-850 rounded-lg text-xs font-bold border border-indigo-200/70 transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600" /> Sessão
                    </button>
                    <button
                      onClick={() => onNavigateToRecordsOf(p.id)}
                      title="Ver prontuários / Evoluções"
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-xs font-bold border border-slate-300/80 transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-700" /> Prontuários
                    </button>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      title="Editar cadastro"
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      title="Deletar paciente"
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

       {/* FORM DIALOG POP-OVER */}
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
                  <h3 className="text-lg font-bold">
                    {editingPatient ? 'Editar Paciente' : 'Novo Paciente Confidencial'}
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    Insira as informações do paciente em prontuário seguro.
                  </p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
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
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: João da Silva Santos"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      E-mail do Paciente
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@gmail.com"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      WhatsApp/Celular
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      CPF / Documento ID
                    </label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="ex: 123.456.789-00"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    />
                  </div>
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Status de Tratamento
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as PatientStatus)}
                      className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    >
                      <option value="active">✓ Ativo no Consultório</option>
                      <option value="inactive">✗ Inativo / Arquivado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Status Financeiro
                    </label>
                    <select
                      value={financialStatus}
                      onChange={(e) => setFinancialStatus(e.target.value as PatientFinancialStatus)}
                      className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                    >
                      <option value="paid">⬤ Em dia (Pago)</option>
                      <option value="pending">⬤ Pendente de acerto</option>
                      <option value="overdue">⬤ Em débito / Atrasado</option>
                      <option value="exempt">⬤ Isento / Pro bono</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Link de Pagamento Personalizado (ex: fatura Stripe, Mercado Pago)
                  </label>
                  <input
                    type="url"
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    placeholder="https://link.mercadopago.com.br/seu-link-ou-stripe"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Notas Administrativas Gerais (Preferências, horários, etc.)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Digite informações de contato ou administrativo (não adicione histórico de sessões aqui)..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-save-patient-form"
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-semibold transition-colors shadow-sm"
                  >
                    Salvar Cadastro
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
                Tem certeza que deseja excluir as informações de <strong className="text-slate-800">{deleteConfirmName}</strong>? 
                Todos os agendamentos e prontuários desse paciente também serão excluídos de forma irreversível.
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
                      await onDeletePatient(id);
                    } catch (err) {
                      setErrorMess('Não foi possível excluir o paciente. Verifique se ele possui relatórios travados.');
                    }
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Excluir Paciente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
