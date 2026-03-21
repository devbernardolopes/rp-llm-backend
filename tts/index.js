/**
 * TTS Module Index
 * 
 * Central entry point for Text-to-Speech functionality.
 * Exports state and delegates to submodules:
 * - engine: Core playback (playTtsAudio, stopTtsPlayback)
 * - ui: UI controls (speaker buttons, toggles)
 * 
 * State is kept here to avoid circular dependencies with app.js.
 */

import * as engine from './engine.js';
import * as ui from './ui.js';

export const ttsState = {
  audio: null,
  speakingMessageIndex: null,
  loadingMessageIndex: null,
  requestSeq: 0,
  activeRequestId: 0,
  voiceSupportReady: false,
  kokoro: {
    modulePromise: null,
    instance: null,
    config: {
      device: "webgpu",
      dtype: "auto",
    },
    loading: false,
    fetchPatched: false,
    voiceListLoaded: false,
    selectedVoice: window.DEFAULT_KOKORO_VOICE || "af_heart",
    cacheDisabled: false,
  },
};

// Expose ttsState to window for compatibility with kokoro.js and app.js
window.ttsState = ttsState;

export function getTtsState() {
  return ttsState;
}

export {
  playTtsAudio,
  stopTtsPlayback,
  toggleMessageSpeech,
  isTtsCancelledError,
  makeTtsCancelledError,
  hasBrowserTtsSupport,
  updateAutoTtsToggleButton,
  refreshAllSpeakerButtons,
  updateMessageSpeakerButton,
  updateTtsSupportUi,
  initBrowserTtsSupport,
  isActiveTtsProviderReady,
  getActiveCharacterTtsProvider,
  buildKokoroOptions,
  getCurrentCharacterTtsOptions,
  getTtsOptionsFromCharacterModal,
} from './engine.js';

export {
  initTts,
  refreshAllSpeakerButtons as refreshSpeakerButtons,
  updateAutoTtsToggleButton as updateAutoTts,
  toggleThreadAutoTts,
} from './ui.js';

export function setupTtsModule() {
  engine.initTtsEngine();
  ui.initTtsUi();
}

// Initialize the TTS module
setupTtsModule();
