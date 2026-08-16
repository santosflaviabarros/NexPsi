export interface QuestionItem {
  id: number;
  text: string;
  dimension?: string;
  desc?: string;
}

export interface AnswerOption {
  score: number;
  text: string;
}

export interface InterpretationResult {
  title: string;
  className: string;
  description: string;
  details?: Record<string, string | number>;
}

// ----------------------------------------------------
// 1. EADS-21 / DASS-21
// ----------------------------------------------------
export const EADS21_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Achei difícil me acalmar ou relaxar após os episódios estressantes", dimension: 'estresse' },
  { id: 2, text: "Senti minha boca seca ou alterada fisiologicamente", dimension: 'ansiedade' },
  { id: 3, text: "Não consegui vivenciar ou sentir qualquer tipo de sentimento positivo", dimension: 'depressao' },
  { id: 4, text: "Tive dificuldade em respirar (ex: respiração excessivamente rápida, falta de ar sem esforço)", dimension: 'ansiedade' },
  { id: 5, text: "Achei extremamente difícil ter iniciativa para fazer as coisas do dia a dia", dimension: 'depressao' },
  { id: 6, text: "Tive a tendência de reagir de forma exagerada ou intempestiva às situações", dimension: 'estresse' },
  { id: 7, text: "Senti tremores físicos perceptíveis (ex: tremores finos nas mãos ou pernas)", dimension: 'ansiedade' },
  { id: 8, text: "Senti que estava consumindo muita energia nervosa ou desnecessária", dimension: 'estresse' },
  { id: 9, text: "Preocupei-me com situações em que poderia entrar em pânico ou passar vergonha", dimension: 'ansiedade' },
  { id: 10, text: "Senti que não tinha nada de bom para esperar em relação ao meu futuro", dimension: 'depressao' },
  { id: 11, text: "Senti-me impaciente, agitado ou intolerante com atrasos ou esperas", dimension: 'estresse' },
  { id: 12, text: "Achei difícil relaxar ou 'desligar' a mente", dimension: 'estresse' },
  { id: 13, text: "Senti-me melancólico(a), desanimado(a) e profundamente deprimido(a)", dimension: 'depressao' },
  { id: 14, text: "Fui intolerante ou irritadiço com qualquer coisa que me impedisse de continuar o que fazia", dimension: 'estresse' },
  { id: 15, text: "Senti que estava prestes a entrar em pânico ou perder o controle das minhas emoções", dimension: 'ansiedade' },
  { id: 16, text: "Senti-me incapaz de me entusiasmar ou ter prazer com qualquer tipo de atividade", dimension: 'depressao' },
  { id: 17, text: "Senti que não tinha muito valor como pessoa ou que fracassava", dimension: 'depressao' },
  { id: 18, text: "Senti-me emotivo(a) ou sensível demais, irritando-me com facilidade", dimension: 'estresse' },
  { id: 19, text: "Senti palpitações ou aceleração cardíaca mesmo sem esforço físico prévio", dimension: 'ansiedade' },
  { id: 20, text: "Senti medo ou sobressalto sem que houvesse um motivo real plausível", dimension: 'ansiedade' },
  { id: 21, text: "Senti que a vida estava vazia ou que não tinha nenhum sentido continuar", dimension: 'depressao' }
];

export const EADS21_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Não se aplicou de maneira alguma a mim" },
  { score: 1, text: "Aplicou-se a mim em algum grau (por pouco tempo)" },
  { score: 2, text: "Aplicou-se a mim num grau considerável (muito tempo)" },
  { score: 3, text: "Aplicou-se a mim muito de perto (na maior parte do tempo)" }
];

export function interpretEADS21(dep: number, ans: number, est: number) {
  const dScore = dep * 2;
  const aScore = ans * 2;
  const sScore = est * 2;

  const getDepLabel = (s: number) => {
    if (s <= 9) return { title: "Normal", label: "Normal", className: "text-emerald-700 bg-emerald-50 border-emerald-200", color: "text-emerald-700 bg-emerald-50" };
    if (s <= 13) return { title: "Leve", label: "Leve", className: "text-amber-700 bg-amber-50 border-amber-200", color: "text-amber-700 bg-amber-50" };
    if (s <= 20) return { title: "Moderado", label: "Moderado", className: "text-orange-700 bg-orange-50 border-orange-200", color: "text-orange-700 bg-orange-50" };
    if (s <= 27) return { title: "Grave", label: "Grave", className: "text-red-700 bg-red-50 border-red-200", color: "text-red-650 bg-red-50" };
    return { title: "Muito Grave", label: "Muito Grave", className: "text-red-800 bg-red-100 border-red-300 font-bold", color: "text-red-800 bg-red-100" };
  };

  const getAnsLabel = (s: number) => {
    if (s <= 7) return { title: "Normal", label: "Normal", className: "text-emerald-700 bg-emerald-50 border-emerald-200", color: "text-emerald-700 bg-emerald-50" };
    if (s <= 9) return { title: "Leve", label: "Leve", className: "text-amber-700 bg-amber-50 border-amber-200", color: "text-amber-700 bg-amber-50" };
    if (s <= 14) return { title: "Moderado", label: "Moderado", className: "text-orange-700 bg-orange-50 border-orange-200", color: "text-orange-700 bg-orange-50" };
    if (s <= 19) return { title: "Grave", label: "Grave", className: "text-red-700 bg-red-50 border-red-200", color: "text-red-650 bg-red-50" };
    return { title: "Muito Grave", label: "Muito Grave", className: "text-red-800 bg-red-100 border-red-300 font-bold", color: "text-red-800 bg-red-100" };
  };

  const getEstLabel = (s: number) => {
    if (s <= 14) return { title: "Normal", label: "Normal", className: "text-emerald-700 bg-emerald-50 border-emerald-200", color: "text-emerald-700 bg-emerald-50" };
    if (s <= 18) return { title: "Leve", label: "Leve", className: "text-amber-700 bg-amber-50 border-amber-200", color: "text-amber-700 bg-amber-50" };
    if (s <= 25) return { title: "Moderado", label: "Moderado", className: "text-orange-700 bg-orange-50 border-orange-200", color: "text-orange-700 bg-orange-50" };
    if (s <= 33) return { title: "Grave", label: "Grave", className: "text-red-700 bg-red-50 border-red-200", color: "text-red-650 bg-red-50" };
    return { title: "Muito Grave", label: "Muito Grave", className: "text-red-800 bg-red-100 border-red-300 font-bold", color: "text-red-800 bg-red-100" };
  };

  const depResult = { score: dScore, ...getDepLabel(dScore) };
  const ansResult = { score: aScore, ...getAnsLabel(aScore) };
  const estResult = { score: sScore, ...getEstLabel(sScore) };

  return {
    dep: depResult,
    ans: ansResult,
    est: estResult,
    depression: depResult,
    anxiety: ansResult,
    stress: estResult
  };
}

// ----------------------------------------------------
// 2. ASRS-18 (TDAH em Adultos)
// ----------------------------------------------------
export const ASRS18_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Com que frequência tem dificuldade para finalizar os detalhes de um projeto após ter feito a parte difícil?", dimension: 'desatencao' },
  { id: 2, text: "Com que frequência tem dificuldade para colocar as coisas em ordem quando organiza uma tarefa complexa?", dimension: 'desatencao' },
  { id: 3, text: "Com que frequência tem dificuldade para se lembrar de compromissos, reuniões ou obrigações?", dimension: 'desatencao' },
  { id: 4, text: "Quando tem uma tarefa que exige muito esforço mental, evitas ou adias o início da mesma?", dimension: 'desatencao' },
  { id: 5, text: "Com que frequência mexe as mãos, os pés, ou se contorce na cadeira quando precisa sentar por muito tempo?", dimension: 'hiperatividade' },
  { id: 6, text: "Com que frequência sente-se ativo demais, inquieto(a), como se estivesse com o 'motor ligado'?", dimension: 'hiperatividade' },
  { id: 7, text: "Com que frequência comete erros por descuido num projeto entediante ou difícil?", dimension: 'desatencao' },
  { id: 8, text: "Com que frequência tem problemas para manter a atenção num trabalho monótono ou repetitivo?", dimension: 'desatencao' },
  { id: 9, text: "Com que frequência tem dificuldade em concentrar-se nas conversas de outros, mesmo diretamente?", dimension: 'desatencao' },
  { id: 10, text: "Com que frequência perde objetos importantes ou tem dificuldade de achá-los em casa/trabalho?", dimension: 'desatencao' },
  { id: 11, text: "Com que frequência distrai-se facilmente com estímulos que ocorrem ao ambiente ao redor?", dimension: 'desatencao' },
  { id: 12, text: "Com que frequência levanta-se de sua cadeira em reuniões onde deveria permanecer sentado?", dimension: 'hiperatividade' },
  { id: 13, text: "Com que frequência sente agitação interna ou impaciência?", dimension: 'hiperatividade' },
  { id: 14, text: "Com que frequência tem dificuldades para sossegar e relaxar em momentos de folga ou lazer?", dimension: 'hiperatividade' },
  { id: 15, text: "Com que frequência percebe-se falando de forma excessiva ou atropelada em interações?", dimension: 'hiperatividade' },
  { id: 16, text: "Com que frequência termina as frases dos outros antes que eles consigam terminá-las?", dimension: 'hiperatividade' },
  { id: 17, text: "Com que frequência tem séria dificuldade para esperar pela sua vez ou em filas de espera?", dimension: 'hiperatividade' },
  { id: 18, text: "Com que frequência interrompe ou se intromete em atividades/especulações de terceiros?", dimension: 'hiperatividade' }
];

export const ASRS18_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nunca" },
  { score: 1, text: "Raramente" },
  { score: 2, text: "Às vezes" },
  { score: 3, text: "Frequentemente" },
  { score: 4, text: "Muito Frequentemente" }
];

