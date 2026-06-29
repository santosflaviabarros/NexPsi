import { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Users, Calendar, FileText, UserCircle2, 
  LogOut, Sparkles, Database, Check, ExternalLink, CalendarDays, KeyRound,
  Files, BookOpen, DollarSign, Mic, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Core imports
import { 
  subscribePatients, 
  subscribeAppointments, 
  subscribeMedicalRecords, 
  addPatient, 
  updatePatient, 
  deletePatient,
  addAppointment, 
  updateAppointment, 
  deleteAppointment,
  addMedicalRecord, 
  updateMedicalRecord, 
  deleteMedicalRecord,
  getPsychologistProfile,
  savePsychologistProfile,
  checkAndSeedInitialSandboxData
} from './dbService';
import { db, auth, isMockFirebase } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Patient, Appointment, MedicalRecord, Psychologist } from './types';

// Components imports
import AuthView from './components/AuthView';
import DashboardStats from './components/DashboardStats';
import PatientsView from './components/PatientsView';
import AppointmentsView from './components/AppointmentsView';
import MedicalRecordsView from './components/MedicalRecordsView';
import AudioCopilotView from './components/AudioCopilotView';
import AnamnesesView from './components/AnamnesesView';
import ProfileView from './components/ProfileView';
import ReferencesView from './components/ReferencesView';
import FinancialView from './components/FinancialView';
import WhatsAppView from './components/WhatsAppView';
import PatientPortalView from './components/PatientPortalView';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isPortal = urlParams.get('portal') === 'true';
  const portalAppId = urlParams.get('appId');

  if (isPortal && portalAppId) {
    return <PatientPortalView appId={portalAppId} />;
  }

  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; photoURL?: string } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Roster lists
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [profile, setProfile] = useState<Psychologist | null>(null);

  // Focus and pre-selection links (e.g., jump from Patients -> Appointments or Medical Records)
  const [preselectedPatientId, setPreselectedPatientId] = useState<string | null>(null);

  // Authentication Login Handler
  const handleLogin = (userId: string, email: string, photoURL?: string) => {
    setCurrentUser({ id: userId, email, photoURL });
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    if (!isMockFirebase && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Erro ao fazer logout:", err);
      }
    }
    setCurrentUser(null);
    setPatients([]);
    setAppointments([]);
    setRecords([]);
    setProfile(null);
  };

  // Listen for Firebase Auth changes if not in Mock Sandbox
  useEffect(() => {
    if (isMockFirebase || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({ id: user.uid, email: user.email || '', photoURL: user.photoURL || undefined });
        // Restore tab layout when logging in
        setActiveTab('dashboard');
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Trigger subscriptions once logged in
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.id;

    // Check & Seed Sandbox mock data if none exists so the interface looks lively on first load!
    checkAndSeedInitialSandboxData(userId);

    // Fetch psychologist profile card
    getPsychologistProfile(userId).then(async (profileData) => {
      if (!profileData) {
        const initialProfile: Psychologist = {
          userId,
          name: currentUser.email ? currentUser.email.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Psicólogo(a)",
          email: currentUser.email || "",
          crp: "Configurar CRP",
          specialties: "Preencha as suas especialidades nas configurações do perfil",
          createdAt: new Date().toISOString(),
        };
        try {
          await savePsychologistProfile(initialProfile);
          setProfile(initialProfile);
        } catch (err) {
          console.error("Erro ao salvar perfil inicial:", err);
          setProfile(initialProfile);
        }
      } else {
        setProfile(profileData);
      }
    });

    // Subscriptions setup
    const unsubPatients = subscribePatients(userId, (res) => {
      setPatients(res);
    });

    const unsubAppointments = subscribeAppointments(userId, (res) => {
      setAppointments(res);
    });

    const unsubRecords = subscribeMedicalRecords(userId, (res) => {
      setRecords(res);
    });

    return () => {
      unsubPatients();
      unsubAppointments();
      unsubRecords();
    };
  }, [currentUser]);

  // Shortcut navigations
  const handleNavigateToRecordsOf = (patientId: string) => {
    setPreselectedPatientId(patientId);
    setActiveTab('prontuarios');
  };

  const handleNavigateToAppointmentsOf = (patientId: string) => {
    setPreselectedPatientId(patientId);
    setActiveTab('consultas');
  };

  const clearPreselectedPatient = () => {
    setPreselectedPatientId(null);
  };

  const handleSaveProfile = async (updated: Psychologist) => {
    await savePsychologistProfile(updated);
    setProfile(updated);
  };

  // Render gate
  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  // Filter today's consultations for dashboard
  const todayString = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.date === todayString && a.status === 'scheduled');

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-850 flex flex-col md:flex-row font-sans antialiased selection:bg-indigo-100 select-none">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:sticky md:top-0 border-r border-slate-100 bg-white shrink-0 z-40">
        {/* Logo brand */}
        <div className="p-6 border-b border-slate-100/80 flex items-center gap-2.5 shrink-0">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
            <ShieldCheck className="w-5.5 h-5.5" id="sidebar-brand-logo" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
              Nex<span className="text-indigo-600">Psi</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">Portal Clínico</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => { setActiveTab('dashboard'); clearPreselectedPatient(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span>Painel de Controle</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('consultas'); clearPreselectedPatient(); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'consultas' 
                ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4.5 h-4.5" />
              <span>Agenda</span>
            </div>
            {appointments.filter(a => a.status === 'scheduled').length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full text-[10px] font-black">
                {appointments.filter(a => a.status === 'scheduled').length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('pacientes'); clearPreselectedPatient(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'pacientes' 
                ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Pacientes</span>
          </button>

          <button
            onClick={() => { setActiveTab('prontuarios'); clearPreselectedPatient(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'prontuarios' 
                ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4.5 h-4.5" />
            <span>Prontuários</span>
          </button>

          <button
            onClick={() => { setActiveTab('copiloto'); clearPreselectedPatient(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'copiloto' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
          >
            <Mic className={`w-4.5 h-4.5 ${activeTab === 'copiloto' ? 'text-amber-300' : 'text-indigo-500'}`} />
            <span>Copiloto de Voz</span>
          </button>

          <button
            onClick={() => { setActiveTab('anamneses'); clearPreselectedPatient(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'anamneses' 
                ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Files className="w-4.5 h-4.5" />
            <span>Modelos</span>
          </button>

          <button
            onClick={() => { setActiveTab('referencias'); clearPreselectedPatient(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'referencias' 
                ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span>Referências</span>
          </button>

          <button
            onClick={() => { setActiveTab('financeiro'); clearPreselectedPatient(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'financeiro' 
                ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
            <span>Financeiro</span>
          </button>

          <button
            onClick={() => { setActiveTab('whatsapp'); clearPreselectedPatient(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'whatsapp' 
                ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/10" />
            <span>WhatsApp</span>
          </button>
        </nav>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setActiveTab('perfil')}
              className="flex items-center gap-2.5 hover:bg-slate-100 p-2 rounded-xl transition-all cursor-pointer text-left flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={profile?.name || "Psicólogo"} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  profile ? profile.name.charAt(0) : 'P'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold text-slate-800 truncate">{profile?.name || "Psicólogo"}</p>
                <p className="text-[9px] text-indigo-600 font-medium truncate leading-none mt-0.5">{profile?.email || currentUser?.email}</p>
                {profile?.crp && profile.crp !== "Configurar CRP" && (
                  <p className="text-[8px] text-slate-400 font-mono tracking-wider mt-1">{profile.crp}</p>
                )}
              </div>
            </button>
            
            <button
              onClick={handleLogout}
              id="btn-logout-sidebar"
              title="Sair do Portal"
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* MOBILE HEADER NAVIGATION */}
        <header className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40 md:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Logo brand */}
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
                  <ShieldCheck className="w-5 h-5" id="header-brand-logo" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Nex<span className="text-indigo-600">Psi</span>
                </span>
              </div>

              {/* Right therapist profile chip */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('perfil')}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <div className="w-6.5 h-6.5 rounded-full overflow-hidden bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-250">
                    {currentUser?.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={profile?.name || "Psicólogo"} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      profile ? profile.name.charAt(0) : 'P'
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-800 line-clamp-1">{profile?.name || "Psicólogo"}</p>
                    <p className="text-[9px] text-indigo-600 font-medium tracking-wide leading-none">{profile?.email || currentUser?.email}</p>
                    {profile?.crp && profile.crp !== "Configurar CRP" && (
                      <p className="text-[8px] text-slate-400 font-mono tracking-wider mt-0.5">{profile.crp}</p>
                    )}
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  id="btn-logout"
                  title="Sair do Portal"
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

      {/* MOBILE TAB CONTROLLER */}
      <div className="md:hidden bg-white border-b border-slate-100 grid grid-cols-8 select-none shrink-0 text-center font-semibold text-xs py-1">
        <button
          onClick={() => { setActiveTab('dashboard'); clearPreselectedPatient(); }}
          className={`flex flex-col items-center py-2 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5 mx-auto" />
          <span className="text-[9px] mt-1 font-bold">Painel</span>
        </button>
        <button
          onClick={() => { setActiveTab('consultas'); clearPreselectedPatient(); }}
          className={`flex flex-col items-center py-2 ${activeTab === 'consultas' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Calendar className="w-5 h-5 mx-auto" />
          <span className="text-[9px] mt-1 font-bold">Agenda</span>
        </button>
        <button
          onClick={() => { setActiveTab('pacientes'); clearPreselectedPatient(); }}
          className={`flex flex-col items-center py-2 ${activeTab === 'pacientes' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Users className="w-5 h-5 mx-auto" />
          <span className="text-[9px] mt-1 font-bold">Pacientes</span>
        </button>
        <button
          onClick={() => { setActiveTab('prontuarios'); clearPreselectedPatient(); }}
          className={`flex flex-col items-center py-2 ${activeTab === 'prontuarios' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <FileText className="w-5 h-5 mx-auto" />
          <span className="text-[9px] mt-1 font-bold">Laudos</span>
        </button>
        <button
          onClick={() => { setActiveTab('copiloto'); clearPreselectedPatient(); }}
          className={`flex flex-col items-center py-2 ${activeTab === 'copiloto' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Mic className="w-5 h-5 mx-auto text-indigo-500 animate-pulse" />
          <span className="text-[9px] mt-1 font-bold">Gravador</span>
        </button>
        <button
          onClick={() => { setActiveTab('anamneses'); clearPreselectedPatient(); }}
          className={`flex flex-col items-center py-2 ${activeTab === 'anamneses' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Files className="w-5 h-5 mx-auto" />
          <span className="text-[9px] mt-1 font-bold">Modelos</span>
        </button>
        <button
          onClick={() => { setActiveTab('referencias'); clearPreselectedPatient(); }}
          className={`flex flex-col items-center py-2 ${activeTab === 'referencias' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <BookOpen className="w-5 h-5 mx-auto" />
          <span className="text-[9px] mt-1 font-bold">Guias</span>
        </button>
        <button
          onClick={() => { setActiveTab('financeiro'); clearPreselectedPatient(); }}
          className={`flex flex-col items-center py-2 ${activeTab === 'financeiro' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <DollarSign className="w-5 h-5 mx-auto" />
          <span className="text-[9px] mt-1 font-bold">Finanças</span>
        </button>
        <button
          onClick={() => { setActiveTab('whatsapp'); clearPreselectedPatient(); }}
          className={`flex flex-col items-center py-2 ${activeTab === 'whatsapp' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <MessageSquare className="w-5 h-5 mx-auto text-emerald-500" />
          <span className="text-[9px] mt-1 font-bold">Whats</span>
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Dynamic Panel Routing */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                    Olá, {profile ? profile.name.split(' ')[0] : 'Dr(a)'}.
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">
                    Aqui está o panorama geral das evoluções psicoterapêuticas semanais.
                  </p>
                </div>
              </div>

              {/* Four indicators boxes */}
              <DashboardStats 
                patients={patients} 
                appointments={appointments} 
                records={records} 
                onSelectTab={setActiveTab}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left col: list of today appointments */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                        <CalendarDays className="text-indigo-600 w-5 h-5" /> Sessões Agendadas para Hoje
                      </h3>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        {todaysAppointments.length} hoje
                      </span>
                    </div>

                    {todaysAppointments.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dotted border-slate-200">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-xs font-bold">Nenhuma consulta pendente para o dia de hoje.</p>
                        <button
                          onClick={() => setActiveTab('consultas')}
                          className="text-xs text-indigo-600 font-extrabold mt-2 hover:underline"
                        >
                          Ir para Agenda e agendar uma nova sessão →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                        {todaysAppointments.map(appt => (
                          <div 
                            key={appt.id} 
                            className="p-3 border border-slate-50 rounded-xl bg-slate-50/30 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">
                                {appt.time}
                              </span>
                              <div>
                                <h4 className="text-xs font-extrabold text-slate-800">{appt.patientName}</h4>
                                <span className="text-[10px] font-semibold text-slate-400 capitalize">{appt.type} ({appt.duration} min)</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setActiveTab('consultas')}
                              className="text-[10px] font-extrabold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded"
                            >
                              Ver Agenda
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-50 mt-6 pt-4 flex justify-between items-center text-xs text-slate-400">
                    <span>Prontuários eletrônicos protegidos legalmente</span>
                    <button
                      onClick={() => setActiveTab('consultas')}
                      className="text-indigo-600 font-extrabold hover:underline"
                    >
                      Acessar agenda de atendimentos →
                    </button>
                  </div>
                </div>

                {/* Right col: rapid instructions checklist & system guidelines */}
                <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base mb-3 pb-3 border-b border- slate-50">
                      Sua Estação de Trabalho
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div className="flex gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-150 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                        <div>
                          <p className="font-bold text-slate-700">Cadastre Pacientes</p>
                          <p className="text-slate-400 mt-0.5">Vá em Pacientes e insira dados cadastrais sensíveis.</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-150 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                        <div>
                          <p className="font-bold text-slate-700">Marque Consultas</p>
                          <p className="text-slate-400 mt-0.5">Organize atendimentos pelo calendário de consultas.</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-150 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                        <div>
                          <p className="font-bold text-slate-700">Gere Prontuários Seguros</p>
                          <p className="text-slate-400 mt-0.5">Após a sessão ocorra, redija evoluções e assine-as com segurança.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 mt-6">
                    <h4 className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" /> Segurança Integrada CFM
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Este software funciona de acordo com a LGPD e o Código de Ética Profissional dos Psicólogos. Todas as visualizações clínicas e evoluções de prontuário ocorrem com criptografia profissional e isolamento garantido.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'consultas' && (
            <motion.div
              key="consultas"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AppointmentsView
                appointments={appointments}
                patients={patients}
                onAddAppointment={addAppointment}
                onUpdateAppointment={updateAppointment}
                onDeleteAppointment={deleteAppointment}
                preselectedPatientId={preselectedPatientId}
                onClearPreselectedPatient={clearPreselectedPatient}
                onNavigateToRecordsOf={handleNavigateToRecordsOf}
              />
            </motion.div>
          )}

          {activeTab === 'pacientes' && (
            <motion.div
              key="pacientes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <PatientsView
                psychologistId={currentUser.id}
                patients={patients}
                onAddPatient={addPatient}
                onUpdatePatient={updatePatient}
                onDeletePatient={deletePatient}
                onNavigateToRecordsOf={handleNavigateToRecordsOf}
                onNavigateToAppointmentsOf={handleNavigateToAppointmentsOf}
              />
            </motion.div>
          )}

          {activeTab === 'prontuarios' && (
            <motion.div
              key="prontuarios"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <MedicalRecordsView
                records={records}
                patients={patients}
                onAddRecord={addMedicalRecord}
                onUpdateRecord={updateMedicalRecord}
                onDeleteRecord={deleteMedicalRecord}
                preselectedPatientId={preselectedPatientId}
                onClearPreselectedPatient={clearPreselectedPatient}
              />
            </motion.div>
          )}

          {activeTab === 'copiloto' && (
            <motion.div
              key="copiloto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AudioCopilotView
                patients={patients}
                currentUser={currentUser}
                profile={profile}
              />
            </motion.div>
          )}

          {activeTab === 'anamneses' && (
            <motion.div
              key="anamneses"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AnamnesesView patients={patients} profile={profile} />
            </motion.div>
          )}

          {activeTab === 'referencias' && (
            <motion.div
              key="referencias"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ReferencesView />
            </motion.div>
          )}

          {activeTab === 'financeiro' && (
            <motion.div
              key="financeiro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <FinancialView
                patients={patients}
                currentUser={currentUser}
                profile={profile}
              />
            </motion.div>
          )}

          {activeTab === 'whatsapp' && (
            <motion.div
              key="whatsapp"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <WhatsAppView
                patients={patients}
                appointments={appointments}
                onUpdatePatient={updatePatient}
              />
            </motion.div>
          )}


          {activeTab === 'perfil' && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileView
                profile={profile}
                onSaveProfile={handleSaveProfile}
                photoURL={currentUser?.photoURL}
                userEmail={currentUser?.email}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-500">
            NexPsi © 2026 - Portal Clínico Confidencial de Gestão em Psicologia.
          </p>
          <div className="flex justify-center gap-6">
            <span>Resolução CFP nº 01/2009 (Prontuário de Psicologia)</span>
            <span>•</span>
            <span>Resolução CFP nº 04/2020 (Tecnologia e Teleconsulta)</span>
            <span>•</span>
            <span>Em conformidade com a LGPD e Segurança da Informação</span>
          </div>
        </div>
      </footer>
      </div> {/* Closes flex-1 flex flex-col min-w-0 */}
    </div>
  );
}
