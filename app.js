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
  model:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M9 9h6v6H9z"></path><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"></path></svg>',
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
  allowMessageHtml: false,
  streamEnabled: true,
  autoReplyEnabled: true,
  enterToSendEnabled: true,
  autoPairEnabled: true,
  maxTokens: Number(CONFIG.maxTokens) > 0 ? Number(CONFIG.maxTokens) : 8192,
  temperature: Number.isFinite(Number(CONFIG.temperature))
    ? Number(CONFIG.temperature)
    : 0.8,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  cancelShortcut: "Ctrl+.",
  homeShortcut: "Alt+H",
  newCharacterShortcut: "Alt+N",
  globalPromptTemplate: "Stay in character and respond naturally.",
  summarySystemPrompt: "You are a helpful summarization assistant.",
  personaInjectionTemplate:
    "\n\n## Active User Persona\nName: {{name}}\nDescription: {{description}}",
  writingInstructionsInjectionWhen: "always",
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
  marqueeBehavior: "disabled",
  botCardAvatarEffect: "none",
  botCardAvatarTransitionDelay: 4,
  completionCooldown: 2,
  threadAutoTitleEnabled: true,
  threadAutoTitleMinMessages: 5,
  favoriteModels: [],
  chatMessageAlignment: "left",
  unreadSoundEnabled: true,
};

let unreadSoundAudioCtx = null;

function playUnreadMessageSound() {
  if (state.settings.unreadSoundEnabled === false) return;
  try {
    if (!unreadSoundAudioCtx) {
      unreadSoundAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (unreadSoundAudioCtx.state === "suspended") {
      unreadSoundAudioCtx.resume();
    }
    const oscillator = unreadSoundAudioCtx.createOscillator();
    const gainNode = unreadSoundAudioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(unreadSoundAudioCtx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, unreadSoundAudioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, unreadSoundAudioCtx.currentTime + 0.3);
    oscillator.start(unreadSoundAudioCtx.currentTime);
    oscillator.stop(unreadSoundAudioCtx.currentTime + 0.3);
  } catch {
    // ignore audio errors
  }
}

const DEFAULT_KOKORO_VOICE = "af_heart";
// const KOKORO_MODEL_ID = "onnx-community/Kokoro-82M-ONNX";
const KOKORO_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
// const KOKORO_MODEL_ID = "hexgrad/Kokoro-82M";

// const KOKORO_MODULE_PATHS = [
//   "https://cdn.jsdelivr.net/npm/kokoro-js/dist/kokoro.web.js",
// ];

const KOKORO_MODULE_PATHS = [
  "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js",
];

const KOKORO_DEVICE_OPTIONS = ["wasm", "webgpu"];
const KOKORO_DTYPE_OPTIONS = [
  // "fp32",
  "fp16",
  "q8",
  "q4",
  "q4f16",
  "q8f16",
  "auto",
  "uint8",
  "uint8f16",
];
const KOKORO_DTYPE_LABELS = {
  // fp32: "FP32",
  fp16: "FP16",
  q8: "Q8",
  q4: "Q4",
  q4f16: "Q4f16",
  q8f16: "Q8f16",
  auto: "AUTO",
  uint8: "UINT8",
  uint8f16: "UINT8F16",
};
const KOKORO_VOICE_OPTIONS = [
  "af_alloy",
  "af_aoede",
  "af_bella",
  "af_heart",
  "af_jessica",
  "af_kore",
  "af_nicole",
  "af_nova",
  "af_river",
  "af_sarah",
  "af_sky",
  "am_adam",
  "am_echo",
  "am_eric",
  "am_fenrir",
  "am_liam",
  "am_michael",
  "am_onyx",
  "am_puck",
  "am_santa",
  "bf_alice",
  "bf_emma",
  "bf_isabella",
  "bf_lily",
  "bm_daniel",
  "bm_fable",
  "bm_george",
  "bm_lewis",
  "ef_dora",
  "em_alex",
  "em_santa",
  "ff_siwis",
  "hf_alpha",
  "hf_beta",
  "hm_omega",
  "hm_psi",
  "if_sara",
  "im_nicola",
  "jf_alpha",
  "jf_gongitsune",
  "jf_nezumi",
  "jf_tebukuro",
  "jm_kumo",
  "pf_dora",
  "pm_alex",
  "pm_santa",
  "zf_xiaobei",
  "zf_xiaoni",
  "zf_xiaoxiao",
  "zf_xiaoyi",
  "zm_yunjian",
  "zm_yunxi",
  "zm_yunxia",
  "zm_yunyang",
];

const KOKORO_LANGUAGE_VOICE_PREFIXES = {
  en: ["af", "am", "bf", "bm"],
  fr: ["ff"],
  it: ["if", "im"],
  ja: ["jf", "jm"],
  zh: ["zf", "zm"],
  hi: ["hf", "hm"],
  "pt-BR": ["pf", "pm"],
  pt: ["pf", "pm"],
};

const UI_LANG_OPTIONS = ["en", "fr", "it", "de", "es", "pt-BR"];
const LOCALES_BASE_PATH = "locales";
const BOT_LANGUAGE_OPTIONS = [
  "en",
  "fr",
  "it",
  "de",
  "es",
  "pt-BR",
  "pt-PT",
  "ja",
  "ko",
  "zh-CN",
  "zh-TW",
  "ru",
  "ar",
  "nl",
  "tr",
  "pl",
  "sv",
  "da",
  "fi",
  "no",
  "cs",
  "ro",
  "hu",
  "el",
  "he",
  "hi",
  "id",
  "th",
  "vi",
];

const BOT_LANGUAGE_FLAGS = {
  en: "ðŸ‡ºðŸ‡¸",
  fr: "ðŸ‡«ðŸ‡·",
  it: "ðŸ‡®ðŸ‡¹",
  de: "ðŸ‡©ðŸ‡ª",
  es: "ðŸ‡ªðŸ‡¸",
  "pt-BR": "ðŸ‡§ðŸ‡·",
  "pt-PT": "ðŸ‡µðŸ‡¹",
  ja: "ðŸ‡¯ðŸ‡µ",
  ko: "ðŸ‡°ðŸ‡·",
  "zh-CN": "ðŸ‡¨ðŸ‡³",
  "zh-TW": "ðŸ‡¹ðŸ‡¼",
  ru: "ðŸ‡·ðŸ‡º",
  ar: "ðŸ‡¸ðŸ‡¦",
  nl: "ðŸ‡³ðŸ‡±",
  tr: "ðŸ‡¹ðŸ‡·",
  pl: "ðŸ‡µðŸ‡±",
  sv: "ðŸ‡¸ðŸ‡ª",
  da: "ðŸ‡©ðŸ‡°",
  fi: "ðŸ‡«ðŸ‡®",
  no: "ðŸ‡³ðŸ‡´",
  cs: "ðŸ‡¨ðŸ‡¿",
  ro: "ðŸ‡·ðŸ‡´",
  hu: "ðŸ‡­ðŸ‡º",
  el: "ðŸ‡¬ðŸ‡·",
  he: "ðŸ‡®ðŸ‡±",
  hi: "ðŸ‡®ðŸ‡³",
  id: "ðŸ‡®ðŸ‡©",
  th: "ðŸ‡¹ðŸ‡­",
  vi: "ðŸ‡»ðŸ‡³",
};

const CHARACTER_SORT_BASES = ["created", "updated", "name", "threads"];
const CHARACTER_SORT_ICON_TEMPLATES = {
  created:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="%23f5f7ff" opacity="0.35"/><path d="M16 9v14M9 16h14" stroke="%231c2737" stroke-width="2" stroke-linecap="round"/></svg>',
  updated:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M10 12a8 8 0 1 1 11.3 11.3L16 21" fill="none" stroke="%231c2737" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 9v-4h6" fill="none" stroke="%231c2737" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  name: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text x="9" y="23" font-size="18" font-family="Segoe UI, system-ui" fill="%23f5f7ff">A</text><path d="M9 10l7 12l7-12" fill="none" stroke="%231c2737" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  threads:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="6" y="8" width="20" height="4" rx="2" fill="%23f5f7ff" opacity="0.65"/><rect x="6" y="14" width="20" height="4" rx="2" fill="%23f5f7ff" opacity="0.45"/><rect x="6" y="20" width="20" height="4" rx="2" fill="%23f5f7ff" opacity="0.25"/><path d="M9 8v14" fill="none" stroke="%231c2737" stroke-width="2" stroke-linecap="round"/></svg>',
};
const CHARACTER_SORT_LABEL_KEYS = {
  created: "characterSortCreationDate",
  updated: "characterSortUpdateDate",
  name: "characterSortName",
  threads: "characterSortChats",
};

const BOT_LANGUAGE_FLAG_ICON_CODES = {
  en: "us",
  fr: "fr",
  it: "it",
  de: "de",
  es: "es",
  "pt-BR": "br",
  "pt-PT": "pt",
  ja: "jp",
  ko: "kr",
  "zh-CN": "cn",
  "zh-TW": "tw",
  ru: "ru",
  ar: "sa",
  nl: "nl",
  tr: "tr",
  pl: "pl",
  sv: "se",
  da: "dk",
  fi: "fi",
  no: "no",
  cs: "cz",
  ro: "ro",
  hu: "hu",
  el: "gr",
  he: "il",
  hi: "in",
  id: "id",
};

const BOT_LANGUAGE_NAMES = {
  en: "English",
  fr: "French",
  it: "Italian",
  de: "German",
  es: "Spanish",
  "pt-BR": "Portuguese (Brazil)",
  "pt-PT": "Portuguese (Portugal)",
  ja: "Japanese",
  ko: "Korean",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  ru: "Russian",
  ar: "Arabic",
  nl: "Dutch",
  tr: "Turkish",
  pl: "Polish",
  sv: "Swedish",
  da: "Danish",
  fi: "Finnish",
  no: "Norwegian",
  cs: "Czech",
  ro: "Romanian",
  hu: "Hungarian",
  el: "Greek",
  he: "Hebrew",
  hi: "Hindi",
  id: "Indonesian",
};

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
    promptPlaceholder:
      "What do you say or do? Enter to send, Shift+Enter for newline",
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
    personaDescriptionLimit:
      "Persona description must be 100 characters or less.",
    noPersonasYet: "No personas yet.",
    dragToReorder: "Drag to reorder",
    defaultSuffix: "Default",
    globalDefaultSuffix: "Global Default",
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
    characterNameRequiredAllLanguages:
      "Character name is required in all language tabs. Missing: {langs}.",
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
    msgMetadataUnavailableGenerating: "Metadata unavailable while generating.",
    msgMetadataUnavailableGeneratingAria:
      "Metadata unavailable while generating",
    threadBudgetTooltip:
      "Estimated effective output budget for this thread.\nUser max: {userMax}\nModel context: {contextText}\nEstimated prompt tokens: {promptTokens}\nSafety margin: 256\nEffective max_tokens: {effectiveMax}",
    generationQueuedToast: "Generation queued (position {position}).",
    generationQueuedNotice: "Generation queued. Waiting for active generation.",
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
    threadAutoTitleEnabled: "Enable Auto-titling for Threads",
    threadAutoTitleMinMessages: "Min. Messages",
    chatMessageAlignment: "Message Alignment",
    messageAlignmentLeft: "Left (Default)",
    messageAlignmentCenter: "Center",
    resetAppData: "Reset App Data",
    resetAppDataSoon: "Reset app data will be added soon.",
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
    modelNotRecommendedRoleplay:
      "This model is NOT recommended for roleplaying.",
    maxTokensLabel: "Max Tokens",
    temperatureLabel: "Temperature",
    toastDelayLabel: "Toast Delay",
    cooldownToastActive: "Cooldown active: {seconds}s",
    marqueeBehaviorLabel: "Marquee Behavior",
    marqueeBehaviorDisabled: "Disabled",
    marqueeBehaviorOnHover: "On Hover",
    marqueeBehaviorAlways: "Always",
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
    writingInstructionsInjectionTiming: "Writing Instructions Injection Timing",
    always: "Always",
    everyOther: "Every Other",
    everySecond: "Every Second",
    everyThird: "Every Third",
    everyFourth: "Every Fourth",
    nameLabel: "Name",
    avatarUrl: "Avatar URL",
    avatars: "Avatars",
    avatarFile: "Avatar File",
    personaDescription: "Description (max 100 chars)",
    personaInternalDescription: "Internal Description (optional)",
    setDefaultPersona: "Set as default persona",
    savePersona: "Save Persona",
    loreBookManagement: "Lore Book Management",
    createLoreBook: "+ Create Lore Book",
    importLoreBook: "^ Import Lore Book",
    backToList: "< Back to List",
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
    removeTagAffectsChars:
      "Removing this tag will update these characters:\n\n{list}{extra}\n\nContinue?",
    createCharacterTitle: "Create Character",
    editCharacterTitle: "Edit Character",
    characterPrompt: "Character Prompt",
    oneTimeExtraPrompt: "One-time only Extra System/Character Prompt",
    writingInstructions: "Writing Instructions",
    writingInstructionsNone: "None",
    apply: "Apply",
    closeWithoutSaving: "Close Without Saving",
    saveAndClose: "Save and Close",
    initialMessages: "Initial Messages",
    tagsCommaSeparated: "Tags (comma-separated)",
    personaInjectionPlacement: "Persona Injection Placement",
    atEndCharacterPrompt: "At End of Character Prompt",
    botConfiguration: "Config",
    bgTab: "BG",
    tagsTab: "Tags",
    addLanguage: "Add Language",
    add: "Add",
    enableTts: "Enable TTS",
    preferLoreBooksInMatchingLanguage: "Prefer Lore Books in Matching Language",
    removeLanguageTitle: "Remove Language",
    removeLanguageConfirm: "Remove language definition {lang}?",
    removeLanguageConfirmWithThreads:
      "Remove language definition {lang}? This will delete {count} thread(s) using this language.",
    languageRequired: "At least one language definition is required.",
    enableMemory: "Enable Memory",
    enablePostprocess: "Enable Post-processing Rules",
    autoTriggerAiFirst: "Auto-trigger AI first message",
    avatarScaleInChat: "Avatar Scale (In Chat)",
    ttsProvider: "TTS Provider",
    ttsLanguage: "TTS Language",
    ttsVoice: "TTS Voice",
    ttsRate: "TTS Rate",
    ttsPitch: "TTS Pitch",
    testCharacterVoice: "Test Character Voice",
    stopCharacterVoiceTest: "Stop character voice test",
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
    languageFrench: "Francais",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "Espanol",
    languagePortugueseBr: "Portugues (Brasil)",
  },
  fr: {
    threads: "Fils",
    createCharacter: "+ Personnage",
    importCharacter: "Importer personnage",
    settings: "ParamÃ¨tres",
    personas: "Personas",
    loreBooks: "Livres de lore",
    shortcuts: "Raccourcis",
    back: "Retour",
    previousPrompts: "Prompts prÃ©cÃ©dents",
    send: "Envoyer",
    cancel: "Annuler",
    hideShortcuts: "Masquer raccourcis",
    showShortcuts: "Afficher raccourcis",
    autoReply: "RÃ©ponse auto",
    enterToSend: "ENTRÃ‰E pour envoyer",
    settingsTitle: "ParamÃ¨tres",
    languageLabel: "Langue de l'interface",
    languageAuto: "Auto (navigateur)",
    languageEnglish: "English",
    languageFrench: "FranÃ§ais",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "EspaÃ±ol",
    languagePortugueseBr: "PortuguÃªs (Brasil)",
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
    languageFrench: "FranÃ§ais",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "EspaÃ±ol",
    languagePortugueseBr: "PortuguÃªs (Brasil)",
  },
  de: {
    threads: "Threads",
    createCharacter: "+ Charakter",
    importCharacter: "Charakter importieren",
    settings: "Einstellungen",
    personas: "Personas",
    loreBooks: "Lore-BÃ¼cher",
    shortcuts: "Shortcuts",
    back: "ZurÃ¼ck",
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
    languageFrench: "FranÃ§ais",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "EspaÃ±ol",
    languagePortugueseBr: "PortuguÃªs (Brasil)",
  },
  es: {
    threads: "Hilos",
    createCharacter: "+ Personaje",
    importCharacter: "Importar personaje",
    settings: "ConfiguraciÃ³n",
    personas: "Personas",
    loreBooks: "Libros de lore",
    shortcuts: "Atajos",
    back: "Volver",
    previousPrompts: "Prompts anteriores",
    send: "Enviar",
    cancel: "Cancelar",
    hideShortcuts: "Ocultar atajos",
    showShortcuts: "Mostrar atajos",
    autoReply: "Respuesta automÃ¡tica",
    enterToSend: "ENTER para enviar",
    settingsTitle: "ConfiguraciÃ³n",
    languageLabel: "Idioma de interfaz",
    languageAuto: "Auto (navegador)",
    languageEnglish: "English",
    languageFrench: "FranÃ§ais",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "EspaÃ±ol",
    languagePortugueseBr: "PortuguÃªs (Brasil)",
  },
  "pt-BR": {
    threads: "Conversas",
    createCharacter: "+ Personagem",
    importCharacter: "Importar personagem",
    settings: "ConfiguraÃ§Ãµes",
    personas: "Personas",
    loreBooks: "Livros de lore",
    shortcuts: "Atalhos",
    back: "Voltar",
    previousPrompts: "Prompts anteriores",
    send: "Enviar",
    cancel: "Cancelar",
    hideShortcuts: "Ocultar atalhos",
    showShortcuts: "Mostrar atalhos",
    autoReply: "Resposta automÃ¡tica",
    enterToSend: "ENTER para enviar",
    settingsTitle: "ConfiguraÃ§Ãµes",
    languageLabel: "Idioma da interface",
    languageAuto: "AutomÃ¡tico (navegador)",
    languageEnglish: "English",
    languageFrench: "FranÃ§ais",
    languageItalian: "Italiano",
    languageGerman: "Deutsch",
    languageSpanish: "EspaÃ±ol",
    languagePortugueseBr: "PortuguÃªs (Brasil)",
  },
};

