import React, { useState, useEffect, CSSProperties } from 'react';
import { 
  Copy, Check, FileText, Baby, Sparkles, User, HeartHandshake, 
  Printer, ClipboardCopy, Info, Landmark, Coins, FileSignature, 
  ClipboardCheck, MapPin, CalendarDays, Heading, UserCheck, ShieldAlert,
  Image, Plus, Upload, Download, ExternalLink, Send, Stethoscope, Share2,
  Search, CopyCheck, RefreshCw, Layers, SlidersHorizontal, BookmarkPlus, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Patient, Psychologist } from '../types';
import { createGoogleDoc } from '../lib/googleDocs';

interface AnamnesesViewProps {
  patients: Patient[];
  profile: Psychologist | null;
}

type MainCategory = 
  | 'anamnese' 
  | 'contratos' 
  | 'recibos' 
  | 'termos' 
  | 'presenca' 
  | 'laudos' 
  | 'atestado' 
  | 'encaminhamento'
  | 'reembolso' 
  | 'credenciamento'
  | 'meus_modelos';

export default function AnamnesesView({ patients, profile }: AnamnesesViewProps) {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<MainCategory>('anamnese');
  const [showSandboxPrintWarning, setShowSandboxPrintWarning] = useState<boolean>(false);
  const [selectedSubAnamnese, setSelectedSubAnamnese] = useState<'infantil' | 'adolescente' | 'adulto' | 'idoso'>('adulto');

  // Estado para respostas preenchidas de Anamnese com persistência segura
  const [anamneseAnswers, setAnamneseAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('clinic_anamnese_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('clinic_anamnese_answers', JSON.stringify(anamneseAnswers));
  }, [anamneseAnswers]);

  // Custom logo state (base64 string) and watermark toggle
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('clinic_custom_logo') || null;
  });
  const [useLogoAsWatermark, setUseLogoAsWatermark] = useState<boolean>(() => {
    return localStorage.getItem('clinic_logo_as_watermark') !== 'false'; // default to true
  });
  const [watermarkSize, setWatermarkSize] = useState<number>(() => {
    return Number(localStorage.getItem('clinic_watermark_size') || '560');
  });
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(() => {
    return Number(localStorage.getItem('clinic_watermark_opacity') || '0.10');
  });

  // Input states for dynamic formatting
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientCpf, setPatientCpf] = useState<string>('');
  
  // Professional states (default template variables)
  const [psychologistName, setPsychologistName] = useState<string>(() => {
    return localStorage.getItem('clinic_psychologist_name') || 'Dra. Flávia Barros';
  });
  const [psychologistCrp, setPsychologistCrp] = useState<string>(() => {
    return localStorage.getItem('clinic_psychologist_crp') || '04/IS01654';
  });
  const [consultationCity, setConsultationCity] = useState<string>(() => {
    return localStorage.getItem('clinic_consultation_city') || 'Belo Horizonte';
  });

  // Helper to format CRP as requested: "Psicóloga Clínica: CRP MG 04/IS01654"
  const formatCrpDisplay = (crp?: string) => {
    if (!crp) return 'MG 04/IS01654';
    let clean = crp.trim();
    clean = clean.replace(/^CRP\s*(nº|n°|:)?\s*/i, '').trim();
    if (!clean.toUpperCase().includes('MG') && (clean.startsWith('04/') || clean.startsWith('04-') || clean.startsWith('04 '))) {
      return `MG ${clean}`;
    }
    return clean;
  };

  // Custom footer state (address, phone, name etc.)
  const [customFooter, setCustomFooter] = useState<string>(() => {
    return localStorage.getItem('clinic_custom_footer') || 
      `Av. Principal, 1000 • Sala 502 • Centro, ${localStorage.getItem('clinic_consultation_city') || 'Belo Horizonte'}\nWhatsApp: (31) 99999-9999 • E-mail: draflavia.barros@gmail.com`;
  });

  // Toggle displaying professional name in the letterhead header block
  const [showHeaderName, setShowHeaderName] = useState<boolean>(() => {
    return localStorage.getItem('clinic_show_header_name') !== 'false';
  });

  // Global toggle for Header, Footer and Signature visibility in PDF/Word/Screen previews
  const [includeHeader, setIncludeHeader] = useState<boolean>(() => {
    return localStorage.getItem('clinic_include_header') !== 'false';
  });
  const [includeFooter, setIncludeFooter] = useState<boolean>(() => {
    return localStorage.getItem('clinic_include_footer') !== 'false';
  });
  const [includeSignBox, setIncludeSignBox] = useState<boolean>(() => {
    return localStorage.getItem('clinic_include_sign_box') !== 'false';
  });

  // Dynamic user-submitted document templates
  interface CustomTemplate {
    id: string;
    title: string;
    category?: 'Encaminhamentos' | 'Laudos e Relatórios' | 'Atestados e Declarações' | 'Contratos e Termos' | 'Financeiro e Convênios' | 'Personalizados';
    content: string;
  }
  const defaultCustomTemplates: CustomTemplate[] = [
    // 1. LAUDOS E RELATÓRIOS (CFP 06/2019)
    {
      id: 'template_laudo_psicologico',
      title: 'Laudo Psicológico Clínico Completo (CFP 06/2019)',
      category: 'Laudos e Relatórios',
      content: `LAUDO PSICOLÓGICO
(Em conformidade com a Resolução CFP nº 06/2019)

1. IDENTIFICAÇÃO
Autora/Emissora: {psicologo} • Registro: CRP nº {crp}
Pessoa Interessada / Paciente: {paciente}
CPF do(a) Paciente: {cpf}
Finalidade: Avaliação e parecer psicológico clínico especializado

2. DESCRIÇÃO DA DEMANDA
O(A) paciente buscou atendimento por encaminhamento de profissional de saúde para investigação e avaliação de sintomas de instabilidade emocional, desregulação do humor, ansiedade acentuada e alterações do padrão de sono, com reflexos nas relações interpessoais e desempenho funcional.

3. PROCEDIMENTOS
Foram realizadas entrevistas clínicas semiestruturadas com o(a) paciente, anamnese psicológica detalhada, observação clínica do comportamento e aplicação de inventários de rastreio psicológico devidamente validados pelo SATEPSI (CFP). O processo de avaliação ocorreu ao longo de sessões individuais de 50 minutos.

4. ANÁLISE PSICOLÓGICA
No decorrer do processo avaliativo, o(a) paciente apresentou-se orientado(a) globalmente no tempo e espaço, com discurso coerente e fluxo de pensamento preservado. Evidenciou-se humor deprimido/ansioso com reatividade a estressores psicossociais, cognições autocríticas e queixas somáticas de tensão e fadiga. Os resultados dos instrumentos técnicos indicaram nível moderado a grave de ansiedade e sintomas depressivos reativos.

5. CONCLUSÃO TÉCNICA
Com base nos dados coligidos e fundamentação técnico-científica da Psicologia, conclui-se que o quadro clínico apresentado é compatível com hipótese diagnóstica de Transtorno de Ansiedade Generalizada (CID-10: F41.1) associado a sintomas depressivos reativos (CID-10: F32).
Recomenda-se a continuidade do acompanhamento psicoterápico em frequência semanal, com foco em regulação emocional e reestruturação cognitiva, além de avaliação psiquiátrica complementar para suporte medicamentoso.

Este laudo tem caráter confidencial e validade contextual, não devendo ser utilizado para fins diversos aos aqui expressos.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_relatorio_psicologico',
      title: 'Relatório Psicológico Clínico (CFP 06/2019)',
      category: 'Laudos e Relatórios',
      content: `RELATÓRIO PSICOLÓGICO
(Em conformidade com a Resolução CFP nº 06/2019)

1. IDENTIFICAÇÃO
Psicólogo(a) Responsável: {psicologo} • Registro: CRP nº {crp}
Paciente: {paciente} • CPF: {cpf}
Solicitante: A pedido do(a) próprio(a) paciente / Convênio

2. DESCRIÇÃO DA DEMANDA
Relatório emitido para fins de comprovação e síntese do acompanhamento psicoterápico individual realizado no consultório.

3. PROCEDIMENTO
O acompanhamento psicoterápico vem sendo realizado por meio de sessões regulares presenciais/online com duração de 50 minutos, utilizando técnicas da abordagem clínica baseada em evidências.

4. ANÁLISE
Durante o período de acompanhamento, observou-se engajamento positivo do(a) paciente no processo terapêutico, com progressiva tomada de consciência sobre padrões de pensamento disfuncionais, estratégias de enfrentamento de estresse e melhora nos índices de regulação do humor e qualidade de vida.

5. CONCLUSÃO
Recomenda-se a manutenção do tratamento psicoterápico em regime de continuidade para consolidação dos ganhos terapêuticos e prevenção de recaídas.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_parecer_psicologico',
      title: 'Parecer Psicológico Técnico (CFP 06/2019)',
      category: 'Laudos e Relatórios',
      content: `PARECER PSICOLÓGICO
(Em conformidade com a Resolução CFP nº 06/2019)

EMENTA: Análise técnica e fundamentação psicológica sobre matéria solicitada.

1. IDENTIFICAÇÃO
Psicólogo(a) Parecerista: {psicologo} • Registro: CRP nº {crp}
Solicitante: {paciente} • CPF: {cpf}
Assunto: Parecer técnico sobre condições psicológicas e enquadre clínico

2. EXPOSIÇÃO DE MOTIVOS
Trata-se de solicitação para manifestação técnica fundamentada sobre a necessidade de acompanhamento e suporte emocional específico face a circunstâncias de estresse e sobrecarga psicossocial recente.

3. DISCUSSÃO TÉCNICA E ANÁLISE
Com base nos conhecimentos científicos da ciência psicológica e na análise contextual apresentada, observa-se que situações de alta exigência adaptativa demandam suporte especializado para preservação da saúde mental e integridade funcional.

4. CONCLUSÃO
Opina-se favoravelmente à implementação das medidas de apoio e suporte psicológico recomendadas, devendo o processo ser conduzido em consonância com as diretrizes éticas da profissão.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Parecerista • CRP nº {crp}`
    },
    {
      id: 'template_ficha_soap',
      title: 'Registro de Sessão e Evolução (Estrutura SOAP)',
      category: 'Laudos e Relatórios',
      content: `REGISTRO CLÍNICO DE EVOLUÇÃO TERAPÊUTICA (ESTRUTURA SOAP)

Paciente: {paciente}
CPF do Paciente: {cpf}
Data do Atendimento: {data}

S - SUBJETIVO (Relatos do Paciente)
__________________________________________________________________
- Queixas principais verbalizadas nesta sessão:
- Autopercepção de sintomas e humor na última semana:
- Relatos de melhora ou dificuldades situacionais:

O - OBJETIVO (Observações Clínicas Estruturadas)
__________________________________________________________________
- Estado mental observável (cognição, afeto, linguagem, atenção):
- Comunicação não verbal e sinais autonômicos de ansiedade/tristeza:
- Dados estruturados ou quantitativos (escores, sono, sintomas):

A - AVALIAÇÃO (Análise e Conclusões Clínicas)
__________________________________________________________________
- Técnicas psicológicas/cognitivas aplicadas nesta sessão:
- Compreensão diagnóstica ativa e evolução das metas clínicas:
- Grau de cooperação, insight e reatividade às intervenções:

P - PLANO (Diretrizes e Próximos Passos)
__________________________________________________________________
- Tarefas de casa / Atividades terapêuticas acordadas (homework):
- Encaminhamentos necessários ou contatos interdisciplinares:
- Escopo ou tema planejados para o próximo atendimento:

___________________________________________________________
Assinatura do(a) Psicólogo(a): {psicologo}
Registro Profissional: CRP nº {crp}

{cidade}, {data}.`
    },
    {
      id: 'template_de_evolucao',
      title: 'Relatório de Evolução Clínica Sintético',
      category: 'Laudos e Relatórios',
      content: `RELATÓRIO DE EVOLUÇÃO CLÍNICA SINTÉTICO

Paciente: {paciente}
CPF do Paciente: {cpf}

Constatou-se evolução favorável do paciente no período recente, com aquisição de regulação emocional ativa e progresso nos objetivos terapêuticos iniciais.

O acompanhamento clínico prossegue conforme recomendado profissionalmente.

{cidade}, {data}.`
    },
    {
      id: 'template_entrevista_inicial',
      title: 'Roteiro de Triagem e Anamnese Inicial',
      category: 'Laudos e Relatórios',
      content: `FORMULÁRIO DE TRIAGEM E ENTREVISTA DIAGNÓSTICA

Paciente: {paciente}
CPF do Paciente: {cpf}
Data da Coleta: {data}

1. ANAMNESE E QUEIXA CLÍNICA INICIAL:
__________________________________________________________________

2. HISTÓRIA FAMILIAR E ROTINA SOCIAL:
__________________________________________________________________

3. ANTECEDENTES PSIQUIÁTRICOS E MEDICAMENTOS DE RELEVO:
__________________________________________________________________

4. COMPREENSÃO E ESTRATÉGIA TERAPÊUTICA COMBINADA:
__________________________________________________________________

Encaminhamento e observação clínica continuará no consultório.

{cidade}, {data}.`
    },

    // 2. ENCAMINHAMENTOS (CFP 06/2019)
    {
      id: 'template_encaminhamento_psiquiatrico',
      title: 'Encaminhamento: Avaliação Psiquiátrica (Psicofarmacologia)',
      category: 'Encaminhamentos',
      content: `ENCAMINHAMENTO PSICOLÓGICO CLÍNICO
(Em conformidade com a Resolução CFP nº 06/2019 e Código de Ética Profissional)

1. DESTINATÁRIO:
Ao(À) Médico(a) Psiquiatra

2. IDENTIFICAÇÃO DO(A) PACIENTE:
Nome: {paciente}
CPF: {cpf}

3. PROFISSIONAL EMISSOR(A):
Psicólogo(a): {psicologo} • Registro: CRP nº {crp}

4. MOTIVO DO ENCAMINHAMENTO:
Encaminho o(a) paciente acima identificado(a), em acompanhamento psicoterápico sob meus cuidados profissionais, para avaliação clínica especializada com foco em suporte psicofarmacológico.

5. HISTÓRICO E SINTOMATOLOGIA OBSERVADA:
No decurso dos atendimentos psicoterápicos, constatou-se a presença de sintomas de ansiedade aguda com manifestações somáticas (taquicardia, tensão muscular, insônia inicial) e episódios de oscilação tímica com impacto funcional nas atividades cotidianas e laborais.

Hipótese diagnóstica de relevo: Investigação para Transtorno de Ansiedade Generalizada (CID-10: F41.1) / Episódio Depressivo (CID-10: F32).

6. SOLICITAÇÃO:
Solicito avaliação psiquiátrica especializada e conduta psicofarmacológica que julgar pertinente, colocando-me à disposição para discussão e acompanhamento interdisciplinar do caso clínico.

Declaro que este documento foi devidamente esclarecido e consentido pelo(a) paciente.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_encaminhamento_neurologico',
      title: 'Encaminhamento: Neurologia (TDAH / TEA / Funções Executivas)',
      category: 'Encaminhamentos',
      content: `ENCAMINHAMENTO PSICOLÓGICO CLÍNICO
(Em conformidade com a Resolução CFP nº 06/2019 e Código de Ética Profissional)

1. DESTINATÁRIO:
Ao(À) Médico(a) Neurologista / Neuropediatra

2. IDENTIFICAÇÃO DO(A) PACIENTE:
Nome: {paciente}
CPF: {cpf}

3. PROFISSIONAL EMISSOR(A):
Psicólogo(a): {psicologo} • Registro: CRP nº {crp}

4. MOTIVO DO ENCAMINHAMENTO:
Encaminho o(a) paciente para avaliação especializada com foco em investigação das funções atencionais, controle inibitório e funções executivas.

5. SINTOMATOLOGIA OBSERVADA:
Durante as sessões clínicas e análise comportamental, observou-se padrão recorrente de desatenção sustentada, desorganização no cotidiano, impulsividade verbal/motora, oscilação de rendimento cognitivo e sobrecarga sensorial.

Hipótese diagnóstica para investigação: Rastreio de Transtorno de Déficit de Atenção e Hiperatividade - TDAH (CID-10: F90 / CID-11: 6A05) ou investigação do Espectro Autista (TEA).

6. SOLICITAÇÃO:
Solicito criteriosa avaliação neurológica e realização de exames complementares para confirmação diagnóstica e eventual alinhamento medicamentoso/neurocognitivo.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_encaminhamento_psicopedagogico',
      title: 'Encaminhamento: Psicopedagogia (Dificuldades Escolares)',
      category: 'Encaminhamentos',
      content: `ENCAMINHAMENTO PSICOLÓGICO CLÍNICO
(Em conformidade com a Resolução CFP nº 06/2019 e Código de Ética Profissional)

1. DESTINATÁRIO:
Ao(À) Especialista em Psicopedagogia / Coordenação Pedagógica

2. IDENTIFICAÇÃO DO(A) PACIENTE:
Nome: {paciente}
CPF: {cpf}

3. PROFISSIONAL EMISSOR(A):
Psicólogo(a): {psicologo} • Registro: CRP nº {crp}

4. MOTIVO DO ENCAMINHAMENTO:
Investigação e intervenção especializada para superação de dificuldades no processo de aprendizagem, leitura e raciocínio lógico-matemático.

5. HISTÓRICO E SINTOMATOLOGIA:
No contexto do atendimento clínico, evidenciaram-se queixas frequentes de bloqueio atencional em ambiente escolar, lentificação na aquisição da escrita/leitura, sentimentos de inadequação e baixa autoeficácia acadêmica.

6. SOLICITAÇÃO:
Encaminho para avaliação psicopedagógica formal, desenvolvimento de plano de tutoria/estudo personalizado e alinhamento com a equipe escolar.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_encaminhamento_nutricional',
      title: 'Encaminhamento: Nutrição (Comportamento Alimentar)',
      category: 'Encaminhamentos',
      content: `ENCAMINHAMENTO PSICOLÓGICO CLÍNICO
(Em conformidade com a Resolução CFP nº 06/2019 e Código de Ética Profissional)

1. DESTINATÁRIO:
Ao(À) Nutricionista Clínico(a) / Especialista em Comportamento Alimentar

2. IDENTIFICAÇÃO DO(A) PACIENTE:
Nome: {paciente}
CPF: {cpf}

3. PROFISSIONAL EMISSOR(A):
Psicólogo(a): {psicologo} • Registro: CRP nº {crp}

4. MOTIVO DO ENCAMINHAMENTO:
Acompanhamento nutricional especializado e reeducação da relação com a alimentação e autoimagem.

5. SINTOMATOLOGIA:
Identificou-se padrão recorrente de comer emocional, episódios de compulsão alimentar seguidos de culpa intensa, alternância com restrições severas e distorções cognitivas sobre a percepção corporal.

6. SOLICITAÇÃO:
Encaminho para elaboração de plano alimentar flexível, com abordagem sem dietas punitivas, trabalhando em consonância com a reestruturação cognitiva das crenças nucleares.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_encaminhamento_fonoaudiologico',
      title: 'Encaminhamento: Fonoaudiologia (Comunicação / PAC)',
      category: 'Encaminhamentos',
      content: `ENCAMINHAMENTO PSICOLÓGICO CLÍNICO
(Em conformidade com a Resolução CFP nº 06/2019 e Código de Ética Profissional)

1. DESTINATÁRIO:
Ao(À) Fonoaudiólogo(a) Clínico(a)

2. IDENTIFICAÇÃO DO(A) PACIENTE:
Nome: {paciente}
CPF: {cpf}

3. PROFISSIONAL EMISSOR(A):
Psicólogo(a): {psicologo} • Registro: CRP nº {crp}

4. MOTIVO DO ENCAMINHAMENTO:
Avaliação fonoaudiológica e triagem de Processamento Auditivo Central (PAC) e comunicação verbal.

5. SINTOMATOLOGIA:
Constatou-se insegurança comunicativa, trocas fonêmicas ocasionais, queixa de dificuldade de compreensão em ambientes ruidosos e reflexos na socialização.

6. SOLICITAÇÃO:
Solicito avaliação fonoaudiológica detalhada e conduta terapêutica correspondente para fortalecimento da comunicação e redução da ansiedade social associada.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_encaminhamento_multidisciplinar',
      title: 'Encaminhamento: Equipe Multidisciplinar / Interdisciplinar',
      category: 'Encaminhamentos',
      content: `ENCAMINHAMENTO INTERDISCIPLINAR EM SAÚDE
(Em conformidade com a Resolução CFP nº 06/2019 e Código de Ética Profissional)

1. DESTINATÁRIO:
Aos Cuidados do(a) Profissional Especialista / Equipe Interdisciplinar

2. IDENTIFICAÇÃO DO(A) PACIENTE:
Nome: {paciente}
CPF: {cpf}

3. PROFISSIONAL EMISSOR(A):
Psicólogo(a): {psicologo} • Registro: CRP nº {crp}

4. HISTÓRICO E MOTIVO DO ENCAMINHAMENTO:
O(A) paciente encontra-se em acompanhamento psicoterápico regular. Com o objetivo de proporcionar uma intervenção global e integrada à sua saúde e desenvolvimento, faz-se indicada a avaliação especializada complementar.

5. DIRETRIZES DA INTERVENÇÃO CONJUNTA:
Encaminho para avaliação especializada em sua área de atuação e desenvolvimento de plano terapêutico/pedagógico correspondente, colocando-me à disposição para troca de informações e alinhamento de condutas.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },

    // 3. ATESTADOS E DECLARAÇÕES (CFP 06/2019)
    {
      id: 'template_atestado_afastamento',
      title: 'Atestado Psicológico: Afastamento / Repouso (CFP 06/2019)',
      category: 'Atestados e Declarações',
      content: `ATESTADO PSICOLÓGICO
(Em conformidade com a Resolução CFP nº 06/2019)

Atesto, para os devidos fins de direito e comprovação de saúde, que o(a) paciente {paciente}, portador(a) do CPF nº {cpf}, encontra-se sob meus cuidados profissionais em acompanhamento psicoterápico clínico.

Em decorrência de quadro reativo de estresse agudo e sintomatologia de ansiedade que demandam repouso e reestruturação emocional, recomendo o afastamento temporário de suas atividades rotineiras/laborais pelo período de 5 (cinco) dias a contar desta data.

(Informação sobre hipótese diagnóstica omitida em resguardo ao sigilo profissional, salvo autorização prévia e expressa do paciente nos termos da Resolução CFP 06/2019).

Por ser a expressão técnica e ética da verdade, firmo o presente documento.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_atestado_comparecimento',
      title: 'Atestado de Comparecimento do Paciente em Sessão',
      category: 'Atestados e Declarações',
      content: `ATESTADO DE COMPARECIMENTO EM SESSÃO PSICOLÓGICA

Atesto para os devidos fins de justificativa que o(a) paciente {paciente}, inscrito(a) sob o CPF nº {cpf}, compareceu e participou de sessão de psicoterapia clínica individual no dia de hoje, no horário agendado de 50 minutos.

O referido documento é emitido a pedido do(a) próprio(a) paciente para fins de comprovação.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_declaracao_presenca_pais',
      title: 'Declaração de Presença de Acompanhante / Pais',
      category: 'Atestados e Declarações',
      content: `DECLARAÇÃO DE PRESENÇA DE ACOMPANHANTE / PAIS

Declaro para os devidos fins de comprovação e justificativa que o(a) responsável compareceu neste consultório de psicologia clínica no dia de hoje, acompanhando o(a) paciente {paciente} (CPF: {cpf}) durante o atendimento terapêutico e orientação parental.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_de_declaracao',
      title: 'Declaração de Acompanhamento Psicoterápico',
      category: 'Atestados e Declarações',
      content: `DECLARAÇÃO PSICOLÓGICA DE SEGUIMENTO CLÍNICO

Declaro para os devidos fins de comprovação que o(a) paciente {paciente}, inscrito(a) sob CPF nº {cpf}, realiza acompanhamento psicoterápico sob meus cuidados profissionais neste consultório, mantendo frequência regular e compromisso com o processo terapêutico.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },

    // 4. CONTRATOS E TERMOS ÉTICOS
    {
      id: 'template_contrato_terapeutico',
      title: 'Contrato Terapêutico e Enquadre Clínico (Adulto)',
      category: 'Contratos e Termos',
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOLÓGICOS E ENQUADRE CLÍNICO

Pelo presente instrumento particular, de um lado:
PROFISSIONAL: {psicologo}, Psicólogo(a) Clínico(a), inscrito(a) no CRP sob o nº {crp}.
PACIENTE: {paciente}, inscrito(a) no CPF sob o nº {cpf}.

As partes acordam as seguintes cláusulas de enquadre terapêutico:

CLÁUSULA 1ª - DO OBJETO E ABORDAGEM
O presente contrato tem como objeto a prestação de serviços de psicoterapia clínica individual, visando o autoconhecimento, regulação emocional e desenvolvimento da saúde mental.

CLÁUSULA 2ª - DO SIGILO PROFISSIONAL E LGPD
Todas as informações compartilhadas em sessão são protegidas por sigilo profissional irrestrito, em conformidade com o Código de Ética Profissional do Psicólogo e a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

CLÁUSULA 3ª - DA DURAÇÃO E FREQUÊNCIA DAS SESSÕES
As sessões têm duração de 50 (cinquenta) minutos, realizadas em dia e horário previamente acordados, em frequência semanal ou quinzenal.

CLÁUSULA 4ª - DOS HONORÁRIOS E FORMA DE PAGAMENTO
O valor do investimento por sessão é previamente pactuado entre as partes, com pagamento a ser realizado por transferência Pix ou depósito até o dia acordado de cada mês.

CLÁUSULA 5ª - DAS DESMARCAÇÕES E FALTAS
Desmarcações devem ser comunicadas com antecedência mínima de 24 (vinte e quatro) horas para possibilidade de reposição conforme disponibilidade da agenda. Sessões desmarcadas sem aviso prévio ou faltas sem justificativa médica serão faturadas normalmente.

CLÁUSULA 6ª - DO ENCERRAMENTO E ALTA TERAPÊUTICA
O processo terapêutico pode ser finalizado por qualquer das partes, recomendando-se a realização de uma sessão de encerramento e fechamento clínico.

Por estarem de pleno acordo com os termos, firmam o presente enquadre.

{cidade}, {data}.

___________________________________          ___________________________________
{psicologo}                                    {paciente}
CRP nº {crp}                                   Paciente`
    },
    {
      id: 'template_contrato_infantil',
      title: 'Contrato Terapêutico Infantojuvenil (com Pais/Responsáveis)',
      category: 'Contratos e Termos',
      content: `CONTRATO TERAPÊUTICO INFANTOJUVENIL E ACORDO COM OS PAIS / RESPONSÁVEIS

PROFISSIONAL: {psicologo}, CRP nº {crp}
PACIENTE (CRIANÇA/ADOLESCENTE): {paciente}
CPF DO PACIENTE: {cpf}

1. ENQUADRE DO ATENDIMENTO CLÍNICO
O atendimento infantojuvenil envolve sessões com a criança/adolescente e sessões periódicas de devolutiva e orientação com os pais ou responsáveis legais.

2. SIGILO E ESPAÇO DA CRIANÇA
O espaço terapêutico da criança é resguardado pelo sigilo ético. Detalhes das brincadeiras, desenhos e narrativas são confidenciais, compartilhando-se com os responsáveis as diretrizes de desenvolvimento, manejo comportamental e impressões clínicas gerais.

3. PONTUALIDADE E FREQUÊNCIA
A regularidade nas sessões é fundamental para o vínculo e eficácia do tratamento. Faltas devem ser comunicadas com 24h de antecedência.

{cidade}, {data}.

___________________________________________________________
Assinatura dos Pais / Responsáveis Legais`
    },
    {
      id: 'template_contrato_telepsicologia',
      title: 'Contrato de Telepsicologia / Atendimento Online (CFP 11/2018)',
      category: 'Contratos e Termos',
      content: `TERMO E CONTRATO DE ATENDIMENTO ONLINE (TELEPSICOLOGIA)
(Em conformidade com a Resolução CFP nº 11/2018)

PROFISSIONAL: {psicologo} • Registro: CRP nº {crp} • Cadastro e-Psi Ativo
PACIENTE: {paciente} • CPF: {cpf}

1. PLATAFORMA E CONEXÃO
Os atendimentos ocorrem por videochamada em plataforma com criptografia de ponta a ponta. É dever do(a) paciente garantir ambiente privado, livre de interrupções e com fones de ouvido.

2. VEDAÇÃO DE GRAVAÇÕES NÃO AUTORIZADAS
É expressamente proibida a gravação em áudio, vídeo ou transcrição de qualquer sessão por qualquer das partes sem autorização mútua prévia por escrito.

3. CONTATO DE EMERGÊNCIA
Em caso de instabilidade grave de conexão ou crise durante o atendimento remoto, fica estabelecido canal de contato de emergência.

{cidade}, {data}.

___________________________________          ___________________________________
{psicologo}                                    {paciente}
CRP nº {crp}                                   Paciente`
    },
    {
      id: 'template_tcle',
      title: 'Termo de Consentimento Livre e Esclarecido (TCLE & LGPD)',
      category: 'Contratos e Termos',
      content: `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE & LGPD)

Eu, {paciente}, inscrito(a) sob o CPF nº {cpf}, declaro que recebi e compreendi todas as informações sobre os objetivos, métodos, sigilo ético e funcionamento do processo psicoterápico conduzido por {psicologo} (CRP nº {crp}).

Fui informado(a) e dou minha expressa anuência sobre:
1. A abordagem clínica adotada para as necessidades de cuidado mental.
2. O caráter de confidencialidade estrita, conforme preconiza o Código de Ética Profissional do Psicólogo e a Lei Geral de Proteção de Dados (LGPD).
3. A frequência estabelecida e as normas acordadas sobre reposições, agendamentos e cancelamentos de horários.

{cidade}, {data}.

___________________________________________________________
Assinatura do(a) Paciente`
    },
    {
      id: 'template_termo_gravacao_copiloto',
      title: 'Termo de Autorização para Gravação e Copiloto de IA',
      category: 'Contratos e Termos',
      content: `TERMO DE AUTORIZAÇÃO PARA GRAVAÇÃO DE ÁUDIO E USO DE COPILOTO CLÍNICO

Paciente: {paciente} • CPF: {cpf}
Psicólogo(a): {psicologo} • Registro: CRP nº {crp}

Autorizo o(a) profissional acima a utilizar ferramentas de gravação de áudio e inteligência artificial clínica assistiva durante as sessões psicoterápicas, estritamente para fins de transcrição, apoio na elaboração de prontuários clínicos e organização das anotações de evolução.

Fui informado(a) de que:
- Os áudios e transcrições são de uso exclusivo do(a) psicólogo(a) e protegidos por sigilo profissional.
- Nenhuma informação é divulgada ou comercializada a terceiros.
- Posso revogar esta autorização a qualquer momento.

{cidade}, {data}.

___________________________________________________________
Assinatura do(a) Paciente`
    },
    {
      id: 'template_notificacao_faltas',
      title: 'Notificação de Desligamento / Encerramento Clínico',
      category: 'Contratos e Termos',
      content: `NOTIFICAÇÃO DE ENCERRAMENTO E DESLIGAMENTO CLÍNICO

Prezado(a) {paciente},

Entramos em contato referente ao seu processo de psicoterapia clínica sob os cuidados de {psicologo} (CRP nº {crp}).

Tendo em vista a ausência de comparecimento às últimas sessões agendadas sem retorno às tentativas de contato e reagendamento, comunicamos o encerramento formal do acompanhamento e a liberação do respectivo horário na agenda profissional.

Ressaltamos a importância da continuidade dos cuidados com sua saúde mental e permanecemos à disposição caso deseje retomar o processo terapêutico em momento futuro oportuno.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },

    // 5. FINANCEIRO E CONVÊNIOS
    {
      id: 'template_pedido_reembolso',
      title: 'Declaração para Pedido de Reembolso ao Convênio / Plano',
      category: 'Financeiro e Convênios',
      content: `DECLARAÇÃO DE TRATAMENTO PSICOLÓGICO E PEDIDO DE REEMBOLSO

À Diretoria de Assistência Médica e Reembolso
Operadora do Seguro Saúde / Convênio do Paciente

Prezados Senhores,

Por meio da presente, venho atestar que o(a) paciente beneficiário(a) {paciente}, portador(a) do CPF nº {cpf}, realiza tratamento psicoterápico de acompanhamento regular em meu consultório profissional.

Dados do tratamento para fins de cobertura e reembolso:
- Psicólogo(a) Assistente: {psicologo}, Registro: CRP nº {crp}.
- Frequência: Sessões clínicas individuais com duração de 50 minutos.
- Os pagamentos dos honorários profissionais foram devidamente liquidados.

Salienta-se que o atendimento psicológico encontra plena pertinência nas garantias normativas de reembolso e direito de cobertura de saúde suplementar.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_recibo_simples',
      title: 'Recibo de Honorários Profissionais de Consulta',
      category: 'Financeiro e Convênios',
      content: `RECIBO DE HONORÁRIOS PROFISSIONAIS

Recebi do(a) paciente {paciente}, inscrito(a) sob o CPF nº {cpf}, o valor total de honorários correspondente aos serviços especializados de atendimento em Psicoterapia Clínica Geral.

Referência técnica: Sessão clínica de acompanhamento e suporte.

Pelo recebimento, dou ao pagador plena e geral quitação.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    },
    {
      id: 'template_solicitacao_credenciamento',
      title: 'Solicitação de Credenciamento a Operadora de Saúde',
      category: 'Financeiro e Convênios',
      content: `SOLICITAÇÃO FORMAL DE CREDENCIAMENTO PROFISSIONAL EM OPERADORA DE SAÚDE

À Diretoria de Cadastro, Expansão de Rede Credenciada e Parcerias Assistenciais.

Assunto: Proposta para Credenciamento Profissional em Serviços de Psicologia Clínica

Apresento-me frente a este prestigiado plano de saúde, manifestando meu pleno interesse em figurar de forma ativa na rede qualificada de psicólogos cooperados na localidade de {cidade}.

DADOS DO PROFISSIONAL EMISSOR:
- Nome Completo: {psicologo}
- Conselho Regional: CRP nº {crp}
- Estrutura de atendimento: Consultório climatizado e adequado às normas sanitárias vigentes, além de infraestrutura para telepsicologia em conformidade com o CFP.

Coloco-me à inteira disposição para envio de documentações adicionais e certidões solicitadas de praxe.

{cidade}, {data}.

___________________________________________________________
{psicologo}
Psicólogo(a) Clínico(a) • CRP nº {crp}`
    }
  ];

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() => {
    const saved = localStorage.getItem('clinic_user_custom_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CustomTemplate[];
        const merged = [...parsed];
        defaultCustomTemplates.forEach(def => {
          if (!merged.some(m => m.id === def.id)) {
            merged.push(def);
          }
        });
        return merged;
      } catch (e) {
        return defaultCustomTemplates;
      }
    }
    return defaultCustomTemplates;
  });

  const [selectedCustomTemplateId, setSelectedCustomTemplateId] = useState<string>(() => {
    return customTemplates[0]?.id || '';
  });

  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('Todos');
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');
  const [templateActionToast, setTemplateActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setTemplateActionToast(msg);
    setTimeout(() => {
      setTemplateActionToast(null);
    }, 3000);
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const original = customTemplates.find(t => t.id === templateId);
    if (!original) return;
    const newId = `custom_copy_${Date.now()}`;
    const duplicated: CustomTemplate = {
      id: newId,
      title: `${original.title} (Cópia Personalizada)`,
      category: original.category || 'Personalizados',
      content: original.content
    };
    const updated = [duplicated, ...customTemplates];
    setCustomTemplates(updated);
    setSelectedCustomTemplateId(newId);
    showToast('Modelo duplicado com sucesso! Agora você pode editá-lo livremente.');
  };

  const handleRestoreBaseTemplates = () => {
    const existingIds = new Set(customTemplates.map(t => t.id));
    let addedCount = 0;
    const merged = [...customTemplates];
    
    defaultCustomTemplates.forEach(def => {
      if (!existingIds.has(def.id)) {
        merged.push(def);
        addedCount++;
      }
    });

    setCustomTemplates(merged);
    showToast(addedCount > 0 ? `${addedCount} modelos base restaurados!` : 'Todos os modelos base já estão na sua lista.');
  };

  const handleResetAllToFactory = () => {
    if (confirm("Atenção: Isso redefinirá todos os modelos de documentos para a versão original padrão de fábrica. Deseja continuar?")) {
      setCustomTemplates(defaultCustomTemplates);
      setSelectedCustomTemplateId(defaultCustomTemplates[0]?.id || '');
      showToast('Modelos redefinidos com sucesso para a versão oficial!');
    }
  };

  const handleExportTemplatesJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customTemplates, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `meus_modelos_clinicos_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Backup dos modelos exportado em JSON com sucesso!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCurrentDocAsCustomModel = () => {
    const docTitle = getDocumentCategoryTitle();
    const docContent = getDocumentContent();
    const newId = `custom_from_doc_${Date.now()}`;
    const newTemplate: CustomTemplate = {
      id: newId,
      title: `${docTitle} - Modelo Editável`,
      category: 'Personalizados',
      content: docContent
    };
    const updated = [newTemplate, ...customTemplates];
    setCustomTemplates(updated);
    setSelectedCustomTemplateId(newId);
    setActiveTab('meus_modelos');
    showToast(`"${docTitle}" salvo na aba "Meus Modelos" para personalização!`);
  };

  const [isImporting, setIsImporting] = useState<boolean>(false);

  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          resolve(pdfjsLib);
        } else {
          reject(new Error('Biblioteca PDF.js não disponível após o carregamento do script.'));
        }
      };
      script.onerror = () => reject(new Error('Erro ao carregar renderizador PDF.js'));
      document.head.appendChild(script);
    });
  };

  const parsePdfFile = async (file: File) => {
    setIsImporting(true);
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];
        
        if (!items || items.length === 0) continue;
        
        let pageText = '';
        let lastY = -1;
        let lastX = -1;
        let lastHeight = 12;
        
        for (const item of items) {
          if (!item.str || !item.transform) continue;
          
          const x = item.transform[4];
          const y = item.transform[5];
          const height = item.height || Math.abs(item.transform[3]) || 12;
          
          if (lastY === -1) {
            pageText += item.str;
          } else {
            // PDF coordinates: (0,0) is bottom-left, so going down lowers y.
            const verticalDiff = lastY - y; // positive if moving down
            
            if (verticalDiff > height * 0.8) {
              // Started a new line
              if (verticalDiff > height * 1.8) {
                // Large vertical gap -> new paragraph
                pageText += '\n\n' + item.str;
              } else {
                // Standard new line
                pageText += '\n' + item.str;
              }
            } else if (verticalDiff < -15) {
              // Drastic jump up (could be structural columns or multi-section layout)
              pageText += '\n\n' + item.str;
            } else {
              // Same horizontal line. Add a space only if there is a gap and no touch-up sequence.
              const horizontalGap = x - (lastX + (item.width || 0));
              if (horizontalGap > 2 && !pageText.endsWith(' ') && !item.str.startsWith(' ')) {
                pageText += ' ' + item.str;
              } else {
                pageText += item.str;
              }
            }
          }
          
          lastY = y;
          lastX = x;
          lastHeight = height;
        }
        
        fullText += pageText.trim() + '\n\n';
      }
      
      if (!fullText.trim()) {
        throw new Error("Não foi possível extrair nenhum texto legível deste PDF. Certifique-se de que não é uma imagem digitalizada.");
      }
      
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const newId = `custom_template_${Date.now()}`;
      const newTemplate: CustomTemplate = {
        id: newId,
        title: fileNameWithoutExt,
        content: fullText.trim()
      };
      const updated = [...customTemplates, newTemplate];
      setCustomTemplates(updated);
      setSelectedCustomTemplateId(newId);
      localStorage.setItem('clinic_user_custom_templates', JSON.stringify(updated));
    } catch (error: any) {
      console.error("Erro ao importar PDF:", error);
      alert(error.message || "Erro ao processar o arquivo PDF. Garanta que o PDF é de formato de texto legível.");
    } finally {
      setIsImporting(false);
    }
  };

  // Specific contextual document variables
  const [representativeName, setRepresentativeName] = useState<string>('');
  const [representativeCpf, setRepresentativeCpf] = useState<string>('');
  const [representativeRg, setRepresentativeRg] = useState<string>('');
  
  const [sessionValue, setSessionValue] = useState<string>('150,00');
  const [sessionsCount, setSessionsCount] = useState<number>(4);
  const [sessionDatesString, setSessionDatesString] = useState<string>('Todas as quartas-feiras do mês corrente');

  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('14:50');
  const [customDate, setCustomDate] = useState<string>(new Date().toLocaleDateString('pt-BR'));

  // Clinical Documents specific properties (Laudo, Atestado, Credenciamento, Reembolso)
  const [laudoSolicitante, setLaudoSolicitante] = useState<string>('Autodeclarado / Escolar');
  const [laudoFinalidade, setLaudoFinalidade] = useState<string>('Avaliação diagnóstica cognitiva para suporte psicopedagógico preliminar.');
  const [laudoDemanda, setLaudoDemanda] = useState<string>('Paciente apresenta histórico de desatenção, angústia severa frente às avaliações e sintomas somáticos de ansiedade escolar.');
  const [laudoAnalise, setLaudoAnalise] = useState<string>('Durante as sessões analíticas e aplicação de tarefas, evidenciou-se alto índice de cobrança pessoal, bloqueio de raciocínio lógico sob estresse agudo e maturidade emocional compatível.');
  const [laudoConclusao, setLaudoConclusao] = useState<string>('Recomenda-se adaptação de tempo de exame, suporte de tutoria individualizada e continuidade dos cuidados psicoterápicos semanais.');

  const [atestadoDias, setAtestadoDias] = useState<string>('5');
  const [atestadoMotivo, setAtestadoMotivo] = useState<string>('Necessidade de afastamento temporário de atividades laborais em decorrência de estresse pós-traumático de intensidade severa (CID 10: F43.1). (Autorizado pelo paciente).');

  // Encaminhamento specific properties & presets (CFP 06/2019)
  type EncaminhamentoPresetKey = 'psiquiatria' | 'neurologia' | 'psicopedagogia' | 'nutricao' | 'fonoaudiologia' | 'clinica_geral' | 'personalizado';

  const ENCAMINHAMENTO_PRESETS: Record<EncaminhamentoPresetKey, {
    label: string;
    icon: string;
    destinatario: string;
    motivo: string;
    historico: string;
    hipoteses: string;
    solicitacao: string;
  }> = {
    psiquiatria: {
      label: 'Psiquiatria (Avaliação Medicamentosa)',
      icon: '🧠',
      destinatario: 'Ao(À) Médico(a) Psiquiatra',
      motivo: 'Avaliação clínica especializada com foco em suporte psicofarmacológico para manejo de sintomas de ansiedade aguda e oscilação tímica.',
      historico: 'O(A) paciente realiza acompanhamento psicoterápico sob meus cuidados. No decurso dos atendimentos, constatou-se a presença de sintomas de ansiedade aguda com manifestações somáticas (taquicardia, tensão muscular, insônia inicial) e episódios de desânimo acentuado com prejuízo funcional em suas atividades cotidianas e laborais.',
      hipoteses: 'Sintomatologia compatível com Transtorno de Ansiedade Generalizada (CID-10: F41.1) e Episódio Depressivo Moderado (CID-10: F32.1).',
      solicitacao: 'Encaminho o(a) paciente para avaliação psiquiátrica especializada, diagnóstico diferencial e eventual introdução/ajuste medicamentoso, colocando-me à inteira disposição para discussão e acompanhamento interdisciplinar do caso clínico.'
    },
    neurologia: {
      label: 'Neurologia / TDAH / TEA',
      icon: '⚡',
      destinatario: 'Ao(À) Médico(a) Neurologista / Neuropediatra',
      motivo: 'Avaliação especializada para investigação de funções atencionais, controle inibitório, funções executivas e neurodesenvolvimento.',
      historico: 'Durante as sessões clínicas e análise comportamental, observou-se padrão persistente de desatenção, desorganização na rotina diária, impulsividade, hiperfoco intercalado com desmotivação, sobrecarga sensorial e impacto significativo no rendimento acadêmico/profissional.',
      hipoteses: 'Investigação clínica para Transtorno de Déficit de Atenção e Hiperatividade - TDAH (CID-10: F90 / CID-11: 6A05) ou investigação do Transtorno do Espectro Autista (TEA).',
      solicitacao: 'Solicito avaliação neurológica aprofundada e realização de exames complementares para confirmação diagnóstica e eventual alinhamento medicamentoso/neurocognitivo.'
    },
    psicopedagogia: {
      label: 'Psicopedagogia (Dificuldades Escolares)',
      icon: '📚',
      destinatario: 'Ao(À) Especialista em Psicopedagogia / Coordenação Pedagógica',
      motivo: 'Investigação e intervenção especializada para superação de dificuldades no processo de aprendizagem, leitura e raciocínio lógico-matemático.',
      historico: 'No contexto do atendimento clínico, evidenciaram-se queixas frequentes de bloqueio atencional em ambiente escolar, lentificação na aquisição da escrita/leitura, sentimentos de inadequação e baixa autoeficácia acadêmica.',
      hipoteses: 'Dificuldade específica de aprendizagem e necessidade de estratégias pedagógicas individualizadas de estimulação cognitiva.',
      solicitacao: 'Encaminho para avaliação psicopedagógica formal, desenvolvimento de plano de tutoria/estudo personalizado e alinhamento com a equipe escolar.'
    },
    nutricao: {
      label: 'Nutrição (Comportamento Alimentar)',
      icon: '🥗',
      destinatario: 'Ao(À) Nutricionista Clínico(a) / Especialista em Comportamento Alimentar',
      motivo: 'Acompanhamento nutricional especializado e reeducação da relação com a alimentação e autoimagem.',
      historico: 'Identificou-se padrão recorrente de comer emocional, episódios de compulsão alimentar seguidos de culpa intensa, alternância com restrições severas e distorções cognitivas sobre a percepção corporal.',
      hipoteses: 'Comportamento alimentar desadaptativo com características de Transtorno de Compulsão Alimentar (CID-10: F50.8) / Relação disfuncional com a comida.',
      solicitacao: 'Encaminho para elaboração de plano alimentar flexível, com abordagem sem dietas punitivas, trabalhando em consonância com a reestruturação cognitiva das crenças nucleares.'
    },
    fonoaudiologia: {
      label: 'Fonoaudiologia (Comunicação / PAC)',
      icon: '🗣️',
      destinatario: 'Ao(À) Fonoaudiólogo(a) Clínico(a)',
      motivo: 'Avaliação fonoaudiológica e triagem de Processamento Auditivo Central (PAC) e comunicação verbal.',
      historico: 'Constatou-se insegurança comunicativa, trocas fonêmicas ocasionais, queixa de dificuldade de compreensão em ambientes ruidosos e reflexos na socialização.',
      hipoteses: 'Necessidade de investigação do processamento auditivo central e intervenção na expressividade verbal.',
      solicitacao: 'Solicito avaliação fonoaudiológica detalhada e conduta terapêutica correspondente para fortalecimento da comunicação e redução da ansiedade social associada.'
    },
    clinica_geral: {
      label: 'Clínica Geral (Rastreio Orgânico)',
      icon: '🩺',
      destinatario: 'Ao(À) Médico(a) Clínico(a) Geral',
      motivo: 'Investigação de causas orgânicas e metabólicas subjacentes a queixas de fadiga crônica, palpitações e alterações do sono.',
      historico: 'O(A) paciente relata cansaço extremo constante, desânimo, queixas somáticas difusas e oscilações do padrão de sono e apetite sem causa aparente evidente.',
      hipoteses: 'Necessidade de rastreio clínico geral (tireoide, dosagens hormonais, vitaminas D/B12, ferro, hemograma) para diagnóstico diferencial com quadros depressivos/ansiosos.',
      solicitacao: 'Solicito propedêutica clínica e exames laboratoriais pertinentes para afastar etiologias orgânicas.'
    },
    personalizado: {
      label: 'Especialidade Personalizada',
      icon: '✨',
      destinatario: 'Aos Cuidados do(a) Profissional de Saúde',
      motivo: 'Encaminhamento interdisciplinar para avaliação e conduta especializada.',
      historico: 'O(A) paciente encontra-se em acompanhamento psicoterápico regular, apresentando demandas que se beneficiarão de suporte especializado conjunto.',
      hipoteses: 'Avaliação clínica complementar necessária.',
      solicitacao: 'Encaminho o(a) paciente para sua criteriosa avaliação e conduta profissional, mantendo-me à disposição para comunicação interdisciplinar.'
    }
  };

  const [encaminhamentoPreset, setEncaminhamentoPreset] = useState<EncaminhamentoPresetKey>('psiquiatria');
  const [encaminhamentoDestinatario, setEncaminhamentoDestinatario] = useState<string>('Ao(À) Médico(a) Psiquiatra');
  const [encaminhamentoMotivo, setEncaminhamentoMotivo] = useState<string>('Avaliação clínica especializada com foco em suporte psicofarmacológico para manejo de sintomas de ansiedade aguda e oscilação tímica.');
  const [encaminhamentoHistorico, setEncaminhamentoHistorico] = useState<string>('O(A) paciente realiza acompanhamento psicoterápico sob meus cuidados. No decurso dos atendimentos, constatou-se a presença de sintomas de ansiedade aguda com manifestações somáticas (taquicardia, tensão muscular, insônia inicial) e episódios de desânimo acentuado com prejuízo funcional em suas atividades cotidianas e laborais.');
  const [encaminhamentoHipoteses, setEncaminhamentoHipoteses] = useState<string>('Sintomatologia compatível com Transtorno de Ansiedade Generalizada (CID-10: F41.1) e Episódio Depressivo Moderado (CID-10: F32.1).');
  const [encaminhamentoSolicitacao, setEncaminhamentoSolicitacao] = useState<string>('Encaminho o(a) paciente para avaliação psiquiátrica especializada, diagnóstico diferencial e eventual introdução/ajuste medicamentoso, colocando-me à inteira disposição para discussão e acompanhamento interdisciplinar do caso clínico.');

  const [reembolsoMes, setReembolsoMes] = useState<string>('Junho de 2026');
  const [reembolsoPrecoTotal, setReembolsoPrecoTotal] = useState<string>('600,00');

  const [credenciamentoEspecialidades, setCredenciamentoEspecialidades] = useState<string>('Terapia Cognitivo-Comportamental (TCC), Psicologia do Desenvolvimento Infantil, Atendimento a Crises de Ansiedade e Burnout.');
  const [credenciamentoContato, setCredenciamentoContato] = useState<string>('(11) 98765-4321');
  const [credenciamentoEmail, setCredenciamentoEmail] = useState<string>('flavia.barros.psicologia@gmail.com');

  // Custom generic note for templates
  const [customNotes, setCustomNotes] = useState<string>('');

  // UI Feedback States
  const [copiedState, setCopiedState] = useState<boolean>(false);
  const [copiedQuestions, setCopiedQuestions] = useState<{ [key: string]: boolean }>({});

  // Google Docs Integration States
  const [isCreatingGoogleDoc, setIsCreatingGoogleDoc] = useState<boolean>(false);
  const [googleDocUrl, setGoogleDocUrl] = useState<string | null>(null);
  const [googleDocError, setGoogleDocError] = useState<string | null>(null);

  // Synchronize psychologist settings when profile prop loads or changes
  useEffect(() => {
    if (profile) {
      if (profile.name) {
        setPsychologistName(profile.name);
      }
      if (profile.crp && profile.crp !== "Configurar CRP") {
        setPsychologistCrp(profile.crp);
      }
      if (profile.email) {
        setCredenciamentoEmail(profile.email);
      }
      if (profile.specialties && profile.specialties !== "Preencha as suas especialidades nas configurações do perfil") {
        setCredenciamentoEspecialidades(profile.specialties);
      }
    }
  }, [profile]);

  // Synchronize patient data when selectedPatientId changes
  useEffect(() => {
    if (selectedPatientId) {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      if (selectedPatient) {
        setPatientCpf(selectedPatient.cpf || '');
      }
    } else {
      setPatientCpf('');
    }
  }, [selectedPatientId, patients]);

  // Persist customized inputs natively in local storage
  useEffect(() => {
    localStorage.setItem('clinic_psychologist_name', psychologistName);
  }, [psychologistName]);

  useEffect(() => {
    localStorage.setItem('clinic_psychologist_crp', psychologistCrp);
  }, [psychologistCrp]);

  useEffect(() => {
    localStorage.setItem('clinic_consultation_city', consultationCity);
  }, [consultationCity]);

  useEffect(() => {
    localStorage.setItem('clinic_custom_footer', customFooter);
  }, [customFooter]);

  useEffect(() => {
    localStorage.setItem('clinic_show_header_name', String(showHeaderName));
  }, [showHeaderName]);

  useEffect(() => {
    localStorage.setItem('clinic_include_header', String(includeHeader));
  }, [includeHeader]);

  useEffect(() => {
    localStorage.setItem('clinic_include_footer', String(includeFooter));
  }, [includeFooter]);

  useEffect(() => {
    localStorage.setItem('clinic_include_sign_box', String(includeSignBox));
  }, [includeSignBox]);

  useEffect(() => {
    localStorage.setItem('clinic_watermark_size', String(watermarkSize));
  }, [watermarkSize]);

  useEffect(() => {
    localStorage.setItem('clinic_watermark_opacity', String(watermarkOpacity));
  }, [watermarkOpacity]);

  useEffect(() => {
    localStorage.setItem('clinic_user_custom_templates', JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Sync active patient defaults automatically
  const activePatientName = patients.find(p => p.id === selectedPatientId)?.name || '';

  // Standard Anamnese questions templates
  const anamneseTemplates = {
    infantil: {
      title: "Anamnese Clínica Infantil",
      subtitle: "Indicado para crianças de 0 a 11 anos, com coleta de dados estendida aos pais ou responsáveis tutoriais.",
      icon: <Baby className="w-5 h-5 text-indigo-600" />,
      sections: [
        {
          id: "inf_s1",
          category: "1. Identificação Geral & Queixa Principal",
          questions: [
            "Quem detém a guarda legal da criança e quem acompanha nas sessões?",
            "Qual o motivo original e urgência do encaminhamento (escola, pediatra, etc.)?",
            "Como a queixa principal se manifesta no dia a dia da criança?",
            "Quais as percepções individuais de cada responsável sobre os sintomas colocados?"
          ]
        },
        {
          id: "inf_s2",
          category: "2. Histórico Gestacional e Parto",
          questions: [
            "A gravidez foi planejada? Como foi o estado emocional da mãe durante o processo?",
            "Houve uso de medicações, tabaco, álcool ou intercorrências clínicas (pressão, sangramentos)?",
            "Como ocorreu o parto (normal, cesárea)? Houve sofrimento fetal ou necessidade de UTI?",
            "Como foi a transição para a amamentação? Peso e comprimento na alta hospitalar."
          ]
        },
        {
          id: "inf_s3",
          category: "3. Etapas de Desenvolvimento Neuropsicomotor",
          questions: [
            "Com que idade a criança sustentou a cabeça, sentou e engatinhou de forma espontânea?",
            "Com que idade começou a dar os primeiros passos sem apoio estendido?",
            "Como se deu o balbucio e o aparecimento das primeiras palavras?",
            "Como ocorreu e em que idade se concluiu o desfralde (diurno e noturno)?"
          ]
        },
        {
          id: "inf_s4",
          category: "4. Sono, Alimentação e Autonomia",
          questions: [
            "A criança dorme sozinha no próprio quarto? Qual a rotina e média de horas?",
            "O sono é contínuo ou há despertares, pesadelos recorrentes ou terror noturno?",
            "Como é o apetite? Apresenta sinais de seletividade alimentar severa ou recusa?",
            "A criança já realiza tarefas básicas sozinha (escovar dentes, vestir roupas simples)?"
          ]
        }
      ]
    },
    adolescente: {
      title: "Anamnese Clínica de Adolescentes",
      subtitle: "Foco no desenvolvimento identitário, dinâmicas de transição, socialização e expressão de autonomia.",
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      sections: [
        {
          id: "ado_s1",
          category: "1. Demanda Atual e Visão Própria",
          questions: [
            "Como o próprio adolescente define o motivo de estar na terapia?",
            "O adolescente veio de livre e espontânea vontade ou por exigência externa?",
            "Como ele enxerga suas principais dificuldades individuais no momento?",
            "Quais são seus objetivos e expectativas com os atendimentos clínicos?"
          ]
        },
        {
          id: "ado_s2",
          category: "2. Dinâmica e Comunicação Familiar",
          questions: [
            "Como o adolescente descreve o relacionamento com a mãe, pai ou cuidadores primários?",
            "Como são as regras domésticas de disciplina e o nível de privacidade permitido?",
            "Como a família reage diante de desentendimentos ou tomada de decisões coletivas?",
            "Ocorreram mudanças estruturais marcantes na família nos últimos tempos (separação, luto, mudanças)?"
          ]
        },
        {
          id: "ado_s3",
          category: "3. Relações Sociais e Ambiente Escolar",
          questions: [
            "Como é o rendimento na escola e qual a atitude do jovem sobre os estudos?",
            "O adolescente possui um grupo ativo de amigos ou apresenta sinais de isolamento?",
            "Existem episódios ou queixas de bullying (vítima ou praticante)?",
            "Como ele se sente em relação à aceitação social pelos pares?"
          ]
        }
      ]
    },
    adulto: {
      title: "Anamnese Clínica de Adultos",
      subtitle: "Avaliação abrangente e estruturada de histórico de vida, funcionamento laboral, relações e saúde mental geral.",
      icon: <User className="w-5 h-5 text-emerald-600" />,
      sections: [
        {
          id: "adu_s1",
          category: "1. Motivo da Consulta e Demanda",
          questions: [
            "Qual a queixa inicial principal que motivou a busca por psicoterapia neste momento?",
            "Quando começaram os sintomas ou desconfortos? Há fatores de gatilho nítidos?",
            "De que forma os problemas atuais impactam as esferas social, familiar e amorosa?",
            "Já realizou tratamentos psicoterápicos ou psiquiátricos antes? Como foi a experiência?"
          ]
        },
        {
          id: "adu_s2",
          category: "2. Histórico Pessoal e História de Vida",
          questions: [
            "Como o paciente descreve sua infância e dinâmica com os pais?",
            "Houve divórcios, mortes precoces ou eventos altamente traumáticos no ambiente inicial?",
            "Como o paciente percebe que o seu passado moldou suas atitudes atuais?",
            "Quais são os principais valores pessoais que ele prioriza na vida adulta?"
          ]
        },
        {
          id: "adu_s3",
          category: "3. Carreira, Finanças e Funcionamento Laboral",
          questions: [
            "Qual a ocupação profissional atual e o nível de satisfação em relação a ela?",
            "O trabalho é percebido como uma fonte crônica de estresse ou cansaço (burnout)?",
            "Como é o relacionamento interpessoal com colegas e superiores no ambiente de trabalho?",
            "Há instabilidade financeira agindo como fator estressor recorrente?"
          ]
        }
      ]
    },
    idoso: {
      title: "Anamnese Clínica de Idosos",
      subtitle: "Voltada para avaliação de processos de envelhecimento ativo, rastreio cognitivo, perdas, luto e rede de suporte.",
      icon: <HeartHandshake className="w-5 h-5 text-amber-600" />,
      sections: [
        {
          id: "ido_s1",
          category: "1. Queixa Principal e Cognição",
          questions: [
            "Quem solicitou este acompanhamento (iniciativa própria, filhos, geriatra)?",
            "O paciente relata falhas frequentes de memória antiga ou recente?",
            "O idoso apresenta episódios de desorientação temporal ou espacial?",
            "Como ele descreve o seu nível atual de energia e vontade para realizar novas atividades?"
          ]
        },
        {
          id: "ido_s2",
          category: "2. Saúde Física e Polifarmácia",
          questions: [
            "Quais são os principais diagnósticos médicos (pressão, diabetes, artrose, Alzheimer)?",
            "Quais medicamentos o paciente usa diariamente? (Rastrear riscos de interação medicamentosa).",
            "Houve ocorrência de quedas físicas ou instabilidade na marcha nos últimos 12 meses?",
            "Apresenta queixas físicas persistentes (dores, tremores, rigidez articular)?"
          ]
        },
        {
          id: "ido_s3",
          category: "3. Funcionalidade e Nível de Autonomia",
          questions: [
            "O paciente necessita de auxílio para tarefas básicas (vestir-se, banhar-se, alimentar-se)?",
            "Ele consegue gerenciar suas próprias finanças e tomar suas medicações de forma autônoma?",
            "Como é o padrão de mobilidade (sai sozinho de casa, usa bengala, necessita de cadeiras)?",
            "Quem é o cuidador principal (se houver) e como é a relação com ele?"
          ]
        }
      ]
    }
  };

  const getDocumentCategoryTitle = () => {
    switch (activeTab) {
      case 'anamnese':
        return `Anamnese ${selectedSubAnamnese === 'infantil' ? 'Infantil' : selectedSubAnamnese === 'adolescente' ? 'Adolescente' : selectedSubAnamnese === 'adulto' ? 'Adulto' : 'Idoso'}`;
      case 'contratos':
        return 'Contrato';
      case 'recibos':
        return 'Recibo de Honorários';
      case 'termos':
        return 'Termo de Consentimento';
      case 'presenca':
        return 'Declaração de Comparecimento';
      case 'laudos':
        return 'Laudo Psicológico';
      case 'atestado':
        return 'Atestado Psicológico';
      case 'encaminhamento':
        return 'Encaminhamento Psicológico';
      case 'reembolso':
        return 'Pedido de Reembolso';
      case 'credenciamento':
        return 'Credenciamento de Plano';
      case 'meus_modelos': {
        const currentTmp = customTemplates.find(t => t.id === selectedCustomTemplateId);
        return currentTmp ? currentTmp.title : 'Modelo Personalizado';
      }
      default:
        return 'Documento Clínico';
    }
  };

  // Helper functions to get current formatted texts for dynamic rendering
  const getDocumentContent = () => {
    const formattedPatient = activePatientName || '[Nome do Paciente]';
    const formattedCpf = patientCpf || '[CPF do Paciente]';
    const formattedRep = representativeName || '[Nome do Responsável]';
    const formattedRepCpf = representativeCpf || '[CPF do Responsável]';
    const formattedRepRg = representativeRg || '[RG do Responsável]';

    switch (activeTab) {
      case 'anamnese': {
        const item = anamneseTemplates[selectedSubAnamnese];
        let text = `--- ${item.title.toUpperCase()} ---\n`;
        text += `${item.subtitle}\n`;
        text += `Paciente Selecionado: ${formattedPatient}\n`;
        if (customNotes) text += `Anotações Especiais: ${customNotes}\n`;
        text += `\n=============================================\n\n`;

        item.sections.forEach(s => {
          text += `[${s.category}]\n`;
          s.questions.forEach((q, idx) => {
            const answerKey = `${selectedSubAnamnese}_${s.id}_q${idx}`;
            const answer = anamneseAnswers[answerKey] || '';
            text += `  Q${idx + 1}: ${q}\n  R: ${answer ? answer : '_____________________________________'}\n\n`;
          });
        });
        return text;
      }

      case 'contratos':
        return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOLÓGICOS CLÍNICOS

Por este instrumento particular de contrato de prestação de serviços intelectuais, de um lado:

CONTRATANTE: ${formattedPatient}, portador(a) do CPF nº ${formattedCpf} (doravante denominado CONTRATANTE).
${representativeName ? `REPRESENTANTE LEGAL: ${formattedRep}, portador(a) do CPF nº ${formattedRepCpf} e RG nº ${formattedRepRg}, respondendo civilmente e moralmente pelo paciente menor de idade.\n` : ''}
CONTRATADO(A): ${psychologistName}, devidamente inscrito(a) sob o registro CRP nº ${psychologistCrp} (doravante denominado CONTRATADO).

As partes identificadas celebram o presente contrato sob as cláusulas acordadas adiante descritas:

CLÁUSULA PRIMEIRA - DO OBJETO E ESPECIFICAÇÕES DOS SERVIÇOS
O presente contrato de prestação de serviços psicológicos consiste na realização de psicoterapia individual clínica, com sessões com duração de 50 minutos cada.

CLÁUSULA SEGUNDA - DA AGENDA E FREQUÊNCIA
As sessões serão agendadas com regularidade acordada de antemão, ocorrendo preferencialmente conforme indicação técnica de ${sessionDatesString}.

CLÁUSULA TERCEIRA - DOS HONORÁRIOS E DAS FORMAS DE ACERTO
Pela realização do trabalho clínico integral, o CONTRATANTE efetuará o pagamento de R$ ${sessionValue} por sessão realizada, sob as seguintes regras acessórias de controle de honorários:
1. O acerto acumulado das sessões realizadas será ajustado mensalmente ou por blocos combinados.
2. Furtivas ausências não avisadas com antecedência mínima razoável de 24 horas serão faturadas e cobradas em sua integridade profissional.

CLÁUSULA QUARTA - DO SIGILO ÉTICO E CONFIDENCIALIDADE
A atuação do CONTRATADO regular-se-á segundo as premissas essenciais estabelecidas no Código de Ética Profissional dos Psicólogos do Brasil, garantindo-se assim a preservação do sigilo clínico irrestrito sobre todas as informações reveladas no decurso do processo psicoterápico.

CLÁUSULA QUINTA - VIGÊNCIA E RESCISÃO
Este contrato vigora por prazo indefinido enquanto se mantiver a necessidade diagnóstica. Ambas as partes podem optar pela rescisão consensual sem ônus de multa mediante comunicação amigável com prazo mínimo de uma semana para encerramento adequado da dinâmica clínica.

Por ser esta a plena expressão de concordância e entendimento de obrigações mútuas, afirmam as partes o presente pacto legal.

Local: _________________________________, Data: _____/_____/_________`;

      case 'recibos':
        return `RECIBO DE PAGAMENTO DE HONORÁRIOS DE PSICOLOGIA

Recebi do(a) Sr(a). ${formattedPatient}, portador(a) do CPF sob o nº ${formattedCpf}, a importância financeira de R$ ${sessionValue}, referente ao pagamento total correspondente à prestação de serviços psicológicos no formato de ${sessionsCount} sessões de psicoterapia, realizadas diligentemente em nosso consultório sob as datas e observações a seguir referidas:

DATAS DAS CONSULTAS DE REFERÊNCIA: ${sessionDatesString}

Para clareza e fins legais de comprovação de quitação regular e comprovação perante a utilidade tributária correspondente, emito o presente recibo.

Local: _________________________________, Data: _____/_____/_________`;

      case 'termos':
        return `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO PARA ATENDIMENTO DE MENOR

Eu, ${formattedRep || '[Nome Completo do Responsável Legal]'}, portador(a) do CPF nº ${formattedRepCpf || '_________________'} na qualidade genuína de legítimo representante legal do paciente menor de idade ${formattedPatient}, nascido(a) em ____/____/______, autorizo explicitamente e formalizo por meio deste documento o atendimento e acompanhamento clínico psicológico do menor sob a coordenação técnica de ${psychologistName}, CRP nº ${psychologistCrp}.

Desta forma, declaro-me amplamente cientificado sobre as seguintes diretrizes operacionais de atendimento a menores de idade:
1. O processo terapêutico ocorre no âmbito de ambiente privado e acolhedor, voltado puramente para a saúde e estabilização emocional da criança / do adolescente.
2. A preservação do segredo profissional é essencial no tratamento de menores, sendo garantido que as minúcias das confissões do menor não serão divulgadas fora do consultório médico e clínico, exceto em hipóteses críticas que ponham em severo perigo iminente a sua vida ou dignidade humana.
3. Sessões periódicas de orientação parental/familiar serão marcadas de comum acordo para que o psicólogo responsável compartilhe direcionamentos gerais de ambiente sobre a evolução do menor sem ferir o seu vínculo secreto protetivo de confiança no terapeuta.

Por estar ciente de todas as condições e termos normativos do Conselho Federal de Psicologia (CFP), assino o presente.

Local: _________________________________, Data: _____/_____/_________;

___________________________________________________________
Assinatura do Pai, Mãe ou Tutor Responsável legal`;

      case 'presenca':
        return `DECLARAÇÃO DE COMPARECIMENTO CLINICO

Declaro para os devidos fins legais, escolares ou a quem possa interessar que o(a) Sr(a). ${formattedPatient}, inscrito(a) sob portabilidade do documento CPF nº ${formattedCpf}, compareceu a sessão individual presencial/online de cuidados psicoterápicos na data de ____/____/_______.

Observou-se o comparecimento correspondente à consulta das ${startTime} horas às ${endTime} horas sob minha direta atuação assistencial de saúde.

Justifica-se, por meio desta, o seu afastamento para comparecimento exclusivamente referente ao horário marcado.

Local: _________________________________, Data: _____/_____/_________`;

      case 'laudos':
        return `LAUDO PSICOLÓGICO CLÍNICO
(Conforme as Normas da Resolução CFP nº 06/2019)

1. IDENTIFICAÇÃO DO PROCESSO
Emissor/Autor: ${psychologistName} (Inscrição Profissional Ativa CRP nº ${psychologistCrp})
Interessado: Realizado sob os dados clínicos de ${formattedPatient}
Solicitante: ${laudoSolicitante}
Finalidade de Emissão: ${laudoFinalidade}

2. ANÁLISE DOS MOTIVOS / DESCRIÇÃO DA DEMANDA
${laudoDemanda}

3. PROCEDIMENTOS TÉCNICOS EFETUADOS
O processo de investigação do caso estendeu-se por consultas terapêuticas repetidas de 50 minutos de escuta reflexiva profunda, exames de rotina, análise das narrativas clínicas correlatas do paciente e monitoramento ativo do comportamento em ambiente controlado de consultório.

4. ANÁLISE PSICOLÓGICA DAS FUNÇÕES MENTAIS
${laudoAnalise}

5. CONCLUSÃO TÉCNICA
Diante das manifestações comportamentais e cognitivas investigadas com zelo à ética, assevera-se o seguinte parecer profissional de conclusão:
${laudoConclusao}

Este documento não possui utilidade de caráter permanente, devendo as suas conclusões clínicas serem analisadas com reserva contextual.

Local: _________________________________, Data: _____/_____/_________`;

      case 'atestado':
        return `ATESTADO PSICOLÓGICO CLÍNICO
(Em conformidade com as Normas Éticas Ativas e Resolução CFP nº 06/2019)

Atesto, para a devida utilidade de saúde e de direito justificado de ausência, que o(a) paciente ${formattedPatient}, portador(a) do CPF nº ${formattedCpf}, encontra-se sob plano terapêutico ativo de acompanhamento psicológico individual regular de minha responsabilidade técnica.

Em razão de quadro reativo de estresse grave e de avaliações psicológicas conduzidas de forma cuidadosa que demandam absoluto repouso e reestruturação emocional de curto prazo, o(a) paciente acima necessita de um recolhimento temporário das atividades rotineiras por um intervalo oficial de ${atestadoDias} dias a partir da data de assinatura.

CONOTAÇÃO DE QUADRO DE SINTOMAS CLÍNICOS E MOTIVAÇÃO:
${atestadoMotivo}

Por ser a exata expressão técnica e confidencial da verdade, firmo este atestado de meu próprio punho.

Local: _________________________________, Data: _____/_____/_________`;

      case 'encaminhamento':
        return `ENCAMINHAMENTO PSICOLÓGICO CLÍNICO
(Em conformidade com a Resolução CFP nº 06/2019 e Código de Ética Profissional)

1. DESTINATÁRIO
${encaminhamentoDestinatario || 'Ao(À) Profissional Especialista'}

2. IDENTIFICAÇÃO DO(A) PACIENTE
Nome do(a) Paciente: ${formattedPatient}
CPF: ${formattedCpf}
${representativeName ? `Responsável Legal: ${formattedRep} (CPF: ${formattedRepCpf})\n` : ''}
3. IDENTIFICAÇÃO DO(A) EMISSOR(A)
Psicólogo(a) Responsável: ${psychologistName}
Registro Profissional: CRP nº ${psychologistCrp}
Local de Atendimento: ${consultationCity}

4. HISTÓRICO DO ACOMPANHAMENTO CLÍNICO
${encaminhamentoHistorico}

5. MOTIVO DO ENCAMINHAMENTO E HIPÓTESES DIAGNÓSTICAS
${encaminhamentoMotivo}
${encaminhamentoHipoteses ? `\nHipóteses Diagnósticas / Sintomatologia de Relevo:\n${encaminhamentoHipoteses}` : ''}

6. SOLICITAÇÃO E CONDUTA INTERDISCIPLINAR SUGERIDA
${encaminhamentoSolicitacao}

7. CONSIDERAÇÕES ÉTICAS E DE SIGILO PROFISSIONAL
O presente documento tem finalidade estritamente assistencial de cooperação em saúde multiprofissional. As informações aqui contidas foram previamente acordadas e autorizadas pelo(a) paciente (ou responsável legal), resguardando-se o sigilo profissional nos termos do Código de Ética do Psicólogo e da Lei Geral de Proteção de Dados (LGPD).

Coloco-me à disposição para contato direto e discussão interdisciplinar do caso clínico.

${consultationCity}, ${customDate || '_____/_____/_________'}.`;

      case 'reembolso':
        return `DECLARAÇÃO DE TRATAMENTO PSICOLÓGICO E PEDIDO DE REEMBOLSO COM DESTAQUE

À Diretoria de Assistência Médica e Reembolso
Operadora do Seguro Saúde / Convênio do Paciente

Prezados Senhores,

Por meio da presente, venho atestar e comprovar tecnicamente que o(a) paciente beneficiário(a) ${formattedPatient}, portador(a) do CPF nº ${formattedCpf}, realiza tratamento terapêutico de reabilitação psicológica regular e regularizado em meu consultório profissional.

Comprovamos com clareza as especificidades complementares operacionais do tratamento:
- Psicólogo(a) Assistente: ${psychologistName}, portador(a) do CRP nº ${psychologistCrp}.
- Frequência dos Atendimentos: Assistência continuada com ${sessionsCount} sessões clínicas de 50 minutos.
- Período correspondente faturado: Mês de ${reembolsoMes}.
- Investimento Financeiro Total Realizado: R$ ${reembolsoPrecoTotal} (referente aos pagamentos já liquidados integralmente).

Salienta-se que os cuidados e atendimentos em saúde descritos encontram inteira pertinência nas garantias normativas de reembolso e direito de cobertura do consumidor perante o plano de assistência sob indicação médica recomendada em anexo.

Sem mais para o momento, firmo a declaração.

Local: _________________________________, Data: _____/_____/_________`;

      case 'credenciamento':
        return `SOLICITAÇÃO FORMAL DE CREDENCIAMENTO PROFISSIONAL EM OPERADORA DE SAÚDE

À Diretoria de Cadastro, Expansão de Rede Credenciada e Parcerias Assistenciais.

Assunto: Proposta para Credenciamento Profissional em Serviços de Psicologia Clínica

Apresento-me frente a este prestigiado plano de saúde, manifestando meu pleno interesse em figurar de forma ativa na rede qualificada de psicólogos cooperados na localidade de ${consultationCity}.

Seguem abaixo as principais credenciais e habilidades para pronta apreciação cadastral:

DADOS DO PROFISSIONAL EMISSOR:
- Nome Completo: ${psychologistName}
- Conselho Regional: CRP nº ${psychologistCrp}
- Especialidades Clínicas e Diferenciais: ${credenciamentoEspecialidades}
- Contato Telefônico: ${credenciamentoContato}
- E-mail Corporativo de Atendimento: ${credenciamentoEmail}

Estrutura assistencial oferecida compreende consultório em localização privilegiada, integralmente em conformidade com as regras do corpo sanitário, dispondo de infraestrutura aconchegante para acolhimento de pacientes infantis, jovens, adultos e idosos, além de preceito de atendimento online em segurança.

Na expectativa de obtermos uma receptividade promissora para o enriquecimento da rede credenciada desta operadora, coloco-me à inteira disposição para envio de documentações adicionais e certidões solicitadas de praxe.

Cordialmente,

Local: _________________________________, Data: _____/_____/_________`;

      case 'meus_modelos': {
        const currentTmp = customTemplates.find(t => t.id === selectedCustomTemplateId);
        if (!currentTmp) return 'Nenhum modelo selecionado. Por favor, escolha ou crie um modelo na lista.';
        
        let text = currentTmp.content;
        
        // Auto-replace dynamic variables
        text = text.replace(/{paciente}/g, formattedPatient);
        text = text.replace(/{cpf}/g, formattedCpf);
        text = text.replace(/{psicologo}/g, psychologistName || '[Nome do Profissional]');
        text = text.replace(/{crp}/g, formatCrpDisplay(psychologistCrp));
        text = text.replace(/{data}/g, customDate || '_____/_____/_________');
        text = text.replace(/{cidade}/g, consultationCity || '___________________________');
        text = text.replace(/{rep_nome}/g, formattedRep || '[Nome do Responsável]');
        text = text.replace(/{rep_cpf}/g, formattedRepCpf || '[CPF do Responsável]');
        
        // Normalize any legacy/unwanted wording if present
        text = text.replace(/Inscrição Consular Regional de Psicologia:\s*CRP\s*(nº|n°)?/gi, 'Psicóloga Clínica: CRP');
        
        return text;
      }

      default:
        return '';
    }
  };

  // Helper to test if text itself already ends with a signature block
  const textHasSignature = (text: string) => {
    if (!text) return false;
    const lastChunk = text.slice(-400).toLowerCase();
    return lastChunk.includes(psychologistName.toLowerCase()) || 
           lastChunk.includes('crp') || 
           lastChunk.includes('psicólog') || 
           lastChunk.includes('psicolog');
  };

  const currentGeneratedText = getDocumentContent();

  const renderAbntParagraphs = (text: string, isPrint: boolean = false) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((p, index) => {
      let cleanLine = p.trim();
      if (!cleanLine) return null;
      
      // Auto-clean any legacy wording
      cleanLine = cleanLine.replace(/Inscrição Consular Regional de Psicologia:\s*CRP\s*(nº|n°)?/gi, 'Psicóloga Clínica: CRP');
      cleanLine = cleanLine.replace(/Psicólogo\(a\)\s+Clínico\(a\)\s+[•·-]\s+CRP\s*(nº|n°|:)?/gi, 'Psicóloga Clínica: CRP');
      cleanLine = cleanLine.replace(/Psicóloga\s+Clínica\s+[•·-]\s+CRP\s*(nº|n°|:)?/gi, 'Psicóloga Clínica: CRP');

      const isListItem = cleanLine.startsWith('-') || cleanLine.startsWith('*') || /^\d+\./.test(cleanLine);
      const isCenteredHeader = (cleanLine === cleanLine.toUpperCase() && cleanLine.length < 80) || cleanLine.startsWith('#');
      const isSignatureLine = cleanLine.includes('______') || cleanLine.includes(psychologistName);
      const isMetadataOrField = 
        /^(paciente|nome|idade|cpf|rg|respons[aá]vel|data|nascimento|endere[cç]o|telefone|contato|encaminhamento|solicitante|finalidade|diagn[oó]stico|assunto|ref|local|emissor|autor|interessado|profissional|registro|psic[oó]log[oa]|t[ií]tulo)/i.test(cleanLine) ||
        cleanLine.split('\n').some(l => /^(paciente|nome|idade|cpf|rg|respons[aá]vel|data|endere[cç]o|telefone|solicitante|finalidade):/i.test(l.trim()));
      const isDateLocationLine = /^[A-Za-zÀ-ÿ\s]+,\s*(\d{1,2}\s+de\s+[A-Za-zÀ-ÿ]+\s+de\s+\d{4}|\d{2}\/\d{2}\/\d{4}|_{2,})/i.test(cleanLine);
      
      const pStyle: CSSProperties = {
        textAlign: (isMetadataOrField || isListItem) ? 'left' : 'justify',
        lineHeight: '1.5',
        fontSize: isPrint ? '12pt' : '12px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        marginBottom: '14px',
        textIndent: (isListItem || isCenteredHeader || isSignatureLine || isMetadataOrField || isDateLocationLine) ? '0' : '1.25cm',
        whiteSpace: 'pre-line',
        wordBreak: 'break-word'
      };

      if (isCenteredHeader) {
        pStyle.textAlign = 'center';
        pStyle.fontWeight = 'bold';
      } else if (isSignatureLine) {
        pStyle.textAlign = 'center';
      } else if (isDateLocationLine) {
        pStyle.textAlign = 'right';
      }

      return (
        <p key={index} style={pStyle}>
          {cleanLine}
        </p>
      );
    });
  };

  const handleCopyFullText = () => {
    navigator.clipboard.writeText(currentGeneratedText).then(() => {
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    });
  };

  const handleCopySingleAnamneseSection = (sectionId: string, sectionTitle: string, questions: string[]) => {
    let text = `[${sectionTitle}]\n`;
    questions.forEach((q, i) => {
      text += `${i + 1}. ${q}\n`;
    });
    navigator.clipboard.writeText(text).then(() => {
      setCopiedQuestions(prev => ({ ...prev, [sectionId]: true }));
      setTimeout(() => {
        setCopiedQuestions(prev => ({ ...prev, [sectionId]: false }));
      }, 2000);
    });
  };

  // Download HTML print-ready file helper (robust fallback for sandboxed iframe browser limit)
  const handleDownloadHtmlPrint = () => {
    const printContent = document.getElementById('printable-area-hidden')?.innerHTML;
    if (!printContent) return;
    
    const headerTitle = getDocumentCategoryTitle();
    const documentTitle = `${headerTitle} - ${patients.find(p => p.id === selectedPatientId)?.name || 'Paciente'}`;
    
    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle}</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: Arial, Helvetica, sans-serif;
    }
    @media screen {
      body {
        display: flex;
        justify-content: center;
        padding: 24px 0;
      }
      .page-sheet {
        background: white;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }
    }
    @media print {
      body {
        background-color: white;
        padding: 0;
        margin: 0;
      }
      .page-sheet {
        box-shadow: none;
        border-radius: 0;
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
    }
    .btn-print {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background-color: #0f172a;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      z-index: 99999;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-print:hover {
      background-color: #1e293b;
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <button class="btn-print no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <div class="page-sheet">
    ${printContent}
  </div>
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_pronto_para_pdf.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Modern print function with instant on-demand target replacement 
  const handlePrintDocument = () => {
    // Detect sandboxed iframe where print() is restricted by browser security policies
    const isSandboxIframe = window.self !== window.top;
    if (isSandboxIframe) {
      setShowSandboxPrintWarning(true);
      return;
    }

    try {
      const printContent = document.getElementById('printable-area-hidden')?.innerHTML;
      if (!printContent) return;
      
      // Create an iframe to print cleanly without messing up React state or causing page reload
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Imprimir Documento</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      width: 210mm;
      font-family: Arial, Helvetica, sans-serif;
    }
  </style>
</head>
<body style="margin:0;padding:0;">
  ${printContent}
</body>
</html>`);
        iframeDoc.close();
        
        // Wait for image loading (like customLogo) inside iframe
        const images = iframeDoc.getElementsByTagName('img');
        let loadedImagesCount = 0;
        const totalImages = images.length;
        
        const triggerPrint = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch (err) {
              console.error("Sub-iframe print error:", err);
              window.print();
            }
            // Remove iframe shortly after printing launches
            setTimeout(() => {
              if (iframe.parentNode) {
                document.body.removeChild(iframe);
              }
            }, 1500);
          }, 300);
        };
        
        if (totalImages === 0) {
          triggerPrint();
        } else {
          for (let i = 0; i < totalImages; i++) {
            images[i].onload = () => {
              loadedImagesCount++;
              if (loadedImagesCount === totalImages) {
                triggerPrint();
              }
            };
            images[i].onerror = () => {
              loadedImagesCount++;
              if (loadedImagesCount === totalImages) {
                triggerPrint();
              }
            };
            // If cached already
            if (images[i].complete) {
              // Manually invoke onload
              const loadEvent = new Event('load');
              images[i].dispatchEvent(loadEvent);
            }
          }
        }
      } else {
        window.print();
      }
    } catch (e) {
      console.error("Erro no fluxo do sub-iframe de impressão:", e);
      window.print();
    }
  };

  const handleDownloadWord = () => {
    const headerTitle = getDocumentCategoryTitle();
    const documentTitle = `${headerTitle} - ${patients.find(p => p.id === selectedPatientId)?.name || 'Paciente'}`;
    
    let logoBase64 = '';
    let logoMime = 'image/png';
    let hasLogo = false;
    
    if (customLogo) {
      const match = customLogo.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        logoMime = match[1];
        logoBase64 = match[2];
        hasLogo = true;
      } else if (customLogo.startsWith('data:')) {
        const parts = customLogo.split(';base64,');
        if (parts.length === 2) {
          logoMime = parts[0].replace('data:', '');
          logoBase64 = parts[1];
          hasLogo = true;
        }
      } else {
        logoBase64 = customLogo;
        hasLogo = true;
      }
    }

    const boundary = '----=_NextPart_000_0001_01D1A234.A5B6C7D8';
    let wordContent = '';

    if (hasLogo) {
      wordContent = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"
Content-Location: file:///document.html

<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${documentTitle}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #111111;
      position: relative;
    }
    @page {
      margin-top: 3.0cm;
      margin-left: 3.0cm;
      margin-right: 2.0cm;
      margin-bottom: 2.0cm;
    }
    h1, h2, h3, h4 {
      color: #1a1a1a;
    }
    .header-box {
      border-bottom: 2px solid #000000;
      padding-bottom: 12px;
      margin-bottom: 25px;
    }
    .main-text {
      margin-top: 25px;
      position: relative;
      z-index: 2;
    }
    .signature-box {
      margin-top: 50px;
      text-align: center;
      position: relative;
      z-index: 2;
    }
    .footer-box {
      margin-top: 50px;
      border-top: 1px dashed #cccccc;
      padding-top: 15px;
      font-size: 8.5pt;
      color: #6b7280;
      text-align: center;
      position: relative;
      z-index: 2;
    }
  </style>
</head>
<body>
  ${useLogoAsWatermark ? `
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; min-height: 850px; z-index: -1000; opacity: ${watermarkOpacity}; filter: alpha(opacity=${watermarkOpacity * 100}); text-align: center; vertical-align: middle; pointer-events: none; display: table;">
    <div style="display: table-cell; vertical-align: middle; text-align: center; width: 100%; height: 100%;">
      <img src="logo_image.png" style="width: ${watermarkSize}px; max-width: 80%; max-height: 80%; object-fit: contain; opacity: ${watermarkOpacity}; filter: alpha(opacity=${watermarkOpacity * 100}); margin: 0 auto; display: inline-block; vertical-align: middle;" />
    </div>
  </div>
  ` : ''}

  ${includeHeader ? `
  <div class="header-box" style="text-align: center; border-bottom: 2px solid #000000; padding-bottom: 12px; margin-bottom: 25px; position: relative; z-index: 2;">
    <div style="text-align: center; margin-bottom: 10px;"><img src="logo_image.png" alt="Logo Cabeçalho" style="max-height: 90px; max-width: 220px;" /></div>
    ${showHeaderName ? `
    <div style="text-align: center; font-family: Arial, sans-serif;">
      <p style="margin: 0; font-size: 12pt; font-weight: bold; text-transform: uppercase; color: #111111; letter-spacing: 1px;">${psychologistName}</p>
      <p style="margin: 3px 0 0 0; font-size: 8.5pt; color: #555555; font-weight: bold; text-transform: uppercase;">Psicóloga Clínica • CRP ${psychologistCrp}</p>
    </div>
    ` : ''}
  </div>
  ` : ''}
  
  <div class="main-text">
    ${(() => {
      const paragraphs = currentGeneratedText.split(/\n\n+/);
      return paragraphs.map(p => {
        const cleanLine = p.trim();
        if (!cleanLine) return '';
        
        const isListItem = cleanLine.startsWith('-') || cleanLine.startsWith('*') || /^\d+\./.test(cleanLine);
        const isCenteredHeader = (cleanLine === cleanLine.toUpperCase() && cleanLine.length < 80) || cleanLine.startsWith('#');
        const isSignatureLine = cleanLine.includes('______') || cleanLine.includes(psychologistName);
        const isMetadataOrField = 
          /^(paciente|nome|idade|cpf|rg|respons[aá]vel|data|nascimento|endere[cç]o|telefone|contato|encaminhamento|solicitante|finalidade|diagn[oó]stico|assunto|ref|local|emissor|autor|interessado|profissional|registro|psic[oó]log[oa]|t[ií]tulo)/i.test(cleanLine) ||
          cleanLine.split('\n').some(l => /^(paciente|nome|idade|cpf|rg|respons[aá]vel|data|endere[cç]o|telefone|solicitante|finalidade):/i.test(l.trim()));
        const isDateLocationLine = /^[A-Za-zÀ-ÿ\s]+,\s*(\d{1,2}\s+de\s+[A-Za-zÀ-ÿ]+\s+de\s+\d{4}|\d{2}\/\d{2}\/\d{4}|_{2,})/i.test(cleanLine);
        
        let pStyle = 'font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; text-align: justify; margin-bottom: 12pt; word-break: break-word;';
        if (isCenteredHeader) {
          pStyle += ' text-align: center; font-weight: bold; text-indent: 0;';
        } else if (isSignatureLine) {
          pStyle += ' text-align: center; text-indent: 0;';
        } else if (isDateLocationLine) {
          pStyle += ' text-align: right; text-indent: 0;';
        } else if (isListItem || isMetadataOrField) {
          pStyle += ' text-align: left; text-indent: 0;';
        } else {
          pStyle += ' text-indent: 1.25cm;';
        }

        return `<p style="${pStyle}">${cleanLine.replace(/\n/g, '<br/>')}</p>`;
      }).join('\n');
    })()}
  </div>
  
  ${includeSignBox && !textHasSignature(currentGeneratedText) ? `
  <br/><br/>
  <div class="signature-box" style="margin-top: 35px; text-align: center; font-family: Arial, sans-serif;">
    <div style="width: 280px; margin: 0 auto 6px auto; border-top: 1px solid #111111;"></div>
    <p style="margin: 0; font-weight: bold; font-size: 11pt;">${psychologistName}</p>
    <p style="margin: 2px 0 0 0; font-size: 9pt; color: #444444;">Psicóloga Clínica: CRP ${formatCrpDisplay(psychologistCrp)}</p>
  </div>
  ` : ''}
  
  ${includeFooter ? `
  <div class="footer-box" style="margin-top: 50px; border-top: 1px dashed #cccccc; padding-top: 15px; position: relative; z-index: 2;">
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td width="120" valign="middle">
          <img src="logo_image.png" alt="Logo Footer" style="max-height: 35px; max-width: 120px;" />
        </td>
        <td align="${customLogo ? 'right' : 'center'}" valign="middle" style="font-size: 8.5pt; color: #6b7280; padding-left: 15px;">
          ${customFooter ? customFooter.replace(/\n/g, '<br/>') : 'Confidencial • Protegido conforme Lei Geral de Proteção de Dados (LGPD) e Código de Ética Profissional do CFP.<br/>Gerado no Portal Clínico ' + psychologistName + ' (Inscrição CRP: ' + psychologistCrp + ')'}
        </td>
      </tr>
    </table>
  </div>
  ` : ''}
</body>
</html>

--${boundary}
Content-Type: ${logoMime}
Content-Transfer-Encoding: base64
Content-Location: logo_image.png

${logoBase64}

--${boundary}--`;
    } else {
      wordContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>${documentTitle}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #111111;
            }
            @page {
              margin-top: 3.0cm;
              margin-left: 3.0cm;
              margin-right: 2.0cm;
              margin-bottom: 2.0cm;
            }
            h1, h2, h3, h4 {
              color: #1a1a1a;
            }
            .header-box {
              border-bottom: 2px solid #000000;
              padding-bottom: 12px;
              margin-bottom: 25px;
            }
            .main-text {
              margin-top: 25px;
            }
            .signature-box {
              margin-top: 50px;
              text-align: center;
            }
            .footer-box {
              margin-top: 50px;
              border-top: 1px dashed #cccccc;
              padding-top: 15px;
              font-size: 8.5pt;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          ${includeHeader ? `
          <div class="header-box" style="text-align: center; border-bottom: 2px solid #000000; padding-bottom: 12px; margin-bottom: 25px;">
            ${showHeaderName ? `
            <div style="text-align: center; font-family: Arial, sans-serif;">
              <p style="margin: 0; font-size: 12pt; font-weight: bold; text-transform: uppercase; color: #111111; letter-spacing: 1px;">${psychologistName}</p>
              <p style="margin: 3px 0 0 0; font-size: 8.5pt; color: #555555; font-weight: bold; text-transform: uppercase;">Psicóloga Clínica • CRP ${psychologistCrp}</p>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="main-text">
            ${(() => {
              const paragraphs = currentGeneratedText.split(/\n\n+/);
              return paragraphs.map(p => {
                const cleanLine = p.trim();
                if (!cleanLine) return '';
                
                const isListItem = cleanLine.startsWith('-') || cleanLine.startsWith('*') || /^\d+\./.test(cleanLine);
                const isCenteredHeader = (cleanLine === cleanLine.toUpperCase() && cleanLine.length < 80) || cleanLine.startsWith('#');
                const isSignatureLine = cleanLine.includes('______') || cleanLine.includes(psychologistName);
                const isMetadataOrField = 
                  /^(paciente|nome|idade|cpf|rg|respons[aá]vel|data|nascimento|endere[cç]o|telefone|contato|encaminhamento|solicitante|finalidade|diagn[oó]stico|assunto|ref|local|emissor|autor|interessado|profissional|registro|psic[oó]log[oa]|t[ií]tulo)/i.test(cleanLine) ||
                  cleanLine.split('\n').some(l => /^(paciente|nome|idade|cpf|rg|respons[aá]vel|data|endere[cç]o|telefone|solicitante|finalidade):/i.test(l.trim()));
                const isDateLocationLine = /^[A-Za-zÀ-ÿ\s]+,\s*(\d{1,2}\s+de\s+[A-Za-zÀ-ÿ]+\s+de\s+\d{4}|\d{2}\/\d{2}\/\d{4}|_{2,})/i.test(cleanLine);
                
                let pStyle = 'font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; text-align: justify; margin-bottom: 12pt; word-break: break-word;';
                if (isCenteredHeader) {
                  pStyle += ' text-align: center; font-weight: bold; text-indent: 0;';
                } else if (isSignatureLine) {
                  pStyle += ' text-align: center; text-indent: 0;';
                } else if (isDateLocationLine) {
                  pStyle += ' text-align: right; text-indent: 0;';
                } else if (isListItem || isMetadataOrField) {
                  pStyle += ' text-align: left; text-indent: 0;';
                } else {
                  pStyle += ' text-indent: 1.25cm;';
                }

                return `<p style="${pStyle}">${cleanLine.replace(/\n/g, '<br/>')}</p>`;
              }).join('\n');
            })()}
          </div>
          
          ${includeSignBox && !textHasSignature(currentGeneratedText) ? `
          <br/><br/>
          <div class="signature-box" style="margin-top: 35px; text-align: center; font-family: Arial, sans-serif;">
            <div style="width: 280px; margin: 0 auto 6px auto; border-top: 1px solid #111111;"></div>
            <p style="margin: 0; font-weight: bold; font-size: 11pt;">${psychologistName}</p>
            <p style="margin: 2px 0 0 0; font-size: 9pt; color: #444444;">Psicóloga Clínica: CRP ${formatCrpDisplay(psychologistCrp)}</p>
          </div>
          ` : ''}
          
          ${includeFooter ? `
          <div class="footer-box" style="margin-top: 50px; border-top: 1px dashed #cccccc; padding-top: 15px;">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" valign="middle" style="font-size: 8.5pt; color: #6b7280;">
                  ${customFooter ? customFooter.replace(/\n/g, '<br/>') : 'Confidencial • Emitido sob o Código de Ética do CFP e de acordo com a LGPD.'}
                </td>
              </tr>
            </table>
          </div>
          ` : ''}
        </body>
        </html>
      `;
    }
    
    const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleDoc = async () => {
    setIsCreatingGoogleDoc(true);
    setGoogleDocError(null);
    try {
      const headerTitle = getDocumentCategoryTitle();
      const documentTitle = `${headerTitle} - ${patients.find(p => p.id === selectedPatientId)?.name || 'Paciente'}`;
      const contentText = getDocumentContent();
      
      const docUrl = await createGoogleDoc(documentTitle, contentText, {
        includeHeader,
        showHeaderName,
        psychologistName,
        psychologistCrp,
        customLogo,
        includeSignBox,
        includeFooter,
        customFooter
      });
      setGoogleDocUrl(docUrl);
      window.open(docUrl, '_blank');
    } catch (err: any) {
      console.error("Erro ao criar documento no Google Docs:", err);
      setGoogleDocError(err.message || 'Erro desconhecido ao abrir no Google Docs.');
    } finally {
      setIsCreatingGoogleDoc(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12 select-none" id="document-templates-view-main">
      
      {/* Title Header with Modern Concept Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Repositório e Gestor de Termos
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Modelos de Documentos Clínicos</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Modelos de anamneses, contratos éticos, solicitações de credenciamentos de planos de saúde, atestados e recibos rápidos.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={handleCopyFullText}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedState 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              {copiedState ? (
                <><Check className="w-4 h-4 animate-pulse" /> Copiado com Sucesso!</>
              ) : (
                <><ClipboardCopy className="w-4 h-4" /> Copiar Documento Pronto</>
              )}
            </button>

            <button
              onClick={handleDownloadWord}
              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Baixar documento em formato Word editável (.doc)"
            >
              <Download className="w-4 h-4 text-blue-600 animate-bounce" />
              <span>Baixar Word (.doc)</span>
            </button>

            <button
              onClick={handlePrintDocument}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm animate-pulse"
              title="Salvar ou Imprimir como PDF oficial"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Salvar PDF / Imprimir</span>
            </button>

            <button
              onClick={handleOpenGoogleDoc}
              disabled={isCreatingGoogleDoc}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isCreatingGoogleDoc
                  ? 'bg-amber-100 text-amber-800 border border-amber-200 cursor-not-allowed animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700'
              }`}
              title="Criar e abrir este documento diretamente no Google Docs"
            >
              <ExternalLink className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>{isCreatingGoogleDoc ? 'Criando Doc...' : 'Abrir no Google Docs'}</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold italic text-right max-w-xs md:max-w-md hidden sm:block">
            💡 Como baixar em PDF: clique em <b>"Salvar PDF / Imprimir"</b> e mude o Destino para <b>"Salvar como PDF"</b>.
          </span>
          {googleDocError && (
            <div className="mt-1.5 p-2 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded-lg text-right max-w-sm ml-auto animate-pulse">
              ⚠️ {googleDocError}
            </div>
          )}
          {googleDocUrl && !googleDocError && (
            <div className="mt-1.5 p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-lg text-right max-w-sm ml-auto flex items-center justify-end gap-1.5">
              <span>✅ Documento criado no Google Drive!</span>
              <a href={googleDocUrl} target="_blank" rel="noreferrer" className="underline hover:text-emerald-950">Acessar Google Docs ↗</a>
            </div>
          )}
        </div>
      </div>

      {/* Main Container Layout: Sidebar (Categories) + Interactive Customizer Form + Real-time Letterhead Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* COL 1: Document Categories Menu Selector */}
        <div className="xl:col-span-3 space-y-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">Menu de Modelos</h3>
          
          <nav className="space-y-1.5" id="modelos-menu-list">
            
            {/* Category: Anamnese Group */}
            <button
              onClick={() => setActiveTab('anamnese')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'anamnese'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Entrevistas Anamneses</span>
            </button>

            {/* Category: Contratos */}
            <button
              onClick={() => setActiveTab('contratos')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'contratos'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <FileSignature className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Contrato de Serviços</span>
            </button>

            {/* Category: Termos Consentimento Menores */}
            <button
              onClick={() => setActiveTab('termos')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'termos'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Consentimento Menor</span>
            </button>

            {/* Category: Recibos */}
            <button
              onClick={() => setActiveTab('recibos')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'recibos'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Coins className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Recibos Honorários</span>
            </button>

            {/* Category: Declaracao Presenca */}
            <button
              onClick={() => setActiveTab('presenca')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'presenca'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <CalendarDays className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Declaração Presença</span>
            </button>

            {/* Category: Laudos */}
            <button
              onClick={() => setActiveTab('laudos')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'laudos'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Landmark className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Laudo Psicológico</span>
            </button>

            {/* Category: Atestados */}
            <button
              onClick={() => setActiveTab('atestado')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'atestado'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Atestado Terapp</span>
            </button>

            {/* Category: Encaminhamento */}
            <button
              id="tab-btn-encaminhamento"
              onClick={() => setActiveTab('encaminhamento')}
              className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'encaminhamento'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 shrink-0 text-indigo-600" />
                <span>Encaminhamento</span>
              </div>
              <span className="px-1.5 py-0.5 text-[8.5px] bg-indigo-100 text-indigo-700 rounded-md font-extrabold uppercase">CFP</span>
            </button>

            {/* Category: Reembolso de Convenios */}
            <button
              onClick={() => setActiveTab('reembolso')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'reembolso'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <HeartHandshake className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Pedido Reembolso</span>
            </button>

            {/* Category: Credenciamento Planos */}
            <button
              onClick={() => setActiveTab('credenciamento')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'credenciamento'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Heading className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Credenciar Planos</span>
            </button>

            {/* Category: Meus Modelos (Custom Templates) */}
            <button
              id="tab-btn-meus-modelos"
              onClick={() => setActiveTab('meus_modelos')}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                activeTab === 'meus_modelos'
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                  : 'hover:bg-indigo-50/30 text-indigo-600 hover:text-indigo-800'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-500" />
              <span className="flex items-center gap-1">
                Meus Modelos
                <span className="px-1 py-0.2 text-[8px] bg-indigo-100 text-indigo-700 rounded font-bold uppercase">Novo</span>
              </span>
            </button>

          </nav>

          <div className="pt-4 border-t border-slate-50">
            <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-[10px] text-indigo-900 leading-relaxed space-y-1">
              <span className="font-bold">Informação Prática:</span>
              <p>O preenchimento do formulário central modifica os dados dinâmicos de todos os documentos simultaneamente para acelerar sua jornada.</p>
            </div>
          </div>
        </div>

        {/* COL 2: Customizer Variable Form */}
        <div className="xl:col-span-4 space-y-4">
          
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Customizar Variáveis do Documento
            </h3>

            {/* Custom Logo & Watermark Area */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest block">Logo Personalizada</span>
                {customLogo && (
                  <button
                    onClick={() => {
                      setCustomLogo(null);
                      localStorage.removeItem('clinic_custom_logo');
                    }}
                    type="button"
                    className="text-[9px] font-bold text-red-500 hover:text-red-700 hover:underline transition-colors cursor-pointer"
                  >
                    Excluir Logo
                  </button>
                )}
              </div>
              
              {!customLogo ? (
                <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-white hover:bg-slate-50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          try {
                            setCustomLogo(base64String);
                            localStorage.setItem('clinic_custom_logo', base64String);
                          } catch (err) {
                            alert("A imagem é muito grande para guardar localmente no seu navegador. Por favor escolha uma imagem mais leve ou um arquivo compactado (menor que 1.5MB).");
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none relative z-10">
                    <div className="p-1 px-2 bg-indigo-50 rounded-lg group-hover:scale-105 transition-transform flex items-center justify-center">
                      <Image className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-600">Fazer upload da logo</span>
                    <span className="text-[8px] text-slate-400">PNG, JPG (Preferência de fundo transparente)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-150">
                    <img 
                      src={customLogo} 
                      alt="Logo carregada" 
                      className="w-16 h-16 object-contain rounded bg-slate-50 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-slate-700 truncate">Logo Carregada</p>
                      <p className="text-[8px] text-slate-400">Salva automaticamente</p>
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer p-1 select-none">
                    <input 
                      type="checkbox"
                      checked={useLogoAsWatermark}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setUseLogoAsWatermark(val);
                        localStorage.setItem('clinic_logo_as_watermark', String(val));
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] font-semibold text-slate-600 selection:bg-transparent">Usar também como Marca d'Água</span>
                  </label>

                  {useLogoAsWatermark && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150/60 space-y-2 mt-1">
                      <div>
                        <div className="flex justify-between text-[8px] font-bold text-slate-400 mb-1">
                          <span>LARGURA: {watermarkSize}px</span>
                        </div>
                        <input 
                          type="range"
                          min="150"
                          max="750"
                          value={watermarkSize}
                          onChange={(e) => setWatermarkSize(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[8px] font-bold text-slate-400 mb-1">
                          <span>OPACIDADE: {Math.round(watermarkOpacity * 100)}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0.02"
                          max="0.40"
                          step="0.01"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timbrado Document Layout Structure controls */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 space-y-2 select-none">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block mb-1">Modelo Visual: Cabeçalho & Rodapé</span>
              
              <label className="flex items-center gap-2 cursor-pointer pb-0.5">
                <input 
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] font-semibold text-slate-700">Ativar Cabeçalho (Logo, Nome e CRP)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer py-0.5">
                <input 
                  type="checkbox"
                  checked={includeSignBox}
                  onChange={(e) => setIncludeSignBox(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] font-semibold text-slate-700">Ativar Linha de Assinatura no Fim</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input 
                  type="checkbox"
                  checked={includeFooter}
                  onChange={(e) => setIncludeFooter(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] font-semibold text-slate-700">Ativar Rodapé Clínico Customizado</span>
              </label>
            </div>

            {/* Shared Fields (Paciente & CRP) */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Profissional (Psicólogo)
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showHeaderName}
                      onChange={(e) => setShowHeaderName(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3 h-3 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[9px] font-bold text-slate-500 hover:text-slate-800">Mostrar no Cabeçalho</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Nome do Profissional"
                  value={psychologistName}
                  onChange={(e) => setPsychologistName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    CRP Registrado
                  </label>
                  <input
                    type="text"
                    value={psychologistCrp}
                    onChange={(e) => setPsychologistCrp(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={consultationCity}
                    onChange={(e) => setConsultationCity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Rodapé Personalizado (Abaixo da Assinatura)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Av. Afonso Pena, 1500, Sala 402 - Centro, Belo Horizonte - MG | Contato: (31) 99876-5432"
                  value={customFooter}
                  onChange={(e) => setCustomFooter(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-700 leading-normal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Paciente Associado
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Escolher na Lista --</option>
                  {patients.filter(p => p.status === 'active').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  CPF do Paciente
                </label>
                <input
                  type="text"
                  placeholder="Ex: 123.456.789-00"
                  value={patientCpf}
                  onChange={(e) => setPatientCpf(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-slate-800"
                />
              </div>

              {/* conditional layout if menor (contratos / consentimentos) */}
              {(activeTab === 'termos' || activeTab === 'contratos') && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-indigo-600 block">Identificação de Cuidado (Parental/Menor)</span>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Nome do Responsável
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Maria das Dores Barros"
                      value={representativeName}
                      onChange={(e) => setRepresentativeName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        CPF Resp.
                      </label>
                      <input
                        type="text"
                        placeholder="CPF"
                        value={representativeCpf}
                        onChange={(e) => setRepresentativeCpf(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        RG Resp.
                      </label>
                      <input
                        type="text"
                        placeholder="RG"
                        value={representativeRg}
                        onChange={(e) => setRepresentativeRg(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Recibos / Contratos Variables */}
              {(activeTab === 'recibos' || activeTab === 'contratos' || activeTab === 'reembolso') && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2.5">
                  <span className="text-[10px] font-extrabold text-emerald-600 block">Valores e Parâmetros Financeiros</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Valor Unitário (R$)
                      </label>
                      <input
                        type="text"
                        value={sessionValue}
                        onChange={(e) => setSessionValue(e.target.value)}
                        className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Total de Sessões
                      </label>
                      <input
                        type="number"
                        value={sessionsCount}
                        onChange={(e) => setSessionsCount(Number(e.target.value))}
                        className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Frequência / Datas das Quitações
                    </label>
                    <input
                      type="text"
                      value={sessionDatesString}
                      onChange={(e) => setSessionDatesString(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* Declaração de Presença hours */}
              {activeTab === 'presenca' && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-blue-600 block">Horário do Acompanhamento</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Hora Início
                      </label>
                      <input
                        type="text"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Hora Término
                      </label>
                      <input
                        type="text"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Atestado parameters */}
              {activeTab === 'atestado' && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-amber-600 block">Período de Dispensação</span>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Quantidade de Dias de Afastamento
                    </label>
                    <input
                      type="text"
                      value={atestadoDias}
                      onChange={(e) => setAtestadoDias(e.target.value)}
                      className="w-full px-3 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Fundamentação Clínica / CID Autorizado
                    </label>
                    <textarea
                      rows={3}
                      value={atestadoMotivo}
                      onChange={(e) => setAtestadoMotivo(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* Encaminhamento Form Section */}
              {activeTab === 'encaminhamento' && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                    <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest block">
                      Encaminhamento Clínico
                    </span>
                    <span className="text-[8.5px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                      Res. CFP 06/2019
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Modelos Pré-definidos por Especialidade:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(ENCAMINHAMENTO_PRESETS) as EncaminhamentoPresetKey[]).map((key) => {
                        const p = ENCAMINHAMENTO_PRESETS[key];
                        const isSelected = encaminhamentoPreset === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setEncaminhamentoPreset(key);
                              setEncaminhamentoDestinatario(p.destinatario);
                              setEncaminhamentoMotivo(p.motivo);
                              setEncaminhamentoHistorico(p.historico);
                              setEncaminhamentoHipoteses(p.hipoteses);
                              setEncaminhamentoSolicitacao(p.solicitacao);
                            }}
                            className={`p-2 rounded-xl text-left border transition-all text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xs">{p.icon}</span>
                            <span className="truncate">{p.label.split(' ')[0]} {p.label.split(' ')[1] || ''}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      1. Destinatário / Colega Profissional
                    </label>
                    <input
                      type="text"
                      value={encaminhamentoDestinatario}
                      onChange={(e) => setEncaminhamentoDestinatario(e.target.value)}
                      placeholder="Ex: Ao(À) Médico(a) Psiquiatra ou Dr. Fulano de Tal"
                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      2. Motivo do Encaminhamento
                    </label>
                    <textarea
                      rows={2}
                      value={encaminhamentoMotivo}
                      onChange={(e) => setEncaminhamentoMotivo(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      3. Histórico do Acompanhamento Clínico
                    </label>
                    <textarea
                      rows={3}
                      value={encaminhamentoHistorico}
                      onChange={(e) => setEncaminhamentoHistorico(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      4. Hipóteses Diagnósticas / Sintomas de Relevo
                    </label>
                    <textarea
                      rows={2}
                      value={encaminhamentoHipoteses}
                      onChange={(e) => setEncaminhamentoHipoteses(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      5. Solicitação e Conduta Interdisciplinar
                    </label>
                    <textarea
                      rows={2}
                      value={encaminhamentoSolicitacao}
                      onChange={(e) => setEncaminhamentoSolicitacao(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Laudo Clinico Customization */}
              {activeTab === 'laudos' && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-cyan-600 block">Preceitos Metodológicos (CFP 06/2019)</span>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Solicitante do Laudo
                    </label>
                    <input
                      type="text"
                      value={laudoSolicitante}
                      onChange={(e) => setLaudoSolicitante(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Finalidade Técnica
                    </label>
                    <input
                      type="text"
                      value={laudoFinalidade}
                      onChange={(e) => setLaudoFinalidade(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Descrição da Demanda
                    </label>
                    <textarea
                      rows={2}
                      value={laudoDemanda}
                      onChange={(e) => setLaudoDemanda(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Análise Psicológica
                    </label>
                    <textarea
                      rows={2}
                      value={laudoAnalise}
                      onChange={(e) => setLaudoAnalise(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Conclusão / Parecer Final
                    </label>
                    <textarea
                      rows={2}
                      value={laudoConclusao}
                      onChange={(e) => setLaudoConclusao(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Reembolso variables */}
              {activeTab === 'reembolso' && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-pink-600 block">Destaques para Operadora de Saúde</span>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Mês de Referência
                    </label>
                    <input
                      type="text"
                      value={reembolsoMes}
                      onChange={(e) => setReembolsoMes(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Preço faturado total (R$)
                    </label>
                    <input
                      type="text"
                      value={reembolsoPrecoTotal}
                      onChange={(e) => setReembolsoPrecoTotal(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* Credenciamento variables */}
              {activeTab === 'credenciamento' && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-amber-600 block">Informações Profissionais Adicionais</span>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Especialidades e Focos de Atuação
                    </label>
                    <textarea
                      rows={3}
                      value={credenciamentoEspecialidades}
                      onChange={(e) => setCredenciamentoEspecialidades(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Telefone para contato
                    </label>
                    <input
                      type="text"
                      value={credenciamentoContato}
                      onChange={(e) => setCredenciamentoContato(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Email Corporativo
                    </label>
                    <input
                      type="text"
                      value={credenciamentoEmail}
                      onChange={(e) => setCredenciamentoEmail(e.target.value)}
                      className="w-full px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* Meus Modelos variables / Custom Template Editor */}
              {activeTab === 'meus_modelos' && (() => {
                const currentTmp = customTemplates.find(t => t.id === selectedCustomTemplateId);
                const categoriesList = [
                  'Todos',
                  'Encaminhamentos',
                  'Laudos e Relatórios',
                  'Atestados e Declarações',
                  'Contratos e Termos',
                  'Financeiro e Convênios',
                  'Personalizados'
                ];

                const filteredTemplates = customTemplates.filter(t => {
                  const matchCategory = templateCategoryFilter === 'Todos' || (t.category || 'Personalizados') === templateCategoryFilter;
                  const matchSearch = !templateSearchQuery.trim() || 
                    t.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) || 
                    t.content.toLowerCase().includes(templateSearchQuery.toLowerCase());
                  return matchCategory && matchSearch;
                });

                const availableTags = [
                  { tag: '{paciente}', label: 'Paciente', desc: 'Nome completo do paciente' },
                  { tag: '{cpf}', label: 'CPF', desc: 'CPF do paciente' },
                  { tag: '{psicologo}', label: 'Psicólogo(a)', desc: 'Seu nome profissional' },
                  { tag: '{crp}', label: 'CRP', desc: 'Seu número de CRP' },
                  { tag: '{cidade}', label: 'Cidade', desc: 'Cidade do atendimento' },
                  { tag: '{data}', label: 'Data', desc: 'Data de emissão' },
                  { tag: '{rep_nome}', label: 'Resp. Legal', desc: 'Nome do responsável (menor)' },
                  { tag: '{rep_cpf}', label: 'CPF Resp.', desc: 'CPF do responsável legal' }
                ];

                const handleInsertTagAtEnd = (tag: string) => {
                  if (!currentTmp) return;
                  const updated = customTemplates.map(t => {
                    if (t.id === selectedCustomTemplateId) {
                      return { ...t, content: t.content + ' ' + tag };
                    }
                    return t;
                  });
                  setCustomTemplates(updated);
                  showToast(`Marcador ${tag} inserido!`);
                };

                return (
                  <div className="bg-indigo-50/60 p-4 rounded-3xl border border-indigo-100/90 space-y-3.5" id="meus-modelos-editor-box">
                    
                    {/* Toast Notification Banner */}
                    {templateActionToast && (
                      <div className="p-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-sm animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 shrink-0" />
                          {templateActionToast}
                        </span>
                        <button onClick={() => setTemplateActionToast(null)} className="text-white hover:text-slate-200 text-xs font-black">×</button>
                      </div>
                    )}

                    {/* Header with Title & Action shortcuts */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 items-center">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                          Central de Modelos Clínicos
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                        {customTemplates.length} Modelos Disponíveis
                      </span>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Filtrar por Categoria:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {categoriesList.map(cat => {
                          const isSelected = templateCategoryFilter === cat;
                          const count = cat === 'Todos' 
                            ? customTemplates.length 
                            : customTemplates.filter(t => (t.category || 'Personalizados') === cat).length;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setTemplateCategoryFilter(cat)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50/50'
                              }`}
                            >
                              <span>{cat}</span>
                              <span className={`text-[9px] px-1 rounded-full ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar modelo por título ou palavras-chave..."
                        value={templateSearchQuery}
                        onChange={(e) => setTemplateSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                      />
                      {templateSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setTemplateSearchQuery('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
                    {/* Select Model Dropdown */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          Selecionar Modelo ({filteredTemplates.length}):
                        </label>
                      </div>
                      <select
                        value={selectedCustomTemplateId}
                        onChange={(e) => setSelectedCustomTemplateId(e.target.value)}
                        className="w-full px-3 py-2 border border-indigo-200 bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      >
                        {filteredTemplates.map(t => (
                          <option key={t.id} value={t.id}>
                            [{t.category || 'Geral'}] {t.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Management Buttons Row */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newId = `custom_template_${Date.now()}`;
                          const newTemplate: CustomTemplate = {
                            id: newId,
                            title: `Novo Modelo Personalizado ${customTemplates.length + 1}`,
                            category: templateCategoryFilter !== 'Todos' ? templateCategoryFilter : 'Personalizados',
                            content: `TÍTULO DO DOCUMENTO\n\nPaciente: {paciente}\nCPF: {cpf}\n\nTexto clínico ou declaração livre...\n\n{cidade}, {data}.\n\n___________________________________________________________\n{psicologo}\nCRP nº {crp}`
                          };
                          setCustomTemplates([newTemplate, ...customTemplates]);
                          setSelectedCustomTemplateId(newId);
                          showToast('Novo modelo em branco criado!');
                        }}
                        className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        title="Criar novo modelo em branco"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Novo Modelo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateTemplate(selectedCustomTemplateId)}
                        className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-indigo-200 text-indigo-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        title="Duplica este modelo base como uma cópia editável exclusiva"
                      >
                        <CopyCheck className="w-3 h-3" />
                        <span>Duplicar / Clonar</span>
                      </button>

                      <button
                        type="button"
                        disabled={customTemplates.length <= 1}
                        onClick={() => {
                          if (confirm(`Deseja realmente remover o modelo "${currentTmp?.title}"?`)) {
                            const remaining = customTemplates.filter(t => t.id !== selectedCustomTemplateId);
                            setCustomTemplates(remaining);
                            if (remaining.length > 0) {
                              setSelectedCustomTemplateId(remaining[0].id);
                            }
                            showToast('Modelo excluído!');
                          }
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                          customTemplates.length <= 1
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer'
                        }`}
                        title="Excluir o modelo atual"
                      >
                        <span>Excluir</span>
                      </button>
                    </div>

                    {/* Secondary Actions Bar (Restore Base / Export JSON) */}
                    <div className="flex items-center justify-between pt-1 border-t border-indigo-100 text-[10px]">
                      <button
                        type="button"
                        onClick={handleRestoreBaseTemplates}
                        className="text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        title="Restaura modelos base que porventura tenham sido removidos"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restaurar Catálogo Base</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportTemplatesJson}
                        className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        title="Exportar arquivo JSON com todos os seus modelos"
                      >
                        <Download className="w-3 h-3" />
                        <span>Exportar Backup (JSON)</span>
                      </button>
                    </div>

                    {/* Edit Template Title & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          Título do Modelo
                        </label>
                        <input
                          type="text"
                          value={currentTmp?.title || ''}
                          onChange={(e) => {
                            const updated = customTemplates.map(t => {
                              if (t.id === selectedCustomTemplateId) {
                                return { ...t, title: e.target.value };
                              }
                              return t;
                            });
                            setCustomTemplates(updated);
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          Categoria
                        </label>
                        <select
                          value={currentTmp?.category || 'Personalizados'}
                          onChange={(e) => {
                            const updated = customTemplates.map(t => {
                              if (t.id === selectedCustomTemplateId) {
                                return { ...t, category: e.target.value };
                              }
                              return t;
                            });
                            setCustomTemplates(updated);
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {categoriesList.filter(c => c !== 'Todos').map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Interactive Tag Inserter Chips */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          🏷️ Inserir Marcadores Dinâmicos (Clique para adicionar):
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {availableTags.map(item => (
                          <button
                            key={item.tag}
                            type="button"
                            onClick={() => handleInsertTagAtEnd(item.tag)}
                            className="px-2 py-0.5 bg-white hover:bg-indigo-100/70 text-indigo-800 border border-indigo-200 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer shadow-2xs hover:scale-102"
                            title={`${item.label}: ${item.desc}`}
                          >
                            {item.tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Edit Template Content */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          Texto do Modelo (Edição Livre)
                        </label>
                        <span className="text-[9px] font-semibold text-emerald-600">
                          ✓ Salvo automaticamente
                        </span>
                      </div>
                      <textarea
                        rows={13}
                        value={currentTmp?.content || ''}
                        onChange={(e) => {
                          const updated = customTemplates.map(t => {
                            if (t.id === selectedCustomTemplateId) {
                              return { ...t, content: e.target.value };
                            }
                            return t;
                          });
                          setCustomTemplates(updated);
                        }}
                        className="w-full p-3 border border-slate-200 bg-white rounded-xl text-xs font-mono text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      />
                    </div>

                    {/* Drag-and-drop or file selector to import documents */}
                    <div className={`border border-dashed rounded-2xl p-3 text-center relative group transition-all cursor-pointer ${isImporting ? 'bg-indigo-50/30 border-indigo-400' : 'bg-white border-indigo-200 hover:border-indigo-400'}`}>
                      <input
                        type="file"
                        accept=".txt,.md,.pdf"
                        disabled={isImporting}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                            if (file.name.toLowerCase().endsWith('.pdf')) {
                              parsePdfFile(file);
                            } else {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const text = event.target?.result as string;
                                if (text) {
                                  const newId = `custom_template_${Date.now()}`;
                                  const newTemplate: CustomTemplate = {
                                    id: newId,
                                    title: fileNameWithoutExt,
                                    category: 'Personalizados',
                                    content: text
                                  };
                                  const updated = [newTemplate, ...customTemplates];
                                  setCustomTemplates(updated);
                                  setSelectedCustomTemplateId(newId);
                                  showToast(`Documento "${fileNameWithoutExt}" importado com sucesso!`);
                                }
                              };
                              reader.readAsText(file);
                            }
                          }
                        }}
                        className={`absolute inset-0 w-full h-full opacity-0 z-20 ${isImporting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      />
                      {isImporting ? (
                        <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none relative z-10 py-1.5 animate-pulse">
                          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-1"></div>
                          <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tight">Extraindo Texto do PDF...</span>
                          <span className="text-[8px] text-slate-400">Por favor, aguarde enquanto convertemos o documento</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none relative z-10">
                          <div className="p-1 px-2 bg-indigo-50 rounded-lg group-hover:scale-105 transition-transform flex items-center justify-center">
                            <Upload className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <span className="text-[10px] font-black text-slate-700">Importar Modelo de Arquivo (.txt, .md, .pdf)</span>
                          <span className="text-[8px] text-slate-400">Arraste ou clique para carregar o seu documento</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })()}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Data de Emissão do Documento
                </label>
                <input
                  type="text"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-slate-800"
                />
              </div>

              {activeTab === 'anamnese' && (
                <div className="pt-2 space-y-4">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                      <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest block">
                        Preencher Formulário de Anamnese
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Deseja mesmo limpar todas as respostas desta anamnese?")) {
                            const updated = { ...anamneseAnswers };
                            const prefix = `${selectedSubAnamnese}_`;
                            Object.keys(updated).forEach(k => {
                              if (k.startsWith(prefix)) {
                                delete updated[k];
                              }
                            });
                            setAnamneseAnswers(updated);
                          }
                        }}
                        className="text-[9px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer bg-transparent border-none"
                      >
                        Limpar Respostas
                      </button>
                    </div>

                    <p className="text-[9.5px]/relaxed text-slate-400">
                      Digite abaixo as respostas obtidas na entrevista clínica. Elas serão sincronizadas instantaneamente no papel timbrado para PDF/Word.
                    </p>

                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                      {anamneseTemplates[selectedSubAnamnese].sections.map(sec => (
                        <div key={sec.id} className="space-y-2.5 bg-white p-3 rounded-xl border border-slate-150">
                          <strong className="text-[10px] text-slate-800 tracking-tight block border-b border-slate-100 pb-1">
                            {sec.category}
                          </strong>
                          <div className="space-y-2.5">
                            {sec.questions.map((q, idx) => {
                              const ansKey = `${selectedSubAnamnese}_${sec.id}_q${idx}`;
                              return (
                                <div key={idx} className="space-y-1 text-left">
                                  <label className="block text-[9.5px] font-semibold text-slate-600">
                                    Q{idx + 1}: {q}
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={anamneseAnswers[ansKey] || ''}
                                    onChange={(e) => {
                                      setAnamneseAnswers(prev => ({
                                        ...prev,
                                        [ansKey]: e.target.value
                                      }));
                                    }}
                                    placeholder="Digite a resposta do paciente..."
                                    className="w-full p-2 border border-slate-200 rounded-lg text-[10.5px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 resize-none leading-normal"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Anotações sobre a Entrevista (Aparecerá no cabeçalho)
                    </label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Ex: Encaminhado por neuropediatra..."
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs text-slate-700 leading-normal"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* COL 3 & 4: Live Responsive Letterhead Preview & Print Area */}
        <div className="xl:col-span-5 space-y-4">
          
          {/* Internal subtab switch for Anamnese Cyclists */}
          {activeTab === 'anamnese' && (
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex gap-1">
              <button
                onClick={() => setSelectedSubAnamnese('infantil')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                  selectedSubAnamnese === 'infantil' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Infantil
              </button>
              <button
                onClick={() => setSelectedSubAnamnese('adolescente')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                  selectedSubAnamnese === 'adolescente' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Adolescente
              </button>
              <button
                onClick={() => setSelectedSubAnamnese('adulto')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                  selectedSubAnamnese === 'adulto' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Adulto
              </button>
              <button
                onClick={() => setSelectedSubAnamnese('idoso')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                  selectedSubAnamnese === 'idoso' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Idoso
              </button>
            </div>
          )}

          {/* Elegant Display Box containing Timbrado (Letterhead Mockup) */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-inner flex flex-col items-center">
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Visualização Prévia (Papel Timbrado Clínico)
              </span>
              {activeTab !== 'meus_modelos' && (
                <button
                  type="button"
                  onClick={handleSaveCurrentDocAsCustomModel}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[10.5px] font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  title="Copia este documento para 'Meus Modelos' para que você possa editá-lo livremente"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Personalizar em "Meus Modelos"</span>
                </button>
              )}
            </div>

            {/* Letterhead Sheet Layout */}
            <div 
              style={{
                width: '100%',
                maxWidth: '210mm',
                minHeight: '297mm',
                paddingTop: '30mm',
                paddingRight: '20mm',
                paddingBottom: '20mm',
                paddingLeft: '30mm',
                boxSizing: 'border-box',
                position: 'relative'
              }}
              className="bg-white border border-slate-200 shadow-md rounded-2xl font-sans text-slate-800 leading-relaxed text-xs overflow-y-auto max-h-[85vh] text-left workspace-paper relative"
            >
              {/* Watermark Background - Perfectly centered on sheet */}
              {customLogo && useLogoAsWatermark && (
                <div 
                  className="pointer-events-none select-none"
                  style={{ 
                    position: 'absolute',
                    top: '148.5mm',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${watermarkSize}px`,
                    height: `${watermarkSize}px`,
                    maxWidth: '170mm',
                    maxHeight: '230mm',
                    zIndex: 0,
                    opacity: watermarkOpacity,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={customLogo} 
                    alt="Watermark" 
                    className="object-contain"
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'block',
                      margin: 'auto'
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="relative z-10 w-full">
                {/* Header Letterhead */}
                {includeHeader && (
                  <div className="border-b-2 border-slate-950 pb-4 mb-6 font-sans text-center flex flex-col items-center justify-center">
                    {customLogo && (
                      <img 
                        src={customLogo} 
                        alt="Logo Cabeçalho" 
                        className="max-h-[100px] max-w-[240px] object-contain mb-3"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {showHeaderName && (
                      <div className="text-center font-sans">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{psychologistName}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Psicóloga Clínica • CRP {psychologistCrp}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic raw display parsed line by line style */}
                <div className="text-slate-900 pr-2">
                  {renderAbntParagraphs(currentGeneratedText, false)}
                </div>

                {/* Sub-block representation of checklist if anamnese */}
                {activeTab === 'anamnese' && (
                  <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
                    <span className="font-sans block text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Blocos Detalhados do Roteiro</span>
                    {anamneseTemplates[selectedSubAnamnese].sections.map(section => (
                      <div key={section.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans">
                        <div className="flex justify-between items-center mb-2">
                          <strong className="text-[11px] text-slate-700">{section.category}</strong>
                          <button
                            onClick={() => handleCopySingleAnamneseSection(section.id, section.category, section.questions)}
                            className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            {copiedQuestions[section.id] ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : 'Copiar'}
                          </button>
                        </div>
                        <ul className="space-y-1 text-[10px] text-slate-500">
                          {section.questions.map((q, qIdx) => (
                            <li key={qIdx} className="list-disc list-inside">{q}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Print Sign Box representation visually */}
                {includeSignBox && !textHasSignature(currentGeneratedText) && (
                  <div className="mt-8 text-center font-sans">
                    <div className="w-56 mx-auto mb-2 border-t border-slate-400" />
                    <p className="text-[11px] font-black text-slate-800 mt-1">{psychologistName}</p>
                    <p className="text-[9px] text-slate-500 font-bold">Psicóloga Clínica: CRP {formatCrpDisplay(psychologistCrp)}</p>
                  </div>
                )}

                {/* Legal Warning Footer */}
                {includeFooter && (
                  <div className="mt-8 pt-4 border-t-2 border-slate-100 flex items-center justify-between gap-4 font-sans text-[9px] text-slate-500">
                    {customLogo && (
                      <img 
                        src={customLogo} 
                        alt="Logo Rodapé" 
                        className="max-h-[38px] max-w-[110px] object-contain opacity-90"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className={`flex-1 ${customLogo ? 'text-right' : 'text-center'} leading-relaxed space-y-0.5`}>
                      {customFooter ? (
                        <div className="whitespace-pre-line text-slate-600 font-medium">{customFooter}</div>
                      ) : (
                        <>
                          <p className="font-bold text-slate-600">Confidencial • Emitido sob o Código de Ética do CFP e de acordo com a LGPD.</p>
                          <p className="text-[8px] text-slate-400">Emissor: {psychologistName} • CRP {formatCrpDisplay(psychologistCrp)}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* HIDDEN PRINT MATERIAL CARD (rendered in black and white on clean format) */}
      <div id="printable-area-hidden" className="hidden font-serif">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              color: black !important;
              width: 210mm !important;
            }
          }
        `}} />
        <div style={{ padding: '30mm 20mm 20mm 30mm', width: '210mm', minHeight: '297mm', boxSizing: 'border-box', margin: '0 auto', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000000', backgroundColor: '#ffffff', position: 'relative' }}>
          
          {/* Print Watermark - Perfectly centered on A4 page */}
          {customLogo && useLogoAsWatermark && (
            <div 
              style={{
                position: 'absolute',
                top: '148.5mm',
                left: '105mm',
                transform: 'translate(-50%, -50%)',
                width: `${watermarkSize}px`,
                height: `${watermarkSize}px`,
                maxWidth: '170mm',
                maxHeight: '230mm',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: watermarkOpacity,
                zIndex: 0,
                userSelect: 'none',
                overflow: 'hidden'
              }}
            >
              <img 
                src={customLogo} 
                alt="Watermark" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  display: 'block',
                  margin: 'auto'
                }}
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
            {/* Timbrado Header */}
            {includeHeader && (
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '16px', marginBottom: '25px', fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {customLogo && (
                  <img 
                    src={customLogo} 
                    alt="Logo Cabeçalho" 
                    style={{ maxHeight: '90px', maxWidth: '220px', objectFit: 'contain', marginBottom: '10px' }}
                    referrerPolicy="no-referrer"
                  />
                )}
                {showHeaderName && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#111111', letterSpacing: '1px' }}>{psychologistName}</p>
                    <p style={{ margin: '0', fontSize: '9px', color: '#555555', fontWeight: 'bold', textTransform: 'uppercase' }}>Psicóloga Clínica • CRP {formatCrpDisplay(psychologistCrp)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic replaced context */}
            <div style={{ minHeight: '400px', color: '#111111' }}>
              {renderAbntParagraphs(currentGeneratedText, true)}
            </div>

            {/* Print Sign Box */}
            {includeSignBox && !textHasSignature(currentGeneratedText) && (
              <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '11px', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                <div style={{ width: '280px', margin: '0 auto 8px auto', borderTop: '1px solid #111111' }} />
                <p style={{ fontWeight: 'bold', margin: '0', fontSize: '11pt', color: '#111111' }}>{psychologistName}</p>
                <p style={{ margin: '3px 0 0 0', fontSize: '9pt', color: '#444444' }}>Psicóloga Clínica: CRP {formatCrpDisplay(psychologistCrp)}</p>
              </div>
            )}

            {/* Legal Warning Footer */}
            {includeFooter && (
              <div style={{ marginTop: '45px', paddingTop: '15px', borderTop: '2px solid #e2e8f0', fontFamily: 'Arial, sans-serif' }}>
                <table width="100%" cellSpacing="0" cellPadding="0">
                  <tbody>
                    <tr>
                      {customLogo ? (
                        <td width="130" style={{ paddingRight: '15px', verticalAlign: 'middle' }}>
                          <img 
                            src={customLogo} 
                            alt="Logo Rodapé" 
                            style={{ maxHeight: '45px', maxWidth: '120px', objectFit: 'contain' }}
                            referrerPolicy="no-referrer"
                          />
                        </td>
                      ) : null}
                      <td style={{ textAlign: customLogo ? 'right' : 'center', verticalAlign: 'middle', fontSize: '9px', color: '#4b5563', lineHeight: '1.4' }}>
                        {customFooter ? (
                          <div style={{ whiteSpace: 'pre-line' }}>{customFooter}</div>
                        ) : (
                          <>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Confidencial • Documento clínico emitido sob o Código de Ética do CFP e LGPD.</p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '8px', color: '#9ca3af' }}>Conselho Federal de Psicologia • Emissor: {psychologistName} (CRP: {formatCrpDisplay(psychologistCrp)})</p>
                          </>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sandbox Print Warning Modal */}
      {showSandboxPrintWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3.5 text-left">
              <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-500 shrink-0">
                <ShieldAlert className="w-6 h-6 shrink-0" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="text-base font-black text-slate-800 tracking-tight leading-none">Impedimento do Navegador (Iframe Sandbox)</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Por restrições de segurança do seu navegador, a janela de impressão em PDF é bloqueada quando executada de dentro de um chat ou visualizador (ambiente com sandbox).
                </p>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Oferecemos <b>duas formas fáceis</b> de baixar seu documento em PDF perfeito agora:
                </p>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-3 pt-1 text-left">
              {/* Option 1: Download direct print HTML file */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black">1</span>
                  <span className="text-xs font-bold text-slate-700">Baixar arquivo de Impressão Direta (Recomendado)</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal pl-6">
                  Baixe o arquivo do documento já formatado. Ao clicar, abrirá uma página limpa no seu computador de onde você pode salvar o PDF normalmente!
                </p>
                <div className="pl-6 pt-1">
                  <button
                    onClick={() => {
                      handleDownloadHtmlPrint();
                      setShowSandboxPrintWarning(false);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar HTML Impresso (.html)</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Open in a new tab instruction */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-black">2</span>
                  <span className="text-xs font-bold text-slate-700 font-sans">Abrir o Aplicativo em uma Nova Aba</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal pl-6">
                  Abra o endereço de desenvolvimento em azul localizado acima do chat para usar o sistema em pantalla inteira. Lá, o botão <b>"Salvar PDF / Imprimir"</b> funcionará nativamente direto no seu navegador.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSandboxPrintWarning(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Voltar ao Prontuário
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