export function interpretASRS18(partAPositiveCount: number, totalScore: number): InterpretationResult {
  if (partAPositiveCount >= 4) {
    return {
      title: "Rastreio Positivo para TDAH (Alta Probabilidade)",
      className: "bg-red-50 text-red-850 border-red-200",
      description: `O paciente pontuou em ${partAPositiveCount} itens críticos na Parte A (critério >= 4). Escore total de ${totalScore}/72. Indica forte compatibilidade com os critérios diagnósticos de TDAH do DSM-5. Recomendada investigação neuropsicológica completa.`
    };
  } else {
    return {
      title: "Rastreio Negativo para TDAH",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: `O paciente pontuou em ${partAPositiveCount} itens críticos na Parte A (abaixo da linha de corte de 4). Escore total de ${totalScore}/72. Sintomas atencionais podem ser secundários a ansiedade, estresse ou sono.`
    };
  }
}

// ----------------------------------------------------
// 3. PHQ-9 (Patient Health Questionnaire - 9 para Depressão)
// ----------------------------------------------------
export const PHQ9_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Pouco interesse ou pouco prazer em fazer as coisas", desc: "Anedonia" },
  { id: 2, text: "Sentir-se 'para baixo', deprimido(a) ou sem perspectiva", desc: "Humor deprimido" },
  { id: 3, text: "Dificuldade para adormecer, permanecer dormindo ou dormir demais", desc: "Alteração de sono" },
  { id: 4, text: "Sentir-se cansado(a) ou com pouca energia", desc: "Fadiga" },
  { id: 5, text: "Falta de apetite ou comer em excesso", desc: "Alteração de apetite" },
  { id: 6, text: "Sentir-se mal consigo mesmo(a) — ou achar que é um fracasso ou que decepcionou a si mesmo(a) ou sua família", desc: "Culpa / Inutilidade" },
  { id: 7, text: "Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão", desc: "Concentração" },
  { id: 8, text: "Mover-se ou falar tão lentamente que outras pessoas poderiam notar, ou o oposto — estar tão agitado(a) que tem andado de um lado para o outro mais do que o normal", desc: "Retardo/Agitação psicomotora" },
  { id: 9, text: "Pensamentos de que seria melhor estar morto(a) ou de se ferir de alguma forma", desc: "Ideação de morte/suicídio" }
];

export const PHQ9_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nenhuma vez" },
  { score: 1, text: "Vários dias" },
  { score: 2, text: "Mais da metade dos dias" },
  { score: 3, text: "Quase todos os dias" }
];

export function interpretPHQ9(score: number, item9Score: number = 0): InterpretationResult {
  let riskNote = item9Score > 0 ? " ⚠️ ATENÇÃO: Presença de ideação suicida no item 9. Requer avaliação de segurança imediata." : "";
  if (score <= 4) {
    return { title: "Depressão Mínima ou Ausente", className: "bg-emerald-50 text-emerald-800 border-emerald-200", description: `Pontuação de ${score}/27. Sintomas ausentes ou mínimos.${riskNote}` };
  } else if (score <= 9) {
    return { title: "Depressão Leve", className: "bg-amber-50 text-amber-800 border-amber-200", description: `Pontuação de ${score}/27. Sugere sintomas depressivos leves. Indicada psicoeducação e vigilância.${riskNote}` };
  } else if (score <= 14) {
    return { title: "Depressão Moderada", className: "bg-orange-50 text-orange-850 border-orange-200", description: `Pontuação de ${score}/27. Requer elaboração de plano psicoterápico focado.${riskNote}` };
  } else if (score <= 19) {
    return { title: "Depressão Moderadamente Grave", className: "bg-rose-50 text-rose-850 border-rose-200", description: `Pontuação de ${score}/27. Quadro clínico consistente com episódio depressivo maior. Recomendada avaliação psiquiátrica em conjunto.${riskNote}` };
  } else {
    return { title: "Depressão Grave", className: "bg-red-50 text-red-900 border-red-300 font-black", description: `Pontuação de ${score}/27. Sofrimento psíquico severo e incapacitante. Intervenção terapêutica intensiva e suporte psiquiátrico urgentes.${riskNote}` };
  }
}

// ----------------------------------------------------
// 4. GAD-7 (Escala de Ansiedade Generalizada - 7 itens)
// ----------------------------------------------------
export const GAD7_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Sentir-se nervoso(a), ansioso(a) ou no limite dos nervos", desc: "Apreensão" },
  { id: 2, text: "Não conseguir parar de se preocupar ou controlar as preocupações", desc: "Incontrolabilidade" },
  { id: 3, text: "Preocupar-se demais com várias coisas diferentes", desc: "Preocupação excessiva" },
  { id: 4, text: "Dificuldade para relaxar", desc: "Tensão" },
  { id: 5, text: "Ficar tão inquieto(a) que é difícil permanecer sentado(a)", desc: "Inquietação psicomotora" },
  { id: 6, text: "Ficar facilmente irritado(a) ou chateado(a)", desc: "Irritabilidade" },
  { id: 7, text: "Sentir medo como se algo terrível fosse acontecer", desc: "Medo / Expectativa catastrófica" }
];

export const GAD7_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nenhuma vez" },
  { score: 1, text: "Vários dias" },
  { score: 2, text: "Mais da metade dos dias" },
  { score: 3, text: "Quase todos os dias" }
];

export function interpretGAD7(score: number): InterpretationResult {
  if (score <= 4) {
    return { title: "Ansiedade Mínima", className: "bg-emerald-50 text-emerald-800 border-emerald-200", description: `Escore de ${score}/21. Nível basal sem impacto funcional significativo.` };
  } else if (score <= 9) {
    return { title: "Ansiedade Leve", className: "bg-amber-50 text-amber-800 border-amber-200", description: `Escore de ${score}/21. Presença de sintomas leves de ansiedade. Recomenda-se monitoramento e técnicas de regulação.` };
  } else if (score <= 14) {
    return { title: "Ansiedade Moderada", className: "bg-orange-50 text-orange-850 border-orange-200", description: `Escore de ${score}/21. Sugere provável Transtorno de Ansiedade Generalizada (TAG). Intervenção de TCC recomendada.` };
  } else {
    return { title: "Ansiedade Grave", className: "bg-red-50 text-red-900 border-red-300", description: `Escore de ${score}/21. Sofrimento ansioso severo e impacto marcante na rotina diária. Recomendada abordagem clínica multiprofissional.` };
  }
}

// ----------------------------------------------------
// 5. SPIN (Social Phobia Inventory - Fobia Social / Ansiedade Social)
// ----------------------------------------------------
export const SPIN_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Tenho medo de pessoas que estão em posições de autoridade", desc: "Medo de autoridade" },
  { id: 2, text: "Fico incomodado(a) por corar (ficar vermelho) diante de outras pessoas", desc: "Sintoma somático" },
  { id: 3, text: "Festas e eventos sociais me causam medo ou grande desconforto", desc: "Evitação social" },
  { id: 4, text: "Evito falar com pessoas que não conheço bem", desc: "Esquiva de estranhos" },
  { id: 5, text: "Tenho muito medo de ser criticado(a) pelos outros", desc: "Sensibilidade a críticas" },
  { id: 6, text: "O medo de passar vergonha me faz evitar fazer certas coisas ou falar com pessoas", desc: "Medo de humilhação" },
  { id: 7, text: "Suar diante de outras pessoas me incomoda muito", desc: "Sudorese ansiosa" },
  { id: 8, text: "Evito ir a festas ou reuniões sociais", desc: "Esquiva ativa" },
  { id: 9, text: "Evito atividades nas quais eu seja o centro das atenções", desc: "Centro de atenção" },
  { id: 10, text: "Falar com estranhos me assusta", desc: "Ansiedade de contato" },
  { id: 11, text: "Evito ter que fazer discursos ou apresentações em público", desc: "Apresentação em público" },
  { id: 12, text: "Faria quase qualquer coisa para evitar ser criticado(a)", desc: "Esquiva de julgamento" },
  { id: 13, text: "Coração acelerado/palpitações me incomodam quando estou com pessoas", desc: "Taquicardia social" },
  { id: 14, text: "Tenho medo de fazer coisas quando as pessoas podem estar me observando", desc: "Ser observado" },
  { id: 15, text: "Passar vergonha ou parecer bobo(a) são meus maiores medos", desc: "Medo de ridicularização" },
  { id: 16, text: "Evito falar com qualquer pessoa em posição de autoridade", desc: "Esquiva de autoridade" },
  { id: 17, text: "Tremer diante dos outros me causa angústia", desc: "Tremores sociais" }
];

export const SPIN_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nem um pouco" },
  { score: 1, text: "Um pouco" },
  { score: 2, text: "Mais ou menos" },
  { score: 3, text: "Muito" },
  { score: 4, text: "Extremamente" }
];

export function interpretSPIN(score: number): InterpretationResult {
  if (score < 19) {
    return { title: "Sem Fobia Social Significativa", className: "bg-emerald-50 text-emerald-800 border-emerald-200", description: `Escore de ${score}/68. Desconforto social dentro da faixa esperada e adaptativa.` };
  } else if (score <= 30) {
    return { title: "Fobia Social Leve", className: "bg-amber-50 text-amber-800 border-amber-200", description: `Escore de ${score}/68. Presença de ansiedade social leve em situações específicas.` };
  } else if (score <= 40) {
    return { title: "Fobia Social Moderada", className: "bg-orange-50 text-orange-850 border-orange-200", description: `Escore de ${score}/68. Prejuízo funcional perceptível em contextos sociais e acadêmicos/laborais. Indicado treino de assertividade e dessensibilização.` };
  } else if (score <= 50) {
    return { title: "Fobia Social Grave", className: "bg-rose-50 text-rose-850 border-rose-200", description: `Escore de ${score}/68. Transtorno de Ansiedade Social significativo com evitação acentuada de situações interpessoais.` };
  } else {
    return { title: "Fobia Social Muito Grave", className: "bg-red-50 text-red-900 border-red-300", description: `Escore de ${score}/68. Isolamento social severo, esquiva fóbica crônica e grande sofrimento psíquico.` };
  }
}

