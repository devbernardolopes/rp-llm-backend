let currentCharacter = null;
let currentThread = null;
let conversationHistory = [];
let currentPersona = null;

const MODEL_OPTIONS = [
  { value: "openrouter/auto", label: "Auto" },
  { value: "openrouter/free", label: "OpenRouter Free Router" },
  {
    value: "meta-llama/llama-4-maverick:free",
    label: "Llama 4 Maverick (free)",
  },
  { value: "meta-llama/llama-4-scout:free", label: "Llama 4 Scout (free)" },
  {
    value: "meta-llama/llama-3.1-8b-instruct:free",
    label: "Llama 3.1 8B (free)",
  },
  {
    value: "mistralai/mistral-small-3.1-24b-instruct:free",
    label: "Mistral Small 24B (free)",
  },
  { value: "google/gemma-3-12b-it:free", label: "Gemma 3 12B (free)" },
  { value: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek V3 (free)" },
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 (free)" },
  {
    value: "nousresearch/hermes-3-llama-3.1-405b:free",
    label: "Hermes 3 Llama 3.1 405B (free)",
  },
  { value: "stepfun/step-3.5-flash:free", label: "StepFun Flash (free)" },
  {
    value: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    label: "Dolphin Mistral 24B Venice Edition (free)",
  },
  {
    value: "arcee-ai/trinity-large-preview:free",
    label: "Trinity Large Preview (free)",
  },
];

const ICONS = {
  duplicate:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><rect x="4" y="4" width="11" height="11" rx="2"></rect></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4.2-1 10-10a2 2 0 0 0-2.8-2.8l-10 10L4 20z"></path><path d="M13.5 6.5l4 4"></path></svg>',
  delete:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"></path><path d="M9 7V5h6v2"></path><path d="M7 7l1 13h8l1-13"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>',
  regenerate:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v6h-6"></path></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><rect x="4" y="4" width="11" height="11" rx="2"></rect></svg>',
  speaker:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-4h4l5-4v12l-5-4H4z"></path><path d="M16 9a4 4 0 0 1 0 6"></path><path d="M18.5 7a7 7 0 0 1 0 10"></path></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6"></path><circle cx="12" cy="7.5" r="1"></circle></svg>',
  context:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5a3 3 0 0 1 5.7-1.2A3.2 3.2 0 0 1 18 7v.2a3 3 0 0 1 1 5.7A3.2 3.2 0 0 1 16 18h-1a3 3 0 0 1-6 0H8a3.2 3.2 0 0 1-3-5.1A3 3 0 0 1 6 7v-.2A3.2 3.2 0 0 1 9 5z"></path><path d="M10 9.5v5"></path><path d="M14 9.5v5"></path><path d="M10 12h4"></path></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1-4.4-4.3 6.1-.9z"></path></svg>',
  starFilled:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1-4.4-4.3 6.1-.9z"></path></svg>',
  badge:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v6c0 5-3.1 8.6-7 9-3.9-.4-7-4-7-9V6z"></path><path d="M9.2 12.2l1.9 1.9 3.7-3.7"></path></svg>',
  export:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><path d="M8 7l4-4 4 4"></path><path d="M4 14v5h16v-5"></path></svg>',
};

const DEFAULT_SETTINGS = {
  uiLanguage: "auto",
  openRouterApiKey: "",
  model: "openrouter/auto",
  markdownEnabled: true,
  allowMessageHtml: true,
  streamEnabled: true,
  autoReplyEnabled: true,
  enterToSendEnabled: true,
  autoPairEnabled: true,
  maxTokens: Number(CONFIG.maxTokens) > 0 ? Number(CONFIG.maxTokens) : 8192,
  temperature: Number.isFinite(Number(CONFIG.temperature))
    ? Number(CONFIG.temperature)
    : 0.8,
  cancelShortcut: "Ctrl+.",
  homeShortcut: "Alt+H",
  newCharacterShortcut: "Alt+N",
  globalPromptTemplate: "Stay in character and respond naturally.",
  summarySystemPrompt: "You are a helpful summarization assistant.",
  personaInjectionTemplate:
    "\n\n## Active User Persona\nName: {{name}}\nDescription: {{description}}",
  personaInjectionWhen: "always",
  markdownCustomCss:
    ".md-em { color: #e6d97a; font-style: italic; }\n.md-strong { color: #ffd27d; font-weight: 700; }\n.md-blockquote { color: #aab6cf; font-size: 0.9em; border-left: 3px solid #4a5d7f; padding-left: 10px; }",
  postprocessRulesJson: "[]",
  shortcutsRaw: "",
  tagsInitialized: false,
  customTags: [],
  modelPricingFilter: "free",
  modelModalityFilter: "text-only",
  modelSortOrder: "created_desc",
  toastDurationMs: 2600,
};

const UI_LANG_OPTIONS = ["en", "fr", "it", "de", "es", "pt-BR"];
const LOCALES_BASE_PATH = "locales";

const I18N = {
  en: {
    threads: "Threads",
    createCharacter: "+ Character",
    importCharacter: "Import Character",
    settings: "Settings",
    home: "HOME",
    database: "Database",
    personas: "Personas",
    loreBooks: "Lore Books",
    shortcuts: "Shortcuts",
    tags: "Tags",
    guide: "Guide",
    databaseManagement: "Database Management",
    exportDatabase: "Export Database",
    importDatabase: "Import Database",
    databaseHint:
      "Import will overwrite the current local data (characters, threads, settings, UI state, and more).",
    back: "Back",
    previousPrompts: "Previous prompts",
    send: "Send",
    cancel: "Cancel",
    hideShortcuts: "Hide Shortcuts",
    showShortcuts: "Show Shortcuts",
    autoReply: "Auto-reply",
    enterToSend: "ENTER to send",
    settingsTitle: "Settings",
    tabAppearance: "Appearance",
    tabApi: "API",
    tabTts: "TTS",
    tabThreads: "Threads",
    tabShortcuts: "Shortcuts",
    tabPrompting: "Prompting",
    togglePane: "Toggle pane",
    clear: "Clear",
    filterByTag: "Filter by tag",
    characterOrdering: "Character ordering",
    lastModifiedNewest: "Last Modified: Newest",
    lastModifiedOldest: "Last Modified: Oldest",
    threadsMost: "Threads: Most",
    threadsLeast: "Threads: Least",
    tagFiltersActive: "Tag filters active.",
    editCurrentCharacter: "Edit current character",
    scrollToBottom: "Scroll to bottom",
    promptHistory: "Prompt history",
    promptPlaceholder: "What do you say or do? Enter to send, Shift+Enter for newline",
    selectedPersonaAvatar: "Persona avatar",
    selectPersona: "Select persona",
    confirm: "Confirm",
    ok: "OK",
    message: "Message",
    input: "Input",
    value: "Value",
    save: "Save",
    unknownError: "unknown error",
    importFailed: "Import failed: {error}",
    databaseImportConfirm:
      "This will overwrite current local data completely. Continue?",
    databaseExportFailed: "Database export failed: {error}",
    databaseImportFailed: "Database import failed: {error}",
    shortcutsSaved: "Shortcuts saved.",
    tagsUpdated: "Tags updated.",
    characterUpdated: "Character updated.",
    characterCreated: "Character created.",
    characterDuplicated: "Character duplicated.",
    characterDeleted: "Character deleted.",
    characterNotFound: "Character not found.",
    characterExported: "Character exported.",
    characterImported: "Character imported.",
    personaUpdated: "Persona updated.",
    personaCreated: "Persona created.",
    personaDeleted: "Persona deleted.",
    defaultPersonaUpdated: "Default persona updated.",
    loreImportSoon: "Lore Book import will be added soon.",
    loreExportSoon: "Lore Book export will be added soon.",
    loreUpdated: "Lore Book updated.",
    loreCreated: "Lore Book created.",
    loreDuplicated: "Lore Book duplicated.",
    loreDeleted: "Lore Book deleted.",
    databaseExported: "Database exported.",
    databaseImportedReloading: "Database imported. Reloading...",
    threadCreated: "Thread created.",
    threadDuplicated: "Thread duplicated.",
    threadFavorited: "Thread favorited.",
    threadUnfavorited: "Thread unfavorited.",
    threadDeleted: "Thread deleted.",
    threadRenamed: "Thread renamed.",
    generationCancelled: "Generation cancelled.",
    generationFailed: "Generation failed.",
    regenerationCancelled: "Regeneration cancelled.",
    messageCopied: "Message copied.",
    missingFieldTitle: "Missing Field",
    invalidFileTitle: "Invalid File",
    pleaseChooseImageFile: "Please choose an image file.",
    dropFailedTitle: "Drop Failed",
    dropReadFailed: "Unable to read dropped file as text.",
    loadedFileIntoField: "Loaded {name} into field.",
    messageUpdated: "Message updated.",
    openThreadFirst: "Open a thread first.",
    ttsAssistantOnly: "TTS is only available for assistant messages.",
    messageEmpty: "Message is empty.",
    ttsFailed: "TTS failed: {error}",
    ttsTestFailed: "TTS test failed: {error}",
    personaSwitched: "Persona switched to {name}.",
    personaDescriptionTitle: "Persona Description",
    personaDescriptionLimit: "Persona description must be 100 characters or less.",
    noPersonasYet: "No personas yet.",
    dragToReorder: "Drag to reorder",
    defaultSuffix: "Default",
    globalDefaultSuffix: "Global Default",
    useGlobalDefault: "Use global default",
    threadWord: "Thread",
    threadTitleDefault: "Thread {id}",
    threadTitleAtDate: "Thread {date}",
    createdAtLabel: "Created: {value}",
    updatedAtLabel: "Updated: {value}",
    characterIdThreadCount: "char #{id} - {count} threads",
    less: "less",
    more: "more...",
    noTagsMatched: "No characters match the active tag filters.",
    noCharactersStart: "No characters yet. Create one to begin.",
    selectAllThreads: "Select all threads",
    selectThread: "Select thread",
    deleteSelectedThreads: "Delete selected threads",
    deleteThreadsTitle: "Delete Threads",
    deleteSelectedThreadsConfirm: "Delete {count} selected thread{suffix}?",
    deletedThreadsToast: "{count} thread{suffix} deleted.",
    editThreadCharacter: "Edit thread character",
    deleteThreadAria: "Delete thread",
    duplicateThreadAria: "Duplicate thread",
    favoriteThread: "Favorite thread",
    unfavoriteThread: "Unfavorite thread",
    renameThreadAria: "Rename thread",
    deleteCharacterAria: "Delete character",
    duplicateCharacterAria: "Duplicate character",
    editCharacterAria: "Edit character",
    exportCharacterAria: "Export character",
    deletePersonaTitle: "Delete Persona",
    deletePersonaConfirm: "Delete this persona?",
    editPersonaAria: "Edit persona",
    deleteLoreBookTitle: "Delete Lore Book",
    deleteThreadTitle: "Delete Thread",
    deleteThreadConfirm: "Delete this thread?",
    editLoreBookAria: "Edit lore book",
    deleteLoreBookAria: "Delete lore book",
    invalidLoreBookTitle: "Invalid Lore Book",
    invalidLoreEntryTitle: "Invalid Lore Entry",
    loreAtLeastOneEntry: "At least one lore entry is required.",
    invalidInitialMessagesTitle: "Invalid Initial Messages",
    invalidInitialMessagesMessage: "Could not parse initial messages.",
    characterNameRequired: "Character name is required.",
    personaNameRequired: "Persona name is required.",
    threadTitleRequired: "Thread title is required.",
    renameThreadTitle: "Rename Thread",
    threadTitleLabel: "Thread Title",
    updatePersona: "Update Persona",
    regenerateFailedTitle: "Regenerate Failed",
    copyFailedTitle: "Copy Failed",
    copyFailedMessage: "Unable to copy message.",
    autoTtsEnabled: "Auto TTS enabled.",
    autoTtsDisabled: "Auto TTS disabled.",
    autoTtsTitleOn: "Auto TTS: On",
    autoTtsTitleOff: "Auto TTS: Off",
    enableAutoTtsAria: "Enable auto TTS",
    disableAutoTtsAria: "Disable auto TTS",
    threadBudgetUnavailable: "Thread budget unavailable.",
    settingsTtsTestTitle: "Play TTS Test",
    msgDeleteTitle: "Delete message",
    msgRegenerateTitle: "Regenerate message",
    msgEditTitle: "Edit message",
    msgCopyTitle: "Copy message",
    msgMetadataTitle: "Message metadata",
    msgContextTitle: "Message context",
    msgSpeakTitle: "Speak message",
    msgSpeakCancelTitle: "Cancel speech",
    msgSpeakLoadingTitle: "Loading speech... Click again to cancel.",
    msgVoiceUnavailableTitle:
      "Voice support is not configured in this browser.",
    msgVoiceUnavailableAria: "Voice support unavailable",
    msgMetadataUnavailableEdited:
      "Metadata is not available in user edited messages.",
    msgMetadataUnavailableEditedAria:
      "Metadata unavailable for user edited message",
    msgMetadataUnavailableInitial:
      "Metadata is not available for initial messages.",
    msgMetadataUnavailableInitialAria:
      "Metadata unavailable for initial message",
    msgMetadataUnavailableGenerating:
      "Metadata unavailable while generating.",
    msgMetadataUnavailableGeneratingAria:
      "Metadata unavailable while generating",
    threadBudgetTooltip:
      "Estimated effective output budget for this thread.\nUser max: {userMax}\nModel context: {contextText}\nEstimated prompt tokens: {promptTokens}\nSafety margin: 256\nEffective max_tokens: {effectiveMax}",
    generationQueuedToast: "Generation queued (position {position}).",
    generationQueuedNotice:
      "Generation queued. Waiting for active generation.",
    generationQueuedNoticeWithPos:
      "Generation queued. Waiting for active generation (queue position {position}).",
    guideComingSoon: "Guide will be added soon.",
    queuedLabel: "Queued {position}/{size}",
    generatingLabel: "Generating...",
    regeneratingLabel: "Regenerating...",
    truncatedMessageLine1:
      "This message has been truncated by the currently active model.",
    truncatedMessageLine2:
      "You can delete or regenerate this message. You can also trigger another model response, or send a new message.",
    generationErrorLine1: "Generation failed for this message.",
    generationErrorLine3:
      "You can regenerate this message, switch model, or continue the chat.",
    threadQueueBadgeTitle: "Queued for generation (position {position})",
    openRouterApiKey: "OpenRouter API Key",
    modelLabel: "Model",
    pricingLabel: "Pricing",
    modalityLabel: "Modality",
    orderLabel: "Order",
    all: "All",
    free: "Free",
    paid: "Paid",
    textToText: "Text -> Text",
    nameAsc: "Name A-Z",
    nameDesc: "Name Z-A",
    createdNewest: "Created Newest",
    createdOldest: "Created Oldest",
    reload: "Reload",
    modelNotRecommendedRoleplay: "This model is NOT recommended for roleplaying.",
    maxTokensLabel: "Max Tokens",
    temperatureLabel: "Temperature",
    toastDelayLabel: "Toast Delay",
    ttsTestTextLabel: "TTS Test Text",
    playTtsTest: "Play TTS Test",
    renderMarkdown: "Render Markdown in messages",
    allowRawHtml: "Allow raw HTML in messages",
    streamMessages: "Stream Messages",
    autoPairSymbols: "Auto-pair editor symbols",
    markdownCustomCss: "Markdown Custom CSS",
    postprocessRules: "Post-processing Rules (JSON)",
    cancelGenerationShortcut: "Cancel Generation Shortcut",
    goHomeShortcut: "Go Home Shortcut",
    newCharacterShortcut: "New Character Shortcut",
    defaultCharacterPrompt: "Default Character Prompt",
    memorySummarizerPrompt: "Memory Summarizer System Prompt",
    personaInjectionTemplate: "Persona Injection Template",
    personaInjectionTiming: "Persona Injection Timing",
    always: "Always",
    onPersonaChange: "On Persona Change (first message always injects)",
    nameLabel: "Name",
    avatarUrl: "Avatar URL",
    avatarFile: "Avatar File",
    personaDescription: "Description (max 100 chars)",
    personaInternalDescription: "Internal Description (optional)",
    setDefaultPersona: "Set as default persona",
    savePersona: "Save Persona",
    loreBookManagement: "Lore Book Management",
    createLoreBook: "+ Create Lore Book",
    importLoreBook: "↥ Import Lore Book",
    backToList: "← Back to List",
    avatarUrlOptional: "Avatar URL (optional)",
    descriptionOptional: "Description (optional)",
    scanDepth: "Scan Depth",
    tokenBudget: "Token Budget",
    recursiveScanning: "Recursive Scanning",
    addEntry: "+ Add Entry",
    saveLoreBook: "Save Lore Book",
    shortcutEntries: "Shortcut Entries",
    saveShortcuts: "Save Shortcuts",
    tagManager: "Tag Manager",
    tagInputPlaceholder: "New tag",
    removeTagTitle: "Remove Tag",
    removeTagConfirmSimple: "Remove this tag?",
    removeTagAffectsChars: "Removing this tag will update these characters:\n\n{list}{extra}\n\nContinue?",
    createCharacterTitle: "Create Character",
    editCharacterTitle: "Edit Character",
    characterPrompt: "Character Prompt",
    defaultPersonaOverride: "Default User Persona Override (Character-only)",
    oneTimeExtraPrompt: "One-time only Extra System/Character Prompt",
    writingInstructions: "Writing Instructions",
    initialMessages: "Initial Messages",
    tagsCommaSeparated: "Tags (comma-separated)",
    personaInjectionPlacement: "Persona Injection Placement",
    atEndCharacterPrompt: "At End of Character Prompt",
    enableMemory: "Enable Memory",
    enablePostprocess: "Enable Post-processing Rules",
    autoTriggerAiFirst: "Auto-trigger AI first message",
    avatarScaleInChat: "Avatar Scale (In Chat)",
    ttsLanguage: "TTS Language",
    ttsVoice: "TTS Voice",
    ttsRate: "TTS Rate",
    ttsPitch: "TTS Pitch",
    testCharacterVoice: "Test Character Voice",
    loreBooksForCharacter: "Lore Books for this character",
    createdLabel: "Created",
    updatedLabel: "Updated",
    threadsLower: "threads",
    charPrefix: "char",
    noCharactersMatchTags: "No characters match the active tag filters.",
    noCharactersYet: "No characters yet. Create one to begin.",
    noThreadsYet: "No threads yet.",
    languageLabel: "Interface Language",
    languageAuto: "Auto (browser)",
    languageEnglish: "English",
    languageFrench: "Français",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "Español",
    languagePortugueseBr: "Português (Brasil)",
  },
  fr: {
    threads: "Fils",
    createCharacter: "+ Personnage",
    importCharacter: "Importer personnage",
    settings: "Paramètres",
    personas: "Personas",
    loreBooks: "Livres de lore",
    shortcuts: "Raccourcis",
    back: "Retour",
    previousPrompts: "Prompts précédents",
    send: "Envoyer",
    cancel: "Annuler",
    hideShortcuts: "Masquer raccourcis",
    showShortcuts: "Afficher raccourcis",
    autoReply: "Réponse auto",
    enterToSend: "ENTRÉE pour envoyer",
    settingsTitle: "Paramètres",
    languageLabel: "Langue de l'interface",
    languageAuto: "Auto (navigateur)",
    languageEnglish: "English",
    languageFrench: "Français",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "Español",
    languagePortugueseBr: "Português (Brasil)",
  },
  it: {
    threads: "Thread",
    createCharacter: "+ Personaggio",
    importCharacter: "Importa personaggio",
    settings: "Impostazioni",
    personas: "Persona",
    loreBooks: "Libri lore",
    shortcuts: "Scorciatoie",
    back: "Indietro",
    previousPrompts: "Prompt precedenti",
    send: "Invia",
    cancel: "Annulla",
    hideShortcuts: "Nascondi scorciatoie",
    showShortcuts: "Mostra scorciatoie",
    autoReply: "Risposta automatica",
    enterToSend: "INVIO per inviare",
    settingsTitle: "Impostazioni",
    languageLabel: "Lingua interfaccia",
    languageAuto: "Auto (browser)",
    languageEnglish: "English",
    languageFrench: "Français",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "Español",
    languagePortugueseBr: "Português (Brasil)",
  },
  de: {
    threads: "Threads",
    createCharacter: "+ Charakter",
    importCharacter: "Charakter importieren",
    settings: "Einstellungen",
    personas: "Personas",
    loreBooks: "Lore-Bücher",
    shortcuts: "Shortcuts",
    back: "Zurück",
    previousPrompts: "Vorherige Prompts",
    send: "Senden",
    cancel: "Abbrechen",
    hideShortcuts: "Shortcuts ausblenden",
    showShortcuts: "Shortcuts anzeigen",
    autoReply: "Auto-Antwort",
    enterToSend: "ENTER zum Senden",
    settingsTitle: "Einstellungen",
    languageLabel: "Sprache",
    languageAuto: "Auto (Browser)",
    languageEnglish: "English",
    languageFrench: "Français",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "Español",
    languagePortugueseBr: "Português (Brasil)",
  },
  es: {
    threads: "Hilos",
    createCharacter: "+ Personaje",
    importCharacter: "Importar personaje",
    settings: "Configuración",
    personas: "Personas",
    loreBooks: "Libros de lore",
    shortcuts: "Atajos",
    back: "Volver",
    previousPrompts: "Prompts anteriores",
    send: "Enviar",
    cancel: "Cancelar",
    hideShortcuts: "Ocultar atajos",
    showShortcuts: "Mostrar atajos",
    autoReply: "Respuesta automática",
    enterToSend: "ENTER para enviar",
    settingsTitle: "Configuración",
    languageLabel: "Idioma de interfaz",
    languageAuto: "Auto (navegador)",
    languageEnglish: "English",
    languageFrench: "Français",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "Español",
    languagePortugueseBr: "Português (Brasil)",
  },
  "pt-BR": {
    threads: "Conversas",
    createCharacter: "+ Personagem",
    importCharacter: "Importar personagem",
    settings: "Configurações",
    personas: "Personas",
    loreBooks: "Livros de lore",
    shortcuts: "Atalhos",
    back: "Voltar",
    previousPrompts: "Prompts anteriores",
    send: "Enviar",
    cancel: "Cancelar",
    hideShortcuts: "Ocultar atalhos",
    showShortcuts: "Mostrar atalhos",
    autoReply: "Resposta automática",
    enterToSend: "ENTER para enviar",
    settingsTitle: "Configurações",
    languageLabel: "Idioma da interface",
    languageAuto: "Automático (navegador)",
    languageEnglish: "English",
    languageFrench: "Français",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "Español",
    languagePortugueseBr: "Português (Brasil)",
  },
};

const DEFAULT_TTS_VOICE = "Joanna";
const DEFAULT_TTS_LANGUAGE = "en-US";
const PREDEFINED_CHARACTER_TAGS = [
  "Female",
  "Male",
  "Human",
  "Roleplay",
  "Hero",
  "Villain",
  "Politics",
  "Princess",
  "Prince",
  "Mermaid",
  "NSFW",
  "NSFL",
  "Disney",
  "Cartoon",
  "Movies & TV",
  "Games",
  "Multiple Characters",
  "Slice of Life",
  "Experimental",
  "Psychological",
  "College",
  "High School",
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Horror",
  "Adventure",
  "Comedy",
  "Drama",
  "Historical",
  "Mystery",
  "Action",
  "Cyberpunk",
  "Medieval",
  "Modern",
  "Anime",
  "Supernatural",
  "Crime",
  "Detective",
  "Military",
  "Space",
];

const state = {
  settings: { ...DEFAULT_SETTINGS },
  localeBundles: {},
  i18nLang: "en",
  shortcutsVisible: true,
  editingCharacterId: null,
  editingPersonaId: null,
  activeModalId: null,
  promptHistoryOpen: false,
  chatAutoScroll: true,
  lastTapAt: 0,
  sending: false,
  lastUsedModel: "",
  lastUsedProvider: "",
  draggingPersonaId: null,
  tabId: `tab-${Math.random().toString(36).slice(2)}`,
  syncChannel: null,
  syncTimerId: null,
  lastSyncSeenUpdatedAt: 0,
  confirmResolver: null,
  textInputResolver: null,
  confirmMode: "confirm",
  activeShortcut: null,
  abortController: null,
  tts: {
    audio: null,
    speakingMessageIndex: null,
    loadingMessageIndex: null,
    requestSeq: 0,
    activeRequestId: 0,
    voiceSupportReady: false,
  },
  editingMessageIndex: null,
  pendingPersonaInjectionPersonaId: null,
  activeGenerationThreadId: null,
  generationQueue: [],
  selectedThreadIds: new Set(),
  characterTagFilters: [],
  characterSortMode: "updated_desc",
  expandedCharacterTagIds: new Set(),
  modalDirty: {
    "character-modal": false,
    "personas-modal": false,
    "shortcuts-modal": false,
    "tags-modal": false,
    "lore-modal": false,
  },
  charModalTtsTestPlaying: false,
  imagePreview: {
    scale: 1,
    minScale: 0.2,
    maxScale: 6,
    src: "",
    panX: 0,
    panY: 0,
    panning: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  },
  lore: {
    editingId: null,
    entries: [],
  },
  modelCatalog: [],
  modelLoad: {
    controller: null,
    requestId: 0,
  },
  budgetIndicator: {
    timerId: null,
    seq: 0,
  },
  renderThreadsSeq: 0,
};

const TTS_DEBUG = true;

function ttsDebug(...args) {
  if (!TTS_DEBUG) return;
  console.debug("[TTS]", ...args);
}

function makeTtsCancelledError(message = "TTS cancelled.") {
  const err = new Error(message);
  err.name = "TtsCancelledError";
  return err;
}

function isTtsCancelledError(error) {
  return error?.name === "TtsCancelledError";
}

window.addEventListener("DOMContentLoaded", init);

async function init() {
  loadSettings();
  ensureTagCatalogInitialized();
  await applyInterfaceLanguage();
  loadUiState();
  renderTagPresetsDataList();
  await setupSettingsControls();
  setupEvents();
  initBrowserTtsSupport();
  updateModelPill();
  await migrateLegacySessions();
  await hydrateGenerationQueue();
  await ensurePersonasInitialized();
  await renderAll();
  setupCrossWindowSync();
  applyMarkdownCustomCss();
  renderCharacterTagFilterChips();
  updateThreadRenameButtonState();
  updateScrollBottomButtonVisibility();
}

async function hydrateGenerationQueue() {
  const threads = await db.threads.toArray();
  state.generationQueue = threads
    .filter((t) => String(t.pendingGenerationReason || "").trim())
    .sort(
      (a, b) =>
        Number(a.pendingGenerationQueuedAt || 0) -
        Number(b.pendingGenerationQueuedAt || 0),
    )
    .map((t) => Number(t.id))
    .filter(Number.isInteger);
}

function ensureTagCatalogInitialized() {
  if (state.settings.tagsInitialized === true) return;
  state.settings.customTags = [...PREDEFINED_CHARACTER_TAGS];
  state.settings.tagsInitialized = true;
  saveSettings();
}

function t(key) {
  const lang = state.i18nLang in I18N ? state.i18nLang : "en";
  const dynamic = state.localeBundles?.[lang]?.[key];
  if (dynamic != null) return dynamic;
  return I18N[lang]?.[key] || I18N.en[key] || key;
}

function tf(key, vars = {}) {
  let text = String(t(key));
  Object.entries(vars || {}).forEach(([name, value]) => {
    text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value ?? ""));
  });
  return text;
}

