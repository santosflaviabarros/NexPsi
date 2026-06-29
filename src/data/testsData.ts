export interface QuestionItem {
  id: number;
  text: string;
  dimension: 'depressao' | 'ansiedade' | 'estresse' | 'desatencao' | 'hiperatividade';
}

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

export const EADS21_ANSWERS = [
  { score: 0, text: "Não se aplicou de maneira alguma a mim" },
  { score: 1, text: "Aplicou-se a mim em algum grau (por pouco tempo)" },
  { score: 2, text: "Aplicou-se a mim num grau considerável (muito tempo)" },
  { score: 3, text: "Aplicou-se a mim muito de perto (na maior parte do tempo)" }
];

export const ASRS18_QUESTIONS: QuestionItem[] = [
  // Parte A (1 a 6) - Triagem Crítica
  { id: 1, text: "Com que frequência tem dificuldade para finalizar os detalhes de um projeto após ter feito a parte difícil?", dimension: 'desatencao' },
  { id: 2, text: "Com que frequência tem dificuldade para colocar as coisas em ordem quando organiza uma tarefa complexa?", dimension: 'desatencao' },
  { id: 3, text: "Com que frequência tem dificuldade para se lembrar de compromissos, reuniões ou obrigações?", dimension: 'desatencao' },
  { id: 4, text: "Quando tem uma tarefa que exige muito esforço mental, evitas ou adias o início da mesma?", dimension: 'desatencao' },
  { id: 5, text: "Com que frequência mexe as mãos, os pés, ou se contorce na cadeira quando precisa sentar por muito tempo?", dimension: 'hiperatividade' },
  { id: 6, text: "Com que frequência sente-se ativo demais, inquieto(a), como se estivesse com o 'motor ligado'?", dimension: 'hiperatividade' },
  // Parte B (7 a 18)
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

export const ASRS18_ANSWERS = [
  { score: 0, text: "Nunca" },
  { score: 1, text: "Raramente" },
  { score: 2, text: "Às vezes" },
  { score: 3, text: "Frequentemente" },
  { score: 4, text: "Muito Frequentemente" }
];

export interface InterpretationResult {
  title: string;
  className: string;
  description: string;
}

export function interpretBDIII(score: number): InterpretationResult {
  if (score <= 13) {
    return { title: "Depressão Mínima", className: "bg-emerald-50 text-emerald-800 border-emerald-150", description: "Indica ausência de sintomatologia depressiva clinicamente significativa neste momento." };
  } else if (score <= 19) {
    return { title: "Depressão Leve", className: "bg-amber-50 text-amber-800 border-amber-150", description: "Presença de sintomas leves de depressão. Recomenda-se acompanhamento e reavaliação periódica." };
  } else if (score <= 28) {
    return { title: "Depressão Moderada", className: "bg-orange-50 text-orange-850 border-orange-150", description: "Sinais claros de sintomatologia moderada. Fortemente recomendado direcionamento clínico sistemático." };
  } else {
    return { title: "Depressão Grave", className: "bg-red-50 text-red-800 border-red-150", description: "Pontuação indicativa de sofrimento severo. Requer atenção profissional imediata e possível avaliação psiquiátrica em conjunto." };
  }
}

export function interpretBAI(score: number): InterpretationResult {
  if (score <= 7) {
    return { title: "Ansiedade Mínima", className: "bg-emerald-50 text-emerald-800 border-emerald-150", description: "Nível fisiológico e reativo saudável de ansiedade basal cotidiana." };
  } else if (score <= 15) {
    return { title: "Ansiedade Leve", className: "bg-amber-50 text-amber-800 border-amber-150", description: "Presença leve de estressores somáticos e de excitação de ansiedade." };
  } else if (score <= 25) {
    return { title: "Ansiedade Moderada", className: "bg-orange-50 text-orange-850 border-orange-150", description: "Manifestações somáticas desagradáveis persistentes. Indica sofrimento clínico relevante." };
  } else {
    return { title: "Ansiedade Grave", className: "bg-red-50 text-red-800 border-red-150", description: "Nível de ansiedade crônico severo (pânico ou hiperpontuação autonômica). Necessita controle terapêutico estrito e avaliação somatopsíquica." };
  }
}

export function interpretEADS21(dep: number, ans: number, est: number) {
  // Multiply by 2 for DASS-42 parity
  const dScore = dep * 2;
  const aScore = ans * 2;
  const sScore = est * 2;

  const getDepLabel = (s: number) => {
    if (s <= 9) return { label: "Normal", color: "text-emerald-700 bg-emerald-50" };
    if (s <= 13) return { label: "Leve", color: "text-amber-700 bg-amber-50" };
    if (s <= 20) return { label: "Moderado", color: "text-orange-700 bg-orange-50" };
    if (s <= 27) return { label: "Grave", color: "text-red-650 bg-red-50" };
    return { label: "Muito Grave", color: "text-red-800 bg-red-100" };
  };

  const getAnsLabel = (s: number) => {
    if (s <= 7) return { label: "Normal", color: "text-emerald-700 bg-emerald-50" };
    if (s <= 9) return { label: "Leve", color: "text-amber-700 bg-amber-50" };
    if (s <= 14) return { label: "Moderado", color: "text-orange-700 bg-orange-50" };
    if (s <= 19) return { label: "Grave", color: "text-red-650 bg-red-50" };
    return { label: "Muito Grave", color: "text-red-800 bg-red-100" };
  };

  const getEstLabel = (s: number) => {
    if (s <= 14) return { label: "Normal", color: "text-emerald-700 bg-emerald-50" };
    if (s <= 18) return { label: "Leve", color: "text-amber-700 bg-amber-50" };
    if (s <= 25) return { label: "Moderado", color: "text-orange-700 bg-orange-50" };
    if (s <= 33) return { label: "Grave", color: "text-red-650 bg-red-50" };
    return { label: "Muito Grave", color: "text-red-800 bg-red-100" };
  };

  return {
    dep: { score: dScore, ...getDepLabel(dScore) },
    ans: { score: aScore, ...getAnsLabel(aScore) },
    est: { score: sScore, ...getEstLabel(sScore) }
  };
}

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
  { id: 18, text: "Indigestão ou Desconforto Abdominal", desc: "Nausea, queimação gástrica, flatulência gástrica." },
  { id: 19, text: "Sensação de Desmaio", desc: "Lipotimia, escurecimento visual temporário decorrente de estresse." },
  { id: 20, text: "Rosto Vermelho/Quente", desc: "Rúbis facial de calor somático." },
  { id: 21, text: "Suor frio/quente", desc: "Hiperidrose palmar ou suores sem esforço físico." }
];