// ----------------------------------------------------
// 6. OCI-R (Inventário Obsessivo-Compulsivo Revisado - TOC)
// ----------------------------------------------------
export const OCIR_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Guardo tantas coisas que elas acabam atrapalhando meu espaço", dimension: "acumulacao" },
  { id: 2, text: "Verifico coisas mais vezes do que o necessário (portas, gás, luzes)", dimension: "verificacao" },
  { id: 3, text: "Fico muito chateado(a) se as coisas não estiverem perfeitamente arrumadas ou alinhadas", dimension: "ordenacao" },
  { id: 4, text: "Sinto-me obrigado(a) a contar enquanto estou fazendo certas coisas", dimension: "neutralizacao" },
  { id: 5, text: "Acho difícil tocar em objetos que outras pessoas tocaram por medo de contaminação", dimension: "limpeza" },
  { id: 6, text: "Tenho dificuldade em controlar meus próprios pensamentos desagradáveis", dimension: "obsessao" },
  { id: 7, text: "Coleciono coisas de que não preciso ou não usarei", dimension: "acumulacao" },
  { id: 8, text: "Fico checando repetidamente portas, janelas e gavetas", dimension: "verificacao" },
  { id: 9, text: "Fico angustiado(a) se outros mudarem a ordem em que deixei minhas coisas", dimension: "ordenacao" },
  { id: 10, text: "Sinto que tenho que repetir certos números ou palavras mentalmente para evitar que algo ruim aconteça", dimension: "neutralizacao" },
  { id: 11, text: "Lavo as mãos com muito mais frequência ou por mais tempo do que as outras pessoas", dimension: "limpeza" },
  { id: 12, text: "Tenho pensamentos frequentes e perturbadores que parecem contra a minha vontade", dimension: "obsessao" },
  { id: 13, text: "Evito jogar coisas fora porque acho que posso precisar delas mais tarde", dimension: "acumulacao" },
  { id: 14, text: "Verifico repetidamente se desliguei fogão, torneiras ou aparelhos elétricos", dimension: "verificacao" },
  { id: 15, text: "Preciso que as coisas estejam simétricas ou na ordem exata", dimension: "ordenacao" },
  { id: 16, text: "Sinto necessidade de realizar certas ações um número exato de vezes para me sentir em paz", dimension: "neutralizacao" },
  { id: 17, text: "Sinto nojo ou medo excessivo de sujeira, germes ou produtos químicos", dimension: "limpeza" },
  { id: 18, text: "Pensamentos nojentos ou inaceitáveis invadem minha mente repetidamente", dimension: "obsessao" }
];

export const OCIR_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nem um pouco" },
  { score: 1, text: "Um pouco" },
  { score: 2, text: "Moderadamente" },
  { score: 3, text: "Muito" },
  { score: 4, text: "Extremamente" }
];

export function interpretOCIR(score: number): InterpretationResult {
  if (score >= 21) {
    return {
      title: "Rastreio Positivo para TOC (Escore Clínico)",
      className: "bg-red-50 text-red-850 border-red-200",
      description: `Escore total de ${score}/72 (ponto de corte >= 21). Presença marcante de sintomas obsessivo-compulsivos clinicamente significativos. Recomendada investigação diagnóstica de TOC e protocolo de Exposição com Prevenção de Resposta (EPR).`
    };
  } else {
    return {
      title: "Sintomatologia Obsessiva Abaixo do Ponto de Corte",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: `Escore de ${score}/72 (abaixo do corte de 21). Hábitos ou manias dentro da normalidade estatística.`
    };
  }
}

// ----------------------------------------------------
// 7. PCL-5 (Checklist de TEPT para o DSM-5 - Trauma)
// ----------------------------------------------------
export const PCL5_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Lembranças repetidas, perturbadoras e indesejadas da experiência estressante?", dimension: "intrusao" },
  { id: 2, text: "Sonhos perturbadores e repetidos sobre a experiência estressante?", dimension: "intrusao" },
  { id: 3, text: "Sentir ou agir de repente como se a experiência estressante estivesse acontecendo de novo (flashbacks)?", dimension: "intrusao" },
  { id: 4, text: "Sentir-se muito chateado(a) quando algo o(a) lembrava da experiência estressante?", dimension: "intrusao" },
  { id: 5, text: "Ter reações físicas fortes (como coração batendo forte, suores, falta de ar) quando algo o(a) lembrava?", dimension: "intrusao" },
  { id: 6, text: "Evitar memórias, pensamentos ou sentimentos relacionados à experiência estressante?", dimension: "esquiva" },
  { id: 7, text: "Evitar lembretes externos (pessoas, lugares, conversas, objetos, situações) do ocorrido?", dimension: "esquiva" },
  { id: 8, text: "Dificuldade para lembrar partes importantes da experiência estressante?", dimension: "cognicao" },
  { id: 9, text: "Crenças negativas muito fortes sobre si mesmo, outras pessoas ou o mundo (ex: 'Não se pode confiar em ninguém')?", dimension: "cognicao" },
  { id: 10, text: "Culpar a si mesmo(a) ou a outra pessoa pelo ocorrido ou pelo que aconteceu depois?", dimension: "cognicao" },
  { id: 11, text: "Sentimentos negativos muito fortes como medo, pavor, raiva, culpa ou vergonha?", dimension: "cognicao" },
  { id: 12, text: "Perda de interesse em atividades que você costumava apreciar?", dimension: "cognicao" },
  { id: 13, text: "Sentir-se distante ou isolado(a) das outras pessoas?", dimension: "cognicao" },
  { id: 14, text: "Dificuldade para ter sentimentos positivos (como amor, felicidade ou satisfação)?", dimension: "cognicao" },
  { id: 15, text: "Comportamento irritável, explosões de raiva ou agressividade sem motivo?", dimension: "hiperestimulacao" },
  { id: 16, text: "Assumir riscos excessivos ou fazer coisas que podem lhe prejudicar?", dimension: "hiperestimulacao" },
  { id: 17, text: "Estar em estado de 'superalerta', vigilante ou em guarda constante?", dimension: "hiperestimulacao" },
  { id: 18, text: "Sentir-se sobressaltado(a) ou assustar-se com facilidade?", dimension: "hiperestimulacao" },
  { id: 19, text: "Dificuldade para se concentrar?", dimension: "hiperestimulacao" },
  { id: 20, text: "Dificuldade para adormecer ou continuar dormindo?", dimension: "hiperestimulacao" }
];

export const PCL5_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nem um pouco" },
  { score: 1, text: "Um pouco" },
  { score: 2, text: "Moderadamente" },
  { score: 3, text: "Muito" },
  { score: 4, text: "Extremamente" }
];

export function interpretPCL5(score: number): InterpretationResult {
  if (score >= 33) {
    return {
      title: "Rastreio Positivo para TEPT (Critério DSM-5)",
      className: "bg-red-50 text-red-850 border-red-200 font-bold",
      description: `Escore total de ${score}/80 (ponto de corte >= 33). Alta probabilidade de Transtorno de Estresse Pós-Traumático (TEPT). Indicada intervenção baseada em processamento de trauma (TCC focada no trauma / EMDR).`
    };
  } else {
    return {
      title: "Sintomatologia Pós-Traumática Abaixo do Ponto de Corte",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: `Escore total de ${score}/80 (abaixo do corte de 33). Sintomas residuais ou adaptativos de estresse.`
    };
  }
}

// ----------------------------------------------------
// 8. MSI-BPD (McLean Screening Instrument para Transtorno de Personalidade Borderline)
// ----------------------------------------------------
export const MSIBPD_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Você já fez esforços desesperados para evitar ser abandonado(a) por alguém importante para você?", desc: "Medo de abandono" },
  { id: 2, text: "Seus relacionamentos com pessoas próximas costumam ser muito intensos e instáveis, alternando entre admiração extrema e grande decepção/raiva?", desc: "Relações instáveis" },
  { id: 3, text: "Você costuma ter mudanças repentinas na sua visão sobre si mesmo(a), sobre quem você é ou sobre seus objetivos de vida?", desc: "Instabilidade de autoimagem" },
  { id: 4, text: "Você já agiu por impulso em pelo menos duas áreas que poderiam lhe prejudicar (ex: gastos descontrolados, sexo de risco, abuso de substâncias, direção perigosa, compulsão alimentar)?", desc: "Impulsividade autodestrutiva" },
  { id: 5, text: "Você já ameaçou ou tentou se machucar, se cortar ou cometer suicídio?", desc: "Autolesão / Ideação" },
  { id: 6, text: "Você costuma ter oscilações intensas de humor que duram de algumas horas a poucos dias (ex: ansiedade intensa, irritabilidade, desespero)?", desc: "Instabilidade afetiva" },
  { id: 7, text: "Você sente com frequência um sentimento crônico de vazio interior?", desc: "Vazio crônico" },
  { id: 8, text: "Você costuma ter acessos de raiva intensa ou muita dificuldade para controlar sua irritação?", desc: "Raiva inapropriada" },
  { id: 9, text: "Quando está sob muito estresse, você chega a sentir que as coisas não são reais (despersonalização) ou fica muito desconfiado(a) de que os outros estão contra você?", desc: "Dissociação / Paranoia" },
  { id: 10, text: "Você costuma achar que as pessoas são ou 'totalmente boas' ou 'totalmente más', sem meio-termo?", desc: "Pensamento dicotômico" }
];

export const MSIBPD_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Não (0 pontos)" },
  { score: 1, text: "Sim (1 ponto)" }
];

export function interpretMSIBPD(score: number): InterpretationResult {
  if (score >= 7) {
    return {
      title: "Rastreio Positivo para TPB (Borderline)",
      className: "bg-red-50 text-red-850 border-red-200",
      description: `Escore de ${score}/10 (ponto de corte >= 7). Alta sensibilidade e especificidade para Transtorno de Personalidade Limítrofe (Borderline). Recomendada abordagem em Terapia Comportamental Dialética (DBT) e regulação emocional.`
    };
  } else if (score >= 5) {
    return {
      title: "Traços de Instabilidade Emocional Subclínicos",
      className: "bg-amber-50 text-amber-800 border-amber-200",
      description: `Escore de ${score}/10. Presença de traços de desregulação emocional e impulsividade, sem preencher todos os critérios estritos de rastreio.`
    };
  } else {
    return {
      title: "Rastreio Negativo para TPB",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: `Escore de ${score}/10 (abaixo do corte de 7). Padrão de personalidade e regulação afetiva estável.`
    };
  }
}