async function loadLocaleBundle(lang) {
  const resolved = UI_LANG_OPTIONS.includes(lang) ? lang : "en";
  if (state.localeBundles[resolved]) return state.localeBundles[resolved];
  try {
    const res = await fetch(
      `${LOCALES_BASE_PATH}/${encodeURIComponent(resolved)}.json`,
      { cache: "no-cache" },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.localeBundles[resolved] =
      data && typeof data === "object" ? data : {};
  } catch {
    state.localeBundles[resolved] = {};
  }
  return state.localeBundles[resolved];
}

function normalizeUiLanguageCode(value) {
  const raw = String(value || "").trim();
  if (!raw) return "en";
  if (raw.toLowerCase().startsWith("pt-br")) return "pt-BR";
  const base = raw.split("-")[0].toLowerCase();
  if (base === "en") return "en";
  if (base === "fr") return "fr";
  if (base === "it") return "it";
  if (base === "de") return "de";
  if (base === "es") return "es";
  if (base === "pt") return "pt-BR";
  return "en";
}

function resolveInterfaceLanguage() {
  const chosen = String(state.settings.uiLanguage || "auto");
  if (chosen !== "auto" && UI_LANG_OPTIONS.includes(chosen)) return chosen;
  const browserLang =
    typeof navigator !== "undefined"
      ? navigator.language || navigator.userLanguage || "en"
      : "en";
  return normalizeUiLanguageCode(browserLang);
}

function updateCheckboxLabelText(inputId, text) {
  const input = document.getElementById(inputId);
  const label = input?.closest("label");
  if (!input || !label) return;
  const nodes = Array.from(label.childNodes).filter(
    (n) => n.nodeType === Node.TEXT_NODE,
  );
  if (nodes.length === 0) {
    label.appendChild(document.createTextNode(` ${text}`));
    return;
  }
  nodes[nodes.length - 1].nodeValue = ` ${text}`;
}

async function applyInterfaceLanguage() {
  state.i18nLang = resolveInterfaceLanguage();
  await loadLocaleBundle(state.i18nLang);
  applyDataI18n();

  const paneCollapsed = document
    .getElementById("left-pane")
    ?.classList.contains("collapsed");
  const createBtn = document.getElementById("create-character-btn");
  if (createBtn && !paneCollapsed) {
    createBtn.textContent = t("createCharacter");
  }
  const homeBtn = document.getElementById("home-btn");
  if (homeBtn) {
    homeBtn.textContent = paneCollapsed ? "H" : t("home");
    homeBtn.title = paneCollapsed ? t("home") : "";
  }
  const importBtn = document.getElementById("import-character-btn");
  if (importBtn) {
    importBtn.textContent = paneCollapsed
      ? "↥"
      : `↥ ${t("importCharacter")}`;
  }

  const bottomButtons = document.querySelectorAll(".pane-bottom .option-btn");
  if (bottomButtons[0]) {
    bottomButtons[0].title = t("settings");
    bottomButtons[0].setAttribute("aria-label", t("settings"));
  }
  if (bottomButtons[1]) {
    bottomButtons[1].title = t("personas");
    bottomButtons[1].setAttribute("aria-label", t("personas"));
  }
  if (bottomButtons[2]) {
    bottomButtons[2].title = t("loreBooks");
    bottomButtons[2].setAttribute("aria-label", t("loreBooks"));
  }
  if (bottomButtons[3]) {
    bottomButtons[3].title = t("shortcuts");
    bottomButtons[3].setAttribute("aria-label", t("shortcuts"));
  }
  if (bottomButtons[4]) {
    bottomButtons[4].title = t("tags");
    bottomButtons[4].setAttribute("aria-label", t("tags"));
  }
  if (bottomButtons[5]) {
    bottomButtons[5].title = t("database");
    bottomButtons[5].setAttribute("aria-label", t("database"));
  }
  if (bottomButtons[6]) {
    bottomButtons[6].title = t("guide");
    bottomButtons[6].setAttribute("aria-label", t("guide"));
  }

  if (homeBtn && !document.getElementById("left-pane")?.classList.contains("collapsed")) {
    homeBtn.textContent = t("home");
  }
  const popTitle = document.querySelector(".popover-title");
  if (popTitle) popTitle.textContent = t("previousPrompts");
  const sendBtn = document.getElementById("send-btn");
  if (sendBtn && !state.sending) sendBtn.textContent = t("send");
  const shortcutsToggle = document.getElementById("shortcuts-toggle-btn");
  if (shortcutsToggle) {
    shortcutsToggle.textContent = state.shortcutsVisible
      ? t("hideShortcuts")
      : t("showShortcuts");
  }
  updateCheckboxLabelText("auto-reply-enabled", t("autoReply"));
  updateCheckboxLabelText("enter-to-send-enabled", t("enterToSend"));

  const settingsTitle = document.getElementById("settings-title");
  if (settingsTitle) settingsTitle.textContent = t("settingsTitle");
  const dbTitle = document.getElementById("database-title");
  if (dbTitle) dbTitle.textContent = t("databaseManagement");
  const dbExport = document.getElementById("export-db-btn");
  if (dbExport) dbExport.textContent = t("exportDatabase");
  const dbImport = document.getElementById("import-db-btn");
  if (dbImport) dbImport.textContent = t("importDatabase");
  const dbHint = document.getElementById("database-hint");
  if (dbHint) dbHint.textContent = t("databaseHint");
  const ttsTestBtn = document.getElementById("tts-test-play-btn");
  if (ttsTestBtn) {
    ttsTestBtn.textContent = t("playTtsTest");
    ttsTestBtn.setAttribute("title", t("settingsTtsTestTitle"));
    ttsTestBtn.setAttribute("aria-label", t("settingsTtsTestTitle"));
  }
}

function setupEvents() {
  document
    .getElementById("create-character-btn")
    .addEventListener("click", () => openCharacterModal());
  document
    .getElementById("import-character-btn")
    .addEventListener("click", () =>
      document.getElementById("import-character-input").click(),
    );
  document
    .getElementById("import-character-input")
    .addEventListener("change", importCharacterFromFile);
  document
    .getElementById("export-db-btn")
    .addEventListener("click", exportDatabaseBackup);
  document
    .getElementById("import-db-btn")
    .addEventListener("click", () =>
      document.getElementById("import-db-input").click(),
    );
  document
    .getElementById("import-db-input")
    .addEventListener("change", importDatabaseBackupFromFile);
  document
    .getElementById("guide-btn")
    ?.addEventListener("click", () => showToast(t("guideComingSoon"), "success"));
  document
    .getElementById("save-character-btn")
    .addEventListener("click", saveCharacterFromModal);
  document
    .getElementById("char-tts-test-btn")
    .addEventListener("click", playCharacterTtsTestFromModal);
  updateCharTtsTestButtonState();
  document.getElementById("send-btn").addEventListener("click", sendMessage);
  document
    .getElementById("shortcuts-toggle-btn")
    .addEventListener("click", toggleShortcutsVisibility);
  document
    .getElementById("home-btn")
    .addEventListener("click", showMainView);
  document
    .getElementById("rename-thread-btn")
    .addEventListener("click", renameCurrentThread);
  document
    .getElementById("scroll-bottom-btn")
    .addEventListener("click", () => scrollChatToBottom(true));
  document
    .getElementById("image-preview-download-btn")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      downloadImagePreview();
    });
  document
    .getElementById("image-preview-img")
    .addEventListener("wheel", onImagePreviewWheel, { passive: false });
  document
    .getElementById("image-preview-img")
    .addEventListener("dragstart", (e) => e.preventDefault());
  document
    .getElementById("image-preview-img")
    .addEventListener("pointerdown", onImagePreviewPointerDown);
  document
    .getElementById("image-preview-img")
    .addEventListener("pointermove", onImagePreviewPointerMove);
  document
    .getElementById("image-preview-img")
    .addEventListener("pointerup", onImagePreviewPointerEnd);
  document
    .getElementById("image-preview-img")
    .addEventListener("pointercancel", onImagePreviewPointerEnd);
  document
    .getElementById("image-preview-img")
    .addEventListener("dblclick", (e) => {
      e.preventDefault();
      resetImagePreviewZoom();
    });
  document.getElementById("pane-toggle").addEventListener("click", togglePane);
  document.getElementById("edit-current-character-btn").innerHTML = ICONS.edit;
  document.getElementById("auto-tts-toggle-btn").innerHTML = ICONS.speaker;
  document
    .getElementById("edit-current-character-btn")
    .addEventListener("click", () => {
      if (!currentCharacter) return;
      openCharacterModal(currentCharacter);
    });
  document
    .getElementById("auto-tts-toggle-btn")
    .addEventListener("click", toggleThreadAutoTts);
  document
    .getElementById("char-avatar-file")
    .addEventListener("change", onAvatarFileChange);
  document
    .getElementById("char-avatar")
    .addEventListener("input", onAvatarUrlInput);
  ["char-system-prompt", "char-one-time-extra-prompt", "char-initial-messages"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("dragover", onTextAreaFileDragOver);
      el.addEventListener("drop", onTextAreaFileDrop);
    },
  );
  document
    .getElementById("char-tags-input")
    .addEventListener("input", renderCharacterTagPresetButtons);
  document
    .getElementById("char-avatar-preview")
    .addEventListener("click", () => {
      const src = document.getElementById("char-avatar-preview")?.src || "";
      if (src) openImagePreview(src);
    });
  document
    .getElementById("char-tts-language")
    .addEventListener("change", () => populateCharTtsVoiceSelect());
  document
    .getElementById("char-tts-rate")
    .addEventListener("input", updateCharTtsRatePitchLabels);
  document
    .getElementById("char-tts-pitch")
    .addEventListener("input", updateCharTtsRatePitchLabels);
  document
    .getElementById("save-persona-btn")
    .addEventListener("click", savePersonaFromModal);
  document
    .getElementById("persona-avatar-file")
    .addEventListener("change", onPersonaAvatarFileChange);
  document
    .getElementById("persona-select")
    .addEventListener("change", onPersonaSelectChange);
  document
    .getElementById("persona-selected-avatar")
    .addEventListener("click", () => {
      const src =
        document.getElementById("persona-selected-avatar")?.src || "";
      if (src) openImagePreview(src);
    });
  document.getElementById("char-name").addEventListener("input", () => {
    updateNameLengthCounter("char-name", "char-name-count", 128);
  });
  document.getElementById("persona-name").addEventListener("input", () => {
    updateNameLengthCounter("persona-name", "persona-name-count", 64);
  });
  document.getElementById("persona-description").addEventListener("input", () => {
    updateNameLengthCounter("persona-description", "persona-description-count", 100);
  });
  const addTagBtn = document.getElementById("character-tag-filter-add");
  if (addTagBtn) {
    addTagBtn.addEventListener("click", addCharacterTagFilterFromInput);
  }
  document
    .getElementById("character-tag-filter-input")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCharacterTagFilterFromInput();
      }
    });
  document
    .getElementById("character-tag-filter-input")
    .addEventListener("change", addCharacterTagFilterFromInput);
  document
    .getElementById("character-tag-filter-clear")
    .addEventListener("click", async () => {
      state.characterTagFilters = [];
      state.expandedCharacterTagIds.clear();
      saveUiState();
      renderCharacterTagFilterChips();
      await renderCharacters();
    });
  document
    .getElementById("character-sort-select")
    .addEventListener("change", async (e) => {
      state.characterSortMode = String(e.target.value || "updated_desc");
      saveUiState();
      await renderCharacters();
    });
  document
    .getElementById("save-shortcuts-btn")
    .addEventListener("click", saveShortcutsFromModal);
  document.getElementById("add-tag-btn").addEventListener("click", addTagFromManagerInput);
  document.getElementById("tag-manager-input").addEventListener("input", updateTagManagerAddButtonState);
  document.getElementById("tag-manager-input").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!document.getElementById("add-tag-btn").disabled) {
      addTagFromManagerInput().catch(() => {});
    }
  });
  document
    .getElementById("create-lorebook-btn")
    .addEventListener("click", () => openLoreEditor());
  document
    .getElementById("import-lorebook-btn")
    .addEventListener("click", () => {
      showToast(t("loreImportSoon"), "success");
    });
  document
    .getElementById("lore-editor-back-btn")
    .addEventListener("click", closeLoreEditor);
  document
    .getElementById("cancel-lore-editor-btn")
    .addEventListener("click", closeLoreEditor);
  document
    .getElementById("add-lore-entry-btn")
    .addEventListener("click", () => {
      addLoreEntryEditor();
      renderLoreEntryEditors();
    });
  document
    .getElementById("save-lorebook-btn")
    .addEventListener("click", saveLorebookFromEditor);
  document
    .getElementById("confirm-yes-btn")
    .addEventListener("click", () => resolveConfirmDialog(true));
  document
    .getElementById("confirm-no-btn")
    .addEventListener("click", () => resolveConfirmDialog(false));
  document
    .getElementById("confirm-cancel-btn")
    .addEventListener("click", () => resolveConfirmDialog(false));
  document
    .getElementById("text-input-save")
    .addEventListener("click", () => resolveTextInputDialog(true));
  document
    .getElementById("text-input-cancel")
    .addEventListener("click", () => resolveTextInputDialog(false));
  document
    .getElementById("text-input-cancel-x")
    .addEventListener("click", () => resolveTextInputDialog(false));

  const input = document.getElementById("user-input");
  const chatLog = document.getElementById("chat-log");
  input.addEventListener("keydown", onInputKeyDown);
  input.addEventListener("input", () => {
    if (state.promptHistoryOpen) closePromptHistory();
    if (
      state.activeShortcut &&
      input.value !== state.activeShortcut.initialValue
    ) {
      state.activeShortcut = null;
    }
    scheduleThreadBudgetIndicatorUpdate();
  });
  input.addEventListener("click", () => {
    if (state.promptHistoryOpen) closePromptHistory();
  });
  input.addEventListener("dblclick", openPromptHistory);
  input.addEventListener("pointerup", onInputPointerUp);
  chatLog.addEventListener("scroll", () => {
    if (state.sending) {
      state.chatAutoScroll = isChatNearBottom();
    }
    updateScrollBottomButtonVisibility();
  });
  window.addEventListener("resize", () => {
    if (state.promptHistoryOpen) positionPromptHistoryPopover();
  });
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      if (state.promptHistoryOpen) positionPromptHistoryPopover();
    });
    ro.observe(input);
  }

  document.addEventListener("click", onGlobalClick);
  document.addEventListener("keydown", onGlobalKeyDown);

  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.openModal));
  });

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", closeActiveModal);
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target !== modal) return;
      if (modal.id === "image-preview-modal") {
        closeImagePreview();
      } else if (modal.id === "confirm-modal") {
        resolveConfirmDialog(false);
      } else {
        closeActiveModal();
      }
    });
  });

  markModalDirtyOnInput("character-modal", [
    "#char-name",
    "#char-avatar",
    "#char-system-prompt",
    "#char-default-persona-override",
    "#char-one-time-extra-prompt",
    "#char-initial-messages",
    "#char-persona-injection-placement",
    "#char-use-memory",
    "#char-use-postprocess",
    "#char-auto-trigger-first-ai",
    "#char-avatar-scale",
    "#char-tags-input",
    "#char-tts-voice",
    "#char-tts-language",
    "#char-tts-rate",
    "#char-tts-pitch",
  ]);
  markModalDirtyOnInput("personas-modal", [
    "#persona-name",
    "#persona-avatar",
    "#persona-description",
    "#persona-internal-description",
    "#persona-is-default",
  ]);
  markModalDirtyOnInput("shortcuts-modal", ["#shortcuts-raw"]);
  markModalDirtyOnInput("lore-modal", [
    "#lore-name",
    "#lore-avatar",
    "#lore-description",
    "#lore-scan-depth",
    "#lore-token-budget",
    "#lore-recursive-scanning",
  ]);
  updateNameLengthCounter("char-name", "char-name-count", 128);
  updateNameLengthCounter("persona-name", "persona-name-count", 64);
  updateNameLengthCounter("persona-description", "persona-description-count", 100);
  updateToastDelayDisplay();
  setupSettingsTabsLayout();
}

function applyDataI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    el.setAttribute("placeholder", t(key));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (!key) return;
    const value = t(key);
    el.setAttribute("title", value);
    el.setAttribute("aria-label", value);
  });
}

function updateNameLengthCounter(inputId, counterId, maxLen = 128) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  if (!input || !counter) return;
  let value = String(input.value || "");
  if (value.length > maxLen) {
    value = value.slice(0, maxLen);
    input.value = value;
  }
  counter.textContent = `${value.length}/${maxLen}`;
}

function normalizeTagValue(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTagList(value) {
  return String(value || "")
    .split(",")
    .map((v) => normalizeTagValue(v))
    .filter(Boolean)
    .filter((v, i, arr) => arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);
}

function formatTagList(tags) {
  return (Array.isArray(tags) ? tags : []).map((t) => normalizeTagValue(t)).filter(Boolean).join(", ");
}

function normalizeInitialMessageRole(role) {
  const normalized = normalizeApiRole(role);
  if (
    normalized !== "system" &&
    normalized !== "user" &&
    normalized !== "assistant"
  ) {
    return null;
  }
  return normalized;
}

function parseInitialMessagesInput(raw) {
  const text = String(raw || "").trim();
  if (!text) return { raw: "", messages: [] };
  const parsedAsTagged = parseTaggedInitialMessages(text);
  if (parsedAsTagged.messages.length > 0) {
    return parsedAsTagged;
  }

  // Free-text fallback: no role tags found, treat everything as one assistant message.
  const singleAssistantFallback = () => ({
    raw: text,
    messages: [
      {
        role: "assistant",
        apiRole: "assistant",
        content: text,
      },
    ],
  });

  // Backward compatibility for old JSON-based initial message definitions.
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    return singleAssistantFallback();
  }
  const arr = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.messages)
      ? parsed.messages
      : null;
  if (!arr) {
    return singleAssistantFallback();
  }
  const messages = [];
  arr.forEach((entry, idx) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Initial message #${idx + 1} must be an object.`);
    }
    const role = normalizeInitialMessageRole(entry.role || entry.apiRole);
    if (!role) {
      throw new Error(
        `Initial message #${idx + 1} has invalid role. Use system, user, or assistant.`,
      );
    }
    const content = normalizeContentParts(entry.content);
    if (!String(content || "").trim()) return;
    messages.push({
      role,
      apiRole: role,
      content: String(content),
    });
  });
  return { raw: text, messages };
}

function serializeInitialMessages(messages) {
  const safe = (Array.isArray(messages) ? messages : []).map((m) => ({
    role: normalizeInitialMessageRole(m?.role || m?.apiRole) || "user",
    content: String(m?.content || ""),
  }));
  return JSON.stringify(safe, null, 2);
}

function parseTaggedInitialMessages(text) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const roleLinePattern =
    /^\s*\[(AI|BOT|ASSISTANT|USER|SYSTEM)\]\s*:?\s*(.*)$/i;
  const messages = [];
  const leadingLines = [];
  let sawRoleTag = false;
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    const content = current.lines.join("\n").trim();
    if (content) {
      messages.push({
        role: current.role,
        apiRole: current.role,
        content,
      });
    }
    current = null;
  };

  lines.forEach((line) => {
    const match = line.match(roleLinePattern);
    if (!match) {
      if (current) current.lines.push(line);
      else if (!sawRoleTag) leadingLines.push(line);
      return;
    }

    sawRoleTag = true;
    pushCurrent();
    const rawRole = String(match[1] || "").toLowerCase();
    const role =
      rawRole === "ai" || rawRole === "bot" || rawRole === "assistant"
        ? "assistant"
        : rawRole === "system"
          ? "system"
          : "user";
    current = {
      role,
      lines: [String(match[2] || "")],
    };
  });

  pushCurrent();
  const leadingContent = leadingLines.join("\n").trim();
  if (sawRoleTag && leadingContent) {
    messages.unshift({
      role: "assistant",
      apiRole: "assistant",
      content: leadingContent,
    });
  }
  return { raw: text, messages };
}

function formatInitialMessagesForEditor(messages) {
  const list = Array.isArray(messages) ? messages : [];
  if (list.length === 0) return "";
  return list
    .map((m) => {
      const role = normalizeApiRole(m?.apiRole || m?.role);
      const label =
        role === "assistant" ? "AI" : role === "system" ? "SYSTEM" : "USER";
      const content = String(m?.content || "");
      return `[${label}]: ${content}`;
    })
    .join("\n\n");
}

function replaceInitialMessagePlaceholders(content, personaName, charName) {
  return String(content || "")
    .replace(/\{\{\s*user\s*\}\}/gi, personaName || "You")
    .replace(/\{\{\s*char\s*\}\}/gi, charName || "Character");
}

async function buildThreadInitialMessages(character) {
  const source = Array.isArray(character?.initialMessages)
    ? character.initialMessages
    : [];
  const defaultPersona = await getCharacterDefaultPersona(character);
  const personaName = defaultPersona?.name || "You";
  const charName = character?.name || "Character";
  const now = Date.now();
  return source.map((m, i) => {
    const role = normalizeInitialMessageRole(m?.role || m?.apiRole) || "user";
    const content = replaceInitialMessagePlaceholders(
      String(m?.content || ""),
      personaName,
      charName,
    );
    const payload = {
      role,
      apiRole: role,
      content,
      createdAt: now + i,
      isInitial: true,
    };
    if (role === "user") {
      payload.senderName = personaName;
      payload.senderAvatar = defaultPersona?.avatar || "";
      payload.senderPersonaId = defaultPersona?.id || null;
    }
    return payload;
  });
}

function shouldAutoReplyFromInitialMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  const last = messages[messages.length - 1];
  return normalizeApiRole(last?.apiRole || last?.role) === "user";
}

function getAllAvailableTags() {
  const tags = (Array.isArray(state.settings.customTags)
    ? state.settings.customTags
    : []
  )
    .map((t) => normalizeTagValue(t))
    .filter(Boolean);
  return tags.filter(
    (t, i, arr) => arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i,
  );
}

function mergeTagsIntoCatalog(tags) {
  const incoming = (Array.isArray(tags) ? tags : [])
    .map((t) => normalizeTagValue(t))
    .filter(Boolean);
  if (incoming.length === 0) return false;
  const existing = Array.isArray(state.settings.customTags)
    ? state.settings.customTags.map((t) => normalizeTagValue(t)).filter(Boolean)
    : [];
  const lowerSet = new Set(existing.map((t) => t.toLowerCase()));
  let changed = false;
  incoming.forEach((tag) => {
    const lower = tag.toLowerCase();
    if (lowerSet.has(lower)) return;
    existing.push(tag);
    lowerSet.add(lower);
    changed = true;
  });
  if (!changed) return false;
  state.settings.customTags = existing;
  state.settings.tagsInitialized = true;
  saveSettings();
  return true;
}

function setCharacterTagsInputValue(tags) {
  const input = document.getElementById("char-tags-input");
  if (!input) return;
  input.value = formatTagList(tags);
}

function getCharacterTagsFromModal() {
  return parseTagList(document.getElementById("char-tags-input")?.value || "");
}

function renderTagPresetsDataList() {
  const dl = document.getElementById("tag-presets");
  if (!dl) return;
  dl.innerHTML = "";
  getAllAvailableTags().forEach((tag) => {
    const opt = document.createElement("option");
    opt.value = tag;
    dl.appendChild(opt);
  });
}

function toggleModalTag(tag) {
  const tags = getCharacterTagsFromModal();
  const lower = tag.toLowerCase();
  const exists = tags.some((t) => t.toLowerCase() === lower);
  const next = exists ? tags.filter((t) => t.toLowerCase() !== lower) : [...tags, tag];
  setCharacterTagsInputValue(next);
  renderCharacterTagPresetButtons();
}

function renderCharacterTagPresetButtons() {
  const container = document.getElementById("char-tags-presets");
  if (!container) return;
  const active = new Set(getCharacterTagsFromModal().map((t) => t.toLowerCase()));
  container.innerHTML = "";
  getAllAvailableTags().forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag-chip-btn";
    if (active.has(tag.toLowerCase())) btn.classList.add("active");
    btn.textContent = tag;
    btn.addEventListener("click", () => toggleModalTag(tag));
    container.appendChild(btn);
  });
}

function addCharacterTagFilterFromInput() {
  const input = document.getElementById("character-tag-filter-input");
  if (!input) return;
  const tag = normalizeTagValue(input.value);
  if (!tag) return;
  const exists = state.characterTagFilters.some((t) => t.toLowerCase() === tag.toLowerCase());
  if (!exists) state.characterTagFilters.push(tag);
  input.value = "";
  saveUiState();
  renderCharacterTagFilterChips();
  renderCharacters();
}

function removeCharacterTagFilter(tag) {
  const lower = String(tag || "").toLowerCase();
  state.characterTagFilters = state.characterTagFilters.filter((t) => t.toLowerCase() !== lower);
  saveUiState();
  renderCharacterTagFilterChips();
  renderCharacters();
}

function renderCharacterTagFilterChips() {
  const chips = document.getElementById("character-tag-filter-chips");
  const cue = document.getElementById("character-filter-active-cue");
  const sortSelect = document.getElementById("character-sort-select");
  if (sortSelect) sortSelect.value = state.characterSortMode || "updated_desc";
  if (!chips || !cue) return;
  chips.innerHTML = "";
  const filters = Array.isArray(state.characterTagFilters)
    ? state.characterTagFilters
    : [];
  filters.forEach((tag) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-chip";
    chip.textContent = `#${tag} ×`;
    chip.addEventListener("click", () => removeCharacterTagFilter(tag));
    chips.appendChild(chip);
  });
  cue.classList.toggle("hidden", filters.length === 0);
}

function onInputKeyDown(e) {
  if (state.settings.autoPairEnabled !== false) {
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      const pairs = {
        "(": ")",
        "[": "]",
        "{": "}",
        '"': '"',
        _: "_",
        "`": "`",
        "*": "*",
      };
      const closeChar = pairs[e.key];
      if (closeChar) {
        const input = e.currentTarget;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const selected = input.value.slice(start, end);
        e.preventDefault();
        if (selected) {
          input.setRangeText(`${e.key}${selected}${closeChar}`, start, end, "end");
          input.setSelectionRange(start + 1, end + 1);
        } else {
          input.setRangeText(`${e.key}${closeChar}`, start, end, "end");
          input.setSelectionRange(start + 1, start + 1);
        }
        return;
      }
    }
  }
  if (e.key !== "Enter") return;
  const enterToSend = state.settings.enterToSendEnabled !== false;
  if (enterToSend) {
    if (!e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      sendMessage();
    }
    return;
  }
  if (e.ctrlKey) {
    e.preventDefault();
    sendMessage();
  }
}

function onInputPointerUp() {
  const now = Date.now();
  if (now - state.lastTapAt < 280) {
    openPromptHistory();
  }
  state.lastTapAt = now;
}

function onGlobalClick(e) {
  const popover = document.getElementById("prompt-history-popover");
  const input = document.getElementById("user-input");
  if (
    state.promptHistoryOpen &&
    !popover.contains(e.target) &&
    e.target !== input
  ) {
    closePromptHistory();
  }
}

function onGlobalKeyDown(e) {
  if (matchShortcutEvent(e, state.settings.cancelShortcut)) {
    e.preventDefault();
    cancelOngoingGeneration();
    return;
  }
  if (matchShortcutEvent(e, state.settings.homeShortcut)) {
    e.preventDefault();
    triggerGoHomeShortcut();
    return;
  }
  if (matchShortcutEvent(e, state.settings.newCharacterShortcut)) {
    e.preventDefault();
    triggerNewCharacterShortcut();
    return;
  }
  if (e.key === "Escape") {
    if (cancelActiveMessageEdit()) return;
    closePromptHistory();
    closeAnyOpenModal();
  }
}

function closeAnyOpenModal() {
  const imagePreviewModal = document.getElementById("image-preview-modal");
  if (imagePreviewModal && !imagePreviewModal.classList.contains("hidden")) {
    closeImagePreview();
    return;
  }

  const confirmModal = document.getElementById("confirm-modal");
  if (confirmModal && !confirmModal.classList.contains("hidden")) {
    resolveConfirmDialog(false);
    return;
  }

  const textInputModal = document.getElementById("text-input-modal");
  if (textInputModal && !textInputModal.classList.contains("hidden")) {
    resolveTextInputDialog(false);
    return;
  }

  if (state.activeModalId) {
    closeActiveModal();
    return;
  }

  const visibleModals = Array.from(
    document.querySelectorAll(".modal:not(.hidden)"),
  );
  if (visibleModals.length > 0) {
    const topMost = visibleModals[visibleModals.length - 1];
    topMost.classList.add("hidden");
  }
}

async function setupSettingsControls() {
  const uiLanguageSelect = document.getElementById("ui-language-select");
  const openRouterApiKey = document.getElementById("openrouter-api-key");
  const puterSignInBtn = document.getElementById("puter-signin-btn");
  const ttsTestText = document.getElementById("tts-test-text");
  const ttsTestPlayBtn = document.getElementById("tts-test-play-btn");
  const ttsTestStatus = document.getElementById("tts-test-status");
  const puterRow = puterSignInBtn?.closest(".settings-inline-row");
  const modelSelect = document.getElementById("model-select");
  const modelPricingFilter = document.getElementById("model-pricing-filter");
  const modelModalityFilter = document.getElementById("model-modality-filter");
  const modelSortOrder = document.getElementById("model-sort-order");
  const modelRefreshBtn = document.getElementById("model-refresh-btn");
  const modelSelectedMeta = document.getElementById("model-selected-meta");
  const maxTokensSlider = document.getElementById("max-tokens-slider");
  const maxTokensValue = document.getElementById("max-tokens-value");
  const temperatureSlider = document.getElementById("temperature-slider");
  const temperatureValue = document.getElementById("temperature-value");
  const toastDelaySlider = document.getElementById("toast-delay-slider");
  const toastDelayValue = document.getElementById("toast-delay-value");
  if (uiLanguageSelect) {
    uiLanguageSelect.querySelector('option[value="auto"]').textContent =
      t("languageAuto");
    uiLanguageSelect.querySelector('option[value="en"]').textContent =
      t("languageEnglish");
    uiLanguageSelect.querySelector('option[value="fr"]').textContent =
      t("languageFrench");
    uiLanguageSelect.querySelector('option[value="it"]').textContent =
      t("languageItalian");
    uiLanguageSelect.querySelector('option[value="de"]').textContent =
      t("languageGerman");
    uiLanguageSelect.querySelector('option[value="es"]').textContent =
      t("languageSpanish");
    uiLanguageSelect.querySelector('option[value="pt-BR"]').textContent =
      t("languagePortugueseBr");
    uiLanguageSelect.value = state.settings.uiLanguage || "auto";
    if (!uiLanguageSelect.value) uiLanguageSelect.value = "auto";
  }
  if (modelPricingFilter) {
    modelPricingFilter.value =
      state.settings.modelPricingFilter === "free" ||
      state.settings.modelPricingFilter === "paid"
        ? state.settings.modelPricingFilter
        : "all";
  }
  if (modelModalityFilter) {
    modelModalityFilter.value =
      state.settings.modelModalityFilter === "all" ? "all" : "text-only";
  }
  if (modelSortOrder) {
    const order = String(state.settings.modelSortOrder || "name_asc");
    modelSortOrder.value = [
      "name_asc",
      "name_desc",
      "created_asc",
      "created_desc",
    ].includes(order)
      ? order
      : "name_asc";
  }

  await populateSettingsModels();
  // modelSelect.innerHTML = "";
  // MODEL_OPTIONS.forEach((m) => {
  //   const opt = document.createElement("option");
  //   opt.value = m.value;
  //   opt.textContent = m.label;
  //   modelSelect.appendChild(opt);
  // });
  modelSelect.value = state.settings.model;
  if (!modelSelect.value) {
    modelSelect.value = DEFAULT_SETTINGS.model;
    state.settings.model = modelSelect.value;
    saveSettings();
  }
  refreshSelectedModelMeta(modelSelectedMeta);

  const markdownCheck = document.getElementById("markdown-enabled");
  const allowMessageHtml = document.getElementById("allow-message-html");
  const streamEnabled = document.getElementById("stream-enabled");
  const autopairEnabled = document.getElementById("autopair-enabled");
  const autoReplyEnabled = document.getElementById("auto-reply-enabled");
  const enterToSendEnabled = document.getElementById("enter-to-send-enabled");
  const cancelShortcut = document.getElementById("cancel-shortcut");
  const homeShortcut = document.getElementById("home-shortcut");
  const newCharacterShortcut = document.getElementById(
    "new-character-shortcut",
  );
  const markdownCustomCss = document.getElementById("markdown-custom-css");
  const postprocessRulesJson = document.getElementById(
    "postprocess-rules-json",
  );
  const globalPromptTemplate = document.getElementById(
    "global-prompt-template",
  );
  const summarySystemPrompt = document.getElementById("summary-system-prompt");
  const personaInjectionTemplate = document.getElementById(
    "persona-injection-template",
  );
  const personaInjectionWhen = document.getElementById("persona-injection-when");
  const shortcutsRaw = document.getElementById("shortcuts-raw");
  markdownCheck.checked = !!state.settings.markdownEnabled;
  allowMessageHtml.checked = state.settings.allowMessageHtml !== false;
  streamEnabled.checked = state.settings.streamEnabled !== false;
  autopairEnabled.checked = state.settings.autoPairEnabled !== false;
  autoReplyEnabled.checked = state.settings.autoReplyEnabled !== false;
  enterToSendEnabled.checked = state.settings.enterToSendEnabled !== false;
  markdownCustomCss.value = state.settings.markdownCustomCss || "";
  postprocessRulesJson.value = state.settings.postprocessRulesJson || "[]";
  const initialSliderMax = getSettingsMaxTokensUpperBound(modelSelect.value);
  state.settings.maxTokens = clampMaxTokens(
    state.settings.maxTokens,
    512,
    initialSliderMax,
  );
  maxTokensSlider.min = "512";
  maxTokensSlider.max = String(initialSliderMax);
  maxTokensSlider.value = String(state.settings.maxTokens);
  maxTokensValue.textContent = maxTokensSlider.value;
  temperatureSlider.value = String(
    clampTemperature(state.settings.temperature),
  );
  temperatureValue.textContent = clampTemperature(
    state.settings.temperature,
  ).toFixed(2);
  if (toastDelaySlider) {
    const delay = clampToastDuration(state.settings.toastDurationMs);
    state.settings.toastDurationMs = delay;
    toastDelaySlider.value = String(delay);
    if (toastDelayValue) {
      toastDelayValue.textContent = `${Math.round(delay / 100) / 10}s`;
    }
  }
  updateSettingsRangeTone(maxTokensSlider, Number(maxTokensSlider.value), {
    warnBelow: 1024,
    dangerAbove: 4096,
  });
  updateSettingsRangeTone(
    temperatureSlider,
    Number(temperatureSlider.value),
    {
      warnBelow: 0.7,
      dangerAbove: 1.0,
    },
  );
  globalPromptTemplate.value = state.settings.globalPromptTemplate || "";
  summarySystemPrompt.value = state.settings.summarySystemPrompt || "";
  personaInjectionTemplate.value =
    state.settings.personaInjectionTemplate ||
    DEFAULT_SETTINGS.personaInjectionTemplate;
  personaInjectionWhen.value =
    state.settings.personaInjectionWhen === "on_change"
      ? "on_change"
      : "always";
  shortcutsRaw.value = state.settings.shortcutsRaw || "";
  cancelShortcut.value =
    state.settings.cancelShortcut || DEFAULT_SETTINGS.cancelShortcut;
  homeShortcut.value =
    state.settings.homeShortcut || DEFAULT_SETTINGS.homeShortcut;
  newCharacterShortcut.value =
    state.settings.newCharacterShortcut ||
    DEFAULT_SETTINGS.newCharacterShortcut;
  openRouterApiKey.value = state.settings.openRouterApiKey || "";
  if (ttsTestText) {
    ttsTestText.value = "This is a test voice playback.";
  }
  if (puterRow) puterRow.classList.add("hidden");

  if (ttsTestPlayBtn) {
    ttsTestPlayBtn.addEventListener("click", async () => {
      const text =
        String(ttsTestText?.value || "").trim() ||
        "This is a test voice playback.";
      if (ttsTestStatus) ttsTestStatus.textContent = "TTS: generating...";
      ttsTestPlayBtn.disabled = true;
      try {
        const options = getCurrentCharacterTtsOptions();
        if (ttsTestStatus) ttsTestStatus.textContent = "TTS: playing";
        await playTtsAudio(text, options);
        if (ttsTestStatus) ttsTestStatus.textContent = "TTS: idle";
      } catch (err) {
        if (isTtsCancelledError(err)) {
          if (ttsTestStatus) ttsTestStatus.textContent = "TTS: idle";
        } else if (ttsTestStatus) {
          ttsTestStatus.textContent = `TTS: ${err.message || "failed"}`;
        }
      } finally {
        ttsTestPlayBtn.disabled = false;
      }
    });
  }
  updateTtsSupportUi();

  openRouterApiKey.addEventListener("input", () => {
    state.settings.openRouterApiKey = openRouterApiKey.value.trim();
    saveSettings();
    populateSettingsModels().catch(() => {});
  });

  modelSelect.addEventListener("change", () => {
    state.settings.model = modelSelect.value;
    const maxUpper = getSettingsMaxTokensUpperBound(modelSelect.value);
    state.settings.maxTokens = clampMaxTokens(
      state.settings.maxTokens,
      512,
      maxUpper,
    );
    maxTokensSlider.min = "512";
    maxTokensSlider.max = String(maxUpper);
    maxTokensSlider.value = String(state.settings.maxTokens);
    maxTokensValue.textContent = String(state.settings.maxTokens);
    refreshSelectedModelMeta(modelSelectedMeta);
    scheduleThreadBudgetIndicatorUpdate();
    saveSettings();
    updateModelPill();
  });

  modelPricingFilter?.addEventListener("change", () => {
    state.settings.modelPricingFilter = modelPricingFilter.value;
    saveSettings();
    populateSettingsModels({ force: true }).catch(() => {});
  });

  modelModalityFilter?.addEventListener("change", () => {
    state.settings.modelModalityFilter = modelModalityFilter.value;
    saveSettings();
    populateSettingsModels({ force: true }).catch(() => {});
  });

  modelSortOrder?.addEventListener("change", () => {
    state.settings.modelSortOrder = modelSortOrder.value;
    saveSettings();
    populateSettingsModels({ force: true }).catch(() => {});
  });

  modelRefreshBtn?.addEventListener("click", () => {
    populateSettingsModels({ force: true }).catch(() => {});
  });

  markdownCheck.addEventListener("change", () => {
    state.settings.markdownEnabled = markdownCheck.checked;
    saveSettings();
    if (currentThread) renderChat();
  });

  allowMessageHtml.addEventListener("change", () => {
    state.settings.allowMessageHtml = allowMessageHtml.checked;
    saveSettings();
    if (currentThread) renderChat();
  });

  streamEnabled.addEventListener("change", () => {
    state.settings.streamEnabled = streamEnabled.checked;
    saveSettings();
  });

  autopairEnabled.addEventListener("change", () => {
    state.settings.autoPairEnabled = autopairEnabled.checked;
    saveSettings();
  });

  autoReplyEnabled.addEventListener("change", () => {
    state.settings.autoReplyEnabled = autoReplyEnabled.checked;
    saveSettings();
  });

  enterToSendEnabled.addEventListener("change", () => {
    state.settings.enterToSendEnabled = enterToSendEnabled.checked;
    saveSettings();
  });

  markdownCustomCss.addEventListener("input", () => {
    state.settings.markdownCustomCss = markdownCustomCss.value;
    saveSettings();
    applyMarkdownCustomCss();
    if (currentThread) renderChat();
  });

  postprocessRulesJson.addEventListener("input", () => {
    state.settings.postprocessRulesJson = postprocessRulesJson.value;
    saveSettings();
    if (currentThread) renderChat();
  });

  maxTokensSlider.addEventListener("input", () => {
    const maxUpper = getSettingsMaxTokensUpperBound(modelSelect.value);
    const value = clampMaxTokens(Number(maxTokensSlider.value), 512, maxUpper);
    state.settings.maxTokens = value;
    maxTokensSlider.max = String(maxUpper);
    maxTokensSlider.value = String(value);
    maxTokensValue.textContent = String(value);
    updateSettingsRangeTone(maxTokensSlider, value, {
      warnBelow: 1024,
      dangerAbove: 4096,
    });
    scheduleThreadBudgetIndicatorUpdate();
    saveSettings();
  });

  temperatureSlider.addEventListener("input", () => {
    const value = clampTemperature(Number(temperatureSlider.value));
    state.settings.temperature = value;
    temperatureValue.textContent = value.toFixed(2);
    updateSettingsRangeTone(temperatureSlider, value, {
      warnBelow: 0.7,
      dangerAbove: 1.0,
    });
    saveSettings();
  });
  toastDelaySlider?.addEventListener("input", () => {
    const value = clampToastDuration(Number(toastDelaySlider.value));
    state.settings.toastDurationMs = value;
    toastDelaySlider.value = String(value);
    if (toastDelayValue) {
      toastDelayValue.textContent = `${Math.round(value / 100) / 10}s`;
    }
    saveSettings();
  });


  globalPromptTemplate.addEventListener("input", () => {
    state.settings.globalPromptTemplate = globalPromptTemplate.value;
    saveSettings();
    if (state.activeModalId === "character-modal")
      updateCharacterPromptPlaceholder();
  });

  summarySystemPrompt.addEventListener("input", () => {
    state.settings.summarySystemPrompt = summarySystemPrompt.value;
    saveSettings();
  });

  personaInjectionTemplate.addEventListener("input", () => {
    state.settings.personaInjectionTemplate = personaInjectionTemplate.value;
    saveSettings();
  });

  personaInjectionWhen.addEventListener("change", () => {
    state.settings.personaInjectionWhen =
      personaInjectionWhen.value === "on_change" ? "on_change" : "always";
    saveSettings();
  });

  cancelShortcut.addEventListener("change", () => {
    state.settings.cancelShortcut = normalizeShortcutString(
      cancelShortcut.value,
    );
    cancelShortcut.value = state.settings.cancelShortcut;
    saveSettings();
  });
  homeShortcut.addEventListener("change", () => {
    state.settings.homeShortcut = normalizeShortcutString(homeShortcut.value);
    homeShortcut.value = state.settings.homeShortcut;
    saveSettings();
  });
  newCharacterShortcut.addEventListener("change", () => {
    state.settings.newCharacterShortcut = normalizeShortcutString(
      newCharacterShortcut.value,
    );
    newCharacterShortcut.value = state.settings.newCharacterShortcut;
    saveSettings();
  });
  if (uiLanguageSelect) {
    uiLanguageSelect.addEventListener("change", async () => {
      state.settings.uiLanguage = uiLanguageSelect.value || "auto";
      saveSettings();
      await applyInterfaceLanguage();
      updateToastDelayDisplay();
      await renderShortcutsBar();
      setSendingState(state.sending);
    });
  }
}