export const MOM_ANSWERS = [
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
  { id: 4, text: "Impulso de falar alto, gritar, bater portas ou arremessar objetos", desc: "Urgência expressiva de vazamento agressivo de tension." },
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
  { id: 5, text: "Tontura paralisante, fraqueza severa, instabilidade nos passos ou pernas trêmulas", desc: "Risco subjetivo eminente de desmaio físico." },
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
    return { title: "Depressão Grave", className: "bg-red-50 text-red-800 border-red-150", description: "Invasão de sintomas severos e desorganizadores. Recomenda-se acompanhamento psicoterápico estrito e intervenção psiquiátrica concomitante." };
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
    return { title: "Ansiedade Grave", className: "bg-red-50 text-red-800 border-red-150", description: "Nível severo de ansiedade e hiperatividade autonômica. Exige intervenção clínica cuidadosa e contínua." };
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
    return { title: "Raiva / Descontrole Severo", className: "bg-red-50 text-red-800 border-red-150", description: "Dificuldade expressiva e sofrimento nas interações interpessoais pelo descontrole da raiva. Exige atenção psicoterápica regular focada em regulação emocional." };
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
    return { title: "Crises de Pânico Graves", className: "bg-red-50 text-red-800 border-red-150", description: "Crises severas recorrentes acompanhadas de agorafobia e severo prejuízo funcional. Recomenda-se tratamento interdisciplinar sistemático." };
  }
}