// ----------------------------------------------------
// 9. MDQ (Mood Disorder Questionnaire - Rastreio de Transtorno Bipolar)
// ----------------------------------------------------
export const MDQ_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Sentiu-se tão bem ou tão animado(a) que as outras pessoas acharam que você não estava normal ou ficou tão 'ligado(a)' que se meteu em confusão?", desc: "Euforia" },
  { id: 2, text: "Ficou tão irritado(a) que chegou a gritar com as pessoas, iniciar brigas ou discussões?", desc: "Irritabilidade" },
  { id: 3, text: "Sentiu-se muito mais autoconfiante do que o habitual?", desc: "Grandiosidade" },
  { id: 4, text: "Dormiu muito menos do que o normal e mesmo assim não sentiu falta de sono?", desc: "Redução da necessidade de sono" },
  { id: 5, text: "Falou muito mais ou muito mais rápido do que de costume?", desc: "Pressão de fala" },
  { id: 6, text: "Os pensamentos passavam tão rápido pela sua cabeça que você não conseguia acompanhá-los?", desc: "Fuga de ideias" },
  { id: 7, text: "Distraía-se tão facilmente que qualquer coisa ao redor desviava sua atenção?", desc: "Distraibilidade" },
  { id: 8, text: "Teve muito mais energia do que o habitual para fazer coisas?", desc: "Aumento de energia" },
  { id: 9, text: "Ficou muito mais ativo(a) ou fez muito mais coisas do que o habitual?", desc: "Aumento de atividade" },
  { id: 10, text: "Ficou muito mais sociável ou extrovertido(a) do que o normal?", desc: "Desinibição social" },
  { id: 11, text: "Ficou muito mais interessado(a) em sexo do que o habitual?", desc: "Hipersexualidade" },
  { id: 12, text: "Fez coisas incomuns para você ou que outras pessoas poderiam achar arriscadas, tolas ou perigosas?", desc: "Comportamento de risco" },
  { id: 13, text: "Gastou tanto dinheiro que isso causou problemas para você ou sua família?", desc: "Gastos desmedidos" }
];

export const MDQ_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Não" },
  { score: 1, text: "Sim" }
];

export function interpretMDQ(yesCount: number, simultaneous: boolean = true, impairmentLevel: number = 2): InterpretationResult {
  const isPositive = yesCount >= 7 && simultaneous && impairmentLevel >= 2;
  if (isPositive) {
    return {
      title: "Rastreio Positivo para Espectro Bipolar",
      className: "bg-red-50 text-red-850 border-red-200",
      description: `O paciente respondeu 'Sim' para ${yesCount}/13 sintomas de mania/hipomania, ocorridos no mesmo período e gerando prejuízo moderado/grave. Sugere alta compatibilidade com Transtorno Afetivo Bipolar (Tipo I, II ou Ciclotimia). Avaliação psiquiátrica indicada.`
    };
  } else {
    return {
      title: "Rastreio Negativo para Transtorno Bipolar",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: `Escore de ${yesCount}/13 'Sim'. Não preenche a tríade de critérios do MDQ (>=7 itens simultâneos com prejuízo funcional).`
    };
  }
}

// ----------------------------------------------------
// 10. EAT-26 (Eating Attitudes Test - Transtornos Alimentares)
// ----------------------------------------------------
export const EAT26_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Tenho pavor de estar acima do peso ou de engordar", dimension: "dieta" },
  { id: 2, text: "Evito comer quando estou com fome", dimension: "dieta" },
  { id: 3, text: "Fico preocupado(a) com comida e calorias durante o dia", dimension: "dieta" },
  { id: 4, text: "Já tive crises em que comi grandes quantidades de comida sem conseguir parar", dimension: "bulimia" },
  { id: 5, text: "Corto minha comida em pedacinhos minúsculos", dimension: "oral" },
  { id: 6, text: "Estou ciente do teor de calorias de tudo o que como", dimension: "dieta" },
  { id: 7, text: "Evito comidas com muitos carboidratos (pães, arroz, massas)", dimension: "dieta" },
  { id: 8, text: "Sinto que os outros gostariam que eu comesse mais", dimension: "oral" },
  { id: 9, text: "Já vomitei deliberadamente após comer para não engordar", dimension: "bulimia" },
  { id: 10, text: "Sinto culpa extrema depois de comer", dimension: "dieta" },
  { id: 11, text: "Preocupo-me com o desejo de ser mais magro(a)", dimension: "dieta" },
  { id: 12, text: "Faço exercícios físicos exagerados para queimar calorias", dimension: "dieta" },
  { id: 13, text: "Outras pessoas acham que estou magro(a) demais, mas eu não concordo", dimension: "oral" },
  { id: 14, text: "Preocupo-me com a ideia de ter gordura no meu corpo", dimension: "dieta" },
  { id: 15, text: "Levo mais tempo para comer do que as outras pessoas", dimension: "oral" },
  { id: 16, text: "Evito alimentos com açúcar", dimension: "dieta" },
  { id: 17, text: "Como alimentos dietéticos/light com frequência", dimension: "dieta" },
  { id: 18, text: "Sinto que a comida controla minha vida", dimension: "oral" },
  { id: 19, text: "Tenho autocontrole rigoroso em relação à comida", dimension: "oral" },
  { id: 20, text: "Sinto que os outros me pressionam para comer", dimension: "oral" },
  { id: 21, text: "Gasto muito tempo e pensamento sobre comida", dimension: "oral" },
  { id: 22, text: "Sinto-me desconfortável após comer doces", dimension: "dieta" },
  { id: 23, text: "Estou engajado(a) em programas de dieta rigorosa", dimension: "dieta" },
  { id: 24, text: "Gosto de sentir meu estômago vazio", dimension: "dieta" },
  { id: 25, text: "Tenho o impulso de vomitar depois das refeições", dimension: "bulimia" },
  { id: 26, text: "Gosto de experimentar comidas novas e ricas", dimension: "oral" }
];

export const EAT26_ANSWERS: AnswerOption[] = [
  { score: 3, text: "Sempre (3 pts)" },
  { score: 2, text: "Muito frequentemente (2 pts)" },
  { score: 1, text: "Frequentemente (1 pt)" },
  { score: 0, text: "Às vezes (0 pts)" },
  { score: 0, text: "Raramente (0 pts)" },
  { score: 0, text: "Nunca (0 pts)" }
];

export function interpretEAT26(score: number): InterpretationResult {
  if (score >= 20) {
    return {
      title: "Rastreio Positivo para Risco de Transtorno Alimentar",
      className: "bg-red-50 text-red-850 border-red-200 font-bold",
      description: `Escore total de ${score} pontos (corte >= 20). Padrão alimentar altamente restritivo ou compensatório. Forte indicação de Anorexia Nervosa, Bulimia Nervosa ou TCA. Recomendada intervenção multidisciplinar (Psicologia + Psiquiatria + Nutrição).`
    };
  } else {
    return {
      title: "Comportamento Alimentar Dentro do Padrão Esperado",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: `Escore de ${score} pontos (abaixo do ponto de corte 20). Baixo risco para transtornos alimentares graves no momento.`
    };
  }
}

// ----------------------------------------------------
// 11. ISI (Insomnia Severity Index - Índice de Gravidade de Insônia)
// ----------------------------------------------------
export const ISI_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Dificuldade para pegar no sono (adormecer)", desc: "Insônia inicial" },
  { id: 2, text: "Dificuldade para permanecer dormindo (despertares no meio da noite)", desc: "Insônia de manutenção" },
  { id: 3, text: "Problemas com acordar muito cedo pela manhã", desc: "Despertar precoce" },
  { id: 4, text: "Quão SATISFEITO(A)/INSATISFEITO(A) você está com seu padrão de sono atual?", desc: "Satisfação subjetiva" },
  { id: 5, text: "Até que ponto você considera que seu problema de sono ATRAPALHA seu funcionamento diário (fadiga, trabalho, humor)?", desc: "Prejuízo diurno" },
  { id: 6, text: "Quão PERCEPTÍVEL para as outras pessoas você acha que é o seu problema de sono?", desc: "Percepção de terceiros" },
  { id: 7, text: "O quanto você está PREOCUPADO(A)/ANGUSTIADO(A) com seus problemas atuais de sono?", desc: "Ansiedade do sono" }
];

export const ISI_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nenhum / Muito satisfeito" },
  { score: 1, text: "Leve / Satisfeito" },
  { score: 2, text: "Moderado / Indiferente" },
  { score: 3, text: "Grave / Insatisfeito" },
  { score: 4, text: "Muito grave / Muito insatisfeito" }
];

export function interpretISI(score: number): InterpretationResult {
  if (score <= 7) {
    return { title: "Sem Insônia Clinicamente Significativa", className: "bg-emerald-50 text-emerald-800 border-emerald-200", description: `Escore de ${score}/28. Padrão de sono preservado e saudável.` };
  } else if (score <= 14) {
    return { title: "Insônia Subclínica / Leve", className: "bg-amber-50 text-amber-800 border-amber-200", description: `Escore de ${score}/28. Dificuldades leves de sono. Indicada higiene do sono e controle de estímulos.` };
  } else if (score <= 21) {
    return { title: "Insônia Clínica Moderada", className: "bg-orange-50 text-orange-850 border-orange-200", description: `Escore de ${score}/28. Insônia moderada com prejuízo na concentração diurna. Indicada TCC para Insônia (TCC-I).` };
  } else {
    return { title: "Insônia Clínica Grave", className: "bg-red-50 text-red-900 border-red-300 font-bold", description: `Escore de ${score}/28. Insônia severa e crônica. Requer abordagem combinada de higiene do sono rigorosa, TCC-I e avaliação médica.` };
  }
}