function clampToastDuration(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 2600;
  return Math.max(1000, Math.min(10000, Math.round(num / 100) * 100));
}

function updateToastDelayDisplay() {
  const slider = document.getElementById("toast-delay-slider");
  const valueEl = document.getElementById("toast-delay-value");
  if (!slider || !valueEl) return;
  const value = clampToastDuration(state.settings.toastDurationMs);
  slider.value = String(value);
  valueEl.textContent = `${Math.round(value / 100) / 10}s`;
}

function getSettingsGroupForNode(node) {
  if (!node) return "appearance";
  if (node.getAttribute?.("data-settings-group")) {
    return node.getAttribute("data-settings-group");
  }
  const id = node.id || "";
  const has = (selector) => !!node.querySelector?.(selector);
  if (
    has("#openrouter-api-key") ||
    has("#model-select") ||
    has("#model-pricing-filter") ||
    has("#model-modality-filter") ||
    has("#model-sort-order") ||
    has("#model-refresh-btn") ||
    has("#max-tokens-slider") ||
    has("#temperature-slider")
  ) return "api";
  if (has("#model-selected-meta") || has("#model-roleplay-warning")) return "api";
  if (has("#puter-signin-btn") || has("#tts-test-text") || has("#tts-test-play-btn")) return "tts";
  if (
    has("#markdown-enabled") ||
    has("#allow-message-html") ||
    has("#stream-enabled") ||
    has("#autopair-enabled") ||
    has("#markdown-custom-css") ||
    has("#postprocess-rules-json")
  ) return "threads";
  if (has("#cancel-shortcut") || has("#home-shortcut") || has("#new-character-shortcut")) return "shortcuts";
  if (
    has("#global-prompt-template") ||
    has("#summary-system-prompt") ||
    has("#persona-injection-template") ||
    has("#persona-injection-when")
  ) return "prompting";
  if (has("#ui-language-select") || has("#toast-delay-slider")) return "appearance";
  const text = `${node.textContent || ""}`.toLowerCase();
  if (
    id === "openrouter-api-key" ||
    id === "model-select" ||
    id === "model-selected-meta" ||
    id === "model-roleplay-warning" ||
    id === "max-tokens-slider" ||
    id === "temperature-slider" ||
    id === "model-pricing-filter" ||
    id === "model-modality-filter" ||
    id === "model-sort-order" ||
    id === "model-refresh-btn" ||
    text.includes("openrouter api key")
  ) {
    return "api";
  }
  if (
    id === "puter-signin-btn" ||
    id === "tts-test-text" ||
    id === "tts-test-play-btn" ||
    id === "tts-test-status" ||
    text.includes("tts")
  ) {
    return "tts";
  }
  if (
    id === "markdown-enabled" ||
    id === "allow-message-html" ||
    id === "stream-enabled" ||
    id === "autopair-enabled" ||
    id === "markdown-custom-css" ||
    id === "postprocess-rules-json"
  ) {
    return "threads";
  }
  if (
    id === "cancel-shortcut" ||
    id === "home-shortcut" ||
    id === "new-character-shortcut"
  ) {
    return "shortcuts";
  }
  if (
    id === "global-prompt-template" ||
    id === "summary-system-prompt" ||
    id === "persona-injection-template" ||
    id === "persona-injection-when"
  ) {
    return "prompting";
  }
  if (id === "ui-language-select" || id === "toast-delay-slider") {
    return "appearance";
  }
  return "appearance";
}

function setupSettingsTabsLayout() {
  const body = document.getElementById("settings-modal-body");
  const tabs = document.querySelectorAll("[data-settings-tab-btn]");
  if (!body || tabs.length === 0 || body.dataset.tabsReady === "1") return;

  const groups = [
    "appearance",
    "api",
    "tts",
    "threads",
    "shortcuts",
    "prompting",
  ];
  const panels = new Map();
  groups.forEach((group) => {
    const panel = document.createElement("div");
    panel.className = "settings-tab-panel";
    panel.dataset.settingsTabPanel = group;
    if (group !== "appearance") panel.classList.add("hidden");
    panels.set(group, panel);
    body.appendChild(panel);
  });

  const movable = Array.from(body.children).filter(
    (el) => !el.classList.contains("settings-tab-panel"),
  );
  movable.forEach((node) => {
    const target = panels.get(getSettingsGroupForNode(node));
    (target || panels.get("appearance")).appendChild(node);
  });

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-settings-tab-btn") || "appearance";
      tabs.forEach((b) => b.classList.toggle("active", b === btn));
      panels.forEach((panel, key) => {
        panel.classList.toggle("hidden", key !== tab);
      });
    });
  });
  body.dataset.tabsReady = "1";
}

function loadSettings() {
  try {
    const raw = localStorage.getItem("rp-settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      state.settings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    state.settings = { ...DEFAULT_SETTINGS };
  }
}

function loadUiState() {
  try {
    const raw = localStorage.getItem("rp-ui-state");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.shortcutsVisible === "boolean") {
      state.shortcutsVisible = parsed.shortcutsVisible;
    }
    if (Array.isArray(parsed.characterTagFilters)) {
      state.characterTagFilters = parsed.characterTagFilters
        .map((t) => normalizeTagValue(t))
        .filter(Boolean);
    }
    if (typeof parsed.characterSortMode === "string" && parsed.characterSortMode) {
      state.characterSortMode = parsed.characterSortMode;
    }
  } catch {
    state.shortcutsVisible = true;
    state.characterTagFilters = [];
    state.characterSortMode = "updated_desc";
  }
}

function saveUiState() {
  localStorage.setItem(
    "rp-ui-state",
    JSON.stringify({
      shortcutsVisible: !!state.shortcutsVisible,
      characterTagFilters: Array.isArray(state.characterTagFilters)
        ? state.characterTagFilters
        : [],
      characterSortMode: state.characterSortMode || "updated_desc",
    }),
  );
}

function saveSettings() {
  localStorage.setItem("rp-settings", JSON.stringify(state.settings));
}

function updateSettingsRangeTone(slider, value, limits) {
  if (!slider) return;
  const { warnBelow, dangerAbove } = limits || {};
  slider.classList.remove("tone-warn", "tone-danger");
  if (typeof warnBelow === "number" && value < warnBelow) {
    slider.classList.add("tone-warn");
    return;
  }
  if (typeof dangerAbove === "number" && value > dangerAbove) {
    slider.classList.add("tone-danger");
  }
}

function markModalDirtyOnInput(modalId, selectors) {
  selectors.forEach((selector) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.addEventListener("input", () => {
      state.modalDirty[modalId] = true;
    });
    el.addEventListener("change", () => {
      state.modalDirty[modalId] = true;
    });
  });
}

function normalizeShortcutString(value) {
  const parts = String(value || "")
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  const key = parts.pop();
  const mods = parts
    .map((m) => m.toLowerCase())
    .filter((m, i, arr) => arr.indexOf(m) === i)
    .sort(
      (a, b) =>
        ["ctrl", "alt", "shift", "meta"].indexOf(a) -
        ["ctrl", "alt", "shift", "meta"].indexOf(b),
    )
    .map((m) => {
      if (m === "ctrl") return "Ctrl";
      if (m === "alt") return "Alt";
      if (m === "shift") return "Shift";
      if (m === "meta") return "Meta";
      return m;
    });
  const normalizedKey =
    key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1);
  return [...mods, normalizedKey].join("+");
}

function matchShortcutEvent(e, shortcut) {
  const normalized = normalizeShortcutString(shortcut);
  if (!normalized) return false;
  const parts = normalized.split("+");
  const key = parts.pop();
  const wantCtrl = parts.includes("Ctrl");
  const wantAlt = parts.includes("Alt");
  const wantShift = parts.includes("Shift");
  const wantMeta = parts.includes("Meta");
  if (e.ctrlKey !== wantCtrl) return false;
  if (e.altKey !== wantAlt) return false;
  if (e.shiftKey !== wantShift) return false;
  if (e.metaKey !== wantMeta) return false;
  const eventKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  if (key === "Period" && e.key === ".") return true;
  return eventKey === key;
}

function hasBlockingUnsavedModal() {
  const active = state.activeModalId;
  if (!active) return false;
  if (active === "settings-modal") return false;
  return !!state.modalDirty[active];
}

function triggerGoHomeShortcut() {
  if (hasBlockingUnsavedModal()) return;
  if (state.activeModalId === "settings-modal") closeActiveModal();
  if (state.activeModalId && state.activeModalId !== "settings-modal") return;
  showMainView();
}

function triggerNewCharacterShortcut() {
  if (state.activeModalId === "character-modal") return;
  if (hasBlockingUnsavedModal()) return;
  if (state.activeModalId === "settings-modal") closeActiveModal();
  if (state.activeModalId && state.activeModalId !== "settings-modal") return;
  openCharacterModal();
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  const delay = clampToastDuration(state.settings.toastDurationMs);
  window.setTimeout(() => {
    toast.remove();
  }, delay);
}

function openConfirmDialog(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirm-modal");
    const yesBtn = document.getElementById("confirm-yes-btn");
    const noBtn = document.getElementById("confirm-no-btn");
    const cancelBtn = document.getElementById("confirm-cancel-btn");
    yesBtn.textContent = t("confirm");
    noBtn.textContent = t("cancel");
    noBtn.classList.remove("hidden");
    cancelBtn.classList.remove("hidden");
    state.confirmMode = "confirm";
    document.getElementById("confirm-title").textContent =
      title || t("confirm");
    document.getElementById("confirm-message").textContent = message || "";
    state.confirmResolver = resolve;
    modal.classList.remove("hidden");
  });
}

function openInfoDialog(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirm-modal");
    const yesBtn = document.getElementById("confirm-yes-btn");
    const noBtn = document.getElementById("confirm-no-btn");
    const cancelBtn = document.getElementById("confirm-cancel-btn");
    yesBtn.textContent = t("ok");
    noBtn.classList.add("hidden");
    cancelBtn.classList.add("hidden");
    state.confirmMode = "info";
    document.getElementById("confirm-title").textContent =
      title || t("message");
    document.getElementById("confirm-message").textContent = message || "";
    state.confirmResolver = () => resolve(true);
    modal.classList.remove("hidden");
  });
}

function resolveConfirmDialog(value) {
  const modal = document.getElementById("confirm-modal");
  if (!modal || modal.classList.contains("hidden")) return;
  modal.classList.add("hidden");
  const yesBtn = document.getElementById("confirm-yes-btn");
  const noBtn = document.getElementById("confirm-no-btn");
  const cancelBtn = document.getElementById("confirm-cancel-btn");
  yesBtn.textContent = t("confirm");
  noBtn.textContent = t("cancel");
  noBtn.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");
  state.confirmMode = "confirm";
  const resolver = state.confirmResolver;
  state.confirmResolver = null;
  if (typeof resolver === "function") resolver(!!value);
}

function openTextInputDialog({
  title = "",
  label = "",
  value = "",
  saveLabel = "",
  cancelLabel = "",
  maxLength = 128,
} = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById("text-input-modal");
    const titleEl = document.getElementById("text-input-title");
    const labelEl = document.getElementById("text-input-label");
    const inputEl = document.getElementById("text-input-value");
    const saveBtn = document.getElementById("text-input-save");
    const cancelBtn = document.getElementById("text-input-cancel");
    if (!modal || !titleEl || !labelEl || !inputEl || !saveBtn || !cancelBtn) {
      resolve(null);
      return;
    }
    titleEl.textContent = title || t("input");
    labelEl.textContent = label || t("value");
    inputEl.value = String(value || "");
    inputEl.maxLength = Math.max(1, Number(maxLength) || 128);
    saveBtn.textContent = saveLabel || t("save");
    cancelBtn.textContent = cancelLabel || t("cancel");
    state.textInputResolver = resolve;
    modal.classList.remove("hidden");
    state.activeModalId = "text-input-modal";
    window.setTimeout(() => {
      inputEl.focus();
      inputEl.select();
    }, 0);
  });
}

function resolveTextInputDialog(save) {
  const modal = document.getElementById("text-input-modal");
  if (!modal || modal.classList.contains("hidden")) return;
  const resolver = state.textInputResolver;
  state.textInputResolver = null;
  const inputEl = document.getElementById("text-input-value");
  modal.classList.add("hidden");
  if (state.activeModalId === "text-input-modal") {
    state.activeModalId = null;
  }
  if (typeof resolver === "function") {
    resolver(save ? String(inputEl?.value || "") : null);
  }
}

function applyMarkdownCustomCss() {
  const id = "dynamic-markdown-style";
  let styleTag = document.getElementById(id);
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = id;
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = String(state.settings.markdownCustomCss || "");
}

function parseShortcutEntries(raw) {
  const lines = String(raw || "")
    .replace(/\r\n/g, "\n")
    .split("\n");
  const entries = [];
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    if (!current.name || !current.message) return;
    entries.push({
      name: current.name,
      message: current.message,
      insertionType: current.insertionType === "append" ? "append" : "replace",
      autoSend: current.autoSend === "yes",
      clearAfterSend: current.clearAfterSend === "yes",
    });
  };

  for (const line of lines) {
    const m = line.match(/^@([a-zA-Z]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2] ?? "";
    if (key === "name") {
      pushCurrent();
      current = {
        name: value,
        message: "",
        insertionType: "replace",
        autoSend: "no",
        clearAfterSend: "yes",
      };
      continue;
    }
    if (!current) continue;
    if (key === "message") current.message = value;
    if (key === "insertiontype")
      current.insertionType = value.trim().toLowerCase();
    if (key === "autosend") current.autoSend = value.trim().toLowerCase();
    if (key === "clearaftersend")
      current.clearAfterSend = value.trim().toLowerCase();
  }
  pushCurrent();
  return entries;
}

function serializeShortcutEntries(entries) {
  return entries
    .map(
      (s) =>
        `@name=${s.name}\n@message=${s.message}\n@insertionType=${s.insertionType}\n@autoSend=${s.autoSend ? "yes" : "no"}\n@clearAfterSend=${s.clearAfterSend ? "yes" : "no"}`,
    )
    .join("\n\n");
}

async function saveShortcutsFromModal() {
  const raw = document.getElementById("shortcuts-raw").value;
  const entries = parseShortcutEntries(raw);
  state.settings.shortcutsRaw = serializeShortcutEntries(entries);
  saveSettings();
  state.modalDirty["shortcuts-modal"] = false;
  document.getElementById("shortcuts-raw").value = state.settings.shortcutsRaw;
  await renderShortcutsBar();
  closeActiveModal();
  showToast(t("shortcutsSaved"), "success");
}

function isValidNewManagerTag(inputValue) {
  const tag = normalizeTagValue(inputValue);
  if (tag.length < 2) return false;
  return !getAllAvailableTags().some((t) => t.toLowerCase() === tag.toLowerCase());
}

function updateTagManagerAddButtonState() {
  const input = document.getElementById("tag-manager-input");
  const btn = document.getElementById("add-tag-btn");
  if (!input || !btn) return;
  btn.disabled = !isValidNewManagerTag(input.value);
}

function renderTagManagerList() {
  const list = document.getElementById("tag-manager-list");
  if (!list) return;
  list.innerHTML = "";
  const tags = [...getAllAvailableTags()].reverse();
  tags.forEach((tag) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "tag-filter-chip";
    chip.textContent = tag;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "tag-remove-btn";
    removeBtn.textContent = "X";
    removeBtn.setAttribute("aria-label", `${t("removeTagTitle")}: ${tag}`);
    removeBtn.title = t("removeTagTitle");
    removeBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await removeTagFromCatalog(tag);
    });
    chip.appendChild(removeBtn);
    list.appendChild(chip);
  });
}

async function addTagFromManagerInput() {
  const input = document.getElementById("tag-manager-input");
  if (!input) return;
  const tag = normalizeTagValue(input.value);
  if (tag.length < 2) return;
  if (!isValidNewManagerTag(tag)) return;
  const existing = Array.isArray(state.settings.customTags)
    ? state.settings.customTags.map((t) => normalizeTagValue(t)).filter(Boolean)
    : [];
  existing.push(tag);
  state.settings.customTags = existing;
  state.settings.tagsInitialized = true;
  saveSettings();
  input.value = "";
  updateTagManagerAddButtonState();
  renderTagManagerList();
  renderTagPresetsDataList();
  renderCharacterTagPresetButtons();
  renderCharacterTagFilterChips();
  await renderCharacters();
  showToast(t("tagsUpdated"), "success");
}

async function removeTagFromCatalog(tag) {
  const normalized = normalizeTagValue(tag);
  const lower = normalized.toLowerCase();
  if (!normalized) return;
  const allCharacters = await db.characters.toArray();
  const affectedCharacters = allCharacters.filter((char) =>
    (Array.isArray(char.tags) ? char.tags : []).some(
      (t) => String(t || "").toLowerCase() === lower,
    ),
  );
  if (affectedCharacters.length > 0) {
    const affectedList = affectedCharacters
      .slice(0, 12)
      .map((c) => `- ${c.name || `Character #${c.id}`} (#${c.id})`)
      .join("\n");
    const extra =
      affectedCharacters.length > 12
        ? `\n...and ${affectedCharacters.length - 12} more.`
        : "";
    const ok = await openConfirmDialog(
      t("removeTagsConfirmTitle"),
      tf("removeTagAffectsChars", { list: affectedList, extra }),
    );
    if (!ok) return;
  } else {
    const ok = await openConfirmDialog(t("removeTagTitle"), t("removeTagConfirmSimple"));
    if (!ok) return;
  }

  const nextTags = (Array.isArray(state.settings.customTags)
    ? state.settings.customTags
    : []
  ).filter((t) => String(t || "").toLowerCase() !== lower);
  state.settings.customTags = nextTags;
  state.settings.tagsInitialized = true;
  saveSettings();

  if (affectedCharacters.length > 0) {
    await db.transaction("rw", db.characters, async () => {
      for (const char of affectedCharacters) {
        const nextCharTags = (Array.isArray(char.tags) ? char.tags : []).filter(
          (t) => String(t || "").toLowerCase() !== lower,
        );
        await db.characters.update(char.id, {
          tags: nextCharTags,
          updatedAt: Date.now(),
        });
      }
    });
  }

  state.characterTagFilters = state.characterTagFilters.filter(
    (t) => String(t || "").toLowerCase() !== lower,
  );
  saveUiState();
  if (currentCharacter) {
    const refreshed = await db.characters.get(currentCharacter.id);
    if (refreshed) currentCharacter = refreshed;
  }
  renderTagManagerList();
  updateTagManagerAddButtonState();
  renderTagPresetsDataList();
  renderCharacterTagPresetButtons();
  renderCharacterTagFilterChips();
  await renderCharacters();
  showToast(t("tagsUpdated"), "success");
}

async function renderShortcutsBar() {
  const bar = document.getElementById("shortcuts-bar");
  const toggleBtn = document.getElementById("shortcuts-toggle-btn");
  if (!bar) return;
  const entries = parseShortcutEntries(state.settings.shortcutsRaw);
  bar.innerHTML = "";
  bar.classList.toggle("hidden", !state.shortcutsVisible);
  if (toggleBtn) {
    toggleBtn.textContent = state.shortcutsVisible
      ? t("hideShortcuts")
      : t("showShortcuts");
    toggleBtn.disabled = entries.length === 0;
  }
  if (!state.shortcutsVisible || entries.length === 0) return;

  entries.forEach((entry, index) => {
    const btn = document.createElement("button");
    btn.className = "shortcut-chip";
    btn.type = "button";
    btn.textContent = entry.name || `Shortcut ${index + 1}`;
    btn.addEventListener("click", async () => {
      await applyShortcutEntry(entry);
    });
    bar.appendChild(btn);
  });
}

function toggleShortcutsVisibility() {
  state.shortcutsVisible = !state.shortcutsVisible;
  saveUiState();
  renderShortcutsBar();
}

async function applyShortcutEntry(entry) {
  const input = document.getElementById("user-input");
  const current = input.value;
  if (entry.insertionType === "append") {
    const start = input.selectionStart ?? current.length;
    const end = input.selectionEnd ?? current.length;
    input.value = `${current.slice(0, start)}${entry.message}${current.slice(end)}`;
    const caret = start + entry.message.length;
    input.setSelectionRange(caret, caret);
  } else {
    input.value = entry.message;
    input.setSelectionRange(input.value.length, input.value.length);
  }
  input.focus();

  state.activeShortcut = {
    initialValue: input.value,
    clearAfterSend: !!entry.clearAfterSend,
  };

  if (entry.autoSend) {
    await sendMessage({ preserveInput: !entry.clearAfterSend });
  }
}

async function renderAll() {
  await Promise.all([
    renderCharacters(),
    renderThreads(),
    renderPersonaSelector(),
    renderPersonaModalList(),
    renderShortcutsBar(),
  ]);
  renderCharacterTagFilterChips();
}

async function renderCharacters() {
  const grid = document.getElementById("character-grid");
  const characters = await db.characters.toArray();
  const threads = await db.threads.toArray();
  const threadCountByCharId = new Map();
  threads.forEach((thread) => {
    const id = Number(thread.characterId);
    if (!Number.isInteger(id)) return;
    threadCountByCharId.set(id, (threadCountByCharId.get(id) || 0) + 1);
  });

  const activeFilters = Array.isArray(state.characterTagFilters)
    ? state.characterTagFilters.map((t) => t.toLowerCase())
    : [];
  const filteredCharacters = characters.filter((char) => {
    if (activeFilters.length === 0) return true;
    const tags = Array.isArray(char.tags)
      ? char.tags.map((t) => String(t || "").toLowerCase())
      : [];
    return activeFilters.every((f) => tags.includes(f));
  });

  const sortedCharacters = [...filteredCharacters];
  sortedCharacters.sort((a, b) => {
    const mode = state.characterSortMode || "updated_desc";
    const nameA = String(a.name || "").toLowerCase();
    const nameB = String(b.name || "").toLowerCase();
    const createdA = Number(a.createdAt || 0);
    const createdB = Number(b.createdAt || 0);
    const updatedA = Number(a.updatedAt || 0);
    const updatedB = Number(b.updatedAt || 0);
    const threadsA = Number(threadCountByCharId.get(Number(a.id)) || 0);
    const threadsB = Number(threadCountByCharId.get(Number(b.id)) || 0);

    if (mode === "name_asc") return nameA.localeCompare(nameB);
    if (mode === "name_desc") return nameB.localeCompare(nameA);
    if (mode === "created_asc") return createdA - createdB;
    if (mode === "created_desc") return createdB - createdA;
    if (mode === "updated_asc") return updatedA - updatedB;
    if (mode === "threads_asc") return threadsA - threadsB || updatedB - updatedA;
    if (mode === "threads_desc") return threadsB - threadsA || updatedB - updatedA;
    return updatedB - updatedA;
  });

  grid.innerHTML = "";
  if (sortedCharacters.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent =
      activeFilters.length > 0
        ? t("noTagsMatched")
        : t("noCharactersStart");
    grid.appendChild(empty);
    return;
  }

  sortedCharacters.forEach((char) => {
    const card = document.createElement("article");
    card.className = "character-card";

    const avatar = document.createElement("img");
    avatar.className = "character-avatar";
    avatar.src =
      char.avatar || fallbackAvatar(char.name || "Character", 512, 512);
    avatar.alt = `${char.name || "Character"} avatar`;
    avatar.addEventListener("click", () => startNewThread(char.id));

    const name = document.createElement("h3");
    name.className = "character-name";
    name.textContent = char.name || "Unnamed";
    name.addEventListener("click", () => startNewThread(char.id));

    const id = document.createElement("p");
    id.className = "character-id";
    id.textContent = tf("characterIdThreadCount", {
      id: char.id,
      count: threadCountByCharId.get(Number(char.id)) || 0,
    });

    const dates = document.createElement("p");
    dates.className = "character-dates";
    dates.textContent = `${tf("createdAtLabel", { value: formatDateTime(char.createdAt) })}\n${tf("updatedAtLabel", { value: formatDateTime(char.updatedAt) })}`;

    const tags = Array.isArray(char.tags)
      ? char.tags.map((t) => normalizeTagValue(t)).filter(Boolean)
      : [];
    const tagsWrap = document.createElement("div");
    tagsWrap.className = "character-tags";
    const expanded = state.expandedCharacterTagIds.has(Number(char.id));
    const visibleCount = expanded ? tags.length : Math.min(tags.length, 3);
    tags.slice(0, visibleCount).forEach((tag) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tag-chip";
      if (activeFilters.includes(tag.toLowerCase())) {
        chip.classList.add("active-filter");
      }
      chip.textContent = tag;
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        const lower = tag.toLowerCase();
        const exists = state.characterTagFilters.some(
          (t) => t.toLowerCase() === lower,
        );
        if (exists) {
          state.characterTagFilters = state.characterTagFilters.filter(
            (t) => t.toLowerCase() !== lower,
          );
        } else {
          state.characterTagFilters.push(tag);
        }
        saveUiState();
        renderCharacterTagFilterChips();
        renderCharacters();
      });
      tagsWrap.appendChild(chip);
    });
    if (tags.length > 3) {
      const more = document.createElement("button");
      more.type = "button";
      more.className = "tag-more-btn";
      more.textContent = expanded ? t("less") : t("more");
      more.addEventListener("click", (e) => {
        e.stopPropagation();
        if (expanded) state.expandedCharacterTagIds.delete(Number(char.id));
        else state.expandedCharacterTagIds.add(Number(char.id));
        renderCharacters();
      });
      tagsWrap.appendChild(more);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const deleteCharBtn = iconButton("delete", t("deleteCharacterAria"), async (e) => {
      e.stopPropagation();
      await deleteCharacter(char.id);
    });
    deleteCharBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteCharBtn);

    actions.appendChild(
      iconButton("duplicate", t("duplicateCharacterAria"), async (e) => {
        e.stopPropagation();
        await duplicateCharacter(char.id);
      }),
    );

    actions.appendChild(
      iconButton("edit", t("editCharacterAria"), (e) => {
        e.stopPropagation();
        openCharacterModal(char);
      }),
    );

    actions.appendChild(
      iconButton("export", t("exportCharacterAria"), async (e) => {
        e.stopPropagation();
        await exportCharacter(char.id);
      }),
    );

    card.append(avatar, name, id, dates);
    if (tags.length > 0) card.appendChild(tagsWrap);
    card.append(actions);
    grid.appendChild(card);
  });
}

