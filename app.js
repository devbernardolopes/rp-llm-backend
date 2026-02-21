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
];

const ICONS = {
  duplicate:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><rect x="4" y="4" width="11" height="11" rx="2"></rect></svg>',
  edit:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4.2-1 10-10a2 2 0 0 0-2.8-2.8l-10 10L4 20z"></path><path d="M13.5 6.5l4 4"></path></svg>',
  delete:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"></path><path d="M9 7V5h6v2"></path><path d="M7 7l1 13h8l1-13"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>',
  regenerate:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v6h-6"></path></svg>',
  copy:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><rect x="4" y="4" width="11" height="11" rx="2"></rect></svg>',
  speaker:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-4h4l5-4v12l-5-4H4z"></path><path d="M16 9a4 4 0 0 1 0 6"></path><path d="M18.5 7a7 7 0 0 1 0 10"></path></svg>',
  star:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1-4.4-4.3 6.1-.9z"></path></svg>',
  starFilled:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1-4.4-4.3 6.1-.9z"></path></svg>',
  badge:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v6c0 5-3.1 8.6-7 9-3.9-.4-7-4-7-9V6z"></path><path d="M9.2 12.2l1.9 1.9 3.7-3.7"></path></svg>',
};

const DEFAULT_SETTINGS = {
  model: "openrouter/auto",
  markdownEnabled: true,
  allowMessageHtml: true,
  streamEnabled: true,
  autoReplyEnabled: true,
  maxTokens: Number(CONFIG.maxTokens) > 0 ? Number(CONFIG.maxTokens) : 1024,
  temperature:
    Number.isFinite(Number(CONFIG.temperature)) ? Number(CONFIG.temperature) : 0.8,
  preferFreeVariant: true,
  globalPromptTemplate: "Stay in character and respond naturally.",
  summarySystemPrompt: "You are a helpful summarization assistant.",
  markdownCustomCss: ".md-em { color: #e6d97a; font-style: italic; }\n.md-strong { color: #ffd27d; font-weight: 700; }\n.md-blockquote { color: #aab6cf; font-size: 0.9em; border-left: 3px solid #4a5d7f; padding-left: 10px; }",
  postprocessRulesJson: "[]",
  shortcutsRaw: "",
};

const state = {
  settings: { ...DEFAULT_SETTINGS },
  editingCharacterId: null,
  editingPersonaId: null,
  activeModalId: null,
  promptHistoryOpen: false,
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
  activeShortcut: null,
};

window.addEventListener("DOMContentLoaded", init);

async function init() {
  loadSettings();
  setupSettingsControls();
  setupEvents();
  updateModelPill();
  await migrateLegacySessions();
  await ensurePersonasInitialized();
  await renderAll();
  setupCrossWindowSync();
  applyMarkdownCustomCss();
}

function setupEvents() {
  document
    .getElementById("create-character-btn")
    .addEventListener("click", () => openCharacterModal());
  document
    .getElementById("save-character-btn")
    .addEventListener("click", saveCharacterFromModal);
  document.getElementById("send-btn").addEventListener("click", sendMessage);
  document
    .getElementById("bot-reply-btn")
    .addEventListener("click", generateBotReply);
  document
    .getElementById("back-to-main")
    .addEventListener("click", showMainView);
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
    .getElementById("save-persona-btn")
    .addEventListener("click", savePersonaFromModal);
  document
    .getElementById("persona-avatar-file")
    .addEventListener("change", onPersonaAvatarFileChange);
  document
    .getElementById("persona-select")
    .addEventListener("change", onPersonaSelectChange);
  document
    .getElementById("save-shortcuts-btn")
    .addEventListener("click", saveShortcutsFromModal);
  document
    .getElementById("confirm-yes-btn")
    .addEventListener("click", () => resolveConfirmDialog(true));
  document
    .getElementById("confirm-no-btn")
    .addEventListener("click", () => resolveConfirmDialog(false));
  document
    .getElementById("confirm-cancel-btn")
    .addEventListener("click", () => resolveConfirmDialog(false));

  const input = document.getElementById("user-input");
  input.addEventListener("keydown", onInputKeyDown);
  input.addEventListener("input", () => {
    if (state.promptHistoryOpen) closePromptHistory();
    if (state.activeShortcut && input.value !== state.activeShortcut.initialValue) {
      state.activeShortcut = null;
    }
  });
  input.addEventListener("dblclick", openPromptHistory);
  input.addEventListener("pointerup", onInputPointerUp);
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
}

