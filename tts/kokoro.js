function getKokoroLanguageKey(language = "") {
  const normalized = normalizeBotLanguageCode(language || "") || "";
  const lower = normalized.toLowerCase();
  if (!lower) return "en";
  if (lower.startsWith("pt-br")) return "pt-BR";
  if (lower.startsWith("pt")) return "pt";
  if (lower.startsWith("zh")) return "zh";
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("it")) return "it";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("hi")) return "hi";
  return lower;
}

function getFilteredKokoroVoicesForLanguage(language = "") {
  const key = getKokoroLanguageKey(language);
  const prefixes = KOKORO_LANGUAGE_VOICE_PREFIXES[key] || [];
  if (prefixes.length === 0) return [];
  return KOKORO_VOICE_OPTIONS.filter((voice) => {
    const prefix = (voice || "").split("_")[0];
    return prefixes.includes(prefix);
  });
}

function isKokoroSupportedForLanguage(language = "") {
  return getFilteredKokoroVoicesForLanguage(language).length > 0;
}

async function loadKokoroModule() {
  if (state.tts.kokoro.modulePromise) return state.tts.kokoro.modulePromise;
  state.tts.kokoro.modulePromise = (async () => {
    for (const path of KOKORO_MODULE_PATHS) {
      try {
        return await import(path);
      } catch (err) {
        console.warn("kokoro:import-failed", path, err);
      }
    }
    throw new Error("Unable to load Kokoro.js module.");
  })();
  return state.tts.kokoro.modulePromise;
}

async function ensureKokoroInstance(device = "wasm", dtype = "q8") {
  const normalizedDevice = KOKORO_DEVICE_OPTIONS.includes(device)
    ? device
    : "wasm";
  const normalizedDtype = KOKORO_DTYPE_OPTIONS.includes(dtype) ? dtype : "q8";
  if (
    state.tts.kokoro.instance &&
    state.tts.kokoro.config.device === normalizedDevice &&
    state.tts.kokoro.config.dtype === normalizedDtype
  ) {
    return state.tts.kokoro.instance;
  }
  const module = await loadKokoroModule();
  const KokoroTTS = module?.KokoroTTS;
  if (!KokoroTTS) {
    throw new Error("Kokoro.js module is missing KokoroTTS.");
  }
  state.tts.kokoro.loading = true;
  await Promise.resolve();
  try {
    // const instance = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
    //   device: normalizedDevice,
    //   dtype: normalizedDtype,
    //   progress_callback: (info) => ttsDebug("kokoro:progress", info),
    // });

    const instance = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
      device: normalizedDevice,
      dtype: normalizedDtype,
      progress_callback: (info) => ttsDebug("kokoro:progress", info),
    });

    // Patch _validate_voice to allow all voices in KOKORO_VOICE_OPTIONS
    const originalValidate = instance._validate_voice?.bind(instance);
    instance._validate_voice = function (voice) {
      if (KOKORO_VOICE_OPTIONS.includes(voice)) return voice;
      if (originalValidate) return originalValidate(voice);
      return voice;
    };

    state.tts.kokoro.instance = instance;
    state.tts.kokoro.config.device = normalizedDevice;
    state.tts.kokoro.config.dtype = normalizedDtype;
    state.tts.kokoro.loading = false;
    const preferredVoice =
      state.tts.kokoro.selectedVoice || DEFAULT_KOKORO_VOICE;
    if (!state.tts.kokoro.voiceListLoaded) {
      populateKokoroVoiceSelect(preferredVoice, state.charModalActiveLanguage);
    }
    return instance;
  } catch (err) {
    state.tts.kokoro.loading = false;
    throw err;
  } finally {
    updateTtsSupportUi();
  }
}

function getActiveCharacterTtsProvider() {
  if (currentCharacter?.ttsProvider) return currentCharacter.ttsProvider;
  return "browser";
}