async function renderThreads() {
  const list = document.getElementById("thread-list");
  if (!list) return;
  const renderSeq = ++state.renderThreadsSeq;
  const previousScrollTop = Number(list?.scrollTop || 0);
  const threads = await db.threads.toArray();
  if (renderSeq !== state.renderThreadsSeq) return;
  threads.sort((a, b) => {
    const af = a.favorite ? 1 : 0;
    const bf = b.favorite ? 1 : 0;
    if (af !== bf) return bf - af;
    return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
  });

  const existingIds = new Set(threads.map((t) => Number(t.id)));
  state.selectedThreadIds = new Set(
    Array.from(state.selectedThreadIds).filter((id) =>
      existingIds.has(Number(id)),
    ),
  );

  list.innerHTML = "";
  if (threads.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = t("noThreadsYet");
    list.appendChild(empty);
    list.scrollTop = 0;
    return;
  }

  const bulkBar = document.createElement("div");
  bulkBar.className = "thread-bulk-bar";
  const selectedCount = state.selectedThreadIds.size;
  const selectAll = document.createElement("input");
  selectAll.type = "checkbox";
  selectAll.className = "thread-select thread-select-all thread-bulk-select";
  selectAll.title = t("selectAllThreads");
  selectAll.checked = selectedCount > 0 && selectedCount === threads.length;
  selectAll.indeterminate = selectedCount > 0 && selectedCount < threads.length;
  selectAll.addEventListener("change", () => {
    if (selectAll.checked) {
      threads.forEach((t) => state.selectedThreadIds.add(Number(t.id)));
    } else {
      state.selectedThreadIds.clear();
    }
    renderThreads();
  });
  const deleteSelectedBtn = iconButton("delete", t("deleteSelectedThreads"), async () => {
    await deleteSelectedThreads();
  });
  deleteSelectedBtn.classList.add("danger-icon-btn", "thread-bulk-delete");
  deleteSelectedBtn.disabled = selectedCount === 0;

  bulkBar.append(selectAll, deleteSelectedBtn);
  list.appendChild(bulkBar);

  const charIds = [
    ...new Set(threads.map((t) => t.characterId).filter(Boolean)),
  ];
  const queuePosByThreadId = new Map(
    state.generationQueue
      .map((id, i) => [Number(id), i + 1])
      .filter(([id]) => Number.isInteger(id)),
  );
  const characters = await db.characters.where("id").anyOf(charIds).toArray();
  if (renderSeq !== state.renderThreadsSeq) return;
  const charMap = new Map(characters.map((c) => [c.id, c]));

  threads.forEach((thread) => {
    const char = charMap.get(thread.characterId);
    const chatViewActive = document
      .getElementById("chat-view")
      ?.classList.contains("active");

    const row = document.createElement("div");
    row.className = "thread-row";
    row.dataset.threadId = String(thread.id);
    row.addEventListener("click", (e) => {
      if (e.target?.closest(".actions")) return;
      openThread(thread.id);
    });
    if (chatViewActive && currentThread?.id === thread.id) {
      row.classList.add("active-thread");
    }

    const selectBox = document.createElement("input");
    selectBox.type = "checkbox";
    selectBox.className = "thread-select";
    selectBox.checked = state.selectedThreadIds.has(Number(thread.id));
    selectBox.title = t("selectThread");
    selectBox.addEventListener("click", (e) => e.stopPropagation());
    selectBox.addEventListener("change", () => {
      if (selectBox.checked) state.selectedThreadIds.add(Number(thread.id));
      else state.selectedThreadIds.delete(Number(thread.id));
      renderThreads();
    });

    const avatar = document.createElement("img");
    avatar.className = "thread-avatar";
    avatar.src =
      char?.avatar || fallbackAvatar(char?.name || t("threadWord"), 512, 512);
    avatar.alt = "thread avatar";

    const info = document.createElement("div");
    info.className = "thread-info";

    const meta = document.createElement("div");
    meta.className = "thread-meta";
    meta.innerHTML = `<span>${escapeHtml(char?.name || "Unknown")}</span><span>#${thread.id}</span>`;
    const queuePos = queuePosByThreadId.get(Number(thread.id)) || 0;
    if (queuePos > 0) {
      const queueBadge = document.createElement("span");
      queueBadge.className = "thread-queue-badge";
      queueBadge.textContent = `Q${queuePos}`;
      const queueTitle = tf("threadQueueBadgeTitle", { position: queuePos });
      queueBadge.setAttribute("title", queueTitle);
      queueBadge.setAttribute("aria-label", queueTitle);
      meta.appendChild(queueBadge);
    }

    const titleBtn = document.createElement("button");
    titleBtn.className = "thread-title";
    titleBtn.textContent = thread.title || tf("threadTitleDefault", { id: thread.id });
    titleBtn.title = thread.title || tf("threadTitleDefault", { id: thread.id });
    titleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openThread(thread.id);
    });
    const titleRow = document.createElement("div");
    titleRow.className = "thread-title-row";
    const renameMiniBtn = iconButton("edit", t("renameThreadAria"), async (e) => {
      e.stopPropagation();
      await renameThread(thread.id);
    });
    renameMiniBtn.classList.add("thread-rename-mini");
    titleRow.append(titleBtn, renameMiniBtn);

    info.append(titleRow, meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const deleteThreadBtn = iconButton("delete", t("deleteThreadAria"), async (e) => {
      e.stopPropagation();
      await deleteThread(thread.id);
    });
    deleteThreadBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteThreadBtn);

    if (char) {
      actions.appendChild(
        iconButton("edit", t("editThreadCharacter"), async (e) => {
          e.stopPropagation();
          const latestCharacter = await db.characters.get(char.id);
          if (latestCharacter) openCharacterModal(latestCharacter);
        }),
      );
    }

    actions.appendChild(
      iconButton("duplicate", t("duplicateThreadAria"), async (e) => {
        e.stopPropagation();
        await duplicateThread(thread.id);
      }),
    );
    const favBtn = iconButton(
      thread.favorite ? "starFilled" : "star",
      thread.favorite ? t("unfavoriteThread") : t("favoriteThread"),
      async (e) => {
        e.stopPropagation();
        await toggleThreadFavorite(thread.id);
      },
    );
    favBtn.classList.add("favorite-btn");
    if (thread.favorite) favBtn.classList.add("is-favorite");
    actions.appendChild(favBtn);

    actions.prepend(selectBox);
    row.append(avatar, info, actions);
    if (!list.querySelector(`.thread-row[data-thread-id="${thread.id}"]`)) {
      list.appendChild(row);
    }
  });
  const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight);
  if (renderSeq !== state.renderThreadsSeq) return;
  list.scrollTop = Math.min(previousScrollTop, maxScroll);
}

async function deleteSelectedThreads() {
  const ids = Array.from(state.selectedThreadIds)
    .map(Number)
    .filter(Number.isInteger);
  if (ids.length === 0) return;
  const suffix = ids.length === 1 ? "" : "s";
  const ok = await openConfirmDialog(
    t("deleteThreadsTitle"),
    tf("deleteSelectedThreadsConfirm", { count: ids.length, suffix }),
  );
  if (!ok) return;

  for (const id of ids) {
    await db.threads.delete(id);
    broadcastSyncEvent({
      type: "thread-updated",
      threadId: id,
      updatedAt: Date.now(),
    });
  }

  if (currentThread && ids.includes(Number(currentThread.id))) {
    currentThread = null;
    currentCharacter = null;
    conversationHistory = [];
    showMainView();
  }

  state.selectedThreadIds.clear();
  await renderThreads();
  await renderCharacters();
  showToast(tf("deletedThreadsToast", { count: ids.length, suffix }), "success");
}

function iconButton(iconKey, ariaLabel, handler) {
  const btn = document.createElement("button");
  btn.className = "icon-btn";
  btn.type = "button";
  btn.innerHTML = ICONS[iconKey] || iconKey;
  btn.setAttribute("aria-label", ariaLabel);
  btn.setAttribute("title", ariaLabel);
  btn.addEventListener("click", handler);
  return btn;
}

function togglePane() {
  const pane = document.getElementById("left-pane");
  const shell = document.getElementById("app-shell");
  const createBtn = document.getElementById("create-character-btn");
  const importBtn = document.getElementById("import-character-btn");
  const homeBtn = document.getElementById("home-btn");
  pane.classList.toggle("collapsed");
  shell.classList.toggle(
    "pane-collapsed",
    pane.classList.contains("collapsed"),
  );
  document.getElementById("pane-toggle").textContent = pane.classList.contains(
    "collapsed",
  )
    ? ">"
    : "<";
  if (pane.classList.contains("collapsed")) {
    if (homeBtn) {
      homeBtn.textContent = "H";
      homeBtn.title = t("home");
    }
    createBtn.textContent = "+";
    createBtn.title = t("createCharacter");
    if (importBtn) {
      importBtn.textContent = "↥";
      importBtn.title = t("importCharacter");
    }
  } else {
    if (homeBtn) {
      homeBtn.textContent = t("home");
      homeBtn.title = "";
    }
    createBtn.textContent = t("createCharacter");
    createBtn.title = "";
    if (importBtn) {
      importBtn.textContent = `↥ ${t("importCharacter")}`;
      importBtn.title = "";
    }
  }
}

function showMainView() {
  stopTtsPlayback();
  document.getElementById("main-view").classList.add("active");
  document.getElementById("chat-view").classList.remove("active");
  updateThreadRenameButtonState();
  updateAutoTtsToggleButton();
  renderThreads().catch(() => {});
  updateScrollBottomButtonVisibility();
  scheduleThreadBudgetIndicatorUpdate();
}

function showChatView() {
  document.getElementById("chat-view").classList.add("active");
  document.getElementById("main-view").classList.remove("active");
  updateThreadRenameButtonState();
  updateAutoTtsToggleButton();
  setSendingState(state.sending);
  renderThreads().catch(() => {});
  updateScrollBottomButtonVisibility();
}

function openModal(modalId) {
  closeActiveModal();
  const modal = document.getElementById(modalId);
  if (!modal) return;
  state.activeModalId = modalId;
  modal.classList.remove("hidden");
  state.modalDirty[modalId] = false;
  if (modalId === "personas-modal") {
    renderPersonaModalList();
  } else if (modalId === "settings-modal") {
    const firstTab = document.querySelector('[data-settings-tab-btn="appearance"]');
    if (firstTab instanceof HTMLButtonElement) firstTab.click();
    updateToastDelayDisplay();
    populateSettingsModels().catch(() => {});
  } else if (modalId === "shortcuts-modal") {
    document.getElementById("shortcuts-raw").value =
      state.settings.shortcutsRaw || "";
  } else if (modalId === "lore-modal") {
    closeLoreEditor();
    renderLorebookManagementList().catch(() => {});
  } else if (modalId === "tags-modal") {
    const input = document.getElementById("tag-manager-input");
    if (input) input.value = "";
    renderTagManagerList();
    updateTagManagerAddButtonState();
  }
}

function closeActiveModal() {
  if (!state.activeModalId) return;
  const closingId = state.activeModalId;
  if (closingId === "text-input-modal") {
    resolveTextInputDialog(false);
    return;
  }
  const modal = document.getElementById(state.activeModalId);
  modal?.classList.add("hidden");
  state.activeModalId = null;
  state.modalDirty[closingId] = false;
}

async function openCharacterModal(character = null) {
  state.charModalTtsTestPlaying = false;
  state.editingCharacterId = character?.id || null;
  document.getElementById("character-title").textContent =
    state.editingCharacterId ? t("editCharacterTitle") : t("createCharacterTitle");

  document.getElementById("char-name").value = character?.name || "";
  updateNameLengthCounter("char-name", "char-name-count", 128);
  document.getElementById("char-avatar").value = character?.avatar || "";
  document.getElementById("char-avatar-file").value = "";
  document.getElementById("char-system-prompt").value =
    character?.systemPrompt || "";
  await populateCharDefaultPersonaOverrideSelect(
    character?.defaultPersonaOverrideId || null,
  );
  document.getElementById("char-one-time-extra-prompt").value =
    character?.oneTimeExtraPrompt || "";
  document.getElementById("char-writing-instructions").value =
    character?.writingInstructions || "";
  document.getElementById("char-initial-messages").value =
    character?.initialMessagesRaw ||
    ((character?.initialMessages || []).length > 0
      ? formatInitialMessagesForEditor(character?.initialMessages || [])
      : "");
  setCharacterTagsInputValue(character?.tags || []);
  renderCharacterTagPresetButtons();
  document.getElementById("char-persona-injection-placement").value =
    character?.personaInjectionPlacement || "end_system_prompt";
  document.getElementById("char-use-memory").checked =
    character?.useMemory !== false;
  document.getElementById("char-use-postprocess").checked =
    character?.usePostProcessing !== false;
  document.getElementById("char-auto-trigger-first-ai").checked =
    character?.autoTriggerAiFirstMessage !== false;
  document.getElementById("char-avatar-scale").value = String(
    Number(character?.avatarScale) || 1,
  );
  const lang = String(character?.ttsLanguage || DEFAULT_TTS_LANGUAGE);
  const voice = String(character?.ttsVoice || DEFAULT_TTS_VOICE);
  const rate = Number.isFinite(Number(character?.ttsRate))
    ? Number(character.ttsRate)
    : 1.4;
  const pitch = Number.isFinite(Number(character?.ttsPitch))
    ? Number(character.ttsPitch)
    : 1.1;
  document.getElementById("char-tts-language").value = lang;
  populateCharTtsLanguageSelect(lang);
  populateCharTtsVoiceSelect(voice);
  document.getElementById("char-tts-rate").value = String(
    Math.max(0.5, Math.min(2, rate)),
  );
  document.getElementById("char-tts-pitch").value = String(
    Math.max(0, Math.min(2, pitch)),
  );
  updateCharTtsRatePitchLabels();
  updateCharTtsTestButtonState();
  renderAvatarPreview(character?.avatar || "");
  renderCharacterLorebookList(character?.lorebookIds || []);
  updateCharacterPromptPlaceholder();
  state.modalDirty["character-modal"] = false;

  openModal("character-modal");
}

async function saveCharacterFromModal() {
  const selectedLorebookIds = getSelectedLorebookIds();
  const selectedTts = getResolvedCharTtsSelection();
  let parsedInitialMessages = null;
  try {
    parsedInitialMessages = parseInitialMessagesInput(
      document.getElementById("char-initial-messages").value,
    );
  } catch (err) {
    await openInfoDialog(
      t("invalidInitialMessagesTitle"),
      String(err?.message || t("invalidInitialMessagesMessage")),
    );
    return;
  }
  const payload = {
    name: document.getElementById("char-name").value.trim(),
    systemPrompt: document.getElementById("char-system-prompt").value.trim(),
    defaultPersonaOverrideId:
      Number(document.getElementById("char-default-persona-override").value) ||
      null,
    oneTimeExtraPrompt: document
      .getElementById("char-one-time-extra-prompt")
      .value.trim(),
    writingInstructions: document
      .getElementById("char-writing-instructions")
      .value.trim(),
    initialMessagesRaw: parsedInitialMessages.raw,
    initialMessages: parsedInitialMessages.messages,
    useMemory: document.getElementById("char-use-memory").checked,
    usePostProcessing: document.getElementById("char-use-postprocess").checked,
    autoTriggerAiFirstMessage: document.getElementById(
      "char-auto-trigger-first-ai",
    ).checked,
    personaInjectionPlacement:
      document.getElementById("char-persona-injection-placement").value ||
      "end_system_prompt",
    avatarScale:
      Number(document.getElementById("char-avatar-scale").value) || 1,
    tags: getCharacterTagsFromModal(),
    ttsVoice: selectedTts.voice,
    ttsLanguage: selectedTts.language,
    ttsRate: selectedTts.rate,
    ttsPitch: selectedTts.pitch,
    lorebookIds: selectedLorebookIds,
    avatar: document.getElementById("char-avatar").value.trim(),
    updatedAt: Date.now(),
  };

  if (!payload.name) {
    await openInfoDialog(t("missingFieldTitle"), t("characterNameRequired"));
    return;
  }

  const tagsUpdated = mergeTagsIntoCatalog(payload.tags);
  if (tagsUpdated) {
    renderTagPresetsDataList();
    renderCharacterTagPresetButtons();
    renderCharacterTagFilterChips();
  }

  if (state.editingCharacterId) {
    await db.characters.update(state.editingCharacterId, payload);
    if (
      currentCharacter &&
      Number(currentCharacter.id) === Number(state.editingCharacterId)
    ) {
      currentCharacter = { ...currentCharacter, ...payload };
      renderChat();
    }
    showToast(t("characterUpdated"), "success");
  } else {
    payload.createdAt = Date.now();
    await db.characters.add(payload);
    showToast(t("characterCreated"), "success");
  }

  closeActiveModal();
  state.modalDirty["character-modal"] = false;
  await renderAll();
}

