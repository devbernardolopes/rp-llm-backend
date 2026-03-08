/**
 * Kokoro TTS Web Worker
 *
 * This worker handles Kokoro TTS generation off the main thread to prevent
 * UI freezing when using WASM mode. The worker maintains its own KokoroTTS
 * instance and processes generation requests asynchronously.
 *
 * Message format:
 *   { type: 'init', device, dtype }
 *   { type: 'generate', id, text, voice, speed }
 *   { type: 'cancel', id }
 *
 * Response format:
 *   { type: 'initialized', success }
 *   { type: 'generated', id, arrayBuffer, error? }
 *   { type: 'cancelled', id }
 */

// Simple debug function
function ttsDebug(...args) {
  // Uncomment for worker debugging:
  // console.debug('[kokoro-worker]', ...args);
}

// Constants
const KOKORO_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

// State
let kokoroInstance = null;
let currentConfig = null;
const pendingGenerations = new Map(); // id -> { resolve, reject, abortController }
let activeGenerationAbortController = null;

// Download progress tracking
let workerDownloadProgress = { loaded: 0, total: 0, percent: 0 };
const workerDownloadedVoices = new Set();

// ==================== IndexedDB Caching ====================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rp-llm-backend-db");
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("assets")) {
        const store = db.createObjectStore("assets", { keyPath: "id", autoIncrement: true });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("name", "name", { unique: false });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function getCachedAsset(type, name) {
  let db = null;
  try {
    db = await openDB();
    const tx = db.transaction("assets", "readonly");
    const store = tx.objectStore("assets");
    const index = store.index("type");
    const request = index.openCursor(IDBKeyRange.only(type));
    let result = null;
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.name === name) {
          result = cursor.value.data;
          cursor.close();
        } else {
          cursor.continue();
        }
      }
    };
    await new Promise((resolve, reject) => {
      request.oncomplete = () => resolve();
      request.onerror = (e) => reject(e);
    });
    return result;
  } catch (err) {
    console.warn("kokoro-worker:cache-get-failed", type, name, err);
    return null;
  } finally {
    if (db) db.close();
  }
}

async function cacheAsset(type, name, blob) {
  let db = null;
  try {
    db = await openDB();
    const tx = db.transaction("assets", "readwrite");
    const store = tx.objectStore("assets");
    // Delete existing entries with same type+name
    const index = store.index("type");
    const deleteCursorRequest = index.openCursor(IDBKeyRange.only(type));
    await new Promise((resolve, reject) => {
      deleteCursorRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.name === name) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      deleteCursorRequest.onerror = (e) => reject(e);
    });
    // Add new asset
    await new Promise((resolve, reject) => {
      const addRequest = store.add({
        name,
        type,
        data: blob,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = (e) => reject(e);
    });
    ttsDebug("kokoro-worker:cache-saved", type, name);
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.error("kokoro-worker:cache:quota-exceeded", type, name);
    } else {
      console.warn("kokoro-worker:cache-save-failed", type, name, err);
    }
    throw err;
  } finally {
    if (db) db.close();
  }
}

// ==================== Fetch Patching ====================

function patchKokoroVoiceFetchInWorker() {
  if (self._kokoroFetchPatched) return;
  self._kokoroFetchPatched = true;

  const originalFetch = self.fetch.bind(self);
  self.fetch = async function (input, init) {
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
        resourceName = url.split('/').pop();
      }

      if (isVoice || isModel) {
        // Check persistent cache first
        try {
          const type = isVoice ? 'kokoro-voice' : 'kokoro-model-file';
          const cachedBlob = await getCachedAsset(type, resourceName);
          if (cachedBlob) {
            ttsDebug(isVoice ? "kokoro:voice:from-cache" : "kokoro:model:from-cache", resourceName);
            self.postMessage({ type: 'download-complete', resourceType: isVoice ? 'voice' : 'model-file', name: resourceName });
            return new Response(cachedBlob);
          }
        } catch (err) {
          console.warn(isVoice ? "kokoro:cache:voice-check-failed" : "kokoro:cache:model-check-failed", resourceName, err);
        }

        // Network download with in-memory tracking
        const abortController = new AbortController();
        // Use active generation's abort signal if available to link cancellation
        if (activeGenerationAbortController) {
          // We'll listen to both signals; using activeGenerationAbortController directly to abort fetch when generation cancels
          // But we need to pass a signal to fetch. We'll pass activeGenerationAbortController.signal if available.
          // However, that signal may already be aborted when generation cancels.
        }
        const signal = activeGenerationAbortController || abortController;
        const options = {
          ...init,
          signal: signal.signal,
        };

        try {
          const response = await originalFetch(url, options);
          if (!response.ok) {
            return response;
          }
          const contentLength = response.headers.get("content-length");
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          workerDownloadProgress.total = total;
          workerDownloadProgress.loaded = 0;

          if (!response.body) {
            return response;
          }
          const reader = response.body.getReader();
          const chunks = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            workerDownloadProgress.loaded += value.length;
            workerDownloadProgress.percent = total > 0 ? Math.round((workerDownloadProgress.loaded / total) * 100) : 0;
            // Send progress to main thread
            self.postMessage({
              type: 'download-progress',
              resourceType: isVoice ? 'voice' : 'model-file',
              name: resourceName,
              loaded: workerDownloadProgress.loaded,
              total: workerDownloadProgress.total,
              percent: workerDownloadProgress.percent,
            });
          }

          const allChunks = new Uint8Array(workerDownloadProgress.loaded);
          let position = 0;
          for (const chunk of chunks) {
            allChunks.set(chunk, position);
            position += chunk.length;
          }

          // Cache to IndexedDB
          try {
            const blob = new Blob([allChunks]);
            const type = isVoice ? 'kokoro-voice' : 'kokoro-model-file';
            await cacheAsset(type, resourceName, blob);
            if (isVoice) {
              workerDownloadedVoices.add(resourceName);
              self.postMessage({ type: 'download-complete', resourceType: 'voice', name: resourceName });
            }
          } catch (err) {
            console.warn(isVoice ? "kokoro:cache:voice-save-failed" : "kokoro:cache:model-save-failed", resourceName, err);
          }

          return new Response(allChunks, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        } catch (err) {
          if (err.name === "AbortError") {
            workerDownloadProgress = { loaded: 0, total: 0, percent: 0 };
          }
          throw err;
        }
      }
    }
    return originalFetch(input, init);
  };
}

