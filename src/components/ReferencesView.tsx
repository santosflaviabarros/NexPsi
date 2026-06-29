import { useState } from 'react';
import { 
  BookOpen, Search, Copy, Check, FileText, Activity, ShieldAlert,
  Scale, BookOpenCheck, ExternalLink, Sparkles, Filter, ChevronRight, HelpCircle,
  ClipboardList, Brain, X, AlertCircle, Info, RefreshCw, Play,
  Printer, Download, ListTodo, FileCheck, Heart, Smile
} from 'lucide-react';
import { 
  EADS21_QUESTIONS, EADS21_ANSWERS, ASRS18_QUESTIONS, ASRS18_ANSWERS,
  BDIII_QUESTIONS, BAI_QUESTIONS,
  interpretBDIII, interpretBAI, interpretEADS21,
  MOM_ANSWERS, MOM_D_QUESTIONS, MOM_A_QUESTIONS, MOM_R_QUESTIONS, MOM_P_QUESTIONS,
  interpretMOMDepression, interpretMOMAnxiety, interpretMOMAnger, interpretMOMPanic
} from '../data/testsData';
import {
  CLINICAL_DEMANDS, CLINICAL_RESOURCES, ClinicalResource, ClinicalResourceField
} from '../data/clinicalResourcesData';

interface DiagnosticItem {
  code: string;
  name: string;
  category: string;
  description: string;
  symptoms?: string[];
}

interface EthicsArticle {
  article: string;
  title: string;
  text: string;
  category: 'principios' | 'deveres' | 'proibicoes' | 'sigilo' | 'outros';
}

interface PsychologicalTest {
  id: string;
  name: string;
  abbreviation: string;
  category: 'Personalidade' | 'Cognitivo' | 'Sintomas';
  purpose: string;
  targetPublic: string;
  ageRange: string;
  satepsiStatus: 'Favorável' | 'Não Restrito';
  applicationType: string;
  description: string;
  dimensionsTested: string[];
}

interface PlanPhase {
  title: string;
  objectives: string[];
  techniques: string[];
}

interface TreatmentPlan {
  id: string;
  disorder: string;
  approach: string;
  category: 'Mood' | 'Anxiety' | 'Neurodev' | 'Personality';
  recommendedSessions: string;
  phases: PlanPhase[];
  therapeuticActivities: string[];
}