const DEFAULT_TTS_VOICE = "Joanna";
const DEFAULT_TTS_LANGUAGE = "en-US";
const DEFAULT_TTS_RATE = 1.0;
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
  shortcutsVisible: false,
  editingCharacterId: null,
  editingPersonaId: null,
  currentPersonaAvatarBlob: null,
  activeModalId: null,
  promptHistoryOpen: false,
  chatAutoScroll: true,
  lastUsedModel: "",
  lastUsedProvider: "",
  lastCompletionTime: 0,
  draggingPersonaId: null,
  threadUnreadCounts: {},
  tabId: `tab-${Math.random().toString(36).slice(2)}`,
  syncChannel: null,
  syncTimerId: null,
  lastSyncSeenUpdatedAt: 0,
  confirmResolver: null,
  textInputResolver: null,
  confirmMode: "confirm",
  unsavedResolver: null,
  activeShortcut: null,
  abortController: null,
  marqueeRefreshTimer: null,
  tts: {
    audio: null,
    speakingMessageIndex: null,
    loadingMessageIndex: null,
    requestSeq: 0,
    activeRequestId: 0,
    voiceSupportReady: false,
    kokoro: {
      modulePromise: null,
      instance: null,
      config: {
        device: "webgpu",
        dtype: "auto",
      },
      loading: false,
      fetchPatched: false,
      voiceListLoaded: false,
      selectedVoice: DEFAULT_KOKORO_VOICE,
    },
  },
  avatarSnapshotCache: new Map(),
  avatarBlobUrlCache: new Map(),
  editingMessageIndex: null,
  pendingPersonaInjectionPersonaId: null,
  activeGenerationThreadId: null,
  currentRequestMessages: null,
  generationQueue: [],
  selectedThreadIds: new Set(),
  characterTagFilters: [],
  characterSortMode: "updated_desc",
  expandedCharacterTagIds: new Set(),
  expandedCharacterTagFilters: false,
  modalDirty: {
    "character-modal": false,
    "personas-modal": false,
    "shortcuts-modal": false,
    "tags-modal": false,
    "lore-modal": false,
    "writing-instructions-modal": false,
    "writing-instruction-editor-modal": false,
  },
  charModalTtsTestPlaying: false,
  imagePreview: {
    scale: 1,
    minScale: 0.2,
    maxScale: 6,
    src: "",
    isVideo: false,
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
  characterCardSlide: null,
  renderThreadsSeq: 0,
  cooldownToastTimerId: null,
  cooldownQueueTickInFlight: false,
  unreadNeedsUserScrollThreadId: null,
  charModalDefinitions: [],
  charModalActiveLanguage: "",
  charModalActiveTab: "lang",
  charModalPendingThreadDeleteIds: [],
  charModalAvatars: [],
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

// function preprocessForTTS(text) {
//   const sanitized = String(text || "")
//     .replace(/\*+/g, "")
//     .replace(/`+/g, "")
//     .replace(/#+\s?/g, "")
//     .replace(/\[(.*?)\]\(.*?\)/g, "$1")
//     .replace(/[_~]/g, "")
//     .replace(/\s+/g, " ")
//     .replace(/([\p{Emoji}\uFE0F\u200D]|[\uD800-\uDBFF][\uDC00-\uDFFF])/gu, "")
//     .trim();
//   const normalized = normalizeForTTS(sanitized);
//   return normalizeNumbersForTTS(normalized);
// }

// function preprocessForTTS(text) {
//   const sanitized = String(text || "")
//     .replace(/\*+/g, "")
//     .replace(/`+/g, "")
//     .replace(/#+\s?/g, "")
//     .replace(/\[(.*?)\]\(.*?\)/g, "$1")
//     .replace(/[_~]/g, "")
//     .replace(/([\p{Emoji}\uFE0F\u200D]|[\uD800-\uDBFF][\uDC00-\uDFFF])/gu, "")
//     .replace(/\s+/g, " ")
//     .trim();

//   const noLabel = sanitized.replace(/^[A-Z][\w\s'-]{1,32}:\s*/u, "");

//   const normalized = normalizeForTTS(noLabel);
//   return normalizeNumbersForTTS(normalized);
// }

// function preprocessForTTS(text) {
//   const sanitized = String(text || "")
//     // remove status block lines
//     .replace(/(^|\n)\s*>\s*\|\|.*$/gm, "")
//     // markdown cleanup
//     .replace(/\*+/g, "")
//     .replace(/`+/g, "")
//     .replace(/#+\s?/g, "")
//     .replace(/\[(.*?)\]\(.*?\)/g, "$1")
//     .replace(/[_~]/g, "")
//     // emoji removal
//     .replace(/([\p{Emoji}\uFE0F\u200D]|[\uD800-\uDBFF][\uDC00-\uDFFF])/gu, "")
//     // whitespace normalize
//     .replace(/\s+/g, " ")
//     .trim();

//   // remove speaker label
//   const noLabel = sanitized.replace(/^[A-Z][\w\s'-]{1,32}:\s*/u, "");

//   const normalized = normalizeForTTS(noLabel);
//   return normalizeNumbersForTTS(normalized);
// }

function preprocessForTTS(text) {
  const sanitized = String(text || "")
    // remove status block lines
    .replace(/(^|\n)\s*>\s*\|\|.*$/gm, "")
    // markdown cleanup
    .replace(/\*+/g, "")
    .replace(/`+/g, "")
    .replace(/#+\s?/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[_~]/g, "")
    // emoji removal
    .replace(/([\p{Emoji}\uFE0F\u200D]|[\uD800-\uDBFF][\uDC00-\uDFFF])/gu, "")
    // remove speaker labels (ALL lines)
    .replace(/(^|\n)[A-Z][\w\s'-]{1,32}:\s*/gu, "$1")
    // whitespace normalize
    .replace(/\s+/g, " ")
    .trim();

  const normalized = normalizeForTTS(sanitized);
  return normalizeNumbersForTTS(normalized);
}

function normalizeForTTS(text) {
  return text
    .replace(/’/g, "'")
    .replace(/(\w)'m\b/g, "$1 am")
    .replace(/(\w)'s\b/g, "$1 is")
    .replace(/(\w)'re\b/g, "$1 are")
    .replace(/(\w)'ve\b/g, "$1 have")
    .replace(/(\w)'ll\b/g, "$1 will")
    .replace(/(\w)'d\b/g, "$1 would")
    .replace(/'/g, "")
    .replace(/–|—/g, ",")
    .replace(/…/g, "...");
}

function normalizeNumbersForTTS(text) {
  const ones = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  function numToWords(n) {
    n = Number(n);
    if (Number.isNaN(n)) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const r = n % 10;
      return r ? `${tens[t]} ${ones[r]}` : tens[t];
    }
    if (n < 1000) {
      const h = Math.floor(n / 100);
      const r = n % 100;
      return r ? `${ones[h]} hundred ${numToWords(r)}` : `${ones[h]} hundred`;
    }
    if (n < 1000000) {
      const th = Math.floor(n / 1000);
      const r = n % 1000;
      return r
        ? `${numToWords(th)} thousand ${numToWords(r)}`
        : `${numToWords(th)} thousand`;
    }
    return n.toString();
  }

  function ordinalSuffix(n) {
    n = Number(n);
    if (Number.isNaN(n)) return "th";
    if (n % 100 >= 11 && n % 100 <= 13) return "th";
    switch (n % 10) {
      case 1:
        return "first";
      case 2:
        return "second";
      case 3:
        return "third";
      default:
        return "th";
    }
  }

  function yearToWords(y) {
    y = Number(y);
    if (Number.isNaN(y)) return "";
    if (y >= 1100 && y <= 2099) {
      const first = Math.floor(y / 100);
      const last = y % 100;
      return last === 0
        ? `${numToWords(first)} hundred`
        : `${numToWords(first)} ${numToWords(last)}`;
    }
    return numToWords(y);
  }

  let normalized = text;
  normalized = normalized.replace(/\b(1[1-9]\d{2}|20\d{2})\b/g, (m) =>
    yearToWords(m),
  );
  normalized = normalized.replace(
    /\b(\d+)(st|nd|rd|th)\b/g,
    (_, n) => `${numToWords(n)} ${ordinalSuffix(n)}`,
  );
  normalized = normalized.replace(
    /\b(\d+)%\b/g,
    (_, n) => `${numToWords(n)} percent`,
  );
  normalized = normalized.replace(/\$(\d+)(?:\.(\d+))?/g, (_, d, c) =>
    c
      ? `${numToWords(d)} dollars and ${numToWords(c)} cents`
      : `${numToWords(d)} dollars`,
  );
  normalized = normalized.replace(/\b\d+\.\d+\b/g, (m) =>
    m.split(".").map(numToWords).join(" point "),
  );
  normalized = normalized.replace(/\b\d+\b/g, (m) => numToWords(m));
  return normalized;
}

function chunkForTTS(text, maxLen = 180) {
  const normalized = String(text || "").trim();
  if (!normalized) return [];
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
  const chunks = [];
  let buffer = "";

  for (const sentence of sentences) {
    if ((buffer + sentence).length <= maxLen) {
      buffer += sentence;
    } else {
      if (buffer) {
        chunks.push(buffer.trim());
      }
      if (sentence.length > maxLen) {
        for (let i = 0; i < sentence.length; i += maxLen) {
          chunks.push(sentence.slice(i, i + maxLen).trim());
        }
        buffer = "";
      } else {
        buffer = sentence;
      }
    }
  }

  if (buffer) {
    chunks.push(buffer.trim());
  }

  return chunks.filter(Boolean);
}

window.addEventListener("DOMContentLoaded", init);

document.addEventListener("visibilitychange", () => {
  const grid = document.getElementById("character-grid");
  if (!grid) return;
  const cards = grid.querySelectorAll(".character-card");
  const mainView = document.getElementById("main-view");
  const isMainViewActive = mainView && mainView.classList.contains("active");

  if (document.hidden) {
    cards.forEach((card) => {
      if (card._saveVideoTimes) card._saveVideoTimes();
    });
  } else if (isMainViewActive) {
    cards.forEach((card) => {
      if (card._restoreVideoTimes) card._restoreVideoTimes();
      if (card._startCarousel) card._startCarousel();
    });
  }

  if (
    !document.hidden &&
    currentThread &&
    document.getElementById("chat-view")?.classList.contains("active")
  ) {
    let changed = false;
    let lastUnreadAssistantIndex = -1;
    for (let i = 0; i < conversationHistory.length; i++) {
      const msg = conversationHistory[i];
      if (msg?.role === "assistant" && Number(msg.unreadAt) > 0) {
        msg.unreadAt = 0;
        changed = true;
        lastUnreadAssistantIndex = i;
      }
    }
    if (changed) {
      state.unreadNeedsUserScrollThreadId = null;
      persistThreadMessagesById(Number(currentThread.id), conversationHistory, {
        _skipUpdatedAt: true,
      }).catch(() => {});
      renderThreads();
      if (
        lastUnreadAssistantIndex >= 0 &&
        currentThread.autoTtsEnabled === true &&
        state.tts.voiceSupportReady
      ) {
        toggleMessageSpeech(lastUnreadAssistantIndex).catch(() => {});
      }
    }
    renderChat();
  }
});

let lastFocusTime = 0;
window.addEventListener("focus", () => {
  const now = Date.now();
  if (now - lastFocusTime < 200) return;
  lastFocusTime = now;
  if (
    !currentThread ||
    !document.getElementById("chat-view")?.classList.contains("active")
  ) {
    return;
  }
  let changed = false;
  let lastUnreadAssistantIndex = -1;
  for (let i = 0; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i];
    if (msg?.role === "assistant" && Number(msg.unreadAt) > 0) {
      msg.unreadAt = 0;
      changed = true;
      lastUnreadAssistantIndex = i;
    }
  }
  if (changed) {
    state.unreadNeedsUserScrollThreadId = null;
    persistThreadMessagesById(Number(currentThread.id), conversationHistory, {
      _skipUpdatedAt: true,
    }).catch(() => {});
    renderThreads();
    if (
      lastUnreadAssistantIndex >= 0 &&
      currentThread.autoTtsEnabled === true &&
      state.tts.voiceSupportReady
    ) {
      toggleMessageSpeech(lastUnreadAssistantIndex).catch(() => {});
    }
  }
  renderChat();
});

function updateCarouselForPaneState() {}

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
  // applyMarkdownCustomCss(); // Disabled - using markdown-it library
  applyChatMessageAlignment();
  renderCharacterTagFilterChips();
  updateThreadRenameButtonState();
  updateScrollBottomButtonVisibility();
  updateCooldownPinnedToast();
  updateDocumentTitleWithUnread();
  if (state.cooldownToastTimerId) {
    window.clearInterval(state.cooldownToastTimerId);
  }
  state.cooldownToastTimerId = window.setInterval(async () => {
    if (state.cooldownQueueTickInFlight) return;
    state.cooldownQueueTickInFlight = true;
    try {
      const seconds = getCooldownRemainingSeconds();
      updateCooldownPinnedToast(seconds);
      refreshCurrentThreadCooldownBubble(seconds);
      await tickQueueCooldownState();
    } finally {
      state.cooldownQueueTickInFlight = false;
    }
  }, 250);
}

async function hydrateGenerationQueue(threads = null) {
  const list = Array.isArray(threads)
    ? [...threads]
    : await db.threads.toArray();
  const queued = list
    .filter((t) => String(t.pendingGenerationReason || "").trim())
    .sort(
      (a, b) =>
        Number(a.pendingGenerationQueuedAt || 0) -
        Number(b.pendingGenerationQueuedAt || 0),
    );
  state.generationQueue = queued
    .map((t) => Number(t.id))
    .filter(Number.isInteger);
  return list;
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

function getHomeButtonText() {
  return `H ${t("home")}`;
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
    homeBtn.textContent = paneCollapsed ? "H" : getHomeButtonText();
    homeBtn.title = paneCollapsed ? t("home") : "";
  }
  const importBtn = document.getElementById("import-character-btn");
  if (importBtn) {
    importBtn.textContent = paneCollapsed ? "^" : `^ ${t("importCharacter")}`;
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
    bottomButtons[5].title = t("writingInstructions");
    bottomButtons[5].setAttribute("aria-label", t("writingInstructions"));
  }
  if (bottomButtons[6]) {
    bottomButtons[6].title = t("database");
    bottomButtons[6].setAttribute("aria-label", t("database"));
  }
  if (bottomButtons[7]) {
    bottomButtons[7].title = t("assets");
    bottomButtons[7].setAttribute("aria-label", t("assets"));
  }
  if (bottomButtons[8]) {
    bottomButtons[8].title = t("guide");
    bottomButtons[8].setAttribute("aria-label", t("guide"));
  }

  if (
    homeBtn &&
    !document.getElementById("left-pane")?.classList.contains("collapsed")
  ) {
    homeBtn.textContent = getHomeButtonText();
  }
  const popTitle = document.querySelector(".popover-title");
  if (popTitle) popTitle.textContent = t("previousPrompts");
  const sendBtn = document.getElementById("send-btn");
  if (sendBtn && !state.sending) sendBtn.textContent = t("send");
  const shortcutsToggle = document.getElementById("shortcuts-toggle-btn");
  if (shortcutsToggle)
    shortcutsToggle.title = state.shortcutsVisible
      ? t("hideShortcuts")
      : t("showShortcuts");
  const autoReplyToggle = document.getElementById("auto-reply-enabled");
  if (autoReplyToggle) autoReplyToggle.title = t("autoReply");
  const enterToggle = document.getElementById("enter-to-send-enabled");
  if (enterToggle) enterToggle.title = t("enterToSend");

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

function updateLanguageSelectOptions() {
  const uiLanguageSelect = document.getElementById("ui-language-select");
  if (!uiLanguageSelect) return;
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
  uiLanguageSelect.querySelector('option[value="pt-BR"]').textContent = t(
    "languagePortugueseBr",
  );
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
    .getElementById("reset-db-btn")
    ?.addEventListener("click", () =>
      showToast(t("resetAppDataSoon"), "success"),
    );
  document
    .getElementById("guide-btn")
    ?.addEventListener("click", () =>
      showToast(t("guideComingSoon"), "success"),
    );
  document
    .getElementById("save-character-btn")
    .addEventListener("click", () => saveCharacterFromModal());
  document
    .getElementById("apply-character-btn")
    ?.addEventListener("click", () => applyCharacterFromModal());
  document
    .getElementById("char-tts-test-btn")
    .addEventListener("click", playCharacterTtsTestFromModal);
  updateCharTtsTestButtonState();
  document.getElementById("send-btn").addEventListener("click", sendMessage);
  document
    .getElementById("shortcuts-toggle-btn")
    .addEventListener("click", toggleShortcutsVisibility);
  document.getElementById("home-btn").addEventListener("click", showMainView);
  document
    .getElementById("char-config-tab-btn")
    .addEventListener("click", () => {
      saveActiveCharacterDefinitionFromForm();
      setCharacterModalTab("config");
      renderCharacterDefinitionTabs();
    });
  document.getElementById("char-tags-tab-btn").addEventListener("click", () => {
    saveActiveCharacterDefinitionFromForm();
    setCharacterModalTab("tags");
    renderCharacterDefinitionTabs();
  });
  document.getElementById("char-add-lang-btn").addEventListener("click", () => {
    saveActiveCharacterDefinitionFromForm();
    populateCharacterLanguageSelectOptions();
    const modal = document.getElementById("char-language-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
  });
  document
    .getElementById("char-writing-instructions-select")
    .addEventListener("change", () => {
      setModalDirtyState("character-modal", true);
      updateCharWritingInstructionsVisibility();
    });
  document
    .getElementById("char-language-cancel")
    .addEventListener("click", () => {
      document.getElementById("char-language-modal")?.classList.add("hidden");
    });
  document
    .getElementById("char-language-cancel-x")
    .addEventListener("click", () => {
      document.getElementById("char-language-modal")?.classList.add("hidden");
    });
  document
    .getElementById("char-language-add")
    .addEventListener("click", async () => {
      const select = document.getElementById("char-language-select");
      const code = normalizeBotLanguageCode(select?.value || "");
      if (!code) return;
      if (state.charModalDefinitions.some((d) => d.language === code)) return;
      const primaryName = String(
        state.charModalDefinitions[0]?.name || "",
      ).trim();
      const newDefinition = createEmptyCharacterDefinition(code);
      if (primaryName) {
        newDefinition.name = primaryName;
      }
      state.charModalDefinitions.push(newDefinition);
      state.charModalActiveLanguage = code;
      setModalDirtyState("character-modal", true);
      document.getElementById("char-language-modal")?.classList.add("hidden");
      await loadActiveCharacterDefinitionToForm();
      setCharacterModalTab("lang");
      renderCharacterDefinitionTabs();
      restoreCharModalTextareaCollapseStates();
    });
  document
    .getElementById("pane-toggle-chat")
    ?.addEventListener("click", togglePane);
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
  document
    .getElementById("pane-overlay-toggle")
    .addEventListener("click", togglePane);
  document.getElementById("auto-tts-toggle-btn").innerHTML = ICONS.speaker;
  document
    .getElementById("auto-tts-toggle-btn")
    .addEventListener("click", toggleThreadAutoTts);
  setupCharAvatarDropzone();
  [
    "char-system-prompt",
    "char-one-time-extra-prompt",
    "char-initial-messages",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("dragover", onTextAreaFileDragOver);
    el.addEventListener("drop", onTextAreaFileDrop);
  });
  document
    .getElementById("char-tags-input")
    .addEventListener("input", renderCharacterTagPresetButtons);
  document
    .getElementById("char-tts-language")
    .addEventListener("change", () => populateCharTtsVoiceSelect());
  document
    .getElementById("char-tts-rate")
    .addEventListener("input", updateCharTtsRatePitchLabels);
  document
    .getElementById("char-tts-pitch")
    .addEventListener("input", updateCharTtsRatePitchLabels);
  const ttsProviderSelect = document.getElementById("char-tts-provider");
  if (ttsProviderSelect) {
    ttsProviderSelect.addEventListener("change", () => {
      refreshCharTtsProviderFields();
      updateTtsSupportUi();
    });
  }
  const kokoroDeviceSelect = document.getElementById("char-tts-kokoro-device");
  if (kokoroDeviceSelect) {
    kokoroDeviceSelect.addEventListener("change", () => {
      updateKokoroDtypeOptionsForDevice(kokoroDeviceSelect.value || "webgpu");
    });
  }
  const kokoroVoiceSelect = document.getElementById("char-tts-kokoro-voice");
  if (kokoroVoiceSelect) {
    kokoroVoiceSelect.addEventListener("change", (event) => {
      const value = String(event.target?.value || "").trim();
      if (value) {
        state.tts.kokoro.selectedVoice = value;
      }
    });
  }
  refreshCharTtsProviderFields();
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
      const src = document.getElementById("persona-selected-avatar")?.src || "";
      if (src) openImagePreview(src);
    });
  document.getElementById("char-name").addEventListener("input", () => {
    updateNameLengthCounter("char-name", "char-name-count", 128);
  });
  document.getElementById("char-tagline").addEventListener("input", () => {
    updateNameLengthCounter("char-tagline", "char-tagline-count", 128);
  });
  document.getElementById("persona-name").addEventListener("input", () => {
    updateNameLengthCounter("persona-name", "persona-name-count", 64);
  });
  document
    .getElementById("persona-description")
    .addEventListener("input", () => {
      updateNameLengthCounter(
        "persona-description",
        "persona-description-count",
        100,
      );
    });
  document
    .getElementById("character-tag-filter-clear")
    .addEventListener("click", async () => {
      state.characterTagFilters = [];
      state.expandedCharacterTagIds.clear();
      saveUiState();
      renderCharacterTagFilterChips();
      updateCharacterCardsVisibility();
    });
  const sortBtn = document.getElementById("character-sort-btn");
  if (sortBtn) {
    sortBtn.addEventListener("click", async () => {
      const parts = getCharacterSortParts(state.characterSortMode);
      const nextBase = getNextCharacterSortBase(parts.base);
      state.characterSortMode = `${nextBase}_${parts.dir}`;
      saveUiState();
      renderCharacterTagFilterChips();
      await renderCharacters();
    });
  }
  document
    .getElementById("character-sort-dir-btn")
    .addEventListener("click", async () => {
      const parts = getCharacterSortParts(state.characterSortMode);
      state.characterSortMode =
        parts.dir === "desc" ? `${parts.base}_asc` : `${parts.base}_desc`;
      saveUiState();
      renderCharacterTagFilterChips();
      await renderCharacters();
    });
  const filters = document.getElementById("character-filters");
  filters?.addEventListener("click", (e) => {
    if (filters.classList.contains("collapsed")) {
      filters.classList.remove("collapsed");
      localStorage.setItem("rp-filters-collapsed", "false");
      updateCharacterFiltersToggleUi();
      requestAnimationFrame(() => {
        renderCharacterTagFilterChips();
      });
    }
  });
  document
    .getElementById("character-filters-toggle")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      const filters = document.getElementById("character-filters");
      filters.classList.toggle("collapsed");
      localStorage.setItem(
        "rp-filters-collapsed",
        filters.classList.contains("collapsed"),
      );
      updateCharacterFiltersToggleUi();
      if (!filters.classList.contains("collapsed")) {
        requestAnimationFrame(() => {
          renderCharacterTagFilterChips();
        });
      }
    });
  document
    .getElementById("save-shortcuts-btn")
    .addEventListener("click", saveShortcutsFromModal);
  document
    .getElementById("apply-shortcuts-btn")
    ?.addEventListener("click", () => saveShortcutsFromModal({ close: false }));
  document
    .getElementById("add-tag-btn")
    .addEventListener("click", addTagFromManagerInput);
  document
    .getElementById("tag-manager-input")
    .addEventListener("input", updateTagManagerAddButtonState);
  document
    .getElementById("tag-manager-input")
    .addEventListener("keydown", (e) => {
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
    .getElementById("create-writing-instruction-btn")
    .addEventListener("click", () => openWritingInstructionEditor());
  document
    .getElementById("cancel-writing-instruction-btn")
    .addEventListener("click", async () => {
      if (state.modalDirty["writing-instruction-editor-modal"]) {
        const action = await openUnsavedChangesDialog();
        if (action === "back") return;
        if (action === "close") {
          setModalDirtyState("writing-instruction-editor-modal", false);
          closeActiveModal();
          const parentModal = document.getElementById(
            "writing-instructions-modal",
          );
          if (parentModal) {
            parentModal.classList.remove("hidden");
            state.activeModalId = "writing-instructions-modal";
          }
          return;
        }
        if (action === "save") {
          const saved = await saveWritingInstruction({ close: true });
          if (!saved) return;
        }
      }
      closeActiveModal();
      const parentModal = document.getElementById("writing-instructions-modal");
      if (parentModal) {
        parentModal.classList.remove("hidden");
        state.activeModalId = "writing-instructions-modal";
      }
    });
  document
    .getElementById("apply-writing-instructions-btn")
    .addEventListener("click", () => saveWritingInstruction({ close: false }));
  document
    .getElementById("save-writing-instructions-btn")
    .addEventListener("click", () => saveWritingInstruction({ close: true }));
  document
    .getElementById("writing-instruction-add-lang-btn")
    .addEventListener("click", openWritingInstructionLanguageModal);
  document
    .getElementById("writing-instruction-language-cancel")
    .addEventListener("click", closeWritingInstructionLanguageModal);
  document
    .getElementById("writing-instruction-language-cancel-x")
    .addEventListener("click", closeWritingInstructionLanguageModal);
  document
    .getElementById("writing-instruction-language-add")
    .addEventListener("click", addWritingInstructionLanguage);
  document
    .getElementById("writing-instruction-name")
    .addEventListener("input", () => {
      updateWritingInstructionNameCount();
      saveActiveWritingInstructionFromForm();
      updateSaveWritingInstructionButton();
    });
  document
    .getElementById("writing-instruction-text")
    .addEventListener("input", (e) => {
      const textField = e.target;
      textField.style.height = "auto";
      textField.style.height = textField.scrollHeight + "px";
      updateWritingInstructionTextCount();
      saveActiveWritingInstructionFromForm();
      updateSaveWritingInstructionButton();
    });
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

  setupModalTextareas();

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
    maybeProcessUnreadMessagesSeen(true).catch(() => {});
    updateScrollBottomButtonVisibility();
    if (currentThread) {
      localStorage.setItem(
        `rp-thread-scroll-${currentThread.id}`,
        chatLog.scrollTop,
      );
    }
  });
  window.addEventListener("resize", () => {
    if (state.promptHistoryOpen) positionPromptHistoryPopover();
    clearTimeout(state.marqueeRefreshTimer);
    state.marqueeRefreshTimer = setTimeout(() => {
      refreshAllHoverMarquees();
    }, 100);
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
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal?.id === "writing-instruction-editor-modal") {
        if (state.modalDirty["writing-instruction-editor-modal"]) {
          openUnsavedChangesDialog().then((action) => {
            if (action === "back") return;
            if (action === "close") {
              setModalDirtyState("writing-instruction-editor-modal", false);
              closeActiveModal();
              const parentModal = document.getElementById(
                "writing-instructions-modal",
              );
              if (parentModal) {
                parentModal.classList.remove("hidden");
                state.activeModalId = "writing-instructions-modal";
              }
            }
            if (action === "save") {
              saveWritingInstruction({ close: true });
            }
          });
        } else {
          closeActiveModal();
          const parentModal = document.getElementById(
            "writing-instructions-modal",
          );
          if (parentModal) {
            parentModal.classList.remove("hidden");
            state.activeModalId = "writing-instructions-modal";
          }
        }
      } else if (modal?.id === "asset-editor-modal") {
        if (state.modalDirty["asset-editor-modal"]) {
          openUnsavedChangesDialog().then((action) => {
            if (action === "back") return;
            if (action === "close") {
              setModalDirtyState("asset-editor-modal", false);
              closeActiveModal();
              const parentModal = document.getElementById("assets-modal");
              if (parentModal) {
                parentModal.classList.remove("hidden");
                state.activeModalId = "assets-modal";
              }
            }
            if (action === "save") {
              saveAssetFromEditor();
            }
          });
        } else {
          closeActiveModal();
          const parentModal = document.getElementById("assets-modal");
          if (parentModal) {
            parentModal.classList.remove("hidden");
            state.activeModalId = "assets-modal";
          }
        }
      } else {
        closeActiveModal();
      }
    });
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target !== modal) return;
      if (modal.id === "image-preview-modal") {
        closeImagePreview();
      } else if (modal.id === "char-language-modal") {
        modal.classList.add("hidden");
      } else if (modal.id === "confirm-modal") {
        resolveConfirmDialog(false);
      } else if (modal.id === "unsaved-modal") {
        resolveUnsavedDialog("back");
      } else {
        closeActiveModal();
      }
    });
  });

  document
    .getElementById("unsaved-back-btn")
    ?.addEventListener("click", () => resolveUnsavedDialog("back"));
  document
    .getElementById("unsaved-close-btn")
    ?.addEventListener("click", () => resolveUnsavedDialog("close"));
  document
    .getElementById("unsaved-save-btn")
    ?.addEventListener("click", () => resolveUnsavedDialog("save"));

  markModalDirtyOnInput("character-modal", [
    "#char-name",
    "#char-tagline",
    "#char-system-prompt",
    "#char-one-time-extra-prompt",
    "#char-writing-instructions",
    "#char-writing-instructions-select",
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
    "#char-tts-provider",
    "#char-tts-kokoro-device",
    "#char-tts-kokoro-dtype",
    "#char-tts-kokoro-voice",
    "#char-prefer-lore-language",
  ]);
  markModalDirtyOnInput("personas-modal", [
    "#persona-name",
    "#persona-avatar",
    "#persona-description",
    "#persona-internal-description",
    "#persona-is-default",
  ]);
   markModalDirtyOnInput("shortcuts-modal", ["#shortcuts-raw"]);
   markModalDirtyOnInput("writing-instruction-editor-modal", [
    "#writing-instruction-name",
    "#writing-instruction-text",
  ]);
  markModalDirtyOnInput("lore-modal", [
    "#lore-name",
    "#lore-avatar",
    "#lore-description",
    "#lore-scan-depth",
    "#lore-token-budget",
    "#lore-recursive-scanning",
  ]);
  updateModalActionButtons("character-modal");
  updateNameLengthCounter("char-name", "char-name-count", 128);
  updateNameLengthCounter("persona-name", "persona-name-count", 64);
  updateNameLengthCounter(
    "persona-description",
    "persona-description-count",
    100,
  );
  updateToastDelayDisplay();
  setupSettingsTabsLayout();
}

const textareaCollapseStates = new WeakMap();

function setupModalTextareas(root = document) {
  const scope = root || document;
  const selector = scope === document ? ".modal textarea" : "textarea";
  const textareas = Array.from(scope.querySelectorAll(selector)).filter(
    (textarea) => textarea.closest(".modal"),
  );
  textareas.forEach((textarea) => {
    const baseRows = Number(textarea.getAttribute("rows") || 3);
    textarea.dataset.baseRows = baseRows;
    if (textarea.dataset.collapsible === "1") {
      autoExpandTextarea(textarea);
      const stored = textareaCollapseStates.get(textarea);
      if (stored) {
        const hasContent = String(textarea.value || "").trim().length > 0;
        stored.setExpanded(hasContent);
      }
      return;
    }
    textarea.dataset.collapsible = "1";
    const labelInfo = captureTextareaLabel(textarea);
    const labelText =
      labelInfo?.text ||
      textarea.getAttribute("placeholder") ||
      textarea.getAttribute("title") ||
      "Input";
    if (labelInfo?.element) {
      labelInfo.element.style.display = "none";
    }
    const parent = textarea.parentElement;
    if (!parent) return;
    const wrapper = document.createElement("div");
    wrapper.className = "textarea-collapse";
    const header = document.createElement("button");
    header.type = "button";
    header.className = "textarea-collapse-header";
    header.setAttribute("aria-expanded", "true");
    const title = document.createElement("span");
    title.textContent = labelText;
    const rightGroup = document.createElement("span");
    rightGroup.className = "textarea-collapse-header-right";
    const countEl =
      textarea.id && document.getElementById(`${textarea.id}-count`);
    if (countEl) {
      rightGroup.appendChild(countEl);
    }
    const icon = document.createElement("span");
    icon.className = "textarea-collapse-icon";
    rightGroup.appendChild(icon);
    header.append(title, rightGroup);
    const body = document.createElement("div");
    body.className = "textarea-collapse-body";
    parent.insertBefore(wrapper, textarea);
    wrapper.append(header, body);
    body.appendChild(textarea);
    const entry = { header, body, icon };
    entry.refresh = () => {
      const hasContent = String(textarea.value || "").trim().length > 0;
      header.classList.toggle("has-content", hasContent);
      const expanded = header.getAttribute("aria-expanded") === "true";
      icon.textContent = expanded ? "▾" : "▴";
    };
    entry.setExpanded = (next) => {
      const current = header.getAttribute("aria-expanded") === "true";
      if (next === current) {
        entry.refresh();
        if (next) autoExpandTextarea(textarea);
        return;
      }
      header.setAttribute("aria-expanded", next ? "true" : "false");
      body.classList.toggle("collapsed", !next);
      if (next) autoExpandTextarea(textarea);
      entry.refresh();
    };
    textareaCollapseStates.set(textarea, entry);
    const hasContent = String(textarea.value || "").trim().length > 0;
    entry.setExpanded(hasContent);
    const toggle = () => {
      const expanded = header.getAttribute("aria-expanded") === "true";
      entry.setExpanded(!expanded);
      saveCharModalTextareaCollapseStates();
    };
    header.addEventListener("click", toggle);
    textarea.addEventListener("input", () => {
      const expanded = header.getAttribute("aria-expanded") === "true";
      if (expanded) {
        autoExpandTextarea(textarea);
      }
      entry.refresh();
    });
    textarea.addEventListener("focus", () => {
      if (header.getAttribute("aria-expanded") === "true") {
        autoExpandTextarea(textarea);
      }
    });
  });
}

function resetModalTextareaCollapseStates(root = document) {
  if (!root) return;
  const modal = root.matches?.(".modal") ? root : root.closest?.(".modal");
  if (modal?.id === "character-modal") return;
  root.querySelectorAll(".textarea-collapse textarea").forEach((textarea) => {
    const state = textareaCollapseStates.get(textarea);
    if (!state) return;
    const hasContent = String(textarea.value || "").trim().length > 0;
    state.setExpanded(hasContent);
  });
}

function getCharModalCollapseStorageKey() {
  const botId = state.editingCharacterId || "new";
  const lang = state.charModalActiveLanguage || "en";
  return `rp-char-collapse-${botId}-${lang}`;
}

function saveCharModalTextareaCollapseStates() {
  const key = getCharModalCollapseStorageKey();
  const states = {};
  const scrollStates = {};
  const modal = document.getElementById("character-modal");
  if (!modal) return;
  modal.querySelectorAll(".textarea-collapse textarea").forEach((textarea) => {
    const entry = textareaCollapseStates.get(textarea);
    if (!entry) return;
    const expanded = entry.header.getAttribute("aria-expanded") === "true";
    states[textarea.id] = expanded;
    scrollStates[textarea.id] = textarea.scrollTop;
  });
  localStorage.setItem(key, JSON.stringify(states));
  localStorage.setItem(`${key}-scroll`, JSON.stringify(scrollStates));
  // Save modal body scroll position
  const modalBody = modal.querySelector(".modal-body");
  if (modalBody) {
    localStorage.setItem(`${key}-modal-scroll`, String(modalBody.scrollTop));
  }
}

function restoreCharModalTextareaCollapseStates() {
  const key = getCharModalCollapseStorageKey();
  const raw = localStorage.getItem(key);
  const scrollRaw = localStorage.getItem(`${key}-scroll`);
  const scrollStates = scrollRaw ? JSON.parse(scrollRaw) : {};
  const modal = document.getElementById("character-modal");
  if (!modal) return;
  modal
    .querySelectorAll(".textarea-collapse textarea")
    .forEach((textarea) => {
      const entry = textareaCollapseStates.get(textarea);
      if (!entry) return;
      const hasContent = String(textarea.value || "").trim().length > 0;
      if (raw) {
        try {
          const states = JSON.parse(raw);
          if (states[textarea.id] !== undefined) {
            entry.setExpanded(states[textarea.id]);
          } else {
            entry.setExpanded(hasContent);
          }
        } catch {
          entry.setExpanded(hasContent);
        }
      } else {
        entry.setExpanded(hasContent);
      }
      if (scrollStates[textarea.id] !== undefined) {
        textarea.scrollTop = scrollStates[textarea.id];
      }
    });
  // Restore modal body scroll position
  const modalScrollKey = `${key}-modal-scroll`;
  const savedModalScroll = localStorage.getItem(modalScrollKey);
  if (savedModalScroll !== null) {
    const modalBody = modal.querySelector(".modal-body");
    if (modalBody) {
      modalBody.scrollTop = Number(savedModalScroll);
    }
  }
}
function captureTextareaLabel(textarea) {
  const parent = textarea.parentElement;
  if (!parent) return null;
  const children = Array.from(parent.children);
  const idx = children.indexOf(textarea);
  for (let i = idx - 1; i >= 0; i -= 1) {
    const el = children[i];
    if (!el) continue;
    const match = getLabelFromElement(el);
    if (match) return match;
  }
  return null;
}

function getLabelFromElement(el) {
  if (!el) return null;
  if (el.matches("span, label")) {
    const text = String(el.textContent || "").trim();
    if (text && !/^\d+\/\d+$/.test(text)) {
      return { element: el, text };
    }
  }
  if (el.matches(".label-inline, .writing-instructions-header")) {
    const span = el.querySelector("span");
    if (span) {
      const text = String(span.textContent || "").trim();
      if (text && !/^\d+\/\d+$/.test(text)) {
        return { element: span, text };
      }
    }
  }
  return null;
}

function autoExpandTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.overflow = "hidden";
  textarea.style.resize = "none";
  const computed = window.getComputedStyle(textarea);
  const lineHeight = parseFloat(computed.lineHeight) || 24;
  const baseRows = Number(textarea.dataset.baseRows) || 4;
  const minHeight = Math.max(
    Number(textarea.dataset.minHeight) || 0,
    lineHeight * baseRows,
  );
  textarea.dataset.minHeight = minHeight;
  const newHeight = Math.max(textarea.scrollHeight, minHeight);
  textarea.style.height = `${newHeight}px`;
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
    .filter(
      (v, i, arr) =>
        arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i,
    );
}

function formatTagList(tags) {
  return (Array.isArray(tags) ? tags : [])
    .map((t) => normalizeTagValue(t))
    .filter(Boolean)
    .join(", ");
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
  const lines = String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n");
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
  const defaultPersona = await getCharacterDefaultPersona();
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
  const tags = (
    Array.isArray(state.settings.customTags) ? state.settings.customTags : []
  )
    .map((t) => normalizeTagValue(t))
    .filter(Boolean);
  return tags.filter(
    (t, i, arr) =>
      arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i,
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
  const next = exists
    ? tags.filter((t) => t.toLowerCase() !== lower)
    : [...tags, tag];
  setCharacterTagsInputValue(next);
  renderCharacterTagPresetButtons();
  setModalDirtyState("character-modal", true);
}

function renderCharacterTagPresetButtons() {
  const container = document.getElementById("char-tags-presets");
  if (!container) return;
  const active = new Set(
    getCharacterTagsFromModal().map((t) => t.toLowerCase()),
  );
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

function removeCharacterTagFilter(tag) {
  const lower = String(tag || "").toLowerCase();
  state.characterTagFilters = state.characterTagFilters.filter(
    (t) => t.toLowerCase() !== lower,
  );
  saveUiState();
  renderCharacterTagFilterChips();
  updateCharacterCardsVisibility();
}

function toggleCharacterTagFilter(tag) {
  const normalized = normalizeTagValue(tag);
  if (!normalized) return;
  const lower = normalized.toLowerCase();
  const exists = state.characterTagFilters.some(
    (t) => t.toLowerCase() === lower,
  );
  if (exists) {
    state.characterTagFilters = state.characterTagFilters.filter(
      (t) => t.toLowerCase() !== lower,
    );
  } else {
    state.characterTagFilters.push(normalized);
  }
  saveUiState();
  renderCharacterTagFilterChips();
  updateCharacterCardsVisibility();
}

async function updateCharacterCardsVisibility() {
  const grid = document.getElementById("character-grid");
  if (!grid) return;
  const characters = await db.characters.toArray();
  const activeFilters = Array.isArray(state.characterTagFilters)
    ? state.characterTagFilters.map((t) => t.toLowerCase())
    : [];
  const cards = grid.querySelectorAll(".character-card");
  cards.forEach((card) => {
    const charId = card.dataset.characterId;
    const char = characters.find((c) => Number(c.id) === Number(charId));
    if (!char) {
      card.style.display = "none";
      return;
    }
    const tags = Array.isArray(char.tags)
      ? char.tags.map((t) => String(t || "").toLowerCase())
      : [];
    const shouldShow =
      activeFilters.length === 0 ||
      activeFilters.every((f) => tags.includes(f));
    card.style.display = shouldShow ? "" : "none";

    const tagChips = card.querySelectorAll(".character-tags .tag-chip");
    tagChips.forEach((chip) => {
      const chipText = chip.textContent.toLowerCase();
      if (activeFilters.includes(chipText)) {
        chip.classList.add("active-filter");
      } else {
        chip.classList.remove("active-filter");
      }
    });
  });
  const empty = grid.querySelector(".muted");
  const visibleCards = grid.querySelectorAll(
    ".character-card:not([style*='display: none'])",
  );
  if (visibleCards.length === 0) {
    if (!empty) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "muted";
      emptyMsg.textContent =
        activeFilters.length > 0 ? t("noTagsMatched") : t("noCharactersStart");
      grid.appendChild(emptyMsg);
    } else {
      empty.textContent =
        activeFilters.length > 0 ? t("noTagsMatched") : t("noCharactersStart");
    }
  } else if (empty) {
    empty.remove();
  }
}

function getCharacterSortParts(sortMode) {
  const raw = String(sortMode || "updated_desc");
  const m = raw.match(/^(created|updated|name|threads)_(asc|desc)$/);
  if (m) return { base: m[1], dir: m[2] };
  return { base: "updated", dir: "desc" };
}

function updateCharacterFiltersToggleUi() {
  const filters = document.getElementById("character-filters");
  const btn = document.getElementById("character-filters-toggle");
  if (!filters || !btn) return;
  const collapsed = filters.classList.contains("collapsed");
  btn.innerHTML = collapsed ? "&#9660;" : "&#9650;";
}

function getCharacterSortIconUrl(base) {
  const raw =
    CHARACTER_SORT_ICON_TEMPLATES[base] ||
    CHARACTER_SORT_ICON_TEMPLATES.updated;
  return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
}

function getNextCharacterSortBase(current = "updated") {
  const index = CHARACTER_SORT_BASES.indexOf(current);
  if (index === -1) return CHARACTER_SORT_BASES[0];
  return CHARACTER_SORT_BASES[(index + 1) % CHARACTER_SORT_BASES.length];
}

function updateCharacterSortButton() {
  const btn = document.getElementById("character-sort-btn");
  const icon = document.getElementById("character-sort-icon");
  if (!btn || !icon) return;
  const parts = getCharacterSortParts(state.characterSortMode);
  const labelKey = CHARACTER_SORT_LABEL_KEYS[parts.base] || "characterOrdering";
  const label = t(labelKey);
  icon.src = getCharacterSortIconUrl(parts.base);
  icon.alt = label;
  btn.setAttribute("aria-label", label);
}

function renderCharacterTagFilterChips() {
  const chips = document.getElementById("character-tag-filter-chips");
  const cue = document.getElementById("character-filter-active-cue");
  const sortBtn = document.getElementById("character-sort-btn");
  const sortDirBtn = document.getElementById("character-sort-dir-btn");
  const sortParts = getCharacterSortParts(state.characterSortMode);
  if (sortDirBtn) {
    const isDesc = sortParts.dir === "desc";
    sortDirBtn.innerHTML = isDesc ? "&#8595;" : "&#8593;";
    sortDirBtn.setAttribute(
      "title",
      isDesc ? t("sortDescending") : t("sortAscending"),
    );
  }
  updateCharacterSortButton();
  updateCharacterFiltersToggleUi();
  if (!chips || !cue) return;
  chips.innerHTML = "";
  const selectedFilters = Array.isArray(state.characterTagFilters)
    ? state.characterTagFilters
    : [];
  cue.classList.toggle("hidden", selectedFilters.length === 0);

  const allTags = getAllAvailableTags();
  if (allTags.length === 0) return;

  const isExpanded = state.expandedCharacterTagFilters === true;
  const chipsWrap = document.createElement("div");
  chipsWrap.className = "filter-chips-overflow";
  if (isExpanded) chipsWrap.classList.add("expanded");

  allTags.forEach((tag) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "tag-chip";
    if (
      selectedFilters.some((f) => String(f).toLowerCase() === tag.toLowerCase())
    ) {
      chip.classList.add("active-filter");
    }
    chip.textContent = tag;
    chip.addEventListener("click", () => toggleCharacterTagFilter(tag));
    chipsWrap.appendChild(chip);
  });
  chips.appendChild(chipsWrap);
  const moreBtn = document.createElement("button");
  moreBtn.type = "button";
  moreBtn.className = "tag-more-btn filter-tag-more-btn hidden";
  chips.appendChild(moreBtn);
  const refreshMore = () => {
    const overflow = chipsWrap.scrollHeight > chipsWrap.clientHeight + 1;
    if (!overflow && !isExpanded) {
      moreBtn.classList.add("hidden");
      return;
    }
    moreBtn.classList.remove("hidden");
    moreBtn.textContent = isExpanded ? t("less") : t("more");
  };
  moreBtn.addEventListener("click", () => {
    state.expandedCharacterTagFilters = !isExpanded;
    saveUiState();
    renderCharacterTagFilterChips();
  });
  requestAnimationFrame(refreshMore);
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
          input.setRangeText(
            `${e.key}${selected}${closeChar}`,
            start,
            end,
            "end",
          );
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

  const charLanguageModal = document.getElementById("char-language-modal");
  if (charLanguageModal && !charLanguageModal.classList.contains("hidden")) {
    charLanguageModal.classList.add("hidden");
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
  const settingsVersionEl = document.getElementById("settings-version");
  if (settingsVersionEl && typeof CONFIG.version === "string") {
    settingsVersionEl.textContent = CONFIG.version;
  }

  const uiLanguageSelect = document.getElementById("ui-language-select");
  const openRouterApiKey = document.getElementById("openrouter-api-key");
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
  const topPSlider = document.getElementById("top-p-slider");
  const topPValue = document.getElementById("top-p-value");
  const frequencyPenaltySlider = document.getElementById(
    "frequency-penalty-slider",
  );
  const frequencyPenaltyValue = document.getElementById(
    "frequency-penalty-value",
  );
  const presencePenaltySlider = document.getElementById(
    "presence-penalty-slider",
  );
  const presencePenaltyValue = document.getElementById(
    "presence-penalty-value",
  );
  const toastDelaySlider = document.getElementById("toast-delay-slider");
  const toastDelayValue = document.getElementById("toast-delay-value");
  const marqueeBehaviorSelect = document.getElementById(
    "marquee-behavior-select",
  );
  const threadAutoTitleEnabled = document.getElementById(
    "thread-autotitle-enabled",
  );
  const threadAutoTitleMinMessages = document.getElementById(
    "thread-autotitle-min-messages",
  );
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
    uiLanguageSelect.querySelector('option[value="pt-BR"]').textContent = t(
      "languagePortugueseBr",
    );
    uiLanguageSelect.value = state.settings.uiLanguage || "auto";
    if (!uiLanguageSelect.value) uiLanguageSelect.value = "auto";
  }

  const themeSelect = document.getElementById("theme-select");
  if (themeSelect) {
    const savedTheme = localStorage.getItem("rp-theme") || "dark";
    themeSelect.value = savedTheme;
    document.documentElement.setAttribute("data-theme", savedTheme);
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
  //   opt.label = m.label;
  //   modelSelect.appendChild(opt);
  // });
  modelSelect.value = state.settings.model;
  if (!modelSelect.value) {
    modelSelect.value = DEFAULT_SETTINGS.model;
    state.settings.model = modelSelect.value;
    saveSettings();
  }
  refreshSelectedModelMeta(modelSelectedMeta);

  const modelSelectDisplay = document.getElementById("model-select-display");
  const modelCustomDropdown = document.getElementById("model-custom-dropdown");
  if (modelSelectDisplay && modelCustomDropdown) {
    modelSelectDisplay.addEventListener("click", (e) => {
      e.stopPropagation();
      modelCustomDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", () => {
      modelCustomDropdown.classList.add("hidden");
    });
    modelCustomDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

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
  const writingInstructionsInjectionWhen = document.getElementById(
    "writing-instructions-injection-when",
  );
  const shortcutsRaw = document.getElementById("shortcuts-raw");
  const unreadSoundEnabled = document.getElementById("unread-sound-enabled");
  markdownCheck.checked = !!state.settings.markdownEnabled;
  unreadSoundEnabled.checked = state.settings.unreadSoundEnabled !== false;
  allowMessageHtml.checked = state.settings.allowMessageHtml === true;
  streamEnabled.checked = state.settings.streamEnabled !== false;
  autopairEnabled.checked = state.settings.autoPairEnabled !== false;
  threadAutoTitleEnabled.checked =
    state.settings.threadAutoTitleEnabled !== false;
  const minMessages = Math.max(
    5,
    Math.min(10, Number(state.settings.threadAutoTitleMinMessages) || 5),
  );
  state.settings.threadAutoTitleMinMessages = minMessages;
  threadAutoTitleMinMessages.value = String(minMessages);
  threadAutoTitleMinMessages.disabled = !threadAutoTitleEnabled.checked;
  const chatMessageAlignment = document.getElementById(
    "chat-message-alignment",
  );
  if (chatMessageAlignment) {
    chatMessageAlignment.value = state.settings.chatMessageAlignment || "left";
  }
  autoReplyEnabled?.classList.toggle(
    "is-active",
    state.settings.autoReplyEnabled !== false,
  );
  enterToSendEnabled?.classList.toggle(
    "is-active",
    state.settings.enterToSendEnabled !== false,
  );
  if (markdownCustomCss) {
    markdownCustomCss.value = state.settings.markdownCustomCss || "";
  }
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
  if (topPSlider) {
    topPSlider.value = String(Number(state.settings.topP) || 1);
    topPValue.textContent = topPSlider.value;
  }
  if (frequencyPenaltySlider) {
    frequencyPenaltySlider.value = String(
      Number(state.settings.frequencyPenalty) || 0,
    );
    frequencyPenaltyValue.textContent = frequencyPenaltySlider.value;
  }
  if (presencePenaltySlider) {
    presencePenaltySlider.value = String(
      Number(state.settings.presencePenalty) || 0,
    );
    presencePenaltyValue.textContent = presencePenaltySlider.value;
  }
  const completionCooldownSlider = document.getElementById(
    "completion-cooldown-slider",
  );
  const completionCooldownValue = document.getElementById(
    "completion-cooldown-value",
  );
  if (completionCooldownSlider) {
    completionCooldownSlider.value = String(
      state.settings.completionCooldown ?? 2,
    );
    if (completionCooldownValue) {
      completionCooldownValue.textContent = `${completionCooldownSlider.value}s`;
    }
  }
  if (toastDelaySlider) {
    const delay = clampToastDuration(state.settings.toastDurationMs);
    state.settings.toastDurationMs = delay;
    toastDelaySlider.value = String(delay);
    if (toastDelayValue) {
      toastDelayValue.textContent = `${Math.round(delay / 100) / 10}s`;
    }
  }
  if (marqueeBehaviorSelect) {
    const behavior = normalizeMarqueeBehavior(state.settings.marqueeBehavior);
    state.settings.marqueeBehavior = behavior;
    marqueeBehaviorSelect.value = behavior;
  }
  updateSettingsRangeTone(maxTokensSlider, Number(maxTokensSlider.value), {
    warnBelow: 1024,
    dangerAbove: 4096,
  });
  updateSettingsRangeTone(temperatureSlider, Number(temperatureSlider.value), {
    warnBelow: 0.7,
    dangerAbove: 1.0,
  });
  globalPromptTemplate.value = state.settings.globalPromptTemplate || "";
  summarySystemPrompt.value = state.settings.summarySystemPrompt || "";
  personaInjectionTemplate.value =
    state.settings.personaInjectionTemplate ||
    DEFAULT_SETTINGS.personaInjectionTemplate;
  const writingWhen = normalizeWritingInstructionsTiming(
    state.settings.writingInstructionsInjectionWhen,
  );
  state.settings.writingInstructionsInjectionWhen = writingWhen;
  if (writingInstructionsInjectionWhen) {
    writingInstructionsInjectionWhen.value = writingWhen;
  }
  shortcutsRaw.value = state.settings.shortcutsRaw || "";
  cancelShortcut.value =
    state.settings.cancelShortcut || DEFAULT_SETTINGS.cancelShortcut;
  homeShortcut.value =
    state.settings.homeShortcut || DEFAULT_SETTINGS.homeShortcut;
  newCharacterShortcut.value =
    state.settings.newCharacterShortcut ||
    DEFAULT_SETTINGS.newCharacterShortcut;
  openRouterApiKey.value = state.settings.openRouterApiKey || "";
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

  unreadSoundEnabled.addEventListener("change", () => {
    state.settings.unreadSoundEnabled = unreadSoundEnabled.checked;
    saveSettings();
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
  threadAutoTitleEnabled?.addEventListener("change", () => {
    state.settings.threadAutoTitleEnabled = threadAutoTitleEnabled.checked;
    if (threadAutoTitleMinMessages) {
      threadAutoTitleMinMessages.disabled = !threadAutoTitleEnabled.checked;
    }
    saveSettings();
  });
  threadAutoTitleMinMessages?.addEventListener("change", () => {
    const value = Math.max(
      5,
      Math.min(10, Number(threadAutoTitleMinMessages.value) || 5),
    );
    state.settings.threadAutoTitleMinMessages = value;
    threadAutoTitleMinMessages.value = String(value);
    saveSettings();
  });
  document
    .getElementById("chat-message-alignment")
    ?.addEventListener("change", (e) => {
      state.settings.chatMessageAlignment = e.target.value;
      saveSettings();
      applyChatMessageAlignment();
    });

  autoReplyEnabled?.addEventListener("click", async () => {
    const newValue = !(currentThread?.autoReplyEnabled !== false);
    if (currentThread) {
      currentThread.autoReplyEnabled = newValue;
      await db.threads.update(currentThread.id, { autoReplyEnabled: newValue });
    }
    state.settings.autoReplyEnabled = newValue;
    autoReplyEnabled.classList.toggle("is-active", newValue);
    saveSettings();
  });

  enterToSendEnabled?.addEventListener("click", async () => {
    const newValue = !(currentThread?.enterToSendEnabled !== false);
    if (currentThread) {
      currentThread.enterToSendEnabled = newValue;
      await db.threads.update(currentThread.id, { enterToSendEnabled: newValue });
    }
    state.settings.enterToSendEnabled = newValue;
    enterToSendEnabled.classList.toggle("is-active", newValue);
    saveSettings();
  });

  /*
  markdownCustomCss.addEventListener("input", () => {
    state.settings.markdownCustomCss = markdownCustomCss.value;
    saveSettings();
    applyMarkdownCustomCss();
    if (currentThread) renderChat();
  });
  */

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
  topPSlider?.addEventListener("input", () => {
    const value = Number(topPSlider.value);
    state.settings.topP = value;
    topPValue.textContent = value.toFixed(2);
    saveSettings();
  });
  frequencyPenaltySlider?.addEventListener("input", () => {
    const value = Number(frequencyPenaltySlider.value);
    state.settings.frequencyPenalty = value;
    frequencyPenaltyValue.textContent = value.toFixed(1);
    saveSettings();
  });
  presencePenaltySlider?.addEventListener("input", () => {
    const value = Number(presencePenaltySlider.value);
    state.settings.presencePenalty = value;
    presencePenaltyValue.textContent = value.toFixed(1);
    saveSettings();
  });
  completionCooldownSlider?.addEventListener("input", () => {
    const value = Number(completionCooldownSlider.value);
    state.settings.completionCooldown = value;
    completionCooldownSlider.value = String(value);
    if (completionCooldownValue) {
      completionCooldownValue.textContent = `${value}s`;
    }
    saveSettings();
    updateCooldownPinnedToast();
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
  marqueeBehaviorSelect?.addEventListener("change", () => {
    state.settings.marqueeBehavior = normalizeMarqueeBehavior(
      marqueeBehaviorSelect.value,
    );
    marqueeBehaviorSelect.value = state.settings.marqueeBehavior;
    saveSettings();
    refreshAllHoverMarquees();
  });

  const botCardAvatarEffectSelect = document.getElementById(
    "bot-card-avatar-effect",
  );
  const botCardAvatarTransitionDelaySlider = document.getElementById(
    "bot-card-avatar-transition-delay-slider",
  );
  const botCardAvatarTransitionDelayValue = document.getElementById(
    "bot-card-avatar-transition-delay-value",
  );
  if (botCardAvatarEffectSelect) {
    botCardAvatarEffectSelect.value =
      state.settings.botCardAvatarEffect || "none";
  }
  if (botCardAvatarTransitionDelaySlider) {
    const delay = Math.max(
      4,
      Math.min(30, Number(state.settings.botCardAvatarTransitionDelay) || 4),
    );
    state.settings.botCardAvatarTransitionDelay = delay;
    botCardAvatarTransitionDelaySlider.value = String(delay);
    if (botCardAvatarTransitionDelayValue) {
      botCardAvatarTransitionDelayValue.textContent = `${delay}s`;
    }
    if (botCardAvatarEffectSelect) {
      botCardAvatarTransitionDelaySlider.disabled =
        botCardAvatarEffectSelect.value !== "carousel";
    }
  }
  botCardAvatarEffectSelect?.addEventListener("change", () => {
    state.settings.botCardAvatarEffect = botCardAvatarEffectSelect.value;
    saveSettings();
    if (botCardAvatarTransitionDelaySlider) {
      botCardAvatarTransitionDelaySlider.disabled =
        botCardAvatarEffectSelect.value !== "carousel";
    }
    renderCharacters();
  });
  botCardAvatarTransitionDelaySlider?.addEventListener("input", () => {
    const value = Math.max(
      4,
      Math.min(30, Number(botCardAvatarTransitionDelaySlider.value) || 4),
    );
    state.settings.botCardAvatarTransitionDelay = value;
    botCardAvatarTransitionDelaySlider.value = String(value);
    if (botCardAvatarTransitionDelayValue) {
      botCardAvatarTransitionDelayValue.textContent = `${value}s`;
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

  writingInstructionsInjectionWhen?.addEventListener("change", () => {
    state.settings.writingInstructionsInjectionWhen =
      normalizeWritingInstructionsTiming(
        writingInstructionsInjectionWhen.value,
      );
    writingInstructionsInjectionWhen.value =
      state.settings.writingInstructionsInjectionWhen;
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
      updateLanguageSelectOptions();
      updateToastDelayDisplay();
      await renderShortcutsBar();
      await renderCharacters();
      updateModelPill();
    });
  }
  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      const theme = themeSelect.value;
      localStorage.setItem("rp-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    });
  }
}

function clampToastDuration(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 2600;
  return Math.max(1000, Math.min(10000, Math.round(num / 100) * 100));
}

function normalizeMarqueeBehavior(value) {
  const v = String(value || "").toLowerCase();
  if (v === "always") return "always";
  if (v === "hover") return "hover";
  return "disabled";
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
  )
    return "api";
  if (has("#model-selected-meta") || has("#model-roleplay-warning"))
    return "api";
  if (
    has("#markdown-enabled") ||
    has("#allow-message-html") ||
    has("#stream-enabled") ||
    has("#autopair-enabled") ||
    has("#thread-autotitle-enabled") ||
    has("#thread-autotitle-min-messages") ||
    has("#markdown-custom-css") ||
    has("#postprocess-rules-json") ||
    has("#chat-message-alignment")
  )
    return "threads";
  if (
    has("#cancel-shortcut") ||
    has("#home-shortcut") ||
    has("#new-character-shortcut")
  )
    return "shortcuts";
  if (
    has("#global-prompt-template") ||
    has("#summary-system-prompt") ||
    has("#persona-injection-template") ||
    has("#writing-instructions-injection-when")
  )
    return "prompting";
  if (
    has("#ui-language-select") ||
    has("#toast-delay-slider") ||
    has("#marquee-behavior-select")
  )
    return "appearance";
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
    id === "completion-cooldown-slider" ||
    id === "completion-cooldown-value" ||
    text.includes("openrouter api key")
  ) {
    return "api";
  }
  if (
    id === "markdown-enabled" ||
    id === "allow-message-html" ||
    id === "stream-enabled" ||
    id === "autopair-enabled" ||
    id === "thread-autotitle-enabled" ||
    id === "thread-autotitle-min-messages" ||
    id === "markdown-custom-css" ||
    id === "postprocess-rules-json" ||
    id === "chat-message-alignment"
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
    id === "writing-instructions-injection-when"
  ) {
    return "prompting";
  }
  if (
    id === "ui-language-select" ||
    id === "theme-select" ||
    id === "toast-delay-slider" ||
    id === "marquee-behavior-select" ||
    id === "bot-card-avatar-effect" ||
    id === "bot-card-avatar-transition-delay-slider" ||
    id === "bot-card-avatar-transition-delay-value"
  ) {
    return "appearance";
  }
  return "appearance";
}

function setupSettingsTabsLayout() {
  const body = document.getElementById("settings-modal-body");
  const tabs = document.querySelectorAll("[data-settings-tab-btn]");
  if (!body || tabs.length === 0 || body.dataset.tabsReady === "1") return;

  const groups = ["api", "appearance", "threads", "prompting", "shortcuts"];
  const panels = new Map();
  groups.forEach((group) => {
    const panel = document.createElement("div");
    panel.className = "settings-tab-panel";
    panel.dataset.settingsTabPanel = group;
    if (group !== "api") panel.classList.add("hidden");
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
      localStorage.setItem("rp-settings-last-tab", tab);
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
      state.settings.marqueeBehavior = normalizeMarqueeBehavior(
        state.settings.marqueeBehavior,
      );
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
    if (
      typeof parsed.characterSortMode === "string" &&
      parsed.characterSortMode
    ) {
      const parts = getCharacterSortParts(parsed.characterSortMode);
      state.characterSortMode = `${parts.base}_${parts.dir}`;
    }
    const filters = document.getElementById("character-filters");
    if (filters) {
      const isCollapsed =
        localStorage.getItem("rp-filters-collapsed") === "true";
      if (isCollapsed) {
        filters.classList.add("collapsed");
      } else {
        filters.classList.remove("collapsed");
      }
      updateCharacterFiltersToggleUi();
    }
  } catch {
    state.shortcutsVisible = false;
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
    const markDirty = () => setModalDirtyState(modalId, true);
    el.addEventListener("input", markDirty);
    el.addEventListener("change", markDirty);
  });
}

function getModalActionButtons(modalId) {
  const prefix = String(modalId || "").replace(/-modal$/, "");
  return {
    applyBtn: document.getElementById(`apply-${prefix}-btn`),
    saveBtn: document.getElementById(`save-${prefix}-btn`),
  };
}

function updateModalActionButtons(modalId) {
  const { applyBtn, saveBtn } = getModalActionButtons(modalId);
  const isDirty = !!state.modalDirty[modalId];
  [applyBtn, saveBtn].forEach((btn) => {
    if (!btn) return;
    btn.disabled = !isDirty;
  });
}

function setModalDirtyState(modalId, isDirty) {
  state.modalDirty[modalId] = !!isDirty;
  updateModalActionButtons(modalId);
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
  toast.style.cursor = "pointer";
  toast.addEventListener("click", () => toast.remove());
  toast.addEventListener("touchstart", () => toast.remove(), { passive: true });
  container.appendChild(toast);
  const delay = clampToastDuration(state.settings.toastDurationMs);
  window.setTimeout(() => {
    toast.remove();
  }, delay);
}

function updateCooldownPinnedToast(secondsOverride = null) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const existing = container.querySelector(".toast.cooldown-pinned");
  const seconds =
    Number.isFinite(Number(secondsOverride)) && Number(secondsOverride) > 0
      ? Number(secondsOverride)
      : getCooldownRemainingSeconds();
  const active = seconds > 0;
  if (!active) {
    existing?.remove();
    return;
  }
  const text = tf("cooldownToastActive", { seconds });
  const toast = existing || document.createElement("div");
  toast.className = "toast cooldown-pinned";
  toast.textContent = text;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  if (!existing) {
    container.prepend(toast);
  } else if (container.firstElementChild !== toast) {
    container.prepend(toast);
  }
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

function resolveUnsavedDialog(action = "back") {
  const modal = document.getElementById("unsaved-modal");
  modal?.classList.add("hidden");
  const resolver = state.unsavedResolver;
  state.unsavedResolver = null;
  if (resolver) resolver(action || "back");
}

function openUnsavedChangesDialog() {
  return new Promise((resolve) => {
    const modal = document.getElementById("unsaved-modal");
    if (!modal) {
      resolve("back");
      return;
    }
    state.unsavedResolver = resolve;
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

/*
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
*/

function applyChatMessageAlignment() {
  const log = document.getElementById("chat-log");
  if (!log) return;
  if (state.settings.chatMessageAlignment === "center") {
    log.classList.add("chat-messages-centered");
  } else {
    log.classList.remove("chat-messages-centered");
  }
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

async function saveShortcutsFromModal({ close = true } = {}) {
  const raw = document.getElementById("shortcuts-raw").value;
  const entries = parseShortcutEntries(raw);
  state.settings.shortcutsRaw = serializeShortcutEntries(entries);
  saveSettings();
  setModalDirtyState("shortcuts-modal", false);
  document.getElementById("shortcuts-raw").value = state.settings.shortcutsRaw;
  await renderShortcutsBar();
  showToast(t("shortcutsSaved"), "success");
  if (close) {
    closeActiveModal();
  }
  return true;
}

function isValidNewManagerTag(inputValue) {
  const tag = normalizeTagValue(inputValue);
  if (tag.length < 2) return false;
  return !getAllAvailableTags().some(
    (t) => t.toLowerCase() === tag.toLowerCase(),
  );
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
    const ok = await openConfirmDialog(
      t("removeTagTitle"),
      t("removeTagConfirmSimple"),
    );
    if (!ok) return;
  }

  const nextTags = (
    Array.isArray(state.settings.customTags) ? state.settings.customTags : []
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
  const isVisible = currentThread?.shortcutsVisible !== false;
  bar.classList.toggle("hidden", !isVisible);
  if (toggleBtn) {
    toggleBtn.classList.toggle("is-active", isVisible);
    toggleBtn.title = isVisible
      ? t("hideShortcuts")
      : t("showShortcuts");
    toggleBtn.disabled = entries.length === 0;
  }
  if (!isVisible || entries.length === 0) return;

  entries.forEach((entry, index) => {
    const btn = document.createElement("button");
    btn.className = "shortcut-chip";
    btn.type = "button";
    btn.textContent = entry.name || `Shortcut ${index + 1}`;
    btn.addEventListener("click", async () => {
      await applyShortcutEntry(entry);
    });
    btn.addEventListener("dblclick", () => applyShortcutEntry(entry, true));
    bar.appendChild(btn);
  });
}

async function toggleShortcutsVisibility() {
  if (currentThread) {
    const newValue = currentThread.shortcutsVisible === false;
    currentThread.shortcutsVisible = newValue;
    await db.threads.update(currentThread.id, {
      shortcutsVisible: newValue,
    });
  } else {
    state.shortcutsVisible = !state.shortcutsVisible;
    saveUiState();
  }
  renderShortcutsBar();
}

async function applyShortcutEntry(entry, forceSend = false) {
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

  if (entry.autoSend || forceSend) {
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
  if (!grid) return;
  const previousScrollTop = Number(grid.scrollTop || 0);
  const characters = await db.characters.toArray();
  const filters = document.getElementById("character-filters");
  if (filters) {
    filters.classList.toggle("hidden", characters.length === 0);
  }
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
    const parts = getCharacterSortParts(state.characterSortMode);
    const mode = `${parts.base}_${parts.dir}`;
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
    if (mode === "threads_asc")
      return threadsA - threadsB || updatedB - updatedA;
    if (mode === "threads_desc")
      return threadsB - threadsA || updatedB - updatedA;
    return updatedB - updatedA;
  });

  const existingCards = grid.querySelectorAll(".character-card");
  const carouselStates = new Map();
  existingCards.forEach((card) => {
    const charId = card.dataset.characterId;
    if (card._saveVideoTimes) card._saveVideoTimes();
    if (card._getCarouselState) {
      carouselStates.set(charId, card._getCarouselState());
    }
    if (card._stopCarousel) card._stopCarousel();
  });

  grid.innerHTML = "";
  if (sortedCharacters.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent =
      activeFilters.length > 0 ? t("noTagsMatched") : t("noCharactersStart");
    grid.appendChild(empty);
    return;
  }

  sortedCharacters.forEach((char) => {
    const resolved = resolveCharacterForLanguage(
      char,
      char?.selectedCardLanguage,
    );
    const threadCount = threadCountByCharId.get(Number(char.id)) || 0;
    const card = document.createElement("article");
    card.className = "character-card";
    card.dataset.characterId = String(char.id);
    if (
      state.characterCardSlide &&
      Number(state.characterCardSlide.charId) === Number(char.id)
    ) {
      card.classList.add(
        state.characterCardSlide.direction === "prev"
          ? "card-slide-prev"
          : "card-slide-next",
      );
    }

    const avatarWrap = document.createElement("div");
    avatarWrap.className = "character-avatar-wrap";

    const avatars = resolved.avatars || [];
    const hasMultipleAvatars = avatars.length > 1;
    const avatarEffect = state.settings.botCardAvatarEffect || "none";
    const avatarTransitionDelay =
      Number(state.settings.botCardAvatarTransitionDelay) || 4;
    const transitionDelayMs = avatarTransitionDelay * 1000;

    if (hasMultipleAvatars && avatarEffect === "carousel") {
      let currentAvatarIndex = 0;
      let carouselInterval = null;

      const createAvatarElement = (avatarData, index) => {
        const isVideo = avatarData.type === "video";
        let el;
        if (isVideo) {
          el = document.createElement("video");
          el.muted = true;
          el.loop = false;
          el.playsInline = true;
        } else {
          el = document.createElement("img");
        }
        el.className = "character-avatar";
        el.src = avatarData.data instanceof Blob ? getCachedAvatarBlobUrl(avatarData.data) : avatarData.data;
        el.alt = `${resolved.name || "Character"} avatar`;
        el.style.position = "absolute";
        el.style.top = "0";
        el.style.left = "0";
        el.style.width = "100%";
        el.style.height = "100%";
        el.style.objectFit = "cover";
        el.style.opacity = index === 0 ? "1" : "0";
        el.style.transition = "opacity 0.5s ease-in-out";
        el.style.zIndex = index === 0 ? "1" : "0";
        if (isVideo) {
          el.dataset.videoPlayed = "false";
        }
        return el;
      };

      const carouselContainer = document.createElement("div");
      carouselContainer.className = "character-avatar-carousel";
      carouselContainer.style.position = "relative";
      carouselContainer.style.width = "100%";
      carouselContainer.style.height = "100%";

      const avatarElements = avatars.map((avatar, index) => {
        const el = createAvatarElement(avatar, index);
        if (el.tagName === "VIDEO") {
          el.addEventListener("loadedmetadata", () => {
            el.dataset.duration = String(el.duration);
          });
          el.addEventListener("ended", () => {
            el.dataset.videoEnded = "true";
            if (carouselInterval) {
              clearInterval(carouselInterval);
              carouselInterval = null;
            }
            const videoDuration = Number(el.dataset.duration) || 0;
            if (videoDuration > 0 && videoDuration > avatarTransitionDelay) {
              advanceCarousel();
            } else {
              const remainingDelay = avatarTransitionDelay - videoDuration;
              carouselInterval = setTimeout(
                advanceCarousel,
                remainingDelay * 1000,
              );
            }
          });
        }
        carouselContainer.appendChild(el);
        return el;
      });

      const showAvatar = (index) => {
        avatarElements.forEach((el, i) => {
          el.style.opacity = i === index ? "1" : "0";
          el.style.zIndex = i === index ? "1" : "0";
        });
      };

      const scheduleNextTransition = () => {
        if (carouselInterval) {
          clearInterval(carouselInterval);
          carouselInterval = null;
        }
        const currentEl = avatarElements[currentAvatarIndex];
        if (currentEl.tagName === "VIDEO") {
          const videoDuration = Number(currentEl.dataset.duration) || 0;
          if (videoDuration > 0 && videoDuration > avatarTransitionDelay) {
            return;
          }
        }
        carouselInterval = setInterval(advanceCarousel, transitionDelayMs);
      };

      const advanceCarousel = () => {
        const currentEl = avatarElements[currentAvatarIndex];
        if (
          currentEl.tagName === "VIDEO" &&
          currentEl.dataset.videoEnded !== "true"
        ) {
          const videoDuration = Number(currentEl.dataset.duration) || 0;
          if (videoDuration > 0 && videoDuration > avatarTransitionDelay) {
            currentEl.currentTime = 0;
            currentEl.play().catch(() => {});
            return;
          }
        }

        currentAvatarIndex = (currentAvatarIndex + 1) % avatars.length;
        showAvatar(currentAvatarIndex);

        const nextEl = avatarElements[currentAvatarIndex];
        if (nextEl.tagName === "VIDEO") {
          nextEl.dataset.videoEnded = "false";
          nextEl.currentTime = 0;
          nextEl.play().catch(() => {});
        }
        scheduleNextTransition();
      };

      avatarWrap.appendChild(carouselContainer);

      carouselContainer.addEventListener("click", () => {
        const lang = card.dataset.activeCardLanguage;
        openCharacterModal(char, lang);
      });

      const startCarousel = (startIndex = 0) => {
        if (carouselInterval) clearInterval(carouselInterval);
        currentAvatarIndex = startIndex;
        showAvatar(currentAvatarIndex);
        const currentEl = avatarElements[currentAvatarIndex];
        if (currentEl.tagName === "VIDEO") {
          currentEl.dataset.videoEnded = "false";
          currentEl.play().catch(() => {});
        }
        scheduleNextTransition();
      };

      const stopCarousel = () => {
        if (carouselInterval) {
          clearInterval(carouselInterval);
          carouselInterval = null;
        }
        avatarElements.forEach((el) => {
          if (el.tagName === "VIDEO") {
            el.pause();
            el.currentTime = 0;
            el.dataset.videoEnded = "false";
          }
        });
      };

      const getCarouselState = () => {
        return {
          currentIndex: currentAvatarIndex,
          videoTimes: avatarElements.map((el) => {
            if (el.tagName === "VIDEO") {
              return el.currentTime;
            }
            return 0;
          }),
        };
      };

      const saveVideoTimes = () => {
        avatarElements.forEach((el) => {
          if (el.tagName === "VIDEO") {
            el.dataset.savedTime = String(el.currentTime);
          }
        });
      };

      const restoreVideoTimes = () => {
        avatarElements.forEach((el) => {
          if (el.tagName === "VIDEO") {
            const savedTime = parseFloat(el.dataset.savedTime) || 0;
            if (savedTime > 0 && el.paused) {
              el.currentTime = savedTime;
              el.play().catch(() => {});
            }
          }
        });
      };

      card.dataset.carouselActive = "true";
      card._startCarousel = startCarousel;
      card._stopCarousel = stopCarousel;
      card._saveVideoTimes = saveVideoTimes;
      card._restoreVideoTimes = restoreVideoTimes;
      card._getCarouselState = getCarouselState;

      startCarousel();
    } else {
      const avatar = document.createElement("img");
      avatar.className = "character-avatar";
      avatar.alt = `${resolved.name || "Character"} avatar`;
      setCharacterAvatarImage(
        avatar,
        resolved,
        resolved.name || "Character",
        512,
      );
      avatar.addEventListener("click", () => {
        const lang = card.dataset.activeCardLanguage;
        openCharacterModal(char, lang);
      });
      avatarWrap.appendChild(avatar);
    }

    const idOverlay = document.createElement("span");
    idOverlay.className = "character-avatar-id";
    idOverlay.textContent = `#${char.id}`;
    avatarWrap.appendChild(idOverlay);

    const threadOverlay = document.createElement("span");
    threadOverlay.className = "character-avatar-threads";
    threadOverlay.textContent = String(threadCount);
    avatarWrap.appendChild(threadOverlay);

    const name = document.createElement("h3");
    name.className = "character-name";
    applyHoverMarquee(name, resolved.name || "Unnamed");
    name.addEventListener("click", () => {
      const lang = card.dataset.activeCardLanguage;
      openCharacterModal(char, lang);
    });

    const tagline = document.createElement("div");
    tagline.className = "character-tagline";
    const taglineText = resolved.tagline || "";
    tagline.textContent = taglineText;
    applyHoverMarquee(tagline, taglineText);

    const langFlagsWrap = document.createElement("div");
    langFlagsWrap.className = "character-lang-flags";
    const definitions = resolved.definitions || [];
    const activeLang =
      resolved.activeLanguage || definitions[0]?.language || "en";
    card.dataset.activeCardLanguage = activeLang;
    definitions.forEach((def) => {
      const flag = createLanguageFlagRibbonElement(def.language);
      flag.classList.add("character-lang-flag");
      if (def.language === activeLang) {
        flag.classList.add("active");
      }
      flag.addEventListener("click", async (e) => {
        e.stopPropagation();
        const card = e.target.closest(".character-card");
        const currentLang = card?.dataset.activeCardLanguage || activeLang;
        if (def.language === currentLang) return;
        await db.characters.update(char.id, {
          selectedCardLanguage: def.language,
        });
        if (card) {
          card.dataset.activeCardLanguage = def.language;
          const flags = card.querySelectorAll(".character-lang-flag");
          flags.forEach((f) => f.classList.remove("active"));
          e.target.classList.add("active");
          const targetDef =
            definitions.find((d) => d.language === def.language) || def;
          const displayName = targetDef?.name || resolved.name || "Unnamed";
          applyHoverMarquee(name, displayName);
          const displayTagline = targetDef?.tagline || "";
          tagline.textContent = displayTagline;
          applyHoverMarquee(tagline, displayTagline);
        }
      });
      langFlagsWrap.appendChild(flag);
    });

    const tags = (Array.isArray(char.tags) ? char.tags : [])
      .map((t) => normalizeTagValue(t))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    const tagsWrap = document.createElement("div");
    tagsWrap.className = "character-tags";
    const expanded = state.expandedCharacterTagIds.has(Number(char.id));
    if (expanded) tagsWrap.classList.add("tags-expanded");
    tags.forEach((tag, idx) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tag-chip";
      if (idx >= 3) chip.classList.add("tag-extra");
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
        const filters = document.getElementById("character-filters");
        if (filters?.classList.contains("collapsed")) {
          filters.classList.remove("collapsed");
          localStorage.setItem("rp-filters-collapsed", "false");
          updateCharacterFiltersToggleUi();
          requestAnimationFrame(() => {
            renderCharacterTagFilterChips();
          });
        }
        if (idx >= 3 && !state.expandedCharacterTagIds.has(Number(char.id))) {
          state.expandedCharacterTagIds.add(Number(char.id));
          const card = e.target.closest(".character-card");
          if (card) {
            const tagsDiv = card.querySelector(".character-tags");
            if (tagsDiv) tagsDiv.classList.add("tags-expanded");
          }
        }
        renderCharacterTagFilterChips();
        updateCharacterCardsVisibility();
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
        const card = e.target.closest(".character-card");
        if (card) {
          const tagsDiv = card.querySelector(".character-tags");
          if (tagsDiv) {
            tagsDiv.classList.toggle("tags-expanded");
          }
          e.target.textContent = tagsDiv.classList.contains("tags-expanded")
            ? t("less")
            : t("more");
        }
      });
      tagsWrap.appendChild(more);
      if (expanded) tagsWrap.classList.add("tags-expanded");
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const newChatBtn = document.createElement("button");
    newChatBtn.type = "button";
    newChatBtn.className = "secondary-btn new-chat-btn";
    newChatBtn.setAttribute(
      "aria-label",
      tf("newChatAria", { name: resolved.name || "character" }),
    );

    const newChatBtnMain = document.createElement("span");
    newChatBtnMain.className = "new-chat-btn-main";
    newChatBtnMain.textContent = t("newChat");
    newChatBtn.appendChild(newChatBtnMain);

    const newChatBtnDropdown = document.createElement("span");
    newChatBtnDropdown.className = "new-chat-btn-dropdown";
    newChatBtnDropdown.innerHTML = "&#9660;";
    newChatBtn.appendChild(newChatBtnDropdown);

    applyHoverMarquee(newChatBtnMain, t("newChat"));
    newChatBtnMain.addEventListener("click", (e) => {
      e.stopPropagation();
      if (personaDropdownOpen && personaDropdown) {
        personaDropdownOpen = false;
        if (personaDropdown.parentNode) {
          personaDropdown.parentNode.removeChild(personaDropdown);
        }
        personaDropdown = null;
      }
      startNewThread(char.id);
    });

    let personaDropdownOpen = false;
    let personaDropdown = null;

    const showPersonaDropdown = async () => {
      if (personaDropdownOpen) return;
      personaDropdownOpen = true;
      const personas = await getOrderedPersonas();
      if (personas.length === 0) return;

      personaDropdown = document.createElement("div");
      personaDropdown.className = "new-chat-persona-dropdown";

      for (const persona of personas) {
        const item = document.createElement("button");
        item.className = "new-chat-persona-dropdown-item";
        item.type = "button";

        if (persona.avatar) {
          const img = document.createElement("img");
          img.src = persona.avatar instanceof Blob
            ? getCachedAvatarBlobUrl(persona.avatar)
            : persona.avatar;
          item.appendChild(img);
        }

        const nameSpan = document.createElement("span");
        nameSpan.className = "persona-name";
        nameSpan.textContent = persona.name || t("personaDefaultName");
        item.appendChild(nameSpan);

        if (persona.isDefault) {
          const badge = document.createElement("span");
          badge.className = "default-badge";
          badge.textContent = t("defaultSuffix");
          item.appendChild(badge);
        }

        item.addEventListener("click", (e) => {
          e.stopPropagation();
          personaDropdownOpen = false;
          if (personaDropdown && personaDropdown.parentNode) {
            personaDropdown.parentNode.removeChild(personaDropdown);
          }
          personaDropdown = null;
          startNewThread(char.id, persona.id);
        });

        personaDropdown.appendChild(item);
      }

      const rect = newChatBtn.getBoundingClientRect();
      personaDropdown.style.left = `${rect.left}px`;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        personaDropdown.style.bottom = `${window.innerHeight - rect.top + 4}px`;
      } else {
        personaDropdown.style.top = `${rect.bottom + 4}px`;
      }

      document.body.appendChild(personaDropdown);

      const closeDropdown = (e) => {
        if (
          personaDropdown &&
          !personaDropdown.contains(e.target) &&
          e.target !== newChatBtnDropdown
        ) {
          personaDropdownOpen = false;
          if (personaDropdown && personaDropdown.parentNode) {
            personaDropdown.parentNode.removeChild(personaDropdown);
          }
          personaDropdown = null;
          document.removeEventListener("click", closeDropdown);
        }
      };
      setTimeout(() => document.addEventListener("click", closeDropdown), 0);
    };

    newChatBtnDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      if (personaDropdownOpen && personaDropdown) {
        personaDropdownOpen = false;
        if (personaDropdown.parentNode) {
          personaDropdown.parentNode.removeChild(personaDropdown);
        }
        personaDropdown = null;
      } else {
        showPersonaDropdown();
      }
    });

    actions.appendChild(newChatBtn);

    card.addEventListener("mouseenter", () => {
      newChatBtn.classList.add("card-hover-highlight");
    });
    card.addEventListener("mouseleave", () => {
      newChatBtn.classList.remove("card-hover-highlight");
    });
    card.addEventListener("focusin", () => {
      newChatBtn.classList.add("card-hover-highlight");
    });
    card.addEventListener("focusout", () => {
      newChatBtn.classList.remove("card-hover-highlight");
    });

    const deleteCharBtn = iconButton(
      "delete",
      t("deleteCharacterAria"),
      async (e) => {
        e.stopPropagation();
        await deleteCharacter(char.id);
      },
    );
    deleteCharBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteCharBtn);

    actions.appendChild(
      iconButton("duplicate", t("duplicateCharacterAria"), async (e) => {
        e.stopPropagation();
        await duplicateCharacter(char.id);
      }),
    );

    actions.appendChild(
      iconButton("export", t("exportCharacterAria"), async (e) => {
        e.stopPropagation();
        await exportCharacter(char.id);
      }),
    );

    card.append(avatarWrap, name, tagline, langFlagsWrap);
    if (tags.length > 0) card.appendChild(tagsWrap);
    card.append(actions);
    grid.appendChild(card);
  });

  carouselStates.forEach((state, charId) => {
    const card = grid.querySelector(
      `.character-card[data-character-id="${charId}"]`,
    );
    if (card && card._startCarousel) {
      const savedTimes = state.videoTimes || [];
      if (card._restoreVideoTimes) {
        card._restoreVideoTimes();
      }
      const elems = card.querySelectorAll(".character-avatar");
      savedTimes.forEach((time, idx) => {
        if (elems[idx] && elems[idx].tagName === "VIDEO" && time > 0) {
          elems[idx].currentTime = time;
        }
      });
      card._startCarousel(state.currentIndex || 0);
    }
  });

  const maxScroll = Math.max(0, grid.scrollHeight - grid.clientHeight);
  grid.scrollTop = Math.min(previousScrollTop, maxScroll);
  state.characterCardSlide = null;
  updateCarouselForPaneState();
}