function populateCharTtsLanguageSelect(
  preferredLanguage = DEFAULT_TTS_LANGUAGE,
) {
  const languageSelect = document.getElementById("char-tts-language");
  if (!languageSelect) return;
  const voices = hasBrowserTtsSupport()
    ? window.speechSynthesis.getVoices?.() || []
    : [];
  const langs = Array.from(
    new Set(voices.map((v) => String(v.lang || "").trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
  if (langs.length === 0) {
    langs.push(DEFAULT_TTS_LANGUAGE);
  }
  languageSelect.innerHTML = "";
  langs.forEach((code) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = code;
    languageSelect.appendChild(opt);
  });
  const hasPreferred = langs.includes(preferredLanguage);
  languageSelect.value = hasPreferred ? preferredLanguage : langs[0];
}

function populateCharTtsVoiceSelect(preferredVoice = DEFAULT_TTS_VOICE) {
  const languageSelect = document.getElementById("char-tts-language");
  const voiceSelect = document.getElementById("char-tts-voice");
  if (!languageSelect || !voiceSelect) return;
  const selectedLang = String(languageSelect.value || DEFAULT_TTS_LANGUAGE);
  const voices = hasBrowserTtsSupport()
    ? window.speechSynthesis.getVoices?.() || []
    : [];
  const filtered = voices.filter(
    (v) => String(v.lang || "").toLowerCase() === selectedLang.toLowerCase(),
  );
  const candidates = filtered.length ? filtered : voices;
  const names = Array.from(
    new Set(candidates.map((v) => String(v.name || "").trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
  if (names.length === 0) {
    names.push(DEFAULT_TTS_VOICE);
  }
  voiceSelect.innerHTML = "";
  names.forEach((voice) => {
    const opt = document.createElement("option");
    opt.value = voice;
    opt.textContent = voice;
    voiceSelect.appendChild(opt);
  });
  const hasPreferred = names.includes(preferredVoice);
  voiceSelect.value = hasPreferred ? preferredVoice : names[0];
}

function updateCharTtsRatePitchLabels() {
  const rate = document.getElementById("char-tts-rate");
  const pitch = document.getElementById("char-tts-pitch");
  const rateValue = document.getElementById("char-tts-rate-value");
  const pitchValue = document.getElementById("char-tts-pitch-value");
  if (rate && rateValue)
    rateValue.textContent = Number(rate.value || 1).toFixed(1);
  if (pitch && pitchValue)
    pitchValue.textContent = Number(pitch.value || 1).toFixed(1);
}

function getResolvedTtsSelection(
  languageInput,
  voiceInput,
  rateInput,
  pitchInput,
) {
  const language =
    String(languageInput || DEFAULT_TTS_LANGUAGE).trim() ||
    DEFAULT_TTS_LANGUAGE;
  const voice =
    String(voiceInput || DEFAULT_TTS_VOICE).trim() || DEFAULT_TTS_VOICE;
  const rate = Math.max(0.5, Math.min(2, Number(rateInput) || 1.4));
  const pitch = Math.max(0, Math.min(2, Number(pitchInput) || 1.1));
  return {
    language,
    voice,
    rate,
    pitch,
  };
}

function getResolvedCharTtsSelection() {
  return getResolvedTtsSelection(
    document.getElementById("char-tts-language")?.value,
    document.getElementById("char-tts-voice")?.value,
    document.getElementById("char-tts-rate")?.value,
    document.getElementById("char-tts-pitch")?.value,
  );
}

async function renderPersonaSelector() {
  await ensurePersonasInitialized();
  const select = document.getElementById("persona-select");
  const personas = await getOrderedPersonas();
  select.innerHTML = "";

  personas.forEach((persona) => {
    const opt = document.createElement("option");
    opt.value = String(persona.id);
    opt.textContent = `${persona.name || `Persona ${persona.id}`}${persona.isDefault ? ` (${t("defaultSuffix")})` : ""}`;
    select.appendChild(opt);
  });

  const defaultPersona = await getCharacterDefaultPersona(currentCharacter);
  const requestedId = Number(currentThread?.selectedPersonaId);
  const existing = requestedId
    ? personas.find((p) => p.id === requestedId)
    : null;
  const effective = existing || defaultPersona || personas[0] || null;

  currentPersona = effective || null;
  select.value = effective ? String(effective.id) : "";
  updatePersonaPickerDisplay();

  if (
    currentThread &&
    effective &&
    Number(currentThread.selectedPersonaId) !== Number(effective.id)
  ) {
    currentThread.selectedPersonaId = effective.id;
    await db.threads.update(currentThread.id, {
      selectedPersonaId: effective.id,
      updatedAt: Date.now(),
    });
  }
}

async function onPersonaSelectChange() {
  const select = document.getElementById("persona-select");
  const personaId = Number(select.value);
  currentPersona = personaId
    ? await db.personas.get(personaId)
    : await getCharacterDefaultPersona(currentCharacter);
  updatePersonaPickerDisplay();
  if (!currentThread) return;
  const updatedAt = Date.now();
  currentThread.selectedPersonaId = currentPersona?.id || null;
  state.lastSyncSeenUpdatedAt = updatedAt;
  await db.threads.update(currentThread.id, {
    selectedPersonaId: currentThread.selectedPersonaId,
    updatedAt,
  });
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: currentThread.id,
    updatedAt,
  });
  showToast(
    tf("personaSwitched", { name: currentPersona?.name || "You" }),
    "success",
  );
}

function updatePersonaPickerDisplay() {
  const img = document.getElementById("persona-selected-avatar");
  if (!img) return;
  const name = currentPersona?.name || "You";
  img.src = currentPersona?.avatar || fallbackAvatar(name, 512, 512);
  img.alt = `${name} avatar`;
}

async function savePersonaFromModal() {
  const personas = await getOrderedPersonas();
  const name = document.getElementById("persona-name").value.trim();
  const avatar = document.getElementById("persona-avatar").value.trim();
  const description = document
    .getElementById("persona-description")
    .value.trim();
  const internalDescription = document
    .getElementById("persona-internal-description")
    .value.trim();
  const wantsDefault = document.getElementById("persona-is-default").checked;

  if (!name) {
    await openInfoDialog(t("missingFieldTitle"), t("personaNameRequired"));
    return;
  }
  if (description.length > 100) {
    await openInfoDialog(
      t("personaDescriptionTitle"),
      t("personaDescriptionLimit"),
    );
    return;
  }

  const shouldBeDefault = wantsDefault || personas.length === 0;

  if (shouldBeDefault) {
    await db.personas.toCollection().modify({ isDefault: false });
  }

  if (state.editingPersonaId) {
    await db.personas.update(state.editingPersonaId, {
      name,
      avatar,
      description,
      internalDescription,
      isDefault: shouldBeDefault,
      updatedAt: Date.now(),
    });
    showToast(t("personaUpdated"), "success");
  } else {
    await db.personas.add({
      name,
      avatar,
      description,
      internalDescription,
      isDefault: shouldBeDefault,
      order: personas.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    showToast(t("personaCreated"), "success");
  }

  document.getElementById("persona-name").value = "";
  updateNameLengthCounter("persona-name", "persona-name-count", 64);
  document.getElementById("persona-avatar").value = "";
  document.getElementById("persona-avatar-file").value = "";
  document.getElementById("persona-description").value = "";
  document.getElementById("persona-internal-description").value = "";
  updateNameLengthCounter("persona-description", "persona-description-count", 100);
  document.getElementById("persona-is-default").checked = false;
  state.editingPersonaId = null;
  document.getElementById("save-persona-btn").textContent = t("savePersona");
  state.modalDirty["personas-modal"] = false;

  await ensurePersonasInitialized();
  await renderPersonaModalList();
  await renderPersonaSelector();
  broadcastSyncEvent({ type: "personas-updated" });
}

async function renderPersonaModalList() {
  const list = document.getElementById("persona-list");
  if (!list) return;
  const personas = await getOrderedPersonas();
  const defaultCheck = document.getElementById("persona-is-default");
  if (defaultCheck) {
    defaultCheck.checked = personas.length === 0;
  }
  list.innerHTML = "";

  if (personas.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = t("noPersonasYet");
    list.appendChild(empty);
    return;
  }

  personas.forEach((persona) => {
    const row = document.createElement("div");
    row.className = "persona-row";
    row.draggable = true;
    row.dataset.personaId = String(persona.id);
    row.addEventListener("dragstart", onPersonaDragStart);
    row.addEventListener("dragover", onPersonaDragOver);
    row.addEventListener("drop", onPersonaDrop);
    row.addEventListener("dragend", onPersonaDragEnd);

    const drag = document.createElement("span");
    drag.className = "persona-drag";
    drag.textContent = ":::";
    drag.title = t("dragToReorder");

    const avatar = document.createElement("img");
    avatar.className = "thread-avatar";
    avatar.src =
      persona.avatar || fallbackAvatar(persona.name || "P", 512, 512);
    avatar.alt = "persona avatar";
    avatar.classList.add("clickable-avatar");
    avatar.addEventListener("click", (e) => {
      e.stopPropagation();
      openImagePreview(avatar.src);
    });

    const info = document.createElement("div");
    info.className = "thread-info";
    const title = document.createElement("div");
    title.className = "thread-title";
    title.textContent = `${persona.name}${persona.isDefault ? ` (${t("defaultSuffix")})` : ""}`;
    const desc = document.createElement("div");
    desc.className = "thread-meta";
    desc.textContent = persona.description || "";
    info.append(title, desc);

    const actions = document.createElement("div");
    actions.className = "actions";
    if (!persona.isDefault) {
      actions.appendChild(
        iconButton("badge", t("setDefaultPersona"), async () => {
          await setDefaultPersona(persona.id);
        }),
      );
    }
    actions.appendChild(
      iconButton("edit", t("editPersonaAria"), async () => {
        loadPersonaForEditing(persona);
      }),
    );
    const deleteBtn = iconButton("delete", t("deletePersonaTitle"), async () => {
      await deletePersona(persona.id);
    });
    deleteBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteBtn);

    row.append(drag, avatar, info, actions);
    list.appendChild(row);
  });
}

async function deletePersona(personaId) {
  const ok = await openConfirmDialog(t("deletePersonaTitle"), t("deletePersonaConfirm"));
  if (!ok) return;
  const persona = await db.personas.get(personaId);
  await db.personas.delete(personaId);

  const threads = await db.threads
    .filter((t) => Number(t.selectedPersonaId) === Number(personaId))
    .toArray();
  await Promise.all(
    threads.map((t) =>
      db.threads.update(t.id, {
        selectedPersonaId: null,
        updatedAt: Date.now(),
      }),
    ),
  );

  if (currentThread?.selectedPersonaId === personaId) {
    currentThread.selectedPersonaId = null;
    currentPersona = null;
  }

  if (persona?.isDefault) {
    await ensurePersonasInitialized();
  } else {
    await normalizePersonaOrder();
  }

  await renderPersonaSelector();
  await renderPersonaModalList();
  broadcastSyncEvent({ type: "personas-updated" });
  showToast(t("personaDeleted"), "success");
}

function loadPersonaForEditing(persona) {
  state.editingPersonaId = persona.id;
  document.getElementById("persona-name").value = persona.name || "";
  updateNameLengthCounter("persona-name", "persona-name-count", 64);
  document.getElementById("persona-avatar").value = persona.avatar || "";
  document.getElementById("persona-avatar-file").value = "";
  document.getElementById("persona-description").value =
    persona.description || "";
  document.getElementById("persona-internal-description").value =
    persona.internalDescription || "";
  updateNameLengthCounter("persona-description", "persona-description-count", 100);
  document.getElementById("persona-is-default").checked = !!persona.isDefault;
  document.getElementById("save-persona-btn").textContent = t("updatePersona");
}

async function getOrderedPersonas() {
  const personas = await db.personas.toArray();
  return personas.sort((a, b) => {
    const ao = Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER;
    const bo = Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

async function getDefaultPersona() {
  const personas = await getOrderedPersonas();
  return personas.find((p) => p.isDefault) || null;
}

async function getCharacterDefaultPersona(character) {
  const overrideId = Number(character?.defaultPersonaOverrideId);
  if (Number.isInteger(overrideId) && overrideId > 0) {
    const overridePersona = await db.personas.get(overrideId);
    if (overridePersona) return overridePersona;
  }
  return getDefaultPersona();
}

async function populateCharDefaultPersonaOverrideSelect(selectedId = null) {
  await ensurePersonasInitialized();
  const select = document.getElementById("char-default-persona-override");
  if (!select) return;
  const personas = await getOrderedPersonas();
  select.innerHTML = "";
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = t("useGlobalDefault");
  select.appendChild(defaultOpt);
  personas.forEach((persona) => {
    const opt = document.createElement("option");
    opt.value = String(persona.id);
    opt.textContent = `${persona.name || `Persona ${persona.id}`}${persona.isDefault ? ` (${t("globalDefaultSuffix")})` : ""}`;
    select.appendChild(opt);
  });
  const targetId = Number(selectedId);
  if (Number.isInteger(targetId) && targetId > 0) {
    const exists = personas.some((p) => Number(p.id) === targetId);
    select.value = exists ? String(targetId) : "";
  } else {
    select.value = "";
  }
}

async function ensurePersonasInitialized() {
  const personas = await getOrderedPersonas();
  if (personas.length === 0) {
    await db.personas.add({
      name: "You",
      avatar: "",
      description: "",
      internalDescription: "",
      isDefault: true,
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return;
  }

  await normalizePersonaOrder();

  const hasDefault = personas.some((p) => p.isDefault);
  if (!hasDefault) {
    const first = (await getOrderedPersonas())[0];
    if (first) {
      await setDefaultPersona(first.id);
    }
  }
}

async function setDefaultPersona(personaId) {
  await db.transaction("rw", db.personas, async () => {
    await db.personas.toCollection().modify({ isDefault: false });
    await db.personas.update(personaId, {
      isDefault: true,
      updatedAt: Date.now(),
    });
  });
  if (!currentPersona || Number(currentPersona.id) === Number(personaId)) {
    currentPersona = await db.personas.get(personaId);
  }
  await renderPersonaSelector();
  await renderPersonaModalList();
  broadcastSyncEvent({ type: "personas-updated" });
  showToast(t("defaultPersonaUpdated"), "success");
}

async function normalizePersonaOrder() {
  const personas = await getOrderedPersonas();
  await Promise.all(
    personas.map((p, index) => db.personas.update(p.id, { order: index })),
  );
}

function onPersonaDragStart(e) {
  const row = e.currentTarget;
  state.draggingPersonaId = Number(row.dataset.personaId);
  row.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function onPersonaDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

async function onPersonaDrop(e) {
  e.preventDefault();
  const targetId = Number(e.currentTarget.dataset.personaId);
  const draggedId = Number(state.draggingPersonaId);
  if (!draggedId || !targetId || draggedId === targetId) return;

  const personas = await getOrderedPersonas();
  const from = personas.findIndex((p) => p.id === draggedId);
  const to = personas.findIndex((p) => p.id === targetId);
  if (from < 0 || to < 0) return;

  const [moved] = personas.splice(from, 1);
  personas.splice(to, 0, moved);

  await Promise.all(
    personas.map((p, index) =>
      db.personas.update(p.id, { order: index, updatedAt: Date.now() }),
    ),
  );

  await renderPersonaModalList();
  await renderPersonaSelector();
  broadcastSyncEvent({ type: "personas-updated" });
}

function onPersonaDragEnd(e) {
  e.currentTarget.classList.remove("dragging");
  state.draggingPersonaId = null;
}

function onPersonaAvatarFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    openInfoDialog(t("invalidFileTitle"), t("pleaseChooseImageFile"));
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const result = typeof reader.result === "string" ? reader.result : "";
    document.getElementById("persona-avatar").value = result;
  };
  reader.readAsDataURL(file);
}

function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function formatDateTime(value) {
  const ts = Number(value || 0);
  if (!Number.isFinite(ts) || ts <= 0) return "-";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "-";
  }
}

function parseCsvValues(value) {
  return String(value || "")
    .split(",")
    .map((v) => normalizeTagValue(v))
    .filter(Boolean)
    .filter(
      (v, i, arr) => arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i,
    );
}

function normalizeLorebookEntry(entry, fallbackIndex = 0) {
  const keys = Array.isArray(entry?.keys)
    ? entry.keys
    : parseCsvValues(entry?.key || "");
  const secondaryKeys = Array.isArray(entry?.secondaryKeys)
    ? entry.secondaryKeys
    : parseCsvValues(entry?.keysecondary || "");
  return {
    id: Number(entry?.id) || Date.now() + fallbackIndex,
    keys: keys.map((k) => normalizeTagValue(k)).filter(Boolean),
    secondaryKeys: secondaryKeys.map((k) => normalizeTagValue(k)).filter(Boolean),
    content: String(entry?.content || "").trim(),
  };
}

function normalizeLorebookRecord(record) {
  if (!record || typeof record !== "object") return null;
  const entriesRaw = Array.isArray(record.entries)
    ? record.entries
    : record.entries && typeof record.entries === "object"
      ? Object.values(record.entries)
      : [];
  const entries = entriesRaw
    .map((entry, idx) => normalizeLorebookEntry(entry, idx))
    .filter((entry) => entry && entry.content);
  return {
    id: record.id,
    name: String(record.name || "").trim(),
    avatar: String(record.avatar || "").trim(),
    description: String(record.description || "").slice(0, 512),
    scanDepth: Math.max(5, Math.min(100, Number(record.scanDepth) || 50)),
    tokenBudget: Math.max(100, Math.min(1000, Number(record.tokenBudget) || 200)),
    recursiveScanning: record.recursiveScanning === true,
    entries,
    createdAt: Number(record.createdAt) || Date.now(),
    updatedAt: Number(record.updatedAt) || Date.now(),
  };
}

async function getAllLorebooks() {
  const all = await db.lorebooks.toArray();
  return all
    .map((entry) => normalizeLorebookRecord(entry))
    .filter(Boolean)
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
}

function addLoreEntryEditor(entry = null) {
  state.lore.entries.push(
    normalizeLorebookEntry(
      entry || {
        id: Date.now() + state.lore.entries.length,
        keys: [],
        secondaryKeys: [],
        content: "",
      },
      state.lore.entries.length,
    ),
  );
  state.modalDirty["lore-modal"] = true;
}

function closeLoreEditor() {
  state.lore.editingId = null;
  state.lore.entries = [];
  document.getElementById("lore-list-view")?.classList.remove("hidden");
  document.getElementById("lore-editor-view")?.classList.add("hidden");
}

function openLoreEditor(lorebook = null) {
  const normalized = normalizeLorebookRecord(lorebook || {});
  state.lore.editingId = normalized?.id || null;
  state.lore.entries = Array.isArray(normalized?.entries)
    ? normalized.entries.map((e, idx) => normalizeLorebookEntry(e, idx))
    : [];

  document.getElementById("lore-name").value = normalized?.name || "";
  document.getElementById("lore-avatar").value = normalized?.avatar || "";
  document.getElementById("lore-description").value = normalized?.description || "";
  document.getElementById("lore-scan-depth").value = String(
    normalized?.scanDepth || 50,
  );
  document.getElementById("lore-token-budget").value = String(
    normalized?.tokenBudget || 200,
  );
  document.getElementById("lore-recursive-scanning").checked =
    normalized?.recursiveScanning === true;

  if (state.lore.entries.length === 0) addLoreEntryEditor();
  renderLoreEntryEditors();
  document.getElementById("lore-list-view")?.classList.add("hidden");
  document.getElementById("lore-editor-view")?.classList.remove("hidden");
  state.modalDirty["lore-modal"] = false;
}

function renderLoreEntryEditors() {
  const root = document.getElementById("lore-entries-list");
  if (!root) return;
  root.innerHTML = "";
  state.lore.entries.forEach((entry, index) => {
    const card = document.createElement("div");
    card.className = "lore-entry-card";

    const head = document.createElement("div");
    head.className = "lore-entry-title";
    const label = document.createElement("span");
    label.textContent = `Entry ${String(index + 1).padStart(2, "0")}`;
    const delBtn = iconButton("delete", "Delete entry", () => {
      state.lore.entries.splice(index, 1);
      if (state.lore.entries.length === 0) addLoreEntryEditor();
      state.modalDirty["lore-modal"] = true;
      renderLoreEntryEditors();
    });
    delBtn.classList.add("danger-icon-btn");
    head.append(label, delBtn);

    const keysInput = document.createElement("textarea");
    keysInput.rows = 2;
    keysInput.placeholder = "Keys (comma-separated)";
    keysInput.value = (entry.keys || []).join(", ");
    keysInput.addEventListener("input", () => {
      entry.keys = parseCsvValues(keysInput.value);
      state.modalDirty["lore-modal"] = true;
    });

    const secondaryInput = document.createElement("textarea");
    secondaryInput.rows = 2;
    secondaryInput.placeholder = "Secondary Keys (comma-separated, optional)";
    secondaryInput.value = (entry.secondaryKeys || []).join(", ");
    secondaryInput.addEventListener("input", () => {
      entry.secondaryKeys = parseCsvValues(secondaryInput.value);
      state.modalDirty["lore-modal"] = true;
    });

    const contentInput = document.createElement("textarea");
    contentInput.rows = 8;
    contentInput.maxLength = 10480;
    contentInput.placeholder = "Entry content";
    contentInput.value = entry.content || "";
    contentInput.addEventListener("input", () => {
      entry.content = String(contentInput.value || "");
      state.modalDirty["lore-modal"] = true;
    });

    card.append(head, keysInput, secondaryInput, contentInput);
    root.appendChild(card);
  });
}

async function renderLorebookManagementList() {
  const list = document.getElementById("lorebook-list");
  if (!list) return;
  const lorebooks = await getAllLorebooks();
  const characters = await db.characters.toArray();
  list.innerHTML = "";
  if (lorebooks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No lore books yet.";
    list.appendChild(empty);
    return;
  }

  lorebooks.forEach((lorebook) => {
    const users = characters.filter((char) =>
      Array.isArray(char.lorebookIds) &&
      char.lorebookIds.map(Number).includes(Number(lorebook.id)),
    );

    const row = document.createElement("div");
    row.className = "lorebook-row";

    const avatar = document.createElement("img");
    avatar.className = "lorebook-avatar";
    avatar.src =
      lorebook.avatar || fallbackAvatar(lorebook.name || "LB", 512, 512);
    avatar.alt = `${lorebook.name || "Lore Book"} avatar`;
    avatar.classList.add("clickable-avatar");
    avatar.addEventListener("click", (e) => {
      e.stopPropagation();
      openImagePreview(avatar.src);
    });

    const main = document.createElement("div");
    main.className = "lorebook-main";
    const title = document.createElement("div");
    title.className = "lorebook-title";
    title.textContent = lorebook.name || "Untitled Lore Book";
    const meta = document.createElement("div");
    meta.className = "lorebook-meta";
    meta.textContent = `Created: ${formatDateTime(lorebook.createdAt)}\nUpdated: ${formatDateTime(lorebook.updatedAt)}`;
    meta.style.whiteSpace = "pre-line";
    const usage = document.createElement("div");
    usage.className = "lorebook-usage";
    const usageLabel = document.createElement("span");
    usageLabel.className = "muted";
    usageLabel.textContent = "Used by:";
    usage.appendChild(usageLabel);
    if (users.length === 0) {
      const none = document.createElement("span");
      none.className = "muted";
      none.textContent = "none";
      usage.appendChild(none);
    } else {
      users.forEach((char) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "lorebook-usage-btn";
        chip.textContent = char.name || `Character #${char.id}`;
        chip.addEventListener("click", async () => {
          await openCharacterModal(char);
          const target = document.getElementById("char-lorebooks-list");
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.classList.add("char-lore-focus");
            window.setTimeout(() => target.classList.remove("char-lore-focus"), 1400);
          }
        });
        usage.appendChild(chip);
      });
    }
    main.append(title, meta, usage);

    const actions = document.createElement("div");
    actions.className = "lorebook-actions";
    actions.appendChild(
      iconButton("edit", "Edit lore book", () => openLoreEditor(lorebook)),
    );
    actions.appendChild(
      iconButton("duplicate", "Duplicate lore book", async () => {
        await duplicateLorebook(lorebook.id);
      }),
    );
    const exportBtn = iconButton("export", "Export lore book", async () => {
      showToast(t("loreExportSoon"), "success");
    });
    exportBtn.disabled = true;
    actions.appendChild(exportBtn);
    const deleteBtn = iconButton("delete", t("deleteLoreBookAria"), async () => {
      await deleteLorebook(lorebook.id);
    });
    deleteBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteBtn);

    row.append(avatar, main, actions);
    list.appendChild(row);
  });
}

async function collectLorebookFromEditor() {
  const name = String(document.getElementById("lore-name")?.value || "").trim();
  const description = String(
    document.getElementById("lore-description")?.value || "",
  )
    .trim()
    .slice(0, 512);
  const avatar = String(document.getElementById("lore-avatar")?.value || "").trim();
  const scanDepth = Math.max(
    5,
    Math.min(100, Number(document.getElementById("lore-scan-depth")?.value) || 50),
  );
  const tokenBudget = Math.max(
    100,
    Math.min(
      1000,
      Number(document.getElementById("lore-token-budget")?.value) || 200,
    ),
  );
  const recursiveScanning =
    document.getElementById("lore-recursive-scanning")?.checked === true;

  if (name.length < 2 || name.length > 128) {
    await openInfoDialog(
      "Invalid Lore Book",
      "Name must have between 2 and 128 characters.",
    );
    return null;
  }

  const entries = state.lore.entries
    .map((entry, idx) => ({
      id: Number(entry.id) || Date.now() + idx,
      keys: parseCsvValues((entry.keys || []).join(", ")),
      secondaryKeys: parseCsvValues((entry.secondaryKeys || []).join(", ")),
      content: String(entry.content || "").trim(),
    }))
    .filter((entry) => entry.keys.length > 0 || entry.content.length > 0);

  if (entries.length === 0) {
    await openInfoDialog(t("invalidLoreBookTitle"), t("loreAtLeastOneEntry"));
    return null;
  }
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (entry.keys.length === 0) {
      await openInfoDialog(
        "Invalid Lore Entry",
        `Entry ${i + 1} requires at least one key.`,
      );
      return null;
    }
    if (!entry.content || entry.content.length < 1 || entry.content.length > 10480) {
      await openInfoDialog(
        "Invalid Lore Entry",
        `Entry ${i + 1} content must be between 1 and 10480 characters.`,
      );
      return null;
    }
  }

  return {
    name,
    avatar,
    description,
    scanDepth,
    tokenBudget,
    recursiveScanning,
    entries,
    updatedAt: Date.now(),
  };
}

async function saveLorebookFromEditor() {
  const payload = await collectLorebookFromEditor();
  if (!payload) return;
  if (state.lore.editingId) {
    await db.lorebooks.update(state.lore.editingId, payload);
    showToast(t("loreUpdated"), "success");
  } else {
    payload.createdAt = Date.now();
    await db.lorebooks.add(payload);
    showToast(t("loreCreated"), "success");
  }
  state.modalDirty["lore-modal"] = false;
  closeLoreEditor();
  await renderLorebookManagementList();
  await renderCharacterLorebookList(getSelectedLorebookIds());
}

async function duplicateLorebook(lorebookId) {
  const source = await db.lorebooks.get(lorebookId);
  const normalized = normalizeLorebookRecord(source);
  if (!normalized) return;
  const copy = {
    ...normalized,
    name: `${normalized.name} Copy`,
    entries: normalized.entries.map((entry, idx) => ({
      ...entry,
      id: Date.now() + idx,
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  delete copy.id;
  await db.lorebooks.add(copy);
  await renderLorebookManagementList();
  await renderCharacterLorebookList(getSelectedLorebookIds());
  showToast(t("loreDuplicated"), "success");
}

async function deleteLorebook(lorebookId) {
  const lorebook = normalizeLorebookRecord(await db.lorebooks.get(lorebookId));
  if (!lorebook) return;
  const allCharacters = await db.characters.toArray();
  const affected = allCharacters.filter((char) =>
    Array.isArray(char.lorebookIds) &&
    char.lorebookIds.map(Number).includes(Number(lorebookId)),
  );
  let message = `Delete lore book "${lorebook.name}"?`;
  if (affected.length > 0) {
    const lines = affected
      .slice(0, 20)
      .map((char) => `- ${char.name || `Character #${char.id}`}`)
      .join("\n");
    const extra =
      affected.length > 20 ? `\n...and ${affected.length - 20} more.` : "";
    message += `\n\nUsed by:\n${lines}${extra}`;
  }
  const ok = await openConfirmDialog(t("deleteLoreBookTitle"), message);
  if (!ok) return;

  await db.transaction("rw", db.lorebooks, db.characters, async () => {
    await db.lorebooks.delete(lorebookId);
    for (const char of affected) {
      const next = (char.lorebookIds || []).filter(
        (id) => Number(id) !== Number(lorebookId),
      );
      await db.characters.update(char.id, {
        lorebookIds: next,
        updatedAt: Date.now(),
      });
    }
  });
  if (currentCharacter && Number(currentCharacter.id) > 0) {
    const refreshed = await db.characters.get(currentCharacter.id);
    if (refreshed) currentCharacter = refreshed;
  }
  await renderLorebookManagementList();
  await renderCharacters();
  await renderCharacterLorebookList(getSelectedLorebookIds());
  showToast(t("loreDeleted"), "success");
}

function hasMeaningfulAssistantMessage(history) {
  return (Array.isArray(history) ? history : []).some((m) => {
    if (normalizeApiRole(m?.apiRole || m?.role) !== "assistant") return false;
    if (m?.pending === true) return false;
    return String(m?.content || "").trim().length > 0;
  });
}

function shouldIncludeOneTimeExtraPrompt(history) {
  return !hasMeaningfulAssistantMessage(history);
}

function isFirstAssistantMessageIndex(index, history = conversationHistory) {
  const list = Array.isArray(history) ? history : [];
  const first = list.findIndex(
    (m) => normalizeApiRole(m?.apiRole || m?.role) === "assistant",
  );
  return first === index;
}

function updateCharacterPromptPlaceholder() {
  const promptInput = document.getElementById("char-system-prompt");
  promptInput.placeholder = state.settings.globalPromptTemplate || "";
}

async function renderCharacterLorebookList(selectedIds = []) {
  const root = document.getElementById("char-lorebooks-list");
  const allLore = await db.lorebooks.orderBy("id").toArray();
  const selected = new Set((selectedIds || []).map(Number));

  root.innerHTML = "";
  if (allLore.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No lore books available.";
    root.appendChild(empty);
    return;
  }

  allLore.forEach((entry) => {
    const label = document.createElement("label");
    label.className = "check-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(entry.id);
    checkbox.checked = selected.has(Number(entry.id));

    const text = document.createElement("span");
    text.textContent = `${entry.name || "Untitled"} (#${entry.id})`;

    label.append(checkbox, text);
    root.appendChild(label);
  });
}

function getSelectedLorebookIds() {
  return Array.from(
    document.querySelectorAll(
      "#char-lorebooks-list input[type='checkbox']:checked",
    ),
  )
    .map((el) => Number(el.value))
    .filter((id) => Number.isInteger(id));
}

function onAvatarUrlInput() {
  renderAvatarPreview(document.getElementById("char-avatar").value.trim());
}

function onTextAreaFileDragOver(e) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
}

async function onTextAreaFileDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  const file = e.dataTransfer?.files?.[0];
  if (!target || !file) return;
  try {
    const text = await file.text();
    target.value = String(text || "");
    target.dispatchEvent(new Event("input", { bubbles: true }));
    showToast(tf("loadedFileIntoField", { name: file.name }), "success");
  } catch {
    await openInfoDialog(t("dropFailedTitle"), t("dropReadFailed"));
  }
}

function onAvatarFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    openInfoDialog(t("invalidFileTitle"), t("pleaseChooseImageFile"));
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const result = typeof reader.result === "string" ? reader.result : "";
    document.getElementById("char-avatar").value = result;
    renderAvatarPreview(result);
  };
  reader.readAsDataURL(file);
}

function renderAvatarPreview(src) {
  const preview = document.getElementById("char-avatar-preview");
  const fallback = fallbackAvatar("C", 512, 512);
  preview.src = src || fallback;
}

async function duplicateCharacter(characterId) {
  const source = await db.characters.get(characterId);
  if (!source) return;
  const copy = {
    ...source,
    lorebookIds: Array.isArray(source.lorebookIds)
      ? [...source.lorebookIds]
      : [],
    tags: Array.isArray(source.tags) ? [...source.tags] : [],
    name: `${source.name} Copy`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  delete copy.id;
  await db.characters.add(copy);
  await renderCharacters();
  showToast(t("characterDuplicated"), "success");
}

async function exportCharacter(characterId) {
  const character = await db.characters.get(characterId);
  if (!character) {
    showToast(t("characterNotFound"), "error");
    return;
  }
  const payload = {
    schema: "rp-character-export-v1",
    exportedAt: new Date().toISOString(),
    character: { ...character },
  };
  delete payload.character.id;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (character.name || "character").replace(/[^\w-]+/g, "_");
  a.href = url;
  a.download = `${safeName}.rpchar.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(t("characterExported"), "success");
}

async function importCharacterFromFile(e) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const imported = parsed?.character || parsed;
    if (!imported || typeof imported !== "object") {
      throw new Error("Invalid character file");
    }
    const character = {
      ...imported,
      name: String(imported.name || "").trim(),
      tags: Array.isArray(imported.tags)
        ? imported.tags.map((t) => normalizeTagValue(t)).filter(Boolean)
        : parseTagList(imported.tags || ""),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    delete character.id;
    if (!character.name) throw new Error("Character name is required in file");
    await db.characters.add(character);
    await renderCharacters();
    showToast(t("characterImported"), "success");
  } catch (err) {
    showToast(tf("importFailed", { error: err.message }), "error");
  }
}

async function exportDatabaseBackup() {
  try {
    const payload = await buildDatabaseBackupPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const safeDate = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .replace("Z", "");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rp_llm_backend_backup_${safeDate}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    showToast(t("databaseExported"), "success");
  } catch (err) {
    showToast(
      tf("databaseExportFailed", { error: err.message || t("unknownError") }),
      "error",
    );
  }
}

async function importDatabaseBackupFromFile(e) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    validateDatabaseBackupPayload(parsed);

    const ok = await openConfirmDialog(
      t("importDatabase"),
      t("databaseImportConfirm"),
    );
    if (!ok) return;

    await restoreDatabaseBackupPayload(parsed);
    showToast(t("databaseImportedReloading"), "success");
    window.setTimeout(() => window.location.reload(), 600);
  } catch (err) {
    showToast(
      tf("databaseImportFailed", { error: err.message || t("unknownError") }),
      "error",
    );
  }
}

async function buildDatabaseBackupPayload() {
  const tables = {};
  for (const table of db.tables) {
    tables[table.name] = await table.toArray();
  }
  const localState = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("rp-")) continue;
    localState[key] = localStorage.getItem(key);
  }
  return {
    schema: "rp-db-backup-v1",
    exportedAt: new Date().toISOString(),
    dbName: db.name,
    dbVersion: Number(db.verno || 0),
    tables,
    localStorage: localState,
  };
}

function validateDatabaseBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid backup payload.");
  }
  if (String(payload.schema || "").trim() !== "rp-db-backup-v1") {
    throw new Error("Unsupported backup schema.");
  }
  if (!payload.tables || typeof payload.tables !== "object") {
    throw new Error("Backup does not contain tables.");
  }
}

async function restoreDatabaseBackupPayload(payload) {
  const tableMap = new Map(db.tables.map((table) => [table.name, table]));
  await db.transaction("rw", ...db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
    for (const [tableName, rows] of Object.entries(payload.tables || {})) {
      const table = tableMap.get(tableName);
      if (!table || !Array.isArray(rows) || rows.length === 0) continue;
      await table.bulkPut(rows);
    }
  });

  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith("rp-")) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
  Object.entries(payload.localStorage || {}).forEach(([key, value]) => {
    if (!key.startsWith("rp-")) return;
    localStorage.setItem(key, String(value ?? ""));
  });
}

async function deleteCharacter(characterId) {
  const ok = await openConfirmDialog(
    "Delete Character",
    "Delete this character and all related threads?",
  );
  if (!ok) return;

  await db.transaction(
    "rw",
    db.characters,
    db.threads,
    db.memories,
    db.sessions,
    async () => {
      await db.characters.delete(characterId);
      await db.threads.where("characterId").equals(characterId).delete();
      await db.memories.where("characterId").equals(characterId).delete();
      await db.sessions.where("characterId").equals(characterId).delete();
    },
  );

  if (currentCharacter?.id === characterId) {
    currentCharacter = null;
    currentThread = null;
    conversationHistory = [];
    showMainView();
  }

  await renderAll();
  showToast(t("characterDeleted"), "success");
}

async function startNewThread(characterId) {
  const character = await db.characters.get(characterId);
  if (!character) return;
  const defaultPersonaForCharacter = await getCharacterDefaultPersona(character);
  const initialMessages = await buildThreadInitialMessages(character);

  const newThread = {
    characterId,
    title: tf("threadTitleAtDate", { date: new Date().toLocaleString() }),
    titleGenerated: false,
    titleManual: false,
    messages: initialMessages,
    selectedPersonaId: defaultPersonaForCharacter?.id || null,
    autoTtsEnabled: false,
    lastPersonaInjectionPersonaId: null,
    pendingGenerationReason: "",
    pendingGenerationQueuedAt: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const threadId = await db.threads.add(newThread);
  broadcastSyncEvent({
    type: "thread-updated",
    threadId,
    updatedAt: newThread.updatedAt,
  });
  await renderThreads();
  await renderCharacters();
  await openThread(threadId);
  const shouldAutoTriggerFirstAi =
    (character?.autoTriggerAiFirstMessage ?? true) !== false;
  const shouldTriggerFromInitial =
    state.settings.autoReplyEnabled !== false &&
    shouldAutoReplyFromInitialMessages(initialMessages);
  const shouldTriggerWithoutInitial =
    shouldAutoTriggerFirstAi && initialMessages.length === 0;
  if (shouldTriggerFromInitial || shouldTriggerWithoutInitial) {
    await requestBotReplyForCurrentThread("new_thread_auto_first_reply");
  }
  showToast(t("threadCreated"), "success");
}

async function duplicateThread(threadId) {
  const source = await db.threads.get(threadId);
  if (!source) return;

  const copy = {
    characterId: source.characterId,
    title: `${source.title || tf("threadTitleDefault", { id: source.id })} Copy`,
    titleGenerated: false,
    titleManual: false,
    messages: [...(source.messages || [])],
    selectedPersonaId: source.selectedPersonaId || null,
    autoTtsEnabled: source.autoTtsEnabled === true,
    lastPersonaInjectionPersonaId: source.lastPersonaInjectionPersonaId || null,
    favorite: !!source.favorite,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const newThreadId = await db.threads.add(copy);
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: newThreadId,
    updatedAt: Date.now(),
  });
  await renderThreads();
  await renderCharacters();
  showToast(t("threadDuplicated"), "success");
}

async function toggleThreadFavorite(threadId) {
  const thread = await db.threads.get(threadId);
  if (!thread) return;
  const next = !thread.favorite;
  await db.threads.update(threadId, { favorite: next, updatedAt: Date.now() });
  if (currentThread?.id === threadId) {
    currentThread.favorite = next;
  }
  await renderThreads();
  broadcastSyncEvent({
    type: "thread-updated",
    threadId,
    updatedAt: Date.now(),
  });
  showToast(next ? t("threadFavorited") : t("threadUnfavorited"), "success");
}

async function deleteThread(threadId) {
  const ok = await openConfirmDialog(t("deleteThreadTitle"), t("deleteThreadConfirm"));
  if (!ok) return;

  state.generationQueue = state.generationQueue.filter(
    (id) => Number(id) !== Number(threadId),
  );
  await db.threads.delete(threadId);
  state.selectedThreadIds.delete(Number(threadId));
  broadcastSyncEvent({
    type: "thread-updated",
    threadId,
    updatedAt: Date.now(),
  });
  if (currentThread?.id === threadId) {
    currentThread = null;
    currentCharacter = null;
    conversationHistory = [];
    showMainView();
    updateAutoTtsToggleButton();
  }
  await renderThreads();
  await renderCharacters();
  showToast(t("threadDeleted"), "success");
}

async function openThread(threadId) {
  const thread = await db.threads.get(threadId);
  if (!thread) return;

  stopTtsPlayback();
  const character = await db.characters.get(thread.characterId);
  currentThread = thread;
  currentCharacter = character || null;
  conversationHistory = (thread.messages || []).map((m) => ({
    ...m,
    role: m.role === "ai" ? "assistant" : m.role,
  }));
  currentPersona = thread.selectedPersonaId
    ? await db.personas.get(thread.selectedPersonaId)
    : null;
  try {
    await renderPersonaSelector();
  } catch (e) {
    console.warn("Persona selector render failed:", e);
  }

  updateChatTitle();
  updateThreadRenameButtonState();
  updateAutoTtsToggleButton();
  updateModelPill();
  state.lastSyncSeenUpdatedAt = Number(thread.updatedAt || 0);

  renderChat();
  const input = document.getElementById("user-input");
  input.value = "";
  state.activeShortcut = null;
  closePromptHistory();
  await renderShortcutsBar();
  await renderThreads();
  updateScrollBottomButtonVisibility();
  showChatView();
  if (thread.pendingGenerationReason) {
    const id = Number(thread.id);
    if (!state.generationQueue.includes(id)) state.generationQueue.push(id);
  }
  await tryStartQueuedGenerationForCurrentThread();
}

function updateThreadRenameButtonState() {
  const btn = document.getElementById("rename-thread-btn");
  if (!btn) return;
  btn.innerHTML = ICONS.edit;
  btn.disabled = !currentThread;
}

function updateAutoTtsToggleButton() {
  const btn = document.getElementById("auto-tts-toggle-btn");
  if (!btn) return;
  btn.innerHTML = ICONS.speaker;
  const enabled = !!(currentThread && currentThread.autoTtsEnabled === true);
  btn.classList.toggle("is-active", enabled);
  btn.disabled = !currentThread;
  btn.setAttribute("title", enabled ? t("autoTtsTitleOn") : t("autoTtsTitleOff"));
  btn.setAttribute(
    "aria-label",
    enabled ? t("disableAutoTtsAria") : t("enableAutoTtsAria"),
  );
}

async function toggleThreadAutoTts() {
  if (!currentThread) return;
  const next = !(currentThread.autoTtsEnabled === true);
  const updatedAt = Date.now();
  currentThread.autoTtsEnabled = next;
  state.lastSyncSeenUpdatedAt = updatedAt;
  await db.threads.update(currentThread.id, {
    autoTtsEnabled: next,
    updatedAt,
  });
  updateAutoTtsToggleButton();
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: currentThread.id,
    updatedAt,
  });
  showToast(next ? t("autoTtsEnabled") : t("autoTtsDisabled"), "success");
}

async function maybeAutoSpeakAssistantMessage(messageIndex) {
  if (!currentThread || currentThread.autoTtsEnabled !== true) return;
  if (!state.tts.voiceSupportReady) return;
  const msg = conversationHistory[messageIndex];
  if (!msg || msg.role !== "assistant") return;
  if (!String(msg.content || "").trim()) return;
  try {
    await toggleMessageSpeech(messageIndex);
  } catch {
    // keep silent for auto mode failures
  }
}

async function renameCurrentThread() {
  if (!currentThread) return;
  await renameThread(currentThread.id);
}

async function renameThread(threadId) {
  const thread = await db.threads.get(threadId);
  if (!thread) return;
  const next = await openTextInputDialog({
    title: t("renameThreadTitle"),
    label: t("threadTitleLabel"),
    value: thread.title || tf("threadTitleDefault", { id: thread.id }),
    saveLabel: "Save",
    cancelLabel: "Cancel",
    maxLength: 128,
  });
  if (next === null) return;
  const title = String(next || "").trim().slice(0, 128);
  if (!title) {
    await openInfoDialog(t("missingFieldTitle"), t("threadTitleRequired"));
    return;
  }
  const updatedAt = Date.now();
  await db.threads.update(thread.id, {
    title,
    titleManual: true,
    titleGenerated: true,
    updatedAt,
  });
  if (currentThread?.id === thread.id) {
    currentThread.title = title;
    currentThread.titleManual = true;
    currentThread.titleGenerated = true;
    currentThread.updatedAt = updatedAt;
    updateChatTitle();
  }
  await renderThreads();
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: thread.id,
    updatedAt,
  });
  showToast(t("threadRenamed"), "success");
}

function updateChatTitle() {
  const titleEl = document.getElementById("chat-title");
  if (!titleEl) return;
  if (!currentThread) {
    titleEl.textContent = t("threadWord");
    return;
  }
  const displayTitle = `${currentCharacter?.name || "Unknown"} - ${
    currentThread.title || tf("threadTitleDefault", { id: currentThread.id })
  }`;
  titleEl.textContent = displayTitle;
}

async function maybeGenerateThreadTitle() {
  if (!currentThread || !currentCharacter) return;
  if (currentThread.titleGenerated === true) return;
  if (currentThread.titleManual === true) return;
  if (conversationHistory.length < 5) return;

  const firstFive = conversationHistory.slice(0, 5);
  const transcript = firstFive
    .map((m, i) => {
      const role = m.role === "assistant" ? "Assistant" : "User";
      const content = String(m.content || "").replace(/\s+/g, " ").trim();
      return `${i + 1}. ${role}: ${content.slice(0, 600)}`;
    })
    .join("\n");

  const titlePrompt = [
    "Generate a concise roleplay thread title.",
    "Requirements:",
    "- Maximum 128 characters.",
    "- Plain text only.",
    "- No surrounding quotes.",
    "- Reflect main topic or scene from these messages.",
    "",
    transcript,
  ].join("\n");

  try {
    const result = await callOpenRouter(
      "You create concise, descriptive chat thread titles.",
      [{ role: "user", content: titlePrompt }],
      state.settings.model,
    );
    const raw = String(result?.content || "").trim();
    if (!raw) return;
    const cleaned = raw
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 128);
    if (!cleaned) return;

    const updatedAt = Date.now();
    await db.threads.update(currentThread.id, {
      title: cleaned,
      titleGenerated: true,
      titleManual: false,
      updatedAt,
    });
    currentThread.title = cleaned;
    currentThread.titleGenerated = true;
    currentThread.titleManual = false;
    currentThread.updatedAt = updatedAt;
    state.lastSyncSeenUpdatedAt = updatedAt;
    updateChatTitle();
    await renderThreads();
    broadcastSyncEvent({
      type: "thread-updated",
      threadId: currentThread.id,
      updatedAt,
    });
  } catch {
    // keep existing fallback title
  }
}

function renderChat() {
  const log = document.getElementById("chat-log");
  log.innerHTML = "";
  state.editingMessageIndex = null;

  if (!currentThread) return;

  if (
    conversationHistory.length === 0 &&
    String(currentThread.pendingGenerationReason || "").trim()
  ) {
    const note = document.createElement("p");
    note.className = "muted";
    const pos =
      state.generationQueue.indexOf(Number(currentThread.id)) >= 0
        ? state.generationQueue.indexOf(Number(currentThread.id)) + 1
        : null;
    note.textContent = pos
      ? tf("generationQueuedNoticeWithPos", { position: pos })
      : t("generationQueuedNotice");
    log.appendChild(note);
  }

  const activeThreadId = Number(state.activeGenerationThreadId);
  const currentId = Number(currentThread.id);
  const isActiveGenerationThread =
    state.sending &&
    Number.isInteger(activeThreadId) &&
    Number.isInteger(currentId) &&
    activeThreadId === currentId;
  conversationHistory.forEach((message, idx) => {
    const status = String(message?.generationStatus || "").trim();
    const rowStreaming =
      message?.role === "assistant" &&
      (status === "queued" ||
        (isActiveGenerationThread && (status === "generating" || status === "regenerating")));
    log.appendChild(buildMessageRow(message, idx, rowStreaming));
  });

  scrollChatToBottom();
  updateScrollBottomButtonVisibility();
  scheduleThreadBudgetIndicatorUpdate();
}

function buildMessageRow(message, index, streaming) {
  const row = document.createElement("div");
  row.className = "chat-row";
  row.dataset.streaming = streaming ? "1" : "0";
  row.dataset.messageIndex = String(index);

  const avatar = document.createElement("img");
  avatar.className = "chat-avatar";
  const fallbackSender =
    message.role && message.role !== "user" && message.role !== "assistant"
      ? String(message.role)
      : "You";
  const userName = message.senderName || fallbackSender;
  const userAvatar = message.senderAvatar || fallbackAvatar(userName, 512, 512);
  const botName = currentCharacter?.name || "Character";
  const botAvatar =
    currentCharacter?.avatar ||
    fallbackAvatar(currentCharacter?.name || "Character", 512, 512);
  avatar.src = message.role === "assistant" ? botAvatar : userAvatar;
  avatar.classList.add("clickable-avatar");
  avatar.addEventListener("click", () => openImagePreview(avatar.src));
  if (message.role === "assistant") {
    const mult = Math.max(
      1,
      Math.min(4, Number(currentCharacter?.avatarScale) || 1),
    );
    const size = 44 * mult;
    avatar.style.width = `${size}px`;
    avatar.style.height = `${size}px`;
  }
  avatar.alt = `${message.role} avatar`;

  const block = document.createElement("div");
  block.className = "message-block";

  const header = document.createElement("div");
  header.className = "message-header";

  const sender = document.createElement("span");
  sender.textContent = message.role === "assistant" ? botName : userName;
  header.appendChild(sender);

  const controls = document.createElement("div");
  controls.className = "message-controls";
  const messageIndex = document.createElement("span");
  messageIndex.className = "message-index";
  messageIndex.textContent = `#${index + 1}`;
  const isTruncated = message.truncatedByFilter === true;
  const hasGenerationError = !!String(message.generationError || "").trim();
  const disableControlsForRow = streaming;

  if (message.role === "assistant") {
    controls.appendChild(messageIndex);
    const delBtn = iconButton("delete", t("msgDeleteTitle"), async () => {
        await deleteMessageAt(index);
      });
    delBtn.classList.add("msg-delete-btn");
    delBtn.classList.add("danger-icon-btn");
    delBtn.disabled = disableControlsForRow;
    controls.appendChild(delBtn);

    const regenBtn = iconButton("regenerate", t("msgRegenerateTitle"), async () => {
      await regenerateMessage(index);
    });
    regenBtn.classList.add("msg-regen-btn");
    regenBtn.disabled = state.sending || disableControlsForRow;
    controls.appendChild(regenBtn);
    const editBtn = iconButton("edit", t("msgEditTitle"), async () => {
      beginInlineMessageEdit(index, content);
    });
    editBtn.classList.add("msg-edit-btn");
    editBtn.disabled = disableControlsForRow || isTruncated || hasGenerationError;
    controls.appendChild(editBtn);

    const copyBtn = iconButton("copy", t("msgCopyTitle"), async () => {
      await copyMessage(message.content || "");
    });
    copyBtn.classList.add("msg-copy-btn");
    copyBtn.disabled = disableControlsForRow;
    controls.appendChild(copyBtn);
    const infoBtn = iconButton("info", t("msgMetadataTitle"), async () => {
      await openMessageMetadataModal(index);
    });
    infoBtn.classList.add("msg-info-btn");
    applyInfoButtonAvailability(infoBtn, message, disableControlsForRow);
    controls.appendChild(infoBtn);
    const contextBtn = iconButton("context", t("msgContextTitle"), async () => {
      await openMessageContextModal(index);
    });
    contextBtn.classList.add("msg-context-btn");
    contextBtn.disabled = disableControlsForRow || !hasMessageContextData(message);
    controls.appendChild(contextBtn);

    const speakerBtn = iconButton("speaker", t("msgSpeakTitle"), async (e) => {
      const clickedBtn = e?.currentTarget;
      const resolvedIndex = resolveMessageIndexFromButton(clickedBtn, index);
      ttsDebug("bubble-click", {
        capturedIndex: index,
        resolvedIndex,
        datasetIndex: clickedBtn?.dataset?.messageIndex,
      });
      await toggleMessageSpeech(resolvedIndex);
    });
    speakerBtn.classList.add("msg-tts-btn");
    speakerBtn.dataset.messageIndex = String(index);
    if (disableControlsForRow) speakerBtn.disabled = true;
    controls.appendChild(speakerBtn);
  } else {
    controls.appendChild(messageIndex);
    const editBtn = iconButton("edit", t("msgEditTitle"), async () => {
      beginInlineMessageEdit(index, content);
    });
    editBtn.classList.add("msg-edit-btn");
    editBtn.disabled = disableControlsForRow || isTruncated || hasGenerationError;
    controls.appendChild(editBtn);
    const infoBtn = iconButton("info", t("msgMetadataTitle"), async () => {
      await openMessageMetadataModal(index);
    });
    infoBtn.classList.add("msg-info-btn");
    applyInfoButtonAvailability(infoBtn, message, disableControlsForRow);
    controls.appendChild(infoBtn);
  }

  header.appendChild(controls);

  const content = document.createElement("div");
  content.className = "message-content";
  content.addEventListener("dblclick", () => {
    const rowEl = content.closest(".chat-row");
    if (rowEl?.dataset?.streaming === "1") return;
    if (String(message?.generationError || "").trim()) return;
    beginInlineMessageEdit(index, content);
  });
  if (streaming) {
    let statusLabel = t("generatingLabel");
    const isQueued = message?.generationStatus === "queued";
    if (message?.generationStatus === "regenerating") {
      statusLabel = t("regeneratingLabel");
    } else if (isQueued) {
      statusLabel = String(message?.content || "").trim() || t("generatingLabel");
    }
    if (!isQueued && String(message?.content || "").trim()) {
      content.innerHTML = renderMessageHtml(message.content, message.role);
    } else {
      content.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(statusLabel)}`;
    }
  } else {
    renderMessageContent(content, message);
  }

  block.append(header, content);
  row.append(avatar, block);
  if (message.role === "assistant") {
    updateMessageSpeakerButton(speakerBtnForRow(row), index);
  }
  return row;
}

function speakerBtnForRow(row) {
  return row?.querySelector(".msg-tts-btn") || null;
}

function renderMessageContent(contentEl, message) {
  if (!contentEl || !message) return;
  contentEl.innerHTML = renderMessageHtml(message.content || "", message.role);
  if (message.truncatedByFilter === true) {
    contentEl.appendChild(buildTruncationNotice());
  }
  if (String(message.generationError || "").trim()) {
    contentEl.appendChild(buildGenerationErrorNotice(message.generationError));
  }
}

function hasMessageContextData(message) {
  if (!message) return false;
  const loreCount = Array.isArray(message.usedLoreEntries)
    ? message.usedLoreEntries.length
    : 0;
  const hasMemory = !!String(message.usedMemorySummary || "").trim();
  return loreCount > 0 || hasMemory;
}

function applyInfoButtonAvailability(button, message, isStreaming) {
  if (!button) return;
  const isInitial = message?.isInitial === true;
  const isUserEdited = message?.userEdited === true;
  button.disabled = !!isStreaming || isInitial || isUserEdited;
  if (isUserEdited) {
    button.setAttribute("title", t("msgMetadataUnavailableEdited"));
    button.setAttribute("aria-label", t("msgMetadataUnavailableEditedAria"));
    return;
  }
  if (isInitial) {
    button.setAttribute("title", t("msgMetadataUnavailableInitial"));
    button.setAttribute("aria-label", t("msgMetadataUnavailableInitialAria"));
    return;
  }
  if (isStreaming) {
    button.setAttribute("title", t("msgMetadataUnavailableGenerating"));
    button.setAttribute("aria-label", t("msgMetadataUnavailableGeneratingAria"));
    return;
  }
  button.setAttribute("title", t("msgMetadataTitle"));
  button.setAttribute("aria-label", t("msgMetadataTitle"));
}

function buildTruncationNotice() {
  const box = document.createElement("div");
  box.className = "message-truncated-note";
  const p1 = document.createElement("p");
  p1.textContent = t("truncatedMessageLine1");
  const p2 = document.createElement("p");
  p2.textContent = t("truncatedMessageLine2");
  box.append(p1, p2);
  return box;
}

function buildGenerationErrorNotice(errorText) {
  const box = document.createElement("div");
  box.className = "message-truncated-note";
  const p1 = document.createElement("p");
  p1.textContent = t("generationErrorLine1");
  const p2 = document.createElement("p");
  p2.textContent = String(errorText || "Unknown error");
  const p3 = document.createElement("p");
  p3.textContent = t("generationErrorLine3");
  box.append(p1, p2, p3);
  return box;
}

function beginInlineMessageEdit(index, contentEl) {
  if (!contentEl || !currentThread) return;
  const rowEl = contentEl.closest(".chat-row");
  if (rowEl?.dataset?.streaming === "1") return;
  const message = conversationHistory[index];
  if (!message) return;
  if (message.truncatedByFilter === true) return;
  if (String(message.generationError || "").trim()) return;
  const activeTtsIndex = Number.isInteger(state.tts.speakingMessageIndex)
    ? state.tts.speakingMessageIndex
    : Number.isInteger(state.tts.loadingMessageIndex)
      ? state.tts.loadingMessageIndex
      : null;
  // Keep playback when editing a message that appears before the currently spoken/loading one.
  if (!(Number.isInteger(activeTtsIndex) && index < activeTtsIndex)) {
    stopTtsPlayback();
  }

  if (
    state.editingMessageIndex !== null &&
    state.editingMessageIndex !== index &&
    document.querySelector(".message-editor")
  ) {
    const prev = document.querySelector(".message-editor");
    prev?.blur();
  }

  if (contentEl.querySelector(".message-editor")) return;
  state.editingMessageIndex = index;

  const contentHeight = Math.max(
    90,
    Math.ceil(contentEl.getBoundingClientRect().height),
  );
  const contentWidth = Math.max(
    180,
    Math.ceil(contentEl.getBoundingClientRect().width),
  );
  const editor = document.createElement("textarea");
  editor.className = "message-editor";
  editor.value = String(message.content || "");
  editor.style.minHeight = `${contentHeight}px`;
  editor.style.height = `${contentHeight}px`;
  editor.style.width = `${contentWidth}px`;
  editor.style.maxWidth = "100%";
  contentEl.innerHTML = "";
  contentEl.appendChild(editor);
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
  autoSizeMessageEditor(editor, contentHeight);

  const original = String(message.content || "");
  let cancelled = false;
  editor.addEventListener("input", () => autoSizeMessageEditor(editor, contentHeight));
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancelled = true;
      editor.blur();
      return;
    }
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      editor.blur();
    }
  });
  const finalize = async () => {
    if (state.editingMessageIndex !== index) return;
    state.editingMessageIndex = null;
    if (cancelled) {
      renderMessageContent(contentEl, { ...message, content: original });
      return;
    }
    const next = editor.value;
    if (next === original) {
      renderMessageContent(contentEl, { ...message, content: original });
      return;
    }
    message.content = next;
    message.userEdited = true;
    renderMessageContent(contentEl, message);
    refreshMessageControlStates();
    await persistCurrentThread();
    await renderThreads();
    showToast(t("messageUpdated"), "success");
  };

  editor.addEventListener(
    "blur",
    () => {
      finalize().catch((e) => {
        console.warn("Message edit save failed:", e);
        renderMessageContent(contentEl, message);
      });
    },
    { once: true },
  );
}

function autoSizeMessageEditor(editor, minHeight = 90) {
  if (!editor) return;
  editor.style.height = "auto";
  editor.style.height = `${Math.max(minHeight, editor.scrollHeight)}px`;
}

function cancelActiveMessageEdit() {
  const editor = document.querySelector(".message-editor");
  if (!editor) return false;
  const event = new KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  editor.dispatchEvent(event);
  if (document.activeElement === editor) editor.blur();
  return true;
}

function resolveMessageIndexFromButton(buttonEl, fallbackIndex) {
  const dataIndex = Number(buttonEl?.dataset?.messageIndex);
  if (Number.isInteger(dataIndex) && dataIndex >= 0) {
    ttsDebug("resolve-index:dataset", { dataIndex, fallbackIndex });
    return dataIndex;
  }
  const row = buttonEl?.closest?.(".chat-row");
  const log = document.getElementById("chat-log");
  if (!row || !log) return fallbackIndex;
  const rowIndex = Array.from(log.children).indexOf(row);
  if (rowIndex >= 0) {
    ttsDebug("resolve-index:row", { rowIndex, fallbackIndex });
    return rowIndex;
  }
  ttsDebug("resolve-index:fallback", { fallbackIndex });
  return fallbackIndex;
}

function isTtsIndexMatch(ttsIndex, messageIndex) {
  return Number.isInteger(ttsIndex) && ttsIndex === Number(messageIndex);
}

function hasBrowserTtsSupport() {
  return (
    typeof window !== "undefined" &&
    typeof window.SpeechSynthesisUtterance === "function" &&
    typeof window.speechSynthesis !== "undefined"
  );
}

function updateTtsSupportUi() {
  const supported = state.tts.voiceSupportReady === true;
  const statusEl = document.getElementById("tts-test-status");
  const playBtn = document.getElementById("tts-test-play-btn");
  if (
    statusEl &&
    (!statusEl.textContent ||
      statusEl.textContent.startsWith("TTS: unsupported"))
  ) {
    statusEl.textContent = supported
      ? "TTS: idle"
      : "TTS: unsupported in this browser";
  }
  if (playBtn) {
    playBtn.disabled = !supported;
  }
  refreshAllSpeakerButtons();
}

function initBrowserTtsSupport() {
  if (!hasBrowserTtsSupport()) {
    state.tts.voiceSupportReady = false;
    updateTtsSupportUi();
    return;
  }
  const synth = window.speechSynthesis;
  const refresh = () => {
    const voices = synth.getVoices?.() || [];
    state.tts.voiceSupportReady = voices.length > 0;
    if (state.activeModalId === "character-modal") {
      const currentLang = String(
        document.getElementById("char-tts-language")?.value ||
          DEFAULT_TTS_LANGUAGE,
      );
      const currentVoice = String(
        document.getElementById("char-tts-voice")?.value || DEFAULT_TTS_VOICE,
      );
      populateCharTtsLanguageSelect(currentLang);
      populateCharTtsVoiceSelect(currentVoice);
    }
    updateTtsSupportUi();
  };
  refresh();
  if (typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", refresh);
  }
  window.setTimeout(refresh, 250);
  window.setTimeout(refresh, 1000);
}

function updateMessageSpeakerButton(button, index) {
  if (!button) return;
  const msg = conversationHistory[index];
  const isAssistant = msg?.role === "assistant";
  const row = button.closest(".chat-row");
  const streaming = row?.dataset?.streaming === "1";
  const hasContent = !!String(msg?.content || "").trim();
  const isLoading = isTtsIndexMatch(state.tts.loadingMessageIndex, index);
  const isSpeaking = isTtsIndexMatch(state.tts.speakingMessageIndex, index);
  const ttsReady = state.tts.voiceSupportReady === true;
  button.disabled =
    !isAssistant || streaming || !hasContent || !ttsReady;
  button.classList.toggle("tts-loading", isLoading);
  button.classList.toggle("tts-speaking", isSpeaking);
  if (!ttsReady) {
    button.innerHTML = ICONS.speaker;
    button.setAttribute("title", t("msgVoiceUnavailableTitle"));
    button.setAttribute("aria-label", t("msgVoiceUnavailableAria"));
    return;
  }
  if (isLoading) {
    button.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>';
    button.setAttribute("title", t("msgSpeakLoadingTitle"));
    button.setAttribute("aria-label", t("msgSpeakLoadingTitle"));
  } else if (isSpeaking) {
    button.innerHTML = ICONS.stop;
    button.setAttribute("title", t("msgSpeakCancelTitle"));
    button.setAttribute("aria-label", t("msgSpeakCancelTitle"));
  } else {
    button.innerHTML = ICONS.speaker;
    button.setAttribute("title", t("msgSpeakTitle"));
    button.setAttribute("aria-label", t("msgSpeakTitle"));
  }
}

function refreshAllSpeakerButtons() {
  document.querySelectorAll(".msg-tts-btn").forEach((btn) => {
    const index = Number(btn.dataset.messageIndex);
    updateMessageSpeakerButton(btn, index);
  });
}

async function sendMessage(options = {}) {
  if (!currentThread || !currentCharacter) return;
  if (state.sending) {
    const activeId = Number(state.activeGenerationThreadId);
    const currentId = Number(currentThread.id);
    if (Number.isInteger(activeId) && activeId === currentId) {
      cancelOngoingGeneration();
      return;
    }
  }

  const input = document.getElementById("user-input");
  const shortcutPreserve =
    state.activeShortcut &&
    input.value === state.activeShortcut.initialValue &&
    state.activeShortcut.clearAfterSend === false;
  const preserveInput =
    typeof options.preserveInput === "boolean"
      ? options.preserveInput
      : !!shortcutPreserve;
  const rawInput = input.value;
  const text = rawInput.trim();
  const shouldTriggerAiOnly = !text || /^\/ai\s*$/i.test(text);
  if (shouldTriggerAiOnly) {
    if (!preserveInput) {
      input.value = "";
      state.activeShortcut = null;
    }
    await requestBotReplyForCurrentThread("manual_send_ai_only");
    return;
  }
  if (!preserveInput) {
    input.value = "";
    state.activeShortcut = null;
  }

  const userMsg = {
    role: "user",
    content: text,
    createdAt: Date.now(),
    senderName: currentPersona?.name || "You",
    senderAvatar: currentPersona?.avatar || "",
    senderPersonaId: currentPersona?.id || null,
  };
  conversationHistory.push(userMsg);
  await persistCurrentThread();
  await maybeGenerateThreadTitle();

  const log = document.getElementById("chat-log");
  log.appendChild(
    buildMessageRow(userMsg, conversationHistory.length - 1, false),
  );
  scrollChatToBottom();

  if (state.settings.autoReplyEnabled === false) {
    await renderThreads();
    return;
  }

  await requestBotReplyForCurrentThread("manual_send_auto_reply");
}

async function generateBotReply() {
  if (!currentThread || !currentCharacter || state.sending) return;
  const threadId = Number(currentThread.id);
  const includeOneTimeExtra = shouldIncludeOneTimeExtraPrompt(conversationHistory);
  const generationCharacter = currentCharacter;
  const generationPersona = currentPersona;
  const generationThreadSnapshot = { ...currentThread };
  const generationHistory = conversationHistory;

  const log = document.getElementById("chat-log");
  const existingPendingIdx = findLatestPendingAssistantIndex(generationHistory);
  let pending = null;
  let pendingIndex = existingPendingIdx;
  if (existingPendingIdx >= 0) {
    pending = generationHistory[existingPendingIdx];
    pending.content = "";
    pending.generationStatus = "generating";
    pending.generationError = "";
    pending.truncatedByFilter = false;
  } else {
    pending = {
      role: "assistant",
      content: "",
      generationStatus: "generating",
      createdAt: Date.now(),
      finishReason: "",
      nativeFinishReason: "",
      truncatedByFilter: false,
      generationId: "",
      completionMeta: null,
      generationInfo: null,
      usedLoreEntries: [],
      usedMemorySummary: "",
    };
    generationHistory.push(pending);
    pendingIndex = generationHistory.length - 1;
  }
  await clearThreadGenerationQueueFlag(threadId);
  await persistThreadMessagesById(threadId, generationHistory);
  let pendingRow = null;
  if (isViewingThread(threadId)) {
    pendingRow = log?.querySelector(
      `.chat-row[data-message-index="${pendingIndex}"]`,
    );
    if (!pendingRow) {
      pendingRow = buildMessageRow(
        pending,
        pendingIndex,
        true,
      );
      log.appendChild(pendingRow);
    }
    const pendingContent = pendingRow?.querySelector(".message-content");
    if (pendingContent) {
      pendingContent.innerHTML =
        `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(t("generatingLabel"))}`;
    }
    scrollChatToBottom();
  }

  state.sending = true;
  state.activeGenerationThreadId = threadId;
  state.chatAutoScroll = true;
  state.abortController = new AbortController();
  setSendingState(true);

  try {
    const promptContext = await buildSystemPrompt(generationCharacter, {
      includeOneTimeExtraPrompt: includeOneTimeExtra,
      returnTrace: true,
      personaOverride: generationPersona,
      historyOverride: generationHistory,
      threadOverride: generationThreadSnapshot,
    });
    const systemPrompt = promptContext.prompt;
    const result = await callOpenRouter(
      systemPrompt,
      generationHistory,
      state.settings.model,
      (chunk) => {
        pending.content += chunk;
        if (isViewingThread(threadId)) {
          const liveRow = document.querySelector(
            `#chat-log .chat-row[data-message-index="${pendingIndex}"]`,
          );
          const liveContent = liveRow?.querySelector(".message-content");
          if (liveContent) {
            liveContent.innerHTML = renderMessageHtml(pending.content, pending.role);
          }
        }
        if (state.settings.streamEnabled) {
          persistThreadMessagesById(threadId, generationHistory).catch(() => {});
        }
        if (isViewingThread(threadId)) scrollChatToBottom();
      },
      state.abortController.signal,
    );
    const assistantText = result.content || pending.content || "";
    state.lastUsedModel = result.model || "";
    state.lastUsedProvider = result.provider || "";
    updateModelPill();

    pending.content = assistantText || "(No content returned)";
    pending.finishReason = String(result.finishReason || "");
    pending.nativeFinishReason = String(result.nativeFinishReason || "");
    pending.truncatedByFilter = result.truncatedByFilter === true;
    pending.generationId = String(result.generationId || "");
    pending.completionMeta = result.completionMeta || null;
    pending.generationInfo = result.generationInfo || null;
    pending.generationFetchDebug = result.generationFetchDebug || [];
    pending.usedLoreEntries = Array.isArray(promptContext.loreEntries)
      ? promptContext.loreEntries
      : [];
    pending.usedMemorySummary = String(promptContext.memory || "");
    pending.generationError = "";
    pending.generationStatus = "";
    if (isViewingThread(threadId)) {
      const liveRow = document.querySelector(
        `#chat-log .chat-row[data-message-index="${pendingIndex}"]`,
      );
      const liveContent = liveRow?.querySelector(".message-content");
      if (liveContent) {
        renderMessageContent(liveContent, pending);
      } else {
        renderChat();
      }
      if (liveRow) liveRow.dataset.streaming = "0";
      refreshAllSpeakerButtons();
    }
    if (currentThread && Number(currentThread.id) === threadId) {
      commitPendingPersonaInjectionMarker();
    } else {
      state.pendingPersonaInjectionPersonaId = null;
    }
    await persistThreadMessagesById(threadId, generationHistory);
    if (isViewingThread(threadId)) {
      maybeAutoSpeakAssistantMessage(pendingIndex).catch(
        () => {},
      );
      await maybeGenerateThreadTitle();
      scrollChatToBottom();
    }

    if (
      generationCharacter.useMemory !== false &&
      generationHistory.length > 0 &&
      generationHistory.length % 20 === 0 &&
      isViewingThread(threadId)
    ) {
      await summarizeMemory(generationCharacter);
    }

    await renderThreads();
  } catch (e) {
    state.pendingPersonaInjectionPersonaId = null;
    if (isAbortError(e)) {
      if (!pending.content.trim()) {
        const idx = generationHistory.lastIndexOf(pending);
        if (idx >= 0) generationHistory.splice(idx, 1);
        if (pendingRow) pendingRow.remove();
      } else {
        pending.generationStatus = "";
        if (isViewingThread(threadId)) {
          const liveRow = document.querySelector(
            `#chat-log .chat-row[data-message-index="${pendingIndex}"]`,
          );
          const liveContent = liveRow?.querySelector(".message-content");
          if (liveContent) {
            renderMessageContent(liveContent, pending);
          } else {
            renderChat();
          }
          if (liveRow) liveRow.dataset.streaming = "0";
          refreshAllSpeakerButtons();
        }
      }
      await persistThreadMessagesById(threadId, generationHistory);
      await renderThreads();
      showToast(t("generationCancelled"), "success");
    } else {
      pending.generationError = String(e?.message || "Unknown error");
      pending.generationStatus = "";
      if (!String(pending.content || "").trim()) {
        pending.content = "";
      }
      if (isViewingThread(threadId)) {
        const liveRow = document.querySelector(
          `#chat-log .chat-row[data-message-index="${pendingIndex}"]`,
        );
        const liveContent = liveRow?.querySelector(".message-content");
        if (liveRow) liveRow.dataset.streaming = "0";
        if (liveContent) {
          renderMessageContent(liveContent, pending);
        } else {
          renderChat();
        }
        refreshAllSpeakerButtons();
        refreshMessageControlStates();
      }
      await persistThreadMessagesById(threadId, generationHistory);
      await renderThreads();
      showToast(t("generationFailed"), "error");
    }
  } finally {
    state.pendingPersonaInjectionPersonaId = null;
    state.abortController = null;
    state.sending = false;
    state.activeGenerationThreadId = null;
    setSendingState(false);
    await tryStartQueuedGenerationForCurrentThread();
  }
}