function onInputKeyDown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
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
  if (e.key === "Escape") {
    closePromptHistory();
    closeActiveModal();
    resolveConfirmDialog(false);
  }
}

function setupSettingsControls() {
  const modelSelect = document.getElementById("model-select");
  const maxTokensSlider = document.getElementById("max-tokens-slider");
  const maxTokensValue = document.getElementById("max-tokens-value");
  const temperatureSlider = document.getElementById("temperature-slider");
  const temperatureValue = document.getElementById("temperature-value");
  const preferFreeVariant = document.getElementById("prefer-free-variant");
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
  const autoReplyEnabled = document.getElementById("auto-reply-enabled");
  const markdownCustomCss = document.getElementById("markdown-custom-css");
  const postprocessRulesJson = document.getElementById("postprocess-rules-json");
  const globalPromptTemplate = document.getElementById(
    "global-prompt-template",
  );
  const summarySystemPrompt = document.getElementById("summary-system-prompt");
  const shortcutsRaw = document.getElementById("shortcuts-raw");
  markdownCheck.checked = !!state.settings.markdownEnabled;
  allowMessageHtml.checked = state.settings.allowMessageHtml !== false;
  streamEnabled.checked = state.settings.streamEnabled !== false;
  autoReplyEnabled.checked = state.settings.autoReplyEnabled !== false;
  markdownCustomCss.value = state.settings.markdownCustomCss || "";
  postprocessRulesJson.value = state.settings.postprocessRulesJson || "[]";
  maxTokensSlider.value = String(clampMaxTokens(state.settings.maxTokens));
  maxTokensValue.textContent = maxTokensSlider.value;
  temperatureSlider.value = String(clampTemperature(state.settings.temperature));
  temperatureValue.textContent = clampTemperature(
    state.settings.temperature,
  ).toFixed(2);
  preferFreeVariant.checked = state.settings.preferFreeVariant !== false;
  globalPromptTemplate.value = state.settings.globalPromptTemplate || "";
  summarySystemPrompt.value = state.settings.summarySystemPrompt || "";
  shortcutsRaw.value = state.settings.shortcutsRaw || "";

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

  autoReplyEnabled.addEventListener("change", () => {
    state.settings.autoReplyEnabled = autoReplyEnabled.checked;
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
    saveSettings();
  });

  temperatureSlider.addEventListener("input", () => {
    const value = clampTemperature(Number(temperatureSlider.value));
    state.settings.temperature = value;
    temperatureValue.textContent = value.toFixed(2);
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

function saveSettings() {
  localStorage.setItem("rp-settings", JSON.stringify(state.settings));
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
    document.getElementById("confirm-title").textContent = title || "Confirm";
    document.getElementById("confirm-message").textContent = message || "";
    state.confirmResolver = resolve;
    modal.classList.remove("hidden");
  });
}

function resolveConfirmDialog(value) {
  const modal = document.getElementById("confirm-modal");
  if (!modal || modal.classList.contains("hidden")) return;
  modal.classList.add("hidden");
  const resolver = state.confirmResolver;
  state.confirmResolver = null;
  if (typeof resolver === "function") resolver(!!value);
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
  const lines = String(raw || "").replace(/\r\n/g, "\n").split("\n");
  const entries = [];
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    if (!current.name || !current.message) return;
    entries.push({
      name: current.name,
      message: current.message,
      insertionType:
        current.insertionType === "append" ? "append" : "replace",
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
    if (key === "insertiontype") current.insertionType = value.trim().toLowerCase();
    if (key === "autosend") current.autoSend = value.trim().toLowerCase();
    if (key === "clearaftersend") current.clearAfterSend = value.trim().toLowerCase();
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
  document.getElementById("shortcuts-raw").value = state.settings.shortcutsRaw;
  await renderShortcutsBar();
  closeActiveModal();
  showToast("Shortcuts saved.", "success");
}

async function renderShortcutsBar() {
  const bar = document.getElementById("shortcuts-bar");
  if (!bar) return;
  const entries = parseShortcutEntries(state.settings.shortcutsRaw);
  bar.innerHTML = "";
  if (entries.length === 0) return;

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
}

async function renderCharacters() {
  const grid = document.getElementById("character-grid");
  const characters = await db.characters.orderBy("id").reverse().toArray();

  grid.innerHTML = "";
  if (characters.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No characters yet. Create one to begin.";
    grid.appendChild(empty);
    return;
  }

  characters.forEach((char) => {
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
    id.textContent = `char #${char.id}`;

    const actions = document.createElement("div");
    actions.className = "card-actions";

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
      iconButton("delete", "Delete character", async (e) => {
        e.stopPropagation();
        await deleteCharacter(char.id);
      }),
    );

    card.append(avatar, name, id, actions);
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

  list.innerHTML = "";
  if (threads.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No threads yet.";
    list.appendChild(empty);
    return;
  }

  const charIds = [
    ...new Set(threads.map((t) => t.characterId).filter(Boolean)),
  ];
  const characters = await db.characters.where("id").anyOf(charIds).toArray();
  const charMap = new Map(characters.map((c) => [c.id, c]));

  threads.forEach((thread) => {
    const char = charMap.get(thread.characterId);

    const row = document.createElement("div");
    row.className = "thread-row";
    if (currentThread?.id === thread.id) {
      row.classList.add("active-thread");
    }

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
    titleBtn.addEventListener("click", () => openThread(thread.id));

    info.append(meta, titleBtn);

    const actions = document.createElement("div");
    actions.className = "actions";

    if (char) {
      actions.appendChild(
        iconButton("edit", "Edit thread character", async () => {
          const latestCharacter = await db.characters.get(char.id);
          if (latestCharacter) openCharacterModal(latestCharacter);
        }),
      );
    }

    actions.appendChild(
      iconButton("duplicate", "Duplicate thread", async () => {
        await duplicateThread(thread.id);
      }),
    );

    actions.appendChild(
      iconButton("delete", "Delete thread", async () => {
        await deleteThread(thread.id);
      }),
    );
    const favBtn = iconButton(
      thread.favorite ? "starFilled" : "star",
      thread.favorite ? "Unfavorite thread" : "Favorite thread",
      async () => {
        await toggleThreadFavorite(thread.id);
      },
    );
    favBtn.classList.add("favorite-btn");
    if (thread.favorite) favBtn.classList.add("is-favorite");
    actions.appendChild(favBtn);

    row.append(avatar, info, actions);
    list.appendChild(row);
  });
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
  pane.classList.toggle("collapsed");
  shell.classList.toggle("pane-collapsed", pane.classList.contains("collapsed"));
  document.getElementById("pane-toggle").textContent = pane.classList.contains(
    "collapsed",
  )
    ? ">"
    : "<";
  if (pane.classList.contains("collapsed")) {
    createBtn.textContent = "+";
    createBtn.title = "Create character";
  } else {
    createBtn.textContent = "+ Character";
    createBtn.title = "";
  }
}

function showMainView() {
  document.getElementById("main-view").classList.add("active");
  document.getElementById("chat-view").classList.remove("active");
}

function showChatView() {
  document.getElementById("chat-view").classList.add("active");
  document.getElementById("main-view").classList.remove("active");
}

function openModal(modalId) {
  closeActiveModal();
  const modal = document.getElementById(modalId);
  if (!modal) return;
  state.activeModalId = modalId;
  modal.classList.remove("hidden");
  if (modalId === "personas-modal") {
    renderPersonaModalList();
  } else if (modalId === "shortcuts-modal") {
    document.getElementById("shortcuts-raw").value =
      state.settings.shortcutsRaw || "";
  }
}

function closeActiveModal() {
  if (!state.activeModalId) return;
  const modal = document.getElementById(state.activeModalId);
  modal?.classList.add("hidden");
  state.activeModalId = null;
}

function openCharacterModal(character = null) {
  state.editingCharacterId = character?.id || null;
  document.getElementById("character-title").textContent =
    state.editingCharacterId ? "Edit Character" : "Create Character";

  document.getElementById("char-name").value = character?.name || "";
  document.getElementById("char-avatar").value = character?.avatar || "";
  document.getElementById("char-avatar-file").value = "";
  document.getElementById("char-system-prompt").value =
    character?.systemPrompt || "";
  document.getElementById("char-use-memory").checked =
    character?.useMemory !== false;
  document.getElementById("char-use-postprocess").checked =
    character?.usePostProcessing !== false;
  document.getElementById("char-avatar-scale").value = String(
    Number(character?.avatarScale) || 1,
  );
  renderAvatarPreview(character?.avatar || "");
  renderCharacterLorebookList(character?.lorebookIds || []);
  updateCharacterPromptPlaceholder();

  openModal("character-modal");
}

async function saveCharacterFromModal() {
  const selectedLorebookIds = getSelectedLorebookIds();
  const payload = {
    name: document.getElementById("char-name").value.trim(),
    systemPrompt: document.getElementById("char-system-prompt").value.trim(),
    useMemory: document.getElementById("char-use-memory").checked,
    usePostProcessing: document.getElementById("char-use-postprocess").checked,
    avatarScale: Number(document.getElementById("char-avatar-scale").value) || 1,
    lorebookIds: selectedLorebookIds,
    avatar: document.getElementById("char-avatar").value.trim(),
    updatedAt: Date.now(),
  };

  if (!payload.name) {
    alert("Character name is required.");
    return;
  }

  if (state.editingCharacterId) {
    await db.characters.update(state.editingCharacterId, payload);
    showToast("Character updated.", "success");
  } else {
    payload.createdAt = Date.now();
    await db.characters.add(payload);
    showToast("Character created.", "success");
  }

  closeActiveModal();
  await renderAll();
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

  const defaultPersona = await getDefaultPersona();
  const requestedId = Number(currentThread?.selectedPersonaId);
  const existing = requestedId ? personas.find((p) => p.id === requestedId) : null;
  const effective = existing || defaultPersona || personas[0] || null;

  currentPersona = effective || null;
  select.value = effective ? String(effective.id) : "";
  updatePersonaPickerDisplay();

  if (currentThread && effective && Number(currentThread.selectedPersonaId) !== Number(effective.id)) {
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
  currentPersona = personaId ? await db.personas.get(personaId) : await getDefaultPersona();
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
  const description = document.getElementById("persona-description").value.trim();
  const wantsDefault = document.getElementById("persona-is-default").checked;

  if (!name) {
    alert("Persona name is required.");
    return;
  }
  if (countWords(description) > 100) {
    alert("Persona description must be 100 words or less.");
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
  document.getElementById("persona-avatar").value = "";
  document.getElementById("persona-avatar-file").value = "";
  document.getElementById("persona-description").value = "";
  document.getElementById("persona-is-default").checked = false;
  state.editingPersonaId = null;
  document.getElementById("save-persona-btn").textContent = "Save Persona";

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
    avatar.src = persona.avatar || fallbackAvatar(persona.name || "P", 512, 512);
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
  const ok = await openConfirmDialog(
    "Delete Persona",
    "Delete this persona?",
  );
  if (!ok) return;
  const persona = await db.personas.get(personaId);
  await db.personas.delete(personaId);

  const threads = await db.threads
    .filter((t) => Number(t.selectedPersonaId) === Number(personaId))
    .toArray();
  await Promise.all(
    threads.map((t) =>
      db.threads.update(t.id, { selectedPersonaId: null, updatedAt: Date.now() }),
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
  document.getElementById("persona-avatar").value = persona.avatar || "";
  document.getElementById("persona-avatar-file").value = "";
  document.getElementById("persona-description").value = persona.description || "";
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
    await db.personas.update(personaId, { isDefault: true, updatedAt: Date.now() });
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
    personas.map((p, index) =>
      db.personas.update(p.id, { order: index }),
    ),
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
    alert("Please choose an image file.");
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
    alert("Please choose an image file.");
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
    name: `${source.name} Copy`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  delete copy.id;
  await db.characters.add(copy);
  await renderCharacters();
  showToast("Character duplicated.", "success");
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

  const newThread = {
    characterId,
    title: `Thread ${new Date().toLocaleString()}`,
    messages: [],
    selectedPersonaId: currentPersona?.id || null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const threadId = await db.threads.add(newThread);
  broadcastSyncEvent({ type: "thread-updated", threadId, updatedAt: newThread.updatedAt });
  await renderThreads();
  await openThread(threadId);
  showToast("Thread created.", "success");
}

async function duplicateThread(threadId) {
  const source = await db.threads.get(threadId);
  if (!source) return;

  const copy = {
    characterId: source.characterId,
    title: `${source.title || `Thread ${source.id}`} Copy`,
    messages: [...(source.messages || [])],
    selectedPersonaId: source.selectedPersonaId || null,
    favorite: !!source.favorite,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const newThreadId = await db.threads.add(copy);
  broadcastSyncEvent({ type: "thread-updated", threadId: newThreadId, updatedAt: Date.now() });
  await renderThreads();
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
  broadcastSyncEvent({ type: "thread-updated", threadId, updatedAt: Date.now() });
  showToast(next ? "Thread favorited." : "Thread unfavorited.", "success");
}

async function deleteThread(threadId) {
  const ok = await openConfirmDialog("Delete Thread", "Delete this thread?");
  if (!ok) return;

  await db.threads.delete(threadId);
  broadcastSyncEvent({ type: "thread-updated", threadId, updatedAt: Date.now() });
  if (currentThread?.id === threadId) {
    currentThread = null;
    currentCharacter = null;
    conversationHistory = [];
    showMainView();
  }
  await renderThreads();
  showToast("Thread deleted.", "success");
}

async function openThread(threadId) {
  const thread = await db.threads.get(threadId);
  if (!thread) return;

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

  const displayTitle = `${character?.name || "Unknown"} - ${thread.title || `Thread ${thread.id}`}`;
  document.getElementById("chat-title").textContent = displayTitle;
  updateModelPill();
  state.lastSyncSeenUpdatedAt = Number(thread.updatedAt || 0);

  renderChat();
  const input = document.getElementById("user-input");
  input.value = "";
  state.activeShortcut = null;
  closePromptHistory();
  await renderShortcutsBar();
  await renderThreads();
  showChatView();
}

function renderChat() {
  const log = document.getElementById("chat-log");
  log.innerHTML = "";

  if (!currentThread) return;

  conversationHistory.forEach((message, idx) => {
    log.appendChild(buildMessageRow(message, idx, false));
  });

  scrollChatToBottom();
}

function buildMessageRow(message, index, streaming) {
  const row = document.createElement("div");
  row.className = "chat-row";

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
    currentCharacter?.avatar || fallbackAvatar(currentCharacter?.name || "Character", 512, 512);
  avatar.src = message.role === "assistant" ? botAvatar : userAvatar;
  if (message.role === "assistant") {
    const mult = Math.max(1, Math.min(4, Number(currentCharacter?.avatarScale) || 1));
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

  if (message.role === "assistant") {
    controls.appendChild(
      iconButton("delete", "Delete message", async () => {
        await deleteMessageAt(index);
      }),
    );

    controls.appendChild(
      iconButton("regenerate", "Regenerate message", async () => {
        await regenerateMessage(index);
      }),
    );

    controls.appendChild(
      iconButton("copy", "Copy message", async () => {
        await copyMessage(message.content || "");
      }),
    );

    controls.appendChild(
      iconButton("speaker", "Text to speech", () => {
        alert("TTS will be implemented later.");
      }),
    );
  }

  header.appendChild(controls);

  const content = document.createElement("div");
  content.className = "message-content";
  if (streaming) {
    content.textContent = message.content;
  } else {
    content.innerHTML = renderMessageHtml(message.content || "", message.role);
  }

  block.append(header, content);
  row.append(avatar, block);
  return row;
}

async function sendMessage(options = {}) {
  if (!currentThread || !currentCharacter || state.sending) return;

  const input = document.getElementById("user-input");
  const shortcutPreserve =
    state.activeShortcut &&
    input.value === state.activeShortcut.initialValue &&
    state.activeShortcut.clearAfterSend === false;
  const preserveInput =
    typeof options.preserveInput === "boolean"
      ? options.preserveInput
      : !!shortcutPreserve;
  const text = input.value.trim();
  if (!text) return;
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

  const log = document.getElementById("chat-log");
  const pending = { role: "assistant", content: "", createdAt: Date.now() };
  conversationHistory.push(pending);
  await persistCurrentThread();
  const pendingRow = buildMessageRow(pending, conversationHistory.length - 1, true);
  const pendingContent = pendingRow.querySelector(".message-content");
  pendingContent.innerHTML =
    '<span class="spinner" aria-hidden="true"></span> Generating...';
  log.appendChild(pendingRow);
  scrollChatToBottom();

  state.sending = true;
  setSendingState(true);

  try {
    const systemPrompt = await buildSystemPrompt(currentCharacter);
    const result = await callOpenRouter(
      systemPrompt,
      conversationHistory,
      state.settings.model,
      (chunk) => {
        pending.content += chunk;
        pendingRow.querySelector(".message-content").innerHTML = renderMessageHtml(
          pending.content,
          pending.role,
        );
        if (state.settings.streamEnabled) {
          persistCurrentThread().catch(() => {});
        }
        scrollChatToBottom();
      },
    );
    const assistantText = result.content || pending.content || "";
    state.lastUsedModel = result.model || "";
    state.lastUsedProvider = result.provider || "";
    updateModelPill();

    pending.content = assistantText || "(No content returned)";
    pendingRow.querySelector(".message-content").innerHTML = renderMessageHtml(
      pending.content,
      pending.role,
    );
    await persistCurrentThread();
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
    pendingRow.querySelector(".message-content").textContent =
      `Error: ${e.message}`;
  } finally {
    state.sending = false;
    setSendingState(false);
  }
}

async function deleteMessageAt(index) {
  if (!currentThread) return;
  if (index < 0 || index >= conversationHistory.length) return;

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
  const hasUser = prior.some((m) => m.role === "user");
  if (!hasUser) return;

  state.sending = true;
  setSendingState(true);

  try {
    const systemPrompt = await buildSystemPrompt(currentCharacter);
    target.content = "";
    renderChat();
    const row = document.getElementById("chat-log").children[index];
    const contentEl = row?.querySelector(".message-content");
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
    );
    const reply = result.content || target.content;
    state.lastUsedModel = result.model || "";
    state.lastUsedProvider = result.provider || "";
    updateModelPill();
    target.content = reply || "(No content returned)";
    await persistCurrentThread();
    renderChat();
    await renderThreads();
  } catch (e) {
    alert(`Regenerate failed: ${e.message}`);
  } finally {
    state.sending = false;
    setSendingState(false);
  }
}

async function copyMessage(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    alert("Copy failed.");
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
  if (!popover || !chatView || !inputRow || popover.classList.contains("hidden")) return;
  popover.style.bottom = "";
  popover.style.top = "0px";
  const desiredTop = Math.max(0, inputRow.offsetTop - popover.offsetHeight - 8);
  popover.style.top = `${desiredTop}px`;
}

function setSendingState(sending) {
  const sendBtn = document.getElementById("send-btn");
  const botReplyBtn = document.getElementById("bot-reply-btn");
  const input = document.getElementById("user-input");
  const personaSelect = document.getElementById("persona-select");
  sendBtn.disabled = sending;
  sendBtn.classList.toggle("is-generating", sending);
  sendBtn.textContent = sending ? "Generating..." : "Send";
  botReplyBtn.disabled = sending;
  input.disabled = sending;
  personaSelect.disabled = sending;
  if (sending) closePromptHistory();
}

async function persistCurrentThread() {
  if (!currentThread) return;

  const updated = {
    messages: conversationHistory,
    selectedPersonaId: currentThread.selectedPersonaId || null,
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

function scrollChatToBottom() {
  const log = document.getElementById("chat-log");
  log.scrollTop = log.scrollHeight;
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
      messages: session.messages || [],
      createdAt: session.updatedAt || Date.now(),
      updatedAt: session.updatedAt || Date.now(),
    });
  }
}

async function buildSystemPrompt(character) {
  const defaultPersona = await getDefaultPersona();
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
  const loreEntries = await getCharacterLoreEntries(character);
  const memory =
    character.useMemory === false ? null : await getMemorySummary(character.id);
  const contextSections = [];

  if (personaForContext) {
    contextSections.push(
      [
        "## Active User Persona",
        `Name: ${personaForContext.name || "You"}`,
        `Description: ${personaForContext.description || "(none)"}`,
      ].join("\n"),
    );
  }

  if (loreEntries.length > 0) {
    contextSections.push(
      `## Lore Context\n${loreEntries.map((e) => `- ${e.content}`).join("\n")}`,
    );
  }
  if (memory) {
    contextSections.push(`## Memory Context\n${memory}`);
  }

  return [basePrompt, ...contextSections].filter(Boolean).join("\n\n").trim();
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

async function callOpenRouter(systemPrompt, history, model, onChunk = null) {
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
    return await requestCompletionWithRetry(body, attempts, onChunk);
  } catch (primaryErr) {
    if (!fallbackModel) throw primaryErr;
    const fallbackBody = { ...body, model: fallbackModel };
    const fallbackAttempts = fallbackBody.stream ? 1 : 2;
    return requestCompletionWithRetry(fallbackBody, fallbackAttempts, onChunk);
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

async function requestCompletionWithRetry(body, attempts, onChunk) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetchCompletionResponse(body);

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
        if (streamed.content) return streamed;
        throw new Error("Empty assistant content from stream.");
      }

      const data = await res.json();
      const content = extractAssistantText(data);
      if (content && content.trim()) {
        return {
          content,
          model: data?.model || body.model,
          provider: data?.provider || "",
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

async function fetchCompletionResponse(body) {
  const proxyUrl = "/api/chat-completions";
  try {
    const proxyRes = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (proxyRes.status !== 404 && proxyRes.status !== 405) {
      return proxyRes;
    }
  } catch {
    // proxy unavailable locally; fallback below if api key exists client-side
  }

  if (!CONFIG.apiKey) {
    throw new Error(
      "Missing OPENROUTER_API_KEY. Use Vercel server env or set local key for direct mode.",
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
        model = json?.model || model;
        provider = json?.provider || provider;
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

  return { content, model, provider };
}

function shouldRetryError(error, attempt, attempts) {
  if (attempt >= attempts) return false;
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
  return Math.max(64, Math.min(8192, rounded));
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
  if (
    role === "assistant" &&
    currentCharacter?.usePostProcessing !== false
  ) {
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
  let html = state.settings.allowMessageHtml ? String(input) : escapeHtml(input);

  html = html.replace(
    /```([\s\S]*?)```/g,
    (_m, code) => `<pre><code>${code}</code></pre>`,
  );
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="md-strong">$1</strong>');
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
      (r) => r && typeof r.pattern === "string" && typeof r.replacement === "string",
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