function updateThreadBulkBar() {
  const bulkBar = document.getElementById("thread-bulk-bar");
  if (!bulkBar) return;
  const selectAll = bulkBar.querySelector(".thread-select-all");
  const deleteBtn = bulkBar.querySelector(".thread-bulk-delete");
  const list = document.getElementById("thread-list");
  if (!list) return;
  const threadRows = list.querySelectorAll(".thread-row");
  const totalThreads = threadRows.length;
  const selectedCount = state.selectedThreadIds.size;
  if (selectAll) {
    selectAll.checked = selectedCount > 0 && selectedCount === totalThreads;
    selectAll.indeterminate = selectedCount > 0 && selectedCount < totalThreads;
  }
  if (deleteBtn) {
    deleteBtn.disabled = selectedCount === 0;
  }
  threadRows.forEach((row) => {
    const checkbox = row.querySelector(".thread-select");
    if (checkbox) {
      const threadId = Number(row.dataset.threadId);
      checkbox.checked = state.selectedThreadIds.has(threadId);
    }
  });
}

function updateDocumentTitleWithUnread() {
  db.threads.toArray().then((threads) => {
    let totalUnread = 0;
    for (const thread of threads) {
      const messages = Array.isArray(thread.messages) ? thread.messages : [];
      for (const m of messages) {
        if (m.role === "assistant" && Number(m.unreadAt) > 0) {
          totalUnread += 1;
        }
      }
    }
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Scenara`;
    } else {
      document.title = "Scenara";
    }
  });
}

async function renderThreads() {
  const list = document.getElementById("thread-list");
  if (!list) return;
  const renderSeq = ++state.renderThreadsSeq;
  const previousScrollTop = Number(list?.scrollTop || 0);
  const threads = await hydrateGenerationQueue();
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

  if (threads.length === 0) {
    list.innerHTML = "";
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = t("noThreadsYet");
    list.appendChild(empty);
    return;
  }

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

  list.innerHTML = "";

  const bulkBar = document.createElement("div");
  bulkBar.className = "thread-bulk-bar";
  bulkBar.id = "thread-bulk-bar";
  const selectAll = document.createElement("input");
  selectAll.type = "checkbox";
  selectAll.className = "thread-select thread-select-all thread-bulk-select";
  selectAll.title = t("selectAllThreads");
  selectAll.addEventListener("change", () => {
    if (selectAll.checked) {
      threads.forEach((t) => state.selectedThreadIds.add(Number(t.id)));
    } else {
      state.selectedThreadIds.clear();
    }
    updateThreadBulkBar();
  });
  const deleteSelectedBtn = iconButton(
    "delete",
    t("deleteSelectedThreads"),
    async () => {
      await deleteSelectedThreads();
    },
  );
  deleteSelectedBtn.classList.add("danger-icon-btn", "thread-bulk-delete");
  bulkBar.append(selectAll, deleteSelectedBtn);
  list.appendChild(bulkBar);

  const selectedCount = state.selectedThreadIds.size;
  selectAll.checked = selectedCount > 0 && selectedCount === threads.length;
  selectAll.indeterminate = selectedCount > 0 && selectedCount < threads.length;
  deleteSelectedBtn.disabled = selectedCount === 0;

  threads.forEach((thread) => {
    const char = charMap.get(thread.characterId);
    const resolvedChar = char
      ? resolveCharacterForLanguage(char, thread.characterLanguage || "")
      : null;
    const chatViewActive = document
      .getElementById("chat-view")
      ?.classList.contains("active");

    const row = document.createElement("div");
    row.className = "thread-row";
    if (chatViewActive && Number(currentThread?.id) === Number(thread.id)) {
      row.classList.add("active-thread");
    }
    row.dataset.threadId = String(thread.id);
    row.addEventListener("click", (e) => {
      if (e.target?.closest(".actions")) return;
      const chatViewActive = document
        .getElementById("chat-view")
        ?.classList.contains("active");
      if (chatViewActive && Number(currentThread?.id) === Number(thread.id))
        return;
      openThread(thread.id);
    });

    const selectBox = document.createElement("input");
    selectBox.type = "checkbox";
    selectBox.className = "thread-select";
    selectBox.checked = state.selectedThreadIds.has(Number(thread.id));
    selectBox.title = t("selectThread");
    selectBox.addEventListener("click", (e) => e.stopPropagation());
    selectBox.addEventListener("change", () => {
      if (selectBox.checked) state.selectedThreadIds.add(Number(thread.id));
      else state.selectedThreadIds.delete(Number(thread.id));
      updateThreadBulkBar();
    });

    const avatar = document.createElement("img");
    avatar.className = "thread-avatar";
    const threadFallback = resolvedChar?.name || char?.name || t("threadWord");
    if (resolvedChar) {
      setCharacterAvatarImage(avatar, resolvedChar, threadFallback, 512);
    } else {
      avatar.src = fallbackAvatar(threadFallback, 512, 512);
    }
    avatar.alt = `${threadFallback} avatar`;

    const hasGeneratingMessage = threadHasActiveGeneratingMessage(thread);
    const isGenerating =
      hasGeneratingMessage ||
      (state.sending &&
        Number(state.activeGenerationThreadId) === Number(thread.id));
    const isInCooldown =
      !isGenerating &&
      String(thread.pendingGenerationReason || "").trim() === "cooldown" &&
      isInCompletionCooldown();
    const unreadCount = getUnreadAssistantCount(thread.messages || []);
    const threadId = Number(thread.id);
    const previousUnreadCount = state.threadUnreadCounts[threadId] || 0;
    if (unreadCount > previousUnreadCount) {
      playUnreadMessageSound();
    }
    state.threadUnreadCounts[threadId] = unreadCount;
    const queuePos =
      isGenerating || isInCooldown
        ? 0
        : queuePosByThreadId.get(Number(thread.id)) || 0;
    const statusBadges = document.createElement("div");
    statusBadges.className = "thread-status-badges";
    if (unreadCount > 0) {
      const unreadBadge = document.createElement("span");
      unreadBadge.className = "thread-unread-badge";
      unreadBadge.textContent = String(unreadCount);
      statusBadges.appendChild(unreadBadge);
    }
    let queueBadge = null;
    if (isGenerating) {
      queueBadge = document.createElement("span");
      queueBadge.className = "thread-generating-badge";
      queueBadge.innerHTML = '<span class="spinner" aria-hidden="true"></span>';
      queueBadge.setAttribute("title", t("generatingLabel"));
      queueBadge.setAttribute("aria-label", t("generatingLabel"));
    } else if (isInCooldown) {
      queueBadge = document.createElement("span");
      queueBadge.className = "thread-cooldown-badge";
      queueBadge.textContent = "C";
      const cooldownTitle = tf("cooldownToastActive", {
        seconds: getCooldownRemainingSeconds(),
      });
      queueBadge.setAttribute("title", cooldownTitle);
      queueBadge.setAttribute("aria-label", cooldownTitle);
    } else if (queuePos > 0) {
      queueBadge = document.createElement("span");
      queueBadge.className = "thread-queue-badge";
      queueBadge.textContent = `Q${queuePos}`;
      const queueTitle = tf("threadQueueBadgeTitle", { position: queuePos });
      queueBadge.setAttribute("title", queueTitle);
      queueBadge.setAttribute("aria-label", queueTitle);
    }
    if (queueBadge) {
      statusBadges.appendChild(queueBadge);
    }

    const info = document.createElement("div");
    info.className = "thread-info";

    const meta = document.createElement("div");
    meta.className = "thread-meta";
    const metaName = document.createElement("span");
    metaName.textContent = resolvedChar?.name || char?.name || "Unknown";
    applyHoverMarquee(metaName, metaName.textContent);
    meta.append(metaName);
    const metaRight = document.createElement("div");
    metaRight.className = "thread-meta-right";
    const metaId = document.createElement("span");
    metaId.textContent = `#${thread.id}`;
    const metaLang = createLanguageFlagIconElement(
      thread.characterLanguage || resolvedChar?.activeLanguage || "",
      "thread-language-flag",
    );
    metaRight.append(metaId, metaLang);

    const titleBtn = document.createElement("button");
    titleBtn.className = "thread-title";
    const threadTitleText =
      thread.title || tf("threadTitleDefault", { id: thread.id });
    applyHoverMarquee(titleBtn, threadTitleText);
    titleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openThread(thread.id);
    });
    const titleRow = document.createElement("div");
    titleRow.className = "thread-title-row";
    const renameMiniBtn = iconButton(
      "edit",
      t("renameThreadAria"),
      async (e) => {
        e.stopPropagation();
        await renameThread(thread.id);
      },
    );
    renameMiniBtn.classList.add("thread-rename-mini", "thread-rename-top");
    titleRow.append(titleBtn);

    info.append(titleRow, meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const deleteThreadBtn = iconButton(
      "delete",
      t("deleteThreadAria"),
      async (e) => {
        e.stopPropagation();
        await deleteThread(thread.id);
      },
    );
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

    const duplicateBtn = iconButton(
      "duplicate",
      t("duplicateThreadAria"),
      async (e) => {
        e.stopPropagation();
        await duplicateThread(thread.id);
      },
    );
    duplicateBtn.disabled = threadHasPendingBotActivity(thread);
    actions.appendChild(duplicateBtn);
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
    if (statusBadges.children.length > 0) {
      row.append(avatar, info, metaRight, renameMiniBtn, statusBadges, actions);
    } else {
      row.append(avatar, info, metaRight, renameMiniBtn, actions);
    }
    list.appendChild(row);
  });

  const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight);
  if (renderSeq !== state.renderThreadsSeq) return;
  list.scrollTop = Math.min(previousScrollTop, maxScroll);
  updateDocumentTitleWithUnread();
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

  const activeId = Number(state.activeGenerationThreadId);
  if (
    state.sending &&
    Number.isInteger(activeId) &&
    ids.includes(activeId) &&
    state.abortController
  ) {
    cancelOngoingGeneration();
  }
  state.generationQueue = state.generationQueue.filter(
    (id) => !ids.includes(Number(id)),
  );
  for (const id of ids) {
    localStorage.removeItem(`rp-thread-scroll-${id}`);
    try {
      await db.threads.update(id, {
        pendingGenerationReason: "",
        pendingGenerationQueuedAt: 0,
        updatedAt: Date.now(),
      });
    } catch {
      // thread might already be deleted
    }
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
  showToast(
    tf("deletedThreadsToast", { count: ids.length, suffix }),
    "success",
  );
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
  const overlayToggle = document.getElementById("pane-overlay-toggle");
  pane.classList.toggle("collapsed");
  shell.classList.toggle(
    "pane-collapsed",
    pane.classList.contains("collapsed"),
  );
  if (overlayToggle) {
    overlayToggle.classList.toggle(
      "collapsed",
      pane.classList.contains("collapsed"),
    );
  }
  if (pane.classList.contains("collapsed")) {
    if (homeBtn) {
      homeBtn.textContent = "H";
      homeBtn.title = t("home");
    }
    createBtn.textContent = "+";
    createBtn.title = t("createCharacter");
    if (importBtn) {
      importBtn.textContent = "^";
      importBtn.title = t("importCharacter");
    }
  } else {
    if (homeBtn) {
      homeBtn.textContent = getHomeButtonText();
      homeBtn.title = "";
    }
    createBtn.textContent = t("createCharacter");
    createBtn.title = "";
    if (importBtn) {
      importBtn.textContent = `^ ${t("importCharacter")}`;
      importBtn.title = "";
    }
  }
  updateCarouselForPaneState();
}

