/**
 * Kokoro TTS Module
 *
 * This module provides text-to-speech functionality using Kokoro.js, a
 * client-side neural TTS engine that runs in the browser using WebGPU or WASM.
 * It handles voice model downloads, audio generation, and playback with
 * persistent caching via IndexedDB.
 *
 * ============================================================================
 * KOKORO TTS PIPELINE
 * ============================================================================
 *
 * 1. MODULE LOADING (loadKokoroModule)
 *    - Dynamically imports kokoro-js from CDN paths (KOKORO_MODULE_PATHS)
 *    - Caches the module promise to avoid re-loading
 *    - Exposes KokoroTTS class from the module
 *
 * 2. INSTANCE CREATION (ensureKokoroInstance)
 *    - Creates or reuses a KokoroTTS instance with specific device/dtype
 *    - Patches fetch to intercept voice and model file downloads (patchKokoroVoiceFetch)
 *    - Loads model from HuggingFace (KOKORO_MODEL_ID)
 *    - Patches _validate_voice to allow all KOKORO_VOICE_OPTIONS
 *    - Stores instance in state.tts.kokoro.instance
 *
 * 3. VOICE & MODEL CACHING (patchKokoroVoiceFetch)
 *    - Intercepts fetch() calls for:
 *      a) Voice files: /voices/<name>.bin
 *      b) Model files: URLs containing KOKORO_MODEL_ID
 *    - Checks IndexedDB (assets table) for cached blobs first
 *    - On cache hit: returns Response(blob) immediately
 *    - On cache miss: downloads from network, caches to IndexedDB for future
 *    - Tracks in-memory download progress for UI (voices only)
 *    - Supports cancellation via abort controller (cancelKokoroVoiceDownload)
 *
 * 4. AUDIO GENERATION (in app.js: playKokoroTts)
 *    - Chunks text for TTS (chunkForTTS)
 *    - Calls kokoro.generate(chunk, { voice, speed }) for each chunk
 *    - Converts result Blob to ArrayBuffer
 *    - Creates AudioBufferSourceNode via Web Audio API (createKokoroBufferSource)
 *    - Fallback: HTMLAudioElement if AudioContext unavailable
 *
 * 5. PLAYBACK (playResolved in app.js)
 *    - Plays each audio chunk sequentially
 *    - Uses shared AudioContext (getSharedKokoroAudioContext)
 *    - Handles cancellation and cleanup
 *
 * ============================================================================
 * STATE MANAGEMENT
 * ============================================================================
 *
 * state.tts.kokoro:
 *   - instance: KokoroTTS engine instance (null until loaded)
 *   - config: { device: 'webgpu'|'wasm', dtype: 'auto'|'fp16'|'fp32' }
 *   - loading: boolean (true during model load)
 *   - selectedVoice: currently selected voice name
 *   - voiceListLoaded: boolean (true after voice options populated)
 *   - fetchPatched: boolean (true after fetch interceptor installed)
 *   - modulePromise: cached promise for module import
 *   - cacheDisabled: boolean (true if IndexedDB quota exceeded)
 *
 * Global tracking (module scope):
 *   - kokoroVoiceDownloadAbortController: cancels voice downloads
 *   - kokoroVoiceDownloadProgress: { loaded, total, percent }
 *   - kokoroDownloadedVoices: Set of voice names already downloaded (session-only)
 *   - sharedKokoroAudioContext: singleton AudioContext for playback
 *
 * ============================================================================
 * PERSISTENT CACHING (IndexedDB)
 * ============================================================================
 *
 * Cache storage uses the existing Dexie `assets` table (version 13+).
 * Cached items persist across page reloads and browser restarts.
 *
 * Asset types:
 *   - 'kokoro-voice': Individual voice .bin files (~15MB each)
 *   - 'kokoro-model-file': Individual model files (.onnx, .json, etc.)
 *
 * Cache functions:
 *   - getCachedKokoroVoice(voiceName) -> Blob|null
 *   - cacheKokoroVoice(voiceName, blob) -> Promise<void>
 *   - getCachedKokoroModelFile(filename) -> Blob|null
 *   - cacheKokoroModelFile(filename, blob) -> Promise<void>
 *   - clearKokoroCache() -> Promise<void>  (clears all kokoro assets)
 *
 * Cache behavior:
 *   - Automatic: patchKokoroVoiceFetch checks cache before network
 *   - Transparent: no user action required
 *   - Quota handling: if IndexedDB full, cacheDisabled flag set, fallback to network
 *   - No auto-purge: cached files remain until manually cleared
 *
 * ============================================================================
 * CONSTANTS (defined in app.js)
 * ============================================================================
 *
 * KOKORO_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX"
 * KOKORO_MODULE_PATHS = [
 *   "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js",
 *   ...
 * ]
 * KOKORO_DEVICE_OPTIONS = ["wasm", "webgpu"]
 * KOKORO_DTYPE_OPTIONS = ["auto", "fp16", "fp32"]
 * KOKORO_VOICE_OPTIONS = [all available voice identifiers]
 * DEFAULT_KOKORO_VOICE = "af_heart"
 * DEFAULT_TTS_RATE = 1.0
 *
 * ============================================================================
 * GLOBAL FUNCTIONS EXPOSED
 * ============================================================================
 *
 * Voice Download Tracking:
 *   getKokoroVoiceDownloadProgress()
 *     Returns current download progress object.
 *
 *   isVoiceDownloaded(voiceName)
 *     Checks if a voice model has been downloaded (session only).
 *
 *   markVoiceDownloaded(voiceName)
 *     Marks a voice as downloaded (internal use).
 *
 *   resetKokoroVoiceDownloadProgress()
 *     Resets progress tracking to initial state.
 *
 *   cancelKokoroVoiceDownload()
 *     Aborts any in-progress voice download.
 *
 * Language & Voice Selection:
 *   getKokoroLanguageKey(language)
 *     Normalizes language code to kokoro format (e.g., 'pt-br' -> 'pt-BR').
 *
 *   getFilteredKokoroVoicesForLanguage(language)
 *     Returns KOKORO_VOICE_OPTIONS ( currently unfiltered ).
 *
 *   isKokoroSupportedForLanguage(language)
 *     True if any voices exist for the language.
 *
 * Instance Management:
 *   loadKokoroModule()
 *     Dynamically imports kokoro-js module from CDN.
 *
 *   ensureKokoroInstance(device, dtype)
 *     Creates or returns existing KokoroTTS instance with given config.
 *
 *   preloadKokoroForActiveCharacter()
 *     Preloads Kokoro if active character uses it (called in app.js).
 *
 *   buildKokoroOptions(source, rateFallback)
 *     Constructs {device, dtype, voice, speed} from character settings.
 *
 * UI Helpers:
 *   setKokoroVoiceLoadingPlaceholder()
 *     Shows "loading" option in voice select dropdown.
 *
 *   populateKokoroVoiceSelect(preferred, language)
 *     Fills the voice dropdown with available voices for language.
 *
 * Audio Playback:
 *   getSharedKokoroAudioContext()
 *     Returns singleton AudioContext (creates if needed).
 *
 *   decodeKokoroAudioBuffer(arrayBuffer)
 *     Decodes audio data into AudioBuffer.
 *
 *   createKokoroBufferSource(arrayBuffer)
 *     Creates and returns AudioBufferSourceNode ready to play.
 *
 * Provider Checks:
 *   isActiveTtsProviderReady(provider)
 *     Returns true if kokoro instance is loaded and ready.
 *
 *   getActiveCharacterTtsProvider()
 *     Returns current character's TTS provider ('kokoro' or 'browser').
 *
 * Cache Control:
 *   clearKokoroCache()
 *     Clears all cached Kokoro model files and voices from IndexedDB.
 *
 *   isKokoroCacheDisabled()
 *     Returns true if caching is disabled due to quota or errors.
 *
 * ============================================================================
 * INTEGRATION POINTS
 * ============================================================================
 *
 * This module is used by app.js in the following ways:
 *
 * - Character Modal: User selects TTS provider and configures kokoro options
 *   (voice, device, dtype) via dropdowns in the bot definition UI.
 *
 * - TTS Playback: playKokoroTts() function generates and plays speech for
 *   a given message using the configured voice and speed.
 *
 * - Preloading: When viewing a character with kokoro TTS, preloadKokoroForActiveCharacter()
 *   is called to initialize the engine before first use.
 *
 * - Voice List: Populated from KOKORO_VOICE_OPTIONS constant and filtered
 *   by character language (getFilteredKokoroVoicesForLanguage).
 *
 * - Download Progress: UI reads global functions to show progress during
 *   voice model downloads and allow cancellation.
 *
 * - Persistent Caching: All voice and model file downloads are automatically
 *   cached to IndexedDB. Subsequent page loads serve from cache, reducing
 *   network bandwidth and improving load times.
 *
 * ============================================================================
 * USAGE
 * ============================================================================
 *
 * This module is loaded as a regular script in index.html.
 * It exposes functions globally via window.* assignments at the bottom.
 *
 * Typical flow:
 *   1. User selects a character with ttsProvider='kokoro'
 *   2. ensureKokoroInstance() loads the module and model
 *   3. patchKokoroVoiceFetch() intercepts voice and model downloads
 *   4. playKokoroTts() generates audio via kokoro.generate()
 *   5. Audio played via Web Audio API or HTMLAudioElement fallback
 *
 * Voice and model files are cached in IndexedDB (assets table) and persist
 * across sessions. The cache is transparent - no user action required.
 * If storage quota is exceeded, caching is disabled for the session and a
 * warning toast is shown.
 *
 * ============================================================================
 */

