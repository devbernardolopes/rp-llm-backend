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
  preferFreeVariant: true,
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
};

const UI_LANG_OPTIONS = ["en", "fr", "it", "de", "es", "pt-BR"];

const I18N = {
  en: {
    threads: "Threads",
    createCharacter: "+ Character",
    importCharacter: "Import Character",
    settings: "Settings",
    personas: "Personas",
    loreBooks: "Lore Books",
    shortcuts: "Shortcuts",
    back: "Back",
    previousPrompts: "Previous prompts",
    send: "Send",
    cancel: "Cancel",
    hideShortcuts: "Hide Shortcuts",
    showShortcuts: "Show Shortcuts",
    autoReply: "Auto-reply",
    enterToSend: "ENTER to send",
    settingsTitle: "Settings",
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
  selectedThreadIds: new Set(),
  characterTagFilters: [],
  characterSortMode: "updated_desc",
  expandedCharacterTagIds: new Set(),
  modalDirty: {
    "character-modal": false,
    "personas-modal": false,
    "shortcuts-modal": false,
    "tags-modal": false,
  },
  charModalTtsTestPlaying: false,
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
  applyInterfaceLanguage();
  loadUiState();
  renderTagPresetsDataList();
  setupSettingsControls();
  setupEvents();
  initBrowserTtsSupport();
  updateModelPill();
  await migrateLegacySessions();
  await ensurePersonasInitialized();
  await renderAll();
  setupCrossWindowSync();
  applyMarkdownCustomCss();
  renderCharacterTagFilterChips();
  updateThreadRenameButtonState();
  updateScrollBottomButtonVisibility();
}

function ensureTagCatalogInitialized() {
  if (state.settings.tagsInitialized === true) return;
  state.settings.customTags = [...PREDEFINED_CHARACTER_TAGS];
  state.settings.tagsInitialized = true;
  saveSettings();
}

function t(key) {
  const lang = state.i18nLang in I18N ? state.i18nLang : "en";
  return I18N[lang]?.[key] || I18N.en[key] || key;
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

function applyInterfaceLanguage() {
  state.i18nLang = resolveInterfaceLanguage();

  const createBtn = document.getElementById("create-character-btn");
  if (createBtn && !document.getElementById("left-pane")?.classList.contains("collapsed")) {
    createBtn.textContent = t("createCharacter");
  }
  const importBtn = document.getElementById("import-character-btn");
  if (importBtn) {
    const paneCollapsed = document
      .getElementById("left-pane")
      ?.classList.contains("collapsed");
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
    bottomButtons[4].title = "Tags";
    bottomButtons[4].setAttribute("aria-label", "Tags");
  }

  const backBtn = document.getElementById("back-to-main");
  if (backBtn) backBtn.textContent = t("back");
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
  const uiLangSelect = document.getElementById("ui-language-select");
  const uiLangLabel = uiLangSelect?.closest("label");
  const labelNodes = uiLangLabel
    ? Array.from(uiLangLabel.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE)
    : [];
  if (labelNodes.length > 0) labelNodes[0].nodeValue = `${t("languageLabel")}\n            `;
  if (uiLangSelect) {
    const oAuto = uiLangSelect.querySelector('option[value="auto"]');
    const oEn = uiLangSelect.querySelector('option[value="en"]');
    const oFr = uiLangSelect.querySelector('option[value="fr"]');
    const oIt = uiLangSelect.querySelector('option[value="it"]');
    const oDe = uiLangSelect.querySelector('option[value="de"]');
    const oEs = uiLangSelect.querySelector('option[value="es"]');
    const oPt = uiLangSelect.querySelector('option[value="pt-BR"]');
    if (oAuto) oAuto.textContent = t("languageAuto");
    if (oEn) oEn.textContent = t("languageEnglish");
    if (oFr) oFr.textContent = t("languageFrench");
    if (oIt) oIt.textContent = t("languageItalian");
    if (oDe) oDe.textContent = t("languageGerman");
    if (oEs) oEs.textContent = t("languageSpanish");
    if (oPt) oPt.textContent = t("languagePortugueseBr");
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
    .getElementById("back-to-main")
    .addEventListener("click", showMainView);
  document
    .getElementById("rename-thread-btn")
    .addEventListener("click", renameCurrentThread);
  document
    .getElementById("scroll-bottom-btn")
    .addEventListener("click", () => scrollChatToBottom(true));
  document.getElementById("pane-toggle").addEventListener("click", togglePane);
  document.getElementById("edit-current-character-btn").innerHTML = ICONS.edit;
  document
    .getElementById("edit-current-character-btn")
    .addEventListener("click", () => {
      if (!currentCharacter) return;
      openCharacterModal(currentCharacter);
    });
  document
    .getElementById("char-avatar-file")
    .addEventListener("change", onAvatarFileChange);
  document
    .getElementById("char-avatar")
    .addEventListener("input", onAvatarUrlInput);
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
  document.getElementById("char-name").addEventListener("input", () => {
    updateNameLengthCounter("char-name", "char-name-count", 128);
  });
  document.getElementById("persona-name").addEventListener("input", () => {
    updateNameLengthCounter("persona-name", "persona-name-count", 128);
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
  document.getElementById("save-tags-btn").addEventListener("click", saveTagsFromModal);
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
      if (modal.id === "confirm-modal") {
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
    "#persona-is-default",
  ]);
  markModalDirtyOnInput("shortcuts-modal", ["#shortcuts-raw"]);
  markModalDirtyOnInput("tags-modal", ["#tags-custom-raw"]);
  updateNameLengthCounter("char-name", "char-name-count", 128);
  updateNameLengthCounter("persona-name", "persona-name-count", 128);
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

function setupSettingsControls() {
  const uiLanguageSelect = document.getElementById("ui-language-select");
  const openRouterApiKey = document.getElementById("openrouter-api-key");
  const puterSignInBtn = document.getElementById("puter-signin-btn");
  const ttsTestText = document.getElementById("tts-test-text");
  const ttsTestPlayBtn = document.getElementById("tts-test-play-btn");
  const ttsTestStatus = document.getElementById("tts-test-status");
  const puterRow = puterSignInBtn?.closest(".settings-inline-row");
  const modelSelect = document.getElementById("model-select");
  const maxTokensSlider = document.getElementById("max-tokens-slider");
  const maxTokensValue = document.getElementById("max-tokens-value");
  const temperatureSlider = document.getElementById("temperature-slider");
  const temperatureValue = document.getElementById("temperature-value");
  const preferFreeVariant = document.getElementById("prefer-free-variant");
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
  modelSelect.innerHTML = "";
  MODEL_OPTIONS.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.value;
    opt.textContent = m.label;
    modelSelect.appendChild(opt);
  });
  modelSelect.value = state.settings.model;
  if (!modelSelect.value) {
    modelSelect.value = DEFAULT_SETTINGS.model;
    state.settings.model = modelSelect.value;
    saveSettings();
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
  maxTokensSlider.value = String(clampMaxTokens(state.settings.maxTokens));
  maxTokensValue.textContent = maxTokensSlider.value;
  temperatureSlider.value = String(
    clampTemperature(state.settings.temperature),
  );
  temperatureValue.textContent = clampTemperature(
    state.settings.temperature,
  ).toFixed(2);
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
  preferFreeVariant.checked = state.settings.preferFreeVariant !== false;
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
  });

  modelSelect.addEventListener("change", () => {
    state.settings.model = modelSelect.value;
    saveSettings();
    updateModelPill();
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
    const value = clampMaxTokens(Number(maxTokensSlider.value));
    state.settings.maxTokens = value;
    maxTokensValue.textContent = String(value);
    updateSettingsRangeTone(maxTokensSlider, value, {
      warnBelow: 1024,
      dangerAbove: 4096,
    });
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

  preferFreeVariant.addEventListener("change", () => {
    state.settings.preferFreeVariant = preferFreeVariant.checked;
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
      applyInterfaceLanguage();
      await renderShortcutsBar();
      setSendingState(state.sending);
    });
  }
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
  window.setTimeout(() => {
    toast.remove();
  }, 2600);
}

function openConfirmDialog(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirm-modal");
    const yesBtn = document.getElementById("confirm-yes-btn");
    const noBtn = document.getElementById("confirm-no-btn");
    const cancelBtn = document.getElementById("confirm-cancel-btn");
    yesBtn.textContent = "Confirm";
    noBtn.classList.remove("hidden");
    cancelBtn.classList.remove("hidden");
    state.confirmMode = "confirm";
    document.getElementById("confirm-title").textContent = title || "Confirm";
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
    yesBtn.textContent = "OK";
    noBtn.classList.add("hidden");
    cancelBtn.classList.add("hidden");
    state.confirmMode = "info";
    document.getElementById("confirm-title").textContent = title || "Message";
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
  yesBtn.textContent = "Confirm";
  noBtn.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");
  state.confirmMode = "confirm";
  const resolver = state.confirmResolver;
  state.confirmResolver = null;
  if (typeof resolver === "function") resolver(!!value);
}

function openTextInputDialog({
  title = "Input",
  label = "Value",
  value = "",
  saveLabel = "Save",
  cancelLabel = "Cancel",
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
    titleEl.textContent = title;
    labelEl.textContent = label;
    inputEl.value = String(value || "");
    inputEl.maxLength = Math.max(1, Number(maxLength) || 128);
    saveBtn.textContent = saveLabel;
    cancelBtn.textContent = cancelLabel;
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
  showToast("Shortcuts saved.", "success");
}

async function saveTagsFromModal() {
  const raw = String(document.getElementById("tags-custom-raw")?.value || "");
  const previousTags = getAllAvailableTags();
  const tags = raw
    .split(/\r?\n/)
    .map((line) => normalizeTagValue(line))
    .filter(Boolean)
    .filter(
      (tag, i, arr) =>
        arr.findIndex((x) => x.toLowerCase() === tag.toLowerCase()) === i,
    );
  const nextTagLowers = new Set(tags.map((t) => t.toLowerCase()));
  const removedTags = previousTags.filter((t) => !nextTagLowers.has(t.toLowerCase()));
  const removedTagLowers = new Set(removedTags.map((t) => t.toLowerCase()));

  let affectedCharacters = [];
  if (removedTags.length > 0) {
    const allCharacters = await db.characters.toArray();
    affectedCharacters = allCharacters.filter((char) =>
      (Array.isArray(char.tags) ? char.tags : []).some((tag) =>
        removedTagLowers.has(String(tag || "").toLowerCase()),
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
        "Remove Tags",
        `Removing tags will update these characters:\n\n${affectedList}${extra}\n\nContinue?`,
      );
      if (!ok) return;
    }
  }

  state.settings.customTags = tags;
  state.settings.tagsInitialized = true;
  saveSettings();

  if (removedTags.length > 0 && affectedCharacters.length > 0) {
    await db.transaction("rw", db.characters, async () => {
      for (const char of affectedCharacters) {
        const nextCharTags = (Array.isArray(char.tags) ? char.tags : []).filter(
          (tag) => !removedTagLowers.has(String(tag || "").toLowerCase()),
        );
        await db.characters.update(char.id, {
          tags: nextCharTags,
          updatedAt: Date.now(),
        });
      }
    });
    if (currentCharacter) {
      const refreshed = await db.characters.get(currentCharacter.id);
      if (refreshed) currentCharacter = refreshed;
    }
    state.characterTagFilters = state.characterTagFilters.filter(
      (tag) => !removedTagLowers.has(String(tag || "").toLowerCase()),
    );
    saveUiState();
  }

  renderTagPresetsDataList();
  renderCharacterTagPresetButtons();
  renderCharacterTagFilterChips();
  await renderCharacters();
  state.modalDirty["tags-modal"] = false;
  closeActiveModal();
  showToast("Tags updated.", "success");
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
        ? "No characters match the active tag filters."
        : "No characters yet. Create one to begin.";
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
    id.textContent = `char #${char.id} - ${threadCountByCharId.get(Number(char.id)) || 0} threads`;

    const dates = document.createElement("p");
    dates.className = "character-dates";
    dates.textContent = `Created: ${formatDateTime(char.createdAt)}\nUpdated: ${formatDateTime(char.updatedAt)}`;

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
      more.textContent = expanded ? "less" : "more...";
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

    const deleteCharBtn = iconButton("delete", "Delete character", async (e) => {
      e.stopPropagation();
      await deleteCharacter(char.id);
    });
    deleteCharBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteCharBtn);

    actions.appendChild(
      iconButton("duplicate", "Duplicate character", async (e) => {
        e.stopPropagation();
        await duplicateCharacter(char.id);
      }),
    );

    actions.appendChild(
      iconButton("edit", "Edit character", (e) => {
        e.stopPropagation();
        openCharacterModal(char);
      }),
    );

    actions.appendChild(
      iconButton("export", "Export character", async (e) => {
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
  const threads = await db.threads.toArray();
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
    empty.textContent = "No threads yet.";
    list.appendChild(empty);
    return;
  }

  const bulkBar = document.createElement("div");
  bulkBar.className = "thread-bulk-bar";
  const selectedCount = state.selectedThreadIds.size;
  const selectAll = document.createElement("input");
  selectAll.type = "checkbox";
  selectAll.className = "thread-select thread-select-all thread-bulk-select";
  selectAll.title = "Select all threads";
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
  const deleteSelectedBtn = iconButton("delete", "Delete selected threads", async () => {
    await deleteSelectedThreads();
  });
  deleteSelectedBtn.classList.add("danger-icon-btn", "thread-bulk-delete");
  deleteSelectedBtn.disabled = selectedCount === 0;

  bulkBar.append(selectAll, deleteSelectedBtn);
  list.appendChild(bulkBar);

  const charIds = [
    ...new Set(threads.map((t) => t.characterId).filter(Boolean)),
  ];
  const characters = await db.characters.where("id").anyOf(charIds).toArray();
  const charMap = new Map(characters.map((c) => [c.id, c]));

  threads.forEach((thread) => {
    const char = charMap.get(thread.characterId);

    const row = document.createElement("div");
    row.className = "thread-row";
    row.addEventListener("click", (e) => {
      if (e.target?.closest(".actions")) return;
      openThread(thread.id);
    });
    if (currentThread?.id === thread.id) {
      row.classList.add("active-thread");
    }

    const selectBox = document.createElement("input");
    selectBox.type = "checkbox";
    selectBox.className = "thread-select";
    selectBox.checked = state.selectedThreadIds.has(Number(thread.id));
    selectBox.title = "Select thread";
    selectBox.addEventListener("click", (e) => e.stopPropagation());
    selectBox.addEventListener("change", () => {
      if (selectBox.checked) state.selectedThreadIds.add(Number(thread.id));
      else state.selectedThreadIds.delete(Number(thread.id));
      renderThreads();
    });

    const avatar = document.createElement("img");
    avatar.className = "thread-avatar";
    avatar.src =
      char?.avatar || fallbackAvatar(char?.name || "Thread", 512, 512);
    avatar.alt = "thread avatar";

    const info = document.createElement("div");
    info.className = "thread-info";

    const meta = document.createElement("div");
    meta.className = "thread-meta";
    meta.innerHTML = `<span>${escapeHtml(char?.name || "Unknown")}</span><span>#${thread.id}</span>`;

    const titleBtn = document.createElement("button");
    titleBtn.className = "thread-title";
    titleBtn.textContent = thread.title || `Thread ${thread.id}`;
    titleBtn.title = "Open thread";
    titleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openThread(thread.id);
    });
    const titleRow = document.createElement("div");
    titleRow.className = "thread-title-row";
    const renameMiniBtn = iconButton("edit", "Rename thread", async (e) => {
      e.stopPropagation();
      await renameThread(thread.id);
    });
    renameMiniBtn.classList.add("thread-rename-mini");
    titleRow.append(titleBtn, renameMiniBtn);

    info.append(titleRow, meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const deleteThreadBtn = iconButton("delete", "Delete thread", async (e) => {
      e.stopPropagation();
      await deleteThread(thread.id);
    });
    deleteThreadBtn.classList.add("danger-icon-btn");
    actions.appendChild(deleteThreadBtn);

    if (char) {
      actions.appendChild(
        iconButton("edit", "Edit thread character", async (e) => {
          e.stopPropagation();
          const latestCharacter = await db.characters.get(char.id);
          if (latestCharacter) openCharacterModal(latestCharacter);
        }),
      );
    }

    actions.appendChild(
      iconButton("duplicate", "Duplicate thread", async (e) => {
        e.stopPropagation();
        await duplicateThread(thread.id);
      }),
    );
    const favBtn = iconButton(
      thread.favorite ? "starFilled" : "star",
      thread.favorite ? "Unfavorite thread" : "Favorite thread",
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
    list.appendChild(row);
  });
}

async function deleteSelectedThreads() {
  const ids = Array.from(state.selectedThreadIds)
    .map(Number)
    .filter(Number.isInteger);
  if (ids.length === 0) return;
  const ok = await openConfirmDialog(
    "Delete Threads",
    `Delete ${ids.length} selected thread${ids.length === 1 ? "" : "s"}?`,
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
  showToast(
    `${ids.length} thread${ids.length === 1 ? "" : "s"} deleted.`,
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
    createBtn.textContent = "+";
    createBtn.title = t("createCharacter");
    if (importBtn) {
      importBtn.textContent = "↥";
      importBtn.title = t("importCharacter");
    }
  } else {
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
  updateScrollBottomButtonVisibility();
}

function showChatView() {
  document.getElementById("chat-view").classList.add("active");
  document.getElementById("main-view").classList.remove("active");
  updateThreadRenameButtonState();
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
  } else if (modalId === "shortcuts-modal") {
    document.getElementById("shortcuts-raw").value =
      state.settings.shortcutsRaw || "";
  } else if (modalId === "tags-modal") {
    document.getElementById("tags-custom-raw").value = (
      Array.isArray(state.settings.customTags) ? state.settings.customTags : []
    ).join("\n");
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
    state.editingCharacterId ? "Edit Character" : "Create Character";

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
      "Invalid Initial Messages",
      String(err?.message || "Could not parse initial messages."),
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
    await openInfoDialog("Missing Field", "Character name is required.");
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
    showToast("Character updated.", "success");
  } else {
    payload.createdAt = Date.now();
    await db.characters.add(payload);
    showToast("Character created.", "success");
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
    opt.textContent = `${persona.name || `Persona ${persona.id}`}${persona.isDefault ? " (Default)" : ""}`;
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
  showToast(`Persona switched to ${currentPersona?.name || "You"}.`, "success");
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
  const wantsDefault = document.getElementById("persona-is-default").checked;

  if (!name) {
    await openInfoDialog("Missing Field", "Persona name is required.");
    return;
  }
  if (countWords(description) > 100) {
    await openInfoDialog(
      "Persona Description",
      "Persona description must be 100 words or less.",
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
      isDefault: shouldBeDefault,
      updatedAt: Date.now(),
    });
    showToast("Persona updated.", "success");
  } else {
    await db.personas.add({
      name,
      avatar,
      description,
      isDefault: shouldBeDefault,
      order: personas.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    showToast("Persona created.", "success");
  }

  document.getElementById("persona-name").value = "";
  updateNameLengthCounter("persona-name", "persona-name-count", 128);
  document.getElementById("persona-avatar").value = "";
  document.getElementById("persona-avatar-file").value = "";
  document.getElementById("persona-description").value = "";
  document.getElementById("persona-is-default").checked = false;
  state.editingPersonaId = null;
  document.getElementById("save-persona-btn").textContent = "Save Persona";
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
    empty.textContent = "No personas yet.";
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
    drag.title = "Drag to reorder";

    const avatar = document.createElement("img");
    avatar.className = "thread-avatar";
    avatar.src =
      persona.avatar || fallbackAvatar(persona.name || "P", 512, 512);
    avatar.alt = "persona avatar";

    const info = document.createElement("div");
    info.className = "thread-info";
    const title = document.createElement("div");
    title.className = "thread-title";
    title.textContent = `${persona.name}${persona.isDefault ? " (Default)" : ""}`;
    const desc = document.createElement("div");
    desc.className = "thread-meta";
    desc.textContent = persona.description || "";
    info.append(title, desc);

    const actions = document.createElement("div");
    actions.className = "actions";
    if (!persona.isDefault) {
      actions.appendChild(
        iconButton("badge", "Set default persona", async () => {
          await setDefaultPersona(persona.id);
        }),
      );
    }
    actions.appendChild(
      iconButton("regenerate", "Edit persona", async () => {
        loadPersonaForEditing(persona);
      }),
    );
    actions.appendChild(
      iconButton("delete", "Delete persona", async () => {
        await deletePersona(persona.id);
      }),
    );

    row.append(drag, avatar, info, actions);
    list.appendChild(row);
  });
}

async function deletePersona(personaId) {
  const ok = await openConfirmDialog("Delete Persona", "Delete this persona?");
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
  showToast("Persona deleted.", "success");
}

function loadPersonaForEditing(persona) {
  state.editingPersonaId = persona.id;
  document.getElementById("persona-name").value = persona.name || "";
  updateNameLengthCounter("persona-name", "persona-name-count", 128);
  document.getElementById("persona-avatar").value = persona.avatar || "";
  document.getElementById("persona-avatar-file").value = "";
  document.getElementById("persona-description").value =
    persona.description || "";
  document.getElementById("persona-is-default").checked = !!persona.isDefault;
  document.getElementById("save-persona-btn").textContent = "Update Persona";
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
  defaultOpt.textContent = "Use global default";
  select.appendChild(defaultOpt);
  personas.forEach((persona) => {
    const opt = document.createElement("option");
    opt.value = String(persona.id);
    opt.textContent = `${persona.name || `Persona ${persona.id}`}${persona.isDefault ? " (Global Default)" : ""}`;
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
  showToast("Default persona updated.", "success");
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
    openInfoDialog("Invalid File", "Please choose an image file.");
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

function onAvatarFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    openInfoDialog("Invalid File", "Please choose an image file.");
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
  showToast("Character duplicated.", "success");
}

async function exportCharacter(characterId) {
  const character = await db.characters.get(characterId);
  if (!character) {
    showToast("Character not found.", "error");
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
  showToast("Character exported.", "success");
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
    showToast("Character imported.", "success");
  } catch (err) {
    showToast(`Import failed: ${err.message}`, "error");
  }
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
  showToast("Character deleted.", "success");
}

async function startNewThread(characterId) {
  const character = await db.characters.get(characterId);
  if (!character) return;
  const defaultPersonaForCharacter = await getCharacterDefaultPersona(character);
  const initialMessages = await buildThreadInitialMessages(character);

  const newThread = {
    characterId,
    title: `Thread ${new Date().toLocaleString()}`,
    titleGenerated: false,
    titleManual: false,
    messages: initialMessages,
    selectedPersonaId: defaultPersonaForCharacter?.id || null,
    lastPersonaInjectionPersonaId: null,
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
  if (
    state.settings.autoReplyEnabled !== false &&
    shouldAutoReplyFromInitialMessages(initialMessages)
  ) {
    await generateBotReply();
  }
  showToast("Thread created.", "success");
}

async function duplicateThread(threadId) {
  const source = await db.threads.get(threadId);
  if (!source) return;

  const copy = {
    characterId: source.characterId,
    title: `${source.title || `Thread ${source.id}`} Copy`,
    titleGenerated: false,
    titleManual: false,
    messages: [...(source.messages || [])],
    selectedPersonaId: source.selectedPersonaId || null,
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
  showToast("Thread duplicated.", "success");
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
  showToast(next ? "Thread favorited." : "Thread unfavorited.", "success");
}

async function deleteThread(threadId) {
  const ok = await openConfirmDialog("Delete Thread", "Delete this thread?");
  if (!ok) return;

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
  }
  await renderThreads();
  await renderCharacters();
  showToast("Thread deleted.", "success");
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
}

function updateThreadRenameButtonState() {
  const btn = document.getElementById("rename-thread-btn");
  if (!btn) return;
  btn.innerHTML = ICONS.edit;
  btn.disabled = !currentThread;
}

async function renameCurrentThread() {
  if (!currentThread) return;
  await renameThread(currentThread.id);
}

async function renameThread(threadId) {
  const thread = await db.threads.get(threadId);
  if (!thread) return;
  const next = await openTextInputDialog({
    title: "Rename Thread",
    label: "Thread Title",
    value: thread.title || `Thread ${thread.id}`,
    saveLabel: "Save",
    cancelLabel: "Cancel",
    maxLength: 128,
  });
  if (next === null) return;
  const title = String(next || "").trim().slice(0, 128);
  if (!title) {
    await openInfoDialog("Missing Field", "Thread title is required.");
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
  showToast("Thread renamed.", "success");
}

function updateChatTitle() {
  const titleEl = document.getElementById("chat-title");
  if (!titleEl) return;
  if (!currentThread) {
    titleEl.textContent = "Thread";
    return;
  }
  const displayTitle = `${currentCharacter?.name || "Unknown"} - ${
    currentThread.title || `Thread ${currentThread.id}`
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

  conversationHistory.forEach((message, idx) => {
    log.appendChild(buildMessageRow(message, idx, false));
  });

  scrollChatToBottom();
  updateScrollBottomButtonVisibility();
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
  const disableControlsForRow = streaming;

  if (message.role === "assistant") {
    controls.appendChild(messageIndex);
    const delBtn = iconButton("delete", "Delete message", async () => {
        await deleteMessageAt(index);
      });
    delBtn.classList.add("msg-delete-btn");
    delBtn.classList.add("danger-icon-btn");
    delBtn.disabled = disableControlsForRow;
    controls.appendChild(delBtn);

    const regenBtn = iconButton("regenerate", "Regenerate message", async () => {
      await regenerateMessage(index);
    });
    regenBtn.classList.add("msg-regen-btn");
    regenBtn.disabled = state.sending || disableControlsForRow;
    controls.appendChild(regenBtn);
    const editBtn = iconButton("edit", "Edit message", async () => {
      beginInlineMessageEdit(index, content);
    });
    editBtn.classList.add("msg-edit-btn");
    editBtn.disabled = disableControlsForRow || isTruncated;
    controls.appendChild(editBtn);

    const copyBtn = iconButton("copy", "Copy message", async () => {
      await copyMessage(message.content || "");
    });
    copyBtn.classList.add("msg-copy-btn");
    copyBtn.disabled = disableControlsForRow;
    controls.appendChild(copyBtn);
    const infoBtn = iconButton("info", "Message metadata", async () => {
      await openMessageMetadataModal(index);
    });
    infoBtn.classList.add("msg-info-btn");
    infoBtn.disabled =
      disableControlsForRow ||
      message.isInitial === true ||
      message.userEdited === true;
    controls.appendChild(infoBtn);

    const speakerBtn = iconButton("speaker", "Speak message", async (e) => {
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
    const editBtn = iconButton("edit", "Edit message", async () => {
      beginInlineMessageEdit(index, content);
    });
    editBtn.classList.add("msg-edit-btn");
    editBtn.disabled = disableControlsForRow || isTruncated;
    controls.appendChild(editBtn);
    const infoBtn = iconButton("info", "Message metadata", async () => {
      await openMessageMetadataModal(index);
    });
    infoBtn.classList.add("msg-info-btn");
    infoBtn.disabled =
      disableControlsForRow ||
      message.isInitial === true ||
      message.userEdited === true;
    controls.appendChild(infoBtn);
  }

  header.appendChild(controls);

  const content = document.createElement("div");
  content.className = "message-content";
  content.addEventListener("dblclick", () => {
    const rowEl = content.closest(".chat-row");
    if (rowEl?.dataset?.streaming === "1") return;
    beginInlineMessageEdit(index, content);
  });
  if (streaming) {
    content.textContent = message.content;
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
}

function buildTruncationNotice() {
  const box = document.createElement("div");
  box.className = "message-truncated-note";
  const p1 = document.createElement("p");
  p1.textContent =
    "This message has been truncated by the currently active model.";
  const p2 = document.createElement("p");
  p2.textContent =
    "You can delete or regenerate this message. You can also trigger another model response, or send a new message.";
  box.append(p1, p2);
  return box;
}

function beginInlineMessageEdit(index, contentEl) {
  if (!contentEl || !currentThread) return;
  const rowEl = contentEl.closest(".chat-row");
  if (rowEl?.dataset?.streaming === "1") return;
  const message = conversationHistory[index];
  if (!message) return;
  if (message.truncatedByFilter === true) return;
  stopTtsPlayback();

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
    await persistCurrentThread();
    await renderThreads();
    showToast("Message updated.", "success");
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
    button.setAttribute(
      "title",
      "Voice support is not configured in this browser.",
    );
    button.setAttribute("aria-label", "Voice support unavailable");
    return;
  }
  if (isLoading) {
    button.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>';
    button.setAttribute("title", "Loading speech... Click again to cancel.");
    button.setAttribute("aria-label", "Loading speech");
  } else if (isSpeaking) {
    button.innerHTML = ICONS.stop;
    button.setAttribute("title", "Cancel speech");
    button.setAttribute("aria-label", "Cancel speech");
  } else {
    button.innerHTML = ICONS.speaker;
    button.setAttribute("title", "Speak message");
    button.setAttribute("aria-label", "Speak message");
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
    cancelOngoingGeneration();
    return;
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
    await generateBotReply();
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

  await generateBotReply();
}

async function generateBotReply() {
  if (!currentThread || !currentCharacter || state.sending) return;
  const includeOneTimeExtra = shouldIncludeOneTimeExtraPrompt(conversationHistory);

  const log = document.getElementById("chat-log");
  const pending = {
    role: "assistant",
    content: "",
    createdAt: Date.now(),
    finishReason: "",
    nativeFinishReason: "",
    truncatedByFilter: false,
    generationId: "",
    completionMeta: null,
    generationInfo: null,
  };
  conversationHistory.push(pending);
  await persistCurrentThread();
  const pendingRow = buildMessageRow(
    pending,
    conversationHistory.length - 1,
    true,
  );
  const pendingContent = pendingRow.querySelector(".message-content");
  pendingContent.innerHTML =
    '<span class="spinner" aria-hidden="true"></span> Generating...';
  log.appendChild(pendingRow);
  scrollChatToBottom();

  state.sending = true;
  state.chatAutoScroll = true;
  state.abortController = new AbortController();
  setSendingState(true);

  try {
    const systemPrompt = await buildSystemPrompt(currentCharacter, {
      includeOneTimeExtraPrompt: includeOneTimeExtra,
    });
    const result = await callOpenRouter(
      systemPrompt,
      conversationHistory,
      state.settings.model,
      (chunk) => {
        pending.content += chunk;
        pendingRow.querySelector(".message-content").innerHTML =
          renderMessageHtml(pending.content, pending.role);
        if (state.settings.streamEnabled) {
          persistCurrentThread().catch(() => {});
        }
        scrollChatToBottom();
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
    renderMessageContent(pendingRow.querySelector(".message-content"), pending);
    pendingRow.dataset.streaming = "0";
    refreshAllSpeakerButtons();
    commitPendingPersonaInjectionMarker();
    await persistCurrentThread();
    await maybeGenerateThreadTitle();
    scrollChatToBottom();

    if (
      currentCharacter.useMemory !== false &&
      conversationHistory.length > 0 &&
      conversationHistory.length % 20 === 0
    ) {
      await summarizeMemory(currentCharacter);
    }

    await renderThreads();
  } catch (e) {
    state.pendingPersonaInjectionPersonaId = null;
    if (isAbortError(e)) {
      if (!pending.content.trim()) {
        const idx = conversationHistory.lastIndexOf(pending);
        if (idx >= 0) conversationHistory.splice(idx, 1);
        pendingRow.remove();
      } else {
        renderMessageContent(pendingRow.querySelector(".message-content"), pending);
        pendingRow.dataset.streaming = "0";
        refreshAllSpeakerButtons();
      }
      await persistCurrentThread();
      await renderThreads();
      showToast("Generation cancelled.", "success");
    } else {
      pendingRow.querySelector(".message-content").textContent =
        `Error: ${e.message}`;
    }
  } finally {
    state.pendingPersonaInjectionPersonaId = null;
    state.abortController = null;
    state.sending = false;
    setSendingState(false);
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
    const systemPrompt = await buildSystemPrompt(currentCharacter, {
      includeOneTimeExtraPrompt: includeOneTimeExtra,
    });
    target.content = "";
    renderChat();
    const row = document.getElementById("chat-log").children[index];
    const contentEl = row?.querySelector(".message-content");
    if (row) row.dataset.streaming = "1";
    refreshMessageControlStates();
    if (contentEl)
      contentEl.innerHTML =
        '<span class="spinner" aria-hidden="true"></span> Regenerating...';
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
    commitPendingPersonaInjectionMarker();
    await persistCurrentThread();
    renderChat();
    await renderThreads();
  } catch (e) {
    state.pendingPersonaInjectionPersonaId = null;
    if (isAbortError(e)) {
      await persistCurrentThread();
      renderChat();
      await renderThreads();
      showToast("Regeneration cancelled.", "success");
    } else {
      target.content = originalContent;
      await persistCurrentThread();
      renderChat();
      await renderThreads();
      await openInfoDialog("Regenerate Failed", String(e.message || "Unknown error"));
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
    showToast("Message copied.", "success");
  } catch {
    await openInfoDialog("Copy Failed", "Unable to copy message.");
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
    showToast(`TTS test failed: ${err.message || "unknown error"}`, "error");
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
    showToast("Open a thread first.", "error");
    return;
  }
  const message = conversationHistory[index];
  if (!message || message.role !== "assistant") {
    ttsDebug("toggleMessageSpeech:blocked-not-assistant", {
      index,
      role: message?.role,
      hasMessage: !!message,
    });
    showToast("TTS is only available for assistant messages.", "error");
    return;
  }
  if (!String(message.content || "").trim()) {
    ttsDebug("toggleMessageSpeech:blocked-empty-message", { index });
    showToast("Message is empty.", "error");
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
    showToast(`TTS failed: ${err.message || "unknown error"}`, "error");
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
  sendBtn.disabled = false;
  sendBtn.classList.toggle("is-generating", sending);
  sendBtn.classList.toggle("danger-btn", sending);
  sendBtn.textContent = sending ? t("cancel") : t("send");
  personaSelect.disabled = sending;
  refreshMessageControlStates();
  refreshAllSpeakerButtons();
  if (sending) closePromptHistory();
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

    row.querySelectorAll(".msg-delete-btn,.msg-copy-btn").forEach((btn) => {
      btn.disabled = isStreaming;
    });
    row.querySelectorAll(".msg-regen-btn").forEach((btn) => {
      btn.disabled = state.sending || isStreaming;
    });
    row.querySelectorAll(".msg-edit-btn").forEach((btn) => {
      btn.disabled = isStreaming || isTruncated;
    });
    row.querySelectorAll(".msg-info-btn").forEach((btn) => {
      btn.disabled =
        isStreaming ||
        message?.isInitial === true ||
        message?.userEdited === true;
    });
  });
}

function openImagePreview(src) {
  if (!src) return;
  const img = document.getElementById("image-preview-img");
  if (!img) return;
  img.src = src;
  openModal("image-preview-modal");
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
  const personaForContext = currentPersona || defaultPersona;
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
  const loreEntries = await getCharacterLoreEntries(character);
  const memory =
    character.useMemory === false ? null : await getMemorySummary(character.id);
  const contextSections = [];
  state.pendingPersonaInjectionPersonaId = null;
  let systemPromptWithPersona = promptBeforePersona;
  if (personaForContext && shouldInjectPersonaContext(personaForContext)) {
    const personaInjected = renderPersonaInjectionContent(personaForContext);
    systemPromptWithPersona = applyPersonaInjectionPlacement(
      promptBeforePersona,
      personaInjected,
      character?.personaInjectionPlacement || "end_system_prompt",
    );
    state.pendingPersonaInjectionPersonaId = personaForContext.id || null;
  }

  if (loreEntries.length > 0) {
    contextSections.push(
      `## Lore Context\n${loreEntries.map((e) => `- ${e.content}`).join("\n")}`,
    );
  }
  if (memory) {
    contextSections.push(`## Memory Context\n${memory}`);
  }

  return [systemPromptWithPersona, ...contextSections]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function shouldInjectPersonaContext(persona) {
  if (!persona) return false;
  const mode =
    state.settings.personaInjectionWhen === "on_change"
      ? "on_change"
      : "always";
  if (mode === "always") return true;
  const currentPersonaId = Number(persona.id);
  const lastInjected = Number(currentThread?.lastPersonaInjectionPersonaId);
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

async function getCharacterLoreEntries(character) {
  const loreIds = Array.isArray(character.lorebookIds)
    ? character.lorebookIds.map(Number).filter(Number.isInteger)
    : [];
  if (loreIds.length === 0) return [];
  return db.lorebooks.where("id").anyOf(loreIds).toArray();
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
  const body = {
    model: resolvedModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({
        role: normalizeApiRole(m.apiRole || m.role),
        content: m.content,
      })),
    ],
    max_tokens: clampMaxTokens(state.settings.maxTokens),
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
  const selected = model || state.settings.model || DEFAULT_SETTINGS.model;
  if (state.settings.preferFreeVariant === false) return selected;
  if (selected === "openrouter/auto" || selected === "openrouter/free") {
    return selected;
  }
  if (selected.endsWith(":free")) return selected;
  return `${selected}:free`;
}

function getFallbackModel(resolvedModel, originalModel) {
  if (resolvedModel === originalModel) return null;
  if (!originalModel) return null;
  if (state.settings.preferFreeVariant !== false) return null;
  return originalModel;
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
    });
  }

  const proxyUrl = "/api/chat-completions";
  try {
    const proxyRes = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
    if (proxyRes.status !== 404 && proxyRes.status !== 405) {
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

function clampMaxTokens(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.maxTokens;
  const rounded = Math.round(n / 64) * 64;
  return Math.max(512, Math.min(16384, rounded));
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