function showMainView() {
  if (currentThread) {
    const log = document.getElementById("chat-log");
    if (log) {
      localStorage.setItem(
        `rp-thread-scroll-${currentThread.id}`,
        log.scrollTop,
      );
    }
  }
  stopTtsPlayback();
  state.unreadNeedsUserScrollThreadId = null;
  document.getElementById("main-view").classList.add("active");
  document.getElementById("chat-view").classList.remove("active");
  updateThreadRenameButtonState();
  updateAutoTtsToggleButton();
  updateChatInputToggles();
  renderThreads().catch(() => {});
  updateScrollBottomButtonVisibility();
  scheduleThreadBudgetIndicatorUpdate();
  startAllCarousels();
}

function showChatView() {
  document.getElementById("chat-view").classList.add("active");
  document.getElementById("main-view").classList.remove("active");
  updateThreadRenameButtonState();
  updateAutoTtsToggleButton();
  updateChatInputToggles();
  setSendingState(state.sending);
  renderThreads().catch(() => {});
  updateScrollBottomButtonVisibility();
  stopAllCarousels();
  if (state.unreadNeedsUserScrollThreadId) {
    window.requestAnimationFrame(() => {
      maybeProcessUnreadMessagesSeen(false).catch(() => {});
    });
  }
}

function stopAllCarousels() {
  const grid = document.getElementById("character-grid");
  if (!grid) return;
  const cards = grid.querySelectorAll(".character-card");
  cards.forEach((card) => {
    if (card._stopCarousel) card._stopCarousel();
  });
}

function startAllCarousels() {
  const grid = document.getElementById("character-grid");
  if (!grid) return;
  const cards = grid.querySelectorAll(".character-card");
  cards.forEach((card) => {
    if (card._restoreVideoTimes) card._restoreVideoTimes();
    if (card._startCarousel) card._startCarousel();
  });
}

function openModal(modalId) {
  closeActiveModal();
  const modal = document.getElementById(modalId);
  if (!modal) return;
  state.activeModalId = modalId;
  modal.classList.remove("hidden");
  window.requestAnimationFrame(() => {
    resetModalTextareaCollapseStates(modal);
  });
  setModalDirtyState(modalId, false);
  if (modalId === "personas-modal") {
    renderPersonaModalList();
  } else if (modalId === "settings-modal") {
    const lastTab = localStorage.getItem("rp-settings-last-tab") || "api";
    const tabBtn = document.querySelector(
      `[data-settings-tab-btn="${lastTab}"]`,
    );
    if (tabBtn instanceof HTMLButtonElement) tabBtn.click();
    else {
      const firstTab = document.querySelector('[data-settings-tab-btn="api"]');
      if (firstTab instanceof HTMLButtonElement) firstTab.click();
    }
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
  } else if (modalId === "writing-instructions-modal") {
    openWritingInstructionsManager().catch(() => {});
  } else if (modalId === "assets-modal") {
    openAssetsManager().catch(() => {});
  }
}

async function closeActiveModal() {
  if (!state.activeModalId) return;
  const closingId = state.activeModalId;
  if (closingId === "text-input-modal") {
    resolveTextInputDialog(false);
    return;
  }
  if (state.modalDirty[closingId]) {
    const action = await openUnsavedChangesDialog();
    if (action === "back") return;
    if (action === "close") {
      setModalDirtyState(closingId, false);
    } else if (action === "save") {
      const saved = await handleModalSaveAction(closingId);
      if (!saved) return;
      setModalDirtyState(closingId, false);
    }
  }
  const modal = document.getElementById(state.activeModalId);
  modal?.classList.add("hidden");
  if (closingId === "writing-instruction-editor-modal") {
    const parentModal = document.getElementById("writing-instructions-modal");
    if (parentModal) {
      parentModal.classList.remove("hidden");
      state.activeModalId = "writing-instructions-modal";
      return;
    }
  }
  if (closingId === "character-modal") {
    if (state.editingCharacterId) {
      localStorage.setItem(
        `rp-char-modal-last-lang-${state.editingCharacterId}`,
        state.charModalActiveLanguage,
      );
    }
    saveCharModalTextareaCollapseStates();
    state.charModalPendingThreadDeleteIds = [];
  }
  state.activeModalId = null;
  setModalDirtyState(closingId, false);
}

async function handleModalSaveAction(modalId) {
  if (modalId === "character-modal") {
    return saveCharacterFromModal({ close: false });
  }
  if (modalId === "shortcuts-modal") {
    return saveShortcutsFromModal({ close: false });
  }
  if (modalId === "personas-modal") {
    return savePersonaFromModal();
  }
  if (modalId === "lore-modal") {
    return saveLorebookFromEditor();
  }
  if (modalId === "writing-instructions-modal") {
    return saveWritingInstruction();
  }
  if (modalId === "asset-editor-modal") {
    return saveAssetFromEditor();
  }
  return true;
}

function normalizeBotLanguageCode(value) {
  const raw = String(value || "").trim();
  if (!raw) return "en";
  if (raw.toLowerCase().startsWith("pt-br")) return "pt-BR";
  if (raw.toLowerCase().startsWith("pt-pt")) return "pt-PT";
  return raw;
}

function getBotLanguageFlag(code) {
  return `[${normalizeBotLanguageCode(code)}]`;
}

function getBotLanguageFlagIconCode(code) {
  return BOT_LANGUAGE_FLAG_ICON_CODES[normalizeBotLanguageCode(code)] || "";
}

function getBotLanguageName(code) {
  return (
    BOT_LANGUAGE_NAMES[normalizeBotLanguageCode(code)] ||
    normalizeBotLanguageCode(code)
  );
}

function createLanguageFlagIconElement(code, className = "") {
  const span = document.createElement("span");
  if (className) span.className = className;
  const iconCode = getBotLanguageFlagIconCode(code);
  if (iconCode) {
    span.classList.add("fi", `fi-${iconCode}`, "flag-icon-inline");
    span.style.backgroundImage = `url("assets/flag-icons/flags/4x3/${iconCode}.svg")`;
    span.setAttribute("aria-label", normalizeBotLanguageCode(code));
    span.setAttribute("title", normalizeBotLanguageCode(code));
  } else {
    span.textContent = getBotLanguageFlag(code);
  }
  return span;
}

function createLanguageFlagRibbonElement(code) {
  const span = document.createElement("span");
  span.className = "character-lang-flag-elem";
  const iconCode = getBotLanguageFlagIconCode(code);
  if (iconCode) {
    span.style.backgroundImage = `url("assets/flag-icons/flags/4x3/${iconCode}.svg")`;
    span.setAttribute("aria-label", normalizeBotLanguageCode(code));
    span.setAttribute("title", normalizeBotLanguageCode(code));
  } else {
    span.textContent = getBotLanguageFlag(code);
  }
  return span;
}

function getPrimaryAvatarInfo(character) {
  const avatars = Array.isArray(character?.avatars) ? character.avatars : [];
  if (avatars.length > 0) {
    const first = avatars[0];
    if (first && first.data) {
      return {
        type: first.type || "image",
        data: first.data,
      };
    }
  }
  if (character?.avatar) {
    return {
      type: "image",
      data: character.avatar,
    };
  }
  return null;
}

async function ensureVideoAvatarSnapshot(src) {
  if (!src) return null;
  if (state.avatarSnapshotCache.has(src))
    return state.avatarSnapshotCache.get(src);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = src;
  try {
    await new Promise((resolve, reject) => {
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = (err) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        video.removeEventListener("loadeddata", onLoaded);
        video.removeEventListener("error", onError);
      };
      video.addEventListener("loadeddata", onLoaded, { once: true });
      video.addEventListener("error", onError, { once: true });
    });
    const width = video.videoWidth || 256;
    const height = video.videoHeight || 256;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/png");
      state.avatarSnapshotCache.set(src, dataUrl);
      return dataUrl;
    }
  } catch (err) {
    console.warn("avatar:snapshot-failed", src, err);
  } finally {
    video.pause();
    video.src = "";
  }
  state.avatarSnapshotCache.set(src, null);
  return null;
}

function setCharacterAvatarImage(
  img,
  character,
  fallbackName,
  fallbackSize = 512,
) {
  const info = getPrimaryAvatarInfo(character);
  const fallbackUrl = fallbackAvatar(
    fallbackName || t("threadWord"),
    fallbackSize,
    fallbackSize,
  );
  img.dataset.avatarVideo = "";
  if (!info?.data) {
    img.src = fallbackUrl;
    return;
  }
  const dataSrc = info.data instanceof Blob ? getCachedAvatarBlobUrl(info.data) : info.data;
  if (info.type === "video") {
    img.dataset.avatarVideo = dataSrc;
    // Check snapshot cache synchronously first
    const cachedSnapshot = state.avatarSnapshotCache.get(dataSrc);
    if (cachedSnapshot) {
      img.src = cachedSnapshot;
      return;
    }
    img.src = fallbackUrl;
    ensureVideoAvatarSnapshot(dataSrc)
      .then((preview) => {
        if (preview) img.src = preview;
      })
      .catch(() => {});
    return;
  }
  img.src = dataSrc;
}

function createEmptyCharacterDefinition(language = "en") {
  return {
    language: normalizeBotLanguageCode(language),
    name: "",
    tagline: "",
    systemPrompt: "",
    oneTimeExtraPrompt: "",
    writingInstructions: "",
    writingInstructionId: "none",
    initialMessagesRaw: "",
    initialMessages: [],
    personaInjectionPlacement: "end_system_prompt",
    ttsVoice: DEFAULT_TTS_VOICE,
    ttsLanguage: DEFAULT_TTS_LANGUAGE,
    ttsRate: DEFAULT_TTS_RATE,
    ttsPitch: 1.1,
    ttsProvider: "kokoro",
    kokoroDevice: "webgpu",
    kokoroDtype: "auto",
    kokoroVoice: DEFAULT_KOKORO_VOICE,
    kokoroSpeed: DEFAULT_TTS_RATE,
    preferLoreBooksMatchingLanguage: true,
    lorebookIds: [],
  };
}

function getInitialBotDefinitionLanguage() {
  const ui = state.settings.uiLanguage;
  if (ui && ui !== "auto") return normalizeBotLanguageCode(ui);
  return normalizeBotLanguageCode(state.i18nLang || "en");
}

function normalizeCharacterDefinitions(character = null) {
  if (!character) {
    return [createEmptyCharacterDefinition(getInitialBotDefinitionLanguage())];
  }
  const defsRaw = Array.isArray(character?.definitions)
    ? character.definitions
    : [];
  const defs = defsRaw
    .map((d) => {
      const def = {
        ...createEmptyCharacterDefinition(d?.language || "en"),
        ...d,
        language: normalizeBotLanguageCode(d?.language || "en"),
        ttsProvider: d?.ttsProvider || "kokoro",
        kokoroDevice: d?.kokoroDevice || "webgpu",
        kokoroDtype: d?.kokoroDtype || "auto",
        kokoroVoice: String(d?.kokoroVoice || DEFAULT_KOKORO_VOICE),
        kokoroSpeed: Number.isFinite(Number(d?.kokoroSpeed))
          ? Number(d.kokoroSpeed)
          : Number.isFinite(Number(d?.ttsRate))
            ? Number(d.ttsRate)
            : DEFAULT_TTS_RATE,
        preferLoreBooksMatchingLanguage:
          d?.preferLoreBooksMatchingLanguage !== false,
        lorebookIds: Array.isArray(d?.lorebookIds)
          ? d.lorebookIds.map(Number).filter(Number.isInteger)
          : [],
      };
      delete def.avatar;
      delete def.avatars;
      return def;
    })
    .filter(
      (d, i, arr) => arr.findIndex((x) => x.language === d.language) === i,
    );
  if (defs.length > 0) return defs;
  const fallbackLanguage = normalizeBotLanguageCode(
    character?.selectedCardLanguage || character?.language || "en",
  );
  const fallback = createEmptyCharacterDefinition(fallbackLanguage);
  fallback.name = String(character?.name || "");
  fallback.tagline = String(character?.tagline || "");
  fallback.systemPrompt = String(character?.systemPrompt || "");
  fallback.oneTimeExtraPrompt = String(character?.oneTimeExtraPrompt || "");
  fallback.writingInstructions = String(character?.writingInstructions || "");
  fallback.writingInstructionId = String(character?.writingInstructionId || "");
  fallback.initialMessagesRaw =
    String(character?.initialMessagesRaw || "") ||
    formatInitialMessagesForEditor(character?.initialMessages || []);
  fallback.initialMessages = Array.isArray(character?.initialMessages)
    ? character.initialMessages
    : [];
  fallback.personaInjectionPlacement =
    character?.personaInjectionPlacement || "end_messages";
  fallback.ttsVoice = String(character?.ttsVoice || DEFAULT_TTS_VOICE);
  fallback.ttsLanguage = String(character?.ttsLanguage || DEFAULT_TTS_LANGUAGE);
  fallback.ttsRate = Number.isFinite(Number(character?.ttsRate))
    ? Number(character.ttsRate)
    : DEFAULT_TTS_RATE;
  fallback.ttsPitch = Number.isFinite(Number(character?.ttsPitch))
    ? Number(character.ttsPitch)
    : 1.1;
  fallback.ttsProvider = character?.ttsProvider || "kokoro";
  fallback.kokoroDevice = character?.kokoroDevice || "webgpu";
  fallback.kokoroDtype = character?.kokoroDtype || "auto";
  fallback.kokoroVoice = String(character?.kokoroVoice || DEFAULT_KOKORO_VOICE);
  fallback.kokoroSpeed = Number.isFinite(Number(character?.kokoroSpeed))
    ? Number(character.kokoroSpeed)
    : Number.isFinite(Number(character?.ttsRate))
      ? Number(character.ttsRate)
      : DEFAULT_TTS_RATE;
  fallback.preferLoreBooksMatchingLanguage =
    character?.preferLoreBooksMatchingLanguage !== false;
  fallback.lorebookIds = Array.isArray(character?.lorebookIds)
    ? character.lorebookIds.map(Number).filter(Number.isInteger)
    : [];
  return [fallback];
}

function resolveCharacterLanguageDefinition(character, preferredLanguage = "") {
  const defs = normalizeCharacterDefinitions(character);
  const preferred = normalizeBotLanguageCode(
    preferredLanguage ||
      character?.selectedCardLanguage ||
      defs[0]?.language ||
      "en",
  );
  const def = defs.find((d) => d.language === preferred) || defs[0];
  return {
    definitions: defs,
    definition: def,
    language: def?.language || defs[0]?.language || "en",
  };
}

function resolveCharacterForLanguage(character, preferredLanguage = "") {
  const base = character || {};
  const resolved = resolveCharacterLanguageDefinition(base, preferredLanguage);
  return {
    ...base,
    ...(resolved.definition || {}),
    definitions: resolved.definitions,
    activeLanguage: resolved.language,
  };
}

function getActiveCharacterDefinition() {
  return state.charModalDefinitions.find(
    (d) => d.language === state.charModalActiveLanguage,
  );
}

function setCharacterModalTab(tab = "lang") {
  const normalized =
    tab === "config" ? "config" : tab === "tags" ? "tags" : "lang";
  state.charModalActiveTab = normalized;
  const showLang = normalized === "lang";
  const showConfig = normalized === "config";
  const showTags = normalized === "tags";
  document
    .querySelectorAll(".lang-field")
    .forEach((el) => el.classList.toggle("hidden", !showLang));
  document
    .querySelectorAll(".global-field")
    .forEach((el) => el.classList.toggle("hidden", !showConfig));
  document
    .querySelectorAll(".tags-field")
    .forEach((el) => el.classList.toggle("hidden", !showTags));
  const configBtn = document.getElementById("char-config-tab-btn");
  if (configBtn) configBtn.classList.toggle("active", showConfig);
  const tagsBtn = document.getElementById("char-tags-tab-btn");
  if (tagsBtn) tagsBtn.classList.toggle("active", showTags);
}

function renderCharacterDefinitionTabs() {
  const root = document.getElementById("char-def-tabs-left");
  if (!root) return;
  root.innerHTML = "";
  state.charModalDefinitions.forEach((def) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "settings-tab-btn char-def-tab-btn";
    if (
      def.language === state.charModalActiveLanguage &&
      state.charModalActiveTab === "lang"
    ) {
      btn.classList.add("active");
    }
    const label = document.createElement("span");
    label.className = "char-def-tab-label";
    const flag = createLanguageFlagIconElement(
      def.language,
      "char-def-tab-flag",
    );
    const text = document.createElement("span");
    text.textContent = def.language;
    label.append(flag, text);
    btn.appendChild(label);
    btn.addEventListener("click", async () => {
      saveActiveCharacterDefinitionFromForm();
      saveCharModalTextareaCollapseStates();
      state.charModalActiveLanguage = def.language;
      await loadActiveCharacterDefinitionToForm();
      setCharacterModalTab("lang");
      renderCharacterDefinitionTabs();
      restoreCharModalTextareaCollapseStates();
    });
    const del = document.createElement("button");
    del.type = "button";
    del.className = "char-def-tab-delete";
    del.textContent = "x";
    del.disabled = state.charModalDefinitions.length <= 1;
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (state.charModalDefinitions.length <= 1) {
        await openInfoDialog(t("message"), t("languageRequired"));
        return;
      }
      let affectedThreads = [];
      if (Number.isInteger(Number(state.editingCharacterId))) {
        const threadsForChar = await db.threads
          .where("characterId")
          .equals(Number(state.editingCharacterId))
          .toArray();
        affectedThreads = threadsForChar.filter(
          (th) =>
            normalizeBotLanguageCode(th.characterLanguage || "") ===
            def.language,
        );
      }
      const removeMsg =
        affectedThreads.length > 0
          ? tf("removeLanguageConfirmWithThreads", {
              lang: def.language,
              count: affectedThreads.length,
            })
          : tf("removeLanguageConfirm", { lang: def.language });
      const ok = await openConfirmDialog(t("removeLanguageTitle"), removeMsg);
      if (!ok) return;
      saveActiveCharacterDefinitionFromForm();
      state.charModalDefinitions = state.charModalDefinitions.filter(
        (x) => x.language !== def.language,
      );
      if (state.charModalActiveLanguage === def.language) {
        state.charModalActiveLanguage =
          state.charModalDefinitions[0]?.language || "";
      }
      if (affectedThreads.length > 0) {
        const idsToDelete = affectedThreads
          .map((th) => Number(th.id))
          .filter(Number.isInteger);
        state.charModalPendingThreadDeleteIds = Array.from(
          new Set([
            ...(Array.isArray(state.charModalPendingThreadDeleteIds)
              ? state.charModalPendingThreadDeleteIds
              : []),
            ...idsToDelete,
          ]),
        );
      }
      await loadActiveCharacterDefinitionToForm();
      renderCharacterDefinitionTabs();
    });
    btn.appendChild(del);
    root.appendChild(btn);
  });
  const configBtn = document.getElementById("char-config-tab-btn");
  if (configBtn)
    configBtn.classList.toggle("active", state.charModalActiveTab === "config");
  const tagsBtn = document.getElementById("char-tags-tab-btn");
  if (tagsBtn)
    tagsBtn.classList.toggle("active", state.charModalActiveTab === "tags");
}

function saveActiveCharacterDefinitionFromForm() {
  const def = getActiveCharacterDefinition();
  if (!def) return;
  saveCharModalTextareaCollapseStates();
  def.name = String(document.getElementById("char-name")?.value || "").trim();
  def.tagline = String(
    document.getElementById("char-tagline")?.value || "",
  ).trim();
  def.systemPrompt = String(
    document.getElementById("char-system-prompt")?.value || "",
  ).trim();
  def.oneTimeExtraPrompt = String(
    document.getElementById("char-one-time-extra-prompt")?.value || "",
  ).trim();
  const writingInstructionsTextarea = document.getElementById(
    "char-writing-instructions",
  );
  const writingInstructionsSelect = document.getElementById(
    "char-writing-instructions-select",
  );
  const selectedWritingInstructionId = String(
    writingInstructionsSelect?.value || "",
  );
  def.writingInstructionId = selectedWritingInstructionId;
  def.writingInstructions =
    selectedWritingInstructionId === ""
      ? String(writingInstructionsTextarea?.value || "").trim()
      : "";
  def.initialMessagesRaw = String(
    document.getElementById("char-initial-messages")?.value || "",
  );
  def.personaInjectionPlacement = String(
    document.getElementById("char-persona-injection-placement")?.value ||
      "end_messages",
  );
  const selectedTts = getResolvedCharTtsSelection();
  def.ttsVoice = selectedTts.voice;
  def.ttsLanguage = selectedTts.language;
  def.ttsRate = selectedTts.rate;
  def.ttsPitch = selectedTts.pitch;
  def.ttsProvider = getCharModalTtsProviderSelection();
  def.kokoroDevice = String(
    document.getElementById("char-tts-kokoro-device")?.value || "webgpu",
  );
  def.kokoroDtype = String(
    document.getElementById("char-tts-kokoro-dtype")?.value || "auto",
  );
  def.kokoroVoice = String(
    document.getElementById("char-tts-kokoro-voice")?.value ||
      DEFAULT_KOKORO_VOICE,
  );
  def.kokoroSpeed = selectedTts.rate;
  def.preferLoreBooksMatchingLanguage =
    document.getElementById("char-prefer-lore-language")?.checked !== false;
  def.lorebookIds = getSelectedLorebookIds();
}

async function loadActiveCharacterDefinitionToForm() {
  const def = getActiveCharacterDefinition();
  if (!def) return;
  document.getElementById("char-name").value = def.name || "";
  updateNameLengthCounter("char-name", "char-name-count", 128);
  document.getElementById("char-tagline").value = def.tagline || "";
  updateNameLengthCounter("char-tagline", "char-tagline-count", 128);
  document.getElementById("char-system-prompt").value = def.systemPrompt || "";
  document.getElementById("char-one-time-extra-prompt").value =
    def.oneTimeExtraPrompt || "";
  document.getElementById("char-writing-instructions").value =
    def.writingInstructions || "";
  await populateCharWritingInstructionsSelect(def.writingInstructionId);
  updateCharWritingInstructionsVisibility();
  document.getElementById("char-initial-messages").value =
    def.initialMessagesRaw ||
    ((def.initialMessages || []).length > 0
      ? formatInitialMessagesForEditor(def.initialMessages || [])
      : "");
  document.getElementById("char-persona-injection-placement").value =
    def.personaInjectionPlacement || "end_messages";
  populateCharTtsLanguageSelect(def.ttsLanguage || DEFAULT_TTS_LANGUAGE);
  populateCharTtsVoiceSelect(def.ttsVoice || DEFAULT_TTS_VOICE);
  document.getElementById("char-tts-rate").value = String(
    Math.max(0.5, Math.min(2, Number(def.ttsRate) || DEFAULT_TTS_RATE)),
  );
  document.getElementById("char-tts-pitch").value = String(
    Math.max(0, Math.min(2, Number(def.ttsPitch) || 1.1)),
  );
  document.getElementById("char-tts-provider").value =
    def.ttsProvider || "kokoro";
  const kokoroDevice = document.getElementById("char-tts-kokoro-device");
  const kokoroDeviceValue = def.kokoroDevice || "webgpu";
  if (kokoroDevice) kokoroDevice.value = kokoroDeviceValue;
  updateKokoroDtypeOptionsForDevice(
    kokoroDeviceValue,
    def.kokoroDtype || "auto",
  );
  const activeModalLanguage = getCharModalActiveLanguage();
  populateKokoroVoiceSelect(
    def.kokoroVoice || DEFAULT_KOKORO_VOICE,
    activeModalLanguage,
  );
  document.getElementById("char-prefer-lore-language").checked =
    def.preferLoreBooksMatchingLanguage !== false;
  updateCharTtsRatePitchLabels();
  refreshCharTtsProviderFields();
  renderCharacterLorebookList(def.lorebookIds || []);
}

function populateCharacterLanguageSelectOptions() {
  const select = document.getElementById("char-language-select");
  if (!select) return;
  const used = new Set(state.charModalDefinitions.map((d) => d.language));
  select.innerHTML = "";
  const FLAG_EMOJI = {
    en: "🇺🇸",
    fr: "🇫🇷",
    it: "🇮🇹",
    de: "🇩🇪",
    es: "🇪🇸",
    "pt-BR": "🇧🇷",
    "pt-PT": "🇵🇹",
    ja: "🇯🇵",
    ko: "🇰🇷",
    "zh-CN": "🇨🇳",
    "zh-TW": "🇹🇼",
    ru: "🇷🇺",
    ar: "🇸🇦",
    nl: "🇳🇱",
    tr: "🇹🇷",
    pl: "🇵🇱",
    sv: "🇸🇪",
    da: "🇩🇰",
    fi: "🇫🇮",
    no: "🇳🇴",
    cs: "🇨🇿",
    ro: "🇷🇴",
    hu: "🇭🇺",
    el: "🇬🇷",
    he: "🇮🇱",
    hi: "🇮🇳",
    id: "🇮🇩",
    th: "🇹🇭",
    vi: "🇻🇳",
  };
  BOT_LANGUAGE_OPTIONS.filter((code) => !used.has(code)).forEach((code) => {
    const opt = document.createElement("option");
    opt.value = code;
    const flagEmoji = FLAG_EMOJI[code] || "🌐";
    const langName = getBotLanguageName(code);
    opt.textContent = `${flagEmoji} ${langName} (${code})`;
    select.appendChild(opt);
  });
}

async function openCharacterModal(
  character = null,
  selectedCardLanguage = null,
  startDirty = false,
) {
  state.charModalTtsTestPlaying = false;
  state.charModalPendingThreadDeleteIds = [];
  state.editingCharacterId = character?.id || null;
  setupKokoroDownloadCancel();

  const hasAvatars =
    character?.avatars &&
    Array.isArray(character.avatars) &&
    character.avatars.length > 0;
  state.charModalAvatars = hasAvatars ? [...character.avatars] : [];
  if (state.charModalAvatars.length === 0 && character?.avatar) {
    state.charModalAvatars = [
      { type: "image", data: character.avatar, name: "" },
    ];
  }
  renderCharAvatars();
  state.charModalDefinitions = normalizeCharacterDefinitions(character);
  const cardLanguage =
    selectedCardLanguage || character?.selectedCardLanguage || "";
  const hasCardLanguage =
    cardLanguage &&
    state.charModalDefinitions.some((d) => d.language === cardLanguage);
  let activeLanguage = hasCardLanguage
    ? cardLanguage
    : state.charModalDefinitions[0]?.language ||
      getInitialBotDefinitionLanguage();
  if (character?.id) {
    const savedLang = localStorage.getItem(
      `rp-char-modal-last-lang-${character.id}`,
    );
    if (
      savedLang &&
      state.charModalDefinitions.some((d) => d.language === savedLang)
    ) {
      activeLanguage = savedLang;
    }
  }
  state.charModalActiveLanguage = activeLanguage;
  state.charModalActiveTab = "lang";

  document.getElementById("char-use-memory").checked =
    character?.useMemory !== false;
  document.getElementById("char-use-postprocess").checked =
    character?.usePostProcessing !== false;
  document.getElementById("char-auto-trigger-first-ai").checked =
    character?.autoTriggerAiFirstMessage !== false;
  document.getElementById("char-avatar-scale").value = String(
    Number(character?.avatarScale) || 4,
  );
  setCharacterTagsInputValue(character?.tags || []);
  renderCharacterTagPresetButtons();

  renderCharacterDefinitionTabs();
  await loadActiveCharacterDefinitionToForm();
  setCharacterModalTab("lang");
  populateCharacterLanguageSelectOptions();

  updateCharTtsRatePitchLabels();
  updateCharTtsTestButtonState();
  updateCharacterPromptPlaceholder();
  state.modalDirty["character-modal"] = startDirty;
  updateModalActionButtons("character-modal");
  document.getElementById("char-language-modal")?.classList.add("hidden");

   openModal("character-modal");
   restoreCharModalTextareaCollapseStates();
   // For new characters, reset modal scroll to top
   if (!character?.id) {
     const modalBody = document.querySelector("#character-modal .modal-body");
     if (modalBody) modalBody.scrollTop = 0;
   }
 }

