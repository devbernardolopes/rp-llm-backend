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
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.src && script.src.includes('summarizer.js')) {
      const base = script.src.substring(0, script.src.lastIndexOf('/'));
      return `${base}/summarizer-worker.js`;
    }
  }
  const currentUrl = window.location.href;
  const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
  return `${baseUrl}/summarizer/summarizer-worker.js`;
}

function getSummarizationWorker() {
  if (summarizationWorker) return summarizationWorker;

  const WorkerConstructor = window.Worker || window.webkitWorker;
  if (!WorkerConstructor) {
    throw new Error('Web Workers not supported in this browser.');
  }

  const workerPath = getWorkerPath();
  console.log('[summarizer] Creating worker with path:', workerPath);
  summarizationWorker = new WorkerConstructor(workerPath, { type: 'module' });
}

async function initSummarizationWorker() {
  console.log('[summarizer] Starting init...');
  const worker = getSummarizationWorker();

  if (summarizationWorkerReady) {
    console.log('[summarizer] Already ready');
    return true;
  }

  if (summarizationWorkerInitializing) {
    console.log('[summarizer] Already initializing, waiting...');
    await new Promise((resolve) => {
      const checkReady = setInterval(() => {
        if (!summarizationWorkerInitializing) {
          clearInterval(checkReady);
          resolve();
        }
      }, 50);
    });
    console.log('[summarizer] Wait complete, ready:', summarizationWorkerReady);
    return summarizationWorkerReady;
  }

  summarizationWorkerInitializing = true;
  console.log('[summarizer] Posting init message to worker');
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

    console.log('[summarizer] Posting task message to worker:', type, id);
    try {
      worker.postMessage(message);
      console.log('[summarizer] Task message posted successfully');
    } catch (postErr) {
      console.error('[summarizer] Failed to post task message:', postErr);
      reject(postErr);
    }
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
  console.log('[summarizer] getLocalTitle called, text length:', text?.length);
  const inputText = String(text || '').trim();
  if (!inputText) {
    console.log('[summarizer] Empty input, returning null');
    return null;
  }

  try {
    console.log('[summarizer] Calling ensureWorkerReady...');
    await ensureWorkerReady();
    console.log('[summarizer] Worker ready, running title task...');
    let result = null;
    try {
      result = await Promise.race([
        runSummarizationTask('title', inputText),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Title task timed out')), 180000))
      ]);
      console.log('[summarizer] Title task result:', result);
    } catch (taskErr) {
      console.error('[summarizer] Title task failed:', taskErr);
    }
    await unloadSummarizationWorker();
    return result?.text || null;
    return result?.text || null;
  } catch (err) {
    console.error('[summarizer] Local auto-title failed:', err);
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