let kokoroVoiceDownloadProgress = { loaded: 0, total: 0, percent: 0 };
const kokoroDownloadedVoices = new Set();

function getKokoroVoiceDownloadProgress() {
  return kokoroVoiceDownloadProgress;
}

function isVoiceDownloaded(voiceName) {
  return kokoroDownloadedVoices.has(voiceName);
}

function markVoiceDownloaded(voiceName) {
  kokoroDownloadedVoices.add(voiceName);
}

function resetKokoroVoiceDownloadProgress() {
  kokoroVoiceDownloadProgress = { loaded: 0, total: 0, percent: 0 };
}

async function patchKokoroVoiceFetch() {
  if (state.tts.kokoro.fetchPatched) return;
  if (typeof window === "undefined" || typeof window.fetch !== "function")
    return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    let url = typeof input === "string" ? input : input?.url;
    if (typeof url === "string") {
      let isVoice = false;
      let isModel = false;
      let resourceName = null;

      const voiceMatch = url.match(/\/voices\/([^/]+)\.bin$/);
      if (voiceMatch) {
        isVoice = true;
        resourceName = voiceMatch[1];
      } else if (url.includes(KOKORO_MODEL_ID)) {
        isModel = true;
        resourceName = url.split('/').pop(); // filename
      }

      if (isVoice || isModel) {
        // Check persistent cache first (unless cache disabled)
        if (!isKokoroCacheDisabled()) {
          try {
            let cachedBlob = null;
            if (isVoice) {
              cachedBlob = await getCachedKokoroVoice(resourceName);
            } else if (isModel) {
              cachedBlob = await getCachedKokoroModelFile(resourceName);
            }
            if (cachedBlob) {
              ttsDebug(isVoice ? "kokoro:voice:from-cache" : "kokoro:model:from-cache", resourceName);
              return new Response(cachedBlob);
            }
          } catch (err) {
            console.warn(isVoice ? "kokoro:cache:voice-check-failed" : "kokoro:cache:model-check-failed", resourceName, err);
            // Continue to network fetch
          }
        }

        // Network download with in-memory tracking
        kokoroVoiceDownloadAbortController = new AbortController();
        const options = {
          ...init,
          signal: kokoroVoiceDownloadAbortController.signal,
        };
        try {
          const response = await originalFetch(url, options);
          if (!response.ok) {
            return response;
          }
          const contentLength = response.headers.get("content-length");
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          kokoroVoiceDownloadProgress.total = total;
          kokoroVoiceDownloadProgress.loaded = 0;

          if (!response.body) {
            return response;
          }
          const reader = response.body.getReader();
          const chunks = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            kokoroVoiceDownloadProgress.loaded += value.length;
            kokoroVoiceDownloadProgress.percent =
              total > 0
                ? Math.round((kokoroVoiceDownloadProgress.loaded / total) * 100)
                : 0;
          }

          const allChunks = new Uint8Array(kokoroVoiceDownloadProgress.loaded);
          let position = 0;
          for (const chunk of chunks) {
            allChunks.set(chunk, position);
            position += chunk.length;
          }

          // Cache to IndexedDB (if not disabled)
          if (!isKokoroCacheDisabled()) {
            try {
              const blob = new Blob([allChunks]);
              if (isVoice) {
                await cacheKokoroVoice(resourceName, blob);
              } else if (isModel) {
                await cacheKokoroModelFile(resourceName, blob);
              }
            } catch (err) {
              console.warn(isVoice ? "kokoro:cache:voice-save-failed" : "kokoro:cache:model-save-failed", resourceName, err);
              // Continue anyway - data still available in memory
            }
          }

          if (isVoice) {
            markVoiceDownloaded(resourceName);
          }

          return new Response(allChunks, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        } catch (err) {
          if (err.name === "AbortError") {
            kokoroVoiceDownloadProgress = { loaded: 0, total: 0, percent: 0 };
          }
          throw err;
        } finally {
          kokoroVoiceDownloadAbortController = null;
        }
      }
    }
    return originalFetch(input, init);
  };
  state.tts.kokoro.fetchPatched = true;
}