async function saveCharacterFromModal({ close = true } = {}) {
  saveActiveCharacterDefinitionFromForm();
  const defs = state.charModalDefinitions.map((def) => ({ ...def }));
  if (defs.length === 0) {
    await openInfoDialog(t("missingFieldTitle"), t("languageRequired"));
    return false;
  }

  const missingNameLanguages = [];
  for (let i = 0; i < defs.length; i += 1) {
    const def = defs[i];
    def.language = normalizeBotLanguageCode(def.language || "en");
    def.name = String(def.name || "").trim();
    def.systemPrompt = String(def.systemPrompt || "").trim();
    def.oneTimeExtraPrompt = String(def.oneTimeExtraPrompt || "").trim();
    def.writingInstructions = String(def.writingInstructions || "").trim();
    def.personaInjectionPlacement =
      def.personaInjectionPlacement || "end_system_prompt";
    def.ttsVoice = String(def.ttsVoice || DEFAULT_TTS_VOICE);
    def.ttsLanguage = String(def.ttsLanguage || DEFAULT_TTS_LANGUAGE);
    def.ttsRate = Math.max(
      0.5,
      Math.min(2, Number(def.ttsRate) || DEFAULT_TTS_RATE),
    );
    def.ttsPitch = Math.max(0, Math.min(2, Number(def.ttsPitch) || 1.1));
    def.preferLoreBooksMatchingLanguage =
      def.preferLoreBooksMatchingLanguage !== false;
    def.lorebookIds = Array.isArray(def.lorebookIds)
      ? def.lorebookIds.map(Number).filter(Number.isInteger)
      : [];
    delete def.avatar;
    delete def.avatars;
    if (!def.name) missingNameLanguages.push(def.language);
    try {
      const parsedInitialMessages = parseInitialMessagesInput(
        def.initialMessagesRaw || "",
      );
      def.initialMessagesRaw = parsedInitialMessages.raw;
      def.initialMessages = parsedInitialMessages.messages;
    } catch (err) {
      await openInfoDialog(
        t("invalidInitialMessagesTitle"),
        String(err?.message || t("invalidInitialMessagesMessage")),
      );
      return;
    }
  }

  if (missingNameLanguages.length > 0) {
    await openInfoDialog(
      t("missingFieldTitle"),
      tf("characterNameRequiredAllLanguages", {
        langs: missingNameLanguages.join(", "),
      }),
    );
    return;
  }

  const uiLang = normalizeBotLanguageCode(state.settings.uiLanguage || "en");
  const primaryDef =
    defs.find((d) => d.language === uiLang) ||
    defs.find((d) => !!String(d.name || "").trim()) ||
    defs[0];
  let previousSelectedCardLanguage = "";
  if (state.editingCharacterId) {
    const existingChar = await db.characters.get(state.editingCharacterId);
    previousSelectedCardLanguage = normalizeBotLanguageCode(
      existingChar?.selectedCardLanguage || "",
    );
  }
  const selectedCardLanguage =
    defs.find((d) => d.language === previousSelectedCardLanguage)?.language ||
    defs[0]?.language ||
    "en";
  const selectedLorebookIds = Array.isArray(primaryDef?.lorebookIds)
    ? primaryDef.lorebookIds
    : [];
  const selectedTts = {
    voice: primaryDef?.ttsVoice || DEFAULT_TTS_VOICE,
    language: primaryDef?.ttsLanguage || DEFAULT_TTS_LANGUAGE,
    rate: Math.max(
      0.5,
      Math.min(2, Number(primaryDef?.ttsRate) || DEFAULT_TTS_RATE),
    ),
    pitch: Math.max(0, Math.min(2, Number(primaryDef?.ttsPitch) || 1.1)),
  };

  const payload = {
    name: String(primaryDef?.name || "").trim(),
    tagline: String(primaryDef?.tagline || "").trim(),
    definitions: defs,
    selectedCardLanguage,
    oneTimeExtraPrompt: String(primaryDef?.oneTimeExtraPrompt || "").trim(),
    writingInstructions: String(primaryDef?.writingInstructions || "").trim(),
    writingInstructionId: String(primaryDef?.writingInstructionId || ""),
    initialMessagesRaw: String(primaryDef?.initialMessagesRaw || ""),
    initialMessages: Array.isArray(primaryDef?.initialMessages)
      ? primaryDef.initialMessages
      : [],
    useMemory: document.getElementById("char-use-memory").checked,
    usePostProcessing: document.getElementById("char-use-postprocess").checked,
    autoTriggerAiFirstMessage: document.getElementById(
      "char-auto-trigger-first-ai",
    ).checked,
    personaInjectionPlacement: String(
      primaryDef?.personaInjectionPlacement || "end_system_prompt",
    ),
    avatarScale:
      Number(document.getElementById("char-avatar-scale").value) || 1,
    tags: getCharacterTagsFromModal(),
    ttsVoice: selectedTts.voice,
    ttsLanguage: selectedTts.language,
    ttsRate: selectedTts.rate,
    ttsPitch: selectedTts.pitch,
    preferLoreBooksMatchingLanguage:
      primaryDef?.preferLoreBooksMatchingLanguage !== false,
    lorebookIds: selectedLorebookIds,
    avatar:
      state.charModalAvatars.length > 0 ? state.charModalAvatars[0].data : "",
    avatars:
      state.charModalAvatars.length > 0 ? [...state.charModalAvatars] : [],
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
      const merged = { ...currentCharacter, ...payload };
      currentCharacter = resolveCharacterForLanguage(
        merged,
        currentThread?.characterLanguage || "",
      );
      renderChat();
    }
    showToast(t("characterUpdated"), "success");
  } else {
    payload.createdAt = Date.now();
    const newId = await db.characters.add(payload);
    state.editingCharacterId = newId;
    showToast(t("characterCreated"), "success");
  }

  const pendingThreadDeleteIds = Array.isArray(
    state.charModalPendingThreadDeleteIds,
  )
    ? state.charModalPendingThreadDeleteIds
        .map((id) => Number(id))
        .filter(Number.isInteger)
    : [];
  if (pendingThreadDeleteIds.length > 0) {
    state.generationQueue = state.generationQueue.filter(
      (id) => !pendingThreadDeleteIds.includes(Number(id)),
    );
    await db.threads.bulkDelete(pendingThreadDeleteIds);
    pendingThreadDeleteIds.forEach((id) =>
      state.selectedThreadIds.delete(Number(id)),
    );
    if (
      currentThread &&
      pendingThreadDeleteIds.includes(Number(currentThread.id))
    ) {
      currentThread = null;
      currentCharacter = null;
      conversationHistory = [];
      showMainView();
      updateAutoTtsToggleButton();
    }
  }

  state.charModalPendingThreadDeleteIds = [];
  setModalDirtyState("character-modal", false);
  await renderAll();
  if (close) {
    if (state.editingCharacterId) {
      localStorage.setItem(
        `rp-char-modal-last-lang-${state.editingCharacterId}`,
        state.charModalActiveLanguage,
      );
    }
    closeActiveModal();
  }
  return true;
}

async function applyCharacterFromModal() {
  return saveCharacterFromModal({ close: false });
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

async function populateCharWritingInstructionsSelect(preferredId = "") {
  const select = document.getElementById("char-writing-instructions-select");
  const textarea = document.getElementById("char-writing-instructions");
  if (!select || !textarea) return;
  const currentLang =
    state.charModalActiveLanguage || state.settings.interfaceLanguage || "en";
  const allWi = await getAllWritingInstructions();
  const matchingWi = allWi.filter(
    (wi) => wi.instructions && wi.instructions[currentLang],
  );
  select.innerHTML = "";
  const noneOpt = document.createElement("option");
  noneOpt.value = "none";
  noneOpt.textContent = t("writingInstructionsNone");
  select.appendChild(noneOpt);
  const customOpt = document.createElement("option");
  customOpt.value = "";
  customOpt.textContent = t("customInstructions");
  select.appendChild(customOpt);
  matchingWi.forEach((wi) => {
    const opt = document.createElement("option");
    opt.value = String(wi.id);
    opt.textContent = wi.name || `Writing Instruction #${wi.id}`;
    select.appendChild(opt);
  });
  const hasPreferred = matchingWi.some((wi) => String(wi.id) === preferredId);
  const isCustomPreferred = preferredId === "";
  if (isCustomPreferred) {
    select.value = "";
  } else if (hasPreferred) {
    select.value = preferredId;
  } else {
    select.value = "none";
  }
  updateCharWritingInstructionsVisibility();
}

function updateCharWritingInstructionsVisibility() {
  const select = document.getElementById("char-writing-instructions-select");
  const textarea = document.getElementById("char-writing-instructions");
  if (!select || !textarea) return;
  const isCustom = !select.value;
  const collapse = textarea.closest(".textarea-collapse");
  if (collapse) {
    collapse.classList.toggle("hidden", !isCustom);
    const header = collapse.querySelector(".textarea-collapse-header");
    const body = collapse.querySelector(".textarea-collapse-body");
    if (header) {
      header.setAttribute("aria-expanded", isCustom ? "true" : "false");
      const icon = header.querySelector(".textarea-collapse-icon");
      if (icon) icon.textContent = isCustom ? "▴" : "▾";
    }
    if (body) {
      body.classList.toggle("collapsed", !isCustom);
    }
  } else {
    textarea.classList.toggle("hidden", !isCustom);
  }
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
  const rate = Math.max(
    0.5,
    Math.min(2, Number(rateInput) || DEFAULT_TTS_RATE),
  );
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

function getCharModalActiveLanguage() {
  const rawLanguage =
    state.charModalActiveLanguage ||
    getActiveCharacterDefinition()?.language ||
    DEFAULT_TTS_LANGUAGE;
  return normalizeBotLanguageCode(rawLanguage || "") || DEFAULT_TTS_LANGUAGE;
}

function refreshCharTtsProviderFields() {
  const providerSelect = document.getElementById("char-tts-provider");
  const kokoroConfig = document.getElementById("char-tts-kokoro-config");
  const modalLanguage = getCharModalActiveLanguage();
  const kokoroSupport = isKokoroSupportedForLanguage(modalLanguage);
  const kokoroOption = providerSelect?.querySelector('option[value="kokoro"]');
  if (kokoroOption) kokoroOption.disabled = !kokoroSupport;
  const kokoroDevice = document.getElementById("char-tts-kokoro-device");
  const kokoroDeviceValue = kokoroDevice?.value || "webgpu";
  updateKokoroDtypeOptionsForDevice(kokoroDeviceValue);
  let isKokoro = providerSelect?.value === "kokoro";
  if (!kokoroSupport && providerSelect) {
    providerSelect.value = "browser";
    isKokoro = false;
  }
  kokoroConfig?.classList.toggle("hidden", !isKokoro);
  ["char-tts-language", "char-tts-voice"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = isKokoro;
  });
  const pitch = document.getElementById("char-tts-pitch");
  if (pitch) pitch.disabled = isKokoro;
  document.querySelectorAll(".tts-extra-field").forEach((field) => {
    field.classList.toggle("hidden", isKokoro);
    field.style.display = isKokoro ? "none" : "";
  });
  const kokoroVoice = document.getElementById("char-tts-kokoro-voice");
  if (isKokoro) {
    if (!kokoroSupport) {
      setKokoroVoiceLoadingPlaceholder();
      if (providerSelect) providerSelect.value = "browser";
      return;
    }
    const preferred = kokoroVoice?.value || DEFAULT_KOKORO_VOICE;
    if (state.tts.kokoro.voiceListLoaded) {
      populateKokoroVoiceSelect(preferred, modalLanguage);
    } else {
      setKokoroVoiceLoadingPlaceholder();
      populateKokoroVoiceSelect(preferred, modalLanguage);
    }
    if (kokoroVoice) {
      kokoroVoice.disabled = state.charModalTtsTestPlaying === true;
    }
  } else if (kokoroVoice) {
    kokoroVoice.disabled = true;
  }
  moveCharModalTtsTestButton(isKokoro ? "kokoro" : "tts");
}

function getAvailableKokoroDtypeOptions(device = "webgpu") {
  const normalized = String(device || "webgpu")
    .trim()
    .toLowerCase();
  return KOKORO_DTYPE_OPTIONS.filter((dtype) => {
    if (normalized === "webgpu" && dtype === "fp16") return false;
    return true;
  });
}

function updateKokoroDtypeOptionsForDevice(
  device = "webgpu",
  preferred = null,
) {
  const select = document.getElementById("char-tts-kokoro-dtype");
  if (!select) return;
  const allowed = getAvailableKokoroDtypeOptions(device);
  if (allowed.length === 0) return;
  const previous = String(preferred || select.value || "").trim();
  select.innerHTML = "";
  allowed.forEach((dtype) => {
    const option = document.createElement("option");
    option.value = dtype;
    option.textContent = KOKORO_DTYPE_LABELS[dtype] || dtype;
    select.appendChild(option);
  });
  select.value = allowed.includes(previous) ? previous : allowed[0];
}

function getCharModalTtsProviderSelection() {
  const select = document.getElementById("char-tts-provider");
  return select?.value === "kokoro" ? "kokoro" : "browser";
}

function moveCharModalTtsTestButton(target = "tts") {
  const btn = document.getElementById("char-tts-test-btn");
  if (!btn) return;
  const slot = document.querySelector(`.tts-test-slot[data-slot="${target}"]`);
  if (slot) slot.appendChild(btn);
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

  const defaultPersona = await getCharacterDefaultPersona();
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
    : await getCharacterDefaultPersona();
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
  const avatarSrc = currentPersona?.avatar instanceof Blob
    ? getCachedAvatarBlobUrl(currentPersona.avatar)
    : currentPersona?.avatar || fallbackAvatar(name, 512, 512);
  img.src = avatarSrc;
  img.alt = `${name} avatar`;
}

async function savePersonaFromModal() {
  const personas = await getOrderedPersonas();
  const name = document.getElementById("persona-name").value.trim();
  const avatar = state.currentPersonaAvatarBlob || document.getElementById("persona-avatar").value.trim();
  const description = document
    .getElementById("persona-description")
    .value.trim();
  const internalDescription = document
    .getElementById("persona-internal-description")
    .value.trim();
  const wantsDefault = document.getElementById("persona-is-default").checked;

  if (!name) {
    await openInfoDialog(t("missingFieldTitle"), t("personaNameRequired"));
    return false;
  }
  if (description.length > 100) {
    await openInfoDialog(
      t("personaDescriptionTitle"),
      t("personaDescriptionLimit"),
    );
    return false;
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
  updateNameLengthCounter(
    "persona-description",
    "persona-description-count",
    100,
  );
  document.getElementById("persona-is-default").checked = false;
  state.editingPersonaId = null;
  state.currentPersonaAvatarBlob = null;
  document.getElementById("save-persona-btn").textContent = t("savePersona");
  state.modalDirty["personas-modal"] = false;

  await ensurePersonasInitialized();
  await renderPersonaModalList();
  await renderPersonaSelector();
  broadcastSyncEvent({ type: "personas-updated" });
  return true;
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
    avatar.className = "persona-avatar";
    avatar.src = persona.avatar instanceof Blob
      ? getCachedAvatarBlobUrl(persona.avatar)
      : persona.avatar || fallbackAvatar(persona.name || "P", 512, 512);
    avatar.alt = "persona avatar";
    avatar.classList.add("clickable-avatar");
    avatar.addEventListener("click", (e) => {
      e.stopPropagation();
      openImagePreview(avatar.src);
    });

    const info = document.createElement("div");
    info.className = "persona-info";
    const title = document.createElement("div");
    title.className = "persona-title";
    title.textContent = `${persona.name}${persona.isDefault ? ` (${t("defaultSuffix")})` : ""}`;
    const desc = document.createElement("div");
    desc.className = "persona-meta";
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
    const deleteBtn = iconButton(
      "delete",
      t("deletePersonaTitle"),
      async () => {
        await deletePersona(persona.id);
      },
    );
    deleteBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteBtn);

    row.append(drag, avatar, info, actions);
    list.appendChild(row);
  });
}

async function deletePersona(personaId) {
  const ok = await openConfirmDialog(
    t("deletePersonaTitle"),
    t("deletePersonaConfirm"),
  );
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
  state.currentPersonaAvatarBlob = null;
  document.getElementById("persona-name").value = persona.name || "";
  updateNameLengthCounter("persona-name", "persona-name-count", 64);
  if (persona.avatar instanceof Blob) {
    document.getElementById("persona-avatar").value = getCachedAvatarBlobUrl(persona.avatar);
  } else {
    document.getElementById("persona-avatar").value = persona.avatar || "";
  }
  document.getElementById("persona-avatar-file").value = "";
  document.getElementById("persona-description").value =
    persona.description || "";
  document.getElementById("persona-internal-description").value =
    persona.internalDescription || "";
  updateNameLengthCounter(
    "persona-description",
    "persona-description-count",
    100,
  );
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

async function getCharacterDefaultPersona() {
  return getDefaultPersona();
}
window.getCharacterDefaultPersona = getCharacterDefaultPersona;

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

  state.currentPersonaAvatarBlob = file;
  const previewUrl = URL.createObjectURL(file);
  document.getElementById("persona-avatar").value = previewUrl;
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
      (v, i, arr) =>
        arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i,
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
    secondaryKeys: secondaryKeys
      .map((k) => normalizeTagValue(k))
      .filter(Boolean),
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
    tokenBudget: Math.max(
      100,
      Math.min(1000, Number(record.tokenBudget) || 200),
    ),
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
  document.getElementById("lore-description").value =
    normalized?.description || "";
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
  setupModalTextareas(root);
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
    const users = characters.filter(
      (char) =>
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
            window.setTimeout(
              () => target.classList.remove("char-lore-focus"),
              1400,
            );
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
    const deleteBtn = iconButton(
      "delete",
      t("deleteLoreBookAria"),
      async () => {
        await deleteLorebook(lorebook.id);
      },
    );
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
  const avatar = String(
    document.getElementById("lore-avatar")?.value || "",
  ).trim();
  const scanDepth = Math.max(
    5,
    Math.min(
      100,
      Number(document.getElementById("lore-scan-depth")?.value) || 50,
    ),
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
    if (
      !entry.content ||
      entry.content.length < 1 ||
      entry.content.length > 10480
    ) {
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
  if (!payload) return false;
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
  return true;
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
  const affected = allCharacters.filter(
    (char) =>
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

let state_writingInstructions = {
  editingId: null,
  definitions: [],
  activeLanguage: "",
};

async function getAllWritingInstructions() {
  return await db.writingInstructions.orderBy("id").toArray();
}

function normalizeWritingInstructionRecord(wi) {
  if (!wi) return null;
  return {
    id: Number(wi.id) || null,
    name: String(wi.name || "").trim(),
    instructions:
      typeof wi.instructions === "object" && wi.instructions !== null
        ? wi.instructions
        : {},
    createdAt: Number(wi.createdAt) || Date.now(),
    updatedAt: Number(wi.updatedAt) || Date.now(),
  };
}

async function openWritingInstructionsManager() {
  await renderWritingInstructionsList();
}

async function renderWritingInstructionsList() {
  const list = document.getElementById("writing-instructions-list");
  if (!list) return;
  list.innerHTML = "";
  const writingInstructions = await getAllWritingInstructions();
  if (writingInstructions.length === 0) {
    list.innerHTML = `<p class="muted" data-i18n="noWritingInstructionsYet">No writing instructions yet.</p>`;
    return;
  }
  for (const wi of writingInstructions) {
    const row = document.createElement("div");
    row.className = "lorebook-row";
    const avatar = document.createElement("div");
    avatar.className = "lorebook-avatar";
    avatar.style.display = "flex";
    avatar.style.alignItems = "center";
    avatar.style.justifyContent = "center";
    avatar.style.background = "#253147";
    avatar.style.fontSize = "20px";
    avatar.textContent = "WI";
    const main = document.createElement("div");
    main.className = "lorebook-main";
    const title = document.createElement("div");
    title.className = "lorebook-title";
    title.textContent = wi.name || "Untitled";
    const meta = document.createElement("div");
    meta.className = "lorebook-meta";
    meta.style.display = "flex";
    meta.style.gap = "4px";
    const langs = Object.keys(wi.instructions || {});
    langs.forEach((lang) => {
      const flag = createLanguageFlagIconElement(lang);
      meta.appendChild(flag);
    });
    main.appendChild(title);
    main.appendChild(meta);
    const actions = document.createElement("div");
    actions.className = "lorebook-actions";
    actions.appendChild(
      iconButton("edit", t("editWritingInstructionAria"), () =>
        openWritingInstructionEditor(wi),
      ),
    );
    actions.appendChild(
      iconButton("copy", t("duplicateWritingInstructionAria"), async () => {
        await duplicateWritingInstruction(wi.id);
      }),
    );
    actions.appendChild(
      iconButton("export", t("exportWritingInstructionAria"), async () => {
        await exportWritingInstruction(wi.id);
      }),
    );
    const deleteBtn = iconButton(
      "delete",
      t("deleteWritingInstructionAria"),
      async () => {
        await deleteWritingInstruction(wi.id);
      },
    );
    deleteBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteBtn);
    row.append(avatar, main, actions);
    list.appendChild(row);
  }
}

async function openWritingInstructionEditor(writingInstruction = null) {
  setModalDirtyState("writing-instruction-editor-modal", false);
  const normalized = normalizeWritingInstructionRecord(
    writingInstruction || {},
  );
  state_writingInstructions.editingId = normalized.id || null;
  const interfaceLang = state.settings.interfaceLanguage || "en";
  if (
    !normalized.instructions ||
    Object.keys(normalized.instructions).length === 0
  ) {
    state_writingInstructions.definitions = [
      { language: interfaceLang, instructions: "" },
    ];
  } else {
    state_writingInstructions.definitions = Object.entries(
      normalized.instructions,
    ).map(([language, instructions]) => ({
      language,
      instructions: instructions || "",
    }));
  }
  state_writingInstructions.activeLanguage =
    state_writingInstructions.definitions[0]?.language || interfaceLang;
  document.getElementById("writing-instruction-name").value =
    normalized.name || "";
  updateWritingInstructionNameCount();
  renderWritingInstructionTabs();
  loadActiveWritingInstructionToForm();
  const editorModal = document.getElementById(
    "writing-instruction-editor-modal",
  );
  if (editorModal) {
    editorModal.classList.remove("hidden");
    state.activeModalId = "writing-instruction-editor-modal";
  }
}

function renderWritingInstructionTabs() {
  const root = document.getElementById("writing-instruction-tabs-left");
  if (!root) return;
  root.innerHTML = "";
  if (
    !state_writingInstructions.definitions ||
    state_writingInstructions.definitions.length === 0
  )
    return;
  state_writingInstructions.definitions.forEach((def) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "settings-tab-btn char-def-tab-btn";
    if (def.language === state_writingInstructions.activeLanguage) {
      btn.classList.add("active");
    }
    const label = document.createElement("span");
    label.className = "char-def-tab-label";
    const flag = createLanguageFlagIconElement(
      def.language,
      "char-def-tab-flag",
    );
    const text = document.createElement("span");
    text.textContent = def.language;
    label.append(flag, text);
    btn.appendChild(label);
    btn.addEventListener("click", () => {
      saveActiveWritingInstructionFromForm();
      state_writingInstructions.activeLanguage = def.language;
      loadActiveWritingInstructionToForm();
      renderWritingInstructionTabs();
    });
    const del = document.createElement("button");
    del.type = "button";
    del.className = "char-def-tab-delete";
    del.textContent = "x";
    del.disabled = state_writingInstructions.definitions.length <= 1;
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (state_writingInstructions.definitions.length <= 1) {
        await openInfoDialog(t("message"), t("languageRequired"));
        return;
      }
      const ok = await openConfirmDialog(
        t("removeLanguageTitle"),
        t("removeLanguageConfirm", { lang: def.language }),
      );
      if (!ok) return;
      saveActiveWritingInstructionFromForm();
      state_writingInstructions.definitions =
        state_writingInstructions.definitions.filter(
          (x) => x.language !== def.language,
        );
      if (state_writingInstructions.activeLanguage === def.language) {
        state_writingInstructions.activeLanguage =
          state_writingInstructions.definitions[0]?.language || "";
      }
      loadActiveWritingInstructionToForm();
      renderWritingInstructionTabs();
    });
    btn.appendChild(del);
    root.appendChild(btn);
  });
}

function getActiveWritingInstructionDefinition() {
  return state_writingInstructions.definitions.find(
    (d) => d.language === state_writingInstructions.activeLanguage,
  );
}

function saveActiveWritingInstructionFromForm() {
  const def = getActiveWritingInstructionDefinition();
  if (!def) return;
  def.instructions = String(
    document.getElementById("writing-instruction-text")?.value || "",
  ).trim();
}

function loadActiveWritingInstructionToForm() {
  const def = getActiveWritingInstructionDefinition();
  const textField = document.getElementById("writing-instruction-text");
  if (textField && def) {
    textField.value = def.instructions || "";
    textField.style.height = "auto";
    textField.style.height = textField.scrollHeight + "px";
    updateWritingInstructionTextCount();
  } else if (textField) {
    textField.value = "";
    textField.style.height = "auto";
    textField.style.height = textField.scrollHeight + "px";
    updateWritingInstructionTextCount();
  }
  updateSaveWritingInstructionButton();
}

function updateWritingInstructionNameCount() {
  const nameInput = document.getElementById("writing-instruction-name");
  const countSpan = document.getElementById("writing-instruction-name-count");
  if (nameInput && countSpan) {
    countSpan.textContent = `${nameInput.value.length}/64`;
  }
}

function updateWritingInstructionTextCount() {
  const textInput = document.getElementById("writing-instruction-text");
  const countSpan = document.getElementById("writing-instruction-text-count");
  if (textInput && countSpan) {
    countSpan.textContent = `${textInput.value.length}/20480`;
  }
}

function updateSaveWritingInstructionButton() {
  const saveBtn = document.getElementById("save-writing-instructions-btn");
  if (!saveBtn) return;
  const name = String(
    document.getElementById("writing-instruction-name")?.value || "",
  ).trim();
  const hasAllContent = state_writingInstructions.definitions.every(
    (d) => String(d.instructions || "").trim().length > 0,
  );
  const isDirty = !!state.modalDirty["writing-instruction-editor-modal"];
  saveBtn.disabled = !name || !hasAllContent || !isDirty;
}

async function saveWritingInstruction({ close = true } = {}) {
  saveActiveWritingInstructionFromForm();
  const name = String(
    document.getElementById("writing-instruction-name")?.value || "",
  ).trim();
  if (!name) {
    await openInfoDialog(t("missingFieldTitle"), t("nameRequired"));
    return false;
  }
  const hasAllContent = state_writingInstructions.definitions.every(
    (d) => String(d.instructions || "").trim().length > 0,
  );
  if (!hasAllContent) {
    await openInfoDialog(
      t("missingFieldTitle"),
      t("writingInstructionsRequired"),
    );
    return false;
  }
  const instructions = {};
  state_writingInstructions.definitions.forEach((d) => {
    instructions[d.language] = d.instructions;
  });
  const payload = {
    name,
    instructions,
    updatedAt: Date.now(),
  };
  if (state_writingInstructions.editingId) {
    await db.writingInstructions.update(
      state_writingInstructions.editingId,
      payload,
    );
    showToast(t("writingInstructionUpdated"), "success");
  } else {
    payload.createdAt = Date.now();
    await db.writingInstructions.add(payload);
    showToast(t("writingInstructionCreated"), "success");
  }
  setModalDirtyState("writing-instruction-editor-modal", false);
  await renderWritingInstructionsList();
  if (close) {
    closeActiveModal();
    const parentModal = document.getElementById("writing-instructions-modal");
    if (parentModal) {
      parentModal.classList.remove("hidden");
      state.activeModalId = "writing-instructions-modal";
    }
  }
  return true;
}

async function duplicateWritingInstruction(writingInstructionId) {
  const source = await db.writingInstructions.get(writingInstructionId);
  if (!source) return;
  const copy = {
    name: `${source.name} (copy)`,
    instructions: { ...source.instructions },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.writingInstructions.add(copy);
  await renderWritingInstructionsList();
  showToast(t("writingInstructionDuplicated"), "success");
}

async function deleteWritingInstruction(writingInstructionId) {
  const wi = normalizeWritingInstructionRecord(
    await db.writingInstructions.get(writingInstructionId),
  );
  if (!wi) return;
  const ok = await openConfirmDialog(
    t("deleteWritingInstructionTitle"),
    t("deleteWritingInstructionConfirm", { name: wi.name }),
  );
  if (!ok) return;
  await db.writingInstructions.delete(writingInstructionId);
  await renderWritingInstructionsList();
  showToast(t("writingInstructionDeleted"), "success");
}

async function exportWritingInstruction(writingInstructionId) {
  const wi = normalizeWritingInstructionRecord(
    await db.writingInstructions.get(writingInstructionId),
  );
  if (!wi) return;
  const interfaceLang = state.settings.interfaceLanguage || "en";
  const content =
    wi.instructions[interfaceLang] || Object.values(wi.instructions)[0] || "";
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${wi.name.replace(/[^a-z0-9]/gi, "_")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t("writingInstructionExported"), "success");
}

function openWritingInstructionLanguageModal() {
  const select = document.getElementById("writing-instruction-language-select");
  if (!select) return;
  const usedLanguages = new Set(
    state_writingInstructions.definitions.map((d) => d.language),
  );
  select.innerHTML = "";
  BOT_LANGUAGE_OPTIONS.filter((code) => !usedLanguages.has(code)).forEach(
    (code) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = getBotLanguageName(code);
      select.appendChild(opt);
    },
  );
  document
    .getElementById("writing-instruction-language-modal")
    ?.classList.remove("hidden");
}

function closeWritingInstructionLanguageModal() {
  document
    .getElementById("writing-instruction-language-modal")
    ?.classList.add("hidden");
}

async function addWritingInstructionLanguage() {
  const select = document.getElementById("writing-instruction-language-select");
  const lang = select?.value;
  if (!lang) return;
  saveActiveWritingInstructionFromForm();
  state_writingInstructions.definitions.push({
    language: lang,
    instructions: "",
  });
  state_writingInstructions.activeLanguage = lang;
  closeWritingInstructionLanguageModal();
  loadActiveWritingInstructionToForm();
  renderWritingInstructionTabs();
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

function normalizeWritingInstructionsTiming(value) {
  const v = String(value || "always").toLowerCase();
  if (
    v === "always" ||
    v === "every_other" ||
    v === "every_second" ||
    v === "every_third" ||
    v === "every_fourth"
  ) {
    return v;
  }
  return "always";
}

let state_assets = {
  editingId: null,
  currentFile: null,
  currentFileData: null,
  currentFileType: null,
  currentFileName: null,
  audioElement: null,
};

function createBlobUrl(blob) {
  return blob ? URL.createObjectURL(blob) : "";
}

function getCachedAvatarBlobUrl(blob) {
  if (!blob) return "";
  if (state.avatarBlobUrlCache.has(blob)) {
    return state.avatarBlobUrlCache.get(blob);
  }
  const url = URL.createObjectURL(blob);
  state.avatarBlobUrlCache.set(blob, url);
  return url;
}

function revokeBlobUrl(url) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function getAssetTypeFromMime(mime) {
  if (!mime) return "sound";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "sound";
  return "sound";
}

function getAssetTypeLabel(type) {
  switch (type) {
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "sound":
      return "Sound";
    default:
      return "Unknown";
  }
}

function getAssetTypeIcon(type) {
  switch (type) {
    case "image":
      return "&#128444;";
    case "video":
      return "&#127909;";
    case "sound":
      return "&#127925;";
    default:
      return "&#128190;";
  }
}

async function getAllAssets() {
  return db.assets.toArray();
}

async function getAssetById(id) {
  return db.assets.get(Number(id));
}

async function deleteAsset(id) {
  await db.assets.delete(Number(id));
}

async function saveAsset(asset) {
  if (asset.id) {
    await db.assets.put(asset);
    return asset.id;
  } else {
    return await db.assets.add(asset);
  }
}

async function openAssetsManager() {
  setModalDirtyState("assets-modal", false);
  renderAssetsList();
  setupAssetsDropzone();
}

async function renderAssetsList() {
  const list = document.getElementById("assets-list");
  if (!list) return;
  list.innerHTML = "";
  const assets = await getAllAssets();

  if (assets.length === 0) {
    list.innerHTML = `<p class="muted" data-i18n="noAssetsYet">No assets yet.</p>`;
    return;
  }

  for (const asset of assets) {
    const row = document.createElement("div");
    row.className = "lorebook-row asset-row";

    const avatar = document.createElement("div");
    avatar.className = "lorebook-avatar";

    if (asset.type === "image" && asset.data) {
      const img = document.createElement("img");
      img.src = asset.data instanceof Blob ? URL.createObjectURL(asset.data) : asset.data;
      img.alt = asset.name || "Asset";
      avatar.appendChild(img);
    } else if (asset.type === "video" && asset.data) {
      const video = document.createElement("video");
      video.src = asset.data instanceof Blob ? URL.createObjectURL(asset.data) : asset.data;
      video.muted = true;
      const thumb = document.createElement("img");
      thumb.src = asset.thumbnail || "";
      thumb.alt = asset.name || "Asset";
      if (!asset.thumbnail) {
        avatar.innerHTML = `<span class="asset-type-icon">${getAssetTypeIcon(asset.type)}</span>`;
      } else {
        avatar.appendChild(thumb);
      }
    } else if (asset.type === "sound" && asset.data) {
      avatar.innerHTML = `<span class="asset-type-icon">${getAssetTypeIcon(asset.type)}</span>`;
    } else {
      avatar.innerHTML = `<span class="asset-type-icon">${getAssetTypeIcon(asset.type)}</span>`;
    }

    const main = document.createElement("div");
    main.className = "lorebook-main";

    const title = document.createElement("div");
    title.className = "lorebook-title";
    title.textContent = asset.name || asset.originalName || "Untitled";

    const meta = document.createElement("div");
    meta.className = "lorebook-meta";
    const typeSpan = document.createElement("span");
    typeSpan.textContent = getAssetTypeLabel(asset.type);
    typeSpan.style.fontSize = "11px";
    meta.appendChild(typeSpan);

    main.appendChild(title);
    main.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "lorebook-actions";

    const editBtn = iconButton("edit", t("editAssetAria") || "Edit", () => {
      openAssetEditor(asset);
    });
    actions.appendChild(editBtn);

    const downloadBtn = iconButton(
      "export",
      t("downloadAssetAria") || "Download",
      () => {
        downloadAsset(asset);
      },
    );
    actions.appendChild(downloadBtn);

    const deleteBtn = iconButton(
      "delete",
      t("deleteAssetAria") || "Delete",
      async () => {
        const ok = await openConfirmDialog(
          t("deleteAssetTitle"),
          tf("deleteAssetConfirm", {
            name: asset.name || asset.originalName || "Untitled",
          }),
        );
        if (!ok) return;
        await deleteAsset(asset.id);
        await renderAssetsList();
      },
    );
    deleteBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteBtn);

    row.append(avatar, main, actions);
    list.appendChild(row);
  }
}

function setupAssetsDropzone() {
  const dropzone = document.getElementById("assets-dropzone");
  const fileInput = document.getElementById("assets-file-input");

  if (!dropzone || !fileInput) return;

  dropzone.onclick = () => fileInput.click();

  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-over");
  };

  dropzone.ondragleave = () => {
    dropzone.classList.remove("drag-over");
  };

  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleAssetFiles(files);
    }
  };

  fileInput.onchange = () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleAssetFiles(fileInput.files);
    }
    fileInput.value = "";
  };
}

async function handleAssetFiles(files) {
  for (const file of files) {
    state_assets.currentFile = file;
    state_assets.currentFileData = file;
    state_assets.currentFileType = getAssetTypeFromMime(file.type);
    state_assets.currentFileName = file.name;
    state_assets.editingId = null;

    openAssetEditor(null);
  }
}

