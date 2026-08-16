import React, { useState } from 'react';
import { 
  X, Check, Copy, AlertCircle, Sparkles, RefreshCw, 
  HelpCircle, BookOpen, ShieldCheck, ClipboardCheck
} from 'lucide-react';
import {
  QuestionItem, AnswerOption, InterpretationResult,
  PHQ9_QUESTIONS, PHQ9_ANSWERS, interpretPHQ9,
  GAD7_QUESTIONS, GAD7_ANSWERS, interpretGAD7,
  SPIN_QUESTIONS, SPIN_ANSWERS, interpretSPIN,
  OCIR_QUESTIONS, OCIR_ANSWERS, interpretOCIR,
  PCL5_QUESTIONS, PCL5_ANSWERS, interpretPCL5,
  MSIBPD_QUESTIONS, MSIBPD_ANSWERS, interpretMSIBPD,
  MDQ_QUESTIONS, MDQ_ANSWERS, interpretMDQ,
  EAT26_QUESTIONS, EAT26_ANSWERS, interpretEAT26,
  ISI_QUESTIONS, ISI_ANSWERS, interpretISI,
  AUDIT_QUESTIONS, AUDIT_ANSWERS, interpretAUDIT,
  AQ10_QUESTIONS, AQ10_ANSWERS, interpretAQ10,
  SNAPIV_QUESTIONS, SNAPIV_ANSWERS, interpretSNAPIV,
  MBI_QUESTIONS, MBI_ANSWERS, interpretMBI,
  CSSRS_QUESTIONS, CSSRS_ANSWERS, interpretCSSRS,
  BDIII_QUESTIONS, BDIII_ANSWERS, interpretBDIII,
  BAI_QUESTIONS, BAI_ANSWERS, interpretBAI,
  EADS21_QUESTIONS, EADS21_ANSWERS, interpretEADS21,
  ASRS18_QUESTIONS, ASRS18_ANSWERS,
  MOM_ANSWERS, MOM_D_QUESTIONS, MOM_A_QUESTIONS, MOM_R_QUESTIONS, MOM_P_QUESTIONS,
  interpretMOMDepression, interpretMOMAnxiety, interpretMOMAnger, interpretMOMPanic
} from '../data/testsData';