// ----------------------------------------------------
// 12. AUDIT (Alcohol Use Disorders Identification Test - OMS)
// ----------------------------------------------------
export const AUDIT_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Com que frequência você consome bebidas que contêm álcool?", desc: "Frequência" },
  { id: 2, text: "Quantas doses contendo álcool você consome em um dia típico quando bebe?", desc: "Quantidade diária" },
  { id: 3, text: "Com que frequência você consome 6 ou mais doses em uma única ocasião (binge drinking)?", desc: "Consumo excessivo ocasional" },
  { id: 4, text: "Com que frequência, durante o último ano, você percebeu que não conseguia parar de beber depois de começar?", desc: "Perda de controle" },
  { id: 5, text: "Com que frequência, no último ano, você deixou de fazer o que era esperado por causa da bebida?", desc: "Prejuízo de obrigações" },
  { id: 6, text: "Com que frequência, no último ano, você precisou de uma bebida pela manhã para se recuperar de uma bebedeira?", desc: "Alívio matinal" },
  { id: 7, text: "Com que frequência, no último ano, você sentiu culpa ou remorso depois de beber?", desc: "Sentimento de culpa" },
  { id: 8, text: "Com que frequência, no último ano, você não conseguiu lembrar o que aconteceu na noite anterior por causa da bebida?", desc: "Amnésia alcoólica (blackout)" },
  { id: 9, text: "Você ou outra pessoa já se machucou em consequência do seu uso de álcool?", desc: "Acidentes / Ferimentos" },
  { id: 10, text: "Um parente, amigo, médico ou profissional de saúde já se preocupou com seu hábito de beber ou sugeriu que você parasse?", desc: "Preocupação de terceiros" }
];

export const AUDIT_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nunca (0 pts)" },
  { score: 1, text: "Menos de uma vez ao mês (1 pt)" },
  { score: 2, text: "Mensalmente / Às vezes (2 pts)" },
  { score: 3, text: "Semanalmente / Frequentemente (3 pts)" },
  { score: 4, text: "Diariamente ou quase diariamente (4 pts)" }
];

export function interpretAUDIT(score: number): InterpretationResult {
  if (score <= 7) {
    return { title: "Zona I: Baixo Risco (Consumo de Baixo Risco)", className: "bg-emerald-50 text-emerald-800 border-emerald-200", description: `Escore de ${score}/40. Padrão de consumo dentro dos limites de baixo risco. Intervenção: Educação preventiva sobre álcool.` };
  } else if (score <= 15) {
    return { title: "Zona II: Uso de Risco", className: "bg-amber-50 text-amber-800 border-amber-200", description: `Escore de ${score}/40. Padrão de consumo de risco para a saúde física e mental. Indicada Intervenção Breve (IB) e aconselhamento motivacional.` };
  } else if (score <= 19) {
    return { title: "Zona III: Uso Nocivo de Álcool", className: "bg-orange-50 text-orange-850 border-orange-200", description: `Escore de ${score}/40. Presença de danos físicos, sociais ou emocionais evidentes. Recomendada psicoterapia focada em adicção e acompanhamento contínuo.` };
  } else {
    return { title: "Zona IV: Provável Dependência Alcoólica", className: "bg-red-50 text-red-900 border-red-300 font-black", description: `Escore de ${score}/40 (>= 20). Forte indicativo de Síndrome de Dependência de Álcool (CID-10: F10.2). Requer intervenção multidisciplinar especializada e avaliação médica para desintoxicação segura.` };
  }
}

// ----------------------------------------------------
// 13. AQ-10 (Autism Spectrum Quotient - Rastreio TEA em Adultos)
// ----------------------------------------------------
export const AQ10_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Eu costumo notar pequenos sons que as outras pessoas não percebem", desc: "Sensibilidade sensorial" },
  { id: 2, text: "Quando estou lendo uma história, acho difícil imaginar como os personagens seriam na vida real", desc: "Teoria da mente" },
  { id: 3, text: "Acho fácil 'ler nas entrelinhas' quando alguém está falando comigo", desc: "Pragmática da comunicação (invertido)" },
  { id: 4, text: "Costumo me concentrar tanto em detalhes de um assunto que perco a visão do quadro geral", desc: "Atenção a detalhes / Hiperfoco" },
  { id: 5, text: "Se houver uma interrupção na minha rotina, consigo voltar ao normal muito facilmente", desc: "Inflexibilidade cognitiva (invertido)" },
  { id: 6, text: "Acho fácil saber o que alguém está pensando ou sentindo apenas olhando para o rosto da pessoa", desc: "Reciprocidade social (invertido)" },
  { id: 7, text: "Quando faço algo, frequentemente fico tão absorvido(a) que me esqueço de tudo ao redor", desc: "Monotropismo / Hiperfoco" },
  { id: 8, text: "Gosto de coletar informações sobre categorias de coisas (carros, pássaros, plantas, trens)", desc: "Interesses restritos" },
  { id: 9, text: "Acho fácil descobrir o que as outras pessoas estão pensando apenas pela expressão facial", desc: "Pistas sociais (invertido)" },
  { id: 10, text: "Tenho dificuldade para fazer novos amigos ou manter conversas casuais ('small talk')", desc: "Socialização / Conversação" }
];

export const AQ10_ANSWERS: AnswerOption[] = [
  { score: 1, text: "Concordo plenamente (1 pt)" },
  { score: 1, text: "Concordo parcialmente (1 pt)" },
  { score: 0, text: "Discordo parcialmente (0 pts)" },
  { score: 0, text: "Discordo plenamente (0 pts)" }
];

export function interpretAQ10(score: number): InterpretationResult {
  if (score >= 6) {
    return {
      title: "Rastreio Positivo para Espectro Autista (NICE Guideline)",
      className: "bg-indigo-50 text-indigo-900 border-indigo-200 font-bold",
      description: `Escore de ${score}/10 (linha de corte >= 6 recomendada pelo NICE). O perfil de respostas sugere traços autistas significativos na reciprocidade socioemocional e processamento de informações. Recomendada avaliação diagnóstica neuropsicológica aprofundada de TEA em adultos.`
    };
  } else {
    return {
      title: "Rastreio Negativo para Traços Autistas Significativos",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: `Escore de ${score}/10 (abaixo do corte de 6). Não preenche critérios de encaminhamento prioritário para diagnóstico de TEA.`
    };
  }
}

// ----------------------------------------------------
// 14. SNAP-IV (TDAH e Transtorno Opositor Desafiador - TOD em Crianças e Jovens)
// ----------------------------------------------------
export const SNAPIV_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Não consegue prestar muita atenção a detalhes ou comete erros por descuido nos trabalhos escolares", dimension: "desatencao" },
  { id: 2, text: "Tem dificuldade para manter a atenção em tarefas ou atividades de lazer", dimension: "desatencao" },
  { id: 3, text: "Parece não escutar quando se fala diretamente com ele(a)", dimension: "desatencao" },
  { id: 4, text: "Não segue instruções até o fim e não consegue terminar os trabalhos escolares ou tarefas de casa", dimension: "desatencao" },
  { id: 5, text: "Tem dificuldade para organizar tarefas e atividades", dimension: "desatencao" },
  { id: 6, text: "Evita, não gosta ou reluta em envolver-se em tarefas que exijam esforço mental constante", dimension: "desatencao" },
  { id: 7, text: "Perde coisas necessárias para tarefas ou atividades (brinquedos, cadernos, lápis)", dimension: "desatencao" },
  { id: 8, text: "É facilmente distraído(a) por estímulos externos", dimension: "desatencao" },
  { id: 9, text: "É esquecido(a) em relação a atividades cotidianas", dimension: "desatencao" },
  { id: 10, text: "Mexe com as mãos ou os pés ou se remexe na cadeira", dimension: "hiperatividade" },
  { id: 11, text: "Levanta-se da cadeira na sala de aula ou em outras situações em que se espera que fique sentado(a)", dimension: "hiperatividade" },
  { id: 12, text: "Corre ou sobe nas coisas em situações em que isso é inapropriado", dimension: "hiperatividade" },
  { id: 13, text: "Tem dificuldade para brincar ou envolver-se silenciosamente em atividades de lazer", dimension: "hiperatividade" },
  { id: 14, text: "Não para ou frequentemente age como se estivesse 'a todo vapor'", dimension: "hiperatividade" },
  { id: 15, text: "Fala em excesso", dimension: "hiperatividade" },
  { id: 16, text: "Dá respostas precipitadas antes de as perguntas terem sido concluídas", dimension: "hiperatividade" },
  { id: 17, text: "Tem dificuldade para esperar a sua vez", dimension: "hiperatividade" },
  { id: 18, text: "Interrompe ou se intromete em conversas ou jogos dos outros", dimension: "hiperatividade" }
];

export const SNAPIV_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nem um pouco (0)" },
  { score: 1, text: "Só um pouco (1)" },
  { score: 2, text: "Bastante (2)" },
  { score: 3, text: "Demais (3)" }
];

export function interpretSNAPIV(desatScore: number, hiperScore: number): InterpretationResult {
  const desatAvg = desatScore / 9;
  const hiperAvg = hiperScore / 9;
  const isDesatPositive = desatAvg >= 1.78;
  const isHiperPositive = hiperAvg >= 1.78;

  let subtype = "Sem indicação clínica significativa de TDAH";
  let badge = "bg-emerald-50 text-emerald-800 border-emerald-200";

  if (isDesatPositive && isHiperPositive) {
    subtype = "Rastreio Positivo para TDAH - Tipo Combinado (Desatento e Hiperativo/Impulsivo)";
    badge = "bg-red-50 text-red-850 border-red-200";
  } else if (isDesatPositive) {
    subtype = "Rastreio Positivo para TDAH - Predomínio Desatento";
    badge = "bg-orange-50 text-orange-850 border-orange-200";
  } else if (isHiperPositive) {
    subtype = "Rastreio Positivo para TDAH - Predomínio Hiperativo/Impulsivo";
    badge = "bg-orange-50 text-orange-850 border-orange-200";
  }

  return {
    title: subtype,
    className: badge,
    description: `Média de Desatenção: ${desatAvg.toFixed(2)}/3.0 (corte >= 1.78) • Média de Hiperatividade/Impulsividade: ${hiperAvg.toFixed(2)}/3.0 (corte >= 1.78). Coleta com pais ou professores de grande valor para o diagnóstico diferencial.`
  };
}