async function openAssetEditor(asset = null) {
  setModalDirtyState("asset-editor-modal", false);

  const nameInput = document.getElementById("asset-name");
  const originalNameInput = document.getElementById("asset-original-name");
  const typeInput = document.getElementById("asset-type");
  const previewContainer = document.getElementById("asset-preview-container");
  const audioControls = document.getElementById("asset-audio-controls");
  const nameCount = document.getElementById("asset-name-count");

  if (state_assets.audioElement) {
    state_assets.audioElement.pause();
    state_assets.audioElement = null;
  }

  if (asset) {
    state_assets.editingId = asset.id;
    state_assets.currentFileData = asset.data;
    state_assets.currentFileType = asset.type;
    state_assets.currentFileName = asset.originalName;

    nameInput.value = asset.name || "";
    originalNameInput.value = asset.originalName || "";
    typeInput.value = getAssetTypeLabel(asset.type);
  } else {
    state_assets.editingId = null;
    nameInput.value = "";
    originalNameInput.value = state_assets.currentFileName || "";
    typeInput.value = getAssetTypeLabel(
      state_assets.currentFileType || "sound",
    );
  }

  if (nameCount) {
    nameCount.textContent = `${(nameInput.value || "").length}/128`;
  }

  previewContainer.innerHTML = "";
  audioControls.classList.add("hidden");

  if (
    state_assets.currentFileType === "image" &&
    state_assets.currentFileData
  ) {
    const img = document.createElement("img");
    img.src = state_assets.currentFileData instanceof Blob
      ? URL.createObjectURL(state_assets.currentFileData)
      : state_assets.currentFileData;
    previewContainer.appendChild(img);
  } else if (
    state_assets.currentFileType === "video" &&
    state_assets.currentFileData
  ) {
    const video = document.createElement("video");
    video.src = state_assets.currentFileData instanceof Blob
      ? URL.createObjectURL(state_assets.currentFileData)
      : state_assets.currentFileData;
    video.controls = true;
    video.muted = true;
    previewContainer.appendChild(video);
  } else if (
    state_assets.currentFileType === "sound" &&
    state_assets.currentFileData
  ) {
    audioControls.classList.remove("hidden");
    const audio = document.createElement("audio");
    audio.src = state_assets.currentFileData instanceof Blob
      ? URL.createObjectURL(state_assets.currentFileData)
      : state_assets.currentFileData;
    state_assets.audioElement = audio;

    const audioPlayer = document.createElement("div");
    audioPlayer.className = "asset-preview-container";
    audioPlayer.style.width = "100%";
    const audioInfo = document.createElement("span");
    audioInfo.className = "muted";
    audioInfo.textContent = state_assets.currentFileName || "Audio file";
    audioPlayer.appendChild(audioInfo);
    previewContainer.appendChild(audioPlayer);
  }

  nameInput.oninput = () => {
    if (nameCount) {
      nameCount.textContent = `${(nameInput.value || "").length}/128`;
    }
    setModalDirtyState("asset-editor-modal", true);
  };

  const applyBtn = document.getElementById("apply-asset-editor-btn");
  const saveBtn = document.getElementById("save-asset-editor-btn");

  const cancelBtn = document.getElementById("cancel-asset-btn");
  const handleCancel = () => {
    if (state_assets.audioElement) {
      state_assets.audioElement.pause();
      state_assets.audioElement = null;
    }
    setModalDirtyState("asset-editor-modal", false);
    closeModal("asset-editor-modal");
  };

  cancelBtn.onclick = handleCancel;

  applyBtn.onclick = async () => {
    await saveAssetFromEditor();
  };

  saveBtn.onclick = async () => {
    await saveAssetFromEditor();
  };

  const playBtn = document.getElementById("asset-play-btn");
  const pauseBtn = document.getElementById("asset-pause-btn");
  const stopBtn = document.getElementById("asset-stop-btn");

  playBtn.onclick = () => {
    if (state_assets.audioElement) {
      state_assets.audioElement.play();
    }
  };

  pauseBtn.onclick = () => {
    if (state_assets.audioElement) {
      state_assets.audioElement.pause();
    }
  };

  stopBtn.onclick = () => {
    if (state_assets.audioElement) {
      state_assets.audioElement.pause();
      state_assets.audioElement.currentTime = 0;
    }
  };

  openModal("asset-editor-modal");
}

async function saveAssetFromEditor() {
  const nameInput = document.getElementById("asset-name");
  const originalNameInput = document.getElementById("asset-original-name");
  const typeInput = document.getElementById("asset-type");

  const asset = {
    id: state_assets.editingId || undefined,
    name: nameInput.value.trim() || null,
    originalName: originalNameInput.value,
    type: state_assets.currentFileType,
    data: state_assets.currentFileData,
    createdAt: state_assets.editingId ? undefined : Date.now(),
    updatedAt: Date.now(),
  };

  const savedId = await saveAsset(asset);

  if (!state_assets.editingId && savedId) {
    state_assets.editingId = savedId;
  }

  if (state_assets.audioElement) {
    state_assets.audioElement.pause();
    state_assets.audioElement = null;
  }

  setModalDirtyState("asset-editor-modal", false);
  closeModal("asset-editor-modal");
  await renderAssetsList();

  return true;
}

function downloadAsset(asset) {
  if (!asset.data) return;

  const link = document.createElement("a");
  link.href = asset.data instanceof Blob
    ? URL.createObjectURL(asset.data)
    : asset.data;
  link.download = asset.name || asset.originalName || "asset";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getThreadWritingInstructionsTurnCount(thread = currentThread) {
  const raw = Number(thread?.writingInstructionsTurnCount);
  if (Number.isInteger(raw) && raw >= 0) return raw;
  return 0;
}

function getNextWritingInstructionsTurnIndex(thread = currentThread) {
  return getThreadWritingInstructionsTurnCount(thread) + 1;
}

function shouldInjectWritingInstructionsForTurn(turnIndex) {
  const mode = normalizeWritingInstructionsTiming(
    state.settings.writingInstructionsInjectionWhen,
  );
  const turn = Math.max(1, Number(turnIndex) || 1);
  if (mode === "always") return true;
  if (mode === "every_other") return turn % 2 === 1;
  if (mode === "every_second") return turn % 2 === 0;
  if (mode === "every_third") return turn % 3 === 0;
  if (mode === "every_fourth") return turn % 4 === 0;
  return true;
}

function isLatestAssistantMessageIndex(index, history = conversationHistory) {
  const list = Array.isArray(history) ? history : [];
  const latest = list
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => normalizeApiRole(m?.apiRole || m?.role) === "assistant")
    .pop();
  return latest ? latest.i === index : false;
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

const MAX_AVATAR_SIZE_MB = 10;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
];

function setupCharAvatarDropzone() {
  const dropzone = document.getElementById("char-avatar-dropzone");
  const fileInput = document.getElementById("char-avatar-file-input");
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const tempInput = document.createElement("input");
    tempInput.type = "file";
    tempInput.accept = "image/*,video/mp4";
    tempInput.multiple = true;
    tempInput.style.position = "fixed";
    tempInput.style.top = "0";
    tempInput.style.left = "0";
    tempInput.style.opacity = "0";
    document.body.appendChild(tempInput);

    tempInput.addEventListener("change", (event) => {
      if (event.target.files && event.target.files.length > 0) {
        handleAvatarFiles(event.target.files);
      }
      document.body.removeChild(tempInput);
    });

    tempInput.click();
  });

  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      // Trigger click on the dropzone
      dropzone.click();
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-over");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("drag-over");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove("drag-over");
    const files = e.dataTransfer?.files;
    if (files) handleAvatarFiles(files);
  });

  fileInput.addEventListener("change", (e) => {
    const files = e.target.files;
    if (files) handleAvatarFiles(files);
    fileInput.value = "";
  });
}

function triggerAvatarFileSelect() {
  console.log("triggerAvatarFileSelect called");
  const fileInput = document.getElementById("char-avatar-file-input");
  console.log("fileInput:", fileInput);
  if (fileInput) fileInput.click();
}

window.triggerAvatarFileSelect = triggerAvatarFileSelect;

async function handleAvatarFiles(files) {
  for (const file of files) {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      openInfoDialog(
        t("invalidFileTitle"),
        "Please choose an image or MP4 video file.",
      );
      continue;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      openInfoDialog(
        t("invalidFileTitle"),
        `File must be less than ${MAX_AVATAR_SIZE_MB}MB.`,
      );
      continue;
    }
    await addAvatarFromFile(file);
  }
}

function addAvatarFromFile(file) {
  return new Promise((resolve) => {
    const avatarType = file.type.startsWith("video") ? "video" : "image";
    state.charModalAvatars.push({
      type: avatarType,
      data: file,
      name: file.name,
    });
    setModalDirtyState("character-modal", true);
    renderCharAvatars();
    resolve();
  });
}

function renderCharAvatars() {
  const container = document.getElementById("char-avatars-container");
  if (!container) return;

  container.innerHTML = "";
  container.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  state.charModalAvatars.forEach((avatar, index) => {
    const item = document.createElement("div");
    item.className = "char-avatar-item" + (index === 0 ? " is-main" : "");
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    const avatarSrc = avatar.data instanceof Blob ? getCachedAvatarBlobUrl(avatar.data) : avatar.data;
    if (avatar.type === "video") {
      const video = document.createElement("video");
      video.src = avatarSrc;
      video.muted = true;
      video.loop = true;
      video.preload = "metadata";
      video.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openVideoPreview(avatarSrc);
      });
      video.addEventListener("mousedown", (e) => e.preventDefault());
      item.addEventListener("mouseenter", () => {
        video.play().catch(() => {});
      });
      item.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
      });
      item.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = avatarSrc;
      img.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openImagePreview(avatarSrc);
      });
      img.addEventListener("mousedown", (e) => e.preventDefault());
      item.appendChild(img);
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "avatar-remove-btn";
    removeBtn.innerHTML = "&times;";
    removeBtn.title = "Remove";
    removeBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const ok = await openConfirmDialog(
        t("removeAvatarTitle"),
        t("removeAvatarConfirm"),
      );
      if (!ok) return;
      removeAvatar(index);
    };
    item.appendChild(removeBtn);

    if (index === 0) {
      const mainBadge = document.createElement("span");
      mainBadge.className = "avatar-main-badge";
      mainBadge.textContent = "Main";
      item.appendChild(mainBadge);
    } else {
      const setMainBtn = document.createElement("button");
      setMainBtn.className = "avatar-set-main-btn";
      setMainBtn.innerHTML = "&#9733;";
      setMainBtn.title = "Set as main";
      setMainBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAvatarAsMain(index);
      };
      item.appendChild(setMainBtn);
    }

    const orderOverlay = document.createElement("div");
    orderOverlay.className = "char-avatar-order";

    const movePrevBtn = document.createElement("button");
    movePrevBtn.className = "avatar-order-btn avatar-order-btn-prev";
    movePrevBtn.type = "button";
    movePrevBtn.title = "Move earlier";
    movePrevBtn.innerHTML = "&#8592;";
    movePrevBtn.disabled = index === 0;
    movePrevBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      moveAvatar(index, -1);
    };

    const moveNextBtn = document.createElement("button");
    moveNextBtn.className = "avatar-order-btn avatar-order-btn-next";
    moveNextBtn.type = "button";
    moveNextBtn.title = "Move later";
    moveNextBtn.innerHTML = "&#8594;";
    moveNextBtn.disabled = index === state.charModalAvatars.length - 1;
    moveNextBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      moveAvatar(index, 1);
    };

    orderOverlay.appendChild(movePrevBtn);
    orderOverlay.appendChild(moveNextBtn);
    item.appendChild(orderOverlay);

    container.appendChild(item);
  });

  const dropzone = document.createElement("div");
  dropzone.id = "char-avatar-dropzone";
  dropzone.className = "char-avatar-dropzone";
  dropzone.setAttribute("tabindex", "0");
  dropzone.setAttribute("role", "button");
  dropzone.setAttribute("aria-label", "Upload avatar");
  dropzone.innerHTML = `
    <span class="dropzone-plus">+</span>
    <span class="dropzone-hint">Drag & drop or click</span>
  `;
  container.appendChild(dropzone);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "char-avatar-file-input";
  fileInput.className = "visually-hidden";
  fileInput.accept = "image/*,video/mp4";
  fileInput.multiple = true;
  container.appendChild(fileInput);

  setupCharAvatarDropzone();
}

function removeAvatar(index) {
  state.charModalAvatars.splice(index, 1);
  setModalDirtyState("character-modal", true);
  renderCharAvatars();
}

function setAvatarAsMain(index) {
  if (index === 0) return;
  const avatar = state.charModalAvatars.splice(index, 1)[0];
  state.charModalAvatars.unshift(avatar);
  setModalDirtyState("character-modal", true);
  renderCharAvatars();
}

function moveAvatar(index, offset) {
  const targetIndex = index + offset;
  if (
    !Number.isInteger(index) ||
    !Number.isInteger(targetIndex) ||
    targetIndex < 0 ||
    targetIndex >= state.charModalAvatars.length
  ) {
    return;
  }
  const avatar = state.charModalAvatars.splice(index, 1)[0];
  state.charModalAvatars.splice(targetIndex, 0, avatar);
  setModalDirtyState("character-modal", true);
  renderCharAvatars();
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
    avatars: Array.isArray(source.avatars) ? [...source.avatars] : [],
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
    let character = null;

    if (parsed?.spec === "chara_card_v2") {
      const data = parsed?.data;
      if (!data || typeof data !== "object") {
        throw new Error("Invalid character card format: missing data object");
      }
      const name = String(data.name || "").trim();
      if (!name) {
        throw new Error("Character card missing required field: name");
      }
      const description = String(data.description || "").trim();
      const personality = String(data.personality || "").trim();
      const firstMes = String(data.first_mes || "").trim();
      let avatarUrl = String(data.avatar || "").trim();
      let avatarData = "";
      if (avatarUrl) {
        try {
          showToast("Downloading avatar...", "success");
          const response = await fetch(avatarUrl);
          if (!response.ok) throw new Error("Failed to download avatar");
          const blob = await response.blob();
          avatarData = await blobToBase64(blob);
        } catch {
          avatarUrl = "";
        }
      }
      const scenario = String(data.scenario || "").trim();
      const postHistory = String(data.post_history_instructions || "").trim();
      let tags = [];
      if (Array.isArray(data.tags)) {
        const normalizedTags = data.tags.map((t) => normalizeTagValue(t));
        const seen = new Set();
        normalizedTags.forEach((t) => {
          if (t && !seen.has(t.toLowerCase())) {
            seen.add(t.toLowerCase());
            tags.push(t);
          }
        });
      }
      let writingInstructionId = "";
      if (postHistory) {
        const wiPayload = {
          name: `${name} - Custom`,
          instructions: { en: postHistory },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        writingInstructionId = await db.writingInstructions.add(wiPayload);
      }
      mergeTagsIntoCatalog(tags);
      const prompt = [description, personality].filter(Boolean).join("\n\n");
      const language = "en";
      character = {
        name,
        selectedCardLanguage: language,
        tags,
        avatarScale: 4,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        definitions: [
          {
            language,
            name,
            tagline: "",
            systemPrompt: prompt,
            oneTimeExtraPrompt: scenario,
            writingInstructions: postHistory || "",
            writingInstructionId: String(writingInstructionId || ""),
            initialMessagesRaw: firstMes,
            initialMessages: firstMes ? [firstMes] : [],
            personaInjectionPlacement: "end_messages",
            ttsVoice: DEFAULT_TTS_VOICE,
            ttsLanguage: DEFAULT_TTS_LANGUAGE,
            ttsRate: DEFAULT_TTS_RATE,
            ttsPitch: 1.1,
            ttsProvider: "kokoro",
            kokoroDevice: "webgpu",
            kokoroDtype: "auto",
            kokoroVoice: DEFAULT_KOKORO_VOICE,
            preferLoreBooksMatchingLanguage: true,
            lorebookIds: [],
          },
        ],
      };
      if (avatarData) {
        character.definitions[0].avatar = avatarData;
        character.avatar = avatarData;
        character.avatars = [{ type: "image", data: avatarData, name: "" }];
      }
    } else {
      const imported = parsed?.character || parsed;
      if (!imported || typeof imported !== "object") {
        throw new Error("Invalid character file");
      }
      mergeTagsIntoCatalog(
        Array.isArray(imported.tags)
          ? imported.tags.map((t) => normalizeTagValue(t)).filter(Boolean)
          : parseTagList(imported.tags || ""),
      );
      character = {
        ...imported,
        name: String(imported.name || "").trim(),
        tags: Array.isArray(imported.tags)
          ? imported.tags.map((t) => normalizeTagValue(t)).filter(Boolean)
          : parseTagList(imported.tags || ""),
        avatarScale: 4,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        personaInjectionPlacement: "end_messages",
      };
      if (character.definitions && character.definitions.length > 0) {
        character.definitions = character.definitions.map((def) => ({
          ...def,
          personaInjectionPlacement:
            def.personaInjectionPlacement || "end_messages",
          kokoroDtype: def.kokoroDtype || "auto",
        }));
      }
    }

    if (!character.name) throw new Error("Character name is required in file");
    renderCharacters();
    showToast(t("characterImported"), "success");
    openCharacterModal(character, null, true);
  } catch (err) {
    await openInfoDialog(t("importFailedTitle"), err.message);
  }
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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

   // Clean up stored modal scroll and collapse states for this character
   const prefix = `rp-char-collapse-${characterId}-`;
   const lastLangKey = `rp-char-modal-last-lang-${characterId}`;
   const keysToDelete = [lastLangKey];
   for (let i = 0; i < localStorage.length; i++) {
     const key = localStorage.key(i);
     if (key && key.startsWith(prefix)) {
       keysToDelete.push(key);
     }
   }
   keysToDelete.forEach((k) => localStorage.removeItem(k));

   if (currentCharacter?.id === characterId) {
    currentCharacter = null;
    currentThread = null;
    conversationHistory = [];
    showMainView();
  }

  await renderAll();
  showToast(t("characterDeleted"), "success");
}

async function startNewThread(characterId, forcedPersonaId = null) {
  const character = await db.characters.get(characterId);
  if (!character) return;
  const resolvedCharacter = resolveCharacterForLanguage(
    character,
    character?.selectedCardLanguage || "",
  );
  let selectedPersona = null;
  if (forcedPersonaId) {
    selectedPersona = await db.personas.get(forcedPersonaId);
  }
  if (!selectedPersona) {
    selectedPersona = await getCharacterDefaultPersona();
  }
  const initialMessages = await buildThreadInitialMessages(resolvedCharacter);

  const newThread = {
    characterId,
    characterLanguage: resolvedCharacter.activeLanguage || "",
    title: tf("threadTitleAtDate", { date: new Date().toLocaleString() }),
    titleGenerated: false,
    titleManual: false,
    messages: initialMessages,
    selectedPersonaId: selectedPersona?.id || null,
    initialUserName: selectedPersona?.name || "You",
    autoTtsEnabled: false,
    lastPersonaInjectionPersonaId: null,
    writingInstructionsTurnCount: 0,
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
    (resolvedCharacter?.autoTriggerAiFirstMessage ?? true) !== false;
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
  if (threadHasPendingBotActivity(source)) {
    showToast(t("generationQueuedNotice"), "warning");
    return;
  }

  const clonedMessages = (() => {
    const list = Array.isArray(source.messages) ? source.messages : [];
    if (typeof structuredClone === "function") {
      return structuredClone(list);
    }
    return list.map((m) => JSON.parse(JSON.stringify(m)));
  })();

  const copy = {
    characterId: source.characterId,
    characterLanguage: source.characterLanguage || "",
    title: `${source.title || tf("threadTitleDefault", { id: source.id })} Copy`,
    titleGenerated: false,
    titleManual: false,
    messages: clonedMessages,
    selectedPersonaId: source.selectedPersonaId || null,
    autoTtsEnabled: source.autoTtsEnabled === true,
    lastPersonaInjectionPersonaId: source.lastPersonaInjectionPersonaId || null,
    writingInstructionsTurnCount:
      Number(source.writingInstructionsTurnCount) >= 0
        ? Number(source.writingInstructionsTurnCount)
        : 0,
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
  const ok = await openConfirmDialog(
    t("deleteThreadTitle"),
    t("deleteThreadConfirm"),
  );
  if (!ok) return;

  localStorage.removeItem(`rp-thread-scroll-${threadId}`);

  if (
    state.sending &&
    Number(state.activeGenerationThreadId) === Number(threadId) &&
    state.abortController
  ) {
    cancelOngoingGeneration();
  }
  state.generationQueue = state.generationQueue.filter(
    (id) => Number(id) !== Number(threadId),
  );
  try {
    await db.threads.update(threadId, {
      pendingGenerationReason: "",
      pendingGenerationQueuedAt: 0,
      updatedAt: Date.now(),
    });
  } catch {
    // thread might already be gone
  }
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
  showToast(t("threadDeleted"), "success");
}

async function openThread(threadId) {
  const chatViewActive = document
    .getElementById("chat-view")
    ?.classList.contains("active");
  if (chatViewActive && Number(currentThread?.id) === Number(threadId)) {
    return;
  }
  if (chatViewActive && currentThread) {
    const log = document.getElementById("chat-log");
    if (log) {
      localStorage.setItem(
        `rp-thread-scroll-${currentThread.id}`,
        log.scrollTop,
      );
    }
  }
  delete state.threadUnreadCounts[Number(threadId)];
  const thread = await db.threads.get(threadId);
  if (!thread) return;

  stopTtsPlayback();
  const characterBase = await db.characters.get(thread.characterId);
  const character = characterBase
    ? resolveCharacterForLanguage(characterBase, thread.characterLanguage || "")
    : null;
  currentThread = {
    ...thread,
    writingInstructionsTurnCount: getThreadWritingInstructionsTurnCount(thread),
  };
  if (!thread.characterLanguage && character?.activeLanguage) {
    currentThread.characterLanguage = character.activeLanguage;
    await db.threads.update(thread.id, {
      characterLanguage: character.activeLanguage,
    });
  }
  currentCharacter = character || null;
  preloadKokoroForActiveCharacter();
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
  updateChatInputToggles();
  updateModelPill();
  state.lastSyncSeenUpdatedAt = Number(thread.updatedAt || 0);

  for (const msg of conversationHistory) {
    if (msg?.role === "assistant" && Number(msg.unreadAt) > 0) {
      msg.unreadAt = 0;
    }
  }
  if (thread.messages) {
    for (const msg of thread.messages) {
      if (msg?.role === "assistant" && Number(msg.unreadAt) > 0) {
        msg.unreadAt = 0;
      }
    }
  }
  if (currentThread?.messages) {
    for (const msg of currentThread.messages) {
      if (msg?.role === "assistant" && Number(msg.unreadAt) > 0) {
        msg.unreadAt = 0;
      }
    }
  }
  state.unreadNeedsUserScrollThreadId = null;
  await persistThreadMessagesById(Number(threadId), thread.messages || [], {
    _skipUpdatedAt: true,
  });
  renderChat();
  const savedScroll = localStorage.getItem(`rp-thread-scroll-${threadId}`);
  const log = document.getElementById("chat-log");
  if (log && savedScroll) {
    log.scrollTop = Number(savedScroll);
  } else if (log) {
    log.scrollTop = log.scrollHeight;
  }
  const input = document.getElementById("user-input");
  input.value = "";
  state.activeShortcut = null;
  closePromptHistory();
  await renderShortcutsBar();
  await renderThreads();
  updateScrollBottomButtonVisibility();
  showChatView();
  broadcastSyncEvent({ type: "thread-viewed", threadId: Number(threadId) });
  if (thread.pendingGenerationReason) {
    const id = Number(thread.id);
    if (!state.generationQueue.includes(id)) state.generationQueue.push(id);
  }
  await processNextQueuedThread();
}

function threadHasPendingBotActivity(thread) {
  if (!thread) return false;
  const id = Number(thread.id);
  if (state.sending && Number(state.activeGenerationThreadId) === id) {
    return true;
  }
  if (String(thread.pendingGenerationReason || "").trim()) return true;
  const messages = Array.isArray(thread.messages) ? thread.messages : [];
  return messages.some((m) => {
    if (!m || m.role !== "assistant") return false;
    const st = String(m.generationStatus || "").trim();
    return (
      st === "queued" ||
      st === "cooling_down" ||
      st === "generating" ||
      st === "regenerating"
    );
  });
}

function threadHasActiveGeneratingMessage(thread) {
  if (!thread) return false;
  const messages = Array.isArray(thread.messages) ? thread.messages : [];
  return messages.some((m) => {
    if (!m) return false;
    const role = normalizeApiRole(m?.apiRole || m?.role);
    if (role !== "assistant") return false;
    const status = String(m.generationStatus || "").trim();
    return status === "generating" || status === "regenerating";
  });
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
  btn.setAttribute(
    "title",
    enabled ? t("autoTtsTitleOn") : t("autoTtsTitleOff"),
  );
  btn.setAttribute(
    "aria-label",
    enabled ? t("disableAutoTtsAria") : t("enableAutoTtsAria"),
  );
}

function updateChatInputToggles() {
  const autoReplyEnabled = document.getElementById("auto-reply-enabled");
  const enterToSendEnabled = document.getElementById("enter-to-send-enabled");
  if (!autoReplyEnabled && !enterToSendEnabled) return;
  const threadAutoReply = currentThread?.autoReplyEnabled;
  const threadEnterToSend = currentThread?.enterToSendEnabled;
  const globalAutoReply = state.settings.autoReplyEnabled;
  const globalEnterToSend = state.settings.enterToSendEnabled;
  if (autoReplyEnabled) {
    const isActive = threadAutoReply !== undefined ? threadAutoReply : (globalAutoReply !== false);
    autoReplyEnabled.classList.toggle("is-active", isActive);
    autoReplyEnabled.disabled = !currentThread;
  }
  if (enterToSendEnabled) {
    const isActive = threadEnterToSend !== undefined ? threadEnterToSend : (globalEnterToSend !== false);
    enterToSendEnabled.classList.toggle("is-active", isActive);
    enterToSendEnabled.disabled = !currentThread;
  }
}

async function toggleThreadAutoTts() {
  if (!currentThread) return;
  const next = !(currentThread.autoTtsEnabled === true);
  currentThread.autoTtsEnabled = next;
  await db.threads.update(currentThread.id, {
    autoTtsEnabled: next,
  });
  updateAutoTtsToggleButton();
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: currentThread.id,
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
  const title = String(next || "")
    .trim()
    .slice(0, 128);
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
    applyHoverMarquee(titleEl, t("threadWord"));
    return;
  }
  const displayTitle =
    currentThread.title || tf("threadTitleDefault", { id: currentThread.id });
  applyHoverMarquee(titleEl, displayTitle);
}

function applyHoverMarquee(element, fullText) {
  if (!element) return;
  const text = String(fullText || "");
  const behavior = normalizeMarqueeBehavior(state.settings.marqueeBehavior);
  if (behavior === "disabled") {
    element.classList.remove(
      "hover-marquee",
      "marquee-overflow",
      "marquee-always",
    );
    element.style.removeProperty("--marquee-shift");
    element.style.removeProperty("--marquee-duration");
    element.textContent = text;
    element.setAttribute("title", text);
    return;
  }
  let inner = element.querySelector(".hover-marquee-inner");
  if (!inner) {
    inner = document.createElement("span");
    inner.className = "hover-marquee-inner";
    element.textContent = "";
    element.appendChild(inner);
  }
  inner.textContent = text;
  element.classList.add("hover-marquee");
  element.setAttribute("title", text);
  requestAnimationFrame(() => updateHoverMarqueeState(element));
}

function updateHoverMarqueeState(element) {
  if (!element) return;
  const inner = element.querySelector(".hover-marquee-inner");
  if (!inner) return;
  const behavior = normalizeMarqueeBehavior(state.settings.marqueeBehavior);
  const overflow = Math.ceil(inner.scrollWidth - element.clientWidth);
  const canAnimate = overflow > 8 && behavior !== "disabled";
  if (canAnimate) {
    element.classList.add("marquee-overflow");
    element.classList.toggle("marquee-always", behavior === "always");
    element.style.setProperty("--marquee-shift", `-${overflow}px`);
    const durationSec = Math.max(7, Math.min(22, overflow / 24 + 6));
    element.style.setProperty("--marquee-duration", `${durationSec}s`);
  } else {
    element.classList.remove("marquee-overflow");
    element.classList.remove("marquee-always");
    element.style.removeProperty("--marquee-shift");
    element.style.removeProperty("--marquee-duration");
  }
}

function refreshAllHoverMarquees() {
  document.querySelectorAll(".hover-marquee").forEach((el) => {
    updateHoverMarqueeState(el);
  });
}

async function maybeGenerateThreadTitle() {
  if (!currentThread || !currentCharacter) return;
  if (state.settings.threadAutoTitleEnabled === false) return;
  if (currentThread.titleGenerated === true) return;
  if (currentThread.titleManual === true) return;
  const minMessages = Math.max(
    5,
    Math.min(10, Number(state.settings.threadAutoTitleMinMessages) || 5),
  );
  if (conversationHistory.length < minMessages) return;

  const existingTitleMessage = conversationHistory.find(
    (m) => m.role === "assistant" && m.generationStatus === "title_generating",
  );
  if (existingTitleMessage) return;

  const hasExistingPendingMessage = conversationHistory.some(
    (m) =>
      m.role === "assistant" &&
      (m.generationStatus === "generating" ||
        m.generationStatus === "regenerating" ||
        m.generationStatus === "queued" ||
        m.generationStatus === "cooling_down"),
  );
  if (hasExistingPendingMessage) return;

  const pendingTitleMessage = {
    role: "assistant",
    content: "",
    generationStatus: "title_generating",
    createdAt: Date.now(),
    finishReason: "",
    nativeFinishReason: "",
    truncatedByFilter: false,
    generationId: "",
    completionMeta: null,
    generationInfo: null,
    usedLoreEntries: [],
    usedMemorySummary: "",
    model: state.settings.model || "",
    temperature: Number(state.settings.temperature) || 0,
  };
  conversationHistory.push(pendingTitleMessage);
  const pendingIndex = conversationHistory.length - 1;

  await persistCurrentThread();

  const log = document.getElementById("chat-log");
  if (log && isViewingThread(currentThread.id)) {
    const pendingRow = buildMessageRow(
      pendingTitleMessage,
      pendingIndex,
      true,
    );
    log.appendChild(pendingRow);
    const pendingContent = pendingRow?.querySelector(".message-content");
    if (pendingContent) {
      pendingContent.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(t("generatingTitleLabel") || t("generatingLabel"))}`;
    }
    scrollChatToBottom();
  }

  setSendingState();

  const titleSlice = conversationHistory.slice(0, minMessages);
  const transcript = titleSlice
    .map((m, i) => {
      const role = m.role === "assistant" ? "Assistant" : "User";
      const content = String(m.content || "")
        .replace(/\s+/g, " ")
        .trim();
      return `${i + 1}. ${role}: ${content.slice(0, 600)}`;
    })
    .join("\n");
  const languageCode =
    normalizeBotLanguageCode(
      currentThread.characterLanguage ||
        currentCharacter.activeLanguage ||
        "en",
    ) || "en";

  const titlePrompt = [
    "Generate a concise roleplay thread title.",
    `Generate the title in language code: ${languageCode}.`,
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
      // "openrouter/free",
      state.settings.model,
    );
    const raw = String(result?.content || "").trim();
    if (!raw) {
      conversationHistory.pop();
      await persistCurrentThread();
      setSendingState();
      return;
    }
    const cleaned = raw
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 128);
    if (!cleaned) {
      conversationHistory.pop();
      await persistCurrentThread();
      setSendingState();
      return;
    }

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

    pendingTitleMessage.generationStatus = "generating";
    await persistCurrentThread();

    if (log && isViewingThread(currentThread.id)) {
      const pendingRow = log.querySelector(
        `.chat-row[data-message-index="${pendingIndex}"]`,
      );
      if (pendingRow) {
        const pendingContent = pendingRow?.querySelector(".message-content");
        if (pendingContent) {
          pendingContent.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(t("generatingLabel"))}`;
        }
      }
    }

    setSendingState();

    broadcastSyncEvent({
      type: "thread-updated",
      threadId: currentThread.id,
      updatedAt,
    });
  } catch {
    const idx = conversationHistory.indexOf(pendingTitleMessage);
    if (idx >= 0) {
      conversationHistory.splice(idx, 1);
    }
    await persistCurrentThread();
    setSendingState();
  }
}

function renderChat() {
  const log = document.getElementById("chat-log");
  const previousScrollTop = log.scrollTop;
  const previousScrollHeight = log.scrollHeight;
  const isAtBottom =
    previousScrollHeight - previousScrollTop - log.clientHeight <= 50;
  const savedScroll = currentThread
    ? localStorage.getItem(`rp-thread-scroll-${currentThread.id}`)
    : null;
  const hasSavedScroll = savedScroll !== null;
  const savedScrollTop = hasSavedScroll ? Number(savedScroll) : null;

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
        status === "cooling_down" ||
        (isActiveGenerationThread &&
          (status === "generating" || status === "regenerating")));
    log.appendChild(buildMessageRow(message, idx, rowStreaming));
  });

  if (hasSavedScroll && !state.sending) {
    log.scrollTop = savedScrollTop;
  } else if (state.sending && isAtBottom) {
    scrollChatToBottom();
  } else if (!state.sending && isAtBottom) {
    log.scrollTop = log.scrollHeight;
  }
  updateScrollBottomButtonVisibility();
  scheduleThreadBudgetIndicatorUpdate();
  maybeProcessUnreadMessagesSeen(false).catch(() => {});
}

function getUnreadAssistantCount(messages) {
  const list = Array.isArray(messages) ? messages : [];
  let count = 0;
  for (const m of list) {
    if (!m || m.role !== "assistant") continue;
    if (Number(m.unreadAt) > 0) count += 1;
  }
  return count;
}