async function deleteMessageAt(index) {
  if (!currentThread) return;
  if (index < 0 || index >= conversationHistory.length) return;

  stopTtsPlayback();
  conversationHistory.splice(index, 1);
  await persistCurrentThread();
  renderChat();
}

async function regenerateMessage(index) {
  if (!currentThread || !currentCharacter || state.sending) return;
  if (index < 0 || index >= conversationHistory.length) return;

  const target = conversationHistory[index];
  if (!target || target.role !== "assistant") return;

  const prior = conversationHistory.slice(0, index);
  const includeOneTimeExtra = isFirstAssistantMessageIndex(index);
  const originalContent = String(target.content || "");

  stopTtsPlayback();
  state.sending = true;
  state.chatAutoScroll = true;
  state.abortController = new AbortController();
  setSendingState(true);

  try {
    const promptContext = await buildSystemPrompt(currentCharacter, {
      includeOneTimeExtraPrompt: includeOneTimeExtra,
      returnTrace: true,
    });
    const systemPrompt = promptContext.prompt;
    target.content = "";
    target.generationStatus = "regenerating";
    renderChat();
    const row = document.getElementById("chat-log").children[index];
    const contentEl = row?.querySelector(".message-content");
    if (row) row.dataset.streaming = "1";
    refreshMessageControlStates();
    if (contentEl)
      contentEl.innerHTML =
        `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(t("regeneratingLabel"))}`;
    scrollChatToBottom();

    const result = await callOpenRouter(
      systemPrompt,
      prior,
      state.settings.model,
      (chunk) => {
        target.content += chunk;
        if (contentEl)
          contentEl.innerHTML = renderMessageHtml(target.content, target.role);
        scrollChatToBottom();
      },
      state.abortController.signal,
    );
    const reply = result.content || target.content;
    state.lastUsedModel = result.model || "";
    state.lastUsedProvider = result.provider || "";
    updateModelPill();
    target.content = reply || "(No content returned)";
    target.isInitial = false;
    target.userEdited = false;
    target.finishReason = String(result.finishReason || "");
    target.nativeFinishReason = String(result.nativeFinishReason || "");
    target.truncatedByFilter = result.truncatedByFilter === true;
    target.generationId = String(result.generationId || "");
    target.completionMeta = result.completionMeta || null;
    target.generationInfo = result.generationInfo || null;
    target.generationFetchDebug = result.generationFetchDebug || [];
    target.generationError = "";
    target.generationStatus = "";
    target.usedLoreEntries = Array.isArray(promptContext.loreEntries)
      ? promptContext.loreEntries
      : [];
    target.usedMemorySummary = String(promptContext.memory || "");
    commitPendingPersonaInjectionMarker();
    await persistCurrentThread();
    renderChat();
    maybeAutoSpeakAssistantMessage(index).catch(() => {});
    await renderThreads();
  } catch (e) {
    state.pendingPersonaInjectionPersonaId = null;
    if (isAbortError(e)) {
      target.generationStatus = "";
      await persistCurrentThread();
      renderChat();
      await renderThreads();
      showToast(t("regenerationCancelled"), "success");
    } else {
      target.content = originalContent;
      target.generationStatus = "";
      await persistCurrentThread();
      renderChat();
      await renderThreads();
      await openInfoDialog(t("regenerateFailedTitle"), String(e.message || t("unknownError")));
    }
  } finally {
    state.pendingPersonaInjectionPersonaId = null;
    state.abortController = null;
    state.sending = false;
    setSendingState(false);
  }
}

function commitPendingPersonaInjectionMarker() {
  if (!currentThread) return;
  if (!state.pendingPersonaInjectionPersonaId) return;
  currentThread.lastPersonaInjectionPersonaId =
    state.pendingPersonaInjectionPersonaId;
}

async function copyMessage(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(t("messageCopied"), "success");
  } catch {
    await openInfoDialog(t("copyFailedTitle"), t("copyFailedMessage"));
  }
}

async function refreshPuterAuthStatus() {
  const statusEl = document.getElementById("puter-auth-status");
  if (!statusEl) return false;
  if (!window.puter?.auth) {
    statusEl.textContent = "Puter: SDK unavailable";
    return false;
  }
  try {
    if (typeof window.puter.auth.isSignedIn === "function") {
      const signed = await window.puter.auth.isSignedIn();
      statusEl.textContent = signed ? "Puter: signed in" : "Puter: signed out";
      return !!signed;
    }
    if (typeof window.puter.auth.getUser === "function") {
      await window.puter.auth.getUser();
      statusEl.textContent = "Puter: signed in";
      return true;
    }
    statusEl.textContent = "Puter: status unknown";
    return false;
  } catch {
    statusEl.textContent = "Puter: signed out";
    return false;
  }
}

async function ensurePuterSignedIn({ interactive = false } = {}) {
  if (!window.puter?.auth) {
    throw new Error("Puter auth is unavailable.");
  }
  if (typeof window.puter.auth.isSignedIn === "function") {
    try {
      const signed = await window.puter.auth.isSignedIn();
      if (signed) return true;
    } catch {
      // ignore and continue to interactive sign-in if allowed
    }
  } else if (typeof window.puter.auth.getUser === "function") {
    try {
      await window.puter.auth.getUser();
      return true;
    } catch {
      // ignore and continue
    }
  }

  if (!interactive || typeof window.puter.auth.signIn !== "function") {
    return false;
  }
  await window.puter.auth.signIn();
  return await refreshPuterAuthStatus();
}

function getCurrentCharacterTtsOptions() {
  const resolved = getResolvedTtsSelection(
    currentCharacter?.ttsLanguage,
    currentCharacter?.ttsVoice,
    currentCharacter?.ttsRate,
    currentCharacter?.ttsPitch,
  );
  const options = {
    voice: resolved.voice || DEFAULT_TTS_VOICE,
    language: resolved.language || DEFAULT_TTS_LANGUAGE,
    rate: resolved.rate,
    pitch: resolved.pitch,
  };
  return options;
}

function getTtsOptionsFromCharacterModal() {
  const resolved = getResolvedCharTtsSelection();
  const options = {
    voice: resolved.voice || DEFAULT_TTS_VOICE,
    language: resolved.language || DEFAULT_TTS_LANGUAGE,
    rate: resolved.rate,
    pitch: resolved.pitch,
  };
  return options;
}

function updateCharTtsTestButtonState() {
  const btn = document.getElementById("char-tts-test-btn");
  if (!btn) return;
  const active = state.charModalTtsTestPlaying === true;
  if (active) {
    btn.innerHTML = `${ICONS.stop} Stop Test`;
    btn.setAttribute("aria-label", "Stop character voice test");
    btn.setAttribute("title", "Stop character voice test");
  } else {
    btn.textContent = "Test Character Voice";
    btn.setAttribute("aria-label", "Test character voice");
    btn.setAttribute("title", "Test character voice");
  }
}

async function playCharacterTtsTestFromModal() {
  if (state.charModalTtsTestPlaying) {
    stopTtsPlayback({ silent: true });
    state.charModalTtsTestPlaying = false;
    updateCharTtsTestButtonState();
    return;
  }
  const textInput = document.getElementById("tts-test-text");
  const text =
    String(textInput?.value || "").trim() || "This is a test voice playback.";
  state.charModalTtsTestPlaying = true;
  updateCharTtsTestButtonState();
  try {
    await playTtsAudio(text, getTtsOptionsFromCharacterModal());
  } catch (err) {
    if (isTtsCancelledError(err)) return;
    showToast(tf("ttsTestFailed", { error: err.message || t("unknownError") }), "error");
  } finally {
    state.charModalTtsTestPlaying = false;
    updateCharTtsTestButtonState();
  }
}

