import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Mail, Award, Check, AlertCircle, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { Psychologist } from '../types';

interface ProfileViewProps {
  profile: Psychologist | null;
  onSaveProfile: (profile: Psychologist) => Promise<void>;
  photoURL?: string;
  userEmail?: string;
}

export default function ProfileView({ profile, onSaveProfile, photoURL, userEmail }: ProfileViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [crp, setCrp] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMess, setErrorMess] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email || userEmail || '');
      setCrp(profile.crp);
      setSpecialties(profile.specialties);
    } else if (userEmail) {
      setEmail(userEmail);
    }
  }, [profile, userEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMess('');

    if (!name.trim()) {
      setErrorMess('O nome profissional é obrigatório.');
      setIsSaving(false);
      return;
    }
    if (!crp.trim()) {
      setErrorMess('O número do CRP é obrigatório para conformidade legal.');
      setIsSaving(false);
      return;
    }

    try {
      await onSaveProfile({
        userId: profile.userId,
        name: name.trim(),
        email: email.trim(),
        crp: crp.trim(),
        specialties: specialties.trim(),
        createdAt: profile.createdAt || new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMess('Não foi possível salvar o perfil clínico.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-sans grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Clinical Identification card */}
      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-indigo-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-600/50 flex flex-col justify-between min-h-[340px]"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono tracking-widest text-indigo-200">IDENTIDADE PROFISSIONAL</span>
              {photoURL ? (
                <img 
                  src={photoURL} 
                  alt={name || "Avatar"} 
                  className="w-11 h-11 rounded-full object-cover border-2 border-indigo-400/80 shadow-sm shrink-0" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ShieldCheck className="w-8 h-8 text-indigo-300 shrink-0" />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold">PSICÓLOGO(A)</p>
                <h3 className="text-xl font-extrabold tracking-tight mt-0.5">{name || "Seu Nome Completo"}</h3>
              </div>

              <div>
                <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold">REGISTRO ATIVO</p>
                <p className="text-base font-bold font-mono tracking-wide mt-0.5">{crp || "CRP 00/000000"}</p>
              </div>

              <div>
                <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold">ESPECIALIDADES</p>
                <p className="text-xs font-semibold leading-relaxed text-indigo-100/90 line-clamp-2 mt-0.5">
                  {specialties || "Não configurado."}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-indigo-500/40 pt-4 mt-6 flex justify-between items-center">
            <span className="text-[9px] font-mono text-indigo-300">CONSELHO FEDERAL DE PSICOLOGIA</span>
            <span className="text-[9px] px-2 py-0.5 bg-emerald-500 rounded text-emerald-950 font-bold uppercase tracking-wider">ATIVO</span>
          </div>
        </motion.div>
      </div>

      {/* Editor Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            Configuração do Consultório
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Mantenha seu CRP e especialidades atualizados para as assinaturas eletrônicas dos prontuários.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMess && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex gap-2 items-center">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">{errorMess}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex gap-2 items-center">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Perfil clínico salvo com sucesso com assinaturas ativas!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Nome Profissional Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr(a). Flávia Barros"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> E-mail Profissional
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Número de Inscrição CRP *
                </label>
                <input
                  type="text"
                  required
                  value={crp}
                  onChange={(e) => setCrp(e.target.value)}
                  placeholder="ex: CRP 06/194852-SP"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Suas Especialidades Teóricas & Abordagens Clínicas
              </label>
              <textarea
                rows={3}
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="ex: Terapia Cognitivo-Comportamental (TCC), Fenomenologia Existencial, Tratamento de Transtorno de Humor, Angústias e Lutos..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-800"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                id="btn-save-profile"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isSaving ? 'Salvando dados...' : 'Salvar Perfil Profissional'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
