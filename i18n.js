// i18n.js

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

  const createBtn = document.getElementById("create-character-btn");
  const homeBtn = document.getElementById("home-btn");
  const importBtn = document.getElementById("import-character-btn");
  if (homeBtn) {
    homeBtn.title = t("home");
    homeBtn.setAttribute("aria-label", t("home"));
  }
  if (createBtn) {
    createBtn.title = t("createCharacter");
    createBtn.setAttribute("aria-label", t("createCharacter"));
  }
  if (importBtn) {
    importBtn.title = t("importCharacter");
    importBtn.setAttribute("aria-label", t("importCharacter"));
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

  const chatOpacityBtn = document.getElementById("chat-opacity-toggle-btn");
  if (chatOpacityBtn) {
    const title = t("chatOpacityToggle");
    chatOpacityBtn.classList.toggle(
      "is-active",
      state.chatOpacityOverlayVisible,
    );
    chatOpacityBtn.setAttribute("title", title);
    chatOpacityBtn.setAttribute("aria-label", title);
  }

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