async function playTtsAudio(text, options, playback = {}) {
  if (!hasBrowserTtsSupport()) {
    throw new Error("Browser TTS is unavailable.");
  }
  const normalizedText = String(text || "").trim();
  if (!normalizedText) {
    ttsDebug("playTtsAudio:empty-text");
    throw new Error("Text is empty.");
  }
  const synth = window.speechSynthesis;
  const voices = synth.getVoices?.() || [];
  if (!voices.length) {
    throw new Error("No browser voices are available yet.");
  }
  const messageIndex = Number.isInteger(playback?.messageIndex)
    ? playback.messageIndex
    : null;
  const requestId = state.tts.requestSeq + 1;
  state.tts.requestSeq = requestId;
  state.tts.activeRequestId = requestId;
  ttsDebug("playTtsAudio:start", {
    requestId,
    messageIndex,
    textLength: normalizedText.length,
    options,
  });
  stopTtsPlayback();
  state.tts.activeRequestId = requestId;
  if (messageIndex !== null) {
    state.tts.loadingMessageIndex = messageIndex;
    refreshAllSpeakerButtons();
  }
  let utterance = null;
  let finalized = false;
  const finalizeLoadingState = () => {
    if (finalized) return;
    finalized = true;
    if (
      messageIndex !== null &&
      state.tts.activeRequestId === requestId &&
      isTtsIndexMatch(state.tts.loadingMessageIndex, messageIndex)
    ) {
      state.tts.loadingMessageIndex = null;
      refreshAllSpeakerButtons();
    }
  };

  try {
    if (requestId !== state.tts.activeRequestId) {
      ttsDebug("playTtsAudio:stale-request", {
        requestId,
        active: state.tts.activeRequestId,
      });
      throw makeTtsCancelledError();
    }

    utterance = new SpeechSynthesisUtterance(normalizedText);
    const desiredVoice = String(options?.voice || DEFAULT_TTS_VOICE).trim();
    const desiredLang = String(
      options?.language || DEFAULT_TTS_LANGUAGE,
    ).trim();
    const desiredRate = Math.max(0.5, Math.min(2, Number(options?.rate) || 1));
    const desiredPitch = Math.max(0, Math.min(2, Number(options?.pitch) || 1));
    utterance.lang = desiredLang || DEFAULT_TTS_LANGUAGE;
    utterance.rate = desiredRate;
    utterance.pitch = desiredPitch;
    const byExactName = voices.find(
      (v) => String(v.name || "").toLowerCase() === desiredVoice.toLowerCase(),
    );
    const byLangExact = voices.find(
      (v) =>
        String(v.lang || "").toLowerCase() === utterance.lang.toLowerCase(),
    );
    const byLangPrefix = voices.find((v) =>
      String(v.lang || "")
        .toLowerCase()
        .startsWith(utterance.lang.split("-")[0]?.toLowerCase() || ""),
    );
    utterance.voice =
      byExactName || byLangExact || byLangPrefix || voices[0] || null;

    if (requestId !== state.tts.activeRequestId) {
      ttsDebug("playTtsAudio:stale-request-before-speak", {
        requestId,
        active: state.tts.activeRequestId,
      });
      throw makeTtsCancelledError();
    }
    state.tts.loadingMessageIndex = null;
    finalized = true;
    if (messageIndex !== null) {
      state.tts.speakingMessageIndex = messageIndex;
    }
    state.tts.audio = utterance;
    refreshAllSpeakerButtons();
    await new Promise((resolve, reject) => {
      utterance.onend = () => {
        ttsDebug("playTtsAudio:ended");
        if (state.tts.audio === utterance) {
          state.tts.audio = null;
          state.tts.speakingMessageIndex = null;
          state.tts.loadingMessageIndex = null;
          refreshAllSpeakerButtons();
        }
        resolve();
      };
      utterance.onerror = (event) => {
        ttsDebug("playTtsAudio:error", { event });
        if (state.tts.audio === utterance) {
          state.tts.audio = null;
          state.tts.speakingMessageIndex = null;
          state.tts.loadingMessageIndex = null;
          refreshAllSpeakerButtons();
        }
        const interrupted =
          requestId !== state.tts.activeRequestId ||
          String(event?.error || "").toLowerCase() === "interrupted" ||
          String(event?.error || "").toLowerCase() === "canceled";
        if (interrupted) {
          reject(makeTtsCancelledError());
          return;
        }
        reject(new Error("Browser TTS playback failed."));
      };
      ttsDebug("playTtsAudio:speak", {
        voice: utterance.voice?.name || "",
        lang: utterance.lang,
      });
      synth.speak(utterance);
    });
    return utterance;
  } finally {
    finalizeLoadingState();
  }
}

function stopTtsPlayback(options = {}) {
  state.tts.activeRequestId = state.tts.activeRequestId + 1;
  if (hasBrowserTtsSupport()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  state.tts.audio = null;
  state.tts.speakingMessageIndex = null;
  state.tts.loadingMessageIndex = null;
  state.charModalTtsTestPlaying = false;
  if (!options?.silent) updateCharTtsTestButtonState();
  refreshAllSpeakerButtons();
}

async function toggleMessageSpeech(index) {
  ttsDebug("toggleMessageSpeech:enter", {
    index,
    historyLen: conversationHistory.length,
  });
  if (!currentThread || !currentCharacter) {
    ttsDebug("toggleMessageSpeech:blocked-no-thread-or-character", {
      hasThread: !!currentThread,
      hasCharacter: !!currentCharacter,
    });
    showToast(t("openThreadFirst"), "error");
    return;
  }
  const message = conversationHistory[index];
  if (!message || message.role !== "assistant") {
    ttsDebug("toggleMessageSpeech:blocked-not-assistant", {
      index,
      role: message?.role,
      hasMessage: !!message,
    });
    showToast(t("ttsAssistantOnly"), "error");
    return;
  }
  if (!String(message.content || "").trim()) {
    ttsDebug("toggleMessageSpeech:blocked-empty-message", { index });
    showToast(t("messageEmpty"), "error");
    return;
  }

  const hasAudioObject = !!state.tts.audio;
  const audioIsPlaying = hasBrowserTtsSupport()
    ? !!(window.speechSynthesis.speaking || window.speechSynthesis.pending)
    : false;
  if (!hasAudioObject && state.tts.speakingMessageIndex !== null) {
    ttsDebug("toggleMessageSpeech:clear-stale-speaking", {
      staleSpeakingIndex: state.tts.speakingMessageIndex,
    });
    state.tts.speakingMessageIndex = null;
  }
  const isActive =
    isTtsIndexMatch(state.tts.speakingMessageIndex, index) ||
    isTtsIndexMatch(state.tts.loadingMessageIndex, index);
  const isActuallyActive =
    isTtsIndexMatch(state.tts.loadingMessageIndex, index) ||
    (isTtsIndexMatch(state.tts.speakingMessageIndex, index) &&
      hasAudioObject &&
      audioIsPlaying);
  ttsDebug("toggleMessageSpeech:active-check", {
    index,
    isActive,
    isActuallyActive,
    loadingIndex: state.tts.loadingMessageIndex,
    speakingIndex: state.tts.speakingMessageIndex,
    hasAudioObject,
    audioIsPlaying,
  });
  if (isActuallyActive) {
    ttsDebug("toggleMessageSpeech:stop-active", { index });
    stopTtsPlayback();
    return;
  }

  stopTtsPlayback();

  try {
    ttsDebug("toggleMessageSpeech:play", {
      index,
      contentLength: String(message.content || "").length,
    });
    await playTtsAudio(message.content, getCurrentCharacterTtsOptions(), {
      messageIndex: index,
    });
    ttsDebug("toggleMessageSpeech:success", { index });
  } catch (err) {
    if (isTtsCancelledError(err)) {
      ttsDebug("toggleMessageSpeech:cancelled", { index });
      return;
    }
    ttsDebug("toggleMessageSpeech:error", {
      index,
      error: String(err?.message || err || ""),
    });
    if (isTtsIndexMatch(state.tts.loadingMessageIndex, index)) {
      state.tts.loadingMessageIndex = null;
    }
    if (isTtsIndexMatch(state.tts.speakingMessageIndex, index)) {
      state.tts.speakingMessageIndex = null;
      state.tts.audio = null;
    }
    refreshAllSpeakerButtons();
    showToast(tf("ttsFailed", { error: err.message || t("unknownError") }), "error");
  }
}

function openPromptHistory() {
  if (!currentThread || state.sending) return;

  const list = document.getElementById("prompt-history-list");
  list.innerHTML = "";

  const prompts = conversationHistory.filter((m) => m.role === "user");
  if (prompts.length === 0) {
    const msg = document.createElement("p");
    msg.className = "muted";
    msg.textContent = "No prompts yet.";
    list.appendChild(msg);
  } else {
    prompts.forEach((entry) => {
      const btn = document.createElement("button");
      btn.className = "prompt-history-item";
      btn.textContent = entry.content;
      btn.addEventListener("click", () => {
        document.getElementById("user-input").value = entry.content;
        closePromptHistory();
      });
      list.appendChild(btn);
    });
  }

  document.getElementById("prompt-history-popover").classList.remove("hidden");
  state.promptHistoryOpen = true;
  positionPromptHistoryPopover();
}

function closePromptHistory() {
  if (!state.promptHistoryOpen) return;
  document.getElementById("prompt-history-popover").classList.add("hidden");
  state.promptHistoryOpen = false;
}

function positionPromptHistoryPopover() {
  const popover = document.getElementById("prompt-history-popover");
  const chatView = document.getElementById("chat-view");
  const inputRow = document.querySelector(".input-row");
  if (
    !popover ||
    !chatView ||
    !inputRow ||
    popover.classList.contains("hidden")
  )
    return;
  popover.style.bottom = "";
  popover.style.top = "0px";
  const desiredTop = Math.max(0, inputRow.offsetTop - popover.offsetHeight - 8);
  popover.style.top = `${desiredTop}px`;
}

function setSendingState(sending) {
  const sendBtn = document.getElementById("send-btn");
  const personaSelect = document.getElementById("persona-select");
  const currentId = Number(currentThread?.id);
  const activeId = Number(state.activeGenerationThreadId);
  const currentThreadGenerating =
    sending &&
    Number.isInteger(currentId) &&
    Number.isInteger(activeId) &&
    currentId === activeId;
  sendBtn.disabled = false;
  sendBtn.classList.toggle("is-generating", currentThreadGenerating);
  sendBtn.classList.toggle("danger-btn", currentThreadGenerating);
  sendBtn.textContent = currentThreadGenerating ? t("cancel") : t("send");
  personaSelect.disabled = currentThreadGenerating;
  refreshMessageControlStates();
  refreshAllSpeakerButtons();
  if (currentThreadGenerating) closePromptHistory();
}

function refreshMessageControlStates() {
  const log = document.getElementById("chat-log");
  if (!log) return;
  const rows = Array.from(log.querySelectorAll(".chat-row"));
  rows.forEach((row) => {
    const index = Number(row.dataset.messageIndex);
    const message = conversationHistory[index];
    const isStreaming = row.dataset.streaming === "1";
    const isTruncated = message?.truncatedByFilter === true;
    const hasGenerationError = !!String(message?.generationError || "").trim();

    row.querySelectorAll(".msg-delete-btn,.msg-copy-btn").forEach((btn) => {
      btn.disabled = isStreaming;
    });
    row.querySelectorAll(".msg-regen-btn").forEach((btn) => {
      btn.disabled = state.sending || isStreaming;
    });
    row.querySelectorAll(".msg-edit-btn").forEach((btn) => {
      btn.disabled = isStreaming || isTruncated || hasGenerationError;
    });
    row.querySelectorAll(".msg-info-btn").forEach((btn) => {
      applyInfoButtonAvailability(btn, message, isStreaming);
    });
    row.querySelectorAll(".msg-context-btn").forEach((btn) => {
      btn.disabled = isStreaming || !hasMessageContextData(message);
    });
  });
}

async function populateSettingsModels(options = {}) {
  const modelSelect = document.getElementById("model-select");
  if (!modelSelect) return;
  const force = options?.force === true;

  if (state.modelLoad.controller) {
    state.modelLoad.controller.abort();
  }
  const controller = new AbortController();
  state.modelLoad.controller = controller;
  const requestId = Number(state.modelLoad.requestId || 0) + 1;
  state.modelLoad.requestId = requestId;

  modelSelect.innerHTML = "";
  const loadingOpt = document.createElement("option");
  loadingOpt.value = "";
  loadingOpt.textContent = "Loading models...";
  modelSelect.appendChild(loadingOpt);
  modelSelect.disabled = true;

  try {
    if (force || state.modelCatalog.length === 0) {
      const remoteCatalog = await fetchOpenRouterModelCatalog(controller.signal);
      if (requestId !== state.modelLoad.requestId) return;
      state.modelCatalog = remoteCatalog;
    }
    renderSettingsModelOptions();
  } catch (err) {
    if (isAbortError(err)) return;
    if (state.modelCatalog.length === 0) {
      state.modelCatalog = getFallbackModelCatalog();
    }
    renderSettingsModelOptions();
    showToast(
      `Failed to load model list from OpenRouter: ${err?.message || "using fallback list."}`,
      "error",
    );
  } finally {
    if (requestId === state.modelLoad.requestId) {
      state.modelLoad.controller = null;
      modelSelect.disabled = false;
    }
  }
}

function renderSettingsModelOptions() {
  const modelSelect = document.getElementById("model-select");
  if (!modelSelect) return;
  const targetModel = String(state.settings.model || "").trim();
  const catalog =
    state.modelCatalog.length > 0 ? state.modelCatalog : getFallbackModelCatalog();

  const pricingFilter =
    state.settings.modelPricingFilter === "free" ||
    state.settings.modelPricingFilter === "paid"
      ? state.settings.modelPricingFilter
      : "all";
  const modalityFilter =
    state.settings.modelModalityFilter === "all" ? "all" : "text-only";
  const sortOrder = ["name_asc", "name_desc", "created_asc", "created_desc"].includes(
    state.settings.modelSortOrder,
  )
    ? state.settings.modelSortOrder
    : "name_asc";

  const filtered = catalog.filter((m) => {
    if (pricingFilter === "free" && !isModelFree(m)) return false;
    if (pricingFilter === "paid" && isModelFree(m)) return false;
    if (
      modalityFilter === "text-only" &&
      String(m.modality || "").toLowerCase() !== "text->text"
    ) {
      return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortOrder === "name_desc") return b.name.localeCompare(a.name);
    if (sortOrder === "created_asc") return a.created - b.created;
    if (sortOrder === "created_desc") return b.created - a.created;
    return a.name.localeCompare(b.name);
  });

  modelSelect.innerHTML = "";
  filtered.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    const lowContextMark = isLowContextRoleplayModel(m) ? " | ⚠ <=16k" : "";
    const moderationMark = m.isModerated === true ? " | Moderated" : "";
    opt.textContent = `${m.name} (${m.id})${lowContextMark}${moderationMark}`;
    modelSelect.appendChild(opt);
  });

  const exists = Array.from(modelSelect.options).some(
    (opt) => String(opt.value || "").trim() === targetModel,
  );
  if (!exists && targetModel) {
    const fromCatalog = catalog.find((m) => m.id === targetModel);
    const opt = document.createElement("option");
    opt.value = targetModel;
    opt.textContent = fromCatalog
      ? `${fromCatalog.name} (${targetModel})`
      : `${targetModel} (custom)`;
    modelSelect.appendChild(opt);
  }
  modelSelect.value = targetModel || DEFAULT_SETTINGS.model;

  const maxTokensSlider = document.getElementById("max-tokens-slider");
  const maxTokensValue = document.getElementById("max-tokens-value");
  if (maxTokensSlider && maxTokensValue) {
    const maxUpper = getSettingsMaxTokensUpperBound(modelSelect.value);
    state.settings.maxTokens = clampMaxTokens(
      state.settings.maxTokens,
      512,
      maxUpper,
    );
    maxTokensSlider.min = "512";
    maxTokensSlider.max = String(maxUpper);
    maxTokensSlider.value = String(state.settings.maxTokens);
    maxTokensValue.textContent = String(state.settings.maxTokens);
  }
  refreshSelectedModelMeta();
}

async function fetchOpenRouterModelCatalog(signal) {
  const headers = {};
  const localKey = String(state.settings.openRouterApiKey || "").trim();
  const fallbackKey = String(CONFIG.apiKey || "").trim();
  const apiKey = localKey || fallbackKey;
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    method: "GET",
    headers,
    signal,
  });
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const payload = await res.json();
      const msg = String(payload?.error?.message || "").trim();
      if (msg) errorMessage = `${errorMessage}: ${msg}`;
    } catch {
      // ignore json parse errors
    }
    throw new Error(errorMessage);
  }

  const payload = await res.json();
  const list = Array.isArray(payload?.data) ? payload.data : [];
  const normalized = list
    .map((model) => normalizeModelCatalogItem(model))
    .filter(Boolean);

  const byId = new Map(normalized.map((m) => [m.id, m]));
  if (!byId.has("openrouter/auto")) {
    byId.set("openrouter/auto", normalizeModelCatalogItem({
      id: "openrouter/auto",
      name: "Auto",
      architecture: { modality: "text->text" },
      top_provider: {},
      pricing: {},
      created: 0,
      context_length: 16384,
    }));
  }
  if (!byId.has("openrouter/free")) {
    byId.set("openrouter/free", normalizeModelCatalogItem({
      id: "openrouter/free",
      name: "OpenRouter Free Router",
      architecture: { modality: "text->text" },
      top_provider: {},
      pricing: { prompt: "0", completion: "0", request: "0", image: "0" },
      created: 0,
      context_length: 16384,
    }));
  }
  return Array.from(byId.values());
}

function normalizeModelCatalogItem(model) {
  const id = String(model?.id || "").trim();
  if (!id) return null;
  const name = String(model?.name || id).trim();
  const pricing = model?.pricing || {};
  const topProvider = model?.top_provider || {};
  const contextLength = Number(model?.context_length) || 0;
  const topContext = Number(topProvider?.context_length) || 0;
  const maxCompletion = Number(topProvider?.max_completion_tokens) || 0;
  return {
    id,
    name,
    created: Number(model?.created) || 0,
    modality: String(model?.architecture?.modality || "").toLowerCase(),
    promptPrice: Number(pricing?.prompt) || 0,
    completionPrice: Number(pricing?.completion) || 0,
    requestPrice: Number(pricing?.request) || 0,
    imagePrice: Number(pricing?.image) || 0,
    contextLength,
    topContextLength: topContext,
    maxCompletionTokens: maxCompletion,
    isModerated: topProvider?.is_moderated === true,
  };
}

function getFallbackModelCatalog() {
  return MODEL_OPTIONS.map((m, idx) =>
    normalizeModelCatalogItem({
      id: m.value,
      name: m.label,
      created: idx,
      architecture: { modality: "text->text" },
      top_provider: {},
      pricing: String(m.value || "").includes(":free")
        ? { prompt: "0", completion: "0", request: "0", image: "0" }
        : {},
      context_length: 16384,
    }),
  ).filter(Boolean);
}

function isModelFree(model) {
  if (!model) return false;
  if (String(model.id || "").includes(":free")) return true;
  return (
    Number(model.promptPrice || 0) <= 0 &&
    Number(model.completionPrice || 0) <= 0 &&
    Number(model.requestPrice || 0) <= 0 &&
    Number(model.imagePrice || 0) <= 0
  );
}

function getSelectedModelMeta(modelId) {
  const id = String(modelId || state.settings.model || "").trim();
  if (!id) return null;
  const catalog =
    state.modelCatalog.length > 0 ? state.modelCatalog : getFallbackModelCatalog();
  return catalog.find((m) => String(m.id || "") === id) || null;
}

function getSelectedModelTokenCompatibility(modelId) {
  const model = getSelectedModelMeta(modelId);
  if (!model) return { min: 512, max: 16384 };
  const candidates = [
    Number(model.maxCompletionTokens) || 0,
    Number(model.topContextLength) || 0,
    Number(model.contextLength) || 0,
  ].filter((n) => Number.isFinite(n) && n > 0);
  const hardMax = candidates.length > 0 ? Math.min(...candidates) : 16384;
  const roundedMax = Math.max(64, Math.floor(hardMax / 64) * 64 || 64);
  const min = Math.min(512, roundedMax);
  return { min, max: roundedMax };
}

function getSettingsMaxTokensUpperBound(modelId) {
  const model = getSelectedModelMeta(modelId);
  if (!model) return 8192;
  const primary =
    Number(model.maxCompletionTokens) > 0
      ? Number(model.maxCompletionTokens)
      : Number(model.topContextLength || model.contextLength || 0);
  if (!Number.isFinite(primary) || primary <= 0) return 8192;
  const rounded = Math.floor(primary / 64) * 64;
  const bounded = rounded > 0 ? rounded : primary;
  return Math.max(512, Math.min(8192, bounded));
}

function isLowContextRoleplayModel(model) {
  if (!model) return false;
  const maxCompletion = Number(model.maxCompletionTokens) || 0;
  const context = Number(model.topContextLength || model.contextLength) || 0;
  const completionLimited = maxCompletion > 0 && maxCompletion <= 16000;
  const contextLimited = context > 0 && context <= 16000;
  return completionLimited || contextLimited;
}

function refreshSelectedModelMeta(element = null) {
  const target = element || document.getElementById("model-selected-meta");
  const warning = document.getElementById("model-roleplay-warning");
  if (!target) return;
  const model = getSelectedModelMeta(state.settings.model);
  if (!model) {
    target.textContent = "";
    target.classList.remove("danger");
    warning?.classList.add("hidden");
    return;
  }
  const moderated = model.isModerated ? "Moderated: Yes" : "Moderated: No";
  const modality = model.modality || "unknown";
  const freeLabel = isModelFree(model) ? "Pricing: Free" : "Pricing: Paid";
  const context = Number(model.topContextLength || model.contextLength || 0);
  const maxCompletion = Number(model.maxCompletionTokens || 0);
  const createdText =
    Number(model.created) > 0
      ? new Date(Number(model.created) * 1000).toLocaleDateString()
      : "n/a";
  target.textContent = `${freeLabel} | ${moderated} | Modality: ${modality} | Context: ${context || "n/a"} | Max Completion: ${maxCompletion || "n/a"} | Created: ${createdText}`;
  const lowContext = isLowContextRoleplayModel(model);
  target.classList.toggle("danger", lowContext);
  if (warning) {
    warning.classList.toggle("hidden", !lowContext);
  }
}

function estimatePromptTokens(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return 0;
  let total = 0;
  for (const msg of messages) {
    const role = String(msg?.role || "");
    const content = String(msg?.content || "");
    // Heuristic token estimation for budgeting only.
    total += Math.ceil(content.length / 4) + Math.ceil(role.length / 4) + 6;
  }
  return total;
}

function resolveModelContextWindow(modelId) {
  const meta = getSelectedModelMeta(modelId);
  if (!meta) return 0;
  const candidates = [
    Number(meta.topContextLength) || 0,
    Number(meta.contextLength) || 0,
  ].filter((n) => Number.isFinite(n) && n > 0);
  return candidates.length > 0 ? Math.max(...candidates) : 0;
}

function computeEffectiveMaxTokensForRequest(modelId, promptMessages) {
  const userMax = clampMaxTokens(state.settings.maxTokens);
  const contextWindow = resolveModelContextWindow(modelId);
  if (!Number.isFinite(contextWindow) || contextWindow <= 0) return userMax;
  const SAFETY_MARGIN = 256;
  const promptTokens = estimatePromptTokens(promptMessages);
  const available = contextWindow - promptTokens - SAFETY_MARGIN;
  if (available <= 1) return 1;
  const bounded = Math.max(1, Math.floor(available));
  return Math.max(1, Math.min(userMax, bounded));
}

function openImagePreview(src) {
  if (!src) return;
  const img = document.getElementById("image-preview-img");
  const modal = document.getElementById("image-preview-modal");
  if (!img) return;
  state.imagePreview.src = src;
  img.src = src;
  img.draggable = false;
  resetImagePreviewZoom();
  modal?.classList.remove("hidden");
}

function closeImagePreview() {
  endImagePreviewPanning();
  const modal = document.getElementById("image-preview-modal");
  modal?.classList.add("hidden");
}

function applyImagePreviewZoom() {
  const img = document.getElementById("image-preview-img");
  if (!img) return;
  const scale = Math.max(
    state.imagePreview.minScale,
    Math.min(state.imagePreview.maxScale, Number(state.imagePreview.scale) || 1),
  );
  state.imagePreview.scale = scale;
  img.style.transform = `translate3d(${Number(state.imagePreview.panX) || 0}px, ${Number(state.imagePreview.panY) || 0}px, 0) scale(${scale})`;
}

function resetImagePreviewZoom() {
  state.imagePreview.scale = 1;
  state.imagePreview.panX = 0;
  state.imagePreview.panY = 0;
  applyImagePreviewZoom();
}

function onImagePreviewWheel(e) {
  const modal = document.getElementById("image-preview-modal");
  if (!modal || modal.classList.contains("hidden")) return;
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.12 : -0.12;
  state.imagePreview.scale += delta;
  applyImagePreviewZoom();
}

function onImagePreviewPointerDown(e) {
  const modal = document.getElementById("image-preview-modal");
  if (!modal || modal.classList.contains("hidden")) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;
  const img = document.getElementById("image-preview-img");
  if (!img) return;
  e.preventDefault();
  state.imagePreview.panning = true;
  state.imagePreview.pointerId = e.pointerId;
  state.imagePreview.startX = e.clientX;
  state.imagePreview.startY = e.clientY;
  state.imagePreview.startPanX = Number(state.imagePreview.panX) || 0;
  state.imagePreview.startPanY = Number(state.imagePreview.panY) || 0;
  if (typeof img.setPointerCapture === "function") {
    try {
      img.setPointerCapture(e.pointerId);
    } catch {
      // noop
    }
  }
  img.classList.add("is-panning");
}

function onImagePreviewPointerMove(e) {
  if (!state.imagePreview.panning) return;
  if (state.imagePreview.pointerId !== e.pointerId) return;
  e.preventDefault();
  const dx = e.clientX - (Number(state.imagePreview.startX) || 0);
  const dy = e.clientY - (Number(state.imagePreview.startY) || 0);
  state.imagePreview.panX = (Number(state.imagePreview.startPanX) || 0) + dx;
  state.imagePreview.panY = (Number(state.imagePreview.startPanY) || 0) + dy;
  applyImagePreviewZoom();
}

function onImagePreviewPointerEnd(e) {
  if (state.imagePreview.pointerId !== e.pointerId) return;
  endImagePreviewPanning(e.pointerId);
}

function endImagePreviewPanning(pointerId = null) {
  if (!state.imagePreview.panning && pointerId === null) return;
  const img = document.getElementById("image-preview-img");
  if (img && pointerId != null && typeof img.releasePointerCapture === "function") {
    try {
      img.releasePointerCapture(pointerId);
    } catch {
      // noop
    }
  }
  state.imagePreview.panning = false;
  state.imagePreview.pointerId = null;
  img?.classList.remove("is-panning");
}

function downloadImagePreview() {
  const src = String(state.imagePreview.src || "").trim();
  if (!src) return;
  const a = document.createElement("a");
  a.href = src;
  a.download = "image";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function openMessageMetadataModal(index) {
  const message = conversationHistory[index];
  if (!message) return;
  if (message.isInitial === true || message.userEdited === true) return;
  openModal("message-metadata-modal");
  const pre = document.getElementById("message-metadata-json");
  if (!pre) return;

  const renderMetadata = () => {
    const view = {
      index: index + 1,
      role: message.role || "",
      createdAt: message.createdAt
        ? new Date(Number(message.createdAt)).toISOString()
        : null,
      senderName: message.senderName || null,
      senderPersonaId: message.senderPersonaId || null,
      finishReason: message.finishReason || null,
      nativeFinishReason: message.nativeFinishReason || null,
      truncatedByFilter: message.truncatedByFilter === true,
      generationId: message.generationId || null,
      completionMeta: message.completionMeta || null,
      generationInfo: message.generationInfo || null,
      generationFetchDebug: message.generationFetchDebug || null,
    };
    pre.textContent = JSON.stringify(view, null, 2);
  };

  renderMetadata();

  if (
    message.role === "assistant" &&
    message.generationId &&
    !message.generationInfo
  ) {
    pre.textContent += "\n\nFetching generation info...";
    const fetched = await fetchGenerationDetails(message.generationId);
    message.generationInfo = fetched?.data || null;
    message.generationFetchDebug = fetched?.debug || [];
    await persistCurrentThread();
    renderMetadata();
  }
}

function cancelOngoingGeneration() {
  if (!state.sending || !state.abortController) return;
  state.abortController.abort();
}

function isViewingThread(threadId) {
  return (
    !!currentThread &&
    Number(currentThread.id) === Number(threadId) &&
    document.getElementById("chat-view")?.classList.contains("active")
  );
}

async function persistThreadMessagesById(threadId, messages, extra = {}) {
  const updated = {
    messages: Array.isArray(messages) ? messages : [],
    updatedAt: Date.now(),
    ...extra,
  };
  await db.threads.update(threadId, updated);
  if (currentThread && Number(currentThread.id) === Number(threadId)) {
    currentThread = { ...currentThread, ...updated };
    conversationHistory = updated.messages;
    state.lastSyncSeenUpdatedAt = Number(updated.updatedAt || 0);
  }
  broadcastSyncEvent({
    type: "thread-updated",
    threadId,
    updatedAt: updated.updatedAt,
  });
}

async function enqueueThreadGeneration(threadId, reason = "busy") {
  const id = Number(threadId);
  if (!Number.isInteger(id)) return;
  const wasQueued = state.generationQueue.includes(id);
  if (!wasQueued) state.generationQueue.push(id);
  const queueSize = state.generationQueue.length;
  const queuePos = state.generationQueue.indexOf(id) + 1;
  const queuedAt = Date.now();
  const thread = await db.threads.get(id);
  const threadMessages = Array.isArray(thread?.messages)
    ? thread.messages.map((m) => ({ ...m }))
    : [];
  if (!wasQueued) {
    const pendingIdx = findLatestPendingAssistantIndex(threadMessages);
    if (pendingIdx >= 0) {
      threadMessages[pendingIdx].generationStatus = "queued";
      threadMessages[pendingIdx].content = tf("queuedLabel", {
        position: queuePos,
        size: queueSize,
      });
      threadMessages[pendingIdx].generationError = "";
      threadMessages[pendingIdx].truncatedByFilter = false;
    } else {
      threadMessages.push({
        role: "assistant",
        content: tf("queuedLabel", { position: queuePos, size: queueSize }),
        createdAt: queuedAt,
        generationStatus: "queued",
        generationError: "",
        truncatedByFilter: false,
        usedLoreEntries: [],
        usedMemorySummary: "",
      });
    }
  }
  updateQueuedPlaceholdersInMessages(id, threadMessages);
  await db.threads.update(id, {
    messages: threadMessages,
    pendingGenerationReason: reason,
    pendingGenerationQueuedAt: queuedAt,
    updatedAt: queuedAt,
  });
  if (currentThread && Number(currentThread.id) === id) {
    conversationHistory = threadMessages;
    currentThread.pendingGenerationReason = reason;
    currentThread.pendingGenerationQueuedAt = queuedAt;
    currentThread.updatedAt = queuedAt;
    renderChat();
  }
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: id,
    updatedAt: queuedAt,
  });
  await renderThreads();
  if (queuePos > 0) {
    showToast(tf("generationQueuedToast", { position: queuePos }), "success");
  }
}

async function clearThreadGenerationQueueFlag(threadId) {
  const id = Number(threadId);
  if (!Number.isInteger(id)) return;
  state.generationQueue = state.generationQueue.filter((x) => Number(x) !== id);
  const queuedIds = [...state.generationQueue];
  const updatedAt = Date.now();
  const thread = await db.threads.get(id);
  const threadMessages = Array.isArray(thread?.messages)
    ? thread.messages.map((m) => ({ ...m }))
    : [];
  updateQueuedPlaceholdersInMessages(id, threadMessages);
  await db.threads.update(id, {
    messages: threadMessages,
    pendingGenerationReason: "",
    pendingGenerationQueuedAt: 0,
    updatedAt,
  });
  for (const qid of queuedIds) {
    const qThread = await db.threads.get(qid);
    if (!qThread) continue;
    const qMessages = Array.isArray(qThread.messages)
      ? qThread.messages.map((m) => ({ ...m }))
      : [];
    updateQueuedPlaceholdersInMessages(qid, qMessages);
    await db.threads.update(qid, { messages: qMessages, updatedAt: Date.now() });
  }
  if (currentThread && Number(currentThread.id) === id) {
    conversationHistory = threadMessages;
    currentThread.pendingGenerationReason = "";
    currentThread.pendingGenerationQueuedAt = 0;
    currentThread.updatedAt = updatedAt;
    renderChat();
  }
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: id,
    updatedAt,
  });
  for (const qid of queuedIds) {
    broadcastSyncEvent({
      type: "thread-updated",
      threadId: qid,
      updatedAt: Date.now(),
    });
  }
  await renderThreads();
}