// ----------------------------------------------------
// 15. MBI-Screening (Escala de Avaliação de Burnout e Esgotamento)
// ----------------------------------------------------
export const MBI_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Sinto-me emocionalmente esgotado(a) com meu trabalho", dimension: "exaustao" },
  { id: 2, text: "Sinto-me cansado(a) e sem energia logo ao acordar para enfrentar mais um dia de trabalho", dimension: "exaustao" },
  { id: 3, text: "Trabalhar o dia todo com pessoas me exige um esforço mental desmedido", dimension: "exaustao" },
  { id: 4, text: "Sinto que estou no limite das minhas forças por causa do trabalho", dimension: "exaustao" },
  { id: 5, text: "Tenho me tornado mais insensível e frio(a) em relação às pessoas que atendo/com quem trabalho", dimension: "despersonalizacao" },
  { id: 6, text: "Preocupo-me com o fato de este trabalho estar me tornando emocionalmente endurecido(a)", dimension: "despersonalizacao" },
  { id: 7, text: "Sinto que trato alguns colegas/clientes de forma impessoal, como se fossem objetos", dimension: "despersonalizacao" },
  { id: 8, text: "Consigo resolver com eficácia os problemas do meu trabalho", dimension: "realizacao" },
  { id: 9, text: "Sinto que estou tendo uma influência positiva na vida de outras pessoas através do meu trabalho", dimension: "realizacao" },
  { id: 10, text: "Consigo criar um ambiente relaxado e produtivo no meu trabalho", dimension: "realizacao" }
];

export const MBI_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Nunca (0)" },
  { score: 1, text: "Raramente / Poucas vezes ao ano (1)" },
  { score: 2, text: "Às vezes / Mensalmente (2)" },
  { score: 3, text: "Frequentemente / Semanalmente (3)" },
  { score: 4, text: "Diariamente (4)" }
];

export function interpretMBI(exhaustionScore: number, depersonalizationScore: number): InterpretationResult {
  const isHighExhaustion = exhaustionScore >= 12; // max 16
  const isHighDepersonalization = depersonalizationScore >= 7; // max 12

  if (isHighExhaustion && isHighDepersonalization) {
    return {
      title: "Rastreio Alto para Síndrome de Burnout (Esgotamento Crônico)",
      className: "bg-red-50 text-red-850 border-red-200 font-bold",
      description: `Exaustão Emocional Alta (${exhaustionScore}/16) e Despersonalização/Cinismo Elevado (${depersonalizationScore}/12). Compatível com Síndrome de Burnout (CID-11: QD85). Indicado afastamento/reestruturação laboral e suporte psicoterápico imediato.`
    };
  } else if (isHighExhaustion) {
    return {
      title: "Alerta de Sobrecarga / Fase de Exaustão Laboral",
      className: "bg-orange-50 text-orange-850 border-orange-200",
      description: `Exaustão Emocional Alta (${exhaustionScore}/16). Risco iminente de evolução para Burnout severo se não houver manejo de estressores e pausas reparadoras.`
    };
  } else {
    return {
      title: "Níveis de Estresse Laboral em Faixa Controlada",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: `Exaustão (${exhaustionScore}/16) e Despersonalização (${depersonalizationScore}/12) dentro dos limites de resiliência esperados.`
    };
  }
}

// ----------------------------------------------------
// 16. C-SSRS (Escala Columbia de Triagem de Risco de Suicídio e Segurança)
// ----------------------------------------------------
export const CSSRS_QUESTIONS: QuestionItem[] = [
  { id: 1, text: "Desejo de estar morto(a): Você já desejou estar morto(a) ou desejou poder dormir e não acordar mais?", desc: "Ideação passiva" },
  { id: 2, text: "Pensamentos suicidas não específicos: Você já teve pensamentos de se matar, mesmo sem pensar em como faria isso?", desc: "Ideação ativa sem plano" },
  { id: 3, text: "Pensamentos com método (sem intenção específica): Você já pensou em como poderia fazer isso (ex: remédios, altura), mesmo sem intenção de agir?", desc: "Método cognitivo" },
  { id: 4, text: "Intenção suicida (sem plano específico): Você já teve esses pensamentos e teve alguma intenção de agir com base neles?", desc: "Intenção de agir" },
  { id: 5, text: "Intenção suicida com plano específico: Você já planejou os detalhes e teve a intenção de executar o plano?", desc: "Plano estruturado com intenção" },
  { id: 6, text: "Comportamento ou atos preparatórios: Você já fez algo para se preparar para se matar (reunir pílulas, escrever cartas, doar pertences) ou já tentou se matar?", desc: "Tentativa / Preparação" }
];

export const CSSRS_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Não (0)" },
  { score: 1, text: "Sim (1)" }
];

export function interpretCSSRS(answers: Record<number, number>): InterpretationResult {
  const hasPlanOrIntent = answers[4] === 1 || answers[5] === 1 || answers[6] === 1;
  const hasMethodOnly = answers[3] === 1;
  const hasPassiveOnly = answers[1] === 1 || answers[2] === 1;

  if (hasPlanOrIntent) {
    return {
      title: "🚨 RISCO ALTO IMINENTE DE SUICÍDIO",
      className: "bg-red-100 text-red-950 border-2 border-red-500 font-black",
      description: "Presença de intenção ativa, plano detalhado ou atos preparatórios recentes. CONDUTA IMEDIATA: Não deixar o paciente sozinho, acionar rede de apoio e familiares, elaborar Plano de Segurança por escrito e encaminhar para avaliação psiquiátrica / emergência médica de saúde mental."
    };
  } else if (hasMethodOnly) {
    return {
      title: "⚠️ RISCO MODERADO DE SUICÍDIO",
      className: "bg-orange-50 text-orange-900 border-2 border-orange-300 font-bold",
      description: "Ideação ativa com consideração de métodos. CONDUTA: Restrição de acesso a meios letais, pactuação de atendimento frequente, contato com familiar de confiança e elaboração de plano de segurança."
    };
  } else if (hasPassiveOnly) {
    return {
      title: "🟡 RISCO BAIXO / IDEAÇÃO PASSIVA",
      className: "bg-amber-50 text-amber-900 border border-amber-300",
      description: "Desejo de fuga ou ideação de morte passiva sem plano nem intenção. CONDUTA: Psicoterapia focada em esperança e resolução de problemas, monitoramento contínuo da dor psicológica."
    };
  } else {
    return {
      title: "🟢 RISCO MÍNIMO / AUSÊNCIA DE IDEAÇÃO ATUAL",
      className: "bg-emerald-50 text-emerald-800 border border-emerald-200",
      description: "Nega ideação de morte, planos ou histórico preparatório recente."
    };
  }
}

// ----------------------------------------------------
// 17. BDI-II & BAI (Beck Inventories)
// ----------------------------------------------------
export const BDIII_ANSWERS: AnswerOption[] = [
  { score: 0, text: "0 - Ausente / Não sinto isso" },
  { score: 1, text: "1 - Leve / Sinto um pouco" },
  { score: 2, text: "2 - Moderado / Sinto com frequência" },
  { score: 3, text: "3 - Grave / Sinto intensamente" }
];

export const BAI_ANSWERS: AnswerOption[] = [
  { score: 0, text: "0 - Absolutamente não" },
  { score: 1, text: "1 - Levemente (pouco incômodo)" },
  { score: 2, text: "2 - Moderadamente (muito desagradável)" },
  { score: 3, text: "3 - Gravemente (quase insuportável)" }
];

export const BDIII_QUESTIONS = [
  { id: 1, text: "Tristeza", desc: "Sentir-se triste, melancólico ou deprimido." },
  { id: 2, text: "Pessimismo", desc: "Perspectivas negativas sobre o próprio futuro." },
  { id: 3, text: "Sentimento de Fracasso", desc: "Sensação ou recordação excessiva de fracassos." },
  { id: 4, text: "Perda de Prazer", desc: "Anedonia ou diminuição da capacidade de sentir satisfação." },
  { id: 5, text: "Sentimento de Culpa", desc: "Sentir-se culpado ou autoacusação constante." },
  { id: 6, text: "Sentimento de Punição", desc: "Sensação de que está sendo punido ou merece punição." },
  { id: 7, text: "Autodepreciação", desc: "Sentimento de insatisfação ou aversão por si mesmo." },
  { id: 8, text: "Autocrítica", desc: "Culpabilidade exacerbada por fraquezas ou defeitos." },
  { id: 9, text: "Pensamentos Suicidas", desc: "Ideação suicida de leve a grave." },
  { id: 10, text: "Choro", desc: "Chorar mais do que o habitual ou incapacidade de chorar." },
  { id: 11, text: "Agitação", desc: "Sentir-se inquieto, tenso ou sem paciência física." },
  { id: 12, text: "Perda de Interesse", desc: "Perda do interesse em outras pessoas ou atividades cotidianas." },
  { id: 13, text: "Indecisão", desc: "Dificuldade na tomada de decisões em relação ao comum." },
  { id: 14, text: "Desvalorização", desc: "Sentir-se sem valor, inútil ou incapaz." },
  { id: 15, text: "Falta de Energia", desc: "Diminuição das forças para realizar qualquer tarefa." },
  { id: 16, text: "Alterações no Sono", desc: "Insônia inicial, intermediária, terminal ou hipersonia." },
  { id: 17, text: "Irritabilidade", desc: "Ficar impaciente ou irritado muito mais facilmente." },
  { id: 18, text: "Alterações no Apetite", desc: "Desejo acentuado por comer ou perda de apetite." },
  { id: 19, text: "Dificuldade de Concentração", desc: "Problemas recorrentes de foco ou sustentação cognitiva." },
  { id: 20, text: "Cansaço ou Fadiga", desc: "Exaustão física extrema em tarefas simples." },
  { id: 21, text: "Perda de Interesse por Sexo", desc: "Diminuição do interesse ou da libido habitual." }
];

