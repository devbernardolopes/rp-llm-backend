// summarizer.js
// Local summarization using Transformers.js via Web Worker
// Model loads on demand and unloads after each use to minimize memory usage

let summarizationWorker = null;
let summarizationWorkerReady = false;
let summarizationWorkerInitializing = false;
const summarizationPromises = new Map();
let summarizationIdCounter = 0;

function getWorkerPath() {
  const scripts = document.getElementsByTagName('script');
  for (let script of scripts) {
    if (script.src && script.src.includes('summarizer.js')) {
      const base = script.src.substring(0, script.src.lastIndexOf('/'));
      return `${base}/summarizer-worker.js`;
    }
  }
  return 'summarizer/summarizer-worker.js';
}

function getSummarizationWorker() {
  if (summarizationWorker) return summarizationWorker;

  const WorkerConstructor = window.Worker || window.webkitWorker;
  if (!WorkerConstructor) {
    throw new Error('Web Workers not supported in this browser.');
  }

  const workerPath = getWorkerPath();
  summarizationWorker = new WorkerConstructor(workerPath, { type: 'module' });

  summarizationWorkerReady = false;
  summarizationWorkerInitializing = false;

  summarizationWorker.onmessage = (event) => {
    const { type, id, text, task, success, error, message, loaded, total, percent } = event.data || {};

    switch (type) {
      case 'initialized':
        summarizationWorkerReady = success;
        summarizationWorkerInitializing = false;
        if (!success) {
          console.error('summarizer:worker:init-failed', error);
        }
        break;

      case 'result':
        const resultPromise = summarizationPromises.get(id);
        if (resultPromise) {
          resultPromise.resolve({ text, task });
          summarizationPromises.delete(id);
        }
        break;

      case 'error':
        const errorPromise = summarizationPromises.get(id);
        if (errorPromise) {
          errorPromise.reject(new Error(message || 'Summarization failed'));
          summarizationPromises.delete(id);
        }
        break;

      case 'unloaded':
        summarizationWorkerReady = false;
        break;

      case 'download-progress':
        break;

      default:
        break;
    }
  };

  summarizationWorker.onerror = (err) => {
    console.error('summarizer:worker:error', err);
    summarizationWorkerReady = false;
    summarizationWorkerInitializing = false;

    for (const [id, promise] of summarizationPromises) {
      promise.reject(new Error('Worker error: ' + err.message));
      summarizationPromises.delete(id);
    }
  };

  return summarizationWorker;
}

async function initSummarizationWorker() {
  const worker = getSummarizationWorker();

  if (summarizationWorkerReady) {
    return true;
  }

  if (summarizationWorkerInitializing) {
    await new Promise((resolve) => {
      const checkReady = setInterval(() => {
        if (!summarizationWorkerInitializing) {
          clearInterval(checkReady);
          resolve();
        }
      }, 50);
    });
    return summarizationWorkerReady;
  }

  summarizationWorkerInitializing = true;
  worker.postMessage({ type: 'init' });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      summarizationWorkerInitializing = false;
      if (!summarizationWorkerReady) {
        reject(new Error('Summarization worker init timeout'));
      } else {
        resolve();
      }
    }, 300000);

    const checkReady = setInterval(() => {
      if (summarizationWorkerReady) {
        clearInterval(checkReady);
        clearTimeout(timeout);
        summarizationWorkerInitializing = false;
        resolve();
      } else if (!summarizationWorkerInitializing) {
        clearInterval(checkReady);
        clearTimeout(timeout);
        if (!summarizationWorkerReady) {
          reject(new Error('Summarization worker init failed'));
        } else {
          resolve();
        }
      }
    }, 50);
  });

  return summarizationWorkerReady;
}

async function unloadSummarizationWorker() {
  if (summarizationWorker) {
    summarizationWorker.postMessage({ type: 'unload' });
    summarizationWorker.terminate();
    summarizationWorker = null;
    summarizationWorkerReady = false;
    summarizationWorkerInitializing = false;
    summarizationPromises.clear();
  }
}

async function runSummarizationTask(type, text, options = {}) {
  const worker = getSummarizationWorker();

  if (!summarizationWorkerReady) {
    await initSummarizationWorker();
  }

  if (!summarizationWorkerReady) {
    throw new Error('Summarization worker not ready');
  }

  const id = ++summarizationIdCounter;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (summarizationPromises.has(id)) {
        summarizationPromises.delete(id);
        reject(new Error('Summarization task timeout'));
      }
    }, 120000);

    summarizationPromises.set(id, {
      resolve: (result) => {
        clearTimeout(timeout);
        resolve(result);
      },
      reject: (err) => {
        clearTimeout(timeout);
        reject(err);
      },
    });

    const message = { type, id, text };
    if (type === 'summarize') {
      message.maxLength = options.maxLength || 150;
      message.minLength = options.minLength || 30;
    }

    worker.postMessage(message);
  });
}

async function ensureWorkerReady() {
  if (!summarizationWorkerReady) {
    await initSummarizationWorker();
  }
}

async function getLocalSummary(text) {
  const inputText = String(text || '').trim();
  if (!inputText) return null;

  try {
    await ensureWorkerReady();
    const result = await runSummarizationTask('summarize', inputText, {
      maxLength: 150,
      minLength: 30,
    });
    await unloadSummarizationWorker();
    return result?.text || null;
  } catch (err) {
    console.warn('Local summarization failed:', err);
    await unloadSummarizationWorker();
    return null;
  }
}

async function getLocalTitle(text) {
  const inputText = String(text || '').trim();
  if (!inputText) return null;

  try {
    await ensureWorkerReady();
    const result = await runSummarizationTask('title', inputText);
    await unloadSummarizationWorker();
    return result?.text || null;
  } catch (err) {
    console.warn('Local auto-title failed:', err);
    await unloadSummarizationWorker();
    return null;
  }
}

function preloadSummarizationIfEnabled() {
  // No-op: model loads on demand, not when setting is enabled
}

window.loadSummarizationModel = null;
window.getLocalSummary = getLocalSummary;
window.getLocalTitle = getLocalTitle;
window.preloadSummarizationIfEnabled = preloadSummarizationIfEnabled;
window.unloadSummarizationWorker = unloadSummarizationWorker;