async function tryStartQueuedGenerationForCurrentThread() {
  if (state.sending || !currentThread) return;
  const threadId = Number(currentThread.id);
  if (!state.generationQueue.includes(threadId)) return;
  const head = Number(state.generationQueue[0]);
  if (head !== threadId) return;
  await clearThreadGenerationQueueFlag(threadId);
  await generateBotReply();
}

async function requestBotReplyForCurrentThread(trigger = "manual_send") {
  if (!currentThread || !currentCharacter) return;
  const currentId = Number(currentThread.id);
  const activeId = Number(state.activeGenerationThreadId);
  if (state.sending && Number.isInteger(activeId) && activeId !== currentId) {
    await enqueueThreadGeneration(currentId, trigger);
    return;
  }
  await generateBotReply();
}

function findLatestPendingAssistantIndex(messages) {
  const list = Array.isArray(messages) ? messages : [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const m = list[i];
    if (!m || m.role !== "assistant") continue;
    const status = String(m.generationStatus || "").trim();
    if (status === "queued" || status === "generating" || status === "regenerating") {
      return i;
    }
    const emptyContent = !String(m.content || "").trim();
    const hasError = !!String(m.generationError || "").trim();
    if (emptyContent && !hasError && m.truncatedByFilter !== true) {
      return i;
    }
  }
  return -1;
}

function updateQueuedPlaceholdersInMessages(threadId, messages) {
  const id = Number(threadId);
  const list = Array.isArray(messages) ? messages : [];
  const queueIndex = state.generationQueue.indexOf(id);
  const queueSize = state.generationQueue.length;
  list.forEach((m) => {
    if (!m || m.role !== "assistant") return;
    if (String(m.generationStatus || "").trim() !== "queued") return;
    if (queueIndex >= 0 && queueSize > 0) {
      m.content = tf("queuedLabel", {
        position: queueIndex + 1,
        size: queueSize,
      });
    } else {
      m.content = "";
      m.generationStatus = "";
    }
  });
  return list;
}

async function persistCurrentThread() {
  if (!currentThread) return;

  const updated = {
    messages: conversationHistory,
    selectedPersonaId: currentThread.selectedPersonaId || null,
    lastPersonaInjectionPersonaId:
      currentThread.lastPersonaInjectionPersonaId || null,
    updatedAt: Date.now(),
  };

  await db.threads.update(currentThread.id, updated);
  currentThread = { ...currentThread, ...updated };
  state.lastSyncSeenUpdatedAt = Number(currentThread.updatedAt || 0);
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: currentThread.id,
    updatedAt: currentThread.updatedAt,
  });
}

function isChatNearBottom() {
  const log = document.getElementById("chat-log");
  if (!log) return true;
  const threshold = 36;
  const remaining = log.scrollHeight - log.scrollTop - log.clientHeight;
  return remaining <= threshold;
}

function scrollChatToBottom(force = false) {
  if (!force && state.sending && state.chatAutoScroll === false) return;
  const log = document.getElementById("chat-log");
  log.scrollTop = log.scrollHeight;
  updateScrollBottomButtonVisibility();
}

function updateScrollBottomButtonVisibility() {
  const btn = document.getElementById("scroll-bottom-btn");
  const chatViewActive = document.getElementById("chat-view")?.classList.contains("active");
  if (!btn) return;
  positionScrollBottomButton();
  if (!chatViewActive || !currentThread) {
    btn.classList.add("hidden");
    return;
  }
  if (isChatNearBottom()) btn.classList.add("hidden");
  else btn.classList.remove("hidden");
}

function positionScrollBottomButton() {
  const btn = document.getElementById("scroll-bottom-btn");
  const chatView = document.getElementById("chat-view");
  const inputRow = document.querySelector("#chat-view .input-row");
  if (!btn || !chatView || !inputRow) return;
  const chatRect = chatView.getBoundingClientRect();
  const inputRect = inputRow.getBoundingClientRect();
  const bottom = Math.max(18, Math.round(chatRect.bottom - inputRect.top + 10));
  btn.style.bottom = `${bottom}px`;
}

function setupCrossWindowSync() {
  if (typeof BroadcastChannel !== "undefined") {
    state.syncChannel = new BroadcastChannel("rp-thread-sync");
    state.syncChannel.onmessage = async (event) => {
      const data = event?.data;
      if (!data || data.sourceTabId === state.tabId) return;
      if (data.type === "thread-updated") {
        await renderThreads();
        if (
          currentThread &&
          Number(data.threadId) === Number(currentThread.id) &&
          !state.sending
        ) {
          await refreshCurrentThreadFromDb();
        }
      }
      if (data.type === "personas-updated") {
        await renderPersonaSelector();
        if (state.activeModalId === "personas-modal") {
          await renderPersonaModalList();
        }
      }
    };
  }

  if (!state.syncTimerId) {
    state.syncTimerId = window.setInterval(async () => {
      if (!currentThread || state.sending) return;
      const latest = await db.threads.get(currentThread.id);
      if (!latest) return;
      const latestUpdated = Number(latest.updatedAt || 0);
      if (latestUpdated > Number(state.lastSyncSeenUpdatedAt || 0)) {
        await refreshCurrentThreadFromDb();
        await renderThreads();
      }
    }, 1200);
  }
}

function broadcastSyncEvent(payload) {
  if (!state.syncChannel) return;
  state.syncChannel.postMessage({
    ...payload,
    sourceTabId: state.tabId,
  });
}

async function refreshCurrentThreadFromDb() {
  if (!currentThread) return;
  const thread = await db.threads.get(currentThread.id);
  if (!thread) return;
  currentThread = thread;
  state.lastSyncSeenUpdatedAt = Number(thread.updatedAt || 0);
  conversationHistory = (thread.messages || []).map((m) => ({
    ...m,
    role: m.role === "ai" ? "assistant" : m.role,
  }));
  currentPersona = thread.selectedPersonaId
    ? await db.personas.get(thread.selectedPersonaId)
    : currentPersona;
  updatePersonaPickerDisplay();
  renderChat();
}

async function migrateLegacySessions() {
  const threadCount = await db.threads.count();
  if (threadCount > 0) return;

  const sessions = await db.sessions.toArray();
  if (sessions.length === 0) return;

  for (const session of sessions) {
    await db.threads.add({
      characterId: session.characterId,
      title: `Imported Thread ${session.id}`,
      titleGenerated: false,
      titleManual: false,
      messages: session.messages || [],
      lastPersonaInjectionPersonaId: null,
      createdAt: session.updatedAt || Date.now(),
      updatedAt: session.updatedAt || Date.now(),
    });
  }
}

async function buildSystemPrompt(character, options = {}) {
  const defaultPersona = await getCharacterDefaultPersona(character);
  const personaForContext = options?.personaOverride || currentPersona || defaultPersona;
  const basePromptRaw = (
    character.systemPrompt ||
    state.settings.globalPromptTemplate ||
    ""
  ).trim();
  const basePrompt = replaceUserPlaceholders(
    basePromptRaw,
    defaultPersona?.name || "You",
  );
  const oneTimeExtraRaw =
    options?.includeOneTimeExtraPrompt === true
      ? String(character?.oneTimeExtraPrompt || "").trim()
      : "";
  const oneTimeExtra = replaceUserPlaceholders(
    oneTimeExtraRaw,
    defaultPersona?.name || "You",
  );
  const promptBeforePersona = [basePrompt, oneTimeExtra]
    .filter((part) => String(part || "").trim())
    .join("\n\n")
    .trim();
  const loreEntries = await getCharacterLoreEntries(character, {
    historyOverride: options?.historyOverride,
    personaOverride: personaForContext,
  });
  const memory =
    character.useMemory === false ? null : await getMemorySummary(character.id);
  const contextSections = [];
  state.pendingPersonaInjectionPersonaId = null;
  let systemPromptWithPersona = promptBeforePersona;
  if (
    personaForContext &&
    shouldInjectPersonaContext(personaForContext, options?.threadOverride || null)
  ) {
    const personaInjected = renderPersonaInjectionContent(personaForContext);
    systemPromptWithPersona = applyPersonaInjectionPlacement(
      promptBeforePersona,
      personaInjected,
      character?.personaInjectionPlacement || "end_system_prompt",
    );
    state.pendingPersonaInjectionPersonaId = personaForContext.id || null;
  }

  if (loreEntries.length > 0) {
    contextSections.push(`## Lore Context\n${loreEntries
      .map((e) => `- [${e.lorebookName || "Lore"}] ${e.content}`)
      .join("\n")}`);
  }
  if (memory) {
    contextSections.push(`## Memory Context\n${memory}`);
  }

  const prompt = [systemPromptWithPersona, ...contextSections]
    .filter(Boolean)
    .join("\n\n")
    .trim();
  if (options?.returnTrace === true) {
    return {
      prompt,
      loreEntries: Array.isArray(loreEntries) ? loreEntries : [],
      memory: memory || "",
    };
  }
  return prompt;
}

async function openMessageContextModal(index) {
  const message = conversationHistory[index];
  if (!message || !hasMessageContextData(message)) return;
  openModal("message-context-modal");
  const pre = document.getElementById("message-context-json");
  if (!pre) return;
  const view = {
    index: index + 1,
    role: message.role || "",
    usedMemorySummary: message.usedMemorySummary || "",
    usedLoreEntries: Array.isArray(message.usedLoreEntries)
      ? message.usedLoreEntries
      : [],
  };
  pre.textContent = JSON.stringify(view, null, 2);
}

function shouldInjectPersonaContext(persona, threadOverride = null) {
  if (!persona) return false;
  const mode =
    state.settings.personaInjectionWhen === "on_change"
      ? "on_change"
      : "always";
  if (mode === "always") return true;
  const currentPersonaId = Number(persona.id);
  const sourceThread = threadOverride || currentThread;
  const lastInjected = Number(sourceThread?.lastPersonaInjectionPersonaId);
  if (!Number.isInteger(lastInjected)) return true;
  return lastInjected !== currentPersonaId;
}

function renderPersonaInjectionContent(persona) {
  const template =
    state.settings.personaInjectionTemplate ||
    DEFAULT_SETTINGS.personaInjectionTemplate;
  return String(template || "")
    .replace(/\{\{\s*name\s*\}\}/gi, persona?.name || "You")
    .replace(
      /\{\{\s*description\s*\}\}/gi,
      persona?.description || "(none)",
    );
}

function applyPersonaInjectionPlacement(basePrompt, injection, placement) {
  const normalizedBase = String(basePrompt || "");
  const normalizedInjection = String(injection || "");
  if (!normalizedInjection.trim()) return normalizedBase;
  if ((placement || "end_system_prompt") === "end_system_prompt") {
    if (!normalizedBase.trim()) return normalizedInjection.trim();
    return `${normalizedBase}${normalizedInjection}`;
  }
  return `${normalizedBase}${normalizedInjection}`;
}

function replaceUserPlaceholders(text, replacement) {
  const value = String(text || "");
  const name = replacement || "You";
  return value
    .replace(/\{\{\s*user\s*\}\}/gi, name)
    .replace(/\[\[\s*user\s*\]\]/gi, name);
}

function replaceLorePlaceholders(text, personaName, charName) {
  return String(text || "")
    .replace(/\{\{\s*user\s*\}\}/gi, personaName || "You")
    .replace(/\[\[\s*user\s*\]\]/gi, personaName || "You")
    .replace(/\{\{\s*char\s*\}\}/gi, charName || "Character")
    .replace(/\[\[\s*char\s*\]\]/gi, charName || "Character");
}

function doesLoreEntryMatch(entry, sourceText) {
  const hay = String(sourceText || "").toLowerCase();
  const keys = (entry?.keys || []).map((k) => String(k || "").toLowerCase()).filter(Boolean);
  const secondary = (entry?.secondaryKeys || [])
    .map((k) => String(k || "").toLowerCase())
    .filter(Boolean);
  if (keys.length === 0) return false;
  const primaryMatch = keys.some((k) => hay.includes(k));
  if (!primaryMatch) return false;
  if (secondary.length === 0) return true;
  return secondary.every((k) => hay.includes(k));
}

function takeLoreEntriesByTokenBudget(entries, tokenBudget) {
  const budget = Math.max(100, Math.min(1000, Number(tokenBudget) || 200));
  let used = 0;
  const picked = [];
  for (const entry of entries) {
    const content = String(entry?.content || "").trim();
    if (!content) continue;
    const estimatedTokens = Math.ceil(content.length / 4);
    if (picked.length > 0 && used + estimatedTokens > budget) break;
    picked.push(entry);
    used += estimatedTokens;
  }
  return picked;
}

async function getCharacterLoreEntries(character, options = {}) {
  const loreIds = Array.isArray(character.lorebookIds)
    ? character.lorebookIds.map(Number).filter(Number.isInteger)
    : [];
  if (loreIds.length === 0) return [];
  const lorebooksRaw = await db.lorebooks.where("id").anyOf(loreIds).toArray();
  const lorebooks = lorebooksRaw.map((lb) => normalizeLorebookRecord(lb)).filter(Boolean);
  if (lorebooks.length === 0) return [];

  const scanWindow = Math.max(
    5,
    ...lorebooks.map((lb) => Math.max(5, Number(lb.scanDepth) || 50)),
  );
  const historySource = Array.isArray(options?.historyOverride)
    ? options.historyOverride
    : conversationHistory;
  const recent = historySource.slice(-scanWindow);
  const baseSource = recent.map((m) => String(m.content || "")).join("\n").toLowerCase();
  const defaultPersona = await getCharacterDefaultPersona(character);
  const personaName =
    options?.personaOverride?.name || currentPersona?.name || defaultPersona?.name || "You";
  const charName = character?.name || "Character";
  const results = [];

  lorebooks.forEach((lb) => {
    if (!Array.isArray(lb.entries) || lb.entries.length === 0) return;
    let source = baseSource;
    const matched = [];
    const matchedIds = new Set();
    const maxPasses = lb.recursiveScanning ? 4 : 1;
    for (let pass = 0; pass < maxPasses; pass += 1) {
      let addedThisPass = 0;
      lb.entries.forEach((entry) => {
        if (matchedIds.has(entry.id)) return;
        if (!doesLoreEntryMatch(entry, source)) return;
        matched.push(entry);
        matchedIds.add(entry.id);
        addedThisPass += 1;
      });
      if (addedThisPass === 0) break;
      if (lb.recursiveScanning) {
        source += `\n${matched.slice(-addedThisPass).map((e) => e.content).join("\n")}`.toLowerCase();
      }
    }

    const budgeted = takeLoreEntriesByTokenBudget(matched, lb.tokenBudget);
    budgeted.forEach((entry) => {
      results.push({
        lorebookName: lb.name || "Lore Book",
        entryId: entry.id,
        content: replaceLorePlaceholders(entry.content, personaName, charName),
      });
    });
  });
  return results;
}

async function getMemorySummary(characterId) {
  const entries = await db.memories
    .where("characterId")
    .equals(characterId)
    .sortBy("createdAt");
  if (entries.length === 0) return null;
  return entries.map((e) => e.summary).join("\n");
}

async function summarizeMemory(character) {
  if (character.useMemory === false) return;

  const toSummarize = conversationHistory.slice(0, 20);
  const prompt = `Summarize the following roleplay conversation in 3-5 sentences, focusing on key events, decisions, and relationship developments.\n\n${toSummarize.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

  try {
    const summaryResult = await callOpenRouter(
      state.settings.summarySystemPrompt ||
        DEFAULT_SETTINGS.summarySystemPrompt,
      [{ role: "user", content: prompt }],
      state.settings.model,
    );
    const summary = summaryResult.content;

    await db.memories.add({
      characterId: character.id,
      summary,
      createdAt: Date.now(),
    });

    conversationHistory = conversationHistory.slice(20);
    await persistCurrentThread();
    renderChat();
  } catch (e) {
    console.warn("Memory summarization failed:", e.message);
  }
}

async function callOpenRouter(
  systemPrompt,
  history,
  model,
  onChunk = null,
  signal = null,
) {
  const resolvedModel = resolveModelForRequest(model);
  const fallbackModel = getFallbackModel(resolvedModel, model);
  const promptMessages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: normalizeApiRole(m.apiRole || m.role),
      content: m.content,
    })),
  ];
  const effectiveMaxTokens = computeEffectiveMaxTokensForRequest(
    resolvedModel,
    promptMessages,
  );
  const body = {
    model: resolvedModel,
    messages: promptMessages,
    max_tokens: effectiveMaxTokens,
    temperature: clampTemperature(state.settings.temperature),
    stream: !!state.settings.streamEnabled,
  };

  try {
    const attempts = body.stream ? 1 : 3;
    return await requestCompletionWithRetry(body, attempts, onChunk, signal);
  } catch (primaryErr) {
    if (!fallbackModel) throw primaryErr;
    const fallbackBody = { ...body, model: fallbackModel };
    const fallbackAttempts = fallbackBody.stream ? 1 : 2;
    return requestCompletionWithRetry(
      fallbackBody,
      fallbackAttempts,
      onChunk,
      signal,
    );
  }
}

function resolveModelForRequest(model) {
  return model || state.settings.model || DEFAULT_SETTINGS.model;
}

function getFallbackModel(resolvedModel, originalModel) {
  if (!originalModel) return null;
  return resolvedModel === originalModel ? null : originalModel;
}

async function requestCompletionWithRetry(body, attempts, onChunk, signal) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetchCompletionResponse(body, signal);

      if (!res.ok) {
        let msg = res.statusText;
        const status = res.status;
        try {
          const err = await res.json();
          msg = buildOpenRouterErrorMessage(err, msg);
        } catch {
          // ignore parse error
        }
        const error = new Error(msg || `HTTP ${status}`);
        error.httpStatus = status;
        throw error;
      }

      if (body.stream) {
        const streamed = await readStreamedCompletion(res, body.model, onChunk);
        if (streamed.content) {
          return {
            ...streamed,
            generationInfo: null,
            generationFetchDebug: [],
          };
        }
        throw new Error("Empty assistant content from stream.");
      }

      const data = await res.json();
      const content = extractAssistantText(data);
      const finishMeta = extractFinishMeta(data);
      if (content && content.trim()) {
        const generationId = String(data?.id || "");
        return {
          content,
          model: data?.model || body.model,
          provider: data?.provider || "",
          finishReason: finishMeta.finishReason,
          nativeFinishReason: finishMeta.nativeFinishReason,
          truncatedByFilter: finishMeta.truncatedByFilter,
          generationId,
          completionMeta: {
            id: generationId,
            created: data?.created || null,
            object: data?.object || null,
            usage: data?.usage || null,
          },
          generationInfo: null,
          generationFetchDebug: [],
        };
      }

      const finishReason = data?.choices?.[0]?.finish_reason || "unknown";
      const provider = data?.provider || data?.model || "unknown";
      throw new Error(
        `Empty assistant content (finish_reason: ${finishReason}, provider: ${provider})`,
      );
    } catch (err) {
      lastError = err;
      if (!shouldRetryError(err, attempt, attempts)) throw err;
      await sleep(getRetryDelayMs(attempt));
    }
  }

  throw lastError || new Error("Request failed.");
}

async function fetchCompletionResponse(body, signal) {
  const localKey = String(state.settings.openRouterApiKey || "").trim();
  if (localKey) {
    return fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": getAppReferer(),
        "X-Title": "RP LLM BACKEND",
      },
      body: JSON.stringify(body),
      signal,
    });
  }

  const proxyUrl = "/api/chat-completions";
  const fallbackOnProxyStatus = new Set([
    400, 401, 402, 404, 408, 413, 422, 429, 500, 502, 503,
  ]);
  try {
    const proxyRes = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
    if (
      proxyRes.status !== 404 &&
      proxyRes.status !== 405 &&
      (!fallbackOnProxyStatus.has(proxyRes.status) || !CONFIG.apiKey)
    ) {
      return proxyRes;
    }
  } catch {
    // proxy unavailable locally; fallback below if api key exists client-side
  }

  if (!CONFIG.apiKey) {
    throw new Error(
      "Missing OpenRouter API key. Set it in Settings or provide server env OPENROUTER_API_KEY.",
    );
  }

  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CONFIG.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": getAppReferer(),
      "X-Title": "RP LLM BACKEND",
    },
    body: JSON.stringify(body),
    signal,
  });
}

function getAppReferer() {
  if (typeof CONFIG?.httpReferer === "string" && CONFIG.httpReferer.trim()) {
    return CONFIG.httpReferer.trim();
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost";
}

async function readStreamedCompletion(res, fallbackModel, onChunk) {
  if (!res.body) {
    throw new Error("No response stream available.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let model = fallbackModel;
  let provider = "";
  let generationId = "";
  let created = null;
  let object = null;
  let usage = null;
  let finishReason = "";
  let nativeFinishReason = "";
  let truncatedByFilter = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        generationId = json?.id || generationId;
        model = json?.model || model;
        provider = json?.provider || provider;
        created = json?.created ?? created;
        object = json?.object ?? object;
        usage = json?.usage ?? usage;
        const choice = json?.choices?.[0] || {};
        const chunkFinish = String(choice?.finish_reason || "");
        const chunkNativeFinish = String(choice?.native_finish_reason || "");
        if (chunkFinish) finishReason = chunkFinish;
        if (chunkNativeFinish) nativeFinishReason = chunkNativeFinish;
        if (
          chunkFinish.toLowerCase() === "content_filter" ||
          chunkNativeFinish.toLowerCase() === "content_filter"
        ) {
          truncatedByFilter = true;
          finishReason = "content_filter";
          nativeFinishReason = chunkNativeFinish || chunkFinish;
        }
        const piece = normalizeContentParts(json?.choices?.[0]?.delta?.content);
        if (piece) {
          content += piece;
          if (typeof onChunk === "function") onChunk(piece);
        }
      } catch {
        // ignore malformed chunk
      }
    }
  }

  return {
    content,
    model,
    provider,
    generationId,
    completionMeta: {
      id: generationId,
      created,
      object,
      usage,
    },
    finishReason,
    nativeFinishReason,
    truncatedByFilter,
  };
}

async function fetchGenerationDetails(generationId, signal) {
  const id = String(generationId || "").trim();
  if (!id) {
    return { data: null, debug: [{ source: "none", error: "missing-id" }] };
  }
  const debug = [];
  const endpoint = `https://openrouter.ai/api/v1/generation?id=${encodeURIComponent(id)}`;
  const localKey = String(state.settings.openRouterApiKey || "").trim();
  const fallbackKey = String(CONFIG.apiKey || "").trim();
  const authKey = localKey || fallbackKey;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const headers = {};
      if (authKey) {
        headers.Authorization = `Bearer ${authKey}`;
        headers["HTTP-Referer"] = getAppReferer();
        headers["X-Title"] = "RP LLM BACKEND";
      }
      const res = await fetch(endpoint, {
        method: "GET",
        headers,
        credentials: "omit",
        signal,
      });
      if (res.ok) return { data: await res.json(), debug };
      debug.push({ source: "direct", endpoint, attempt, status: res.status });
      const shouldRetry =
        res.status === 404 || res.status === 408 || res.status === 409;
      if (shouldRetry && attempt < 4) {
        await sleep(getRetryDelayMs(attempt));
        continue;
      }
    } catch (err) {
      if (isAbortError(err)) return { data: null, debug };
      debug.push({
        source: "direct",
        endpoint,
        attempt,
        error: String(err?.message || err),
      });
      if (attempt < 4) {
        await sleep(getRetryDelayMs(attempt));
        continue;
      }
    }
    break;
  }
  return { data: null, debug };
}

function shouldRetryError(error, attempt, attempts) {
  if (attempt >= attempts) return false;
  if (isAbortError(error)) return false;
  const msg = String(error?.message || "").toLowerCase();
  const status = Number(error?.httpStatus || 0);
  if (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("timeout")
  ) {
    return true;
  }
  if (status === 408 || status === 409 || status === 429) return true;
  if (status >= 500) return true;
  return false;
}

function isAbortError(error) {
  return (
    error?.name === "AbortError" ||
    String(error?.message || "")
      .toLowerCase()
      .includes("aborted")
  );
}

function getRetryDelayMs(attempt) {
  const delays = [700, 1500, 2600];
  return delays[Math.min(attempt - 1, delays.length - 1)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampMaxTokens(value, min = 512, max = 8192) {
  const n = Number(value);
  const minSafe = Math.max(1, Number(min) || 512);
  const maxSafe = Math.max(minSafe, Number(max) || 16384);
  if (!Number.isFinite(n)) {
    return Math.max(minSafe, Math.min(maxSafe, DEFAULT_SETTINGS.maxTokens));
  }
  const rounded = Math.round(n / 64) * 64;
  return Math.max(minSafe, Math.min(maxSafe, rounded));
}

function clampTemperature(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.temperature;
  return Math.max(0, Math.min(2, Number(n.toFixed(2))));
}

function normalizeApiRole(role) {
  const r = String(role || "").toLowerCase();
  if (r === "assistant" || r === "user" || r === "system" || r === "tool") {
    return r;
  }
  if (r === "ai") return "assistant";
  return "user";
}

function buildOpenRouterErrorMessage(payload, fallbackMessage) {
  const base = payload?.error?.message || fallbackMessage || "Request failed";
  const raw = payload?.error?.metadata?.raw;
  const providerName = payload?.error?.metadata?.provider_name;
  const parts = [base];
  if (raw) parts.push(raw);
  if (providerName) parts.push(`provider: ${providerName}`);
  return parts.join(" | ");
}

function updateModelPill() {
  const pill = document.getElementById("chat-model-pill");
  if (!pill) return;
  const model =
    state.lastUsedModel || resolveModelForRequest(state.settings.model);
  const provider = state.lastUsedProvider ? ` (${state.lastUsedProvider})` : "";
  pill.textContent = `Model: ${model}${provider}`;
  scheduleThreadBudgetIndicatorUpdate();
}

function scheduleThreadBudgetIndicatorUpdate() {
  if (state.budgetIndicator.timerId) {
    window.clearTimeout(state.budgetIndicator.timerId);
  }
  state.budgetIndicator.timerId = window.setTimeout(() => {
    state.budgetIndicator.timerId = null;
    updateThreadBudgetIndicator().catch(() => {});
  }, 120);
}

async function updateThreadBudgetIndicator() {
  const pill = document.getElementById("chat-budget-pill");
  if (!pill) return;
  const isChatViewActive = document
    .getElementById("chat-view")
    ?.classList.contains("active");
  if (!isChatViewActive || !currentThread || !currentCharacter) {
    pill.textContent = "Max out: -";
    pill.classList.remove("warn", "danger");
    pill.title = t("threadBudgetUnavailable");
    return;
  }

  const seq = Number(state.budgetIndicator.seq || 0) + 1;
  state.budgetIndicator.seq = seq;

  const includeOneTimeExtra = shouldIncludeOneTimeExtraPrompt(conversationHistory);
  const previousPendingPersonaInjection =
    state.pendingPersonaInjectionPersonaId;
  let systemPrompt = "";
  try {
    systemPrompt = await buildSystemPrompt(currentCharacter, {
      includeOneTimeExtraPrompt: includeOneTimeExtra,
      returnTrace: false,
    });
  } finally {
    state.pendingPersonaInjectionPersonaId = previousPendingPersonaInjection;
  }
  if (seq !== state.budgetIndicator.seq) return;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: normalizeApiRole(m.apiRole || m.role),
      content: m.content,
    })),
  ];

  const pendingInput = String(
    document.getElementById("user-input")?.value || "",
  ).trim();
  if (pendingInput) {
    messages.push({ role: "user", content: pendingInput });
  }

  const resolvedModel = resolveModelForRequest(state.settings.model);
  const userMax = clampMaxTokens(state.settings.maxTokens);
  const contextWindow = resolveModelContextWindow(resolvedModel);
  const promptTokens = estimatePromptTokens(messages);
  const effectiveMax = computeEffectiveMaxTokensForRequest(
    resolvedModel,
    messages,
  );

  pill.textContent = `Max out: ${effectiveMax}`;
  pill.classList.remove("warn", "danger");
  if (effectiveMax < Math.max(256, Math.floor(userMax * 0.33))) {
    pill.classList.add("danger");
  } else if (effectiveMax < Math.max(512, Math.floor(userMax * 0.66))) {
    pill.classList.add("warn");
  }
  const contextText = contextWindow > 0 ? String(contextWindow) : "unknown";
  pill.title = tf("threadBudgetTooltip", {
    userMax,
    contextText,
    promptTokens,
    effectiveMax,
  });
}

function extractAssistantText(payload) {
  const msg = payload?.choices?.[0]?.message;
  if (!msg) return "";

  const fromContent = normalizeContentParts(msg.content);
  if (fromContent && fromContent.trim()) return fromContent;

  const fromReasoning = normalizeContentParts(msg.reasoning);
  if (fromReasoning && fromReasoning.trim()) return fromReasoning;

  if (typeof payload?.choices?.[0]?.text === "string") {
    return payload.choices[0].text;
  }

  return "";
}

function extractFinishMeta(payload) {
  const choice = payload?.choices?.[0] || {};
  const finishReason = String(choice?.finish_reason || "");
  const nativeFinishReason = String(choice?.native_finish_reason || "");
  const truncatedByFilter =
    finishReason.toLowerCase() === "content_filter" ||
    nativeFinishReason.toLowerCase() === "content_filter";
  return { finishReason, nativeFinishReason, truncatedByFilter };
}

function normalizeContentParts(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const joined = value
      .map((part) => {
        if (typeof part === "string") return part;
        if (!part || typeof part !== "object") return "";
        if (typeof part.text === "string") return part.text;
        if (typeof part.content === "string") return part.content;
        if (typeof part.output_text === "string") return part.output_text;
        return "";
      })
      .join("");
    return joined;
  }
  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text;
    if (typeof value.content === "string") return value.content;
    if (typeof value.output_text === "string") return value.output_text;
  }
  return "";
}

function renderMessageHtml(content, role = "assistant") {
  let raw = String(content || "");
  if (role === "assistant" && currentCharacter?.usePostProcessing !== false) {
    raw = applyPostProcessingRules(raw);
  }
  if (!state.settings.markdownEnabled) {
    return state.settings.allowMessageHtml
      ? raw.replace(/\n/g, "<br>")
      : escapeHtml(raw).replace(/\n/g, "<br>");
  }
  return markdownToHtml(raw);
}

function markdownToHtml(input) {
  let html = state.settings.allowMessageHtml
    ? String(input)
    : escapeHtml(input);

  html = html.replace(
    /```([\s\S]*?)```/g,
    (_m, code) => `<pre><code>${code}</code></pre>`,
  );
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="md-strong">$1</strong>',
  );
  html = html.replace(/\*([^*]+)\*/g, '<em class="md-em">$1</em>');
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  const blocks = html
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
  const rendered = blocks.map((block) => {
    if (block.startsWith(">")) {
      const quote = block
        .split("\n")
        .map((line) => line.replace(/^>\s?/, ""))
        .join("<br>");
      return `<blockquote class="md-blockquote">${quote}</blockquote>`;
    }
    if (/^[-*] /.test(block)) {
      const items = block
        .split("\n")
        .filter((line) => /^[-*] /.test(line))
        .map((line) => `<li>${line.replace(/^[-*] /, "")}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }
    return `<p>${block.replace(/\n/g, "<br>")}</p>`;
  });

  return rendered.join("");
}

function applyPostProcessingRules(text) {
  const rules = parsePostProcessingRules(state.settings.postprocessRulesJson);
  if (rules.length === 0) return text;
  let out = text;
  for (const rule of rules) {
    try {
      const re = new RegExp(rule.pattern, rule.flags || "g");
      out = out.replace(re, rule.replacement || "");
    } catch {
      // ignore malformed rule
    }
  }
  return out;
}

function parsePostProcessingRules(rawJson) {
  try {
    const parsed = JSON.parse(rawJson || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r) =>
        r && typeof r.pattern === "string" && typeof r.replacement === "string",
    );
  } catch {
    return [];
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fallbackAvatar(seed, width, height) {
  const initial = escapeHtml(
    (seed || "?").trim().slice(0, 1).toUpperCase() || "?",
  );
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><rect width='100%' height='100%' fill='#253147'/><text x='50%' y='53%' text-anchor='middle' font-size='${Math.floor(width * 0.48)}' fill='#c2cee4' font-family='Segoe UI'>${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