// ==================== Kokoro Module & Instance ====================

async function loadKokoroModule() {
  const KOKORO_MODULE_PATHS = [
    "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js",
  ];

  for (const path of KOKORO_MODULE_PATHS) {
    try {
      const module = await import(path);
      return module;
    } catch (err) {
      console.warn("kokoro-worker:import-failed", path, err);
    }
  }
  throw new Error("Unable to load Kokoro.js module in worker.");
}

async function initKokoro(device, dtype) {
  // Ensure fetch is patched before any network activity
  patchKokoroVoiceFetchInWorker();

  if (kokoroInstance && currentConfig && currentConfig.device === device && currentConfig.dtype === dtype) {
    return true;
  }

  try {
    const module = await loadKokoroModule();
    const KokoroTTS = module?.KokoroTTS;
    if (!KokoroTTS) {
      throw new Error("Kokoro.js module is missing KokoroTTS.");
    }

    kokoroInstance = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
      device,
      dtype,
    });

    // Allow all voices
    kokoroInstance._validate_voice = (voice) => voice;

    currentConfig = { device, dtype };
    ttsDebug("kokoro-worker:instance-created", { device, dtype });
    return true;
  } catch (err) {
    console.error("kokoro-worker:init-failed", err);
    kokoroInstance = null;
    currentConfig = null;
    return false;
  }
}

// ==================== Generation ====================

async function generateChunk(text, voice, speed, generationId) {
  if (!kokoroInstance) {
    throw new Error("Kokoro not initialized");
  }

  const abortController = new AbortController();
  activeGenerationAbortController = abortController;
  pendingGenerations.set(generationId, { abortController });

  try {
    const raw = await kokoroInstance.generate(text, { voice, speed });
    const blob = await raw.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    pendingGenerations.delete(generationId);
    activeGenerationAbortController = null;
    return arrayBuffer;
  } catch (err) {
    pendingGenerations.delete(generationId);
    activeGenerationAbortController = null;
    if (abortController.signal.aborted) {
      throw new Error('Generation cancelled');
    }
    throw err;
  }
}

// ==================== Message Handling ====================

self.onmessage = async (event) => {
  const { type, id, device, dtype, text, voice, speed } = event.data || {};

  try {
    switch (type) {
      case 'init':
        const success = await initKokoro(device, dtype);
        self.postMessage({ type: 'initialized', success });
        break;

      case 'generate':
        try {
          const arrayBuffer = await generateChunk(text, voice, speed, id);
          self.postMessage({ type: 'generated', id, arrayBuffer }, [arrayBuffer]);
        } catch (err) {
          self.postMessage({ type: 'generated', id, error: err.message || String(err) });
        }
        break;

      case 'cancel':
        const gen = pendingGenerations.get(id);
        if (gen?.abortController) {
          gen.abortController.abort();
        }
        pendingGenerations.delete(id);
        self.postMessage({ type: 'cancelled', id });
        break;

      default:
        console.warn("kokoro-worker:unknown-message-type", type);
    }
  } catch (err) {
    console.error("kokoro-worker:error", err);
    if (type === 'init') {
      self.postMessage({ type: 'initialized', success: false, error: err.message });
    }
  }
};

self.onclose = () => {
  // Cancel all pending generations
  for (const [id, { abortController }] of pendingGenerations) {
    if (abortController) {
      abortController.abort();
    }
  }
  pendingGenerations.clear();
  activeGenerationAbortController = null;
  kokoroInstance = null;
  currentConfig = null;
  ttsDebug("kokoro:worker:closed");
};
