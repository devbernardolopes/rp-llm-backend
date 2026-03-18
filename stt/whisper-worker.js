/**
 * Whisper STT Web Worker
 *
 * This worker handles Whisper ASR model loading and transcription off the main thread
 * to prevent UI freezing. The worker maintains its own model instance and processes
 * transcription requests asynchronously with IndexedDB caching for faster subsequent loads.
 *
 * Message format:
 *   { type: 'init' }
 *   { type: 'transcribe', id, audioData (Float32Array), language, sampleRate }
 *   { type: 'cancel', id }
 *
 * Response format:
 *   { type: 'initialized', success, error? }
 *   { type: 'transcribed', id, text }
 *   { type: 'error', id, message }
 *   { type: 'cancelled', id }
 *   { type: 'download-progress', loaded, total, percent }
 */

const WHISPER_MODEL_ID = "Xenova/whisper-tiny";
const TARGET_SAMPLE_RATE = 16000;

let whisperInstance = null;
const pendingTranscriptions = new Map();
let currentAudioContext = null;

function sttDebug(...args) {
  // Uncomment for worker debugging:
  // console.debug('[whisper-worker]', ...args);
}

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
    
    await new Promise((resolve, reject) => {
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.name === name) {
            result = cursor.value.data;
            cursor.close();
          } else {
            cursor.continue();
          }
        } else {
          resolve();
        }
      };
      request.onerror = (e) => reject(e);
    });
    return result;
  } catch (err) {
    sttDebug("whisper-worker:cache-get-failed", type, name, err);
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
    sttDebug("whisper-worker:cache-saved", type, name);
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      sttDebug("whisper-worker:cache:quota-exceeded", type, name);
    } else {
      sttDebug("whisper-worker:cache-save-failed", type, name, err);
    }
  } finally {
    if (db) db.close();
  }
}

// ==================== Fetch Patching ====================

function patchFetchInWorker() {
  if (self._fetchPatched) return;
  self._fetchPatched = true;

  const originalFetch = self.fetch.bind(self);
  
  self.fetch = async function (input, init = {}) {
    let url = typeof input === "string" ? input : input?.url;
    
    if (typeof url === "string" && url.includes(WHISPER_MODEL_ID)) {
      // Extract filename from URL
      const filename = url.split('/').pop();
      const resourceName = filename || url;
      const cacheType = 'whisper-model-file';
      
      // Check persistent cache first
      try {
        const cachedBlob = await getCachedAsset(cacheType, resourceName);
        if (cachedBlob) {
          sttDebug("whisper:model:from-cache", resourceName);
          return new Response(cachedBlob);
        }
      } catch (err) {
        sttDebug("whisper:cache:check-failed", resourceName, err);
      }

      // Network download with progress tracking
      try {
        const response = await originalFetch(url, init);
        if (!response.ok) {
          return response;
        }

        const contentLength = response.headers.get("content-length");
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;

        if (!response.body) {
          return response;
        }

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
          
          // Send progress to main thread
          self.postMessage({
            type: 'download-progress',
            loaded,
            total,
            percent,
          });
        }

        // Combine chunks
        const allChunks = new Uint8Array(loaded);
        let position = 0;
        for (const chunk of chunks) {
          allChunks.set(chunk, position);
          position += chunk.length;
        }

        // Cache to IndexedDB (non-blocking)
        try {
          const blob = new Blob([allChunks]);
          cacheAsset(cacheType, resourceName, blob);
          sttDebug("whisper:model:cached", resourceName);
        } catch (err) {
          sttDebug("whisper:model:cache-failed", resourceName, err);
        }

        return new Response(allChunks, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (err) {
        if (err.name === "AbortError") {
          sttDebug("whisper:model:download-aborted", resourceName);
        }
        throw err;
      }
    }
    
    return originalFetch(input, init);
  };
}

// ==================== Model Loading ====================

async function loadWhisperModule() {
  const MODULE_PATHS = [
    "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0",
  ];

  for (const path of MODULE_PATHS) {
    try {
      sttDebug("whisper-worker:importing", path);
      const module = await import(path);
      return module;
    } catch (err) {
      sttDebug("whisper-worker:import-failed", path, err);
    }
  }
  throw new Error("Unable to load Transformers.js module in worker.");
}

async function initWhisper() {
  patchFetchInWorker();

  if (whisperInstance) {
    return true;
  }

  try {
    sttDebug("whisper-worker:loading-module");
    const { pipeline } = await loadWhisperModule();
    
    sttDebug("whisper-worker:creating-pipeline", WHISPER_MODEL_ID);
    whisperInstance = await pipeline("automatic-speech-recognition", WHISPER_MODEL_ID);
    
    sttDebug("whisper-worker:ready");
    return true;
  } catch (err) {
    console.error("whisper-worker:init-failed", err);
    whisperInstance = null;
    return false;
  }
}

// ==================== Audio Processing ====================

function resampleAudio(channelData, fromSampleRate, toSampleRate = TARGET_SAMPLE_RATE) {
  const ratio = fromSampleRate / toSampleRate;
  const newLength = Math.round(channelData.length / ratio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const index = Math.floor(srcIndex);
    const frac = srcIndex - index;
    
    if (index + 1 < channelData.length) {
      result[i] = channelData[index] * (1 - frac) + channelData[index + 1] * frac;
    } else if (index < channelData.length) {
      result[i] = channelData[index];
    }
  }
  
  return result;
}

async function transcribeAudio(audioData, sampleRate, language) {
  if (!whisperInstance) {
    throw new Error("Whisper not initialized");
  }

  let audioArray = audioData;
  
  // Resample if necessary
  if (sampleRate !== TARGET_SAMPLE_RATE) {
    audioArray = resampleAudio(audioData, sampleRate, TARGET_SAMPLE_RATE);
  }

  // Ensure it's a Float32Array
  if (!(audioArray instanceof Float32Array)) {
    audioArray = new Float32Array(audioArray);
  }

  const langCode = language === "pt-BR" ? "pt" : language.split("-")[0];
  sttDebug("whisper-worker:transcribing", { language, langCode, audioLength: audioArray.length });

  const result = await whisperInstance(audioArray, {
    language: langCode,
    task: "transcribe",
    sampling_rate: TARGET_SAMPLE_RATE,
  });

  return result.text.trim();
}

// ==================== Message Handling ====================

self.onmessage = async (event) => {
  const { type, id, audioData, language, sampleRate } = event.data || {};

  try {
    switch (type) {
      case 'init':
        sttDebug("whisper-worker:init-request");
        const success = await initWhisper();
        self.postMessage({ type: 'initialized', success });
        break;

      case 'transcribe':
        try {
          sttDebug("whisper-worker:transcribe-request", id);
          const text = await transcribeAudio(audioData, sampleRate || 48000, language || "en");
          self.postMessage({ type: 'transcribed', id, text });
        } catch (err) {
          sttDebug("whisper-worker:transcribe-error", id, err.message);
          self.postMessage({ type: 'error', id, message: err.message || String(err) });
        }
        break;

      default:
        sttDebug("whisper-worker:unknown-message-type", type);
    }
  } catch (err) {
    console.error("whisper-worker:error", err);
    if (type === 'init') {
      self.postMessage({ type: 'initialized', success: false, error: err.message });
    }
  }
};

self.onclose = () => {
  whisperInstance = null;
  sttDebug("whisper-worker:closed");
};
