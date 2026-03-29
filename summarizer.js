// summarizer.js
// Local summarization using Transformers.js with Distilbart
// Provides offline-capable summarization to reduce API calls

window.localSummarizationModel = null;
window.localSummarizationReady = false;
window.localSummarizationLoadPromise = null;

/**
 * Loads the Distilbart summarization model.
 * Uses Xenova/distilbart-cnn-12-6: ~270MB, 1024 token context
 * Preloads on startup if setting is enabled.
 */
async function loadSummarizationModel() {
  if (window.localSummarizationReady) return true;
  if (!window.localSummarizationLoadPromise) {
    window.localSummarizationLoadPromise = (async () => {
      try {
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0');
        window.localSummarizationModel = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6');
        window.localSummarizationReady = true;
        console.log('Local summarization model loaded');
        return true;
      } catch (e) {
        console.warn('Failed to load summarization model:', e);
        window.localSummarizationReady = false;
        window.localSummarizationLoadPromise = null;
        return false;
      }
    })();
  }
  return window.localSummarizationLoadPromise;
}

/**
 * Generates a summary using the local model.
 * @param {string} text - The text to summarize (up to ~1024 tokens)
 * @returns {Promise<string|null>} - Summary text or null on failure
 */
async function getLocalSummary(text) {
  const inputText = String(text || '').trim();
  if (!inputText) return null;
  
  if (!window.localSummarizationReady || !window.localSummarizationModel) {
    console.warn('Summarization model not ready');
    return null;
  }
  
  try {
    // Distilbart expects summarization input
    const output = await window.localSummarizationModel(inputText, {
      max_length: 150,  // ~3-5 sentences
      min_length: 30,
      do_sample: false,
    });
    
    if (output && output[0]?.summary_text) {
      return output[0].summary_text.trim();
    }
    return null;
  } catch (e) {
    console.warn('Local summarization failed:', e);
    return null;
  }
}

/**
 * Generates a short title using the local model.
 * @param {string} text - The text to generate title from
 * @returns {Promise<string|null>} - Title text or null on failure
 */
async function getLocalTitle(text) {
  const inputText = String(text || '').trim();
  if (!inputText) return null;
  
  if (!window.localSummarizationReady || !window.localSummarizationModel) {
    console.warn('Summarization model not ready');
    return null;
  }
  
  try {
    const output = await window.localSummarizationModel(inputText, {
      max_length: 40,
      min_length: 5,
      do_sample: false,
    });
    
    if (output && output[0]?.summary_text) {
      let title = output[0].summary_text.trim();
      title = title.replace(/^["'`]+|["'`]+$/g, "");
      title = title.replace(/\s+/g, " ").trim();
      return title.slice(0, 128);
    }
    return null;
  } catch (e) {
    console.warn('Local auto-title failed:', e);
    return null;
  }
}

/**
 * Preloads the model if local summarization or auto-title is enabled.
 * Called from init() for faster first summarization/title generation.
 */
async function preloadSummarizationIfEnabled() {
  const summarizationEnabled = state?.settings?.useLocalSummarization === true;
  const autoTitleEnabled = state?.settings?.useLocalAutoTitle === true;
  if (summarizationEnabled || autoTitleEnabled) {
    loadSummarizationModel().catch(() => {
    });
  }
}

// Expose functions globally
window.loadSummarizationModel = loadSummarizationModel;
window.getLocalSummary = getLocalSummary;
window.getLocalTitle = getLocalTitle;
window.preloadSummarizationIfEnabled = preloadSummarizationIfEnabled;