export function interpretBDIII(score: number): InterpretationResult {
  if (score <= 13) {
    return { title: "Depressão Mínima", className: "bg-emerald-50 text-emerald-800 border-emerald-150", description: "Indica ausência de sintomatologia depressiva clinicamente significativa neste momento." };
  } else if (score <= 19) {
    return { title: "Depressão Leve", className: "bg-amber-50 text-amber-800 border-amber-150", description: "Presença de sintomas leves de depressão. Recomenda-se acompanhamento e reavaliação periódica." };
  } else if (score <= 28) {
    return { title: "Depressão Moderada", className: "bg-orange-50 text-orange-850 border-orange-150", description: "Sinais claros de sintomatologia moderada. Fortemente recomendado direcionamento clínico sistemático." };
  } else {
    return { title: "Depressão Grave", className: "bg-red-50 text-red-800 border-red-150 font-bold", description: "Pontuação indicativa de sofrimento severo. Requer atenção profissional imediata e possível avaliação psiquiátrica em conjunto." };
  }
}

export const BAI_QUESTIONS = [
  { id: 1, text: "Dormência ou Formigamento", desc: "Formigamento nos membros ou áreas periféricas." },
  { id: 2, text: "Sensação de Calor", desc: "Fogachos de calor repentino ou calor sem causa ambiental." },
  { id: 3, text: "Tremor nas Pernas", desc: "Insegurança motora, flacidez ou tremores nas pernas." },
  { id: 4, text: "Incapacidade de Relaxar", desc: "Sobrecarga física, incapacidade de encontrar repouso." },
  { id: 5, text: "Medo de que Aconteça o Pior", desc: "Pensamentos catastróficos ou expectativa pessimista severa." },
  { id: 6, text: "Atordoamento ou Tontura", desc: "Vertigem, tontura leve ou sensação de tontura geral." },
  { id: 7, text: "Palpitação ou Aceleração do Coração", desc: "Taquicardia ou batimentos cardíacos perceptíveis." },
  { id: 8, text: "Instabilidade", desc: "Desequilíbrio físico, sensação de andar em barcaça." },
  { id: 9, text: "Sensação de Pavor", desc: "Sensação aguda de perigo iminente ou desamparo." },
  { id: 10, text: "Nervosismo", desc: "Estado de inquietação mental ou apreensão constante." },
  { id: 11, text: "Sensação de Sufocação", desc: "Aperto na garganta ou dificuldade em engolir de fundo ansioso." },
  { id: 12, text: "Tremores nas Mãos", desc: "Tremores finos nas extremidades superiores." },
  { id: 13, text: "Tremores Gerais", desc: "Sensação interna ou externa de tremor ou agitação." },
  { id: 14, text: "Medo de Perder o Controle", desc: "Sensação de que as reações físicas vão transbordar." },
  { id: 15, text: "Dificuldade de Respirar", desc: "Dispneia psicogênica, respiração curta ou ofegante." },
  { id: 16, text: "Medo de Morrer", desc: "Ideação sobre morte súbita ou colapso autonômico." },
  { id: 17, text: "Assustado(a)", desc: "Sensibilidade extrema a estímulos repentinos (barulhos, toques)." },
  { id: 18, text: "Indigestão ou Desconforto Abdominal", desc: "Náusea, queimação gástrica, flatulência gástrica." },
  { id: 19, text: "Sensação de Desmaio", desc: "Lipotimia, escurecimento visual temporário decorrente de estresse." },
  { id: 20, text: "Rosto Vermelho/Quente", desc: "Rúbis facial de calor somático." },
  { id: 21, text: "Suor frio/quente", desc: "Hiperidrose palmar ou suores sem esforço físico." }
];

export function interpretBAI(score: number): InterpretationResult {
  if (score <= 7) {
    return { title: "Ansiedade Mínima", className: "bg-emerald-50 text-emerald-800 border-emerald-150", description: "Nível fisiológico e reativo saudável de ansiedade basal cotidiana." };
  } else if (score <= 15) {
    return { title: "Ansiedade Leve", className: "bg-amber-50 text-amber-800 border-amber-150", description: "Presença leve de estressores somáticos e de excitação de ansiedade." };
  } else if (score <= 25) {
    return { title: "Ansiedade Moderada", className: "bg-orange-50 text-orange-850 border-orange-150", description: "Manifestações somáticas desagradáveis persistentes. Indica sofrimento clínico relevante." };
  } else {
    return { title: "Ansiedade Grave", className: "bg-red-50 text-red-800 border-red-150 font-bold", description: "Nível de ansiedade crônico severo (pânico ou hiperpontuação autonômica). Necessita controle terapêutico estrito e avaliação médica." };
  }
}

// ----------------------------------------------------
// 18. MOM (A Mente Vencendo o Humor: D, A, R, P)
// ----------------------------------------------------
export const MOM_ANSWERS: AnswerOption[] = [
  { score: 0, text: "Não / De modo algum (0-1 dia)" },
  { score: 1, text: "Um pouco / Alguns dias (2-3 dias)" },
  { score: 2, text: "Moderadamente / Muitos dias (4-5 dias)" },
  { score: 3, text: "Muito / Quase todos os dias (6-7 dias)" }
];

export interface MOMQuestionItem {
  id: number;
  text: string;
  desc: string;
}

export const MOM_D_QUESTIONS: MOMQuestionItem[] = [
  { id: 1, text: "Tristeza ou sentimento de melancolia", desc: "Sentir-se triste, deprimido ou desanimado por períodos significativos." },
  { id: 2, text: "Falta de interesse em suas coisas ou pessoas", desc: "Falta de vontade ou interesse em atividades usuais, amigos ou família." },
  { id: 3, text: "Dificuldade em sentir prazer em coisas que gostava", desc: "Anedonia ou perda de satisfação em atividades anteriormente agradáveis." },
  { id: 4, text: "Sentimento de cansaço constante ou falta de energia", desc: "Sentir-se sem forças ou exausto com facilidade." },
  { id: 5, text: "Pensamentos de que as coisas são difíceis demais ou insolúveis", desc: "Desespero frente aos contratempos diários, vendo tudo como obstáculo intransponível." },
  { id: 6, text: "Sentimento de inutilidade, incompetência ou fracasso", desc: "Sensação excessiva de inadequação pessoal em relação aos outros." },
  { id: 7, text: "Baixa autoestima ou autocrítica exagerada", desc: "Avaliação negativa constante sobre si ou culpabilização severa." },
  { id: 8, text: "Sensação de estar sem esperanças quanto ao futuro", desc: "Visão pessimista generalizada sobre a própria vida e planos futuros." },
  { id: 9, text: "Dificuldade para se concentrar, ler ou tomar decisões simples", desc: "Indecisão ou dispersão mental frequente." },
  { id: 10, text: "Irritabilidade aumentada, raiva ou impaciência boba", desc: "Fácil perturbação emocional decorrente de pequenos incidentes." },
  { id: 11, text: "Alterações visíveis no seu padrão regular de sono", desc: "Insônia inicial, intermediária, excesso de sono ou cansaço ao despertar." },
  { id: 12, text: "Alterações incomuns no apetite ou no peso", desc: "Comer excessivamente por ansiedade ou perda total de interesse por comida." },
  { id: 13, text: "Choro fácil ou crises de choro sem motivo claro", desc: "Hipersensibilidade ou reatividades emocionais agudas." },
  { id: 14, text: "Desejo de se isolar de amigos ou familiares", desc: "Tendência a esquivar-se de contatos e compromissos sociais." },
  { id: 15, text: "Pensamentos de morte, de que não vale a pena viver ou ideações de autoflagelo", desc: "Presença de ideação depressiva terminal ou fantasias de fuga da realidade." }
];

export const MOM_A_QUESTIONS: MOMQuestionItem[] = [
  { id: 1, text: "Sentir-se tenso(a), nervoso(a) ou sob constante pressão", desc: "Estado de alerta constante, incapacidade de baixar a guarda emocional." },
  { id: 2, text: "Preocupações excessivas sobre múltiplos assuntos do cotidiano", desc: "Pensamentos apreensivos difíceis de controlar ou interromper." },
  { id: 3, text: "Sensação de apreensão ou pressentimento de que algo terrível vai ocorrer", desc: "Expectativa catastrófica sobre o futuro próximo." },
  { id: 4, text: "Aceleração do coração ou palpitações repentinas", desc: "Sintomatologia cardíaca psicogênica sem fator físico evidente." },
  { id: 5, text: "Dificuldade para respirar de forma calma", desc: "Respiração acelerada, curta ou sensação leve de opressão pulmonar." },
  { id: 6, text: "Tremores nas mãos ou pernas bambas", desc: "Insegurança musculoesquelética ou tremores decorrentes de estresse." },
  { id: 7, text: "Tonturas, sensação de flutuação ou atordoamento mental", desc: "Sensação de desequilíbrio e instabilidade corporal." },
  { id: 8, text: "Suor excessivo nas extremidades ou sensação de calafrio/calor", desc: "Expressão autonômica de ansiedade severa." },
  { id: 9, text: "Tensão muscular acentuada ou dores pelo pescoço/costas", desc: "Rigidez corporal crônica de fundo tensional." },
  { id: 10, text: "Dificuldade crônica para relaxar ou inquietação psicomotora", desc: "Sentir necessidade de se mover regularmente ou inquietação interna." },
  { id: 11, text: "Sentir a boca seca ou dificuldade leve para engolir", desc: "Alteração de secreções glandulares por ativação simpática." },
  { id: 12, text: "Desconforto digestivo, queimação, gases ou cólicas", desc: "Sintomatologia gastrointestinal desencadeada por processos ansiosos." },
  { id: 13, text: "Sensação súbita de ondas de calor ou arrepios frios", desc: "Instabilidade térmica autonômica." },
  { id: 14, text: "Medo irracional de perder o controle das próprias ações ou de enlouquecer", desc: "Medo extremo de colapso cognitivo ou emocional." },
  { id: 15, text: "Comportamento de evitar situações tensas ou lugares de grande circulação", desc: "Fobia social secundária ou evitação fóbica protetiva." }
];