interface TestRunnerModalProps {
  testId: string;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ testId, onClose }) => {
  const [testMode, setTestMode] = useState<'interactive' | 'direct'>('interactive');
  const [interactiveAnswers, setInteractiveAnswers] = useState<Record<number, number>>({});
  const [manualRawScore, setManualRawScore] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Subscale states for special multi-dimension tests
  const [eadsDirectScores, setEadsDirectScores] = useState({ dep: '', ans: '', est: '' });
  const [asrsDirectScores, setAsrsDirectScores] = useState({ desat: '', hiper: '', partA: '' });
  const [snapDirectScores, setSnapDirectScores] = useState({ desat: '', hiper: '' });
  const [mbiDirectScores, setMbiDirectScores] = useState({ exaustao: '', despersonalizacao: '' });
  const [mdqSimultaneous, setMdqSimultaneous] = useState(true);
  const [mdqImpairment, setMdqImpairment] = useState(2);

  // Cognitive/Projective custom states
  const [wiscScores, setWiscScores] = useState({ icv: '100', iop: '100', imt: '100', ivp: '100' });
  const [bfpScores, setBfpScores] = useState({ neu: '50', ext: '50', soc: '50', rea: '50', abe: '50' });
  const [htpObs, setHtpObs] = useState<Record<string, boolean>>({
    detalhesOmitidos: false,
    chamineFumaca: false,
    portasTrancadas: false,
    raizesExpostas: false,
    cicatrizesTronco: false,
    maosEscondidas: false,
    olhosGrandes: false,
    linhasFracas: false
  });

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const calcSum = (answers: Record<number, number>) =>
    (Object.values(answers) as number[]).reduce((s: number, v: number) => s + (Number(v) || 0), 0);

  const renderContent = () => {
    // 1. PHQ-9
    if (testId === 'PHQ-9') {
      const questions = PHQ9_QUESTIONS;
      const answers = PHQ9_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretPHQ9(currentScore);
      const hasIdeation = interactiveAnswers[9] && interactiveAnswers[9] > 0;
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Patient Health Questionnaire-9 (PHQ-9 - Rastreio de Depressão DSM-5)
Modo de Aplicação: ${testMode === 'interactive' ? 'Questionário Interativo' : 'Lançamento Direto de Escore'}
Escore Total: ${currentScore} de 27 pontos.
Classificação Diagnóstica: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
${hasIdeation ? '⚠️ ALERTA: Resposta positiva no Item 9 (Ideação de Morte/Suicídio). Protocolo de avaliação de segurança recomendado.' : ''}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'PHQ-9', 'Patient Health Questionnaire-9 (Rastreio de Depressão)',
        questions, answers, currentScore, 27, interpretation, note, answeredCount,
        hasIdeation ? 'Item 9 Positivo para Ideação de Morte' : undefined
      );
    }

    // 2. GAD-7
    if (testId === 'GAD-7') {
      const questions = GAD7_QUESTIONS;
      const answers = GAD7_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretGAD7(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Generalized Anxiety Disorder-7 (GAD-7 - Escala de Ansiedade Generalizada)
Modo de Aplicação: ${testMode === 'interactive' ? 'Questionário Interativo' : 'Lançamento Direto de Escore'}
Escore Total: ${currentScore} de 21 pontos.
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'GAD-7', 'Generalized Anxiety Disorder-7 (Ansiedade Generalizada)',
        questions, answers, currentScore, 21, interpretation, note, answeredCount
      );
    }

    // 3. SPIN
    if (testId === 'SPIN') {
      const questions = SPIN_QUESTIONS;
      const answers = SPIN_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretSPIN(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Social Phobia Inventory (SPIN - Inventário de Fobia Social)
Escore Total: ${currentScore} de 68 pontos (Linha de Corte >= 19).
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'SPIN', 'Social Phobia Inventory (Fobia Social e Ansiedade Interpessoal)',
        questions, answers, currentScore, 68, interpretation, note, answeredCount
      );
    }

    // 4. OCI-R
    if (testId === 'OCI-R') {
      const questions = OCIR_QUESTIONS;
      const answers = OCIR_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretOCIR(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Obsessive-Compulsive Inventory-Revised (OCI-R - Rastreio de TOC)
Escore Total: ${currentScore} de 72 pontos (Ponto de corte >= 21).
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'OCI-R', 'Inventário Obsessivo-Compulsivo Revisado (TOC)',
        questions, answers, currentScore, 72, interpretation, note, answeredCount
      );
    }

    // 5. PCL-5
    if (testId === 'PCL-5') {
      const questions = PCL5_QUESTIONS;
      const answers = PCL5_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretPCL5(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: PTSD Checklist for DSM-5 (PCL-5 - Rastreio de TEPT / Trauma)
Escore Total: ${currentScore} de 80 pontos (Ponto de corte >= 33).
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'PCL-5', 'PTSD Checklist for DSM-5 (Trauma e Estresse Pós-Traumático)',
        questions, answers, currentScore, 80, interpretation, note, answeredCount
      );
    }

    // 6. MSI-BPD
    if (testId === 'MSI-BPD') {
      const questions = MSIBPD_QUESTIONS;
      const answers = MSIBPD_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretMSIBPD(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: McLean Screening Instrument for Borderline Personality Disorder (MSI-BPD)
Escore Total: ${currentScore} de 10 pontos (Ponto de corte >= 7).
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'MSI-BPD', 'McLean Screening Instrument (Transtorno Borderline)',
        questions, answers, currentScore, 10, interpretation, note, answeredCount
      );
    }

    // 7. MDQ
    if (testId === 'MDQ') {
      const questions = MDQ_QUESTIONS;
      const answers = MDQ_ANSWERS;
      const yesCount = Object.values(interactiveAnswers).filter(v => v === 1).length;
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentYes = testMode === 'interactive' ? yesCount : (parseInt(manualRawScore) || 0);
      const interpretation = interpretMDQ(currentYes, mdqSimultaneous, mdqImpairment);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Mood Disorder Questionnaire (MDQ - Rastreio de Transtorno Bipolar)
Itens Positivos: ${currentYes} de 13 sintomas relatados.
Critério de Concomitância: ${mdqSimultaneous ? 'Simultâneos' : 'Não simultâneos'} | Grau de Prejuízo: ${mdqImpairment >= 2 ? 'Moderado/Grave' : 'Leve/Nenhum'}
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return (
        <div className="space-y-4">
          {renderStandardRunner(
            'MDQ', 'Mood Disorder Questionnaire (Rastreio de Bipolaridade e Mania)',
            questions, answers, currentYes, 13, interpretation, note, answeredCount
          )}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2.5">
            <span className="font-bold text-slate-700 block">Critérios Complementares do MDQ:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={mdqSimultaneous}
                onChange={e => setMdqSimultaneous(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
              <span className="text-slate-700 font-medium">Os sintomas marcados acima ocorreram no mesmo período de tempo?</span>
            </label>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-slate-600 font-medium">Nível de prejuízo funcional:</span>
              <select 
                value={mdqImpairment}
                onChange={e => setMdqImpairment(Number(e.target.value))}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              >
                <option value={0}>Nenhum problema</option>
                <option value={1}>Problema leve</option>
                <option value={2}>Problema moderado</option>
                <option value={3}>Problema grave</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    // 8. EAT-26
    if (testId === 'EAT-26') {
      const questions = EAT26_QUESTIONS;
      const answers = EAT26_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretEAT26(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Eating Attitudes Test (EAT-26 - Rastreio de Transtornos Alimentares)
Escore Total: ${currentScore} pontos (Ponto de corte >= 20).
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'EAT-26', 'Eating Attitudes Test (Transtornos Alimentares: Anorexia/Bulimia/TCA)',
        questions, answers, currentScore, 78, interpretation, note, answeredCount
      );
    }

    // 9. ISI
    if (testId === 'ISI') {
      const questions = ISI_QUESTIONS;
      const answers = ISI_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretISI(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Insomnia Severity Index (ISI - Índice de Gravidade de Insônia)
Escore Total: ${currentScore} de 28 pontos.
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'ISI', 'Insomnia Severity Index (Qualidade do Sono e Insônia)',
        questions, answers, currentScore, 28, interpretation, note, answeredCount
      );
    }

    // 10. AUDIT
    if (testId === 'AUDIT') {
      const questions = AUDIT_QUESTIONS;
      const answers = AUDIT_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretAUDIT(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP / OMS)
Instrumento: Alcohol Use Disorders Identification Test (AUDIT - Triagem de Padrão Alcoólico)
Escore Total: ${currentScore} de 40 pontos.
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'AUDIT', 'AUDIT - Triagem de Uso de Álcool e Risco de Dependência (OMS)',
        questions, answers, currentScore, 40, interpretation, note, answeredCount
      );
    }

    // 11. AQ-10
    if (testId === 'AQ-10') {
      const questions = AQ10_QUESTIONS;
      const answers = AQ10_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretAQ10(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP / NICE)
Instrumento: Autism Spectrum Quotient-10 (AQ-10 - Rastreio de Traços Autistas em Adultos)
Escore Total: ${currentScore} de 10 pontos (Ponto de corte >= 6).
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'AQ-10', 'Autism Spectrum Quotient (Rastreio de Espectro Autista Adulto)',
        questions, answers, currentScore, 10, interpretation, note, answeredCount
      );
    }

    // 12. SNAP-IV
    if (testId === 'SNAP-IV') {
      const questions = SNAPIV_QUESTIONS;
      const answers = SNAPIV_ANSWERS;
      const answeredEntries = Object.entries(interactiveAnswers);
      const desatScore = answeredEntries
        .filter(([id]) => questions.find(q => q.id === parseInt(id))?.dimension === 'desatencao')
        .reduce((sum, [, val]) => sum + Number(val), 0);
      const hiperScore = answeredEntries
        .filter(([id]) => questions.find(q => q.id === parseInt(id))?.dimension === 'hiperatividade')
        .reduce((sum, [, val]) => sum + Number(val), 0);
      
      const answeredCount = Object.keys(interactiveAnswers).length;
      const finalDesat = testMode === 'interactive' ? desatScore : (parseInt(snapDirectScores.desat) || 0);
      const finalHiper = testMode === 'interactive' ? hiperScore : (parseInt(snapDirectScores.hiper) || 0);
      const interpretation = interpretSNAPIV(finalDesat, finalHiper);

      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Escala SNAP-IV (Rastreio de TDAH e TOD Infantojuvenil)
Escores Brutos Obtidos:
- Fator I (Desatenção - 9 itens): ${finalDesat} pts (Média: ${(finalDesat/9).toFixed(2)}/3.0 - Corte >= 1.78)
- Fator II (Hiperatividade/Impulsividade - 9 itens): ${finalHiper} pts (Média: ${(finalHiper/9).toFixed(2)}/3.0 - Corte >= 1.78)
Classificação Diagnóstica: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return (
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Progresso da Escala SNAP-IV:</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${answeredCount === questions.length ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
              {answeredCount} de {questions.length} respondidos
            </span>
          </div>

          <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
            {questions.map((q) => (
              <div key={q.id} className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-150/70 space-y-2 text-left hover:border-slate-250 transition-colors">
                <div className="flex justify-between items-start">
                  <p className="font-black text-slate-800 tracking-tight leading-tight text-xs">
                    {q.id}. {q.text}
                  </p>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 shrink-0 ml-2">
                    {q.dimension === 'desatencao' ? 'Desatenção' : 'Hiperatividade'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {answers.map((ans) => {
                    const isSelected = interactiveAnswers[q.id] === ans.score;
                    return (
                      <button
                        key={ans.score}
                        onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: ans.score }))}
                        className={`px-1 py-1.5 rounded-xl border text-[9.5px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className="font-black text-xs">{ans.score}</span>
                        <span className="text-[8px] truncate">{ans.text.split('(')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
              <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação:</span>
              <h4 className="text-base font-black">{interpretation.title}</h4>
              <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Desatenção (Soma Total)</span>
                <span className="text-base font-black text-slate-700 font-mono block mt-0.5">{finalDesat} pts (média {(finalDesat/9).toFixed(2)})</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Hiperatividade / Impulsividade</span>
                <span className="text-base font-black text-slate-700 font-mono block mt-0.5">{finalHiper} pts (média {(finalHiper/9).toFixed(2)})</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário para Evolução:</span>
              <textarea 
                readOnly
                rows={5}
                value={note}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 resize-none focus:outline-hidden"
              />
              <button
                onClick={() => handleCopyText(note)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/80" />}
                <span>{copied ? 'Nota Copiada com Sucesso!' : 'Copiar Nota de Prontuário'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 13. MBI (Burnout)
    if (testId === 'MBI') {
      const questions = MBI_QUESTIONS;
      const answers = MBI_ANSWERS;
      const answeredEntries = Object.entries(interactiveAnswers);
      const exaustaoScore = answeredEntries
        .filter(([id]) => questions.find(q => q.id === parseInt(id))?.dimension === 'exaustao')
        .reduce((sum, [, val]) => sum + Number(val), 0);
      const despScore = answeredEntries
        .filter(([id]) => questions.find(q => q.id === parseInt(id))?.dimension === 'despersonalizacao')
        .reduce((sum, [, val]) => sum + Number(val), 0);

      const answeredCount = Object.keys(interactiveAnswers).length;
      const finalEx = testMode === 'interactive' ? exaustaoScore : (parseInt(mbiDirectScores.exaustao) || 0);
      const finalDesp = testMode === 'interactive' ? despScore : (parseInt(mbiDirectScores.despersonalizacao) || 0);
      const interpretation = interpretMBI(finalEx, finalDesp);

      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Maslach Burnout Inventory - Screening (MBI - Síndrome de Burnout / Esgotamento)
Escores por Dimensão:
- Exaustão Emocional: ${finalEx} de 16 pontos
- Despersonalização / Cinismo: ${finalDesp} de 12 pontos
Classificação Clínica: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'MBI', 'Maslach Burnout Inventory (Síndrome de Burnout e Esgotamento Profissional)',
        questions, answers, finalEx + finalDesp, 28, interpretation, note, answeredCount
      );
    }

    // 14. C-SSRS (Columbia Suicide Severity)
    if (testId === 'C-SSRS') {
      const questions = CSSRS_QUESTIONS;
      const answers = CSSRS_ANSWERS;
      const answeredCount = Object.keys(interactiveAnswers).length;
      const interpretation = interpretCSSRS(interactiveAnswers);
      const note = `REGISTRO DE AVALIAÇÃO CLÍNICA DE RISCO DE SUICÍDIO (CFP)
Instrumento: Columbia-Suicide Severity Rating Scale (C-SSRS - Escala Columbia de Segurança)
Status de Risco Identificado: ${interpretation.title}
Parecer Clínico e Conduta: ${interpretation.description}
Data da Avaliação: ${new Date().toLocaleDateString('pt-BR')}`;

      return (
        <div className="space-y-4">
          <div className="bg-red-50 p-3 rounded-2xl border border-red-200 flex items-center justify-between text-xs text-red-900 font-bold">
            <span>Triagem de Segurança e Risco de Suicídio (Columbia C-SSRS)</span>
            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-black text-[10px]">
              {answeredCount} de {questions.length} itens respondidos
            </span>
          </div>

          <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
            {questions.map((q) => (
              <div key={q.id} className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-150 space-y-2 text-left">
                <div className="flex justify-between items-start">
                  <p className="font-black text-slate-800 text-xs">
                    {q.id}. {q.text}
                  </p>
                  <span className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border ml-2 shrink-0">
                    {q.desc}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {answers.map((ans) => {
                    const isSelected = interactiveAnswers[q.id] === ans.score;
                    const isYes = ans.score === 1;
                    return (
                      <button
                        key={ans.score}
                        onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: ans.score }))}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected 
                            ? (isYes ? 'bg-red-600 text-white border-red-700 shadow-xs' : 'bg-emerald-600 text-white border-emerald-700 shadow-xs')
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{ans.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className={`p-4 rounded-2xl ${interpretation.className} space-y-1`}>
              <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-90">Classificação de Risco Columbia:</span>
              <h4 className="text-base font-black">{interpretation.title}</h4>
              <p className="text-xs leading-relaxed">{interpretation.description}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário para Evolução:</span>
              <textarea 
                readOnly
                rows={5}
                value={note}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 resize-none focus:outline-hidden"
              />
              <button
                onClick={() => handleCopyText(note)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/80" />}
                <span>{copied ? 'Nota Copiada com Sucesso!' : 'Copiar Nota de Prontuário'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 15. BDI-II
    if (testId === 'BDI-II') {
      const questions = BDIII_QUESTIONS;
      const answers = BDIII_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretBDIII(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP / SATEPSI)
Instrumento: Inventário de Depressão de Beck - II (BDI-II)
Escore Obtido: ${currentScore} de 63 pontos.
Classificação Clínica: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'BDI-II', 'Inventário de Depressão de Beck - II (BDI-II)',
        questions, answers, currentScore, 63, interpretation, note, answeredCount
      );
    }

    // 16. BAI
    if (testId === 'BAI') {
      const questions = BAI_QUESTIONS;
      const answers = BAI_ANSWERS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = interpretBAI(currentScore);
      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP / SATEPSI)
Instrumento: Inventário de Ansiedade de Beck (BAI)
Escore Obtido: ${currentScore} de 63 pontos.
Classificação: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        'BAI', 'Inventário de Ansiedade de Beck (BAI)',
        questions, answers, currentScore, 63, interpretation, note, answeredCount
      );
    }

    // 17. EADS-21 (DASS-21)
    if (testId === 'EADS-21') {
      const answeredEntries = Object.entries(interactiveAnswers);
      const depScore = answeredEntries
        .filter(([id]) => EADS21_QUESTIONS.find(q => q.id === parseInt(id))?.dimension === 'depressao')
        .reduce((sum, [, val]) => sum + (val as number), 0) * 2;
      const ansScore = answeredEntries
        .filter(([id]) => EADS21_QUESTIONS.find(q => q.id === parseInt(id))?.dimension === 'ansiedade')
        .reduce((sum, [, val]) => sum + (val as number), 0) * 2;
      const estScore = answeredEntries
        .filter(([id]) => EADS21_QUESTIONS.find(q => q.id === parseInt(id))?.dimension === 'estresse')
        .reduce((sum, [, val]) => sum + (val as number), 0) * 2;

      const answeredCount = Object.keys(interactiveAnswers).length;
      const finalDep = testMode === 'interactive' ? depScore : (parseInt(eadsDirectScores.dep) || 0);
      const finalAns = testMode === 'interactive' ? ansScore : (parseInt(eadsDirectScores.ans) || 0);
      const finalEst = testMode === 'interactive' ? estScore : (parseInt(eadsDirectScores.est) || 0);

      const interpretation = interpretEADS21(finalDep, finalAns, finalEst);

      const note = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA (CFP)
Instrumento: Escala de Depressão, Ansiedade e Estresse (EADS-21 / DASS-21)
Escores Multiplicados (Base DASS-42):
- Depressão: ${finalDep} pts (${interpretation.depression.title})
- Ansiedade: ${finalAns} pts (${interpretation.anxiety.title})
- Estresse: ${finalEst} pts (${interpretation.stress.title})
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return (
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Progresso do Inventário EADS-21:</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${answeredCount === 21 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {answeredCount} de 21 respondidos
            </span>
          </div>

          <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
            {EADS21_QUESTIONS.map((q) => (
              <div key={q.id} className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-150 space-y-2 text-left">
                <div className="flex justify-between items-start">
                  <p className="font-black text-slate-800 text-xs">
                    {q.id}. {q.text}
                  </p>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 ml-2 shrink-0">
                    {q.dimension}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {EADS21_ANSWERS.map((ans) => {
                    const isSelected = interactiveAnswers[q.id] === ans.score;
                    return (
                      <button
                        key={ans.score}
                        onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: ans.score }))}
                        className={`p-1.5 rounded-xl border text-[9.5px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className="font-black text-xs">{ans.score}</span>
                        <span className="text-[8px] truncate">{ans.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`p-3 rounded-2xl border ${interpretation.depression.className} text-center`}>
                <span className="text-[9px] font-bold uppercase block opacity-80">Depressão</span>
                <span className="text-sm font-black block mt-0.5">{finalDep} pts</span>
                <span className="text-[10px] font-bold">{interpretation.depression.title}</span>
              </div>
              <div className={`p-3 rounded-2xl border ${interpretation.anxiety.className} text-center`}>
                <span className="text-[9px] font-bold uppercase block opacity-80">Ansiedade</span>
                <span className="text-sm font-black block mt-0.5">{finalAns} pts</span>
                <span className="text-[10px] font-bold">{interpretation.anxiety.title}</span>
              </div>
              <div className={`p-3 rounded-2xl border ${interpretation.stress.className} text-center`}>
                <span className="text-[9px] font-bold uppercase block opacity-80">Estresse</span>
                <span className="text-sm font-black block mt-0.5">{finalEst} pts</span>
                <span className="text-[10px] font-bold">{interpretation.stress.title}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário para Evolução:</span>
              <textarea 
                readOnly
                rows={5}
                value={note}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 resize-none focus:outline-hidden"
              />
              <button
                onClick={() => handleCopyText(note)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/80" />}
                <span>{copied ? 'Nota Copiada com Sucesso!' : 'Copiar Nota de Prontuário'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 18. ASRS-18
    if (testId === 'ASRS-18') {
      const answersEntries = Object.entries(interactiveAnswers);
      const desatScore = answersEntries
        .filter(([id]) => ASRS18_QUESTIONS.find(q => q.id === parseInt(id))?.dimension === 'desatencao')
        .reduce((sum, [, val]) => sum + (val as number), 0);
      const hiperScore = answersEntries
        .filter(([id]) => ASRS18_QUESTIONS.find(q => q.id === parseInt(id))?.dimension === 'hiperatividade')
        .reduce((sum, [, val]) => sum + (val as number), 0);

      let partAPositiveCount = 0;
      ASRS18_QUESTIONS.slice(0, 6).forEach((q, idx) => {
        const val = interactiveAnswers[q.id] || 0;
        if (idx < 3) {
          if (val >= 2) partAPositiveCount++;
        } else {
          if (val >= 3) partAPositiveCount++;
        }
      });

      const answeredCount = Object.keys(interactiveAnswers).length;
      const isPositive = partAPositiveCount >= 4;
      const note = `TRIAGEM DE TDAH EM ADULTOS - ESCALA ASRS-18 (OMS)
Escore Desatenção: ${desatScore} pts | Escore Hiperatividade/Impulsividade: ${hiperScore} pts
Critério Crítico da Parte A: ${partAPositiveCount} de 6 sintomas positivados.
Screener Diagnóstico: ${isPositive ? 'POSITIVO (Alta probabilidade de TDAH em Adultos)' : 'NEGATIVO (Abaixo da linha de corte preliminar)'}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return (
        <div className="space-y-4">
          <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
            {ASRS18_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-150 space-y-2 text-left">
                <div className="flex justify-between items-start">
                  <p className="font-black text-slate-800 text-xs">
                    {q.id}. {q.text}
                  </p>
                  {idx < 6 && (
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0 ml-2">
                      Parte A (Triagem)
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {ASRS18_ANSWERS.map((ans) => {
                    const isSelected = interactiveAnswers[q.id] === ans.score;
                    return (
                      <button
                        key={ans.score}
                        onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: ans.score }))}
                        className={`p-1 rounded-xl border text-[9px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className="font-black text-xs">{ans.score}</span>
                        <span className="text-[7.5px] truncate">{ans.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className={`p-4 rounded-2xl border ${isPositive ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-emerald-50 text-emerald-900 border-emerald-200'} space-y-1`}>
              <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Screener de Triagem ASRS-18:</span>
              <h4 className="text-base font-black">{isPositive ? 'Screener Positivo para TDAH Adulto' : 'Screener Negativo'}</h4>
              <p className="text-xs font-semibold leading-relaxed">
                {isPositive ? `Pontuou ${partAPositiveCount} de 6 na Parte A (corte >= 4). Indicada investigação aprofundada de histórico e DSM-5.` : 'Sintomas abaixo do limiar de corte da Parte A.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário para Evolução:</span>
              <textarea 
                readOnly
                rows={5}
                value={note}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 resize-none focus:outline-hidden"
              />
              <button
                onClick={() => handleCopyText(note)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/80" />}
                <span>{copied ? 'Nota Copiada com Sucesso!' : 'Copiar Nota de Prontuário'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 19. MOM series (MOM-D, MOM-A, MOM-R, MOM-P)
    if (testId.startsWith('MOM-')) {
      const type = testId.replace('MOM-', '');
      const questions = type === 'D' ? MOM_D_QUESTIONS : type === 'A' ? MOM_A_QUESTIONS : type === 'R' ? MOM_R_QUESTIONS : MOM_P_QUESTIONS;
      const score = calcSum(interactiveAnswers);
      const answeredCount = Object.keys(interactiveAnswers).length;
      const currentScore = testMode === 'interactive' ? score : (parseInt(manualRawScore) || 0);
      const interpretation = type === 'D' ? interpretMOMDepression(currentScore) : type === 'A' ? interpretMOMAnxiety(currentScore) : type === 'R' ? interpretMOMAnger(currentScore) : interpretMOMPanic(currentScore);
      const testName = type === 'D' ? 'Depressão' : type === 'A' ? 'Ansiedade' : type === 'R' ? 'Raiva e Irritabilidade' : 'Pânico e Agorafobia';

      const note = `REGISTRO DE MONITORAMENTO SEMANAL (TCC - A Mente Vencendo o Humor)
Instrumento: Inventário de ${testName}
Escore Obtido: ${currentScore} de 45 pontos.
Classificação de Gravidade: ${interpretation.title}.
Parecer Clínico: ${interpretation.description}
Data de Aplicação: ${new Date().toLocaleDateString('pt-BR')}`;

      return renderStandardRunner(
        testId, `Inventário de ${testName} (A Mente Vencendo o Humor)`,
        questions, MOM_ANSWERS, currentScore, 45, interpretation, note, answeredCount
      );
    }

    // 20. BFP (Bateria Fatorial de Personalidade)
    if (testId === 'BFP') {
      const note = `AVALIAÇÃO DE PERSONALIDADE - BFP (BIG FIVE)
Escores Padronizados (Escore T):
- Neuroticismo (Instabilidade Emocional): T = ${bfpScores.neu}
- Extroversão (Sociabilidade/Dinamismo): T = ${bfpScores.ext}
- Socialização (Empatia/Amabilidade): T = ${bfpScores.soc}
- Realização (Conscienciosidade/Disciplina): T = ${bfpScores.rea}
- Abertura a Novas Experiências: T = ${bfpScores.abe}
Data de Análise: ${new Date().toLocaleDateString('pt-BR')}`;

      return (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-slate-700 block">Lançamento de Escores T Padronizados (Média 50, DP 10):</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'neu', label: 'Neuroticismo' },
                { key: 'ext', label: 'Extroversão' },
                { key: 'soc', label: 'Socialização' },
                { key: 'rea', label: 'Realização' },
                { key: 'abe', label: 'Abertura' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{f.label}:</label>
                  <input 
                    type="number" 
                    value={(bfpScores as any)[f.key]} 
                    onChange={e => setBfpScores(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário BFP:</span>
            <textarea 
              readOnly
              rows={6}
              value={note}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 resize-none focus:outline-hidden"
            />
            <button
              onClick={() => handleCopyText(note)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/80" />}
              <span>{copied ? 'Nota Copiada com Sucesso!' : 'Copiar Síntese BFP'}</span>
            </button>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="text-center py-8 space-y-3">
        <BookOpen className="w-10 h-10 text-indigo-500 mx-auto" />
        <h4 className="font-black text-slate-800 text-sm">Instrumento Clínico: {testId}</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Consulte o manual oficial para o protocolo de aplicação e citação conforme resolução do CFP.
        </p>
      </div>
    );
  };

  // Helper standard runner UI
  const renderStandardRunner = (
    id: string,
    title: string,
    questions: QuestionItem[],
    answers: AnswerOption[],
    currentScore: number,
    maxScore: number,
    interpretation: InterpretationResult,
    note: string,
    answeredCount: number,
    warning?: string
  ) => {
    const isCompleted = answeredCount === questions.length;

    return (
      <div className="space-y-4">
        {/* Header progress */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600">Progresso do Instrumento:</span>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
            {answeredCount} de {questions.length} respondidos ({Math.round((answeredCount/questions.length)*100)}%)
          </span>
        </div>

        {/* Question items */}
        <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1 text-xs">
          {questions.map((q) => {
            const currentVal = interactiveAnswers[q.id];
            return (
              <div key={q.id} className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-150 space-y-2 text-left hover:border-slate-200 transition-colors">
                <p className="font-black text-slate-800 tracking-tight leading-tight text-xs">
                  {q.id}. {q.text} {q.desc && <span className="font-normal text-slate-500">({q.desc})</span>}
                </p>
                <div className={`grid grid-cols-${Math.min(answers.length, 5)} gap-1.5`}>
                  {answers.map((ans) => {
                    const isSelected = currentVal === ans.score;
                    return (
                      <button
                        key={ans.score + ans.text}
                        onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: ans.score }))}
                        className={`p-1.5 rounded-xl border text-[9.5px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className="font-black text-xs block mb-0.5">{ans.score}</span>
                        <span className="truncate w-full block text-[8px] opacity-90">{ans.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning if any */}
        {warning && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        {/* Interpretation result */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação Clínica:</span>
              <span className="text-xs font-mono font-black">{currentScore} / {maxScore} pts</span>
            </div>
            <h4 className="text-base font-black">{interpretation.title}</h4>
            <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
          </div>

          {/* Generated evolution note */}
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário Pronta para Copiar:</span>
            <textarea 
              readOnly
              rows={5}
              value={note}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 resize-none focus:outline-hidden"
            />
            <button
              onClick={() => handleCopyText(note)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/80" />}
              <span>{copied ? 'Nota Copiada com Sucesso!' : 'Copiar Nota de Prontuário'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <ClipboardCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Assistente de Aplicação: {testId}</h3>
              <p className="text-[10px] text-slate-300">Cálculo sométrico e nota clínica estruturada</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {renderContent()}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Fechar Assistente
          </button>
        </div>
      </div>
    </div>
  );
};