function cancelKokoroVoiceDownload() {
  if (kokoroVoiceDownloadAbortController) {
    kokoroVoiceDownloadAbortController.abort();
    kokoroVoiceDownloadAbortController = null;
  }
}

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

// ============================================================================
// KOKORO CACHING (IndexedDB)
// ============================================================================

async function getCachedKokoroVoice(voiceName) {
  try {
    const asset = await db.assets
      .where('type')
      .equals('kokoro-voice')
      .and(asset => asset.name === voiceName)
      .first();
    return asset?.data || null;
  } catch (err) {
    console.warn("kokoro:cache:voice-get-failed", voiceName, err);
    return null;
  }
}

async function cacheKokoroVoice(voiceName, voiceBlob) {
  try {
    await db.assets.put({
      name: voiceName,
      type: 'kokoro-voice',
      data: voiceBlob,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    ttsDebug("kokoro:cache:voice-saved", voiceName);
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.error("kokoro:cache:quota-exceeded-voice", voiceName);
      state.tts.kokoro.cacheDisabled = true;
      showToast("Storage full: Kokoro voices will not be cached", "warning");
    } else {
      console.warn("kokoro:cache:voice-save-failed", voiceName, err);
    }
    throw err;
  }
}

async function getCachedKokoroModelFile(filename) {
  const cacheKey = `kokoro-model-file-${filename}`;
  try {
    const asset = await db.assets
      .where('type')
      .equals('kokoro-model-file')
      .and(asset => asset.name === cacheKey)
      .first();
    return asset?.data || null;
  } catch (err) {
    console.warn("kokoro:cache:model-file-get-failed", filename, err);
    return null;
  }
}

async function cacheKokoroModelFile(filename, blob) {
  const cacheKey = `kokoro-model-file-${filename}`;
  try {
    await db.assets.put({
      name: cacheKey,
      type: 'kokoro-model-file',
      data: blob,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    ttsDebug("kokoro:cache:model-file-saved", filename);
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.error("kokoro:cache:quota-exceeded-model-file", filename);
      state.tts.kokoro.cacheDisabled = true;
      showToast("Storage full: Kokoro model files will not be cached", "warning");
    } else {
      console.warn("kokoro:cache:model-file-save-failed", filename, err);
    }
    throw err;
  }
}

async function getCachedKokoroModel() {
  try {
    const asset = await db.assets
      .where('type')
      .equals('kokoro-model')
      .first();
    return asset?.data || null;
  } catch (err) {
    console.warn("kokoro:cache:model-get-failed", err);
    return null;
  }
}

async function cacheKokoroModel(modelBlob) {
  try {
    await db.assets.put({
      name: KOKORO_MODEL_ID,
      type: 'kokoro-model',
      data: modelBlob,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    ttsDebug("kokoro:cache:model-saved");
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.error("kokoro:cache:quota-exceeded-model");
      state.tts.kokoro.cacheDisabled = true;
      showToast("Storage full: Kokoro model will not be cached", "warning");
    } else {
      console.warn("kokoro:cache:model-save-failed", err);
    }
    throw err;
  }
}

async function clearKokoroCache() {
  try {
    await db.assets
      .where('type')
      .anyOf(['kokoro-model', 'kokoro-voice', 'kokoro-model-file'])
      .delete();
    ttsDebug("kokoro:cache:cleared");
  } catch (err) {
    console.warn("kokoro:cache:clear-failed", err);
  }
}

function isKokoroCacheDisabled() {
  return state.tts?.kokoro?.cacheDisabled === true;
}

function enableKokoroCache() {
  if (state.tts?.kokoro) {
    state.tts.kokoro.cacheDisabled = false;
  }
}

function getFilteredKokoroVoicesForLanguage(language = "") {
  return KOKORO_VOICE_OPTIONS;
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

async function ensureKokoroInstance(device = "webgpu", dtype = "auto") {
  const normalizedDevice = KOKORO_DEVICE_OPTIONS.includes(device)
    ? device
    : "webgpu";
  const normalizedDtype = KOKORO_DTYPE_OPTIONS.includes(dtype) ? dtype : "auto";

  // Return existing instance if same config
  if (
    state.tts.kokoro.instance &&
    state.tts.kokoro.config.device === normalizedDevice &&
    state.tts.kokoro.config.dtype === normalizedDtype
  ) {
    return state.tts.kokoro.instance;
  }

  // Clean up old instance if different config
  if (state.tts.kokoro.instance) {
    if (state.tts.kokoro.config.device === 'wasm') {
      terminateKokoroWorker();
    }
    state.tts.kokoro.instance = null;
  }

  state.tts.kokoro.loading = true;

  try {
    // WASM: use worker-based inference
    if (normalizedDevice === 'wasm') {
      const workerReady = await initKokoroWorker(normalizedDevice, normalizedDtype);
      if (!workerReady) {
        throw new Error("Failed to initialize Kokoro worker");
      }
      const proxy = new WorkerProxy(normalizedDevice, normalizedDtype);
      state.tts.kokoro.instance = proxy;
      state.tts.kokoro.config.device = normalizedDevice;
      state.tts.kokoro.config.dtype = normalizedDtype;
      state.tts.kokoro.loading = false;
      const preferredVoice =
        state.tts.kokoro.selectedVoice || DEFAULT_KOKORO_VOICE;
      if (!state.tts.kokoro.voiceListLoaded) {
        populateKokoroVoiceSelect(preferredVoice, state.charModalActiveLanguage);
      }
      updateTtsSupportUi();
      return proxy;
    }

    // WebGPU: direct instance
    patchKokoroVoiceFetch();
    const module = await loadKokoroModule();
    const KokoroTTS = module?.KokoroTTS;
    if (!KokoroTTS) {
      throw new Error("Kokoro.js module is missing KokoroTTS.");
    }

    const instance = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
      device: normalizedDevice,
      dtype: normalizedDtype,
      progress_callback: (info) => ttsDebug("kokoro:progress", info),
    });

    // Patch _validate_voice to allow all voices
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
    "webgpu";
  const dtype =
    (currentCharacter?.kokoroDtype &&
      String(currentCharacter.kokoroDtype).trim()) ||
    state.tts.kokoro.config.dtype ||
    "auto";
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
    device: String(source?.kokoroDevice || "webgpu"),
    dtype: String(source?.kokoroDtype || "auto"),
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

// ============================================================================
// WORKER-BASED INFERENCE (for non-blocking WASM)
// ============================================================================

let kokoroWorker = null;
let kokoroWorkerReady = false;
let kokoroWorkerInitializing = false;
const kokoroWorkerPromises = new Map(); // generationId -> Promise

/**
 * Creates or returns the existing Kokoro Web Worker.
 * The worker handles TTS generation off the main thread to prevent UI freezing.
 */
function getKokoroWorker() {
  if (kokoroWorker) return kokoroWorker;

  const WorkerConstructor = window.Worker || window.webkitWorker;
  if (!WorkerConstructor) {
    throw new Error("Web Workers not supported in this browser.");
  }

  // Get the worker script path relative to the current page
  const workerPath = (() => {
    const scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
      if (script.src && script.src.includes("kokoro.js")) {
        // kokoro.js is in tts/, so worker is also in tts/
        const base = script.src.substring(0, script.src.lastIndexOf("/"));
        return `${base}/kokoro-worker.js`;
      }
    }
    // Fallback: assume relative path from current location
    return "tts/kokoro-worker.js";
  })();

  kokoroWorker = new WorkerConstructor(workerPath, { type: "module" });
  kokoroWorkerReady = false;
  kokoroWorkerInitializing = false;

  // Handle messages from worker
  kokoroWorker.onmessage = (event) => {
    const { type, id, arrayBuffer, success, error, resourceType, name, loaded, total, percent } = event.data || {};

    switch (type) {
      case 'initialized':
        kokoroWorkerReady = success;
        kokoroWorkerInitializing = false;
        if (success) {
          ttsDebug("kokoro:worker:initialized");
        } else {
          console.error("kokoro:worker:init-failed", error);
        }
        break;

      case 'generated':
        const genPromise = kokoroWorkerPromises.get(id);
        if (genPromise) {
          if (error) {
            genPromise.reject(new Error(error));
          } else {
            genPromise.resolve(arrayBuffer);
          }
          kokoroWorkerPromises.delete(id);
        }
        break;

      case 'cancelled':
        const cancelPromise = kokoroWorkerPromises.get(id);
        if (cancelPromise) {
          cancelPromise.reject(new Error("Generation cancelled"));
          kokoroWorkerPromises.delete(id);
        }
        break;

      case 'download-progress':
        // Forward progress to global state for UI
        kokoroVoiceDownloadProgress.loaded = loaded;
        kokoroVoiceDownloadProgress.total = total;
        kokoroVoiceDownloadProgress.percent = percent;
        ttsDebug("kokoro:worker:download-progress", { resourceType, name, loaded, total, percent });
        break;

      case 'download-complete':
        if (resourceType === 'voice' && name) {
          markVoiceDownloaded(name);
        }
        ttsDebug("kokoro:worker:download-complete", { resourceType, name });
        break;
    }
  };

  kokoroWorker.onerror = (err) => {
    console.error("kokoro:worker:error", err);
    kokoroWorkerReady = false;
    // Reject all pending promises
    for (const [id, promise] of kokoroWorkerPromises) {
      promise.reject(new Error("Worker error: " + err.message));
      kokoroWorkerPromises.delete(id);
    }
  };

  return kokoroWorker;
}

/**
 * Initializes the worker with the specified device/dtype.
 * Returns a promise that resolves when the worker is ready.
 */
async function initKokoroWorker(device, dtype) {
  const worker = getKokoroWorker();

  // Already ready or initializing?
  if (kokoroWorkerReady) {
    return true;
  }
  if (kokoroWorkerInitializing) {
    // Wait for existing initialization to complete
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!kokoroWorkerInitializing) {
          clearInterval(checkInterval);
          resolve(kokoroWorkerReady);
        }
      }, 50);
    });
    return kokoroWorkerReady;
  }

  kokoroWorkerInitializing = true;
  ttsDebug("kokoro:worker:starting-init", { device, dtype });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      kokoroWorkerInitializing = false;
      reject(new Error("Worker initialization timeout"));
    }, 30000);

    const handleMessage = (event) => {
      if (event.data?.type === 'initialized') {
        clearTimeout(timeout);
        worker.removeEventListener('message', handleMessage);
        resolve(event.data.success);
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: 'init', device, dtype });
  });
}

