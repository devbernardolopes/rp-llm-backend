/**
 * Summarization Web Worker
 *
 * This worker handles Distilbart summarization model loading and inference
 * off the main thread to prevent UI freezing. The model is loaded on demand
 * and unloaded after each use to minimize memory usage.
 *
 * Message format (Main → Worker):
 *   { type: 'init' }
 *   { type: 'summarize', id, text, maxLength, minLength }
 *   { type: 'title', id, text }
 *   { type: 'unload' }
 *
 * Response format (Worker → Main):
 *   { type: 'initialized', success, error? }
 *   { type: 'result', id, text, task: 'summarize'|'title' }
 *   { type: 'error', id, message }
 *   { type: 'unloaded' }
 *   { type: 'download-progress', loaded, total, percent }
 */

const MODEL_ID = 'Xenova/distilbart-cnn-12-6';

let summarizerInstance = null;
const pendingRequests = new Map();

function swDebug(...args) {
  // Uncomment for worker debugging:
  // console.debug('[summarizer-worker]', ...args);
}

// ==================== IndexedDB Caching ====================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rp-llm-backend-db');
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('assets')) {
        const store = db.createObjectStore('assets', { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('name', 'name', { unique: false });
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
    const tx = db.transaction('assets', 'readonly');
    const store = tx.objectStore('assets');
    const index = store.index('type');
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
    swDebug('summarizer-worker:cache-get-failed', type, name, err);
    return null;
  } finally {
    if (db) db.close();
  }
}

async function cacheAsset(type, name, blob) {
  let db = null;
  try {
    db = await openDB();
    const tx = db.transaction('assets', 'readwrite');
    const store = tx.objectStore('assets');

    const index = store.index('type');
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
      deleteCursorRequest.onsuccess = (e) => reject(e);
    });

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
    swDebug('summarizer-worker:cache-saved', type, name);
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      swDebug('summarizer-worker:cache:quota-exceeded', type, name);
    } else {
      swDebug('summarizer-worker:cache-save-failed', type, name, err);
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
    let url = typeof input === 'string' ? input : input?.url;

    if (typeof url === 'string' && url.includes(MODEL_ID)) {
      const filename = url.split('/').pop();
      const resourceName = filename || url;
      const cacheType = 'summarizer-model-file';

      try {
        const cachedBlob = await getCachedAsset(cacheType, resourceName);
        if (cachedBlob) {
          swDebug('summarizer:model:from-cache', resourceName);
          return new Response(cachedBlob);
        }
      } catch (err) {
        swDebug('summarizer:cache:check-failed', resourceName, err);
      }

      try {
        const response = await originalFetch(url, init);
        if (!response.ok) {
          return response;
        }

        const contentLength = response.headers.get('content-length');
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

          self.postMessage({
            type: 'download-progress',
            loaded,
            total,
            percent,
          });
        }

        const allChunks = new Uint8Array(loaded);
        let position = 0;
        for (const chunk of chunks) {
          allChunks.set(chunk, position);
          position += chunk.length;
        }

        try {
          const blob = new Blob([allChunks]);
          await cacheAsset(cacheType, resourceName, blob);
          swDebug('summarizer:model:cached', resourceName);
        } catch (err) {
          swDebug('summarizer:model:cache-failed', resourceName, err);
        }

        return new Response(allChunks, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          swDebug('summarizer:model:download-aborted', resourceName);
        }
        throw err;
      }
    }

    return originalFetch(input, init);
  };
}

// ==================== Model Loading ====================

async function loadTransformersModule() {
  const MODULE_PATHS = [
    'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0',
  ];

  for (const path of MODULE_PATHS) {
    try {
      swDebug('summarizer-worker:importing', path);
      const module = await import(path);
      return module;
    } catch (err) {
      swDebug('summarizer-worker:import-failed', path, err);
    }
  }
  throw new Error('Unable to load Transformers.js module in worker.');
}

async function initSummarizer() {
  patchFetchInWorker();

  if (summarizerInstance) {
    return true;
  }

  try {
    swDebug('summarizer-worker:loading-module');
    const { pipeline } = await loadTransformersModule();

    swDebug('summarizer-worker:creating-pipeline', MODEL_ID);
    summarizerInstance = await pipeline('summarization', MODEL_ID);

    swDebug('summarizer-worker:ready');
    return true;
  } catch (err) {
    console.error('summarizer-worker:init-failed', err);
    summarizerInstance = null;
    return false;
  }
}

function unloadSummarizer() {
  summarizerInstance = null;
  swDebug('summarizer-worker:unloaded');
}

// ==================== Inference ====================

async function summarize(text, maxLength = 150, minLength = 30) {
  if (!summarizerInstance) {
    throw new Error('Summarizer not initialized');
  }

  const inputText = String(text || '').trim();
  if (!inputText) {
    throw new Error('Empty text input');
  }

  swDebug('summarizer-worker:summarizing', { length: inputText.length });

  const output = await summarizerInstance(inputText, {
    max_length: maxLength,
    min_length: minLength,
    do_sample: false,
  });

  if (output && output[0]?.summary_text) {
    return output[0].summary_text.trim();
  }
  return null;
}

async function generateTitle(text) {
  if (!summarizerInstance) {
    throw new Error('Summarizer not initialized');
  }

  const inputText = String(text || '').trim();
  if (!inputText) {
    throw new Error('Empty text input');
  }

  swDebug('summarizer-worker:generating-title', { length: inputText.length });

  const output = await summarizerInstance(inputText, {
    max_length: 40,
    min_length: 5,
    do_sample: false,
  });

  if (output && output[0]?.summary_text) {
    let title = output[0].summary_text.trim();
    title = title.replace(/^["'`]+|["'`]+$/g, '');
    title = title.replace(/\s+/g, ' ').trim();
    return title.slice(0, 128);
  }
  return null;
}

// ==================== Message Handling ====================

self.onmessage = async (event) => {
  const { type, id, text, maxLength, minLength } = event.data || {};

  try {
    switch (type) {
      case 'init':
        swDebug('summarizer-worker:init-request');
        const initSuccess = await initSummarizer();
        self.postMessage({ type: 'initialized', success: initSuccess });
        break;

      case 'summarize':
        try {
          swDebug('summarizer-worker:summarize-request', id);
          const result = await summarize(text, maxLength || 150, minLength || 30);
          self.postMessage({ type: 'result', id, text: result, task: 'summarize' });
        } catch (err) {
          swDebug('summarizer-worker:summarize-error', id, err.message);
          self.postMessage({ type: 'error', id, message: err.message || String(err) });
        }
        break;

      case 'title':
        try {
          swDebug('summarizer-worker:title-request', id);
          const result = await generateTitle(text);
          self.postMessage({ type: 'result', id, text: result, task: 'title' });
        } catch (err) {
          swDebug('summarizer-worker:title-error', id, err.message);
          self.postMessage({ type: 'error', id, message: err.message || String(err) });
        }
        break;

      case 'unload':
        unloadSummarizer();
        self.postMessage({ type: 'unloaded' });
        break;

      default:
        swDebug('summarizer-worker:unknown-message-type', type);
    }
  } catch (err) {
    console.error('summarizer-worker:error', err);
    if (type === 'init') {
      self.postMessage({ type: 'initialized', success: false, error: err.message });
    }
  }
};

self.onclose = () => {
  summarizerInstance = null;
  swDebug('summarizer-worker:closed');
};