function isActiveTtsProviderReady(provider = null) {
  const active = provider || getActiveCharacterTtsProvider();
  if (active === "kokoro") {
    return !!state.tts.kokoro.instance && !state.tts.kokoro.loading;
  }
  return hasBrowserTtsSupport() && state.tts.voiceSupportReady === true;
}

function preloadKokoroForActiveCharacter() {
  if (getActiveCharacterTtsProvider() !== "kokoro") return;
  const device =
    (currentCharacter?.kokoroDevice &&
      String(currentCharacter.kokoroDevice).trim()) ||
    state.tts.kokoro.config.device ||
    "wasm";
  const dtype =
    (currentCharacter?.kokoroDtype &&
      String(currentCharacter.kokoroDtype).trim()) ||
    state.tts.kokoro.config.dtype ||
    "q8";
  ensureKokoroInstance(device, dtype).catch((err) => {
    console.warn("kokoro:preload", err);
  });
}

function buildKokoroOptions(source = {}, rateFallback = DEFAULT_TTS_RATE) {
  const fallbackRate = Math.max(
    0.5,
    Math.min(2, Number(rateFallback) || DEFAULT_TTS_RATE),
  );
  const sourceSpeed = Number.isFinite(Number(source?.kokoroSpeed))
    ? Number(source.kokoroSpeed)
    : fallbackRate;
  return {
    device: String(source?.kokoroDevice || "wasm"),
    dtype: String(source?.kokoroDtype || "q8"),
    voice: String(source?.kokoroVoice || DEFAULT_KOKORO_VOICE),
    speed: Math.max(0.5, Math.min(2, sourceSpeed)),
  };
}

function setKokoroVoiceLoadingPlaceholder() {
  const kokoroVoice = document.getElementById("char-tts-kokoro-voice");
  if (!kokoroVoice) return;
  state.tts.kokoro.voiceListLoaded = false;
  kokoroVoice.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("kokoroVoicesLoading");
  kokoroVoice.appendChild(placeholder);
  kokoroVoice.disabled = true;
}

function populateKokoroVoiceSelect(
  preferred = state.tts.kokoro.selectedVoice || DEFAULT_KOKORO_VOICE,
  language = state.charModalActiveLanguage,
) {
  const select = document.getElementById("char-tts-kokoro-voice");
  if (!select) return;
  select.innerHTML = "";
  const filtered = getFilteredKokoroVoicesForLanguage(language);
  if (filtered.length === 0) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t("kokoroVoicesUnavailable");
    select.appendChild(placeholder);
    select.disabled = true;
    state.tts.kokoro.voiceListLoaded = true;
    state.tts.kokoro.selectedVoice = DEFAULT_KOKORO_VOICE;
    return;
  }
  filtered.forEach((voice) => {
    const opt = document.createElement("option");
    opt.value = voice;
    opt.textContent = voice;
    select.appendChild(opt);
  });
  const available = filtered.includes(preferred) ? preferred : filtered[0];
  select.value = available;
  select.disabled = state.charModalTtsTestPlaying === true;
  state.tts.kokoro.voiceListLoaded = true;
  state.tts.kokoro.selectedVoice = available;
}

let sharedKokoroAudioContext = null;

function getSharedKokoroAudioContext() {
  if (sharedKokoroAudioContext) return sharedKokoroAudioContext;
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  sharedKokoroAudioContext = new AudioCtor();
  return sharedKokoroAudioContext;
}

function decodeKokoroAudioBuffer(arrayBuffer) {
  const context = getSharedKokoroAudioContext();
  if (!context) {
    return Promise.reject(new Error("AudioContext is unavailable."));
  }
  const copy = arrayBuffer.slice(0);
  return new Promise((resolve, reject) => {
    context.decodeAudioData(copy, resolve, (err) =>
      reject(err || new Error("Failed to decode Kokoro audio.")),
    );
  });
}

async function createKokoroBufferSource(arrayBuffer) {
  const context = getSharedKokoroAudioContext();
  if (!context) return null;
  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      // ignore
    }
  }
  const buffer = await decodeKokoroAudioBuffer(arrayBuffer);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  return source;
}