/**
 * Generates audio via the worker.
 * Returns a promise that resolves with ArrayBuffer of the audio data.
 */
function generateKokoroViaWorker(text, voice, speed) {
  const worker = getKokoroWorker();
  const generationId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return new Promise((resolve, reject) => {
    kokoroWorkerPromises.set(generationId, { resolve, reject });

    worker.postMessage({
      type: 'generate',
      id: generationId,
      text,
      voice,
      speed,
    }, []);

    // Timeout for safety
    setTimeout(() => {
      if (kokoroWorkerPromises.has(generationId)) {
        kokoroWorkerPromises.delete(generationId);
        reject(new Error("Worker generation timeout"));
      }
    }, 60000);
  });
}

/**
 * Cancels a specific generation in the worker.
 */
function cancelKokoroWorkerGeneration(generationId) {
  const worker = kokoroWorker;
  if (worker) {
    worker.postMessage({ type: 'cancel', id: generationId });
  }
  // Also clean up the promise
  const promise = kokoroWorkerPromises.get(generationId);
  if (promise) {
    promise.reject(new Error("Generation cancelled"));
    kokoroWorkerPromises.delete(generationId);
  }
}

/**
 * Terminates the worker, cleaning up resources.
 * Call this when switching away from kokoro or on page unload.
 */
