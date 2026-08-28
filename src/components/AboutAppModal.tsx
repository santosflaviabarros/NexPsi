import React from 'react';
import { 
  ShieldCheck, X, Sparkles, CheckCircle2, Cpu, Lock, 
  Layers, Presentation, Calendar, Users, Mic, Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface AboutAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutAppModal({ isOpen, onClose }: AboutAppModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white/10 border border-white/20 rounded-2xl shadow-inner backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black tracking-tight">NexPsi</h2>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black px-2.5 py-0.5 rounded-full tracking-wider">
                  v1.2
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1 font-medium">
                Portal Clínico & Gestão Integrada para Psicologia
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 custom-scroll">
          
          {/* Release Highlights / V1.2 */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
              <span>Versão Atual: v1.2</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A versão <strong>v1.2</strong> consolida a central de apresentações educativas e psicoeducação clínica, além de aprimorar a estabilidade de rotas e o módulo do copiloto inteligente.
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <a 
                href="/slides/sexualidade/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-white rounded-xl border border-indigo-100/80 hover:border-indigo-300 flex items-center gap-2 text-indigo-950 font-semibold transition hover:shadow-xs"
              >
                <Presentation className="w-3.5 h-3.5 text-rose-500" />
                <span>Slide Sexualidade</span>
              </a>
              <a 
                href="/slides/companhias/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-white rounded-xl border border-indigo-100/80 hover:border-indigo-300 flex items-center gap-2 text-indigo-950 font-semibold transition hover:shadow-xs"
              >
                <Presentation className="w-3.5 h-3.5 text-amber-500" />
                <span>Slide Companhias</span>
              </a>
              <a 
                href="/slides/desenvolvimento/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-white rounded-xl border border-indigo-100/80 hover:border-indigo-300 flex items-center gap-2 text-indigo-950 font-semibold transition hover:shadow-xs"
              >
                <Presentation className="w-3.5 h-3.5 text-emerald-500" />
                <span>Slide Desenvolvimento</span>
              </a>
            </div>
          </div>

          {/* Key Capabilities */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Módulos e Recursos Integrados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Gestão de Pacientes</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Fichas cadastrais completas, contatos e histórico.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Agenda & Consultas</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Agendamento rápido, controle de status e horários.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Mic className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Copiloto Clínico</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Apoio em transcrições, sínteses e formulações.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Privacidade & Sigilo</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Em conformidade com as diretrizes do CFP e LGPD.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Changelog & Evolution */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              Histórico de Versões
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100">
                <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded text-[11px] shrink-0">v1.2</span>
                <p className="text-slate-600 text-[11px]">
                  <strong>Atualização Recente:</strong> Reorganização da pasta de apresentações (/slides/sexualidade, /slides/companhias, /slides/desenvolvimento), modal informativo "Sobre o App" e otimização de build.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-[11px] shrink-0">v1.1</span>
                <p className="text-slate-600 text-[11px]">
                  Módulo financeiro com controle de pagamentos, integração para notificações via WhatsApp e modelos de anamnese.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-[11px] shrink-0">v1.0</span>
                <p className="text-slate-600 text-[11px]">
                  Lançamento oficial da plataforma com gerenciamento de prontuários, cadastro de pacientes, agenda interativa e autenticação segura.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 text-[11px] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Stack: React + TypeScript + Tailwind + Firestore</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sistema Operacional & Seguro</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            NexPsi • Versão 1.2
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </div>
  );
}