export default function ReferencesView() {
  const [activeSubTab, setActiveSubTab] = useState<'etica' | 'cid10' | 'dsm5' | 'testes' | 'planos' | 'recursos'>('etica');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // States for clinical resources
  const [selectedDemand, setSelectedDemand] = useState<typeof CLINICAL_DEMANDS[number]>('Ansiedade e Pânico');
  const [activeResource, setActiveResource] = useState<ClinicalResource | null>(null);
  const [resourcePatientName, setResourcePatientName] = useState<string>('');
  const [resourceFormValues, setResourceFormValues] = useState<Record<string, any>>({});

  // States for interactive assessment tools
  const [selectedTestToRun, setSelectedTestToRun] = useState<string | null>(null);
  const [testMode, setTestMode] = useState<'interactive' | 'direct'>('interactive');
  const [interactiveAnswers, setInteractiveAnswers] = useState<Record<number, number>>({});
  const [manualRawScore, setManualRawScore] = useState<string>('');
  const [eadsDirectScores, setEadsDirectScores] = useState({ dep: '', ans: '', est: '' });
  const [asrsDirectScores, setAsrsDirectScores] = useState({ desat: '', hiper: '', partA: '' });
  
  // Specific qualitative and quantitative trackers
  const [htpObservations, setHtpObservations] = useState({
    detalhesOmitidos: false,
    chamineFumaca: false,
    portasTrancadas: false,
    raizesExpostas: false,
    cicatrizesTronco: false,
    maosEscondidas: false,
    olhosGrandes: false,
    linhasFracas: false
  });
  
  const [wiscScores, setWiscScores] = useState({
    icv: '',
    iop: '',
    imt: '',
    ivp: ''
  });
  
  const [bfpScores, setBfpScores] = useState({
    neu: '50',
    ext: '50',
    soc: '50',
    rea: '50',
    abe: '50'
  });

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // DATABASES
  const ethicsArticles: EthicsArticle[] = [
    {
      article: "Princípio I",
      title: "Respeito e Dignidade",
      text: "O psicólogo baseará o seu trabalho no respeito e na promoção da liberdade, da dignidade, da igualdade e da integridade do ser humano, apoiado nos valores da Declaração Universal dos Direitos Humanos.",
      category: "principios"
    },
    {
      article: "Princípio II",
      title: "Qualidade e Competência",
      text: "O psicólogo trabalhará visando a promover a saúde e a qualidade de vida das pessoas e das coletividades e contribuirá para a eliminação de quaisquer formas de negligência, discriminação, exploração, violência, crueldade e opressão.",
      category: "principios"
    },
    {
      article: "Princípio III",
      title: "Responsabilidade Social",
      text: "O psicólogo atuará com responsabilidade social, analisando crítica e historicamente a realidade política, econômica, social e cultural.",
      category: "principios"
    },
    {
      article: "Princípio IV",
      title: "Aprimoramento Contínuo",
      text: "O psicólogo buscará o constante aprimoramento profissional e o desenvolvimento da psicologia como ciência e profissão.",
      category: "principios"
    },
    {
      article: "Princípio V",
      title: "Direitos Humanos e Cidadania",
      text: "O psicólogo contribuirá para promover a universalização do acesso da população às informações, ao conhecimento da ciência psicológica, aos serviços e aos padrões éticos da profissão.",
      category: "principios"
    },
    {
      article: "Princípio VI",
      title: "Padrão de Conduta Justo",
      text: "O psicólogo zelará para que o exercício profissional seja efetuado com dignidade, rejeitando situações em que a Psicologia esteja sendo aviltada.",
      category: "principios"
    },
    {
      article: "Princípio VII",
      title: "Respeito e Cooperação",
      text: "O psicólogo considerará as relações de poder nos contextos em que atua e os impactos dessas relações sobre as suas atividades profissionais, posicionando-se de forma crítica.",
      category: "principios"
    },
    {
      article: "Artigo 1º",
      title: "Deveres Fundamentais do Psicólogo",
      text: "São deveres fundamentais dos psicólogos: a) Conhecer, respeitar e promover o código de ética; b) Assumir responsabilidade profissional apenas por atividades para as quais esteja capacitado pessoal, técnica e cientificamente; c) Prestar serviços psicológicos em condições de trabalho dignas e apropriadas; d) Fornecer, a quem de direito, informações sobre o trabalho a ser realizado e seu objetivo; e) Orientar o cliente sobre os encaminhamentos devidos.",
      category: "deveres"
    },
    {
      article: "Artigo 2º",
      title: "Proibições Estritas",
      text: "Ao psicólogo é vedado: a) Praticar ou ser conivente com quaisquer atos que caracterizem negligência, discriminação, exploração ou opressão; b) Induzir a convicções políticas, filosóficas, morais, ideológicas ou religiosas; c) Emitir documentos sem fundamentação técnica e científica; d) Utilizar títulos acadêmicos ou profissionais que não possua; e) Ser conivente com o exercício ilegal da psicologia.",
      category: "proibicoes"
    },
    {
      article: "Artigo 8º",
      title: "Atendimento de Menores e Interditados",
      text: "Para realizar atendimento de crianças, adolescentes ou interditos, o psicólogo deverá obter autorização de ao menos um dos responsáveis legais, assegurando que o atendimento seja revertido no estrito benefício do próprio menor.",
      category: "deveres"
    },
    {
      article: "Artigo 9º",
      title: "Sigilo Profissional e Confidencialidade",
      text: "É dever do psicólogo respeitar o sigilo profissional a fim de proteger, por meio da confidencialidade, a intimidade das pessoas, grupos ou organizações a que tenha acesso no exercício de sua atividade profissional.",
      category: "sigilo"
    },
    {
      article: "Artigo 10",
      title: "Quebra Excepcional do Sigilo",
      text: "Nas situações em que a gravidade possa comprometer a integridade de si ou de terceiros, o psicólogo poderá decidir pela quebra de sigilo profissional. Ele deve pautar sua decisão pela busca do menor prejuízo, revelando apenas o estritamente necessário para salvaguardar vidas humanas.",
      category: "sigilo"
    },
    {
      article: "Artigo 11",
      title: "Compartilhamento Multiprofissional",
      text: "Quando o psicólogo integrar equipe multiprofissional, ele revelará apenas as informações estritamente necessárias para o andamento do trabalho conjunto, preservando o sigilo dos detalhes pessoais não pertinentes à atuação de outros profissionais.",
      category: "sigilo"
    },
    {
      article: "Artigo 20",
      title: "Regras de Publicidade Profissional",
      text: "O psicólogo, ao promover seus serviços, deverá divulgar seu nome completo, a palavra 'Psicólogo' e seu número de inscrição devidamente habilitado (CRP). Não fará autopromoção sensacionalista nem garantirá resultados infalíveis, abstendo-se de expor rostos ou depoimentos de clientes.",
      category: "outros"
    }
  ];

  const cid15Database: DiagnosticItem[] = [
    {
      code: "F06.3",
      name: "Transtorno do humor orgânico",
      category: "F00-F09 (Orgânicos)",
      description: "Transtorno caracterizado por uma alteração do humor ou afeto, habitualmente acompanhado por uma alteração do nível global de atividade devido a uma doença, lesão ou disfunção cerebral orgânica."
    },
    {
      code: "F10.2",
      name: "Síndrome de dependência de álcool",
      category: "F10-F19 (Substâncias)",
      description: "Conjunto de fenômenos comportamentais, cognitivos e fisiológicos que se desenvolvem após o uso repetido de álcool, incluindo forte desejo de consumir e dificuldade em controlar o consumo."
    },
    {
      code: "F20.0",
      name: "Esquizofrenia paranoide",
      category: "F20-F29 (Psicóticos)",
      description: "Tipo comum de esquizofrenia dominado por ideias delirantes relativamente estáveis, frequentemente de perseguição, usualmente acompanhadas de alucinações, em particular auditivas."
    },
    {
      code: "F31.1",
      name: "Transtorno afetivo bipolar, episódio atual maníaco sem sintomas psicóticos",
      category: "F30-F39 (Humor)",
      description: "O paciente apresenta elevação do humor, aumento da energia e atividade física, redução do sono, ideias de grandiosidade e impulsividade sem a presença de delírios ou alucinações."
    },
    {
      code: "F31.3",
      name: "Transtorno afetivo bipolar, episódio atual depressivo leve ou moderativo",
      category: "F30-F39 (Humor)",
      description: "O paciente apresenta atualmente sintomas depressivos marcantes após pelo menos um episódio maníaco ou hipomaníaco comprovado estruturalmente."
    },
    {
      code: "F32.1",
      name: "Episódio depressivo moderado",
      category: "F30-F39 (Humor)",
      description: "Transtorno caracterizado por humor deprimido, perda de interesse e prazer, fadiga acentuada. O paciente apresenta dificuldades significativas no desempenho de atividades sociais ou domésticas."
    },
    {
      code: "F32.2",
      name: "Episódio depressivo grave sem sintomas psicóticos",
      category: "F30-F39 (Humor)",
      description: "Sintomatologia de extrema angústia e perda de valor do self. Pensamentos autodestrutivos recorrentes sem desencadeamento de sintomas delirantes diretos."
    },
    {
      code: "F33.1",
      name: "Transtorno depressivo recorrente, episódio atual moderativo",
      category: "F30-F39 (Humor)",
      description: "Caracterizado por episódios repetidos de depressão moderada, sem qualquer histórico de episódios independentes de elevação de humor (mania)."
    },
    {
      code: "F34.1",
      name: "Distimia (Transtorno Depressivo Persistente)",
      category: "F30-F39 (Humor)",
      description: "Instabilidade persistente de humor com depressão crônica, de gravidade menor que a depressão clínica clássica, durando anos seguidos sem intervalos saudáveis longos."
    },
    {
      code: "F40.0",
      name: "Agorafobia",
      category: "F40-F48 (Ansiedade/Estresse)",
      description: "Medo acentuado e evitação de lugares públicos, multidões ou situações de onde a fuga possa ser difícil ou o auxílio não esteja prontamente disponível em caso de pânico repentino."
    },
    {
      code: "F41.0",
      name: "Transtorno de pânico (ansiedade paroxística episódica)",
      category: "F40-F48 (Ansiedade/Estresse)",
      description: "Crises inesperadas e recorrentes de ansiedade grave (ataques de pânico). Caracteriza-se por sintomas somáticos intensos (taquicardia, asfixia, sudorese, medo de morrer ou perder o controle)."
    },
    {
      code: "F41.1",
      name: "Transtorno de ansiedade generalizada (TAG)",
      category: "F40-F48 (Ansiedade/Estresse)",
      description: "Ansiedade e preocupação excessivas, persistentes e de difícil controle, sobre diversos eventos ou atividades cotidianas. Acompanhado de tensão muscular, inquietação e fadiga."
    },
    {
      code: "F41.2",
      name: "Transtorno misto ansioso e depressivo",
      category: "F40-F48 (Ansiedade/Estresse)",
      description: "Presença simultânea de sintomas de ansiedade e depressão, sem que nenhum deles se sobressaia claramente ou seja de gravidade suficiente para justificar um diagnóstico isolado."
    },
    {
      code: "F42.0",
      name: "Transtorno obsessivo-compulsivo (TOC)",
      category: "F40-F48 (Ansiedade/Estresse)",
      description: "Presença de pensamentos obsessivos (intrusivos e angustiantes) e/ou rituais compulsivos recorrentes, cujo objetivo é neutralizar a ansiedade provocada pelas obsessões."
    },
    {
      code: "F43.1",
      name: "Transtorno de estresse pós-traumático (TEPT)",
      category: "F40-F48 (Ansiedade/Estresse)",
      description: "Resposta tardia ou protraída a um evento estressante, de natureza excepcionalmente ameaçadora ou catastrófica. Sintomas incluem flashbacks, pesadelos, esquiva e hipervigilância crônica."
    },
    {
      code: "F43.2",
      name: "Transtorno de adaptação (reação de ajustamento)",
      category: "F40-F48 (Ansiedade/Estresse)",
      description: "Estado de sofrimento subjetivo e perturbação emocional que surge no período de adaptação a uma mudança de vida significativa ou a um acontecimento vital traumático."
    },
    {
      code: "F50.0",
      name: "Anorexia nervosa",
      category: "F50-F59 (Fisiológicos)",
      description: "Transtorno caracterizado por perda de peso induzida e mantida pelo paciente. Medo mórbido de engordar e distorção severa da autoimagem corporal, levando a restrição calórica extrema."
    },
    {
      code: "F50.2",
      name: "Bulimia nervosa",
      category: "F50-F59 (Fisiológicos)",
      description: "Episódios repetidos de superalimentação (bujas) e preocupação excessiva com o peso corporal, levando o paciente a usar métodos compensatórios extremos, como vômitos autoinduzidos e laxantes."
    },
    {
      code: "F60.3",
      name: "Transtorno de personalidade limítrofe (Borderline)",
      category: "F60-F69 (Personalidade)",
      description: "Caracterizado por padrão persistente de instabilidade nos relacionamentos interpessoais, autoimagem, afetos e impulsividade acentuada. Medo crônico do abandono e episódios de raiva intensa."
    },
    {
      code: "F84.0",
      name: "Transtorno do Espectro Autista (TEA)",
      category: "F80-F89 (Desenvolvimento)",
      description: "Comprometimento global do desenvolvimento caracterizado por déficit persistente de comunicação e interação social, além de padrões restritos e repetitivos de comportamento, interesses e atividades."
    },
    {
      code: "F90.0",
      name: "Distúrbios da atividade e da atenção (TDAH)",
      category: "F90-F98 (Infância/Adol.)",
      description: "Transtorno caracterizado por início precoce de falta de atenção, hiperatividade e impulsividade severamente limitantes, inconsistente com o nível de desenvolvimento da criança ou do adulto."
    }
  ];

  const dsm5Database: DiagnosticItem[] = [
    {
      code: "DSM-5 Episódio Depressivo Maior",
      name: "Transtorno Depressivo Maior (TDM)",
      category: "Transtornos Depressivos",
      description: "Pelo menos 5 dos sintomas abaixo presentes durante o mesmo período de 2 semanas (sendo que pelo menos um dos sintomas é humor deprimido ou perda de interesse/prazer):",
      symptoms: [
        "Humor deprimido a maior parte do dia (quase todos os dias).",
        "Acentuada diminuição do interesse ou prazer nas atividades do cotidiano.",
        "Perda ou ganho significativo de peso sem estar em dieta ou alteração do apetite.",
        "Insônia ou hipersonia quase diária.",
        "Agitação ou retardo psicomotor observado por outras pessoas.",
        "Fadiga ou perda de energia quase diária.",
        "Sentimento de inutilidade ou culpa excessiva ou inadequada.",
        "Capacidade diminuída para pensar, concentrar-se ou tomar decisões.",
        "Pensamentos recorrentes de morte ou ideação suicida recorrente."
      ]
    },
    {
      code: "DSM-5 TAG",
      name: "Transtorno de Ansiedade Generalizada",
      category: "Transtornos de Ansiedade",
      description: "Ansiedade e preocupação excessivas (expectativa apreensiva), ocorrendo na maioria dos dias por pelo menos 6 meses, associadas a 3 ou mais dos seguintes sintomas (com pelo menos alguns sintomas presentes na maioria dos dias no último semestre):",
      symptoms: [
        "Inquietação ou sensação de estar com os nervos à flor da pele.",
        "Fadiga rápida / cansaço constante.",
        "Dificuldade em se concentrar ou sensações de vazio na mente.",
        "Irritabilidade aumentada constante.",
        "Tensão muscular acentuada.",
        "Perturbação do sono (dificuldade em conciliar ou manter o sono)."
      ]
    },
    {
      code: "DSM-5 TDAH",
      name: "Transtorno de Déficit de Atenção / Hiperatividade",
      category: "Transtornos do Neurodesenvolvimento",
      description: "Padrão persistente de desatenção e/ou hiperatividade-impulsividade que se caracteriza por pelo menos 6 sintomas de desatenção e/ou 6 de hiperatividade em crianças (ou ao menos 5 sintomas para adultos com mais de 17 anos), durando no mínimo 6 meses:",
      symptoms: [
        "Desatenção: Não presta atenção em detalhes, comete erros por descuido, tem dificuldades para manter a atenção e organizar tarefas.",
        "Desatenção: Deixa de seguir instruções, evita tarefas que exijam esforço mental constante, frequentemente perde objetos essenciais.",
        "Hiperatividade: Remexe as mãos/pés, levanta em momentos inadequados, corre ou escala situações impróprias, dificuldade em brincar silenciosamente.",
        "Impulsividade: Responde a perguntas antes que sejam concluídas, tem extrema dificuldade em esperar sua vez, interrompe intempestivamente os outros."
      ]
    },
    {
      code: "DSM-5 TPB",
      name: "Transtorno de Personalidade Limítrofe (Borderline)",
      category: "Transtornos de Personalidade",
      description: "Padrão difuso de instabilidade nas relações interpessoais, na autoimagem e nos afetos, com impulsividade acentuada surgindo no início da vida adulta. Caracterizado por pelo menos 5 dos seguintes critérios:",
      symptoms: [
        "Esforços desesperados para evitar abandono real ou imaginado.",
        "Padrão de relacionamentos instáveis e intensos (oscilação entre idealização e desvalorização).",
        "Perturbação da identidade: instabilidade acentuada e persistente da autoimagem ou da percepção de si.",
        "Impulsividade em pelo menos duas áreas potencialmente autodestrutivas (gastos, sexo, abuso de substâncias, direção, compulsão alimentar).",
        "Recorrência de comportamento, gestos ou ameaças suicidas, ou automutilação.",
        "Instabilidade afetiva devido a uma acentuada reatividade do humor.",
        "Sentimento crônico de vazio.",
        "Raiva intensa e inapropriada ou dificuldade em controlar a raiva.",
        "Ideação paranoide temporária associada a estresse intenso ou sintomas dissociativos graves."
      ]
    },
    {
      code: "DSM-5 TEA",
      name: "Transtorno do Espectro Autista",
      category: "Transtornos do Neurodesenvolvimento",
      description: "Déficits persistentes na comunicação e na interação social em múltiplos contextos, acompanhados de padrões restritos e repetitivos de comportamento, interesses ou atividades, manifestados por todos os seguintes na comunicação e ao menos dois fatores comportamentais:",
      symptoms: [
        "Déficits na reciprocidade socioemocional (por ex., aberturas sociais anormais, falha em conversas bilaterais normais).",
        "Déficits em comportamentos comunicativos não verbais (por ex., anomalias no contato visual, falta de expressões faciais).",
        "Déficits para desenvolver, manter e compreender relacionamentos adequados à idade.",
        "Movimentos motores, uso de objetos ou fala estereotipados ou repetitivos.",
        "Insistência na mesmice, adesão inflexível a rotinas ou padrões ritualizados de comportamento.",
        "Interesses fixos e altamente restritos que são anormais na intensidade ou foco.",
        "Hiper ou hiporreatividade a estímulos sensoriais ou interesse incomum por aspectos sensoriais do ambiente."
      ]
    },
    {
      code: "DSM-5 TEPT",
      name: "Transtorno de Estresse Pós-Traumático",
      category: "Transtornos relacionados a Trauma",
      description: "Exposição a episódio de morte real ou ameaça de morte, lesão grave ou violência sexual (experiência direta, testemunho, saber que ocorreu com familiar ou exposição detalhada). Seguida por sintomas de intrusão, esquiva e alterações de reatividade por mais de 1 mês:",
      symptoms: [
        "Intrusão: Lembranças angustiantes espontâneas, sonhos angustiantes repetidos ou reações dissociativas (flashbacks).",
        "Esquiva: Evitação persistente de estímulos, locais ou conversas associadas às memórias do evento traumático.",
        "Cognitivo/Humor: Incapacidade de lembrar aspectos importantes do evento, crenças negativas exageradas e humor deprimido persistente.",
        "Hipervigilância: Irritabilidade, surtos de raiva, comportamento autodestrutivo, sobressalto exagerado e problemas de sono ou concentração."
      ]
    }
  ];

  const psychologicalTestsDatabase: PsychologicalTest[] = [
    {
      id: "BDI-II",
      name: "Inventário de Depressão de Beck - II",
      abbreviation: "BDI-II",
      category: "Sintomas",
      purpose: "Avaliação da gravidade da sintomatologia depressiva.",
      targetPublic: "Clínicos e não clínicos",
      ageRange: "13 a 80 anos",
      satepsiStatus: "Favorável",
      applicationType: "Individual ou coletiva, autoaplicável (approx. 5 a 10 min)",
      description: "Um dos instrumentos de autoavaliação de depressão mais amplamente aceitos em todo o mundo. Consiste em 21 itens de múltipla escolha para medir a intensidade de sintomas depressivos no paciente nas últimas duas semanas.",
      dimensionsTested: [
        "Sintomas Cognitivo-Afetivos (pessimismo, autocrítica, culpa, ideação suicida)",
        "Sintomas Somático-Fisiológicos (fadiga, alterações de sono e apetite, perda de peso)"
      ]
    },
    {
      id: "BAI",
      name: "Inventário de Ansiedade de Beck",
      abbreviation: "BAI",
      category: "Sintomas",
      purpose: "Avaliação da gravidade dos sintomas clínicos de ansiedade.",
      targetPublic: "Clínicos e não clínicos",
      ageRange: "17 a 80 anos",
      satepsiStatus: "Favorável",
      applicationType: "Individual ou coletiva, autoaplicável (approx. 5 a 10 min)",
      description: "Escala composta por 21 itens que refletem os sintomas comuns de ansiedade. O cliente avalia o grau em que foi incomodado por cada sintoma durante a última semana, usando uma escala de 4 pontos (0 = de forma alguma; 3 = gravemente).",
      dimensionsTested: [
        "Sintomas Fisiológicos/Somáticos (tremores, ondas de calor, taquicardia)",
        "Sintomas Cognitivos/Subjetivos (medo do pior, incapacidade de relaxar, pânico)"
      ]
    },
    {
      id: "BFP",
      name: "Bateria Fatorial de Personalidade",
      abbreviation: "BFP",
      category: "Personalidade",
      purpose: "Avaliação da estrutura de personalidade baseada no Big Five (Cinco Grandes Fatores).",
      targetPublic: "Profissionais, clínicos e acadêmicos",
      ageRange: "14 a 86 anos (escolaridade mínima: Ensino Fundamental)",
      satepsiStatus: "Favorável",
      applicationType: "Individual ou coletiva, papel ou informatizada (approx. 30 a 40 min)",
      description: "Instrumento multifacetado projetado para mapear a personalidade de forma robusta e padronizada para a população brasileira, ideal para psicologia clínica, organizacional, seleção e orientação profissional.",
      dimensionsTested: [
        "Neuroticismo (Vulnerabilidade, Instabilidade Emocional, Passividade, Depressão)",
        "Extroversão (Comunicação, Altivez, Dinamismo, Interações Sociais)",
        "Socialização (Amabilidade, Pró-sociabilidade, Confiança nas Pessoas)",
        "Realização (Competência, Ponderação/Prudência, Empenho/Busca de Resultados)",
        "Abertura para Novidades (Interesses Culturais, Fantasia, Busca de Novas Experiências)"
      ]
    },
    {
      id: "HTP",
      name: "HTP - Casa-Árvore-Pessoa (Técnica Projetiva de Desenho)",
      abbreviation: "HTP",
      category: "Personalidade",
      purpose: "Avaliação projetiva de aspectos da dinâmica da personalidade e autoimagem.",
      targetPublic: "Clínica Geral, Infantil e Adulto",
      ageRange: "8 anos ou mais",
      satepsiStatus: "Favorável",
      applicationType: "Individual, tempo livre (mediana de 20 a 30 minutos)",
      description: "Técnica projetiva que estimula a projeção de elementos da personalidade inconsciente por meio do ato de desenhar uma Casa (relação familiar e lar), uma Árvore (desenvolvimento vital e self inconsciente) e uma Pessoa (autoimagem física e social).",
      dimensionsTested: [
        "Desenho da Casa (segurança interna, calor doméstico, defesas e limites)",
        "Desenho da Árvore (traços vitais, contato com a realidade, traumas passados, recursos de ego)",
        "Desenho da Pessoa (esquema corporal, identidade de gênero, expressão social, conflitos interativos)"
      ]
    },
    {
      id: "WISC-IV",
      name: "Escala Wechsler de Inteligência para Crianças - 4ª Edição",
      abbreviation: "WISC-IV",
      category: "Cognitivo",
      purpose: "Avaliação do QI global e funcionamento cognitivo estrutural infantil.",
      targetPublic: "Crianças e adolescentes",
      ageRange: "6 anos e 0 meses a 16 anos e 11 meses",
      satepsiStatus: "Favorável",
      applicationType: "Individual, presencial obrigatório (approx. 60 a 90 min)",
      description: "Padrão-ouro global para avaliação de inteligência e diagnóstico de deficiência intelectual, superdotação/altas habilidades ou dificuldades específicas de aprendizagem no público em idade escolar.",
      dimensionsTested: [
        "Índice de Compreensão Verbal (ICV - Vocabulário, Semelhanças, Compreensão)",
        "Índice de Organização Perceptual (IOP - Cubos, Conceitos Figurativos, Raciocínio Matricial)",
        "Índice de Memória de Trabalho (IMT - Dígitos, Sequência de Números e Letras)",
        "Índice de Velocidade de Processamento (IVP - Código, Procurar Símbolos)"
      ]
    },
    {
      id: "EADS-21",
      name: "Escala de Depressão, Ansiedade e Estresse - 21",
      abbreviation: "EADS-21",
      category: "Sintomas",
      purpose: "Rastreamento e triagem rápida de sofrimento psíquico não específico.",
      targetPublic: "Geral (clínica, pesquisa e comunidade)",
      ageRange: "12 anos ou mais",
      satepsiStatus: "Não Restrito",
      applicationType: "Autoaplicável de 21 itens contínuos de 4 pontos (3 a 5 min)",
      description: "Versão curta em português britânico/brasileiro da DASS-21, projetada para mensurar e discriminar estados afetivos de depressão, ansiedade e estresse. Excelente para acompanhamento de evolução terapêutica semanal.",
      dimensionsTested: [
        "Depressão (disforia, desvalorização da vida, autodepreciação, apatia)",
        "Ansiedade (hiperexcitação autonômica, efeitos musculoesqueléticos, apreensão)",
        "Estresse (tensão crônica, incapacidade de relaxar, irritabilidade crônica)"
      ]
    },
    {
      id: "ASRS-18",
      name: "Adult ADHD Self-Report Scale (Escala de Autoavaliação de TDAH em Adultos)",
      abbreviation: "ASRS-18",
      category: "Sintomas",
      purpose: "Rastreio e triagem de sintomas de TDAH em indivíduos adultos.",
      targetPublic: "Adultos com queixa de desatenção ou hiperatividade",
      ageRange: "18 anos ou mais",
      satepsiStatus: "Não Restrito",
      applicationType: "Autoaplicável de 18 questões rápidas (approx. 5 min)",
      description: "Instrumento de rastreamento preliminar validado pela Organização Mundial da Saúde (OMS) para captar sintomas de desatenção e hiperatividade-impulsividade compatíveis com os critérios do DSM-5.",
      dimensionsTested: [
        "Parte A - Sintomas primários preditivos (6 itens de desatenção e hiperatividade crítica)",
        "Parte B - Detalhamento clínico secundário (12 itens adicionais de severidade)"
      ]
    },
    {
      id: "MOM-D",
      name: "Inventário de Depressão - A Mente Vencendo o Humor",
      abbreviation: "MOM-D",
      category: "Sintomas",
      purpose: "Mapeamento semanal e rastreamento de gravidade da sintomatologia depressiva.",
      targetPublic: "Pacientes em psicoterapia cognitiva ou avaliação regular",
      ageRange: "Adultos e Adolescentes",
      satepsiStatus: "Não Restrito",
      applicationType: "Autoaplicável de 15 itens contínuos de 4 pontos (3 a 5 min)",
      description: "Escala clínica do aclamado livro de terapia cognitivo-comportamental (TCC) 'A Mente Vencendo o Humor'. Permite quantificar a severidade do sofrimento depressivo nas últimas semanas e avaliar as respostas semanais do paciente à terapia.",
      dimensionsTested: [
        "Humor triste/melancólico, anedonia, cognição disfuncional de culpa ou inadequação, fadiga, isolamento, ideações dolorosas."
      ]
    },
    {
      id: "MOM-A",
      name: "Inventário de Ansiedade - A Mente Vencendo o Humor",
      abbreviation: "MOM-A",
      category: "Sintomas",
      purpose: "Rastreamento e quantificação regular de sintomas psicofisiológicos de ansiedade.",
      targetPublic: "Pacientes em tratamento psicoterápico ou de triagem",
      ageRange: "Adultos e Adolescentes",
      satepsiStatus: "Não Restrito",
      applicationType: "Autoaplicável de 15 itens de 4 pontos (3 a 5 min)",
      description: "Instrumento sensível composto por 15 itens para monitoramento semanal ou periódico de sintomas somáticos, cognitivos e autonômicos de ansiedade, baseado nas intervenções de TCC descritas no livro.",
      dimensionsTested: [
        "Tensão muscular, hiperatividade autonômica, preocupações e pensamentos apreensivos, evitação fóbica e hipervigilância."
      ]
    },
    {
      id: "MOM-R",
      name: "Inventário de Raiva - A Mente Vencendo o Humor",
      abbreviation: "MOM-R",
      category: "Sintomas",
      purpose: "Avaliação do controle expressivo, reatividade hostil e impulsividade do paciente.",
      targetPublic: "Pacientes com demandas de regulação emocional e manejo da raiva",
      ageRange: "Adultos e Adolescentes",
      satepsiStatus: "Não Restrito",
      applicationType: "Autoaplicável de 15 itens estruturados de 4 pontos (3 a 5 min)",
      description: "Permite mapear o limiar de irritabilidade, impulsos coléricos imediatos, ruminações ressentidas e desequilíbrios na expressão verbal ou corporal da agressividade ativa.",
      dimensionsTested: [
        "Irritabilidade/impaciência cotidiana, impulsos agressivos físicos/verbais, ressentimento acumulado e culpabilização de terceiros."
      ]
    },
    {
      id: "MOM-P",
      name: "Inventário de Pânico - A Mente Vencendo o Humor",
      abbreviation: "MOM-P",
      category: "Sintomas",
      purpose: "Quantificação e triagem de severidade de sintomas agudos de ansiedade extrema / pânico.",
      targetPublic: "Pacientes com histórico de crises agudas, agorafobia ou sobressaltos severos",
      ageRange: "Adultos e Adolescentes",
      satepsiStatus: "Não Restrito",
      applicationType: "Autoaplicável de 15 itens com foco em descargas adrenérgicas e evitação agorafóbica (3 a 5 min)",
      description: "Focado em mapear as manifestações somáticas desestruturantes de pânico (falta de ar, dor precordial, medo de morrer/enlouquecer) e os comportamentos secundários de evitação fóbica espacial (agorafobia).",
      dimensionsTested: [
        "Surtos somatopsíquicos agudos (cardiorrespiratórios, neurológicos), dismorfismo de controle e cognições catastróficas, evitação espacial agorafóbica."
      ]
    }
  ];

  const treatmentPlansDatabase: TreatmentPlan[] = [
    {
      id: "plan-depressao",
      disorder: "Transtorno Depressivo Maior (TDM)",
      approach: "Terapia Cognitivo-Comportamental (TCC)",
      category: "Mood",
      recommendedSessions: "18 a 22 sessões semanais",
      phases: [
        {
          title: "Fase 1: Aliança, Sintomatologia e Psicoeducação (Sessões 1-4)",
          objectives: [
            "Estabelecer forte aliança terapêutica e avaliar risco de suicídio.",
            "Apresentar a tríade cognitiva da depressão e o modelo de pensamentos-emoções-comportamentos.",
            "Implementar automonitoramento básico de humor e de rotina diária."
          ],
          techniques: [
            "Contrato Psicoterapêutico / Escuta Empática",
            "Diagrama de Conceituação Cognitiva",
            "Autoanálise do Humor Diário"
          ]
        },
        {
          title: "Fase 2: Ativação Comportamental (BA) (Sessões 5-10)",
          objectives: [
            "Identificar ciclos de esquiva comportamental / isolamento alimentados pela depressão.",
            "Programar atividades de domínio (realização) e prazer.",
            "Aumentar o engajamento e as taxas de reforçamento ambiental positivo."
          ],
          techniques: [
            "Planejamento de Atividades Prazerosas e Produtivas",
            "Divisão de tarefas de alta complexidade em porções micro-controláveis",
            "Treino de Resolução Metódica de Problemas reais"
          ]
        },
        {
          title: "Fase 3: Reestruturação Cognitiva (Sessões 11-16)",
          objectives: [
            "Identificar distorções cognitivas proeminentes (ex: catastrofização, pensamento preto no branco).",
            "Desafiar pensamentos automáticos de inutilidade, fracasso e desespero.",
            "Intervir sobre crenças nucleares de desvalor, desamor ou desamparo."
          ],
          techniques: [
            "Questionamento Socrático",
            "Registro de Pensamentos Disfuncionais (RPD)",
            "Experimentos Comportamentais para colher contraevidências"
          ]
        },
        {
          title: "Fase 4: Consolidação, Alta e Prevenção de Recaída (Sessões 17-20)",
          objectives: [
            "Consolidar as habilidades aprendidas na terapia para evitar recaídas sob estresse.",
            "Prever gatilhos de recaída futura e formular respostas construtivas estruturadas.",
            "Espaçar as sessões terapêuticas para quinzenais e concluir com foco na independência."
          ],
          techniques: [
            "Criação de um Cartão de Prevenção de Crise",
            "Carta para si mesmo (resumo das técnicas de salvação)",
            "Agendamento de sessões de booster (manutenção de 3 em 3 meses)"
          ]
        }
      ],
      therapeuticActivities: [
        "Leitura do livro 'A Mente Vencendo a Depressão' (psicoeducação complementar)",
        "Manter um Diário da Gratidão (exercício de foco em eventos adaptativos positivos)",
        "Atividades físicas regulares leves agendadas de forma rígida comportamental"
      ]
    },
    {
      id: "plan-tag",
      disorder: "Transtorno de Ansiedade Generalizada (TAG)",
      approach: "TCC clássica + Modelo de Dugas (Intolerância à Incerteza)",
      category: "Anxiety",
      recommendedSessions: "16 a 20 sessões",
      phases: [
        {
          title: "Fase 1: Mapeamento, Relaxamento e Desmistificação da Ansiedade (Sessões 1-4)",
          objectives: [
            "Mapear o fluxo de preocupações do paciente (produtivas vs. improdutivas).",
            "Apresentar a ansiedade como um alarme fisiológico adaptativo hiperativado.",
            "Desenvolver ferramentas de regulação somática rápida de ansiedade física."
          ],
          techniques: [
            "Relaxamento Progressivo de Jacobson / Treino de Respiração Diafragmática",
            "Técnica de Adiamento da Preocupação (reservar um 'Tempo para Preocupar-se')",
            "Gráficos de Círculo Vicioso da Ansiedade"
          ]
        },
        {
          title: "Fase 2: Flexibilização de Modelos Mentais de Ansiedade (Sessões 5-11)",
          objectives: [
            "Identificar pensamentos e crenças de utilidade positiva da preocupação ('preciso sofrer de véspera para me proteger').",
            "Desafiar a estimativa de probabilidade (superestimação da catástrofe).",
            "Mapear e desafiar comportamentos de busca constante por segurança ou reasseguramento."
          ],
          techniques: [
            "Fórmula de Descatastrofização ('O que de pior pode acontecer? Como eu lidaria?')",
            "Questionamento Socrático focado na inutilidade e sofrimento da preocupação",
            "Inventário de Intolerância à Incerteza"
          ]
        },
        {
          title: "Fase 3: Exposição Cognitiva Imaginética e Comportamental (Sessões 12-16)",
          objectives: [
            "Evidenciar na prática que incertezas e falhas de controle são toleráveis.",
            "Reduzir gradualmente comportamentos sutis de esquiva do perigo.",
            "Realizar exposição imaginética prolongada ao pior cenário temido até habituação."
          ],
          techniques: [
            "Criação de scripts escritos descrevendo os medos finais sem as soluções compensatórias",
            "Experimentos comportamentais de descontrole controlado (ex: delegar tarefas sem revisar)",
            "Meditação da atenção plena / Mindfulness para tolerância de pensamentos ansiosos"
          ]
        },
        {
          title: "Fase 4: Prevenção de Recaída e Alta (Sessões 17-20)",
          objectives: [
            "Assumir o papel de 'seu próprio terapeuta' de forma autônoma.",
            "Saber diferenciar flutuações normais de humor de recaídas crônicas.",
            "Reduzir o engajamento com notícias ruins ou hiperestimulações estressoras."
          ],
          techniques: [
            "Mapeamento de gatilhos corporais primários",
            "Lista de Verificação Cognitiva Semanal autopreenchida",
            "Contrato de encerramento amigável"
          ]
        }
      ],
      therapeuticActivities: [
        "Prática diária de 10-15 minutos de áudio guia de respiração diafragmática profunda",
        "Diário de experimentos comportamentais de tolerância à incerteza",
        "Higiene do sono e desligamento de dispositivos eletrônicos 1h antes de deitar"
      ]
    },
    {
      id: "plan-tdah",
      disorder: "Transtorno de Déficit de Atenção e Hiperatividade (TDAH)",
      approach: "TCC Metódica Baseada em Habilidades de Mary Solanto",
      category: "Neurodev",
      recommendedSessions: "12 a 16 sessões dedicadas",
      phases: [
        {
          title: "Fase 1: Aceitação Radical, Psicoeducação e Agenda Única (Sessões 1-3)",
          objectives: [
            "Despatologizar e desconstruir cicatrizes morais de autodepreciação ('preguiçoso', 'burro').",
            "Educar sobre o córtex pré-frontal e as falhas cognitivas de funções executivas.",
            "Estabelecer um sistema centralizado externo de controle indispensável (Agenda Única)."
          ],
          techniques: [
            "Reconceituação do diagnóstico fundamentada na neurobiologia",
            "Treino de 'Agenda e Calendário Único' de preenchimento rígido diário",
            "Alinhamento e remoção de redundância de agendas digitais/físicas"
          ]
        },
        {
          title: "Fase 2: Gestão do Tempo, Fatiamento e Iniciação (Sessões 4-10)",
          objectives: [
            "Desenvolver habilidades de percepção do tempo real sob sintomas de 'cegueira temporal'.",
            "Combater a procrastinação e a paralisia decisória diante de rotinas volumosas.",
            "Otimizar o ambiente físico e o ecossistema digital para evitar gatilhos distratores."
          ],
          techniques: [
            "Técnica de Fatiamento (Chunking): Listar etapas atômicas de cada tarefa",
            "Regra dos 2 Minutos para atividades imediatas e uso do timer visual (ex: Pomodoro)",
            "Design do 'Ambiente Livre de Distrações' (configurações restritivas de celular e mesa de trabalho)"
          ]
        },
        {
          title: "Fase 3: Regulação Emocional e Falatório Mental (Sessões 11-13)",
          objectives: [
            "Reestruturar pensamentos automáticos de inadequação ou incapacidade.",
            "Gerenciar a impulsividade de gastos e comunicações intempestivas.",
            "Lidar de forma madura com a frustração do tédio crônico em tarefas estáticas."
          ],
          techniques: [
            "Conversar consigo em terceira pessoa ou usar auto-instruções de contenção",
            "Protocolos de desaceleração de impulsos (Regra das 24 Horas para compras)",
            "Escrita Expressiva de dejeto mental nos momentos de hiperfoco"
          ]
        },
        {
          title: "Fase 4: Consolidação dos Novos Hábitos (Sessões 14-16)",
          objectives: [
            "Blindar o progresso contra os sentimentos de tédio da própria terapia.",
            "Estruturar rotinas estáveis para o paciente manter mesmo em situações de férias ou estresse elevado.",
            "Ancorar sistemas de check-in semanais de manutenção."
          ],
          techniques: [
            "Sistemas de Parcerias de Responsabilidade (ex: co-working físico ou digital)",
            "Painel Visual de Hábitos Mínimos Inegociáveis",
            "Checklist de Recuperação pós-paralisia"
          ]
        }
      ],
      therapeuticActivities: [
        "Auto-rastreamento em diário de metas diárias de organização",
        "Implementar a 'Regra da Cadeira Limpa' / 'Gaveta Livre' no ambiente doméstico",
        "Adoção de relógio de pulso ou timer físico visível para controle de tarefas"
      ]
    },
    {
      id: "plan-borderline",
      disorder: "Transtorno de Personalidade Limítrofe (Borderline / Desregulação Severa)",
      approach: "Terapia Dialética Comportamental (DBT)",
      category: "Personality",
      recommendedSessions: "Treino de Skills 6-12 meses (associado a terapia individual)",
      phases: [
        {
          title: "Fase 1: Sobrevivência, Aliança Segura e Tolerância ao Mal-Estar (Sessões 1-12)",
          objectives: [
            "Eliminar de forma incondicional comportamentos suicidas, ideações graves e autodestruição.",
            "Trabalhar sobre comportamentos que interfiram ativamente na aliança terapêutica.",
            "Aprender a tolerar crises emocionais agudas sem recorrer a automutilação ou impulsividade física."
          ],
          techniques: [
            "Instruções e Registro das Habilidades de Tolerância ao Mal-Estar (TIPP, STOP, Aceitação Radical)",
            "Análise em Cadeia (Chain Analysis) de comportamentos autolesivos",
            "Uso diário obrigatório de Cartões de Atendimento / Diários (Diary Cards)"
          ]
        },
        {
          title: "Fase 2: Mindfulness Crítico e Regulação de Emoções Intensas (Sessões 13-24)",
          objectives: [
            "Diferenciar a dor inevitável do sofrimento opcional alimentado por pensamentos.",
            "Aprender a identificar, nomear e aceitar as emoções difíceis sem reatividades agressivas.",
            "Reduzir a vulnerabilidade à 'Mente Emocional' por meio do autocuidado."
          ],
          techniques: [
            "Habilidade de Mindfulness de Atenção Plena: Mente Sábia (Wise Mind), Observar, Descrever",
            "Habilidade de Regulação Emocional: Agir de Forma Oposta à emoção indesejada (Ação Oposta)",
            "Protocolo PLEASE para redução de vulnerabilidade física"
          ]
        },
        {
          title: "Fase 3: Efetividade Interpessoal, Autopercepção e Dialética (Sessões 25-36)",
          objectives: [
            "Aprender a expressar desejos, dizer 'não' de maneira assertiva sem quebrar vínculos saudáveis.",
            "Diminuir as reatividades de raiva extrema e oscilações idealização/desvalorização.",
            "Consolidar a autovalidação, curando e aceitando episódios passados de invalidação grave."
          ],
          techniques: [
            "Habilidade de Efetividade Interpessoal: DEAR MAN, GIVE, FAST (comunicação e respeito próprio)",
            "Treino de Respeito Dialético (Saber encontrar o equilíbrio de aceitação vs. mudança)",
            "Técnicas de Autovalidação Sistemática"
          ]
        }
      ],
      therapeuticActivities: [
        "Plausível preenchimento diário do Diary Card (humor, impulsos, skills utilizadas)",
        "Escrita de cartas de aceitação profunda e práticas semanais de Mente Sábia",
        "Formatação de Kit de Primeiros Socorros de Crise de Mal-Estar (itens com texturas agradáveis, gelo, aromas)"
      ]
    }
  ];

  // FILTERS LABELS
  const ethicsCategories = [
    { value: 'all', label: 'Todos os Artigos' },
    { value: 'principios', label: 'Princípios Fundamentais (I a VII)' },
    { value: 'deveres', label: 'Deveres Fundamentais' },
    { value: 'proibicoes', label: 'Proibições' },
    { value: 'sigilo', label: 'Sigilo e Confidencialidade' }
  ];

  const cidCategories = [
    { value: 'all', label: 'Todos os Grupos' },
    { value: 'F00-F09 (Orgânicos)', label: 'F00-F09 Transtornos Orgânicos' },
    { value: 'F10-F19 (Substâncias)', label: 'F10-F19 Uso de Substâncias' },
    { value: 'F20-F29 (Psicóticos)', label: 'F20-F29 Esquizofrenia e Psicóticos' },
    { value: 'F30-F39 (Humor)', label: 'F30-F39 Transtornos de Humor' },
    { value: 'F40-F48 (Ansiedade/Estresse)', label: 'F40-F48 Ansiedade, TOC e Estresse' },
    { value: 'F50-F59 (Fisiológicos)', label: 'F50-F59 Alimentares e do Sono' },
    { value: 'F60-F69 (Personalidade)', label: 'F60-F69 Personalidade Adulta' },
    { value: 'F80-F89 (Desenvolvimento)', label: 'F80-F89 Transtornos do Desenvolvimento' },
    { value: 'F90-F98 (Infância/Adol.)', label: 'F90-F98 Infância e Adolescência' }
  ];

  const dsmCategories = [
    { value: 'all', label: 'Todas as Condições' },
    { value: 'Transtornos Depressivos', label: 'Depressão e Subtipos' },
    { value: 'Transtornos de Ansiedade', label: 'Ansiedade e Pânico' },
    { value: 'Transtornos do Neurodesenvolvimento', label: 'TDAH, Autismo (Neurodesenvolvimento)' },
    { value: 'Transtornos de Personalidade', label: 'Borderline e Personalidade' },
    { value: 'Transtornos relacionados a Trauma', label: 'TEPT e Estresse' }
  ];

  const testesCategories = [
    { value: 'all', label: 'Todos os Testes' },
    { value: 'Favorável', label: 'SATEPSI: Favorável' },
    { value: 'Não Restrito', label: 'Uso Livre / Não Restrito' },
    { value: 'Personalidade', label: 'Filtro: Personalidade' },
    { value: 'Cognitivo', label: 'Filtro: Cognitivo & QI' },
    { value: 'Sintomas', label: 'Filtro: Humor, Rastreio & Sintomas' }
  ];

  const planosCategories = [
    { value: 'all', label: 'Todos os Planos' },
    { value: 'Mood', label: 'Depressão e Humor' },
    { value: 'Anxiety', label: 'Ansiedade e Pânico' },
    { value: 'Neurodev', label: 'TDAH & Neurodesenvolvimento' },
    { value: 'Personality', label: 'Desregulação Borderline' }
  ];

  // FILTERED RESULTS
  const filteredEthics = ethicsArticles.filter(item => {
    const matchesSearch = item.article.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCid = cid15Database.filter(item => {
    const matchesSearch = item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredDsm = dsm5Database.filter(item => {
    const matchesSearch = item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredTestes = psychologicalTestsDatabase.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.purpose.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.dimensionsTested.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || 
                            item.satepsiStatus === categoryFilter || 
                            item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredPlanos = treatmentPlansDatabase.filter(item => {
    const matchesSearch = item.disorder.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.approach.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.therapeuticActivities.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          item.phases.some(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.objectives.some(o => o.toLowerCase().includes(searchTerm.toLowerCase())) || p.techniques.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredRecursos = CLINICAL_RESOURCES.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.demand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.instructions.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Top action header card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-700/15 via-transparent to-transparent"></div>
        <div className="relative z-10 space-y-2">
          <span className="bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
            Centro de Conhecimento e Apoio Clínico
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-sans">
            Manual de Referências e Ética
          </h2>
          <p className="text-slate-300 text-xs max-w-xl font-medium leading-relaxed">
            Consulte rapidamente o Código de Ética Profissional do Psicólogo (CFP), encontre códigos diagnósticos CID-10 atualizados e verifique os critérios oficiais do manual DSM-5 para anexar às suas evoluções e atestados de forma fundamentada.
          </p>
        </div>
      </div>

      {/* Main Category Tabs Selector */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-xs">
        
        {/* Navigation buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 bg-slate-50 p-1 rounded-xl shrink-0 w-full xl:w-auto">
          <button
            onClick={() => {
              setActiveSubTab('etica');
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'etica'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ética Profissional</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('cid10');
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'cid10'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Banco de CID-10</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('dsm5');
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'dsm5'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpenCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Critérios DSM-5</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('testes');
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'testes'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
            <span>Testes Psicológicos</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('planos');
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'planos'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span>Planos de Tratamento</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('recursos');
              setSearchTerm('');
              setCategoryFilter('all');
              // Auto-select first resource of our resources
              if (CLINICAL_RESOURCES.length > 0) {
                setActiveResource(CLINICAL_RESOURCES[0]);
                setResourceFormValues(CLINICAL_RESOURCES[0].defaultValues);
              }
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'recursos'
                ? 'bg-white text-rose-800 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-rose-500" />
            <span>Recursos Clínicos</span>
          </button>
        </div>

        {/* Dynamic Context Header text */}
        <div className="hidden xl:flex items-center gap-1.5 pr-2 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Auxílio rápido para fundamentação jurídica e clínica</span>
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Search bar inputs */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeSubTab === 'etica'
                  ? 'Buscar artigo, dever ou palavra-chave (ex: sigilo, menor)...'
                  : activeSubTab === 'cid10'
                  ? 'Buscar por código CID ou transtorno (ex: F41.1, ansiedade)...'
                  : activeSubTab === 'dsm5'
                  ? 'Buscar condição do DSM-5 (ex: depressão, autismo, TDAH)...'
                  : activeSubTab === 'testes'
                  ? 'Buscar teste por nome, sigla ou finalidade (ex: BDI, HTP)...'
                  : activeSubTab === 'recursos'
                  ? 'Buscar recursos clínicos por título, finalidade, demanda ou instruções...'
                  : 'Buscar planos de tratamento por transtorno, técnicas ou atividades...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 tracking-tight transition-all"
            />
          </div>

          {/* Group filters dropdown */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white tracking-tight appearance-none cursor-pointer outline-none"
            >
              {activeSubTab === 'etica' && ethicsCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
              {activeSubTab === 'cid10' && cidCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
              {activeSubTab === 'dsm5' && dsmCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
              {activeSubTab === 'testes' && testesCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
              {activeSubTab === 'planos' && planosCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
              {activeSubTab === 'recursos' && [
                { value: 'all', label: 'Todos os Recursos' },
                { value: 'Questionário', label: 'Apenas Questionários' },
                { value: 'Tarefa Terapêutica', label: 'Apenas Tarefas Terapêuticas' }
              ].map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* RENDER DYNAMIC DATABASES */}
      <div className="text-left">
        
        {/* --- ETHICS TAB --- */}
        {activeSubTab === 'etica' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
                Resolução CFP nº 10/2005 (Código de Ética)
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">
                Mostrando {filteredEthics.length} resultados
              </span>
            </div>

            {filteredEthics.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-bold">Nenhum artigo ou princípio encontrado</p>
                <p className="text-slate-400 text-[10px] mt-1">Experimente buscar por outros termos de ética.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEthics.map((art) => {
                  const copyFormat = `${art.article} - ${art.title}\n"${art.text}"\n(Fonte: Código de Ética Profissional do Psicólogo, Resolução CFP Nº 10/05)`;
                  return (
                    <div 
                      key={art.article} 
                      className="bg-white rounded-2.5xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                    >
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              art.category === 'principios' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                              art.category === 'deveres' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              art.category === 'proibicoes' ? 'bg-red-50 text-red-600 border border-red-100' :
                              art.category === 'sigilo' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-slate-50 text-slate-600 border border-slate-100'
                            }`}>
                              {art.category === 'principios' ? 'Princípio Fundamental' :
                               art.category === 'deveres' ? 'Dever Clínico' :
                               art.category === 'proibicoes' ? 'Conduta Proibida' :
                               art.category === 'sigilo' ? 'Sigilo Clínico' :
                               'Disposição Geral'}
                            </span>
                            <h4 className="text-slate-800 font-extrabold text-xs text-indigo-950 mt-1.5">{art.article}: {art.title}</h4>
                          </div>
                          <button
                            onClick={() => handleCopyText(copyFormat, art.article)}
                            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 group-hover:opacity-100 transition-opacity"
                            title="Copiar citação para o atestado"
                          >
                            {copiedId === art.article ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed font-medium font-sans">
                          {art.text}
                        </p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-semibold italic">CFP Res. 10/05</span>
                        <span className="text-[8.5px] text-indigo-500 font-bold group-hover:underline flex items-center gap-1 cursor-pointer" onClick={() => handleCopyText(copyFormat, art.article)}>
                          Copiar Citação
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- CID-10 TAB --- */}
        {activeSubTab === 'cid10' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
                CID-10 Código de Doenças (Capítulo V: F00-F99)
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">
                Mostrando {filteredCid.length} códigos
              </span>
            </div>

            {filteredCid.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-bold">Código do CID-10 não encontrado</p>
                <p className="text-slate-400 text-[10px] mt-1">Busque por termos como "depressão", "F41" ou "ansiedade".</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredCid.map((cid) => {
                  const copyFormat = `${cid.code} - ${cid.name}`;
                  return (
                    <div 
                      key={cid.code} 
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 text-left">
                        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-mono text-xs font-black shrink-0 border border-emerald-100 flex items-center justify-center">
                          {cid.code}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-slate-800 font-extrabold text-xs truncate leading-snug">{cid.name}</h4>
                            <span className="text-[8.5px] bg-slate-50 text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded font-bold shrink-0 hidden md:inline-block">
                              {cid.category}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[10.5px] leading-relaxed line-clamp-2 md:line-clamp-1">
                            {cid.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded md:hidden">
                          {cid.category}
                        </span>
                        <button
                          onClick={() => handleCopyText(copyFormat, cid.code)}
                          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-emerald-700 text-slate-600 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                          title="Copiar Código e Nome"
                        >
                          {copiedId === cid.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 text-[9.5px]">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copiar Código</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- DSM-5 TAB --- */}
        {activeSubTab === 'dsm5' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <BookOpenCheck className="w-4 h-4 text-blue-500 shrink-0" />
                Guia de Critérios Diagnósticos do DSM-5 Summarizado
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">
                Mostrando {filteredDsm.length} transtornos
              </span>
            </div>

            {filteredDsm.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-bold">Resumo diagnóstico não encontrado</p>
                <p className="text-slate-400 text-[10px] mt-1">Busque por autismo, TAG, TDAH ou borderline.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDsm.map((dsm) => {
                  const copyFormat = `${dsm.name}\n${dsm.description}\nSintomas/Critérios:\n${dsm.symptoms?.map(s => `- ${s}`).join('\n')}\n(Critérios diagnósticos baseados no DSM-5)`;
                  return (
                    <div 
                      key={dsm.code} 
                      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 text-left hover:shadow-md transition-all relative group"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[8.5px] bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                            {dsm.category}
                          </span>
                          <h4 className="text-slate-800 font-black text-sm tracking-tight pt-1.5">{dsm.name}</h4>
                        </div>
                        
                        <button
                          onClick={() => handleCopyText(copyFormat, dsm.code)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold flex items-center gap-1.5"
                          title="Copiar todos os critérios recapitulados"
                        >
                          {copiedId === dsm.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 text-[9.5px]">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copiar Critérios</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-slate-600 text-xs font-bold font-sans">
                          {dsm.description}
                        </p>
                        
                        {dsm.symptoms && dsm.symptoms.length > 0 && (
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-1 pl-4 list-disc text-slate-500 font-medium text-[11px] leading-relaxed">
                            {dsm.symptoms.map((sym, index) => (
                              <li key={index} className="pl-0.5 marker:text-blue-400 leading-normal">
                                {sym}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-semibold italic flex items-center justify-between">
                        <span>American Psychiatric Association (APA) • DSM-5 Guideline</span>
                        <span className="text-[8px] bg-slate-100 text-slate-500 font-mono font-bold px-1.5 py-0.5 rounded">
                          {dsm.code}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- PSYCHOLOGICAL TESTS TAB --- */}
        {activeSubTab === 'testes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-indigo-500 shrink-0" />
                Guia de Testes Psicológicos & Escalas de Rastreio
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">
                Mostrando {filteredTestes.length} testes
              </span>
            </div>

            {filteredTestes.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-bold">Nenhum teste encontrado para esses termos</p>
                <p className="text-slate-400 text-[10px] mt-1">Busque por siglas como BDI, BAI, HTP ou categorias como cognição.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTestes.map((test) => {
                  const copyFormat = `${test.name} (${test.abbreviation})\nFinalidade: ${test.purpose}\nPúblico-Alvo: ${test.targetPublic} | Faixa Etária: ${test.ageRange}\nSATEPSI: ${test.satepsiStatus}\nTipo de Aplicação: ${test.applicationType}\nDescrição: ${test.description}\nSubescalas/Dimensões:\n${test.dimensionsTested.map(d => `- ${d}`).join('\n')}`;
                  return (
                    <div 
                      key={test.id} 
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group text-left"
                    >
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="bg-indigo-50 text-indigo-700 font-mono text-xs font-black px-2.5 py-1 rounded-xl border border-indigo-100">
                                {test.abbreviation}
                              </span>
                              <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                test.satepsiStatus === 'Favorável' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                SATEPSI: {test.satepsiStatus}
                              </span>
                              <span className="bg-slate-50 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-100">
                                {test.category === 'Personalidade' ? 'Personalidade' : test.category === 'Cognitivo' ? 'Cognitivo/QI' : 'Humor & Rastreio'}
                              </span>
                            </div>
                            <h4 className="text-slate-800 font-black text-sm tracking-tight pt-1.5">
                              {test.name}
                            </h4>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                            {/* 1. Aplicar Escala (Azul Claro) */}
                            <button
                              onClick={() => {
                                setSelectedTestToRun(test.id);
                                setTestMode('interactive');
                                setInteractiveAnswers({});
                                setManualRawScore('');
                              }}
                              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-700 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer border border-sky-150 shadow-xs"
                              title="Aplicar escala digital e responder perguntas"
                            >
                              <Play className="w-3.5 h-3.5 text-sky-600 fill-sky-600 shrink-0" />
                              <span>Aplicar Escala</span>
                            </button>

                            {/* 2. Lançar Escore (Azul Vibrante) */}
                            <button
                              onClick={() => {
                                setSelectedTestToRun(test.id);
                                setTestMode('direct');
                                setInteractiveAnswers({});
                                setManualRawScore('');
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer border border-blue-700 shadow-sm hover:shadow-md"
                              title="Lançar escore final para gerar laudo/nota rápida"
                            >
                              <Brain className="w-3.5 h-3.5 text-white shrink-0" />
                              <span>Lançar Escore</span>
                            </button>

                            <button
                              onClick={() => handleCopyText(copyFormat, test.id)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-700 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-100"
                              title="Copiar dados estruturados do teste"
                            >
                              {copiedId === test.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-emerald-600 text-[9.5px]">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Copiar Ficha</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-600">
                          <div>
                            <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block mb-0.5">Finalidade Primária:</span>
                            <p className="font-semibold text-slate-700">{test.purpose}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block mb-0.5">Público-Alvo & Idades:</span>
                            <p className="font-semibold text-slate-700">{test.targetPublic} ({test.ageRange})</p>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block mb-0.5">Tipo de Aplicação:</span>
                            <p className="font-semibold text-slate-700">{test.applicationType}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                          <div>
                            <span className="text-[10px] font-black text-indigo-850 uppercase tracking-wider block mb-1">Descrição Técnica:</span>
                            <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{test.description}</p>
                          </div>
                          {test.dimensionsTested.length > 0 && (
                            <div>
                              <span className="text-[10px] font-black text-indigo-850 uppercase tracking-wider block mb-1.5">Estrutura Interna / Dimensões Avaliadas:</span>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 pl-4 list-disc text-slate-500 font-semibold text-[10.5px]">
                                {test.dimensionsTested.map((dim, index) => (
                                  <li key={index} className="marker:text-indigo-400">
                                    {dim}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-3.5 mt-4 border-t border-slate-50 text-[9.5px] text-slate-400 font-bold flex justify-between items-center">
                        <span>Conselho Federal de Psicologia (CFP) • Nota Técnica SATEPSI</span>
                        <span className="text-indigo-600 hover:underline cursor-pointer" onClick={() => handleCopyText(copyFormat, test.id)}>
                          Utilizar Citação Técnica
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TREATMENT PLANS TAB --- */}
        {activeSubTab === 'planos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-600 shrink-0" />
                Planos de Direcionamento Terapêutico Baseados em Evidências
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">
                Mostrando {filteredPlanos.length} planos de tratamento
              </span>
            </div>

            {filteredPlanos.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-bold">Nenhum protocolo ou plano encontrado</p>
                <p className="text-slate-400 text-[10px] mt-1">Busque por TCC, depressão, TDAH ou DBT.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredPlanos.map((plan) => {
                  const copyFormat = `PROTOCOLO CLÍNICO - ${plan.disorder}\nAbordagem: ${plan.approach}\nDuração Estimada: ${plan.recommendedSessions}\n\nFASES DO TRATAMENTO:\n${plan.phases.map((ph, idx) => '[Fase ' + (idx+1) + '] ' + ph.title + '\n- Objetivos:\n' + ph.objectives.map(o => '  * ' + o).join('\n') + '\n- Técnicas:\n' + ph.techniques.map(t => '  * ' + t).join('\n')).join('\n\n')}\n\nTarefas/Atividades extraclasse sugeridas:\n${plan.therapeuticActivities ? plan.therapeuticActivities.map(a => '- ' + a).join('\n') : ''}`;
                  return (
                    <div 
                      key={plan.id} 
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="bg-purple-50 text-purple-700 text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-100">
                              {plan.approach}
                            </span>
                            <span className="bg-slate-50 text-slate-500 text-[9px] font-bold border border-slate-100 px-2 py-0.5 rounded-full">
                              Estimativa: {plan.recommendedSessions}
                            </span>
                          </div>
                          <h4 className="text-slate-800 font-black text-sm tracking-tight pt-1">
                            {plan.disorder}
                          </h4>
                        </div>

                        <button
                          onClick={() => handleCopyText(copyFormat, plan.id)}
                          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-purple-700 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer self-start sm:self-center"
                          title="Copiar estrutura de sessões para seu plano clínico"
                        >
                          {copiedId === plan.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 text-[9.5px]">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copiar Protocolo</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest block">Estrutura Evolutiva por Fases:</span>
                        
                        <div className="space-y-3 pl-3 border-l-2 border-purple-100">
                          {plan.phases.map((phase, pIdx) => (
                            <div key={pIdx} className="space-y-1.5 relative pl-4 pb-2">
                              {/* Dot decorator */}
                              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 border border-white shadow-xs"></div>
                              
                              <h5 className="text-[11.5px] font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                {phase.title}
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50/40 p-3 rounded-2xl border border-slate-100 text-[11px]">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">🎯 Objetivos da Fase:</span>
                                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-semibold leading-relaxed">
                                    {phase.objectives.map((obj, oIdx) => (
                                      <li key={oIdx}>{obj}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-2.5 md:pt-0 md:pl-4">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">🛠️ Técnicas & Ferramentas Chave:</span>
                                  <ul className="list-disc pl-4 space-y-0.5 text-purple-950 font-black leading-relaxed">
                                    {phase.techniques.map((tec, tIdx) => (
                                      <li key={tIdx} className="marker:text-purple-400">{tec}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {plan.therapeuticActivities && plan.therapeuticActivities.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest block mb-2">🏡 Atividades Terapêuticas Recomendadas (Homework):</span>
                          <div className="bg-purple-50/30 p-3.5 rounded-2xl border border-purple-50 flex flex-wrap gap-2 text-[10.5px]">
                            {plan.therapeuticActivities.map((act, aIdx) => (
                              <div key={aIdx} className="bg-white border border-purple-100 rounded-xl px-3 py-1.5 text-slate-700 font-semibold shadow-2xs flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0"></span>
                                {act}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 mt-1 border-t border-slate-50 text-[9px] text-slate-400 font-bold flex justify-between items-center">
                        <span>Diretrizes e Protocolos de Saúde Baseados em Evidências Clínicas</span>
                        <span className="text-purple-600 hover:underline cursor-pointer" onClick={() => handleCopyText(copyFormat, plan.id)}>
                          Exportar Plano de Trabalho
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- CLINICAL RESOURCES TAB --- */}
        {activeSubTab === 'recursos' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h3 className="text-slate-800 font-extrabold text-lg tracking-tight flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-rose-500" />
                    Biblioteca Integrada de Recursos Clínicos & Tarefas Terapêuticas
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold">
                    Questionários estruturados, diários de acompanhamento e tarefas extraclasse interativas prontas para aplicar e exportar de acordo com a demanda do paciente.
                  </p>
                </div>
              </div>

              {/* Demand Tabs Selection */}
              <div className="flex flex-wrap gap-2 pt-1">
                {CLINICAL_DEMANDS.map((demand) => {
                  const isActive = selectedDemand === demand;
                  let colorClass = 'border-slate-100 text-slate-600 hover:bg-slate-50';
                  if (isActive) {
                    if (demand === 'Ansiedade e Pânico') colorClass = 'bg-sky-50 text-sky-700 border-sky-200';
                    else if (demand === 'Depressão e Desânimo') colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    else if (demand === 'TDAH e Procrastinação') colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
                    else if (demand === 'Estresse e Burnout') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    else colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
                  }

                  return (
                    <button
                      key={demand}
                      onClick={() => {
                        setSelectedDemand(demand);
                        // Auto-select first resource of this demand
                        const demandRes = CLINICAL_RESOURCES.filter(r => r.demand === demand);
                        if (demandRes.length > 0) {
                          setActiveResource(demandRes[0]);
                          setResourceFormValues(demandRes[0].defaultValues);
                        } else {
                          setActiveResource(null);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${colorClass}`}
                    >
                      {demand}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split layout: List of resources on Left, Interactive Playground on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Left Column: Resources List */}
              <div className="lg:col-span-4 space-y-3 text-left">
                <div className="bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Recursos para {selectedDemand}</span>
                </div>

                {filteredRecursos.filter(r => r.demand === selectedDemand).length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-slate-400 text-xs font-semibold">
                    Nenhum recurso encontrado com os termos de busca atuais para esta demanda.
                  </div>
                ) : (
                  filteredRecursos.filter(r => r.demand === selectedDemand).map((res) => {
                    const isSelected = activeResource?.id === res.id;
                    const isQuestionnaire = res.type === 'Questionário';
                    
                    return (
                      <button
                        key={res.id}
                        onClick={() => {
                          setActiveResource(res);
                          setResourceFormValues(res.defaultValues);
                        }}
                        className={`w-full text-left p-4 rounded-3xl border transition-all cursor-pointer block space-y-2 ${
                          isSelected 
                            ? 'bg-white border-rose-500 shadow-md ring-1 ring-rose-500' 
                            : 'bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isQuestionnaire ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {res.type}
                          </span>
                        </div>
                        <h4 className="text-slate-800 font-extrabold text-xs leading-snug">{res.title}</h4>
                        <p className="text-slate-500 text-[10.5px] font-medium leading-relaxed line-clamp-2">{res.description}</p>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Interactive Simulator */}
              <div className="lg:col-span-8">
                {activeResource ? (
                  <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden flex flex-col text-left">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            activeResource.type === 'Questionário' ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {activeResource.type}
                          </span>
                          <span className="text-slate-400 text-xs font-semibold">•</span>
                          <span className="text-slate-500 text-[10.5px] font-black uppercase tracking-wide">{activeResource.demand}</span>
                        </div>
                      </div>
                      <h3 className="text-slate-800 font-black text-sm sm:text-base tracking-tight">{activeResource.title}</h3>
                      <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">{activeResource.description}</p>
                      <div className="p-2.5 bg-rose-50/35 border border-rose-100/50 rounded-2xl flex items-start gap-2 mt-2">
                        <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="text-[10.5px] text-slate-600 font-semibold leading-relaxed">
                          <strong className="text-rose-700">Instruções de Uso Clínico:</strong> {activeResource.instructions}
                        </span>
                      </div>
                    </div>

                    {/* Form Fields & Live View Splits */}
                    <div className="p-5 sm:p-6 space-y-6">
                      
                      {/* Name entry */}
                      <div className="space-y-1.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/80">
                        <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                          <Smile className="w-3.5 h-3.5 text-slate-500" /> Identificação do Paciente (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Digite o nome completo do paciente..."
                          value={resourcePatientName}
                          onChange={(e) => setResourcePatientName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Interactive Fields Generator */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Campos do Instrumento Terapêutico</h4>
                        
                        {activeResource.fields.map((field) => {
                          const value = resourceFormValues[field.id] !== undefined ? resourceFormValues[field.id] : '';
                          
                          return (
                            <div key={field.id} className="space-y-1.5">
                              <label className="text-[11px] font-black text-slate-700 block tracking-tight leading-snug">
                                {field.label}
                              </label>

                              {field.type === 'textarea' && (
                                <textarea
                                  placeholder={field.placeholder}
                                  value={value}
                                  onChange={(e) => setResourceFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                  rows={3}
                                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl p-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden transition-all"
                                />
                              )}

                              {field.type === 'text' && (
                                <input
                                  type="text"
                                  placeholder={field.placeholder}
                                  value={value}
                                  onChange={(e) => setResourceFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden transition-all"
                                />
                              )}

                              {field.type === 'select' && (
                                <select
                                  value={value}
                                  onChange={(e) => setResourceFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-rose-500 focus:bg-white focus:outline-hidden transition-all"
                                >
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              )}

                              {field.type === 'slider' && (
                                <div className="space-y-1 p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-4">
                                  <input
                                    type="range"
                                    min={field.min ?? 0}
                                    max={field.max ?? 10}
                                    value={value === '' ? (field.min ?? 0) : Number(value)}
                                    onChange={(e) => setResourceFormValues(prev => ({ ...prev, [field.id]: Number(e.target.value) }))}
                                    className="grow accent-rose-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                  />
                                  <span className="text-xs font-black bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 rounded-full font-mono shrink-0">
                                    {value === '' ? (field.min ?? 0) : value} / {field.max ?? 10}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Live Output Preview */}
                      <div className="space-y-2 border-t border-slate-100 pt-5">
                        <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest block">Pré-visualização de Prontuário / Laudo Consolidado</span>
                        
                        <div className="relative">
                          <pre className="p-4 bg-slate-900 text-slate-200 font-mono text-[10px] sm:text-[10.5px] leading-relaxed rounded-2xl border border-slate-800 max-h-[300px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap text-left select-all">
                            {activeResource.exportFormat(resourceFormValues, resourcePatientName || 'Paciente Exemplo')}
                          </pre>
                        </div>
                      </div>

                      {/* Control Panel Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2 justify-end border-t border-slate-100 pt-4">
                        <button
                          onClick={() => {
                            setResourceFormValues(activeResource.defaultValues);
                            setResourcePatientName('');
                          }}
                          className="px-3.5 py-2 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                          title="Limpar todas as respostas e redefinir valores"
                        >
                          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                          <span>Limpar Atividade</span>
                        </button>

                        <button
                          onClick={() => {
                            const fileText = activeResource.exportFormat(resourceFormValues, resourcePatientName || 'Paciente Exemplo');
                            const element = document.createElement("a");
                            const file = new Blob([fileText], {type: 'text/plain;charset=utf-8'});
                            element.href = URL.createObjectURL(file);
                            element.download = `${activeResource.title.toLowerCase().replace(/ /g, "_")}_${(resourcePatientName || 'paciente_exemplo').toLowerCase().replace(/ /g, "_")}.txt`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                          }}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/80 active:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border border-emerald-150 shadow-xs"
                          title="Baixar em formato de arquivo texto .txt"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Baixar Ficha</span>
                        </button>

                        <button
                          onClick={() => {
                            const textToCopy = activeResource.exportFormat(resourceFormValues, resourcePatientName || 'Paciente Exemplo');
                            navigator.clipboard.writeText(textToCopy).then(() => {
                              setCopiedId(activeResource.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            });
                          }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border border-rose-700 shadow-sm"
                          title="Copiar texto para colar direto no prontuário ou enviar ao paciente"
                        >
                          {copiedId === activeResource.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white shrink-0" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-white shrink-0" />
                              <span>Copiar Registros</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-2xs">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs font-bold">Nenhum recurso clínico selecionado</p>
                    <p className="text-slate-400 text-[10px] mt-1">Selecione uma demanda acima e depois escolha um dos recursos na lateral esquerda.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* TEST APPLICATION & INTERPRETATION MODAL */}
      {selectedTestToRun && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] w-full max-w-2xl overflow-hidden animate-[scaleUp_0.25s_ease-out]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white font-black text-xs px-2.5 py-1 rounded-xl">
                  {selectedTestToRun}
                </span>
                <h3 className="font-black text-slate-800 text-base">
                  {selectedTestToRun === 'EADS-21' 
                    ? 'Aplicação da Escala EADS-21/DASS-21' 
                    : selectedTestToRun === 'ASRS-18'
                    ? 'Rastreio de TDAH em Adultos (ASRS-18)'
                    : selectedTestToRun === 'MOM-D'
                    ? 'Inventário de Depressão - A Mente Vencendo o Humor'
                    : selectedTestToRun === 'MOM-A'
                    ? 'Inventário de Ansiedade - A Mente Vencendo o Humor'
                    : selectedTestToRun === 'MOM-R'
                    ? 'Inventário de Raiva - A Mente Vencendo o Humor'
                    : selectedTestToRun === 'MOM-P'
                    ? 'Inventário de Pânico - A Mente Vencendo o Humor'
                    : `Escore & Auxiliar Clínico: ${selectedTestToRun}`
                  }
                </h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedTestToRun(null);
                  setInteractiveAnswers({});
                  setManualRawScore('');
                }}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            {selectedTestToRun && ['BDI-II', 'BAI', 'EADS-21', 'ASRS-18', 'MOM-D', 'MOM-A', 'MOM-R', 'MOM-P'].includes(selectedTestToRun) && (
              <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 gap-4">
                <button
                  onClick={() => {
                    setTestMode('interactive');
                    setInteractiveAnswers({});
                    setManualRawScore('');
                  }}
                  className={`py-3 px-1.5 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    testMode === 'interactive'
                      ? 'border-blue-650 text-blue-750'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${testMode === 'interactive' ? 'text-blue-600 fill-blue-600' : 'text-slate-400'}`} />
                  <span>Aplicar Escala Digital</span>
                </button>
                <button
                  onClick={() => {
                    setTestMode('direct');
                    setInteractiveAnswers({});
                    setManualRawScore('');
                  }}
                  className={`py-3 px-1.5 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    testMode === 'direct'
                      ? 'border-blue-650 text-blue-750'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Brain className={`w-3.5 h-3.5 ${testMode === 'direct' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Lançar Escore Direto</span>
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* SATEPSI Restrictions notice for Restricted Tests */}
              {!['EADS-21', 'ASRS-18', 'MOM-D', 'MOM-A', 'MOM-R', 'MOM-P'].includes(selectedTestToRun) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-extrabold uppercase tracking-wide">AVISO DE REGULAMENTAÇÃO (SATEPSI)</p>
                    <p className="font-semibold leading-relaxed">
                      Este instrumento é de <strong>uso exclusivo a psicólogos(as) habilitados</strong>, conforme Resolução CFP nº 09/2018. A aplicação direta só deve ocorrer presencialmente, mediante o manual original comprado na editora licenciada.
                    </p>
                    <p className="font-bold text-amber-950">
                      Utilize esta calculadora para lançar resultados, interpretar escores e gerar os textos estruturados de evolução de forma ágil e segura.
                    </p>
                  </div>
                </div>
              )}

              {/* CASE 1: BDI-II */}
              {selectedTestToRun === 'BDI-II' && (() => {
                if (testMode === 'interactive') {
                  const score = Object.values(interactiveAnswers).reduce((sum: number, val) => sum + Number(val), 0) as number;
                  const answeredCount = Object.keys(interactiveAnswers).length;
                  const isCompleted = answeredCount === BDIII_QUESTIONS.length;
                  const interpretation = interpretBDIII(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA\nInstrumento: Inventário de Depressão de Beck II (BDI-II) - Aplicação Interativa\nEscore Obtido: ${score} pontos.\nInterpretação Clínica: ${interpretation.title}.\nDescrição: ${interpretation.description}\nNo. de Itens Respondidos: ${answeredCount} de ${BDIII_QUESTIONS.length}\nData: ${new Date().toLocaleDateString('pt-BR')}`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Progresso do Inventário BDI-II:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {answeredCount} de {BDIII_QUESTIONS.length} respondidos
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
                        {BDIII_QUESTIONS.map((q) => {
                          const currentVal = interactiveAnswers[q.id];
                          return (
                            <div key={q.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 text-left hover:border-slate-200 transition-colors">
                              <p className="font-black text-slate-800 tracking-tight leading-tight">
                                {q.id}. {q.text} <span className="font-medium text-slate-500 font-sans">({q.desc})</span>
                              </p>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[0, 1, 2, 3].map((val) => {
                                  const isSelected = currentVal === val;
                                  return (
                                    <button
                                      key={val}
                                      onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: val }))}
                                      className={`px-1.5 py-2 rounded-xl border text-[9.5px] font-bold leading-tight transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                        isSelected 
                                          ? 'bg-blue-600 text-white border-blue-650 shadow-xs' 
                                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-150'
                                      }`}
                                    >
                                      <span className="font-black text-xs block mb-0.5">{val}</span>
                                      <span className="truncate w-full block text-[8px] opacity-90">
                                        {val === 0 ? 'Ausente' : val === 1 ? 'Leve' : val === 2 ? 'Moderado' : 'Grave'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Display score result */}
                      <div className="space-y-4 border-t border-slate-100 pt-4">
                        <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                          <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação Atual:</span>
                          <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                          <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                        </div>

                        {answeredCount > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário:</span>
                            <textarea 
                              readOnly
                              rows={4}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'bdi-interactive')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'bdi-interactive' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  const score = parseInt(manualRawScore) || 0;
                  const interpretation = interpretBDIII(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA\nInstrumento: Inventário de Depressão de Beck II (BDI-II)\nEscore Obtido: ${score} pontos.\nInterpretação Clínica: ${interpretation.title}.\nDescrição: ${interpretation.description}\nData da Anotação: ${new Date().toLocaleDateString('pt-BR')}`;
                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Inserir Escore Bruto Total (Soma de 0 a 63):</label>
                        <input 
                          type="number"
                          min="0"
                          max="63"
                          value={manualRawScore}
                          onChange={(e) => setManualRawScore(e.target.value)}
                          placeholder="Ex: 18"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:outline-hidden"
                        />
                      </div>

                      {manualRawScore !== '' && (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação:</span>
                            <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                            <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota Clínica para Evolução (Prontuário):</span>
                            <textarea 
                              readOnly
                              rows={5}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'bdi-calc')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'bdi-calc' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada com Sucesso!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}

              {/* CASE 2: BAI */}
              {selectedTestToRun === 'BAI' && (() => {
                if (testMode === 'interactive') {
                  const score = Object.values(interactiveAnswers).reduce((sum: number, val) => sum + Number(val), 0) as number;
                  const answeredCount = Object.keys(interactiveAnswers).length;
                  const isCompleted = answeredCount === BAI_QUESTIONS.length;
                  const interpretation = interpretBAI(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA\nInstrumento: Inventário de Ansiedade de Beck (BAI) - Aplicação Interativa\nEscore Obtido: ${score} pontos.\nInterpretação Clínica: ${interpretation.title}.\nDescrição: ${interpretation.description}\nNo. de Itens Respondidos: ${answeredCount} de ${BAI_QUESTIONS.length}\nData: ${new Date().toLocaleDateString('pt-BR')}`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Progresso do Inventário BAI:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {answeredCount} de {BAI_QUESTIONS.length} respondidos
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
                        {BAI_QUESTIONS.map((q) => {
                          const currentVal = interactiveAnswers[q.id];
                          return (
                            <div key={q.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 text-left hover:border-slate-200 transition-colors">
                              <p className="font-black text-slate-800 tracking-tight leading-tight">
                                {q.id}. {q.text} <span className="font-medium text-slate-500 font-sans">({q.desc})</span>
                              </p>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[0, 1, 2, 3].map((val) => {
                                  const isSelected = currentVal === val;
                                  return (
                                    <button
                                      key={val}
                                      onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: val }))}
                                      className={`px-1.5 py-2 rounded-xl border text-[9.5px] font-bold leading-tight transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                        isSelected 
                                          ? 'bg-blue-600 text-white border-blue-650 shadow-xs' 
                                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-150'
                                      }`}
                                    >
                                      <span className="font-black text-xs block mb-0.5">{val}</span>
                                      <span className="truncate w-full block text-[8px] opacity-90">
                                        {val === 0 ? 'Sem Incômodo' : val === 1 ? 'Leve' : val === 2 ? 'Moderado' : 'Grave'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Display score result */}
                      <div className="space-y-4 border-t border-slate-100 pt-4">
                        <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                          <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação Atual:</span>
                          <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                          <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                        </div>

                        {answeredCount > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário:</span>
                            <textarea 
                              readOnly
                              rows={4}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'bai-interactive')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'bai-interactive' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  const score = parseInt(manualRawScore) || 0;
                  const interpretation = interpretBAI(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO PSICOMÉTRICA\nInstrumento: Inventário de Ansiedade de Beck (BAI)\nEscore Obtido: ${score} pontos.\nInterpretação Clínica: ${interpretation.title}.\nDescrição: ${interpretation.description}\nData da Anotação: ${new Date().toLocaleDateString('pt-BR')}`;
                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Inserir Escore Bruto Total (Soma de 0 a 63):</label>
                        <input 
                          type="number"
                          min="0"
                          max="63"
                          value={manualRawScore}
                          onChange={(e) => setManualRawScore(e.target.value)}
                          placeholder="Ex: 14"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:outline-hidden"
                        />
                      </div>

                      {manualRawScore !== '' && (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação:</span>
                            <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                            <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota Clínica para Evolução (Prontuário):</span>
                            <textarea 
                              readOnly
                              rows={5}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'bai-calc')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'bai-calc' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada com Sucesso!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}

              {/* CASE MOM-D: Inventário de Depressão - A Mente Vencendo o Humor */}
              {selectedTestToRun === 'MOM-D' && (() => {
                if (testMode === 'interactive') {
                  const score = Object.values(interactiveAnswers).reduce((sum: number, val) => sum + Number(val), 0) as number;
                  const answeredCount = Object.keys(interactiveAnswers).length;
                  const isCompleted = answeredCount === MOM_D_QUESTIONS.length;
                  const interpretation = interpretMOMDepression(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO CLÍNICA (TCC)\nInstrumento: Inventário de Depressão (A Mente Vencendo o Humor) - Digital\nEscore Obtido: ${score} de 45 pontos.\nClassificação de Gravidade: ${interpretation.title}.\nDescrição: ${interpretation.description}\nItens Respondidos: ${answeredCount} de ${MOM_D_QUESTIONS.length}\nInstruções/Nota: Dados obtidos por questionário interativo de monitoramento integrado.`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Progresso do Inventário MOM-D:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {answeredCount} de {MOM_D_QUESTIONS.length} respondidos
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
                        {MOM_D_QUESTIONS.map((q) => {
                          const currentVal = interactiveAnswers[q.id];
                          return (
                            <div key={q.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 text-left hover:border-slate-200 transition-colors">
                              <p className="font-black text-slate-800 tracking-tight leading-tight">
                                {q.id}. {q.text} <span className="font-medium text-slate-500 font-sans">({q.desc})</span>
                              </p>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[0, 1, 2, 3].map((val) => {
                                  const isSelected = currentVal === val;
                                  return (
                                    <button
                                      key={val}
                                      onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: val }))}
                                      className={`px-1 py-1.5 rounded-xl border text-[9.5px] font-bold leading-tight transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                        isSelected 
                                          ? 'bg-blue-600 text-white border-blue-650 shadow-xs' 
                                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-150'
                                      }`}
                                    >
                                      <span className="font-black text-xs block mb-0.5">{val}</span>
                                      <span className="truncate w-full block text-[8px] opacity-90">
                                        {val === 0 ? 'Não/Até 1 dia' : val === 1 ? 'Pouco (2-3 d)' : val === 2 ? 'Moderado (4-5 d)' : 'Quase sempre'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-4 border-t border-slate-100 pt-4">
                        <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                          <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação Atual:</span>
                          <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                          <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                        </div>

                        {answeredCount > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário:</span>
                            <textarea 
                              readOnly
                              rows={4}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'momd-interactive')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'momd-interactive' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  const score = parseInt(manualRawScore) || 0;
                  const interpretation = interpretMOMDepression(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO CLÍNICA\nInstrumento: Inventário de Depressão (A Mente Vencendo o Humor)\nEscore Obtido: ${score} pontos.\nInterpretação Clínica: ${interpretation.title}.\nDescrição: ${interpretation.description}\nData da Anotação: ${new Date().toLocaleDateString('pt-BR')}`;
                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Inserir Escore Bruto Total (Soma de 0 a 45):</label>
                        <input 
                          type="number"
                          min="0"
                          max="45"
                          value={manualRawScore}
                          onChange={(e) => setManualRawScore(e.target.value)}
                          placeholder="Ex: 22"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:outline-hidden"
                        />
                      </div>

                      {manualRawScore !== '' && (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação:</span>
                            <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                            <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota Clínica para Evolução (Prontuário):</span>
                            <textarea 
                              readOnly
                              rows={5}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'momd-calc')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'momd-calc' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada com Sucesso!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}

              {/* CASE MOM-A: Inventário de Ansiedade - A Mente Vencendo o Humor */}
              {selectedTestToRun === 'MOM-A' && (() => {
                if (testMode === 'interactive') {
                  const score = Object.values(interactiveAnswers).reduce((sum: number, val) => sum + Number(val), 0) as number;
                  const answeredCount = Object.keys(interactiveAnswers).length;
                  const isCompleted = answeredCount === MOM_A_QUESTIONS.length;
                  const interpretation = interpretMOMAnxiety(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO CLÍNICA (TCC)\nInstrumento: Inventário de Ansiedade (A Mente Vencendo o Humor) - Digital\nEscore Obtido: ${score} de 45 pontos.\nClassificação de Gravidade: ${interpretation.title}.\nDescrição: ${interpretation.description}\nItens Respondidos: ${answeredCount} de ${MOM_A_QUESTIONS.length}\nInstruções/Nota: Monitoramento somatossensorial e ansioso.`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Progresso do Inventário MOM-A:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {answeredCount} de {MOM_A_QUESTIONS.length} respondidos
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
                        {MOM_A_QUESTIONS.map((q) => {
                          const currentVal = interactiveAnswers[q.id];
                          return (
                            <div key={q.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 text-left hover:border-slate-200 transition-colors">
                              <p className="font-black text-slate-800 tracking-tight leading-tight">
                                {q.id}. {q.text} <span className="font-medium text-slate-500 font-sans">({q.desc})</span>
                              </p>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[0, 1, 2, 3].map((val) => {
                                  const isSelected = currentVal === val;
                                  return (
                                    <button
                                      key={val}
                                      onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: val }))}
                                      className={`px-1 py-1.5 rounded-xl border text-[9.5px] font-bold leading-tight transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                        isSelected 
                                          ? 'bg-blue-600 text-white border-blue-650 shadow-xs' 
                                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-150'
                                      }`}
                                    >
                                      <span className="font-black text-xs block mb-0.5">{val}</span>
                                      <span className="truncate w-full block text-[8px] opacity-90">
                                        {val === 0 ? 'Não/Até 1 dia' : val === 1 ? 'Pouco (2-3 d)' : val === 2 ? 'Moderado (4-5 d)' : 'Quase sempre'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-4 border-t border-slate-100 pt-4">
                        <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                          <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação Atual:</span>
                          <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                          <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                        </div>

                        {answeredCount > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário:</span>
                            <textarea 
                              readOnly
                              rows={4}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'moma-interactive')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'moma-interactive' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  const score = parseInt(manualRawScore) || 0;
                  const interpretation = interpretMOMAnxiety(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO CLÍNICA\nInstrumento: Inventário de Ansiedade (A Mente Vencendo o Humor)\nEscore Obtido: ${score} pontos.\nInterpretação Clínica: ${interpretation.title}.\nDescrição: ${interpretation.description}\nData da Anotação: ${new Date().toLocaleDateString('pt-BR')}`;
                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Inserir Escore Bruto Total (Soma de 0 a 45):</label>
                        <input 
                          type="number"
                          min="0"
                          max="45"
                          value={manualRawScore}
                          onChange={(e) => setManualRawScore(e.target.value)}
                          placeholder="Ex: 15"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:outline-hidden"
                        />
                      </div>

                      {manualRawScore !== '' && (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação:</span>
                            <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                            <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota Clínica para Evolução (Prontuário):</span>
                            <textarea 
                              readOnly
                              rows={5}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'moma-calc')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'moma-calc' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada com Sucesso!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}

              {/* CASE MOM-R: Inventário de Raiva - A Mente Vencendo o Humor */}
              {selectedTestToRun === 'MOM-R' && (() => {
                if (testMode === 'interactive') {
                  const score = Object.values(interactiveAnswers).reduce((sum: number, val) => sum + Number(val), 0) as number;
                  const answeredCount = Object.keys(interactiveAnswers).length;
                  const isCompleted = answeredCount === MOM_R_QUESTIONS.length;
                  const interpretation = interpretMOMAnger(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO CLÍNICA (TCC)\nInstrumento: Inventário de Raiva e Irritabilidade (A Mente Vencendo o Humor) - Digital\nEscore Obtido: ${score} de 45 pontos.\nClassificação de Gravidade: ${interpretation.title}.\nDescrição: ${interpretation.description}\nItens Respondidos: ${answeredCount} de ${MOM_R_QUESTIONS.length}\nInstruções/Nota: Monitoramento de raiva, tolerância e impulsividade.`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Progresso do Inventário MOM-R:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {answeredCount} de {MOM_R_QUESTIONS.length} respondidos
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
                        {MOM_R_QUESTIONS.map((q) => {
                          const currentVal = interactiveAnswers[q.id];
                          return (
                            <div key={q.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 text-left hover:border-slate-200 transition-colors">
                              <p className="font-black text-slate-800 tracking-tight leading-tight">
                                {q.id}. {q.text} <span className="font-medium text-slate-500 font-sans">({q.desc})</span>
                              </p>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[0, 1, 2, 3].map((val) => {
                                  const isSelected = currentVal === val;
                                  return (
                                    <button
                                      key={val}
                                      onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: val }))}
                                      className={`px-1 py-1.5 rounded-xl border text-[9.5px] font-bold leading-tight transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                        isSelected 
                                          ? 'bg-blue-600 text-white border-blue-650 shadow-xs' 
                                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-150'
                                      }`}
                                    >
                                      <span className="font-black text-xs block mb-0.5">{val}</span>
                                      <span className="truncate w-full block text-[8px] opacity-90">
                                        {val === 0 ? 'Não/Até 1 dia' : val === 1 ? 'Pouco (2-3 d)' : val === 2 ? 'Moderado (4-5 d)' : 'Quase sempre'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-4 border-t border-slate-100 pt-4">
                        <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                          <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação Atual:</span>
                          <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                          <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                        </div>

                        {answeredCount > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário:</span>
                            <textarea 
                              readOnly
                              rows={4}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'momr-interactive')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'momr-interactive' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  const score = parseInt(manualRawScore) || 0;
                  const interpretation = interpretMOMAnger(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO CLÍNICA\nInstrumento: Inventário de Raiva (A Mente Vencendo o Humor)\nEscore Obtido: ${score} pontos.\nInterpretação Clínica: ${interpretation.title}.\nDescrição: ${interpretation.description}\nData da Anotação: ${new Date().toLocaleDateString('pt-BR')}`;
                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Inserir Escore Bruto Total (Soma de 0 a 45):</label>
                        <input 
                          type="number"
                          min="0"
                          max="45"
                          value={manualRawScore}
                          onChange={(e) => setManualRawScore(e.target.value)}
                          placeholder="Ex: 12"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:outline-hidden"
                        />
                      </div>

                      {manualRawScore !== '' && (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação:</span>
                            <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                            <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota Clínica para Evolução (Prontuário):</span>
                            <textarea 
                              readOnly
                              rows={5}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'momr-calc')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'momr-calc' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada com Sucesso!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}

              {/* CASE MOM-P: Inventário de Pânico - A Mente Vencendo o Humor */}
              {selectedTestToRun === 'MOM-P' && (() => {
                if (testMode === 'interactive') {
                  const score = Object.values(interactiveAnswers).reduce((sum: number, val) => sum + Number(val), 0) as number;
                  const answeredCount = Object.keys(interactiveAnswers).length;
                  const isCompleted = answeredCount === MOM_P_QUESTIONS.length;
                  const interpretation = interpretMOMPanic(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO CLÍNICA (TCC)\nInstrumento: Inventário de Pânico (A Mente Vencendo o Humor) - Digital\nEscore Obtido: ${score} de 45 pontos.\nClassificação de Gravidade: ${interpretation.title}.\nDescrição: ${interpretation.description}\nItens Respondidos: ${answeredCount} de ${MOM_P_QUESTIONS.length}\nInstruções/Nota: Avaliação somática aguda de pânico e agorafobia.`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Progresso do Inventário MOM-P:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {answeredCount} de {MOM_P_QUESTIONS.length} respondidos
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 text-xs">
                        {MOM_P_QUESTIONS.map((q) => {
                          const currentVal = interactiveAnswers[q.id];
                          return (
                            <div key={q.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 text-left hover:border-slate-200 transition-colors">
                              <p className="font-black text-slate-800 tracking-tight leading-tight">
                                {q.id}. {q.text} <span className="font-medium text-slate-500 font-sans">({q.desc})</span>
                              </p>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[0, 1, 2, 3].map((val) => {
                                  const isSelected = currentVal === val;
                                  return (
                                    <button
                                      key={val}
                                      onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: val }))}
                                      className={`px-1 py-1.5 rounded-xl border text-[9.5px] font-bold leading-tight transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                        isSelected 
                                          ? 'bg-blue-600 text-white border-blue-650 shadow-xs' 
                                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-150'
                                      }`}
                                    >
                                      <span className="font-black text-xs block mb-0.5">{val}</span>
                                      <span className="truncate w-full block text-[8px] opacity-90">
                                        {val === 0 ? 'Não/Até 1 dia' : val === 1 ? 'Pouco (2-3 d)' : val === 2 ? 'Moderado (4-5 d)' : 'Quase sempre'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-4 border-t border-slate-100 pt-4">
                        <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                          <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação Atual:</span>
                          <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                          <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                        </div>

                        {answeredCount > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota de Prontuário:</span>
                            <textarea 
                              readOnly
                              rows={4}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'momp-interactive')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'momp-interactive' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  const score = parseInt(manualRawScore) || 0;
                  const interpretation = interpretMOMPanic(score);
                  const clinicalNote = `REGISTRO DE AVALIAÇÃO CLÍNICA\nInstrumento: Inventário de Pânico (A Mente Vencendo o Humor)\nEscore Obtido: ${score} pontos.\nInterpretação Clínica: ${interpretation.title}.\nDescrição: ${interpretation.description}\nData da Anotação: ${new Date().toLocaleDateString('pt-BR')}`;
                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Inserir Escore Bruto Total (Soma de 0 a 45):</label>
                        <input 
                          type="number"
                          min="0"
                          max="45"
                          value={manualRawScore}
                          onChange={(e) => setManualRawScore(e.target.value)}
                          placeholder="Ex: 8"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:outline-hidden"
                        />
                      </div>

                      {manualRawScore !== '' && (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-2xl border ${interpretation.className} space-y-1`}>
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest opacity-80">Classificação:</span>
                            <h4 className="text-base font-black">{interpretation.title} ({score} pts)</h4>
                            <p className="text-xs font-semibold leading-relaxed">{interpretation.description}</p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota Clínica para Evolução (Prontuário):</span>
                            <textarea 
                              readOnly
                              rows={5}
                              value={clinicalNote}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(clinicalNote, 'momp-calc')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'momp-calc' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Nota Copiada com Sucesso!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Nota de Prontuário</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}

              {/* CASE 3: BFP */}
              {selectedTestToRun === 'BFP' && (() => {
                const getScoreLabel = (pctVal: number) => {
                  if (pctVal <= 30) return { label: 'Baixo', color: 'text-rose-750 bg-rose-50 border-rose-100' };
                  if (pctVal <= 70) return { label: 'Médio', color: 'text-slate-700 bg-slate-50 border-slate-150' };
                  return { label: 'Alto', color: 'text-emerald-750 bg-emerald-50 border-emerald-150' };
                };
                const nPct = parseInt(bfpScores.neu) || 50;
                const ePct = parseInt(bfpScores.ext) || 50;
                const sPct = parseInt(bfpScores.soc) || 50;
                const rPct = parseInt(bfpScores.rea) || 50;
                const aPct = parseInt(bfpScores.abe) || 50;

                const nLbl = getScoreLabel(nPct);
                const eLbl = getScoreLabel(ePct);
                const sLbl = getScoreLabel(sPct);
                const rLbl = getScoreLabel(rPct);
                const aLbl = getScoreLabel(aPct);

                const clinicalNote = `REGISTRO DE PERFIL DE PERSONALIDADE (Modelo Big Five / BFP)\nData da Análise: ${new Date().toLocaleDateString('pt-BR')}\nEscores em Percentis Padronizados:\n- Neuroticismo (Vulnerabilidade / Instabilidade): ${nPct}º Percentil [Nível ${nLbl.label}]\n- Extroversão (Dinamismo / Comunicação): ${ePct}º Percentil [Nível ${eLbl.label}]\n- Socialização (Empatia / Amabilidade): ${sPct}º Percentil [Nível ${sLbl.label}]\n- Realização (Foco / Organização / Autodisciplina): ${rPct}º Percentil [Nível ${rLbl.label}]\n- Abertura (Interesses / Flexibilidade Cognitiva): ${aPct}º Percentil [Nível ${aLbl.label}]\nSíntese Interpretativa: Mapeamento de traços condizente com as demandas estruturais do paciente para guiar estratégias motivacionais e estabilização emocional.`;

                return (
                  <div className="space-y-4">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Ajustar os Percentis Obtidos do Manual (0% a 100%):</span>
                    
                    <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {[
                        { key: 'neu', label: 'Neuroticismo (N)', desc: 'Instabilidade Emocional & Vulnerabilidade', val: nPct, lbl: nLbl },
                        { key: 'ext', label: 'Extroversão (E)', desc: 'Interação Social & Nível de Atividade', val: ePct, lbl: eLbl },
                        { key: 'soc', label: 'Socialização (S)', desc: 'Amabilidade, Empatia & Altruísmo', val: sPct, lbl: sLbl },
                        { key: 'rea', label: 'Realização (R)', desc: 'Foco, Planejamento & Determinação', val: rPct, lbl: rLbl },
                        { key: 'abe', label: 'Abertura (A)', desc: 'Flexibilidade Cognitiva & Imaginação', val: aPct, lbl: aLbl }
                      ].map((dim) => (
                        <div key={dim.key} className="space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
                          <div className="flex justify-between items-center text-xs">
                            <div>
                              <span className="font-extrabold text-slate-800">{dim.label}</span>
                              <span className="text-slate-400 text-[10px] block font-semibold">{dim.desc}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${dim.lbl.color}`}>
                                {dim.lbl.label}
                              </span>
                              <span className="font-mono font-black text-slate-700 text-sm">{dim.val}%</span>
                            </div>
                          </div>
                          <input 
                            type="range"
                            min="1"
                            max="99"
                            value={dim.val}
                            onChange={(e) => setBfpScores(prev => ({ ...prev, [dim.key]: e.target.value }))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota Evolutiva Pronta para Prontuário:</span>
                      <textarea 
                        readOnly
                        rows={6}
                        value={clinicalNote}
                        className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                      />
                      <button
                        onClick={() => handleCopyText(clinicalNote, 'bfp-calc')}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        {copiedId === 'bfp-calc' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Perfil Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-white/80" />
                            <span>Copiar Notas de Personalidade</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* CASE 4: HTP */}
              {selectedTestToRun === 'HTP' && (() => {
                const observationsList = [
                  { key: 'chamineFumaca', label: 'Chaminé com fumaça espessa', desc: 'Sinaliza tensão familiar ou sentimentos de repressão acentuada' },
                  { key: 'portasTrancadas', label: 'Portas/Janelas trancadas ou ausentes', desc: 'Defensividade, retraimento social ou isolamento intencional' },
                  { key: 'raizesExpostas', label: 'Árvore com raízes exageradamente expostas', desc: 'Forte necessidade de segurança e de apego rígido e concreto' },
                  { key: 'cicatrizesTronco', label: 'Tronco machucado ou com cicatrizes expressivas', desc: 'Histórico de trauma vivencial ou quebra na integridade de ego' },
                  { key: 'maosEscondidas', label: 'Pessoa com mãos escondidas ou nos bolsos', desc: 'Culpa interpessoal, inibição agressiva ou timidez social profunda' },
                  { key: 'olhosGrandes', label: 'Olhos desproporcionalmente grandes ou detalhados', desc: 'Sinais de hipervigilância, ideação paranoide ou desconfiança' },
                  { key: 'linhasFracas', label: 'Linhas extremamente fracas e frágeis', desc: 'Baixo nível de energia de ego, insegurança profunda ou indecisão' },
                  { key: 'detalhesOmitidos', label: 'Omissão de detalhes fundamentais básicos', desc: 'Indícios de retraimento cognitivo, fadiga ou baixa resiliência' }
                ];

                const activeObservations = observationsList.filter(o => htpObservations[o.key as keyof typeof htpObservations]);
                const clinicalNote = `REGISTRO DE MAPEAMENTO CLÍNICO PROJETIVO (HTP)\nData da Sessão: ${new Date().toLocaleDateString('pt-BR')}\nMetodologia: Técnica Projetiva de Desenho Casa-Árvore-Pessoa (HTP/Buck).\nPrincipais Observações e Hipóteses Clínicas estruturadas:\n${activeObservations.length === 0 
                  ? '- Nenhuma distorção severa ou indicador incomum detectado nos traçados fundamentais.' 
                  : activeObservations.map(o => '- ' + o.label + ': ' + o.desc).join('\n')
                }\nConclusão: Mapeamento de ego dinâmico útil para integrar nas formulações clínicas do caso, respeitando as referências do SATEPSI e as hipóteses fenomenológicas.`;

                return (
                  <div className="space-y-4">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Selecione os Indicadores Projetivos Observados nos Desenhos:</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-52 overflow-y-auto">
                      {observationsList.map((obs) => (
                        <label key={obs.key} className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-150 transition-colors">
                          <input 
                            type="checkbox"
                            checked={htpObservations[obs.key as keyof typeof htpObservations]}
                            onChange={(e) => setHtpObservations(prev => ({ ...prev, [obs.key]: e.target.checked }))}
                            className="mt-0.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <div className="text-[11px]">
                            <span className="font-extrabold text-slate-800 tracking-tight block">{obs.label}</span>
                            <span className="text-slate-400 font-semibold leading-none">{obs.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Anotação Clínica Dinâmica (Hipóteses do HTP):</span>
                      <textarea 
                        readOnly
                        rows={6}
                        value={clinicalNote}
                        className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                      />
                      <button
                        onClick={() => handleCopyText(clinicalNote, 'htp-calc')}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        {copiedId === 'htp-calc' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Laudo Projetivo Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-white/80" />
                            <span>Copiar Notas Hipotéticas do HTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* CASE 5: WISC-IV */}
              {selectedTestToRun === 'WISC-IV' && (() => {
                const icvVal = parseInt(wiscScores.icv) || 100;
                const iopVal = parseInt(wiscScores.iop) || 100;
                const imtVal = parseInt(wiscScores.imt) || 100;
                const ivpVal = parseInt(wiscScores.ivp) || 100;

                const values = [icvVal, iopVal, imtVal, ivpVal];
                const totalQi = Math.round(values.reduce((a, b) => a + b, 0) / 4);

                let classification = 'Média';
                if (totalQi >= 130) classification = 'Muito Superior (Altas Habilidades/Superdotação)';
                else if (totalQi >= 120) classification = 'Superior';
                else if (totalQi >= 110) classification = 'Média Alta';
                else if (totalQi >= 90) classification = 'Média';
                else if (totalQi >= 80) classification = 'Média Baixa';
                else if (totalQi >= 70) classification = 'Limítrofe';
                else classification = 'Extremamente Baixo (Déficit Intelectual)';

                const discrepancies = [];
                if (Math.abs(icvVal - iopVal) >= 15) {
                  discrepancies.push(`Discrepância significativa identificada entre Raciocínio Verbal (ICV: ${icvVal}) e Raciocínio Não-Verbal (IOP: ${iopVal}).`);
                }
                if (Math.abs(imtVal - ivpVal) >= 15) {
                  discrepancies.push(`Discrepância entre Memória de Trabalho (IMT: ${imtVal}) e Velocidade de Processamento (IVP: ${ivpVal}).`);
                }

                const clinicalNote = `REGISTRO DE DESEMPENHO COGNITIVO (WISC-IV)\nData de Fechamento: ${new Date().toLocaleDateString('pt-BR')}\nMetodologia: Escala Wechsler de Inteligência para Crianças (WISC-IV).\nEscore de Índices Fatoriais Obtidos:\n- Índice de Compreensão Verbal (ICV): ${icvVal}\n- Índice de Organização Perceptual (IOP): ${iopVal}\n- Índice de Memória de Trabalho (IMT): ${imtVal}\n- Índice de Velocidade de Processamento (IVP): ${ivpVal}\n\nSÍNTESE INTELLECTUAL GERAL:\n- QI Total Estimado (Média Equivalente): ${totalQi}\n- Classificação Estrutural: ${classification}\n- Discrepâncias Cognitivas Fatoriais:\n${discrepancies.length === 0 ? '  Nenhuma discrepância fatorada severa (todos os índices oscilam harmoniosamente).' : discrepancies.map(d => '  * ' + d).join('\n')}\nConclusão: Desempenho mapeado fornece bases acadêmicas, de foco e executivas para plano de aprendizagem ou neurodesenvolvimento.`;

                return (
                  <div className="space-y-4">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Inserir Pontuação Padrão de cada Índice (Normal: 90-110, Limite: 70-130):</span>
                    
                    <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {[
                        { key: 'icv', label: 'Compreensão Verbal (ICV)' },
                        { key: 'iop', label: 'Organização Perceptual (IOP)' },
                        { key: 'imt', label: 'Memória de Trabalho (IMT)' },
                        { key: 'ivp', label: 'Velocidade de Processo (IVP)' }
                      ].map((ind) => (
                        <div key={ind.key} className="space-y-1">
                          <label className="text-[10px] font-black text-slate-600 block">{ind.label}:</label>
                          <input 
                            type="number"
                            min="40"
                            max="160"
                            value={wiscScores[ind.key as keyof typeof wiscScores]}
                            onChange={(e) => setWiscScores(prev => ({ ...prev, [ind.key]: e.target.value }))}
                            placeholder="Ex: 100"
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold focus:outline-hidden"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {Object.values(wiscScores).some(x => x !== '') && (
                        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1 animate-[fadeIn_0.15s_ease-out]">
                          <span className="text-[10px] font-mono font-black text-indigo-700 uppercase tracking-wider">Aproximação QI Total:</span>
                          <h4 className="text-sm font-black text-indigo-950">{totalQi} - {classification}</h4>
                          <p className="text-[10px] font-semibold text-indigo-800 leading-relaxed">
                            A média aritmética gera uma excelente estimativa rápida do CIT para triagem clínica expedita.
                          </p>
                        </div>
                      )}

                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Evolução Cognitiva para Clínicas/Escolas:</span>
                        <textarea 
                          readOnly
                          rows={6}
                          value={clinicalNote}
                          className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                        />
                        <button
                          onClick={() => handleCopyText(clinicalNote, 'wisc-calc')}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          {copiedId === 'wisc-calc' ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>Relatório Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-white/80" />
                              <span>Copiar Notas Cognitivas</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* CASE 6: EADS-21 */}
              {selectedTestToRun === 'EADS-21' && (() => {
                if (testMode === 'interactive') {
                  const totals = interpretEADS21(
                    Object.entries(interactiveAnswers).filter(([id]) => EADS21_QUESTIONS.find(q => q.id === parseInt(id))?.dimension === 'depressao').reduce((sum, [, val]) => sum + (val as number), 0),
                    Object.entries(interactiveAnswers).filter(([id]) => EADS21_QUESTIONS.find(q => q.id === parseInt(id))?.dimension === 'ansiedade').reduce((sum, [, val]) => sum + (val as number), 0),
                    Object.entries(interactiveAnswers).filter(([id]) => EADS21_QUESTIONS.find(q => q.id === parseInt(id))?.dimension === 'estresse').reduce((sum, [, val]) => sum + (val as number), 0)
                  );
                  const answeredCount = Object.keys(interactiveAnswers).length;
                  const isCompleted = answeredCount === EADS21_QUESTIONS.length;

                  const reportText = `TRIAGEM CLÍNICA AUXILIAR - ESCALA EADS-21 (DASS-21)\nData da Resposta: ${new Date().toLocaleDateString('pt-BR')}\nEscores Calculados (multiplicados por 2 para equivalência DASS-42):\n- DEPRESSÃO: ${totals.dep.score} pontos [Nível ${totals.dep.label}]\n- ANSIEDADE: ${totals.ans.score} pontos [Nível ${totals.ans.label}]\n- ESTRESSE: ${totals.est.score} pontos [Nível ${totals.est.label}]\n\nMetodologia de Interpretação:\nA escala EADS-21 é um instrumento psicométrico de autoavaliação validado para triagem de escores afetivos cotidianos nas últimas semanas. Não substitui avaliação presencial estruturada.`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Progresso de Preenchimento:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {answeredCount} de {EADS21_QUESTIONS.length} respondidas
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[40vh] overflow-y-auto pr-1 text-xs">
                        {EADS21_QUESTIONS.map((q) => (
                          <div key={q.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100/80 space-y-2 text-left hover:border-slate-200 transition-colors">
                            <p className="font-black text-slate-800 tracking-tight leading-tight">
                              {q.id}. {q.text}
                            </p>
                            <div className="grid grid-cols-4 gap-1.5">
                              {EADS21_ANSWERS.map((ans) => {
                                const isSelected = interactiveAnswers[q.id] === ans.score;
                                return (
                                  <button
                                    key={ans.score}
                                    onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: ans.score }))}
                                    className={`px-1.5 py-2 rounded-xl border text-[9.5px] font-bold leading-tight transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                      isSelected 
                                        ? 'bg-blue-600 text-white border-blue-650 shadow-xs' 
                                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-150'
                                    }`}
                                    title={ans.text}
                                  >
                                    <span className="font-black text-xs block mb-0.5">{ans.score}</span>
                                    <span className="truncate w-full block text-[8px] opacity-90">{ans.score === 0 ? 'Não' : ans.score === 1 ? 'Pouco' : ans.score === 2 ? 'Frequente' : 'Sempre'}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Report and Scores result */}
                      <div className="space-y-4 border-t border-slate-100 pt-4">
                        <div className="grid grid-cols-3 gap-2">
                          <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${totals.dep.color}`}>
                            <span className="text-[9px] uppercase font-mono font-black tracking-widest opacity-85 block">Depressão</span>
                            <span className="text-base font-black tracking-tight">{totals.dep.score} pts</span>
                            <span className="text-[10px] font-bold block">{totals.dep.label}</span>
                          </div>
                          <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${totals.ans.color}`}>
                            <span className="text-[9px] uppercase font-mono font-black tracking-widest opacity-85 block">Ansiedade</span>
                            <span className="text-base font-black tracking-tight">{totals.ans.score} pts</span>
                            <span className="text-[10px] font-bold block">{totals.ans.label}</span>
                          </div>
                          <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${totals.est.color}`}>
                            <span className="text-[9px] uppercase font-mono font-black tracking-widest opacity-85 block">Estresse</span>
                            <span className="text-base font-black tracking-tight">{totals.est.score} pts</span>
                            <span className="text-[10px] font-bold block">{totals.est.label}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota Clínica para o Registro do Prontuário:</span>
                            {!isCompleted && (
                              <span className="text-[9.5px] text-amber-600 font-extrabold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Parcial
                              </span>
                            )}
                          </div>
                          <textarea 
                            readOnly
                            rows={6}
                            value={reportText}
                            className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                          />
                          <button
                            onClick={() => handleCopyText(reportText, 'eads-report')}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            {copiedId === 'eads-report' ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>Relatório Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-white/80" />
                                <span>Copiar Relatório de Rastreamento</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Direct entry for EADS-21
                  const dVal = parseInt(eadsDirectScores.dep) || 0;
                  const aVal = parseInt(eadsDirectScores.ans) || 0;
                  const eVal = parseInt(eadsDirectScores.est) || 0;

                  const totals = interpretEADS21(dVal, aVal, eVal);
                  const reportText = `TRIAGEM CLÍNICA AUXILIAR - ESCALA EADS-21 (DASS-21) - LANÇAMENTO DIRETO\nData do Lançamento: ${new Date().toLocaleDateString('pt-BR')}\nEscores Lançados Diretamente (0 a 21 por fator):\n- DEPRESSÃO (Soma de Itens): ${dVal} (DASS-42 Equiv: ${totals.dep.score} pts) [Nível ${totals.dep.label}]\n- ANSIEDADE (Soma de Itens): ${aVal} (DASS-42 Equiv: ${totals.ans.score} pts) [Nível ${totals.ans.label}]\n- ESTRESSE (Soma de Itens): ${eVal} (DASS-42 Equiv: ${totals.est.score} pts) [Nível ${totals.est.label}]\n\nInterpetação Clínica rápida gerada com base nos escores somados informados pelo especialista.`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Inserir Soma Bruta dos Itens (0 a 21 para cada Fator):</span>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase">Soma Depressão:</label>
                            <input 
                              type="number"
                              min="0"
                              max="21"
                              value={eadsDirectScores.dep}
                              onChange={(e) => setEadsDirectScores(prev => ({ ...prev, dep: e.target.value }))}
                              placeholder="0-21"
                              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-850 text-xs font-bold focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase">Soma Ansiedade:</label>
                            <input 
                              type="number"
                              min="0"
                              max="21"
                              value={eadsDirectScores.ans}
                              onChange={(e) => setEadsDirectScores(prev => ({ ...prev, ans: e.target.value }))}
                              placeholder="0-21"
                              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-850 text-xs font-bold focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase">Soma Estresse:</label>
                            <input 
                              type="number"
                              min="0"
                              max="21"
                              value={eadsDirectScores.est}
                              onChange={(e) => setEadsDirectScores(prev => ({ ...prev, est: e.target.value }))}
                              placeholder="0-21"
                              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-850 text-xs font-bold focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Display results */}
                      {(eadsDirectScores.dep !== '' || eadsDirectScores.ans !== '' || eadsDirectScores.est !== '') && (
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                          <div className="grid grid-cols-3 gap-2">
                            <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${totals.dep.color}`}>
                              <span className="text-[9px] uppercase font-mono font-black tracking-widest opacity-85 block">Depressão</span>
                              <span className="text-base font-black tracking-tight">{totals.dep.score} pts</span>
                              <span className="text-[10px] font-bold block">{totals.dep.label}</span>
                            </div>
                            <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${totals.ans.color}`}>
                              <span className="text-[9px] uppercase font-mono font-black tracking-widest opacity-85 block">Ansiedade</span>
                              <span className="text-base font-black tracking-tight">{totals.ans.score} pts</span>
                              <span className="text-[10px] font-bold block">{totals.ans.label}</span>
                            </div>
                            <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${totals.est.color}`}>
                              <span className="text-[9px] uppercase font-mono font-black tracking-widest opacity-85 block">Estresse</span>
                              <span className="text-base font-black tracking-tight">{totals.est.score} pts</span>
                              <span className="text-[10px] font-bold block">{totals.est.label}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Nota Clínica para Registro do Prontuário:</span>
                            <textarea 
                              readOnly
                              rows={6}
                              value={reportText}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(reportText, 'eads-direct-report')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'eads-direct-report' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Relatório Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Relatório Lançado</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}

              {/* CASE 7: ASRS-18 */}
              {selectedTestToRun === 'ASRS-18' && (() => {
                if (testMode === 'interactive') {
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
                    if (idx < 3) { // Q1, Q2, Q3 (desatenção)
                      if (val >= 2) partAPositiveCount++; // "Às vezes" ou mais
                    } else { // Q4, Q5, Q6 (hiperatividade)
                      if (val >= 3) partAPositiveCount++; // "Frequentemente" ou mais
                    }
                  });

                  const hasAdhdScreenerPositive = partAPositiveCount >= 4;
                  const answeredCount = Object.keys(interactiveAnswers).length;
                  const isCompleted = answeredCount === ASRS18_QUESTIONS.length;

                  const adhdStatusText = hasAdhdScreenerPositive 
                    ? 'POSITIVO (Pontuação igual ou superior a 4 na Parte A aponta alta probabilidade de TDAH em perfil representativo).' 
                    : 'NEGATIVO (Sintomas da Parte A não alcançam limiar de rastreamento preliminar).';

                  const reportText = `TRIAGEM DE TDAH EM ADULTOS - ESCALA ASRS-18\nData de Fechamento: ${new Date().toLocaleDateString('pt-BR')}\nEscores Calculados:\n- ESCORE DE DESATENÇÃO (Fator I): ${desatScore} pontos\n- ESCORE DE HIPERATIVIDADE/IMPULSIVIDADE (Fator II): ${hiperScore} pontos\n\nCRITÉRIO DE SINTONIA (Parte A - Triagem OMS):\n- Sintomas Críticos Positivados na Parte A: ${partAPositiveCount} de 6 possíveis.\n- Status do Screener: ${adhdStatusText}\n\nMetodologia de Uso Clínico:\nA escala ASRS-18 é um rastreador da OMS para TDAH em adultos. Um rastreamento positivo indica recomendação clínica para investigação diagnóstica integrada com critérios da anamnese e do DSM-5.`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Perguntas Respondidas:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {answeredCount} de {ASRS18_QUESTIONS.length} respondidas
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[40vh] overflow-y-auto pr-1 text-xs">
                        {ASRS18_QUESTIONS.map((q, qIdx) => (
                          <div key={q.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100/80 space-y-2 text-left hover:border-slate-200 transition-colors">
                            <p className="font-black text-slate-800 tracking-tight leading-tight">
                              {q.id}. {q.text} {qIdx < 6 && <span className="text-[9px] text-indigo-600 font-extrabold uppercase bg-indigo-50 px-1.5 py-0.5 rounded-md ml-1.5">Parte A (Triagem Crítica)</span>}
                            </p>
                            <div className="grid grid-cols-5 gap-1">
                              {ASRS18_ANSWERS.map((ans) => {
                                const isSelected = interactiveAnswers[q.id] === ans.score;
                                return (
                                  <button
                                    key={ans.score}
                                    onClick={() => setInteractiveAnswers(prev => ({ ...prev, [q.id]: ans.score }))}
                                    className={`px-0.5 py-1.5 rounded-xl border text-[9px] font-bold leading-tight transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                      isSelected 
                                        ? 'bg-blue-600 text-white border-blue-650 shadow-xs' 
                                        : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-150'
                                    }`}
                                    title={ans.text}
                                  >
                                    <span className="font-black text-xs block mb-0.5">{ans.score}</span>
                                    <span className="truncate w-full block text-[7px] opacity-95">{ans.text}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Results analysis */}
                      <div className="space-y-4 border-t border-slate-100 pt-4">
                        {hasAdhdScreenerPositive ? (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-150 space-y-1">
                            <span className="text-[10px] font-mono font-black text-amber-700 uppercase tracking-wider block">Conclusão Sométrica:</span>
                            <h4 className="text-sm font-black text-amber-900">Screener de Triagem ASRS-18: ALTA PROBABILIDADE</h4>
                            <p className="text-[10.5px] font-semibold text-amber-800 leading-relaxed">
                              O paciente pontuou {partAPositiveCount} sintomas na Parte A (Sintomas Críticos). Diretrizes internacionais recomendam encaminhamento para avaliação diagnóstica estruturada de TDAH adulto.
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                            <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider block">Conclusão Sométrica:</span>
                            <h4 className="text-sm font-black text-slate-800">Screener de Triagem ASRS-18: Baixa Probabilidade</h4>
                            <p className="text-[10.5px] font-semibold text-slate-500 leading-relaxed">
                              Sintomas marcados não atingem a linha de corte crítica (menos de 4 sintomas na Parte A). Se as queixas persistirem, prossiga com a avaliação qualitativa do histórico de desenvolvimento.
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Desatenção (Soma Total)</span>
                            <span className="text-base font-black text-slate-700 font-mono block mt-0.5">{desatScore}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Hiperatividade-Impulsividade</span>
                            <span className="text-base font-black text-slate-700 font-mono block mt-0.5">{hiperScore}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Anotação Clínica Organizada:</span>
                          <textarea 
                            readOnly
                            rows={6}
                            value={reportText}
                            className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                          />
                          <button
                            onClick={() => handleCopyText(reportText, 'asrs-report')}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            {copiedId === 'asrs-report' ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>Relatório de TDAH Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-white/80" />
                                <span>Copiar Relatório ASRS-18</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Direct entry for ASRS-18
                  const dScore = parseInt(asrsDirectScores.desat) || 0;
                  const hScore = parseInt(asrsDirectScores.hiper) || 0;
                  const pCount = parseInt(asrsDirectScores.partA) || 0;

                  const hasAdhdScreenerPositive = pCount >= 4;
                  const adhdStatusText = hasAdhdScreenerPositive 
                    ? 'POSITIVO (Pontuação de triagem crítica Parte A igual ou superior a 4, indicando alta probabilidade de TDAH adulto)' 
                    : 'NEGATIVO (Sintomas de triagem crítica Parte A abaixo de 4 sintonas limítrofes)';

                  const reportText = `TRIAGEM DE TDAH EM ADULTOS - ESCALA ASRS-18 - LANÇAMENTO CLINICO DIRETO\nData de Registro: ${new Date().toLocaleDateString('pt-BR')}\nEscores Lançados:\n- Escore de Desatenção (Fator I): ${dScore} pontos.\n- Escore de Hiperatividade-Impulsividade (Fator II): ${hScore} pontos.\n- Sintomas Críticos Positivados na Parte A: ${pCount} de 6.\n- Diagnóstico de Triagem: ${adhdStatusText}\n\nNota: Escores carregados de forma consolidada e arquivados para subsídio à evolução regular no prontuário eletrônico.`;

                  return (
                    <div className="space-y-5 animate-[fadeIn_0.15s_ease-out]">
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Inserir Escores Consolidados da Escala:</span>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Fator I (Desatenção):</label>
                            <input 
                              type="number"
                              min="0"
                              max="36"
                              value={asrsDirectScores.desat}
                              onChange={(e) => setAsrsDirectScores(prev => ({ ...prev, desat: e.target.value }))}
                              placeholder="0-36"
                              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-855 text-xs font-bold focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Fator II (Hiperat.):</label>
                            <input 
                              type="number"
                              min="0"
                              max="36"
                              value={asrsDirectScores.hiper}
                              onChange={(e) => setAsrsDirectScores(prev => ({ ...prev, hiper: e.target.value }))}
                              placeholder="0-36"
                              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-855 text-xs font-bold focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-black text-slate-500 uppercase">Positivos Parte A:</label>
                            <input 
                              type="number"
                              min="0"
                              max="6"
                              value={asrsDirectScores.partA}
                              onChange={(e) => setAsrsDirectScores(prev => ({ ...prev, partA: e.target.value }))}
                              placeholder="0-6"
                              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-855 text-xs font-bold focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Results block */}
                      {(asrsDirectScores.desat !== '' || asrsDirectScores.hiper !== '' || asrsDirectScores.partA !== '') && (
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                          {hasAdhdScreenerPositive ? (
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-150 space-y-1">
                              <span className="text-[10px] font-mono font-black text-amber-700 uppercase tracking-wider block">Conclusão Sométrica:</span>
                              <h4 className="text-sm font-black text-amber-900">Screener de Triagem: ALTA PROBABILIDADE</h4>
                              <p className="text-[10.5px] font-semibold text-amber-800 leading-relaxed font-sans">
                                O especialista informou {pCount} sintomas positivos na avaliação da Parte A. Isso representa escores acima do limiar indicado para TDAH em adultos.
                              </p>
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                              <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider block">Conclusão Sométrica:</span>
                              <h4 className="text-sm font-black text-slate-800">Screener de Triagem: Baixa Probabilidade</h4>
                              <p className="text-[10.5px] font-semibold text-slate-500 leading-relaxed font-sans">
                                Menos de 4 sintomas na triagem da Parte A indicam baixa probabilidade patológica imediata.
                              </p>
                            </div>
                          )}

                          <div className="space-y-1.5 font-sans">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Anotação Clínica Lançada:</span>
                            <textarea 
                              readOnly
                              rows={6}
                              value={reportText}
                              className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3.5 text-[11px] font-mono leading-relaxed text-slate-600 focus:outline-hidden resize-none"
                            />
                            <button
                              onClick={() => handleCopyText(reportText, 'asrs-direct-report')}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {copiedId === 'asrs-direct-report' ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Relatório Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-white/80" />
                                  <span>Copiar Relatório Lançado</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  setSelectedTestToRun(null);
                  setInteractiveAnswers({});
                  setManualRawScore('');
                }}
                className="px-4 py-2 bg-white border border-slate-150 text-slate-700 hover:bg-slate-100 rounded-xl font-black transition-colors cursor-pointer"
              >
                Fechar Assistente
              </button>
            </div>

          </div>
        </div>
      )}

      </div>
    );
  }