function terminateKokoroWorker() {
  if (kokoroWorker) {
    kokoroWorker.terminate();
    kokoroWorker = null;
    kokoroWorkerReady = false;
    kokoroWorkerInitializing = false;
    kokoroWorkerPromises.clear();
    ttsDebug("kokoro:worker:terminated");
  }
}

/**
 * Checks if the worker is ready for generation.
 */
function isKokoroWorkerReady() {
  return kokoroWorkerReady && kokoroWorker && !kokoroWorkerInitializing;
}

/**
 * Proxy class that makes the worker look like a KokoroTTS instance.
 * Used when device is 'wasm' to offload inference to a background thread.
 */
class WorkerProxy {
  constructor(device, dtype) {
    this.device = device;
    this.dtype = dtype;
    // Allow all voices
    this._validate_voice = (voice) => voice;
  }

  async generate(text, options) {
    const { voice, speed } = options;
    const arrayBuffer = await generateKokoroViaWorker(text, voice, speed);
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
    return {
      toBlob: () => Promise.resolve(blob)
    };
  }
}

if (typeof window !== "undefined") {
  window.getKokoroVoiceDownloadProgress = getKokoroVoiceDownloadProgress;
  window.resetKokoroVoiceDownloadProgress = resetKokoroVoiceDownloadProgress;
  window.cancelKokoroVoiceDownload = cancelKokoroVoiceDownload;
  window.isVoiceDownloaded = isVoiceDownloaded;
  window.clearKokoroCache = clearKokoroCache;

  // Expose worker management functions
  window.initKokoroWorker = initKokoroWorker;
  window.isKokoroWorkerReady = isKokoroWorkerReady;
  window.generateKokoroViaWorker = generateKokoroViaWorker;
  window.cancelKokoroWorkerGeneration = cancelKokoroWorkerGeneration;
  window.terminateKokoroWorker = terminateKokoroWorker;

  // Terminate worker on page unload to free resources
  window.addEventListener('unload', terminateKokoroWorker);
}
