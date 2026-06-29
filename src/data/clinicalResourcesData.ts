export interface ClinicalResourceField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'slider';
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface ClinicalResource {
  id: string;
  title: string;
  type: 'Questionário' | 'Tarefa Terapêutica';
  demand: 'Ansiedade e Pânico' | 'Depressão e Desânimo' | 'TDAH e Procrastinação' | 'Estresse e Burnout' | 'Autoestima e Assertividade';
  description: string;
  instructions: string;
  fields: ClinicalResourceField[];
  defaultValues: Record<string, any>;
  exportFormat: (data: Record<string, any>, patientName: string) => string;
}

export const CLINICAL_DEMANDS = [
  'Ansiedade e Pânico',
  'Depressão e Desânimo',
  'TDAH e Procrastinação',
  'Estresse e Burnout',
  'Autoestima e Assertividade'
] as const;

export const CLINICAL_RESOURCES: ClinicalResource[] = [
  {
    id: 'rpd',
    title: 'Registro de Pensamentos Disfuncionais (RPD)',
    type: 'Questionário',
    demand: 'Depressão e Desânimo',
    description: 'Ferramenta clássica da TCC para reestruturação de distorções cognitivas e autocrítica.',
    instructions: 'Auxilie o paciente a preencher quando perceber oscilações abruptas de humor ou pensamentos depreciativos inconscientes.',
    fields: [
      { id: 'situacao', label: '1. Situação (Quem, o que, onde, quando?)', type: 'textarea', placeholder: 'Ex: Fui convidado para apresentar o projeto na reunião e travei na hora da explicação...' },
      { id: 'pensamento', label: '2. Pensamentos Automáticos (O que passou pela cabeça?)', type: 'textarea', placeholder: 'Ex: "Vão perceber que sou uma fraude", "Vou gaguejar e passar vergonha", "Ninguém liga para minhas ideias".' },
      { id: 'emocao', label: '3. Emoções/Reações (O que sentiu na hora? 0-10)', type: 'text', placeholder: 'Ex: Ansiedade extrema (9/10), Tristeza (8/10), Vergonha (10/10).' },
      { id: 'distorcao', label: '4. Distorção Cognitiva Identificada', type: 'select', options: [
        'Catastrofização (Esperar o pior cenário)',
        'Desqualificação do Positivo (Ignorar o que deu certo)',
        'Leitura de Mente (Achar que sabe o que os outros pensam)',
        'Pensamento Tudo-ou-Nada (Preto no branco / Extremos)',
        'Personalização (Achar que tudo é culpa sua)',
        'Raciocínio Emocional (Sentir algo e achar que é verdade absoluta)',
        'Rotulação (Colocar rótulos pesados em si ou nos outros)',
        'Supergeneralização (Achar que um erro define o futuro)'
      ]},
      { id: 'resposta_racional', label: '5. Resposta Alternativa Racional (Evidências contra e a favor)', type: 'textarea', placeholder: 'Ex: Eu dominei as telas do projeto e estudei. O nervosismo é comum e as pessoas prestam atenção no conteúdo, não no meu tremor. Já apresentei outras vezes e deu certo.' },
      { id: 'resultado', label: '6. Resultado (Como se sente agora? O que fará?)', type: 'textarea', placeholder: 'Ex: Vergonha reduziu para 4/10. Ansiedade reduziu para 3/10. Vou aceitar o convite e praticar a apresentação antes.' }
    ],
    defaultValues: { situacao: '', pensamento: '', emocao: '', distorcao: 'Catastrofização (Esperar o pior cenário)', resposta_racional: '', resultado: '' },
    exportFormat: (data, patientName) => `EXERCÍCIO CLÍNICO: REGISTRO DE PENSAMENTOS DISFUNCIONAIS (RPD)
Paciente: ${patientName}
--------------------------------------------------
1. SITUAÇÃO:
${data.situacao || '(Não preenchido)'}

2. PENSAMENTOS AUTOMÁTICOS:
${data.pensamento || '(Não preenchido)'}

3. EMOÇÕES ENVOLVIDAS:
${data.emocao || '(Não preenchido)'}

4. DISTORÇÃO COGNITIVA PREDOMINANTE:
${data.distorcao}

5. RESPOSTA ALTERNATIVA RACIONAL:
${data.resposta_racional || '(Não preenchido)'}

6. RESULTADOS E REAVALIAÇÃO DE HUMOR:
${data.resultado || '(Não preenchido)'}
--------------------------------------------------
NexPsi Digital • Terapia Baseada em Evidências`
  },
  {
    id: 'ativacao_comportamental',
    title: 'Cronograma Semanal de Ativação Comportamental',
    type: 'Tarefa Terapêutica',
    demand: 'Depressão e Desânimo',
    description: 'Combate o ciclo da inércia depressiva programando atividades pequenas de prazer e domínio.',
    instructions: 'Ajude o paciente a traçar um compromisso inegociável de realizar tarefas microscópicas, gerando dopamina ativa.',
    fields: [
      { id: 'prazer', label: 'Meta de Prazer (Ex: Ouvir um disco, cozinhar algo fácil, banho morno demorado)', type: 'text', placeholder: 'Escreva a atividade de prazer escolhida' },
      { id: 'dominio', label: 'Meta de Domínio: Realização (Ex: Organizar 1 gaveta, pagar 1 boleto, limpar a mesa)', type: 'text', placeholder: 'Escreva a atividade de realização' },
      { id: 'humor_segunda', label: 'Acompanhamento de Segunda-feira (Atividade + Humor de 0-10)', type: 'text', placeholder: 'Ex: Lavei a louça (Domínio) - Humor 5/10' },
      { id: 'humor_quarta', label: 'Acompanhamento de Quarta-feira (Atividade + Humor de 0-10)', type: 'text', placeholder: 'Ex: Caminhei 15 min (Prazer) - Humor 6/10' },
      { id: 'humor_sexta', label: 'Acompanhamento de Sexta-feira (Atividade + Humor de 0-10)', type: 'text', placeholder: 'Ex: Arrumei a cama (Domínio) - Humor 6/10' },
      { id: 'reflexao', label: 'Validação e Reflexão (Como quebrar a inércia ajudou no humor?)', type: 'textarea', placeholder: 'Percebi que começar a fazer é mais difícil do que continuar. Mesmo sem vontade inicial, o humor melhorou...' }
    ],
    defaultValues: { prazer: '', dominio: '', humor_segunda: '', humor_quarta: '', humor_sexta: '', reflexao: '' },
    exportFormat: (data, patientName) => `COMPROMISSO TERAPÊUTICO: ATIVAÇÃO COMPORTAMENTAL
Paciente: ${patientName}
--------------------------------------------------
ATIVIDADE DE PRAZER PACTUADA:
${data.prazer || '(Não definido)'}

ATIVIDADE DE DOMÍNIO PACTUADA:
${data.dominio || '(Não definido)'}

REGISTRO DE EXECUÇÃO E HUMOR:
- Segunda: ${data.humor_segunda || 'Sem registros'}
- Quarta:  ${data.humor_quarta || 'Sem registros'}
- Sexta:   ${data.humor_sexta || 'Sem registros'}

REFLEXÕES APÓS A REALIZAÇÃO DAS TAREFAS:
${data.reflexao || '(Sem observações finais)'}
--------------------------------------------------
NexPsi Digital • Combate ao Ciclo da Inércia`
  },
  {
    id: 'diario_ansiedade',
    title: 'Diário Clínico de Registro de Ansiedade',
    type: 'Questionário',
    demand: 'Ansiedade e Pânico',
    description: 'Triagem de sintomas de somatização e eficácia de ferramentas de contenção diafragmática.',
    instructions: 'Preencher sempre que o paciente sofrer um pico de ansiedade aguda ou desconforto físico injustificado.',
    fields: [
      { id: 'situacao_gatilho', label: 'Gatilho / Situação desencadeante', type: 'textarea', placeholder: 'Ex: Vi uma mensagem urgente de cobrança do gestor às 21h...' },
      { id: 'sintomas', label: 'Sintomas Corporais Vivenciados', type: 'text', placeholder: 'Ex: Falta de ar, taquicardia, formigamento nas mãos, nó na garganta.' },
      { id: 'nivel_inicial', label: 'Nível de Ansiedade Inicial (0 a 10)', type: 'slider', min: 0, max: 10 },
      { id: 'tecnica_usada', label: 'Técnica de Regulação Empregada', type: 'select', options: [
        'Respiração Diafragmática (Inspirar 4s, Segurar 2s, Expirar 6s)',
        'Exercício de Aterramento 5-4-3-2-1 (Mindfulness dos 5 sentidos)',
        'Protocolo de Adiamento de Preocupação (Tempo de Preocupar-se)',
        'Experimento de Questionamento das Probabilidades (Descatastrofização)'
      ]},
      { id: 'nivel_final', label: 'Nível de Ansiedade Após Técnica (0 a 10)', type: 'slider', min: 0, max: 10 },
      { id: 'cognicoes', label: 'O que aprendi com esse episódio de ansiedade?', type: 'textarea', placeholder: 'Ex: A crise de taquicardia atingiu um pico de 5 minutos e passou. Eu não desmaiei nem morri, as sensações corporais são só descarga de adrenalina inofensiva.' }
    ],
    defaultValues: { situacao_gatilho: '', sintomas: '', nivel_inicial: 7, tecnica_usada: 'Respiração Diafragmática (Inspirar 4s, Segurar 2s, Expirar 6s)', nivel_final: 3, cognicoes: '' },
    exportFormat: (data, patientName) => `REGISTRO DIÁRIO DE ANSIEDADE E AUTORREGULAÇÃO
Paciente: ${patientName}
--------------------------------------------------
SITUAÇÃO GATILHO:
${data.situacao_gatilho || '(Não preenchido)'}

SINTOMAS CORPORAIS DETECTADOS:
${data.sintomas || '(Não preenchido)'}

MONITORAMENTO DE INTENSIDADE DA CRISE:
- Ansiedade Inicial: ${data.nivel_inicial}/10
- Técnica Empregada:  ${data.tecnica_usada}
- Ansiedade Final:   ${data.nivel_final}/10

INSIGHTS E CONCEITUAÇÃO ADAPTATIVA:
${data.cognicoes || '(Sem conclusões registradas)'}
--------------------------------------------------
NexPsi Digital • Regulação Emocional Continuada`
  },
  {
    id: 'exposicao_gradual',
    title: 'Desafio Semanal de Hierarquia de Exposição Gradual',
    type: 'Tarefa Terapêutica',
    demand: 'Ansiedade e Pânico',
    description: 'Desmantela comportamentos fóbicos e esquivas sutilmente nocivas com degraus controlados.',
    instructions: 'Defina junto ao paciente 3 degraus sucessivos para enfrentar o receio social/espacial até que haja habitação somática.',
    fields: [
      { id: 'medo_central', label: 'Fobia / Evitação Primária mapeada no paciente', type: 'text', placeholder: 'Ex: Medo de comer no refeitório por achar que estão me julgando.' },
      { id: 'degrau1', label: 'Degrau 1 (Mais Simples - Ansiedade aprox 3/10)', type: 'text', placeholder: 'Ex: Ir ao refeitório beber apenas água e sair após 3 minutos.' },
      { id: 'degrau2', label: 'Degrau 2 (Desafiador - Ansiedade aprox 6/10)', type: 'text', placeholder: 'Ex: Almoçar no refeitório acompanhado de um colega de confiança.' },
      { id: 'degrau3', label: 'Degrau 3 (Objetivo Final - Ansiedade aprox 9/10)', type: 'text', placeholder: 'Ex: Almoçar no refeitório sozinho na mesa coletiva em horário de pico.' },
      { id: 'recompensa', label: 'Auto-acolhimento / Recompensa após conclusão', type: 'text', placeholder: 'Ex: Vou me dar permissão de assistir ao meu seriado sem preocupações.' },
      { id: 'observacoes_exposicao', label: 'Sintomas e Habituação percebidos na execução', type: 'textarea', placeholder: 'Fiz o degrau 1 e 2. Nas primeiras vezes a ansiedade subiu muito, mas após 5 minutos o meu organismo acalmou naturalmente.' }
    ],
    defaultValues: { medo_central: '', degrau1: '', degrau2: '', degrau3: '', recompensa: '', observacoes_exposicao: '' },
    exportFormat: (data, patientName) => `DESAFIO CLÍNICO: HIERARQUIA DE EXPOSIÇÃO GRADUAL
Paciente: ${patientName}
--------------------------------------------------
MEDO OU COMPORTAMENTO DE ESQUIVA DETECTADO:
${data.medo_central || '(Não definido)'}

DEGRAUS PROGRAMADOS PARA EXPOSIÇÃO:
- Degrau 1 [FÁCIL]: ${data.degrau1 || '(Não definido)'}
- Degrau 2 [MÉDIO]: ${data.degrau2 || '(Não definido)'}
- Degrau 3 [FORTE]: ${data.degrau3 || '(Não definido)'}

RECOMPENSA DE REFORÇO POSITIVO:
${data.recompensa || '(Não preenchido)'}

DADOS COLETADOS DURANTE O ENFRENTAMENTO (HABITUAÇÃO):
${data.observacoes_exposicao || '(Ainda sem anotações de execução)'}
--------------------------------------------------
NexPsi Digital • Dessensibilização Sistemática`
  },
  {
    id: 'fatiamento_procrastinacao',
    title: 'Planejador de Fatiamento e Iniciação de Tarefas',
    type: 'Tarefa Terapêutica',
    demand: 'TDAH e Procrastinação',
    description: 'Combate o congelamento por sobrecarga executiva típica do TDAH através do fatiamento atômico.',
    instructions: 'Ideal para desenhar com o paciente um roteiro visual simples para iniciar uma tarefa que causa ansiedade.',
    fields: [
      { id: 'tarefa_macro', label: 'Entrega / Tarefa Complexa (Gatilho da Paralisia)', type: 'text', placeholder: 'Ex: Escrever o relatório final de fechamento financeiro trimestral...' },
      { id: 'fatia1', label: 'Fatia Atômica 1 (Duração máxima de 10 minutos - Muito fácil)', type: 'text', placeholder: 'Ex: Apenas abrir o arquivo Word e digitar o sumário/título.' },
      { id: 'fatia2', label: 'Fatia Atômica 2 (Segundo passo sequencial simples)', type: 'text', placeholder: 'Ex: Preencher os dados de receita obtidos em Janeiro.' },
      { id: 'fatia3', label: 'Fatia Atômica 3 (Terceiro passo curto)', type: 'text', placeholder: 'Ex: Enviar o rascunho parcial para mim mesmo para revisão.' },
      { id: 'distratores', label: 'Remoção de Distratores (Quais serão limpos do ambiente?)', type: 'text', placeholder: 'Ex: Celular ficará no modo não perturbe noutra sala; fechar todas as abas extras.' },
      { id: 'timer', label: 'Estruturação do Timer de Foco', type: 'select', options: [
        'Regra dos 5 Minutos (Compromisso de fazer apenas 5 minutos)',
        'Timer Pomodoro Clássico (25 minutos focado, 5 minutos livre)',
        'Técnica do Alarme Inverso (Agendar o fim absoluto da tarefa)'
      ]}
    ],
    defaultValues: { tarefa_macro: '', fatia1: '', fatia2: '', fatia3: '', distratores: '', timer: 'Regra dos 5 Minutos (Compromisso de fazer apenas 5 minutos)' },
    exportFormat: (data, patientName) => `FERRAMENTA DE FOCO: FATIAMENTO DE TAREFAS (TDAH)
Paciente: ${patientName}
--------------------------------------------------
TAREFA PRINCIPAL CAPAZ DE GERAR CONGELAMENTO:
${data.tarefa_macro || '(Não definida)'}

ROTEIRO DE FATIAS ATÔMICAS (MICRO-PASSOS DE BAIXA FRICÇÃO):
1. Passo Inicial (~10 min): ${data.fatia1 || '(Não preenchido)'}
2. Segundo Passo curto:    ${data.fatia2 || '(Não preenchido)'}
3. Terceiro Passo curto:   ${data.fatia3 || '(Não preenchido)'}

REGRAS DE CONTROLE AMBIENTAL DE AGRESSÃO DIGITAL:
${data.distratores || '(Não preenchido)'}

METODOLOGIA DE TIMER INCORPORADA:
${data.timer}
--------------------------------------------------
NexPsi Digital • Redução de Fricção Cognitiva`
  },
  {
    id: 'matriz_prioridades',
    title: 'Matriz Interativa de Priorizações (Eisenhower)',
    type: 'Tarefa Terapêutica',
    demand: 'TDAH e Procrastinação',
    description: 'Classifica fluxos de trabalho gerando clareza mental e freando a impulsividade do TDAH.',
    instructions: 'Substitua a sensação de afogamento em listas infinitas de pendências estruturando prioridades reais.',
    fields: [
      { id: 'q1', label: 'Quadrante 1: Fazer Agora (Urgente & Importante - Prazos, emergências crises)', type: 'textarea', placeholder: 'Ex: Enviar imposto hoje, agendar médico para dor de dente aguda.' },
      { id: 'q2', label: 'Quadrante 2: Planejar & Decidir (Importante mas Não Urgente - Saúde, estudos, carreira)', type: 'textarea', placeholder: 'Ex: Praticar exercícios físicos, estudar para certificação profissional.' },
      { id: 'q3', label: 'Quadrante 3: Delegar / Minimizar (Urgente mas Não Importante - Interrupções, reuniões sem sentido)', type: 'textarea', placeholder: 'Ex: Responder e-mails administrativos simples, convites improdutivos.' },
      { id: 'q4', label: 'Quadrante 4: Eliminar (Não Urgente & Não Importante - Cavalos de troia de procrastinação)', type: 'textarea', placeholder: 'Ex: Ficar rodando o feed de reels por 2h seguidas.' }
    ],
    defaultValues: { q1: '', q2: '', q3: '', q4: '' },
    exportFormat: (data, patientName) => `PLANEJAMENTO CLÍNICO: MATRIZ DE EISENHOWER
Paciente: ${patientName}
--------------------------------------------------
[Q1] FAZER AGORA (Urgente & Importante - Prazos e Sobrevivência):
${data.q1 || 'Nenhuma tarefa mapeada'}

[Q2] DECIDIR / ROTINA (Não Urgente mas Importante - Crescimento pessoal):
${data.q2 || 'Nenhuma tarefa mapeada'}

[Q3] DELEGAR / FILTRAR (Urgente mas Não Importante - Ruídos cotidianos):
${data.q3 || 'Nenhuma tarefa mapeada'}

[Q4] ELIMINAR / CONTROLAR (Não Urgente & Não Importante - Ladrões de tempo):
${data.q4 || 'Nenhuma tarefa mapeada'}
--------------------------------------------------
NexPsi Digital • Clareza e Direcionamento`
  },
  {
    id: 'termometro_burnout',
    title: 'Registro de Limites & Termômetro de Estresse Sócio-Ocupacional',
    type: 'Questionário',
    demand: 'Estresse e Burnout',
    description: 'Diagnostica fontes de sobrecarga crônica e monitora limites de esgotamento.',
    instructions: 'Ideal para pacientes sob extrema exaustão laboral identificarem fatores geradores de estresse.',
    fields: [
      { id: 'exaustao_acordar', label: 'Nível de exaustão geral física e mental ao acordar (0 a 10)', type: 'slider', min: 0, max: 10 },
      { id: 'estressores', label: 'Qual o principal fator de desalinhamento de recursos no trabalho?', type: 'textarea', placeholder: 'Ex: Microgerenciamento abusivo do chefe, cobrança por horas extras não pagas, falta de pessoal.' },
      { id: 'sintoma_corporal', label: 'Sintomas físicos de alerta ativados (Dores, sono, estômago)', type: 'text', placeholder: 'Ex: Enxaqueca tensional frequente aos domingos à noite, refluxo ácido.' },
      { id: 'limite_concreto', label: 'Limite Saudável e Concreto Inegociável para aplicar esta semana', type: 'text', placeholder: 'Ex: Deixar o notebook da empresa guardado nas sextas-feiras após 18h.' },
      { id: 'autocuidado_micro', label: 'Atividade de descanso não ativa (Ex: Banho demorado, silêncio absoluto)', type: 'text', placeholder: 'Ex: Ficar deitado em silêncio por 15 minutos ao chegar em casa do trabalho.' }
    ],
    defaultValues: { exaustao_acordar: 5, estressores: '', sintoma_corporal: '', limite_concreto: '', autocuidado_micro: '' },
    exportFormat: (data, patientName) => `EXERCÍCIO DE CONTENÇÃO: MONITORAMENTO DE EXAUSTÃO (BURNOUT)
Paciente: ${patientName}
--------------------------------------------------
ESTADO DE ENERGIA AO DESPERTAR:
- Nível de Esgotamento: ${data.exaustao_acordar}/10

FONTES PRINCIPAIS DE SOBRECARGA LABORAL:
${data.estressores || '(Não mapeado)'}

SINAIS CORPORAIS E FISIOLÓGICOS DE ALARME:
${data.sintoma_corporal || '(Não listado)'}

FRENTE DE PROTEÇÃO: LIMITE CONCRETO PACTUADO:
${data.limite_concreto || '(Ainda sem limite estipulado)'}

MICRO-INTERVENÇÃO DE RECUPERAÇÃO BIOLÓGICA:
${data.autocuidado_micro || '(Não preenchido)'}
--------------------------------------------------
NexPsi Digital • Saúde Ocupacional e Mental`
  },
  {
    id: 'higiene_sono',
    title: 'Protocolo de Higiene e Desaceleração do Sono',
    type: 'Tarefa Terapêutica',
    demand: 'Estresse e Burnout',
    description: 'Sequência de rituais de descompressão biológica para reverter insônia tensional.',
    instructions: 'Recomendado sempre que o paciente apontar dificuldade de iniciar o sono motivado por ruminações de ansiedade.',
    fields: [
      { id: 'desconexao_hora', label: 'Horário Limite para desligar o celular / telas (Indutor do sono)', type: 'text', placeholder: 'Ex: 21h30' },
      { id: 'ambiente', label: 'Preparação física do quarto (Iluminação, sons, temperatura)', type: 'text', placeholder: 'Ex: Apagar luzes fortes, ligar abajur amarelo, usar ventilador para ruído branco.' },
      { id: 'relaxamento_sono', label: 'Atividade relaxante substituta (Leitura analógica, Chá morno, etc.)', type: 'text', placeholder: 'Ex: Beber chá de camomila e ler livro impresso leve.' },
      { id: 'pensamento_insone', label: 'Estratégia para pensamentos intrusivos sob a cama', type: 'select', options: [
        'Caderno de Descarrego: Escrever as preocupações num papel e fechá-lo na gaveta antes de deitar',
        'Exercício respiratório de foco biológico (Contagem regressiva de 100 até 0 de 3 em 3)',
        'Aceitar o insônia: Levantar da cama e fazer atividade monótona na penumbra se não dormir em 20 min'
      ]},
      { id: 'despertar_hora', label: 'Horário planejado para despertar (Evitar sonecas cumulativas)', type: 'text', placeholder: 'Ex: 06h30' }
    ],
    defaultValues: { desconexao_hora: '', ambiente: '', relaxamento_sono: '', pensamento_insone: 'Caderno de Descarrego: Escrever as preocupações num papel e fechá-lo na gaveta antes de deitar', despertar_hora: '' },
    exportFormat: (data, patientName) => `PROTOCOLO EXECUTIVO: HIGIENE DO SONO
Paciente: ${patientName}
--------------------------------------------------
CRONOGRAMA DE DESCOMPRESSÃO NOTURNA:
- Horário da Desconexão Digital: ${data.desconexao_hora || 'Não definido'}
- Preparação do Quarto:          ${data.ambiente || 'Não definido'}
- Ritual de Desaceleração:       ${data.relaxamento_sono || 'Não definido'}

MANEJO DE COGNIÇÕES INTRUSIVAS NOTURNAS:
${data.pensamento_insone}

ORGANIZAÇÃO DO DESPERTAR:
- Despertar padrão: ${data.despertar_hora || 'Não definido'}
--------------------------------------------------
NexPsi Digital • Restabelecimento Biológico`
  },
  {
    id: 'autoestima_crenças',
    title: 'Inventário Semanal de Reconhecimento e Diário de Conquistas',
    type: 'Questionário',
    demand: 'Autoestima e Assertividade',
    description: 'Promove a flexibilização de filtros mentais depreciativos vigentes em falatórios autocríticos severos.',
    instructions: 'Estimule o preenchimento para que o paciente aprenda a catalogar dados da realidade que contrastem com a crença de inutilidade.',
    fields: [
      { id: 'autocritica_grau', label: 'Grau de julgamento e culpa sentido esta semana (0 a 10)', type: 'slider', min: 0, max: 10 },
      { id: 'sucesso_micro', label: 'Escreva um avanço pessoal sutil realizado esta semana', type: 'textarea', placeholder: 'Ex: Consegui falar não para o colega de trabalho sem ficar me culpando por 2 dias seguidos.' },
      { id: 'orgulho', label: 'Qual qualidade pessoal ou virtude você usou nesse avanço?', type: 'text', placeholder: 'Ex: Coragem, clareza, limites, honestidade.' },
      { id: 'elogio_receptividade', label: 'Como você respondeu a elogios ou feedbacks construtivos rápidos?', type: 'text', placeholder: 'Ex: Antes eu dizia "foi sorte", hoje apenas agradeci e sorri.' },
      { id: 'frase_compassiva', label: 'Frase de auto-acolhimento compassivo para momentos de erro', type: 'textarea', placeholder: 'Ex: Eu posso cometer falhas, errar faz parte do aprendizado. Isso não me torna uma fraude nem destrói meu valor inerente como pessoa.' }
    ],
    defaultValues: { autocritica_grau: 5, sucesso_micro: '', orgulho: '', elogio_receptividade: '', frase_compassiva: '' },
    exportFormat: (data, patientName) => `DIÁRIO CLÍNICO DE AUTOCOMPAIXÃO E CONQUISTAS
Paciente: ${patientName}
--------------------------------------------------
AVALIAÇÃO DE INSTABILIDADE AUTOCRÍTICA:
- Intensidade de Culpa/Julgamento: ${data.autocritica_grau}/10

FATOS DE RETENÇÃO REALISTA (AVANÇO SEMANAL):
${data.sucesso_micro || '(Nenhum registro)'}

VIRTUDE OU CAPACIDADE MOBILIZADA:
${data.orgulho || '(Não preenchido)'}

REAÇÃO AOS ELOGIOS DO ENTORNO:
${data.elogio_receptividade || '(Não descrito)'}

MANTRA DE COMPAIXÃO (REDUÇÃO DO PERFECCIONISMO):
${data.frase_compassiva || '(Frase padrão não definida)'}
--------------------------------------------------
NexPsi Digital • Flexibilização de Filtro Mental Negativo`
  },
  {
    id: 'comunicacao_assertiva',
    title: 'Formulário Estruturado de Treino de Resposta Assertiva (DEEC)',
    type: 'Tarefa Terapêutica',
    demand: 'Autoestima e Assertividade',
    description: 'Roteiro prático para expressar sentimentos e impor limites interpessoais com dignidade e educação.',
    instructions: 'Indicado para pacientes com passividade crônica ou explosões de agressividade treinarem comunicações equilibradas.',
    fields: [
      { id: 'descricao_fato', label: 'D - Descrever a situação de forma puramente objetiva (Sem julgar)', type: 'textarea', placeholder: 'Ex: Combinamos que você traria sua parte do projeto ontem às 15h, mas você mandou somente hoje às 11h.' },
      { id: 'expressao_sentir', label: 'E - Expressar o que você SENTIU e pensa com termos autocentrados ("Eu me senti")', type: 'textarea', placeholder: 'Ex: Eu me senti preocupado e sobrecarregado, pois isso diminuiu consideravelmente meu tempo para formatar os slides.' },
      { id: 'especificacao_pedido', label: 'E - Especificar o comportamento alternativo que deseja pedir de forma clara', type: 'text', placeholder: 'Ex: Gostaria de pedir que você me avise com pelo menos 4 horas de antecedência se prever que houver atrasos.' },
      { id: 'consequencia_positiva', label: 'C - Consequências positivas da mudança (O que ambos ganham)', type: 'text', placeholder: 'Ex: Assim evitamos discussões, organizamos melhor o tempo e entregamos um resultado de excelente qualidade juntos.' },
      { id: 'resposta_evitada', label: 'Roteiro de reação explosiva ou passiva de esquiva que VOCÊ EVITOU', type: 'textarea', placeholder: 'Ex: Evitei apenas aceitar de cabeça baixa e ficar remoendo raiva, ou gritar cobrando agressivamente.' }
    ],
    defaultValues: { descricao_fato: '', expressao_sentir: '', especificacao_pedido: '', consequencia_positiva: '', resposta_evitada: '' },
    exportFormat: (data, patientName) => `ROTEIRO DE COMUNICAÇÃO ASSERTIVA (MÉTODO DEEC)
Paciente: ${patientName}
--------------------------------------------------
[D] DESCRIÇÃO DOS FATOS (Foco puro na realidade):
${data.descricao_fato || '(Vazio)'}

[E] EXPRESSAR CUIDADOSAMENTE OS SENTIMENTOS (Eu me senti...):
${data.expressao_sentir || '(Vazio)'}

[E] ESPECIFICIDADE DE PEDIDO (Claro, mensurável e realizável):
${data.especificacao_pedido || '(Vazio)'}

[C] CONSEQUÊNCIAS POSITIVAS DA SOLUÇÃO (Ganho mútuo e reciprocidade):
${data.consequencia_positiva || '(Vazio)'}

COMPORTAMENTOS EVITADOS (VITÓRIA DE AUTORREGULAÇÃO):
${data.resposta_evitada || '(Não listado)'}
--------------------------------------------------
NexPsi Digital • Comunicação de Limites e Relacionamento Interpessoal`
  }
];