async function maybeProcessUnreadMessagesSeen(fromUserScroll = false) {
  if (!currentThread) return;
  const currentId = Number(currentThread.id);
  if (!Number.isInteger(currentId)) return;
  if (state.unreadNeedsUserScrollThreadId !== currentId) return;

  const log = document.getElementById("chat-log");
  if (!log) return;
  const logRect = log.getBoundingClientRect();
  let changed = false;
  const now = Date.now();

  for (let i = 0; i < conversationHistory.length; i += 1) {
    const message = conversationHistory[i];
    if (
      !message ||
      message.role !== "assistant" ||
      Number(message.unreadAt) <= 0
    )
      continue;
    const row = log.querySelector(`.chat-row[data-message-index="${i}"]`);
    if (!row) continue;
    const rowRect = row.getBoundingClientRect();
    const isVisible =
      rowRect.bottom > logRect.top + 6 && rowRect.top < logRect.bottom - 6;
    if (!isVisible) continue;
    message.unreadAt = 0;
    changed = true;
    const block = row.querySelector(".message-block");
    if (block) {
      block.classList.remove("message-block-unread");
      block.classList.add("message-block-unread-clearing");
      window.setTimeout(() => {
        block.classList.remove("message-block-unread-clearing");
      }, 700);
    }
  }

  if (!changed) return;

  const remaining = getUnreadAssistantCount(conversationHistory);
  if (remaining === 0) {
    state.unreadNeedsUserScrollThreadId = null;
  }

  await persistCurrentThread();
  await renderThreads();
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
  const chatFsName =
    message.role === "assistant" ? botName : userName || t("message");
  if (message.role === "assistant") {
    setCharacterAvatarImage(avatar, currentCharacter, botName, 256);
  } else {
    setCharacterAvatarImage(avatar, { avatar: userAvatar }, chatFsName, 256);
  }
  avatar.classList.add("clickable-avatar");
  avatar.addEventListener("click", () => {
    const videoSrc = avatar.dataset.avatarVideo;
    if (videoSrc) {
      openVideoPreview(videoSrc);
    } else {
      openImagePreview(avatar.src);
    }
  });
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
  if (message?.role === "assistant" && Number(message?.unreadAt) > 0) {
    block.classList.add("message-block-unread");
  }

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

    const regenBtn = iconButton(
      "regenerate",
      t("msgRegenerateTitle"),
      async () => {
        await regenerateMessage(index);
      },
    );
    regenBtn.classList.add("msg-regen-btn");
    regenBtn.disabled = state.sending || disableControlsForRow;
    controls.appendChild(regenBtn);
    const editBtn = iconButton("edit", t("msgEditTitle"), async () => {
      beginInlineMessageEdit(index, content);
    });
    editBtn.classList.add("msg-edit-btn");
    editBtn.disabled =
      disableControlsForRow || isTruncated || hasGenerationError;
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
    const modelInfoBtn = iconButton(
      "model",
      t("msgModelInfoTitle"),
      async () => {
        await openMessageModelInfoModal(index);
      },
    );
    modelInfoBtn.classList.add("msg-model-info-btn");
    const isInitial = message?.isInitial === true;
    const isUserEdited = message?.userEdited === true;
    if (disableControlsForRow || isInitial || isUserEdited || !message.model) {
      modelInfoBtn.disabled = true;
      if (isUserEdited) {
        modelInfoBtn.setAttribute("title", t("msgMetadataUnavailableEdited"));
        modelInfoBtn.setAttribute(
          "aria-label",
          t("msgMetadataUnavailableEditedAria"),
        );
      } else if (isInitial) {
        modelInfoBtn.setAttribute("title", t("msgMetadataUnavailableInitial"));
        modelInfoBtn.setAttribute(
          "aria-label",
          t("msgMetadataUnavailableInitialAria"),
        );
      } else if (disableControlsForRow) {
        modelInfoBtn.setAttribute(
          "title",
          t("msgMetadataUnavailableGenerating"),
        );
        modelInfoBtn.setAttribute(
          "aria-label",
          t("msgMetadataUnavailableGeneratingAria"),
        );
      }
    } else {
      modelInfoBtn.setAttribute("title", t("msgModelInfoTitle"));
      modelInfoBtn.setAttribute("aria-label", t("msgModelInfoTitle"));
    }
    controls.appendChild(modelInfoBtn);
    const systemPromptBtn = iconButton(
      "badge",
      t("msgSystemPromptTitle"),
      async () => {
        await openMessageSystemPromptModal(index);
      },
    );
    systemPromptBtn.classList.add("msg-system-prompt-btn");
    const hasContent =
      message && index >= 0 && index < conversationHistory.length;
    systemPromptBtn.disabled = !hasContent;
    if (hasContent) {
      systemPromptBtn.setAttribute("title", t("msgSystemPromptTitle"));
      systemPromptBtn.setAttribute("aria-label", t("msgSystemPromptTitle"));
    }
    controls.appendChild(systemPromptBtn);
    const contextBtn = iconButton("context", t("msgContextTitle"), async () => {
      await openMessageContextModal(index);
    });
    contextBtn.classList.add("msg-context-btn");
    contextBtn.disabled =
      disableControlsForRow || !hasMessageContextData(message);
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
    const delBtn = iconButton("delete", t("msgDeleteTitle"), async () => {
      await deleteMessageAt(index);
    });
    delBtn.classList.add("msg-delete-btn");
    delBtn.classList.add("danger-icon-btn");
    delBtn.disabled = disableControlsForRow;
    controls.appendChild(delBtn);
    const editBtn = iconButton("edit", t("msgEditTitle"), async () => {
      beginInlineMessageEdit(index, content);
    });
    editBtn.classList.add("msg-edit-btn");
    editBtn.disabled =
      disableControlsForRow || isTruncated || hasGenerationError;
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
    const isCoolingDown = message?.generationStatus === "cooling_down";
    const isTitleGenerating = message?.generationStatus === "title_generating";
    if (message?.generationStatus === "regenerating") {
      statusLabel = t("regeneratingLabel");
    } else if (isTitleGenerating) {
      statusLabel = t("generatingTitleLabel") || t("generatingLabel");
    } else if (isCoolingDown) {
      statusLabel =
        String(message?.content || "").trim() ||
        tf("cooldownToastActive", { seconds: getCooldownRemainingSeconds() });
    } else if (isQueued) {
      statusLabel =
        String(message?.content || "").trim() || t("generatingLabel");
    }
    if (!isQueued && !isCoolingDown && String(message?.content || "").trim()) {
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

function hasSystemMessagesData(message) {
  if (!message) return false;
  return (
    Array.isArray(message.systemMessages) &&
    message.systemMessages.some((entry) => String(entry?.content || "").trim())
  );
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
    button.setAttribute(
      "aria-label",
      t("msgMetadataUnavailableGeneratingAria"),
    );
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
  editor.addEventListener("input", () =>
    autoSizeMessageEditor(editor, contentHeight),
  );
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
    stopTtsPlayback();
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
  const provider = getActiveCharacterTtsProvider();
  const supported = isActiveTtsProviderReady(provider);
  if (provider === "kokoro" && !supported && !state.tts.kokoro.loading) {
    preloadKokoroForActiveCharacter();
  }
  const statusEl = document.getElementById("tts-test-status");
  const playBtn = document.getElementById("tts-test-play-btn");
  if (
    statusEl &&
    (!statusEl.textContent ||
      statusEl.textContent.startsWith("TTS: unsupported"))
  ) {
    const fallbackText =
      provider === "kokoro"
        ? "TTS: Kokoro unavailable"
        : "TTS: unsupported in this browser";
    statusEl.textContent = supported ? "TTS: idle" : fallbackText;
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
  const ttsReady = isActiveTtsProviderReady();
  button.disabled = !isAssistant || streaming || !hasContent || !ttsReady;
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
  stopTtsPlayback();
  const pendingState = getThreadPendingGenerationState(
    Number(currentThread.id),
    conversationHistory,
  );
  if (pendingState === "queued") {
    showToast(t("generationQueuedNotice"), "warning");
    return;
  }
  if (pendingState === "cooling_down") {
    showToast(
      tf("cooldownToastActive", { seconds: getCooldownRemainingSeconds() }),
      "warning",
    );
    return;
  }
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

function isInCompletionCooldown() {
  const cooldown = Number(state.settings.completionCooldown) || 0;
  if (cooldown <= 0) return false;
  const now = Date.now();
  const timeSinceLastCompletion = now - (state.lastCompletionTime || 0);
  return timeSinceLastCompletion < cooldown * 1000;
}

function getCooldownRemainingSeconds() {
  const cooldown = Number(state.settings.completionCooldown) || 0;
  if (cooldown <= 0) return 0;
  const now = Date.now();
  const timeSinceLastCompletion = now - (state.lastCompletionTime || 0);
  const remaining = cooldown - timeSinceLastCompletion / 1000;
  return Math.max(0, Math.ceil(remaining));
}

async function generateBotReply() {
  if (!currentThread || !currentCharacter || state.sending) return;
  const cooldown = Number(state.settings.completionCooldown) || 0;
  if (cooldown > 0 && isInCompletionCooldown()) {
    const threadId = Number(currentThread.id);
    if (!state.generationQueue.includes(threadId)) {
      state.generationQueue.push(threadId);
    }
    const seconds = getCooldownRemainingSeconds();
    const cooldownLabel = tf("cooldownToastActive", { seconds });
    const existingPendingIdx =
      findLatestPendingAssistantIndex(conversationHistory);
    if (existingPendingIdx >= 0) {
      const pending = conversationHistory[existingPendingIdx];
      pending.generationStatus = "cooling_down";
      pending.content = cooldownLabel;
      pending.generationError = "";
      pending.truncatedByFilter = false;
    } else {
      conversationHistory.push({
        role: "assistant",
        content: cooldownLabel,
        generationStatus: "cooling_down",
        createdAt: Date.now(),
        finishReason: "",
        nativeFinishReason: "",
        truncatedByFilter: false,
        generationId: "",
        completionMeta: null,
        generationInfo: null,
        usedLoreEntries: [],
        usedMemorySummary: "",
        writingInstructionsTurnIndex: 0,
        writingInstructionsCounted: false,
      });
    }
    const nowTs = Date.now();
    currentThread.pendingGenerationReason = "cooldown";
    currentThread.pendingGenerationQueuedAt = Number(
      currentThread.pendingGenerationQueuedAt || nowTs,
    );
    await persistCurrentThread();
    const allFinished = conversationHistory.every(
      (m) => !m.generationStatus || m.generationStatus === "",
    );
    const updateData = {
      pendingGenerationReason: "cooldown",
      pendingGenerationQueuedAt: currentThread.pendingGenerationQueuedAt,
    };
    if (allFinished) {
      updateData.updatedAt = Date.now();
    }
    await db.threads.update(threadId, updateData);
    renderChat();
    setSendingState(state.sending);
    updateCooldownPinnedToast(seconds);
    await renderThreads();
    return;
  }
  const threadId = Number(currentThread.id);
  const includeOneTimeExtra =
    shouldIncludeOneTimeExtraPrompt(conversationHistory);
  const generationCharacter = currentCharacter;
  const generationPersona = currentPersona;
  const generationThreadSnapshot = { ...currentThread };
  const generationHistory = conversationHistory;
  let writingTurnCountForThread = getThreadWritingInstructionsTurnCount(
    generationThreadSnapshot,
  );
  const writingTurnIndex = getNextWritingInstructionsTurnIndex(
    generationThreadSnapshot,
  );
  const promptContext = await buildSystemPrompt(generationCharacter, {
    includeOneTimeExtraPrompt: includeOneTimeExtra,
    writingInstructionsTurnIndex: writingTurnIndex,
    returnTrace: true,
    personaOverride: generationPersona,
    historyOverride: generationHistory,
    threadOverride: generationThreadSnapshot,
  });
  const systemPrompt = promptContext.prompt;
  const promptMessages = [
    { role: "system", content: systemPrompt },
    ...generationHistory.map((m) => ({
      role: m.role === "ai" ? "assistant" : m.role,
      content: m.content,
    })),
  ];
  if (promptContext.personaInjectionForEndMessages) {
    promptMessages.push({
      role: "system",
      content: promptContext.personaInjectionForEndMessages,
    });
  }
  state.currentRequestMessages = promptMessages;

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
    pending.model = state.settings.model || "";
    pending.temperature = Number(state.settings.temperature) || 0;
    pending.requestMessages = state.currentRequestMessages || null;
    if (!Number.isInteger(Number(pending.writingInstructionsTurnIndex))) {
      pending.writingInstructionsTurnIndex = writingTurnIndex;
      pending.writingInstructionsCounted = false;
    }
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
      writingInstructionsTurnIndex: writingTurnIndex,
      writingInstructionsCounted: false,
      model: state.settings.model || "",
      temperature: Number(state.settings.temperature) || 0,
      requestMessages: state.currentRequestMessages || null,
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
      pendingRow = buildMessageRow(pending, pendingIndex, true);
      log.appendChild(pendingRow);
    }
    const pendingContent = pendingRow?.querySelector(".message-content");
    if (pendingContent) {
      pendingContent.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(t("generatingLabel"))}`;
    }
    scrollChatToBottom();
  }

  state.sending = true;
  state.activeGenerationThreadId = threadId;
  state.chatAutoScroll = true;
  state.abortController = new AbortController();
  setSendingState(true);

  try {
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
            liveContent.innerHTML = renderMessageHtml(
              pending.content,
              pending.role,
            );
          }
        }
        if (state.settings.streamEnabled) {
          persistThreadMessagesById(threadId, generationHistory).catch(
            () => {},
          );
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
    const finishReasonValue = result.finishReason;
    const isOkFinish = finishReasonValue === "stop";
    if (!isOkFinish && !pending.truncatedByFilter) {
      pending.generationError = `finish_reason: ${finishReasonValue ?? "null"}`;
    } else {
      pending.generationError = "";
    }
    pending.generationStatus = "";
    if (!isViewingThread(threadId)) {
      pending.unreadAt = Date.now();
    }
    if (Number(state.settings.completionCooldown) > 0) {
      state.lastCompletionTime = Date.now();
      updateCooldownPinnedToast();
    }
    if (pending.writingInstructionsCounted !== true) {
      pending.writingInstructionsCounted = true;
      writingTurnCountForThread = Math.max(
        writingTurnCountForThread,
        Number(pending.writingInstructionsTurnIndex) || writingTurnIndex,
      );
    }
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
      const modelInfoBtn = liveRow?.querySelector(".msg-model-info-btn");
      if (modelInfoBtn && pending.model) {
        modelInfoBtn.disabled = false;
        modelInfoBtn.setAttribute("title", t("msgModelInfoTitle"));
        modelInfoBtn.setAttribute("aria-label", t("msgModelInfoTitle"));
      }
    }
    if (currentThread && Number(currentThread.id) === threadId) {
      commitPendingPersonaInjectionMarker();
    } else {
      state.pendingPersonaInjectionPersonaId = null;
    }
    await persistThreadMessagesById(threadId, generationHistory, {
      writingInstructionsTurnCount: writingTurnCountForThread,
    });
    if (isViewingThread(threadId)) {
      maybeAutoSpeakAssistantMessage(pendingIndex).catch(() => {});
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
          const modelInfoBtn = liveRow?.querySelector(".msg-model-info-btn");
          if (modelInfoBtn && pending.model) {
            modelInfoBtn.disabled = false;
            modelInfoBtn.setAttribute("title", t("msgModelInfoTitle"));
            modelInfoBtn.setAttribute("aria-label", t("msgModelInfoTitle"));
          }
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
    await renderThreads();
    await processNextQueuedThread();
  }
}

async function deleteMessageAt(index) {
  if (!currentThread) return;
  if (index < 0 || index >= conversationHistory.length) return;

  stopTtsPlayback();
  const target = conversationHistory[index];
  const targetRole = normalizeApiRole(target?.apiRole || target?.role);
  const latestCountedTurn =
    getThreadWritingInstructionsTurnCount(currentThread);
  const targetTurn = Number(target?.writingInstructionsTurnIndex);
  const isLatestAssistant =
    targetRole === "assistant" &&
    isLatestAssistantMessageIndex(index, conversationHistory);
  const isLatestCountedAssistant =
    isLatestAssistant &&
    target?.writingInstructionsCounted === true &&
    Number.isInteger(targetTurn) &&
    targetTurn === latestCountedTurn;
  conversationHistory.splice(index, 1);
  if (isLatestCountedAssistant && currentThread) {
    currentThread.writingInstructionsTurnCount = Math.max(
      0,
      latestCountedTurn - 1,
    );
  }
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
  const regenWritingTurnIndex =
    Number(target.writingInstructionsTurnIndex) || 0;
  const effectiveWritingTurnIndex =
    regenWritingTurnIndex > 0
      ? regenWritingTurnIndex
      : Math.max(1, getThreadWritingInstructionsTurnCount(currentThread));
  const originalContent = String(target.content || "");
  const threadId = Number(currentThread.id);
  const messagesToSave = conversationHistory.map((m) => ({ ...m }));

  stopTtsPlayback();
  state.sending = true;
  state.chatAutoScroll = true;
  state.abortController = new AbortController();
  state.activeGenerationThreadId = threadId;
  setSendingState(true);

  try {
    const promptContext = await buildSystemPrompt(currentCharacter, {
      includeOneTimeExtraPrompt: includeOneTimeExtra,
      writingInstructionsTurnIndex: effectiveWritingTurnIndex,
      returnTrace: true,
    });
    const systemPrompt = promptContext.prompt;
    const regenMessages = [
      { role: "system", content: systemPrompt },
      ...prior.map((m) => ({
        role: m.role === "ai" ? "assistant" : m.role,
        content: m.content,
      })),
    ];
    if (promptContext.personaInjectionForEndMessages) {
      regenMessages.push({
        role: "system",
        content: promptContext.personaInjectionForEndMessages,
      });
    }
    target.requestMessages = regenMessages;
    target.content = "";
    target.generationStatus = "regenerating";
    messagesToSave[index].content = target.content;
    messagesToSave[index].generationStatus = target.generationStatus;
    renderChat();
    const row = document.getElementById("chat-log").children[index];
    const contentEl = row?.querySelector(".message-content");
    if (row) row.dataset.streaming = "1";
    refreshMessageControlStates();
    if (contentEl)
      contentEl.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(t("regeneratingLabel"))}`;
    scrollChatToBottom();

    const result = await callOpenRouter(
      systemPrompt,
      prior,
      state.settings.model,
      (chunk) => {
        target.content += chunk;
        messagesToSave[index].content = target.content;
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
    messagesToSave[index].content = target.content;
    target.isInitial = false;
    messagesToSave[index].isInitial = false;
    target.userEdited = false;
    messagesToSave[index].userEdited = false;
    target.finishReason = String(result.finishReason || "");
    messagesToSave[index].finishReason = target.finishReason;
    target.nativeFinishReason = String(result.nativeFinishReason || "");
    messagesToSave[index].nativeFinishReason = target.nativeFinishReason;
    target.truncatedByFilter = result.truncatedByFilter === true;
    messagesToSave[index].truncatedByFilter = target.truncatedByFilter;
    target.generationId = String(result.generationId || "");
    messagesToSave[index].generationId = target.generationId;
    target.completionMeta = result.completionMeta || null;
    messagesToSave[index].completionMeta = target.completionMeta;
    target.generationInfo = result.generationInfo || null;
    messagesToSave[index].generationInfo = target.generationInfo;
    target.generationFetchDebug = result.generationFetchDebug || [];
    messagesToSave[index].generationFetchDebug = target.generationFetchDebug;
    target.model = result.model || state.settings.model || "";
    messagesToSave[index].model = target.model;
    target.temperature = Number(state.settings.temperature) || 0;
    messagesToSave[index].temperature = target.temperature;
    target.systemMessages = Array.isArray(result.systemMessages)
      ? result.systemMessages.filter(
          (entry) => entry && String(entry.content || "").trim(),
        )
      : [];
    messagesToSave[index].systemMessages = target.systemMessages;
    target.generationError = "";
    target.generationStatus = "";
    messagesToSave[index] = { ...target };
    target.usedLoreEntries = Array.isArray(promptContext.usedLoreEntries)
      ? promptContext.usedLoreEntries
      : [];
    messagesToSave[index].usedLoreEntries = target.usedLoreEntries;
    target.usedMemorySummary = String(promptContext.memory || "");
    messagesToSave[index].usedMemorySummary = target.usedMemorySummary;
    if (!Number.isInteger(Number(target.writingInstructionsTurnIndex))) {
      target.writingInstructionsTurnIndex = effectiveWritingTurnIndex;
      messagesToSave[index].writingInstructionsTurnIndex =
        target.writingInstructionsTurnIndex;
    }
    if (!isViewingThread(threadId)) {
      target.unreadAt = Date.now();
      messagesToSave[index].unreadAt = target.unreadAt;
    }
    commitPendingPersonaInjectionMarker();
    await persistThreadMessagesById(threadId, messagesToSave);
    renderChat();
    maybeAutoSpeakAssistantMessage(index).catch(() => {});
    await renderThreads();
  } catch (e) {
    state.pendingPersonaInjectionPersonaId = null;
    if (isAbortError(e)) {
      target.generationStatus = "";
      messagesToSave[index].generationStatus = "";
      await persistThreadMessagesById(threadId, messagesToSave);
      renderChat();
      await renderThreads();
      showToast(t("regenerationCancelled"), "success");
    } else {
      target.generationError = String(e?.message || "Unknown error");
      target.generationStatus = "";
      messagesToSave[index].generationError = target.generationError;
      messagesToSave[index].generationStatus = "";
      if (!isViewingThread(threadId)) {
        target.unreadAt = Date.now();
        messagesToSave[index].unreadAt = target.unreadAt;
      }
      await persistThreadMessagesById(threadId, messagesToSave);
      renderChat();
      refreshAllSpeakerButtons();
      refreshMessageControlStates();
      await renderThreads();
      showToast(t("generationFailed"), "error");
    }
  } finally {
    state.pendingPersonaInjectionPersonaId = null;
    state.abortController = null;
    state.activeGenerationThreadId = null;
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

function getCurrentCharacterTtsOptions() {
  const resolved = getResolvedTtsSelection(
    currentCharacter?.ttsLanguage,
    currentCharacter?.ttsVoice,
    currentCharacter?.ttsRate,
    currentCharacter?.ttsPitch,
  );
  const provider = String(
    currentCharacter?.ttsProvider || "kokoro",
  ).toLowerCase();
  const options = {
    voice: resolved.voice || DEFAULT_TTS_VOICE,
    language: resolved.language || DEFAULT_TTS_LANGUAGE,
    rate: resolved.rate,
    pitch: resolved.pitch,
    provider,
    kokoro: buildKokoroOptions(currentCharacter, resolved.rate),
  };
  return options;
}

function getTtsOptionsFromCharacterModal() {
  const resolved = getResolvedCharTtsSelection();
  const provider = getCharModalTtsProviderSelection();
  const kokoroSource = {
    kokoroDevice: document.getElementById("char-tts-kokoro-device")?.value,
    kokoroDtype: document.getElementById("char-tts-kokoro-dtype")?.value,
    kokoroVoice: document.getElementById("char-tts-kokoro-voice")?.value,
    kokoroSpeed: resolved.rate,
  };
  const options = {
    voice: resolved.voice || DEFAULT_TTS_VOICE,
    language: resolved.language || DEFAULT_TTS_LANGUAGE,
    rate: resolved.rate,
    pitch: resolved.pitch,
    provider,
    kokoro: buildKokoroOptions(kokoroSource, resolved.rate),
  };
  return options;
}

function updateCharTtsTestButtonState() {
  const btn = document.getElementById("char-tts-test-btn");
  if (!btn) return;
  const active = state.charModalTtsTestPlaying === true;
  const idleLabel = t("testCharacterVoice");
  const stopLabel = t("stopCharacterVoiceTest");
  btn.innerHTML = active ? ICONS.stop : ICONS.speaker;
  const label = active ? stopLabel : idleLabel;
  btn.setAttribute("aria-label", label);
  btn.setAttribute("title", label);
}

async function playCharacterTtsTestFromModal() {
  if (state.charModalTtsTestPlaying) {
    stopTtsPlayback({ silent: true });
    state.charModalTtsTestPlaying = false;
    updateCharTtsTestButtonState();
    return;
  }
  const textInput = document.getElementById("char-tts-test-text");
  const text =
    String(textInput?.value || "").trim() || "This is a test voice playback.";
  state.charModalTtsTestPlaying = true;
  updateCharTtsTestButtonState();
  try {
    await playTtsAudio(text, getTtsOptionsFromCharacterModal());
  } catch (err) {
    if (isTtsCancelledError(err)) return;
    showToast(
      tf("ttsTestFailed", { error: err.message || t("unknownError") }),
      "error",
    );
  } finally {
    state.charModalTtsTestPlaying = false;
    updateCharTtsTestButtonState();
  }
}

function showKokoroDownloadProgress() {
  const container = document.getElementById("char-tts-kokoro-download");
  if (container) {
    container.classList.remove("hidden");
  }
}

function hideKokoroDownloadProgress() {
  const container = document.getElementById("char-tts-kokoro-download");
  if (container) {
    container.classList.add("hidden");
  }
  const percentEl = document.getElementById("kokoro-download-percent");
  if (percentEl) {
    percentEl.textContent = "0%";
  }
}

function updateKokoroDownloadProgress(percent) {
  const percentEl = document.getElementById("kokoro-download-percent");
  if (percentEl) {
    percentEl.textContent = `${percent}%`;
  }
}

let kokoroDownloadProgressInterval = null;

function startKokoroDownloadProgressMonitor() {
  stopKokoroDownloadProgressMonitor();
  kokoroDownloadProgressInterval = setInterval(() => {
    if (typeof getKokoroVoiceDownloadProgress === "function") {
      const progress = getKokoroVoiceDownloadProgress();
      if (progress && progress.total > 0) {
        updateKokoroDownloadProgress(progress.percent);
      }
    }
  }, 200);
}

function stopKokoroDownloadProgressMonitor() {
  if (kokoroDownloadProgressInterval) {
    clearInterval(kokoroDownloadProgressInterval);
    kokoroDownloadProgressInterval = null;
  }
}

function setupKokoroDownloadCancel() {
  const cancelBtn = document.getElementById("kokoro-download-cancel");
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (typeof cancelKokoroVoiceDownload === "function") {
        cancelKokoroVoiceDownload();
      }
      stopKokoroDownloadProgressMonitor();
      hideKokoroDownloadProgress();
    };
  }
}

async function playTtsAudio(text, options = {}, playback = {}) {
  const normalizedText = preprocessForTTS(text);
  if (!normalizedText) {
    ttsDebug("playTtsAudio:empty-text");
    throw new Error("Text is empty.");
  }
  const provider = String(
    (
      options.provider ||
      getActiveCharacterTtsProvider() ||
      "browser"
    ).toLowerCase(),
  );
  const resolvedRate = Math.max(
    0.5,
    Math.min(2, Number(options?.rate || DEFAULT_TTS_RATE)),
  );
  const resolvedPitch = Math.max(0, Math.min(2, Number(options?.pitch || 1.1)));
  const kokoroSettings = {
    device: String(options?.kokoro?.device || "webgpu"),
    dtype: String(options?.kokoro?.dtype || "auto"),
    voice: String(options?.kokoro?.voice || DEFAULT_KOKORO_VOICE),
    speed: Number.isFinite(Number(options?.kokoro?.speed))
      ? Number(options.kokoro.speed)
      : resolvedRate,
  };
  const normalizedOptions = {
    ...options,
    provider,
    rate: resolvedRate,
    pitch: resolvedPitch,
    kokoro: kokoroSettings,
  };
  if (provider === "kokoro") {
    return playKokoroTts(normalizedText, normalizedOptions, playback);
  }
  return playBrowserTts(normalizedText, normalizedOptions, playback);
}

async function playBrowserTts(normalizedText, options, playback = {}) {
  if (!hasBrowserTtsSupport()) {
    throw new Error("Browser TTS is unavailable.");
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
  ttsDebug("playBrowserTts:start", {
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
      ttsDebug("playBrowserTts:stale-request", {
        requestId,
        active: state.tts.activeRequestId,
      });
      throw makeTtsCancelledError();
    }

    const desiredVoice = String(options?.voice || DEFAULT_TTS_VOICE).trim();
    const desiredLang = String(
      options?.language || DEFAULT_TTS_LANGUAGE,
    ).trim();
    const desiredRate = Math.max(0.5, Math.min(2, Number(options?.rate) || 1));
    const desiredPitch = Math.max(0, Math.min(2, Number(options?.pitch) || 1));
    const voiceMatcher = () => {
      const byExactName = voices.find(
        (v) =>
          String(v.name || "").toLowerCase() === desiredVoice.toLowerCase(),
      );
      if (byExactName) return byExactName;
      const byLangExact = voices.find(
        (v) => String(v.lang || "").toLowerCase() === desiredLang.toLowerCase(),
      );
      if (byLangExact) return byLangExact;
      const baseLang = desiredLang.split("-")[0]?.toLowerCase() || "";
      const byLangPrefix = voices.find((v) =>
        String(v.lang || "")
          .toLowerCase()
          .startsWith(baseLang),
      );
      return byLangPrefix || voices[0] || null;
    };
    const chunks = chunkForTTS(normalizedText);

    const speakChunk = (chunk) =>
      new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.voice = voiceMatcher();
        utterance.lang = desiredLang || DEFAULT_TTS_LANGUAGE;
        utterance.rate = desiredRate;
        utterance.pitch = desiredPitch;
        utterance.onend = () => {
          if (requestId !== state.tts.activeRequestId) {
            ttsDebug("playBrowserTts:cancelled-on-end", { chunk });
            reject(makeTtsCancelledError());
            return;
          }
          ttsDebug("playBrowserTts:chunk-ended", { chunk });
          if (state.tts.audio === utterance) {
            state.tts.audio = null;
          }
          resolve();
        };
        utterance.onerror = (event) => {
          ttsDebug("playBrowserTts:error", { event });
          if (state.tts.audio === utterance) {
            state.tts.audio = null;
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
        ttsDebug("playBrowserTts:speak", {
          voice: utterance.voice?.name || "",
          lang: utterance.lang,
        });
        state.tts.audio = utterance;
        synth.speak(utterance);
      });

    if (chunks.length === 0) {
      return null;
    }

    state.tts.loadingMessageIndex = null;
    finalized = true;
    if (messageIndex !== null) {
      state.tts.speakingMessageIndex = messageIndex;
    }
    refreshAllSpeakerButtons();

    for (const chunk of chunks) {
      if (requestId !== state.tts.activeRequestId) {
        ttsDebug("playBrowserTts:stale-request", { requestId });
        throw makeTtsCancelledError();
      }
      await speakChunk(chunk);
    }
    return null;
  } finally {
    finalizeLoadingState();
  }
}

async function playKokoroTts(normalizedText, options, playback = {}) {
  const messageIndex = Number.isInteger(playback?.messageIndex)
    ? playback.messageIndex
    : null;
  const requestId = state.tts.requestSeq + 1;
  state.tts.requestSeq = requestId;
  state.tts.activeRequestId = requestId;
  ttsDebug("playKokoroTts:start", {
    requestId,
    messageIndex,
    textLength: normalizedText.length,
    kokoro: options.kokoro,
  });
  stopTtsPlayback();
  state.tts.activeRequestId = requestId;
  if (messageIndex !== null) {
    state.tts.loadingMessageIndex = messageIndex;
    refreshAllSpeakerButtons();
  }
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
    const kokoro = await ensureKokoroInstance(
      options.kokoro.device,
      options.kokoro.dtype,
    );

    const chunks = chunkForTTS(normalizedText);
    if (chunks.length === 0) {
      return null;
    }

    const voice = options.kokoro.voice || DEFAULT_KOKORO_VOICE;
    const speed = Number.isFinite(Number(options.kokoro.speed))
      ? Number(options.kokoro.speed)
      : options.rate || 1;

    // Generates a single chunk into a BufferSource (or null on failure).
    // Yields to the browser first via setTimeout so the main thread
    // doesn't freeze during WASM inference.
    const generateBufferSource = async (chunk) => {
      await new Promise((r) => setTimeout(r, 0));
      if (requestId !== state.tts.activeRequestId) {
        throw makeTtsCancelledError();
      }
      ttsDebug("playKokoroTts:generate", { chunk });
      const raw = await kokoro.generate(chunk, { voice, speed });
      const blob = await raw.toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      const bufferSource = await createKokoroBufferSource(arrayBuffer);
      if (bufferSource) return bufferSource;

      // Fallback: AudioContext not available, use HTMLAudioElement
      const url = URL.createObjectURL(blob);
      return { _fallbackUrl: url, _fallbackBlob: blob };
    };

    // Plays a resolved bufferSource (or fallback Audio element).
    // Returns a Promise that resolves when the chunk finishes playing.
    const playResolved = (resolved) => {
      if (requestId !== state.tts.activeRequestId) {
        throw makeTtsCancelledError();
      }

      // HTMLAudioElement fallback path
      if (resolved?._fallbackUrl) {
        const { _fallbackUrl: url } = resolved;
        const audioEl = new Audio(url);
        state.tts.audio = audioEl;
        return new Promise((resolve, reject) => {
          audioEl.onended = () => {
            if (requestId !== state.tts.activeRequestId) {
              ttsDebug("playKokoroTts:cancelled-on-ended-fallback");
              URL.revokeObjectURL(url);
              reject(makeTtsCancelledError());
              return;
            }
            ttsDebug("playKokoroTts:chunk-ended-fallback");
            if (state.tts.audio === audioEl) state.tts.audio = null;
            URL.revokeObjectURL(url);
            resolve();
          };
          audioEl.onerror = () => {
            ttsDebug("playKokoroTts:error-fallback");
            if (state.tts.audio === audioEl) state.tts.audio = null;
            URL.revokeObjectURL(url);
            if (requestId !== state.tts.activeRequestId) {
              reject(makeTtsCancelledError());
              return;
            }
            reject(new Error("Kokoro TTS playback failed."));
          };
          audioEl.play().catch((err) => {
            if (state.tts.audio === audioEl) state.tts.audio = null;
            URL.revokeObjectURL(url);
            if (requestId !== state.tts.activeRequestId) {
              reject(makeTtsCancelledError());
              return;
            }
            reject(err);
          });
        });
      }

      // Normal AudioBufferSourceNode path
      const bufferSource = resolved;
      state.tts.audio = bufferSource;
      return new Promise((resolve, reject) => {
        bufferSource.onended = () => {
          if (requestId !== state.tts.activeRequestId) {
            ttsDebug("playKokoroTts:cancelled-on-ended");
            try {
              bufferSource.disconnect();
            } catch {
              /* ignore */
            }
            reject(makeTtsCancelledError());
            return;
          }
          ttsDebug("playKokoroTts:chunk-ended", { voice });
          if (state.tts.audio === bufferSource) state.tts.audio = null;
          try {
            bufferSource.disconnect();
          } catch {
            /* ignore */
          }
          resolve();
        };
        try {
          bufferSource.start();
        } catch (err) {
          try {
            bufferSource.disconnect();
          } catch {
            /* ignore */
          }
          reject(err);
        }
      });
    };

    if (requestId !== state.tts.activeRequestId) {
      ttsDebug("playKokoroTts:stale-request", {
        requestId,
        active: state.tts.activeRequestId,
      });
      throw makeTtsCancelledError();
    }

    // Transition from loading → speaking state before first chunk starts
    state.tts.loadingMessageIndex = null;
    finalized = true;
    if (messageIndex !== null) {
      state.tts.speakingMessageIndex = messageIndex;
    }
    refreshAllSpeakerButtons();

    const voiceName = options.kokoro.voice || DEFAULT_KOKORO_VOICE;
    const needsDownload =
      typeof window.isVoiceDownloaded === "function"
        ? !window.isVoiceDownloaded(voiceName)
        : true;
    let showedDownloadProgress = false;

    if (needsDownload) {
      showKokoroDownloadProgress();
      setupKokoroDownloadCancel();
      startKokoroDownloadProgressMonitor();
      showedDownloadProgress = true;
    }

    // Pipeline: begin generating chunk[i+1] while chunk[i] is playing,
    // so there is minimal silence between chunks and no cumulative freeze.
    let nextGenPromise = generateBufferSource(chunks[0]);

    for (let i = 0; i < chunks.length; i++) {
      // Kick off the next generation in parallel, chained off the current
      // generation completing (not off playback finishing) so we don't
      // start a second heavy WASM call while the first is still running.
      let followingGenPromise = null;
      if (i + 1 < chunks.length) {
        followingGenPromise = nextGenPromise.then(
          () => generateBufferSource(chunks[i + 1]),
          () => null, // if current gen failed/cancelled, don't chain
        );
      }

      const resolved = await nextGenPromise;
      nextGenPromise = followingGenPromise;

      if (i === 0 && showedDownloadProgress) {
        stopKokoroDownloadProgressMonitor();
        hideKokoroDownloadProgress();
      }

      if (resolved === null) {
        // Cancelled or failed during generation — stop pipeline
        break;
      }

      await playResolved(resolved);

      if (requestId !== state.tts.activeRequestId) {
        ttsDebug("playKokoroTts:stale-after-chunk", {
          requestId,
          active: state.tts.activeRequestId,
        });
        break;
      }
    }

    return null;
  } catch (err) {
    stopKokoroDownloadProgressMonitor();
    hideKokoroDownloadProgress();
    throw err;
  } finally {
    finalizeLoadingState();
  }
}

function stopTtsPlayback(options = {}) {
  state.tts.activeRequestId = state.tts.activeRequestId + 1;
  const audioElement =
    state.tts.audio instanceof HTMLAudioElement ? state.tts.audio : null;
  if (audioElement) {
    try {
      audioElement.pause();
      audioElement.currentTime = 0;
      const srcUrl = audioElement.currentSrc || audioElement.src;
      if (typeof srcUrl === "string" && srcUrl.startsWith("blob:")) {
        URL.revokeObjectURL(srcUrl);
      }
    } catch {
      // ignore
    }
  }
  const bufferSource =
    typeof AudioBufferSourceNode !== "undefined" &&
    state.tts.audio instanceof AudioBufferSourceNode
      ? state.tts.audio
      : null;
  if (bufferSource) {
    try {
      bufferSource.stop();
    } catch {
      // ignore
    }
    try {
      bufferSource.disconnect();
    } catch {
      // ignore
    }
  } else if (hasBrowserTtsSupport()) {
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
  if (!options?.silent) {
    updateCharTtsTestButtonState();
    refreshAllSpeakerButtons();
  }
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

  const audioElement =
    state.tts.audio instanceof HTMLAudioElement ? state.tts.audio : null;
  const hasAudioObject = !!state.tts.audio;
  const audioIsPlaying = audioElement
    ? !audioElement.paused && !audioElement.ended
    : hasBrowserTtsSupport()
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
  const isCurrentlySpeaking = state.tts.speakingMessageIndex !== null;
  const isCurrentlyLoading = state.tts.loadingMessageIndex !== null;
  if (isCurrentlySpeaking || isCurrentlyLoading) {
    ttsDebug("toggleMessageSpeech:stop-active", {
      index,
      isCurrentlySpeaking,
      isCurrentlyLoading,
    });
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
    showToast(
      tf("ttsFailed", { error: err.message || t("unknownError") }),
      "error",
    );
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
  const hasGeneratingMarker = Array.isArray(conversationHistory)
    ? conversationHistory.some((m) => {
        if (!m || m.role !== "assistant") return false;
        const st = String(m.generationStatus || "").trim();
        return st === "generating" || st === "regenerating" || st === "title_generating";
      })
    : false;
  const hasTitleGeneratingMarker = Array.isArray(conversationHistory)
    ? conversationHistory.some((m) => {
        if (!m || m.role !== "assistant") return false;
        return String(m.generationStatus || "").trim() === "title_generating";
      })
    : false;
  const currentThreadGenerating =
    Number.isInteger(currentId) &&
    currentId > 0 &&
    Number.isInteger(activeId) &&
    activeId > 0 &&
    currentId === activeId &&
    (hasGeneratingMarker || !!state.abortController);
  const pendingState = getThreadPendingGenerationState(
    currentId,
    conversationHistory,
  );
  const isBlockedByQueueOrCooldown =
    pendingState === "queued" || pendingState === "cooling_down";
  sendBtn.disabled = isBlockedByQueueOrCooldown;
  sendBtn.classList.toggle(
    "is-generating",
    currentThreadGenerating || isBlockedByQueueOrCooldown || hasTitleGeneratingMarker,
  );
  sendBtn.classList.toggle(
    "danger-btn",
    currentThreadGenerating || isBlockedByQueueOrCooldown || hasTitleGeneratingMarker,
  );
  if (hasTitleGeneratingMarker) {
    sendBtn.textContent = t("generatingLabel");
  } else {
    sendBtn.textContent = currentThreadGenerating ? t("cancel") : t("send");
  }
  personaSelect.disabled =
    currentThreadGenerating || isBlockedByQueueOrCooldown || hasTitleGeneratingMarker;
  refreshMessageControlStates();
  refreshAllSpeakerButtons();
  if (currentThreadGenerating) closePromptHistory();
  renderThreads().catch(() => {});
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
    row.querySelectorAll(".msg-model-info-btn").forEach((btn) => {
      const isInitial = message?.isInitial === true;
      const isUserEdited = message?.userEdited === true;
      btn.disabled =
        isStreaming || isInitial || isUserEdited || !message?.model;
      if (isUserEdited) {
        btn.setAttribute("title", t("msgMetadataUnavailableEdited"));
        btn.setAttribute("aria-label", t("msgMetadataUnavailableEditedAria"));
      } else if (isInitial) {
        btn.setAttribute("title", t("msgMetadataUnavailableInitial"));
        btn.setAttribute("aria-label", t("msgMetadataUnavailableInitialAria"));
      } else if (isStreaming) {
        btn.setAttribute("title", t("msgMetadataUnavailableGenerating"));
        btn.setAttribute(
          "aria-label",
          t("msgMetadataUnavailableGeneratingAria"),
        );
      } else if (!message?.model) {
        btn.setAttribute("title", t("msgMetadataUnavailableEdited"));
        btn.setAttribute("aria-label", t("msgMetadataUnavailableEditedAria"));
      } else {
        btn.setAttribute("title", t("msgModelInfoTitle"));
        btn.setAttribute("aria-label", t("msgModelInfoTitle"));
      }
    });
    row.querySelectorAll(".msg-system-prompt-btn").forEach((btn) => {
      const hasMsg = message && Number.isInteger(index) && index >= 0;
      btn.disabled = !hasMsg;
      if (hasMsg) {
        btn.setAttribute("title", t("msgSystemPromptTitle"));
        btn.setAttribute("aria-label", t("msgSystemPromptTitle"));
      } else {
        btn.setAttribute("title", t("msgSystemPromptUnavailable"));
        btn.setAttribute("aria-label", t("msgSystemPromptUnavailable"));
      }
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
      const remoteCatalog = await fetchOpenRouterModelCatalog(
        controller.signal,
      );
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
    state.modelCatalog.length > 0
      ? state.modelCatalog
      : getFallbackModelCatalog();

  const pricingFilter =
    state.settings.modelPricingFilter === "free" ||
    state.settings.modelPricingFilter === "paid"
      ? state.settings.modelPricingFilter
      : "all";
  const modalityFilter =
    state.settings.modelModalityFilter === "all" ? "all" : "text-only";
  const sortOrder = [
    "name_asc",
    "name_desc",
    "created_asc",
    "created_desc",
  ].includes(state.settings.modelSortOrder)
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

  const favoriteModels = state.settings.favoriteModels || [];

  filtered.sort((a, b) => {
    const aFav = favoriteModels.includes(a.id);
    const bFav = favoriteModels.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    if (sortOrder === "name_desc") return b.name.localeCompare(a.name);
    if (sortOrder === "created_asc") return a.created - b.created;
    if (sortOrder === "created_desc") return b.created - a.created;
    return a.name.localeCompare(b.name);
  });

  modelSelect.innerHTML = "";
  filtered.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    const lowContextMark = isLowContextRoleplayModel(m) ? " | ! <=16k" : "";
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

  renderModelCustomDropdown(filtered, catalog, targetModel);

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

function renderModelCustomDropdown(models, catalog, selectedModel) {
  const dropdownOptions = document.getElementById("model-dropdown-options");
  const dropdown = document.getElementById("model-custom-dropdown");
  const display = document.getElementById("model-select-display");
  if (!dropdownOptions || !dropdown || !display) return;

  const favoriteModels = state.settings.favoriteModels || [];
  const favoriteModelsList = models.filter((m) =>
    favoriteModels.includes(m.id),
  );
  const otherModelsList = models.filter((m) => !favoriteModels.includes(m.id));

  dropdownOptions.innerHTML = "";

  if (favoriteModelsList.length > 0) {
    const header = document.createElement("div");
    header.className = "model-dropdown-header";
    header.textContent = t("favoriteModels");
    dropdownOptions.appendChild(header);

    favoriteModelsList.forEach((m) => {
      const isSelected = m.id === selectedModel;
      const lowContextMark = isLowContextRoleplayModel(m) ? " | ! <=16k" : "";
      const moderationMark = m.isModerated === true ? " | Moderated" : "";

      const option = document.createElement("div");
      option.className = `model-dropdown-option${isSelected ? " selected" : ""} favorite`;
      option.dataset.modelId = m.id;

      const nameSpan = document.createElement("span");
      nameSpan.className = "model-name";
      nameSpan.textContent = `${m.name} (${m.id})${lowContextMark}${moderationMark}`;
      nameSpan.style.color = "#ffd700";

      const starSpan = document.createElement("span");
      starSpan.className = "model-star favorited";
      starSpan.innerHTML = "&#9733;";
      starSpan.title = t("modelUnfavorite");
      starSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleModelFavorite(m.id);
      });

      option.appendChild(nameSpan);
      option.appendChild(starSpan);
      option.addEventListener("click", () => {
        selectModelFromDropdown(m.id);
      });

      dropdownOptions.appendChild(option);
    });
  }

  if (otherModelsList.length > 0) {
    if (favoriteModelsList.length > 0) {
      const header = document.createElement("div");
      header.className = "model-dropdown-header";
      header.textContent = t("all");
      dropdownOptions.appendChild(header);
    }

    otherModelsList.forEach((m) => {
      const isSelected = m.id === selectedModel;
      const lowContextMark = isLowContextRoleplayModel(m) ? " | ! <=16k" : "";
      const moderationMark = m.isModerated === true ? " | Moderated" : "";

      const option = document.createElement("div");
      option.className = `model-dropdown-option${isSelected ? " selected" : ""}`;
      option.dataset.modelId = m.id;

      const nameSpan = document.createElement("span");
      nameSpan.className = "model-name";
      nameSpan.textContent = `${m.name} (${m.id})${lowContextMark}${moderationMark}`;

      const starSpan = document.createElement("span");
      starSpan.className = "model-star";
      starSpan.innerHTML = "&#9734;";
      starSpan.title = t("modelFavorite");
      starSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleModelFavorite(m.id);
      });

      option.appendChild(nameSpan);
      option.appendChild(starSpan);
      option.addEventListener("click", () => {
        selectModelFromDropdown(m.id);
      });

      dropdownOptions.appendChild(option);
    });
  }

  const selectedModelData =
    models.find((m) => m.id === selectedModel) ||
    catalog.find((m) => m.id === selectedModel);
  if (selectedModelData) {
    const lowContextMark = isLowContextRoleplayModel(selectedModelData)
      ? " | ! <=16k"
      : "";
    const moderationMark =
      selectedModelData.isModerated === true ? " | Moderated" : "";
    display.textContent = `${selectedModelData.name} (${selectedModelData.id})${lowContextMark}${moderationMark}`;
  } else if (selectedModel) {
    display.textContent = `${selectedModel} (custom)`;
  } else {
    display.textContent = "Select a model...";
  }
}

function toggleModelFavorite(modelId) {
  if (!state.settings.favoriteModels) {
    state.settings.favoriteModels = [];
  }
  const index = state.settings.favoriteModels.indexOf(modelId);
  if (index === -1) {
    state.settings.favoriteModels.push(modelId);
  } else {
    state.settings.favoriteModels.splice(index, 1);
  }
  saveSettings();
  renderSettingsModelOptions();
}

function selectModelFromDropdown(modelId) {
  const modelSelect = document.getElementById("model-select");
  if (modelSelect) {
    modelSelect.value = modelId;
    state.settings.model = modelId;
    saveSettings();
    refreshSelectedModelMeta();
    updateModelPill();
  }
  const dropdown = document.getElementById("model-custom-dropdown");
  if (dropdown) {
    dropdown.classList.add("hidden");
  }
  renderSettingsModelOptions();
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
    byId.set(
      "openrouter/auto",
      normalizeModelCatalogItem({
        id: "openrouter/auto",
        name: "Auto",
        architecture: { modality: "text->text" },
        top_provider: {},
        pricing: {},
        created: 0,
        context_length: 16384,
      }),
    );
  }
  if (!byId.has("openrouter/free")) {
    byId.set(
      "openrouter/free",
      normalizeModelCatalogItem({
        id: "openrouter/free",
        name: "OpenRouter Free Router",
        architecture: { modality: "text->text" },
        top_provider: {},
        pricing: { prompt: "0", completion: "0", request: "0", image: "0" },
        created: 0,
        context_length: 16384,
      }),
    );
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
    state.modelCatalog.length > 0
      ? state.modelCatalog
      : getFallbackModelCatalog();
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
  const video = document.getElementById("image-preview-video");
  const modal = document.getElementById("image-preview-modal");
  const downloadBtn = document.getElementById("image-preview-download-btn");
  if (!img) return;
  state.imagePreview.src = src;
  state.imagePreview.isVideo = false;
  img.src = src;
  img.draggable = false;
  img.classList.remove("hidden");
  if (video) video.classList.add("hidden");
  downloadBtn.title = "Download image";
  downloadBtn.setAttribute("aria-label", "Download image");
  resetImagePreviewZoom();
  modal?.classList.remove("hidden");
}

function openVideoPreview(src) {
  if (!src) return;
  const video = document.getElementById("image-preview-video");
  const img = document.getElementById("image-preview-img");
  const modal = document.getElementById("image-preview-modal");
  const downloadBtn = document.getElementById("image-preview-download-btn");
  if (!video || !img || !modal) return;

  img.classList.add("hidden");
  video.classList.remove("hidden");
  video.src = src;
  state.imagePreview.src = src;
  state.imagePreview.isVideo = true;
  video.controls = true;
  video.play();

  downloadBtn.title = "Download video";
  downloadBtn.setAttribute("aria-label", "Download video");

  modal?.classList.remove("hidden");
}

function closeImagePreview() {
  endImagePreviewPanning();
  const video = document.getElementById("image-preview-video");
  if (video) {
    video.pause();
    video.src = "";
  }
  const img = document.getElementById("image-preview-img");
  if (img) {
    img.classList.remove("hidden");
  }
  const videoEl = document.getElementById("image-preview-video");
  if (videoEl) {
    videoEl.classList.add("hidden");
  }
  const modal = document.getElementById("image-preview-modal");
  modal?.classList.add("hidden");
  state.imagePreview.isVideo = false;
}

function applyImagePreviewZoom() {
  const img = document.getElementById("image-preview-img");
  if (!img) return;
  const scale = Math.max(
    state.imagePreview.minScale,
    Math.min(
      state.imagePreview.maxScale,
      Number(state.imagePreview.scale) || 1,
    ),
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
  if (state.imagePreview.isVideo) return;
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.12 : -0.12;
  state.imagePreview.scale += delta;
  applyImagePreviewZoom();
}

function onImagePreviewPointerDown(e) {
  const modal = document.getElementById("image-preview-modal");
  if (!modal || modal.classList.contains("hidden")) return;
  if (state.imagePreview.isVideo) return;
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
  if (
    img &&
    pointerId != null &&
    typeof img.releasePointerCapture === "function"
  ) {
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
  a.download = state.imagePreview.isVideo ? "video" : "image";
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
  if (
    !currentThread ||
    Number(currentThread.id) !== Number(threadId) ||
    !document.getElementById("chat-view")?.classList.contains("active")
  ) {
    return false;
  }
  const visibilityState =
    typeof document !== "undefined" ? document.visibilityState : "visible";
  if (visibilityState !== "visible") return false;
  if (
    typeof document !== "undefined" &&
    typeof document.hasFocus === "function" &&
    !document.hasFocus()
  ) {
    return false;
  }
  return true;
}

async function persistThreadMessagesById(threadId, messages, extra = {}) {
  const msgs = Array.isArray(messages) ? messages : [];
  const allMessagesFinished = msgs.every(
    (m) => !m.generationStatus || m.generationStatus === "",
  );

  const updated = {
    messages: msgs,
    ...extra,
  };

  if (allMessagesFinished && !extra._skipUpdatedAt) {
    updated.updatedAt = Date.now();
  }

  await db.threads.update(threadId, updated);
  if (currentThread && Number(currentThread.id) === Number(threadId)) {
    if (updated.updatedAt) {
      currentThread = { ...currentThread, ...updated };
      conversationHistory = updated.messages;
      state.lastSyncSeenUpdatedAt = Number(updated.updatedAt || 0);
    } else {
      currentThread.messages = updated.messages;
      conversationHistory = updated.messages;
    }
  }
  if (updated.updatedAt) {
    broadcastSyncEvent({
      type: "thread-updated",
      threadId,
      updatedAt: updated.updatedAt,
    });
  }
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
  });
  if (currentThread && Number(currentThread.id) === id) {
    conversationHistory = threadMessages;
    currentThread.pendingGenerationReason = reason;
    currentThread.pendingGenerationQueuedAt = queuedAt;
    renderChat();
  }
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: id,
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
    const allFinished = qMessages.every(
      (m) => !m.generationStatus || m.generationStatus === "",
    );
    const qUpdate = { messages: qMessages };
    if (allFinished) {
      qUpdate.updatedAt = Date.now();
    }
    await db.threads.update(qid, qUpdate);
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
  await renderThreads();
}

async function tryStartQueuedGenerationForCurrentThread() {
  if (state.sending || !currentThread) return;
  const threadId = Number(currentThread.id);
  if (!state.generationQueue.includes(threadId)) return;
  const head = Number(state.generationQueue[0]);
  if (head !== threadId) return;
  if (isInCompletionCooldown()) {
    await ensureQueuedThreadCoolingDown(threadId);
    return;
  }
  await clearThreadGenerationQueueFlag(threadId);
  await generateBotReply();
}

async function processNextQueuedThread() {
  if (state.sending) return;
  if (state.generationQueue.length === 0) return;
  const nextThreadId = Number(state.generationQueue[0]);
  if (!nextThreadId) return;
  if (isInCompletionCooldown()) {
    await ensureQueuedThreadCoolingDown(nextThreadId);
    return;
  }
  if (currentThread && Number(currentThread.id) === nextThreadId) {
    await tryStartQueuedGenerationForCurrentThread();
    return;
  }
  await clearThreadGenerationQueueFlag(nextThreadId);
  const thread = await db.threads.get(nextThreadId);
  if (!thread) {
    await processNextQueuedThread();
    return;
  }
  const characterBase = await db.characters.get(thread.characterId);
  const character = characterBase
    ? resolveCharacterForLanguage(characterBase, thread.characterLanguage || "")
    : null;
  if (!character) {
    await processNextQueuedThread();
    return;
  }
  const tempThread = {
    ...thread,
    writingInstructionsTurnCount: getThreadWritingInstructionsTurnCount(thread),
  };
  const tempConversation = (thread.messages || []).map((m) => ({
    ...m,
    role: m.role === "ai" ? "assistant" : m.role,
  }));
  const tempPersona = thread.selectedPersonaId
    ? await db.personas.get(thread.selectedPersonaId)
    : null;
  const writingTurnCountForThread =
    getThreadWritingInstructionsTurnCount(tempThread);
  const writingTurnIndex = getNextWritingInstructionsTurnIndex(tempThread);
  const promptContext = await buildSystemPrompt(character, {
    includeOneTimeExtraPrompt:
      shouldIncludeOneTimeExtraPrompt(tempConversation),
    writingInstructionsTurnIndex: writingTurnIndex,
    returnTrace: true,
    personaOverride: tempPersona,
    historyOverride: tempConversation,
    threadOverride: tempThread,
  });
  const systemPrompt = promptContext.prompt;
  const promptMessages = [
    { role: "system", content: systemPrompt },
    ...tempConversation.map((m) => ({
      role: m.role === "ai" ? "assistant" : m.role,
      content: m.content,
    })),
  ];
  if (promptContext.personaInjectionForEndMessages) {
    promptMessages.push({
      role: "system",
      content: promptContext.personaInjectionForEndMessages,
    });
  }
  state.currentRequestMessages = promptMessages;

  const existingPendingIdx = findLatestPendingAssistantIndex(tempConversation);
  let pending = null;
  let pendingIndex = existingPendingIdx;
  if (existingPendingIdx >= 0) {
    pending = tempConversation[existingPendingIdx];
    pending.content = "";
    pending.generationStatus = "generating";
    pending.generationError = "";
    pending.truncatedByFilter = false;
    if (!Number.isInteger(Number(pending.writingInstructionsTurnIndex))) {
      pending.writingInstructionsTurnIndex = writingTurnIndex;
      pending.writingInstructionsCounted = false;
    }
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
      writingInstructionsTurnIndex: writingTurnIndex,
      writingInstructionsCounted: false,
    };
    tempConversation.push(pending);
    pendingIndex = tempConversation.length - 1;
  }
  pending.requestMessages = state.currentRequestMessages || null;
  await persistThreadMessagesById(nextThreadId, tempConversation);
  state.sending = true;
  state.activeGenerationThreadId = nextThreadId;
  state.chatAutoScroll = true;
  state.abortController = new AbortController();
  setSendingState(true);
  try {
    const result = await callOpenRouter(
      systemPrompt,
      tempConversation,
      state.settings.model,
      null,
      state.abortController.signal,
    );
    pending.content = result.content || "";
    pending.finishReason = result.finishReason || "";
    pending.nativeFinishReason = result.nativeFinishReason || "";
    pending.generationStatus = "";
    pending.unreadAt = Date.now();
    if (Number(state.settings.completionCooldown) > 0) {
      state.lastCompletionTime = Date.now();
      updateCooldownPinnedToast();
    }
    pending.generationId = String(result.generationId || "");
    pending.completionMeta = result.completionMeta || null;
    pending.generationInfo = result.generationInfo || null;
    pending.model = result.model || state.settings.model || "";
    pending.temperature = Number(state.settings.temperature) || 0;
    pending.usedLoreEntries = Array.isArray(promptContext.usedLoreEntries)
      ? promptContext.usedLoreEntries
      : [];
    pending.usedMemorySummary = promptContext.usedMemorySummary || "";
    if (
      pending.writingInstructionsTurnIndex &&
      !pending.writingInstructionsCounted
    ) {
      tempThread.writingInstructionsTurnCount =
        (tempThread.writingInstructionsTurnCount || 0) + 1;
    }
    pending.truncatedByFilter = result.truncatedByFilter === true;
    await db.threads.update(nextThreadId, {
      messages: tempConversation,
      updatedAt: Date.now(),
      writingInstructionsTurnCount: tempThread.writingInstructionsTurnCount,
    });
    await persistLorebookStates(nextThreadId, tempConversation);
  } catch (e) {
    if (e.name === "AbortError") {
      pending.generationStatus = "cancelled";
    } else {
      pending.generationError = e.message || String(e);
      pending.generationStatus = "error";
    }
  } finally {
    state.pendingPersonaInjectionPersonaId = null;
    state.abortController = null;
    state.sending = false;
    state.activeGenerationThreadId = null;
    setSendingState(false);
    await renderThreads();
    await processNextQueuedThread();
  }
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

function getThreadPendingGenerationState(threadId, messages = []) {
  const id = Number(threadId);
  if (!Number.isInteger(id)) return "";
  if (state.sending && Number(state.activeGenerationThreadId) === id) {
    return "generating";
  }
  const list = Array.isArray(messages) ? messages : [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const m = list[i];
    if (!m || m.role !== "assistant") continue;
    const status = String(m.generationStatus || "").trim();
    if (
      status === "queued" ||
      status === "cooling_down" ||
      status === "generating" ||
      status === "regenerating"
    ) {
      return status;
    }
  }
  return "";
}

function refreshCurrentThreadCooldownBubble(secondsOverride = null) {
  if (!currentThread || !Array.isArray(conversationHistory)) return;
  const seconds =
    Number.isFinite(Number(secondsOverride)) && Number(secondsOverride) > 0
      ? Number(secondsOverride)
      : getCooldownRemainingSeconds();
  if (seconds <= 0) return;
  const label = tf("cooldownToastActive", { seconds });
  const idx = findLatestPendingAssistantIndex(conversationHistory);
  if (idx < 0) return;
  const msg = conversationHistory[idx];
  if (!msg || String(msg.generationStatus || "").trim() !== "cooling_down")
    return;
  if (String(msg.content || "") === label) return;
  msg.content = label;
  const row = document.querySelector(
    `#chat-log .chat-row[data-message-index="${idx}"]`,
  );
  const content = row?.querySelector(".message-content");
  if (content) {
    content.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(label)}`;
  }
}

async function ensureQueuedThreadCoolingDown(threadId) {
  const id = Number(threadId);
  if (!Number.isInteger(id)) return;
  const thread = await db.threads.get(id);
  if (!thread) return;
  const messages = Array.isArray(thread.messages)
    ? thread.messages.map((m) => ({ ...m }))
    : [];
  const seconds = getCooldownRemainingSeconds();
  const label = tf("cooldownToastActive", { seconds });
  const hadPendingBefore = findLatestPendingAssistantIndex(messages) >= 0;
  let idx = findLatestPendingAssistantIndex(messages);
  let prevContent = "";
  let prevStatus = "";
  if (idx < 0) {
    idx = messages.length;
    messages.push({
      role: "assistant",
      content: label,
      createdAt: Date.now(),
      generationStatus: "cooling_down",
      generationError: "",
      truncatedByFilter: false,
      usedLoreEntries: [],
      usedMemorySummary: "",
    });
    prevContent = "";
    prevStatus = "";
  } else {
    prevContent = String(messages[idx].content || "");
    prevStatus = String(messages[idx].generationStatus || "").trim();
    messages[idx].generationStatus = "cooling_down";
    messages[idx].content = label;
    messages[idx].generationError = "";
    messages[idx].truncatedByFilter = false;
  }

  const needsReason =
    String(thread.pendingGenerationReason || "").trim() !== "cooldown";
  const hasChanges =
    !hadPendingBefore ||
    needsReason ||
    prevContent !== label ||
    prevStatus !== "cooling_down";
  if (!hasChanges) return;

  await db.threads.update(id, {
    messages,
    pendingGenerationReason: "cooldown",
    pendingGenerationQueuedAt: Number(
      thread.pendingGenerationQueuedAt || Date.now(),
    ),
  });
  if (currentThread && Number(currentThread.id) === id) {
    conversationHistory = messages;
    currentThread.pendingGenerationReason = "cooldown";
    currentThread.pendingGenerationQueuedAt = Number(
      thread.pendingGenerationQueuedAt || Date.now(),
    );
    renderChat();
  }
  broadcastSyncEvent({
    type: "thread-updated",
    threadId: id,
  });
  await renderThreads();
}

async function tickQueueCooldownState() {
  if (state.sending || state.generationQueue.length === 0) return;
  const headId = Number(state.generationQueue[0]);
  if (!Number.isInteger(headId)) return;
  if (isInCompletionCooldown()) {
    await ensureQueuedThreadCoolingDown(headId);
    return;
  }
  await processNextQueuedThread();
}

function findLatestPendingAssistantIndex(messages) {
  const list = Array.isArray(messages) ? messages : [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const m = list[i];
    if (!m || m.role !== "assistant") continue;
    const status = String(m.generationStatus || "").trim();
    if (
      status === "queued" ||
      status === "cooling_down" ||
      status === "generating" ||
      status === "regenerating" ||
      status === "title_generating"
    ) {
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

async function persistCurrentThread(forceUpdate = false) {
  if (!currentThread) return;

  const allMessagesFinished = conversationHistory.every(
    (m) => !m.generationStatus || m.generationStatus === "",
  );
  const shouldUpdateTimestamp = forceUpdate || allMessagesFinished;

  const updated = {
    messages: conversationHistory,
    selectedPersonaId: currentThread.selectedPersonaId || null,
    lastPersonaInjectionPersonaId:
      currentThread.lastPersonaInjectionPersonaId || null,
    writingInstructionsTurnCount:
      getThreadWritingInstructionsTurnCount(currentThread),
  };

  if (shouldUpdateTimestamp) {
    updated.updatedAt = Date.now();
  }

  await db.threads.update(currentThread.id, updated);
  if (shouldUpdateTimestamp) {
    currentThread = { ...currentThread, ...updated };
    state.lastSyncSeenUpdatedAt = Number(currentThread.updatedAt || 0);
    broadcastSyncEvent({
      type: "thread-updated",
      threadId: currentThread.id,
      updatedAt: currentThread.updatedAt,
    });
  } else {
    currentThread.messages = updated.messages;
    currentThread.selectedPersonaId = updated.selectedPersonaId;
    currentThread.lastPersonaInjectionPersonaId =
      updated.lastPersonaInjectionPersonaId;
    currentThread.writingInstructionsTurnCount =
      updated.writingInstructionsTurnCount;
  }
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
  const chatViewActive = document
    .getElementById("chat-view")
    ?.classList.contains("active");
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
      if (data.type === "thread-viewed") {
        delete state.threadUnreadCounts[Number(data.threadId)];
        await renderThreads();
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
  const characterBase = thread.characterId
    ? await db.characters.get(thread.characterId)
    : null;
  currentThread = thread;
  state.lastSyncSeenUpdatedAt = Number(thread.updatedAt || 0);
  currentCharacter = characterBase
    ? resolveCharacterForLanguage(characterBase, thread.characterLanguage || "")
    : currentCharacter;
  conversationHistory = (thread.messages || []).map((m) => ({
    ...m,
    role: m.role === "ai" ? "assistant" : m.role,
  }));
  state.unreadNeedsUserScrollThreadId =
    getUnreadAssistantCount(conversationHistory) > 0 ? Number(thread.id) : null;
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
      writingInstructionsTurnCount: 0,
      createdAt: session.updatedAt || Date.now(),
      updatedAt: session.updatedAt || Date.now(),
    });
  }
}

async function buildSystemPrompt(character, options = {}) {
  const threadOverride = options?.threadOverride || currentThread;
  const defaultPersona = await getCharacterDefaultPersona();
  const personaForContext =
    options?.personaOverride || currentPersona || defaultPersona;
  const charName = String(character?.name || "Character");
  const initialUserName = threadOverride?.initialUserName;
  const personaName = initialUserName || String(defaultPersona?.name || "You");
  const basePromptRaw = (
    character.systemPrompt ||
    state.settings.globalPromptTemplate ||
    ""
  ).trim();
  const basePrompt = replaceLorePlaceholders(
    basePromptRaw,
    personaName,
    charName,
  );
  let writingInstructionsRaw = "";
  const wiId = character?.writingInstructionId;
  if (wiId && wiId !== "none") {
    const wi = await db.writingInstructions.get(Number(wiId));
    if (wi && wi.instructions) {
      const threadLanguage =
        character?.activeLanguage || options?.characterLanguage || "en";
      writingInstructionsRaw = String(
        wi.instructions[threadLanguage] ||
          Object.values(wi.instructions)[0] ||
          "",
      ).trim();
    }
  } else {
    writingInstructionsRaw = String(
      character?.writingInstructions || "",
    ).trim();
  }
  const writingTurnIndex = Math.max(
    1,
    Number(options?.writingInstructionsTurnIndex) || 1,
  );
  const includeWritingInstructions =
    writingInstructionsRaw.length > 0 &&
    shouldInjectWritingInstructionsForTurn(writingTurnIndex);
  const writingInstructions = includeWritingInstructions
    ? replaceLorePlaceholders(writingInstructionsRaw, personaName, charName)
    : "";
  const oneTimeExtraRaw =
    options?.includeOneTimeExtraPrompt === true
      ? String(character?.oneTimeExtraPrompt || "").trim()
      : "";
  const oneTimeExtra = replaceLorePlaceholders(
    oneTimeExtraRaw,
    personaName,
    charName,
  );
  const promptBeforePersona = [basePrompt, writingInstructions, oneTimeExtra]
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
  let personaInjectionForEndMessages = null;
  if (
    personaForContext &&
    shouldInjectPersonaContext(
      personaForContext,
      options?.threadOverride || null,
    )
  ) {
    const placement =
      character?.personaInjectionPlacement || "end_system_prompt";
    const personaInjected = renderPersonaInjectionContent(personaForContext);
    const templateNotEmpty = String(
      state.settings.personaInjectionTemplate ||
        DEFAULT_SETTINGS.personaInjectionTemplate ||
        "",
    ).trim();
    if (placement === "end_messages" && templateNotEmpty) {
      personaInjectionForEndMessages = personaInjected;
    } else if (placement !== "end_messages") {
      systemPromptWithPersona = applyPersonaInjectionPlacement(
        promptBeforePersona,
        personaInjected,
        placement,
      );
    }
    state.pendingPersonaInjectionPersonaId = personaForContext.id || null;
  }

  if (loreEntries.length > 0) {
    contextSections.push(
      `## Lore Context\n${loreEntries
        .map((e) => `- [${e.lorebookName || "Lore"}] ${e.content}`)
        .join("\n")}`,
    );
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
      personaInjectionForEndMessages,
    };
  }
  return { prompt, personaInjectionForEndMessages };
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

async function openMessageModelInfoModal(index) {
  const message = conversationHistory[index];
  if (!message) return;
  if (!message.model && !message.temperature) return;
  openModal("message-model-info-modal");
  const modelEl = document.getElementById("message-model-info-model");
  const temperatureEl = document.getElementById(
    "message-model-info-temperature",
  );
  if (modelEl) {
    modelEl.textContent = message.model || "-";
  }
  if (temperatureEl) {
    temperatureEl.textContent =
      message.temperature != null ? message.temperature : "-";
  }
}

async function openMessageSystemPromptModal(index) {
  const container = document.getElementById("message-system-prompt-list");
  if (!container) return;
  container.innerHTML = "";

  const message = conversationHistory[index];
  if (!message) {
    const notice = document.createElement("p");
    notice.className = "muted";
    notice.textContent = t("msgSystemPromptUnavailable");
    container.appendChild(notice);
    openModal("message-system-prompt-modal");
    return;
  }

  let messagesToShow = [];

  if (message.requestMessages && Array.isArray(message.requestMessages)) {
    messagesToShow = message.requestMessages;
  } else if (index >= 0 && index < conversationHistory.length) {
    messagesToShow = conversationHistory.slice(0, index + 1);
  }

  if (messagesToShow.length === 0) {
    const notice = document.createElement("p");
    notice.className = "muted";
    notice.textContent = t("msgSystemPromptUnavailable");
    container.appendChild(notice);
    openModal("message-system-prompt-modal");
    return;
  }

  messagesToShow.forEach((msg, idx) => {
    const entryWrapper = document.createElement("div");
    entryWrapper.className = "system-prompt-entry";

    const header = document.createElement("div");
    header.className = "system-prompt-header";
    const roleLabel = document.createElement("span");
    roleLabel.className = "system-prompt-role";
    roleLabel.textContent = msg?.role || "unknown";
    const toggleIcon = document.createElement("span");
    toggleIcon.className = "system-prompt-toggle";
    toggleIcon.textContent = "▼";
    header.appendChild(roleLabel);
    header.appendChild(toggleIcon);

    const contentPre = document.createElement("pre");
    contentPre.className = "metadata-json system-prompt-content";
    contentPre.style.display = "none";
    contentPre.textContent = msg?.content ?? "";

    header.addEventListener("click", () => {
      if (contentPre.style.display === "none") {
        contentPre.style.display = "block";
        toggleIcon.textContent = "▲";
      } else {
        contentPre.style.display = "none";
        toggleIcon.textContent = "▼";
      }
    });

    entryWrapper.appendChild(header);
    entryWrapper.appendChild(contentPre);
    container.appendChild(entryWrapper);
  });

  openModal("message-system-prompt-modal");
}

function shouldInjectPersonaContext(persona, threadOverride = null) {
  if (!persona) return false;
  const template =
    state.settings.personaInjectionTemplate ||
    DEFAULT_SETTINGS.personaInjectionTemplate;
  if (!String(template || "").trim()) return false;
  return true;
}

function renderPersonaInjectionContent(persona) {
  const template =
    state.settings.personaInjectionTemplate ||
    DEFAULT_SETTINGS.personaInjectionTemplate;
  const name = String(persona?.name || "").trim() || "Anon";
  const description = String(persona?.description || "").trim();
  let result = String(template || "");
  if (description) {
    result = result
      .replace(/\{\{\s*name\s*\}\}/gi, name)
      .replace(/\{\{\s*description\s*\}\}/gi, description);
  } else {
    result = result
      .replace(/\{\{\s*name\s*\}\}/gi, name)
      .replace(/\{\{\s*description\s*\}\}/gi, "");
  }
  return result;
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
  const systemMessages = promptMessages
    .filter((msg) => msg.role === "system")
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  const effectiveMaxTokens = computeEffectiveMaxTokensForRequest(
    resolvedModel,
    promptMessages,
  );
  const body = {
    model: resolvedModel,
    messages: promptMessages,
    max_completion_tokens: effectiveMaxTokens,
    temperature: clampTemperature(state.settings.temperature),
    top_p: Number(state.settings.topP) || 1,
    frequency_penalty: Number(state.settings.frequencyPenalty) || 0,
    presence_penalty: Number(state.settings.presencePenalty) || 0,
    stream: !!state.settings.streamEnabled,
  };

  state.currentRequestMessages = body.messages;

  try {
    const attempts = body.stream ? 1 : 3;
    const response = await requestCompletionWithRetry(
      body,
      attempts,
      onChunk,
      signal,
    );
    return { ...response, systemMessages };
  } catch (primaryErr) {
    if (!fallbackModel) throw primaryErr;
    const fallbackBody = { ...body, model: fallbackModel };
    const fallbackAttempts = fallbackBody.stream ? 1 : 2;
    const fallbackResponse = await requestCompletionWithRetry(
      fallbackBody,
      fallbackAttempts,
      onChunk,
      signal,
    );
    return { ...fallbackResponse, systemMessages };
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
  const chatPill = document.getElementById("chat-model-pill");
  const homePill = document.getElementById("home-model-pill");
  if (!chatPill && !homePill) return;
  const model = resolveModelForRequest(state.settings.model);
  const provider =
    state.lastUsedModel &&
    state.lastUsedProvider &&
    String(state.lastUsedModel) === String(model)
      ? ` (${state.lastUsedProvider})`
      : "";
  const text = tf("modelPill", { model: `${model}${provider}` });
  if (chatPill) chatPill.textContent = text;
  if (homePill) homePill.textContent = text;
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

  const includeOneTimeExtra =
    shouldIncludeOneTimeExtraPrompt(conversationHistory);
  const previousPendingPersonaInjection =
    state.pendingPersonaInjectionPersonaId;
  let systemPrompt = "";
  let personaInjectionForEndMessages = null;
  try {
    const result = await buildSystemPrompt(currentCharacter, {
      includeOneTimeExtraPrompt: includeOneTimeExtra,
      returnTrace: false,
    });
    systemPrompt = result.prompt || "";
    personaInjectionForEndMessages = result.personaInjectionForEndMessages;
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
  if (personaInjectionForEndMessages) {
    messages.push({
      role: "system",
      content: personaInjectionForEndMessages,
    });
  }

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
      ? escapeHtml(raw).replace(/\n/g, "<br>")
      : raw.replace(/\n/g, "<br>");
  }
  if (typeof window.markdownit === "function") {
    const md = window.markdownit("default", {
      html: !state.settings.allowMessageHtml,
      linkify: true,
      typographer: false,
      breaks: true,
    });
    return md.render(raw);
  }
  return markdownToHtml(raw);
}

function markdownToHtml(input) {
  let html = state.settings.allowMessageHtml
    ? escapeHtml(input)
    : String(input);

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
