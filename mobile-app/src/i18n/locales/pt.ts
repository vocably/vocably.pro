import { BaseTranslations } from '../index';
import { languageTranslations } from '@vocably/i18n';

const translations: BaseTranslations = {
  common: {
    cancel: 'Cancelar',
    delete: 'Excluir',
    save: 'Salvar',
    done: 'Concluído',
    close: 'Fechar',
    back: 'Voltar',
    ok: 'OK',
    yes: 'Sim',
    no: 'Não',
    error: 'Erro',
    goBack: 'Voltar',
    operationFailed: 'Não foi possível realizar a operação.',
    signIn: 'Entrar',
    presentTenses: '(presente: {{value}})',
    pastTenses: '(passado: {{value}})',
    plural: '(plural: {{value}})',
    examples: 'Exemplos',
  },
  appLanguagePicker: {
    title: 'Idioma do app',
  },
  nav: {
    myCards: 'Meus cartões',
    lookUp: 'Buscar',
    tips: 'Dicas',
    settings: 'Configurações',
    studySettings: 'Configurações de estudo',
    editCard: 'Editar cartão',
    chatWithCard: 'Conversar sobre o cartão',
    cardGenerator: 'Gerador de cartões',
    feedback: 'Feedback',
    createAccount: 'Criar conta',
    previewStudyStep: 'Pré-visualizar etapa',
    exportDeck: 'Exportar cartões',
  },
  settings: {
    notRegistered: 'Ainda não cadastrado.',
    createAccount: 'Criar conta',
    appLanguage: 'Idioma do app: {{label}}',
    studySettings: 'Configurações de estudo',
    studyReminders: {
      title: 'Lembretes de estudo',
      body: 'Os lembretes de estudo são enviados uma vez por dia para você revisar seus cartões de <bold>{{languageName}}</bold>.',
      perLanguageHint:
        'Cada idioma tem suas próprias configurações de lembrete, disponíveis na tela «Editar idioma».',
      unregisteredHint:
        'Lembretes de estudo não estão disponíveis para usuários não cadastrados.',
    },
    feedback: {
      title: 'Enviar feedback',
      body: 'Está faltando alguma funcionalidade importante ou só quer compartilhar sua opinião sobre o Vocably? Ficarei feliz em ouvir você.',
    },
    signOut: 'Sair',
    deleteAccount: {
      menuItem: 'Excluir minha conta',
      title: 'Excluir sua conta?',
      message: 'Esta ação não pode ser desfeita.',
    },
    deleteData: {
      menuItem: 'Excluir meus dados',
      title: 'Excluir seus dados?',
      message: 'Esta ação não pode ser desfeita.',
    },
    version: 'Versão: {{version}}',
  },
  feedback: {
    thanksTitle: 'Obrigado pelo seu feedback.',
    thanksFollowUp: 'Em breve entrarei em contato por e-mail.',
    sendFailed:
      'Algo deu errado. Seu feedback não foi enviado. Tente novamente ou me envie um e-mail para d@vocably.pro.',
    noEmailTitle: 'Sem e-mail',
    noEmailMessage:
      'Por favor, inclua um endereço de e-mail diretamente na mensagem para que eu possa lhe responder.',
    send: 'Enviar',
    intro: 'Tem dúvidas ou sugestões? Pode falar comigo a qualquer momento.',
    personalReply:
      'Eu cuido de cada mensagem pessoalmente e responderei por e-mail em poucos dias.',
    willReplyTo: 'Responderei para o e-mail <bold>{{email}}</bold>.',
    privateRelayNote:
      'Parece que você compartilhou um e-mail privado da Apple no cadastro, mas não se preocupe — deve funcionar normalmente.',
    provideEmail:
      'Por favor, informe seu endereço de e-mail para que eu possa lhe enviar uma resposta pessoal.',
    yourMessage: 'Sua mensagem',
  },
  error: {
    clearData: {
      title: 'Limpar os dados do app?',
      message:
        'Limpar os dados do app vai apagar permanentemente todo o progresso para usuários não cadastrados. Continuar?',
    },
    tryAgain: 'Tentar novamente',
    tryHarder: 'Esforce-se mais!',
    clearAndSignOut: 'Limpar dados do app e sair',
  },
  howToGroupCards: {
    intro: 'Você pode agrupar com tags.',
    swipeLeft:
      'Deslize qualquer cartão existente para a esquerda e toque no botão <tagPlusIcon />.',
    tapOnNew:
      'Ou toque no botão <tagPlusIcon /> em um cartão recém-adicionado.',
    studyByTag:
      'Quando pelo menos uma tag for criada, toque no ícone <tagIcon /> no botão Estudar para estudar uma tag selecionada ou um grupo de tags.',
    swipeToEdit:
      'Deslize qualquer tag na lista para editar ou excluir. Seus cartões não serão excluídos.',
  },
  subscription: {
    loadingCustomerStatus: 'Carregando status do cliente',
    goPremium: 'Assinar Premium',
  },
  premium: {
    label: 'Premium',
    nextPayment: 'Próximo pagamento: {{date}}',
    validUntil: 'Válido até: {{date}}',
    manageSubscription: 'Gerenciar assinatura',
    refreshHint:
      'Pode levar alguns minutos para que as alterações apareçam no app.',
    refresh: 'Atualizar',
  },
  paidAccount: {
    youArePremium: 'Você é um usuário Premium',
    why: 'Por quê?',
    iDontKnow: 'Não sei.',
    possibleReasons: 'Possíveis motivos:',
    reasonEarlyUser: 'Você é um dos primeiros usuários ativos do Vocably',
    reasonILikeYou: 'Eu gosto de você',
    enjoyPremium: 'De qualquer forma, aproveite o seu Premium.',
    wantToHelp: 'Quer ajudar este app? <rate>Avalie na {{storeName}}</rate>.',
  },
  debug: {
    menuTitle: 'Menu de depuração',
    languageTransformations: 'Transformações de idioma',
    studyStreak: 'Sequência de estudo',
    clearStorage: 'Limpar dados de armazenamento',
  },
  studySettings: {
    maxCardsPerSession: 'Máximo de cartões por sessão de estudo',
    maxNeverStudiedPerDay:
      'Máximo de cartões «nunca estudados» que podem ser selecionados por dia',
    maxNeverStudiedHint:
      'Esta opção só faz sentido para usuários experientes que têm muitos cartões novos acumulados no grupo «Nunca estudados».',
    pronounceExample: 'Pronunciar uma frase de exemplo',
    pronounceExampleHint:
      'Esta opção faz o app tocar uma frase de exemplo aleatória nos momentos apropriados durante a sessão. A opção <icon /> deve estar ativada — fica no canto superior direito da tela de Estudo.',
    randomize: 'Selecionar cartões aleatoriamente para estudar',
    randomizeHint:
      '<warningIcon /> Ativar esta opção geralmente é uma <bold>má ideia</bold>. Ela desativa o algoritmo inteligente de estudo. Quem desativa o algoritmo inteligente acaba se frustrando com o próprio progresso.',
    srsLink:
      'Leia como o Vocably usa o algoritmo inteligente para ajudar você a aprender mais palavras em menos tempo.',
  },
  studyFlow: {
    mf: 'Escolher a tradução correta (questão de múltipla escolha)',
    sf: 'Lembrar a tradução correta',
    mb: 'Escolher a palavra ou frase correta (questão de múltipla escolha)',
    ab: 'Organizar a palavra ou frase correta por letras',
    sb: 'Lembrar a palavra ou frase correta',
    default: 'Nova etapa',
    preview: 'Pré-visualização',
    premiumOnly: 'Disponível para usuários Premium',
    upgradeToPremium: 'Assinar Premium',
    heading: 'Etapas de estudo por cartão',
    rearrangeHintBefore: 'Use ',
    rearrangeHintAfter: ' para reorganizar as etapas.',
  },
  cardsLimit: {
    openVocablySettings: 'Abra Vocably → Configurações para fazer upgrade.',
    upgradeToPremium: 'Assinar Premium',
    collectionHas_one:
      'Sua coleção tem <bold>{{maxCards}}</bold> cartões. Agora você pode salvar <bold>{{count}} cartão por dia.</bold> Usuários Premium não têm esse limite.',
    collectionHas_other:
      'Sua coleção tem <bold>{{maxCards}}</bold> cartões. Agora você pode salvar <bold>{{count}} cartões por dia.</bold> Usuários Premium não têm esse limite.',
    collectionHasMoreThan_one:
      'Sua coleção tem mais de <bold>{{maxCards}}</bold> cartões. Agora você pode salvar <bold>{{count}} cartão por dia.</bold> Usuários Premium não têm esse limite.',
    collectionHasMoreThan_other:
      'Sua coleção tem mais de <bold>{{maxCards}}</bold> cartões. Agora você pode salvar <bold>{{count}} cartões por dia.</bold> Usuários Premium não têm esse limite.',
  },
  chat: {
    thinking: 'Pensando...',
    errorOccurred: 'Ocorreu um erro. Tente novamente.',
    explain: 'Explicar',
    examples: 'Exemplos',
    remember: 'Memorizar',
    explainMessage: 'Explique',
    examplesMessage: 'Dê várias frases de exemplo',
    rememberMessage: 'Me ajude a memorizar este cartão',
    inputDisabled: 'Esta entrada está desativada agora.',
    inputPlaceholder: 'Sua mensagem...',
    initialMessage:
      'Você pode perguntar qualquer coisa sobre **{{source}}**, por exemplo:\n\n  * explicar o significado\n  * fornecer exemplos\n  * ajudar a memorizar',
    initialMessageWithPartOfSpeech:
      'Você pode perguntar qualquer coisa sobre o/a {{partOfSpeech}} **{{source}}**, por exemplo:\n\n  * explicar o significado\n  * fornecer exemplos\n  * ajudar a memorizar',
  },
  dashboard: {
    loadingCards: 'Carregando cartões...',
    study: 'Estudar',
    studySection: 'Estudar',
    studySelectedTags: 'Estudar',
    tagsLabel: 'Tags:',
    cardsWithNoTags: 'Cartões sem tags',
    cantWait: 'Estudar agora',
    deleteCardFailedTitle: 'Erro: falha ao excluir o cartão',
    deleteCardFailedMessage:
      'Opa! Algo deu errado ao tentar excluir o cartão. Tente novamente mais tarde.',
    searchPlaceholder: 'Buscar na sua coleção...',
    section: {
      today: 'Planejados para hoje',
      expired: 'Para colocar em dia',
      notStarted: 'Nunca estudados',
      tomorrow: 'Amanhã',
      future: 'Planejados',
    },
    empty: {
      noCardsYet: 'Você ainda não tem cartões de estudo.',
      headOverToLookUp:
        'Vá para a aba Buscar para encontrar e adicionar palavras novas. O Vocably é um dicionário com um sistema de aprendizado integrado.',
      headOverToGenerator:
        'Ou use o gerador de cartões para criar alguns cartões de estudo.',
      goToLookUp: 'Ir para Buscar',
      goToGenerator: 'Utilizar o gerador de cartões',
      noCardsForSearch:
        'Nenhum cartão encontrado para <bold>{{searchText}}</bold>.',
      noCardsForTag:
        'Você não tem cartões marcados com <bold>{{tagTitle}}</bold>.',
      noCardsForTags: 'Nenhum cartão encontrado para as tags selecionadas.',
    },
    mayBeStudiedIn_one: 'Poderá ser estudado em {{count}} minuto.',
    mayBeStudiedIn_other: 'Poderá ser estudado em {{count}} minutos.',
    dueDate: {
      tomorrow: 'amanhã',
      inDays_one: 'em {{count}} dia',
      inDays_other: 'em {{count}} dias',
    },
  },
  deck: {
    editDeckTitle: 'Editar {{languageName}}',
    studyRemindersTitle: 'Lembretes de estudo para {{languageName}}',
  },
  editCard: {
    updateFailedTitle: 'Erro: falha ao atualizar o cartão',
    updateFailedMessage:
      'Opa! Algo deu errado ao tentar atualizar o cartão. Tente novamente.',
    deletePrompt: {
      title: 'Excluir este cartão?',
      message: 'Esta ação não pode ser desfeita.',
    },
    unableToDelete: 'Não foi possível excluir o cartão. Tente novamente.',
    deletingCard: 'Excluindo cartão...',
    resetPrompt: {
      title: 'Redefinir progresso de estudo?',
      message: 'Esta ação não pode ser desfeita.',
      confirm: 'Redefinir',
    },
    unableToReset: 'Não foi possível redefinir o progresso. Tente novamente.',
    addOrRemoveTags: 'Adicionar ou remover tags do cartão (pastas)',
    resetStudyProgress: 'Redefinir progresso de estudo',
    rawCardData: 'Dados brutos do cartão',
  },
  editDeck: {
    studySettings: 'Configurações de estudo',
    exportDeck: 'Exportar idioma',
    studyReminders: 'Lembretes de estudo',
    studyRemindersUnregisteredHint:
      'Os lembretes de estudo estão temporariamente desativados para usuários não cadastrados.',
    hideDefinitions: 'Ocultar definições',
    hideDefinitionsHint:
      'O app tentará mostrar menos definições em Meus cartões e durante o estudo.',
    deckContainsCards_one: 'Você tem {{count}} cartão.',
    deckContainsCards_other: 'Você tem {{count}} cartões.',
    deleteDeck: 'Excluir este idioma',
    deleteDeckPrompt: {
      title: 'Excluir {{languageName}}?',
      message: 'Esta ação não pode ser desfeita.',
    },
    deleteDeckError: {
      title: 'Erro ao excluir o idioma',
      message:
        'Opa! Algo deu errado ao tentar excluir o idioma. Tente novamente mais tarde.',
    },
  },
  generateCards: {
    loadingPreset: 'Carregando preset de tradução...',
    errorUnable: 'Não foi possível gerar os cartões. Tente novamente.',
    intro: 'Digite o que precisa e o Vocably vai gerar cartões para você.',
    experimental:
      'Este é um recurso experimental. <feedback>Me avise</feedback> se encontrar bugs ou tiver sugestões.',
    examplesToTry: 'Alguns exemplos para experimentar:',
    exampleIrregularVerbs: 'verbos irregulares',
    exampleAnimals: 'animais',
    examplePopularIdioms: 'expressões populares',
    placeholder: 'Qualquer coisa...',
    generating: 'Gerando cartões...',
    followingWillBeGenerated: 'Os seguintes cartões serão gerados:',
  },
  languageSelector: {
    addNewLanguage: 'Adicionar novo idioma',
    popularLanguages: 'Idiomas populares',
    selected: 'Selecionado',
    availableLanguages: 'Idiomas disponíveis',
    select: 'Selecionar',
    studyLanguage: 'Idioma de estudo',
    yourLanguages: 'Seus idiomas',
    deviceLanguage: 'Idioma do dispositivo',
    preferredLanguages: 'Idiomas preferidos',
    motherTongue: 'Língua materna',
    preferred: 'Idiomas populares',
    search: 'Buscar...',
  },
  lookUp: {
    loadingPreset: 'Carregando preset de tradução...',
    lookUpFailedTitle: 'Erro: falha na busca',
    lookUpFailedMessage:
      'Opa! Algo deu errado durante a busca. Tente novamente mais tarde.',
    searchPlaceholder: 'Qualquer palavra em qualquer idioma',
    lookingForCollections: 'Procurando coleções de cartões?',
    tryAiGenerator: 'Experimente o gerador de cartões com IA',
    questionsOrSuggestions: 'Dúvidas ou sugestões?',
    connectOnTelegram: 'Falar pelo Telegram',
    joinDiscord: 'Entrar no Discord',
    sendMessage: 'Enviar uma mensagem',
    conductingAnalysis: 'Fazendo uma análise mais detalhada...',
    selectLanguageLearning: 'Selecione o idioma que você está aprendendo.',
    selectMotherTongue: 'Selecione sua língua materna',
  },
  notifications: {
    checking: 'Verificando...',
    loadingPreset: 'Carregando preset...',
    loadFailed: {
      sorry: 'Sinto muito.',
      cannotLoad:
        'O sistema não consegue carregar o status dos lembretes de estudo.',
      informed: 'Já fui informado sobre isso.',
      tryAgain: 'Tente novamente mais tarde.',
    },
    enabledFor: 'Ativado para {{languageString}}',
    remindersDescription:
      'Os lembretes de estudo são enviados uma vez por dia para você revisar seus cartões de {{languageName}}.',
    failedTitle: 'Lembretes de estudo falharam',
    failedAndroidMessage:
      'Não foi possível configurar as notificações automaticamente. Ative-as nas configurações do app.',
    failedIosMessage:
      'Não foi possível configurar as notificações automaticamente. Ative-as em Ajustes → Vocably.',
    deniedAndroidMessage:
      'Não foi possível configurar as notificações automaticamente. Ative-as nas configurações do app.',
    deniedIosMessage:
      'Não foi possível configurar as notificações automaticamente. Ative-as em Ajustes → Vocably.',
    openSettings: 'Abrir Configurações',
    enableReminders: 'Ativar lembretes',
    receiveAt: 'Hora',
  },
  study: {
    loading: 'Carregando...',
    finish: 'Finalizar',
    takeOneMoreRound: 'Mais uma rodada',
    cardUpdateFailedTitle: 'Erro: falha ao atualizar o cartão',
    cardUpdateNetworkError:
      'Sua resposta não foi salva por causa da perda de conexão. A sessão vai parar e retomar a partir da resposta que falhou.',
    cardUpdateTechnicalError:
      'Opa! Não é possível continuar a sessão por um problema técnico. Tente novamente mais tarde.',
    exitStudySession: 'Sair da sessão de estudo',
    tapDot: {
      touch: 'Toque',
    },
    swipeGrade: {
      notYet: 'Ainda não',
      almost: 'Quase',
      gotIt: 'Acertei!',
    },
    arrangeByLetters: {
      showMeTheAnswer: 'Mostrar a resposta',
    },
    cardBack: {
      emptyCardMessage:
        'Este cartão não tem traduções nem definições. Edite este cartão.',
    },
    multiChoice: {
      showCorrectAnswer: 'Mostrar a resposta correta',
    },
    reverseCardBack: {
      theAnswerIs: 'A resposta é',
    },
    reverseCardFront: {
      examples_one: 'Exemplo:',
      examples_other: 'Exemplos:',
    },
    motivationalQuotes: {
      '0': 'Fluência não nasce de um dia perfeito, mas de muitos dias comuns em que você não desistiu.',
      '1': 'A palavra que hoje escapa de você amanhã será sua — basta voltar para buscá-la.',
      '2': 'Aprender um idioma é como pingar água na pedra: é a repetição, não a pressa, que abre caminho.',
      '3': 'Não conte os dias em que estudou; faça com que cada dia conte um pouco mais.',
      '4': 'Quem volta amanhã ao mesmo idioma já está mais perto da fluência do que imagina.',
      '5': 'Cada revisão é um tijolo; um dia você perceberá que construiu uma ponte para outro mundo.',
      '6': 'O segredo de quem fala vários idiomas não é o talento, é a teimosia de continuar.',
      '7': 'Esquecer faz parte de lembrar. Reveja, repita e siga em frente.',
      '8': 'Você não precisa estudar muito hoje; precisa estudar de novo amanhã.',
      '9': 'A constância vence a intensidade: dez minutos por dia derrotam dez horas uma vez por mês.',
      '10': 'Todo idioma parece impossível até o dia em que, de repente, parece natural.',
      '11': 'A frustração de hoje é só o som do seu cérebro aprendendo algo novo.',
      '12': 'Pequenos passos diários levam a conversas que um dia você achou impossíveis.',
      '13': 'Não existe palavra difícil demais — existe palavra que você ainda não revisou o suficiente.',
      '14': 'Cada cartão que você estuda é uma promessa que você cumpre consigo mesmo.',
      '15': 'A fluência é paciente: ela espera por quem não desiste de aparecer.',
      '16': 'O progresso silencioso de hoje vira a conversa fluente de amanhã.',
      '17': 'Você está mais perto do que estava ontem — e isso já é motivo para continuar.',
      '18': 'Aprender um idioma é ganhar uma segunda janela para enxergar o mundo.',
      '19': 'Erre sem medo: cada engano corrigido é uma palavra que você nunca mais esquece.',
      '20': 'A perseverança transforma o estranho em familiar e o familiar em fluente.',
      '21': 'Quem rega a planta todos os dias não percebe o crescimento, mas a colheita chega.',
      '22': 'O idioma não pertence aos mais rápidos, mas aos que não param de praticar.',
      '23': 'Continue — a versão de você que fala esse idioma está sendo construída agora.',
      '24': 'Manhãs cansadas e palavras esquecidas também fazem parte do caminho da fluência.',
      '25': 'Um pouco hoje, um pouco amanhã, e um dia você se surpreende falando sem pensar.',
      '26': 'A jornada de mil palavras começa com a coragem de revisar a primeira de novo.',
      '27': 'Persistir é o verdadeiro atalho: não há caminho mais curto até um novo idioma.',
    },
  },
  exportDeck: {
    title: 'Exportar {{languageName}}',
    loadingCards: 'Carregando cartões...',
    advancedExportInfo:
      'Uma funcionalidade de exportação mais avançada está disponível apenas no navegador para usuários cadastrados.',
    loginWithAccount: 'Entrar com sua conta',
    deprecatedCardsExcluded:
      'Alguns cartões foram excluídos porque foram criados com um provedor de dicionário obsoleto.',
    copyToClipboard: 'Copiar para a área de transferência',
    copiedToClipboard: 'Copiado para a área de transferência.',
  },
  loginModal: {
    syncAcrossDevices: 'Sincronize entre dispositivos',
    useBrowserExtensions: 'Use extensões de navegador',
    importExportCsv: 'Importe e exporte dados CSV',
  },
  loginForm: {
    screenTitle: 'Entrar ou se cadastrar',
    signIn: 'Entrar ou criar conta',
    bySigningInYouAgreeToOur: 'Ao entrar, você concorda com nossos',
    termsAndConditions: 'Termos e condições',
    and: 'e',
    privacyPolicy: 'Política de privacidade',
  },
  languageScreen: {
    motherTongueQuestion: 'Qual é a sua língua materna?',
    motherTongueHint: 'Selecione o idioma que você fala fluentemente.',
  },
  welcome: {
    formIntro: 'Para começar, responda algumas perguntas.',
    questionStudyLanguage: 'Qual idioma você estuda?',
    multipleLanguagesHint:
      'Você pode aprender vários idiomas. Por enquanto, escolha apenas um para começar.',
    setup: 'Configurar',
    previous: 'Anterior',
    next: 'Próximo',
    skip: 'Pular',
    goToApp: 'Ir para o app',
    slideCard: {
      looksUpWords: 'O Vocably busca palavras e cria flashcards como este:',
      translatesWords: 'O Vocably traduz palavras e cria flashcards como este:',
      fallbackNote: 'Nota do autor do Vocably',
      fallbackBody:
        'Estes cartões de exemplo são imprecisos e confusos. Peço desculpas por isso. Estou trabalhando em exemplos precisos para o onboarding de usuários que estudam {{sourceLang}} e falam {{targetLang}}.',
      saveFlashcardsBefore: 'Você pode salvar',
      saveFlashcardsAfter:
        'seus flashcards e estudá-los com repetição espaçada.',
    },
    slideLookUp: {
      intro:
        'Viu ou ouviu uma palavra ou frase nova em <bold>{{sourceLanguage}}</bold>? Busque e salve como flashcard!',
    },
    slideReverseTranslate: {
      intro:
        'Quer dizer algo em <bold>{{sourceLanguage}}</bold> mas não sabe a palavra? Busque em <bold>{{targetLanguage}}</bold>.',
    },
    slideSelectToTranslate: {
      into_Safari:
        'Viu uma palavra nova no Safari mobile? Busque com a <bold>extensão do Vocably</bold>.',
      into_Android: 'Viu uma palavra nova na tela do seu dispositivo Android?',
      androidStep1: 'Selecione a palavra',
      androidStep2: 'Toque em',
      androidStep3: 'Toque em «Translate with Vocably»',
    },
    slideDesktopBrowser: {
      intro: 'Usa um computador? Instale a',
      or: 'ou',
      browserExtensionSuffix: 'extensão do navegador para navegar pela web em',
    },
  },
  languages: {
    loading: 'Carregando idiomas...',
  },
  auth: {
    authenticating: 'Autenticando...',
    sessionExpired: 'Sua sessão de autenticação expirou.',
    signInAgain: 'Entrar novamente',
    anonymousUserError: {
      title: 'Não foi possível criar usuário anônimo',
      message: 'Ocorreu um erro crítico ao criar um usuário anônimo.',
    },
  },
  tagMenu: {
    intro:
      'Tags são como grupos, ou pastas, só que melhor. Toque em «Adicionar tag» para começar.',
    addNewTag: 'Adicionar tag',
    editTag: 'Editar {{title}}',
    swipeLeftToEdit: 'Deslize para a esquerda para editar a tag.',
    swipeRightToDelete:
      'Deslize para a direita para excluir a tag. Seus cartões não serão excluídos.',
    removeTagError: 'Ocorreu um erro ao remover a tag. Tente novamente.',
    updateTagError: 'Ocorreu um erro ao atualizar a tag. Tente novamente.',
    add: 'Adicionar',
    newTagName: 'Nome da nova tag',
  },
  cardForm: {
    wordOrPhrase: 'Palavra ou frase',
    translation: 'Tradução',
    partOfSpeech: 'Classe gramatical',
    transcriptionIpa: 'Transcrição (IPA)',
    definition: 'Definição',
    example: 'Exemplo',
    partsOfSpeech: {
      noun: 'substantivo',
      verb: 'verbo',
      adjective: 'adjetivo',
      adverb: 'advérbio',
      phrase: 'expressão',
    },
  },
  discoverySurvey: {
    screenTitle: 'Última pergunta',
    question: 'Como você ficou sabendo do Vocably?',
    whatIsIt: 'De que forma?',
    typePlaceholder: 'Digite aqui',
    sources: {
      playStore: 'Play Store',
      appStore: 'App Store',
      fromAFriend: 'De um amigo',
      other: 'Outro',
    },
  },
  tips: {
    menu: {
      editCards: 'Editar cartões',
      groupCards: 'Agrupar cartões (em pastas)',
      importExportCsv: 'Importar e exportar CSV',
      studyPlan: 'Plano de estudo',
      androidTranslate:
        'Como traduzir qualquer texto selecionado em qualquer app no seu celular.',
      iosTranslate:
        'Traduza qualquer palavra em qualquer site com a extensão do Vocably para iOS Safari.',
      desktopExtension:
        'Usa Chrome ou Safari no computador? Experimente a extensão do Vocably.',
      grammarChecker:
        'Experimente a nova ferramenta de verificação gramatical. Ela não só corrigirá seus erros, mas também explicará o porquê.',
      provideFeedback: 'Enviar feedback',
      feedbackBody:
        'Está faltando alguma funcionalidade importante ou só quer compartilhar sua opinião sobre o Vocably? Ficarei feliz em ouvir você.',
      supportBody:
        'Quer ajudar o Vocably a crescer? Qualquer uma dessas ações faria uma diferença incrível para este projeto.',
      rate: 'Avaliar o app na {{storeName}}',
      shareOnFacebook: 'Compartilhar o app com seus amigos no Facebook',
      shareOnTwitter: 'Compartilhar o app no Twitter/X',
    },
    howToEditCards: {
      title: 'Editar cartões',
      intro: 'Você pode editar os cartões de duas formas:',
      myCardsItem:
        '• <bold>Tela Meus cartões</bold>: deslize um cartão para a esquerda para ver o menu de edição.',
      studySessionItem:
        '• <bold>Sessão de estudo</bold>: toque no botão «Editar» (<editIcon/>).',
    },
    howToGroupCards: {
      title: 'Agrupar cartões',
    },
    howToImportAndExport: {
      title: 'Importar e exportar CSV',
      importCards: 'Importar cartões',
      importNote:
        '<alertIcon/> A importação está disponível apenas para usuários cadastrados. Você será redirecionado para o site.',
      exportCards: 'Exportar seus cartões de {{languageName}}',
    },
    howToViewStudyStatistics: {
      title: 'Plano de estudo',
      para1:
        'O <bold>Plano de Estudo</bold> está ativado por padrão e oferece uma visão geral dos cartões programados para hoje, próximos dias e os que estão atrasados e precisam ser revisados. Isso ajuda você a manter o ritmo, recuperar cartões atrasados e estudar de forma mais estratégica.',
      para2:
        'Para ver seu plano de estudo, vá para a aba <myCards>Meus cartões</myCards> e toque no botão <chartBoxIcon/> no canto superior esquerdo.',
      para3:
        '<bold>Importante:</bold> o plano de estudo não está disponível quando os cartões são selecionados aleatoriamente. Para desativar a seleção aleatória, vá em <studySettings>Configurações de estudo</studySettings>.',
    },
  },
  shareIntent: {
    login: {
      openVocablyToSignIn: 'Abra o Vocably para entrar.',
      openVocably: 'Abrir Vocably',
    },
    receivingText: 'Recebendo o texto...',
  },
  paymentSuccess: {
    thankYou:
      'Obrigado por dar uma chance ao Vocably. Seu apoio significa muito para mim.',
    rateButton: 'Avaliar o Vocably na {{storeName}}',
    feedbackBefore:
      'Se está faltando algo ou se você não gostou de algo, pode sempre me avisar pelo Discord, Telegram ou',
    feedbackLink: 'direto no app',
    feedbackAfter: '. Levo cada feedback a sério.',
  },
  requestFeedback: {
    question:
      'Está gostando do Vocably? Sua avaliação na {{storeName}} leva menos de um minuto e ajuda este projeto.',
    rateButton: 'Avaliar o Vocably na {{storeName}}',
    later: 'Pergunte-me mais tarde',
    feedbackBefore:
      'Se está faltando algo ou se você não gostou de algo, sempre pode',
    feedbackLink: 'me avisar',
    feedbackAfter: '. Levo cada feedback a sério.',
    neverAgain: 'Não quero ver esta mensagem novamente',
  },
  cardDefinition: {
    present: 'Presente:',
    past: 'Passado:',
    plural: 'Plural:',
  },
  streak: {
    consecutiveDays_one: 'dia consecutivo.',
    consecutiveDays_other: 'dias consecutivos.',
    days: {
      '0': 'Dom',
      '1': 'Seg',
      '2': 'Ter',
      '3': 'Qua',
      '4': 'Qui',
      '5': 'Sex',
      '6': 'Sáb',
    },
  },
  language: languageTranslations.pt,
};

export default translations;