export const MOM_R_QUESTIONS: MOMQuestionItem[] = [
  { id: 1, text: "Sentir-se ranzinza, irritado(a) ou impaciente no convívio diário", desc: "Disforia ácida, tolerância reduzida com as falhas normais dos outros." },
  { id: 2, text: "Ficar com muita raiva facilmente por contratempos ou atrasos pequenos", desc: "Reação destemperada a frustrações menores comuns." },
  { id: 3, text: "Sentir-se provocado(a) ou tratado(a) de forma deliberadamente injusta por outros", desc: "Interpretação ríspida das ações de terceiros." },
  { id: 4, text: "Impulso de falar alto, gritar, bater portas ou arremessar objetos", desc: "Urgência expressiva de vazamento agressivo de tensão." },
  { id: 5, text: "Dificuldade grave para conter as reações agressivas imediatas", desc: "Seletividade fraca de contenção imediata sob ativação colérica." },
  { id: 6, text: "Pensamentos de hostilidade ou desejo latente de vingança contra algo ou alguém", desc: "Ideações de revide, ressentimentos ativos armazenados." },
  { id: 7, text: "Tensão física severa integrada à raiva (unhas cerradas, mandíbula rígida)", desc: "Aparato físico corporal armado para defesa violenta." },
  { id: 8, text: "Sentir que o sangue ferve ou ondas súbitas de calor tensional de raiva", desc: "Flutuação vascular de raiva extrema." },
  { id: 9, text: "Comunicação ácida, uso frequente de termos sarcásticos ou hostilidade direta", desc: "Poluição expressiva verbal dirigida aos demais." },
  { id: 10, text: "Dificuldade duradoura para perdoar e facilidade para alimentar rancores", desc: "Incapacidade de demover a fixação ressentida." },
  { id: 11, text: "Explosões repentinas de ira desproporcionais ao evento desencadeador", desc: "Surtos agudos de irritabilidade sem proporcionalidade adaptativa." },
  { id: 12, text: "Sensação constante de estar cercado por pessoas incompetentes ou ignorantes", desc: "Projeção de exigências tirânicas na comunidade circundante." },
  { id: 13, text: "Grave descontentamento no trânsito, filas comerciais ou serviços", desc: "Falta de maleabilidade na interação logística social." },
  { id: 14, text: "Culpar os outros de forma obcecada por erros cometidos por si mesmo", desc: "Esquiva intencional da autorresponsabilidade adaptativa." },
  { id: 15, text: "Sentimento estrutural de amargura ou ressentimento crônico com a vida", desc: "Perspectiva hostil enraizada de mundo e injustiça basal." }
];

export const MOM_P_QUESTIONS: MOMQuestionItem[] = [
  { id: 1, text: "Surtos repentinos de medo avassalador ou pavor desarmador", desc: "Acometimento abrupto de horror profundo sem causa evidente imediata." },
  { id: 2, text: "Dificuldade respiratória severa, sufocação psicogênica ou engasgo", desc: "Pânico respiratório de hiperpneia tensional." },
  { id: 3, text: "Sensação física de dor, fisgadas ou aperto severo no peito", desc: "Angústia precordial de fundo psicogênico, simulando problemas coronários." },
  { id: 4, text: "Palpitação cardíaca violentíssima ou taquicardia desordenada", desc: "Batimentos irregulares perceptíveis de alta ansiedade aguda." },
  { id: 5, text: "Tontura paralisante, fraqueza severa, instabilidade nos passos ou pernas trêmulas", desc: "Risco subjetivo iminente de desmaio físico." },
  { id: 6, text: "Tremores macroscópicos do corpo ou abalos musculares involuntários", desc: "Sintomatologia motora de descargas adrenalínicas massivas." },
  { id: 7, text: "Sudorese intensa, calafrios recorrentes ou flutuações de calor corporal", desc: "Termorregulação corporal abalada pela desautonomia aguda." },
  { id: 8, text: "Sensação de que as coisas ao redor parecem irreais ou de estar fora do próprio corpo", desc: "Episódios dissociativos agudos de desrealização ou despersonalização." },
  { id: 9, text: "Medo avassalador e imediato de morrer no transcurso da crise", desc: "Ideação imediata de fim vital iminente." },
  { id: 10, text: "Medo extremo de perder totalmente a sanidade ou de agir bizarramente", desc: "Ansiedade metacognitiva de perda de autogestão mental." },
  { id: 11, text: "Sentimento de desamparo claustrofóbico ou necessidade obsessiva de fugir", desc: "Impulso urgente por rotas físicas imediatas de escape." },
  { id: 12, text: "Parestesias agudas como formigamentos nos braços, pernas ou lábios", desc: "Destaque sensitivo autonômico somático." },
  { id: 13, text: "Náusea acentuada, contração do estômago ou diarreia aguda reflexa", desc: "Invasão vagal de ativação emocional." },
  { id: 14, text: "Preocupação tensional constante com o surgimento de novos ataques de pânico", desc: "Ansiedade antecipatória crônica do medo (medo de ter medo)." },
  { id: 15, text: "Esquiva deliberada de locais fechados, transportes ou espaços públicos por medo de crises", desc: "Desenvolvimento de comportamento agorafóbico adaptativo disfuncional." }
];

export function interpretMOMDepression(score: number): InterpretationResult {
  if (score <= 9) {
    return { title: "Depressão Mínima / Ausente", className: "bg-emerald-50 text-emerald-800 border-emerald-150", description: "Flutuação normal ou saudável do humor. Sem sintomatologia depressiva significativa recente." };
  } else if (score <= 19) {
    return { title: "Depressão Leve", className: "bg-amber-50 text-amber-800 border-amber-150", description: "Indícios de sintomas depressivos leves. Indicativo de acompanhamento preventivo regular." };
  } else if (score <= 29) {
    return { title: "Depressão Moderada", className: "bg-orange-50 text-orange-850 border-orange-150", description: "Sinais de sofrimento depressivo moderado com impacto nas atividades. Recomendado tratamento clínico sistemático." };
  } else {
    return { title: "Depressão Grave", className: "bg-red-50 text-red-800 border-red-150 font-bold", description: "Invasão de sintomas severos e desorganizadores. Recomenda-se acompanhamento psicoterápico estrito e intervenção psiquiátrica concomitante." };
  }
}

export function interpretMOMAnxiety(score: number): InterpretationResult {
  if (score <= 9) {
    return { title: "Ansiedade Mínima / Ausente", className: "bg-emerald-50 text-emerald-800 border-emerald-150", description: "Nível fisiológico habitual e basal saudável de reatividade nervosa." };
  } else if (score <= 19) {
    return { title: "Ansiedade Leve", className: "bg-amber-50 text-amber-800 border-amber-150", description: "Flutuações leves de ansiedade. Recomenda-se psicoeducação e manejo de estresse em terapia." };
  } else if (score <= 29) {
    return { title: "Ansiedade Moderada", className: "bg-orange-50 text-orange-850 border-orange-150", description: "Sintomatologia ansiosa interferindo nas atividades rotineiras. Recomendável focalização cognitiva terapêutica." };
  } else {
    return { title: "Ansiedade Grave", className: "bg-red-50 text-red-800 border-red-150 font-bold", description: "Nível severo de ansiedade e hiperatividade autonômica. Exige intervenção clínica cuidadosa e contínua." };
  }
}

export function interpretMOMAnger(score: number): InterpretationResult {
  if (score <= 9) {
    return { title: "Controle de Raiva Adequado", className: "bg-emerald-50 text-emerald-800 border-emerald-150", description: "Reatividade emocional saudável e boa regulação interna frente a contrariedades de rotina." };
  } else if (score <= 19) {
    return { title: "Raiva / Irritabilidade Leve", className: "bg-amber-50 text-amber-800 border-amber-150", description: "Tolerância à frustração levemente diminuída. Indicada abordagem de reatividades comportamentais." };
  } else if (score <= 29) {
    return { title: "Raiva / Irritabilidade Moderada", className: "bg-orange-50 text-orange-850 border-orange-150", description: "Impulsividade e hostilidade frequentes. Recomendado treino de assertividade e reestruturação de crenças de tirania." };
  } else {
    return { title: "Raiva / Descontrole Severo", className: "bg-red-50 text-red-800 border-red-150 font-bold", description: "Dificuldade expressiva e sofrimento nas interações interpessoais pelo descontrole da raiva. Exige atenção psicoterápica regular focada em regulação emocional." };
  }
}

export function interpretMOMPanic(score: number): InterpretationResult {
  if (score <= 9) {
    return { title: "Pânico Mínimo / Inexistente", className: "bg-emerald-50 text-emerald-800 border-emerald-150", description: "Sem episódios somáticos agudos de pavor e hiper-reatividade adrenérgica recente." };
  } else if (score <= 19) {
    return { title: "Reações de Pânico Leves", className: "bg-amber-50 text-amber-800 border-amber-150", description: "Sinais agudos esporádicos sob gatilhos de estresse. Recomendado treino respiratório e dessensibilização preventiva." };
  } else if (score <= 29) {
    return { title: "Sintomas de Pânico Moderados", className: "bg-orange-50 text-orange-850 border-orange-150", description: "Ataques de pânico ocorrendo com regularidade ou forte ansiedade antecipatória. Indicação de intervenção cognitiva focada." };
  } else {
    return { title: "Crises de Pânico Graves", className: "bg-red-50 text-red-800 border-red-150 font-bold", description: "Crises severas recorrentes acompanhadas de agorafobia e severo prejuízo funcional. Recomenda-se tratamento interdisciplinar sistemático." };
  }
}
