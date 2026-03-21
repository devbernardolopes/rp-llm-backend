/**
 * TTS Engine Module
 * 
 * Core TTS playback functionality:
 * - Audio playback routing (browser TTS vs Kokoro)
 * - Browser SpeechSynthesis integration
 * - Kokoro TTS integration (delegates to kokoro.js)
 */

import { ttsState, getTtsState } from './index.js';

const TTS_DEBUG = true;

function ttsDebug(...args) {
  if (!TTS_DEBUG) return;
  console.debug("[TTS]", ...args);
}

function makeTtsCancelledError(message = "TTS cancelled.") {
  const err = new Error(message);
  err.name = "TtsCancelledError";
  return err;
}

function isTtsCancelledError(error) {
  return error?.name === "TtsCancelledError";
}

function isTtsIndexMatch(ttsIndex, messageIndex) {
  return Number.isInteger(ttsIndex) && ttsIndex === Number(messageIndex);
}

function hasBrowserTtsSupport() {
  return (
    typeof window !== "undefined" &&
    typeof window.SpeechSynthesisUtterance === "function" &&
    typeof window.speechSynthesis !== "undefined"
  );
}

function isActiveTtsProviderReady(provider = null) {
  const state = getTtsState();
  const active = provider || getActiveCharacterTtsProvider();
  if (active === "kokoro") {
    return !!state.kokoro.instance && !state.kokoro.loading;
  }
  return hasBrowserTtsSupport() && state.voiceSupportReady === true;
}

function getActiveCharacterTtsProvider() {
  if (window.currentCharacter?.ttsProvider) return window.currentCharacter.ttsProvider;
  return "browser";
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

async function playTtsAudio(text, options = {}, playback = {}) {
  const state = getTtsState();
  const normalizedText = window.preprocessForTTS(text);
  if (!normalizedText) {
    ttsDebug("playTtsAudio:empty-text");
    throw new Error("Text is empty.");
  }
  const provider = String(
    (
      options.provider ||
      getActiveCharacterTtsProvider() ||
      "browser"
    ).toLowerCase(),
  );
  const resolvedRate = Math.max(
    0.5,
    Math.min(2, Number(options?.rate || DEFAULT_TTS_RATE)),
  );
  const resolvedPitch = Math.max(0, Math.min(2, Number(options?.pitch || 1.1)));
  const kokoroSettings = {
    device: String(options?.kokoro?.device || "webgpu"),
    dtype: String(options?.kokoro?.dtype || "auto"),
    voice: String(options?.kokoro?.voice || DEFAULT_KOKORO_VOICE),
    speed: Number.isFinite(Number(options?.kokoro?.speed))
      ? Number(options.kokoro.speed)
      : resolvedRate,
  };
  const normalizedOptions = {
    ...options,
    provider,
    rate: resolvedRate,
    pitch: resolvedPitch,
    kokoro: kokoroSettings,
  };
  if (provider === "kokoro") {
    return playKokoroTts(normalizedText, normalizedOptions, playback);
  }
  return playBrowserTts(normalizedText, normalizedOptions, playback);
}

async function playBrowserTts(normalizedText, options, playback = {}) {
  const state = getTtsState();
  if (!hasBrowserTtsSupport()) {
    throw new Error("Browser TTS is unavailable.");
  }
  const synth = window.speechSynthesis;
  const voices = synth.getVoices?.() || [];
  if (!voices.length) {
    throw new Error("No browser voices are available yet.");
  }
  const messageIndex = Number.isInteger(playback?.messageIndex)
    ? playback.messageIndex
    : null;
  const requestId = state.requestSeq + 1;
  state.requestSeq = requestId;
  state.activeRequestId = requestId;
  ttsDebug("playBrowserTts:start", {
    requestId,
    messageIndex,
    textLength: normalizedText.length,
    options,
  });
  stopTtsPlayback();
  state.activeRequestId = requestId;
  if (messageIndex !== null) {
    state.loadingMessageIndex = messageIndex;
    if (typeof window.refreshAllSpeakerButtons === 'function') {
      window.refreshAllSpeakerButtons();
    }
  }
  let utterance = null;
  let finalized = false;
  const finalizeLoadingState = () => {
    if (finalized) return;
    finalized = true;
    if (
      messageIndex !== null &&
      state.activeRequestId === requestId &&
      isTtsIndexMatch(state.loadingMessageIndex, messageIndex)
    ) {
      state.loadingMessageIndex = null;
      if (typeof window.refreshAllSpeakerButtons === 'function') {
        window.refreshAllSpeakerButtons();
      }
    }
  };

  try {
    if (requestId !== state.activeRequestId) {
      ttsDebug("playBrowserTts:stale-request", {
        requestId,
        active: state.activeRequestId,
      });
      throw makeTtsCancelledError();
    }

    const desiredVoice = String(options?.voice || DEFAULT_TTS_VOICE).trim();
    const desiredLang = String(
      options?.language || DEFAULT_TTS_LANGUAGE,
    ).trim();
    const desiredRate = Math.max(0.5, Math.min(2, Number(options?.rate) || 1));
    const desiredPitch = Math.max(0, Math.min(2, Number(options?.pitch) || 1));
    const voiceMatcher = () => {
      const byExactName = voices.find(
        (v) =>
          String(v.name || "").toLowerCase() === desiredVoice.toLowerCase(),
      );
      if (byExactName) return byExactName;
      const byLangExact = voices.find(
        (v) => String(v.lang || "").toLowerCase() === desiredLang.toLowerCase(),
      );
      if (byLangExact) return byLangExact;
      const baseLang = desiredLang.split("-")[0]?.toLowerCase() || "";
      const byLangPrefix = voices.find((v) =>
        String(v.lang || "")
          .toLowerCase()
          .startsWith(baseLang),
      );
      return byLangPrefix || voices[0] || null;
    };
    const chunks = window.chunkForTTS(normalizedText);

    const speakChunk = (chunk) =>
      new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.voice = voiceMatcher();
        utterance.lang = desiredLang || DEFAULT_TTS_LANGUAGE;
        utterance.rate = desiredRate;
        utterance.pitch = desiredPitch;
        utterance.onend = () => {
          if (requestId !== state.activeRequestId) {
            ttsDebug("playBrowserTts:cancelled-on-end", { chunk });
            reject(makeTtsCancelledError());
            return;
          }
          ttsDebug("playBrowserTts:chunk-ended", { chunk });
          if (state.audio === utterance) {
            state.audio = null;
          }
          resolve();
        };
        utterance.onerror = (event) => {
          ttsDebug("playBrowserTts:error", { event });
          if (state.audio === utterance) {
            state.audio = null;
          }
          const interrupted =
            requestId !== state.activeRequestId ||
            String(event?.error || "").toLowerCase() === "interrupted" ||
            String(event?.error || "").toLowerCase() === "canceled";
          if (interrupted) {
            reject(makeTtsCancelledError());
            return;
          }
          reject(new Error("Browser TTS playback failed."));
        };
        ttsDebug("playBrowserTts:speak", {
          voice: utterance.voice?.name || "",
          lang: utterance.lang,
        });
        state.audio = utterance;
        synth.speak(utterance);
      });

    if (chunks.length === 0) {
      return null;
    }

    state.loadingMessageIndex = null;
    finalized = true;
    if (messageIndex !== null) {
      state.speakingMessageIndex = messageIndex;
    }
    if (typeof window.refreshAllSpeakerButtons === 'function') {
      window.refreshAllSpeakerButtons();
    }

    for (const chunk of chunks) {
      if (requestId !== state.activeRequestId) {
        ttsDebug("playBrowserTts:stale-request", { requestId });
        throw makeTtsCancelledError();
      }
      await speakChunk(chunk);
    }
    if (
      messageIndex !== null &&
      isTtsIndexMatch(state.speakingMessageIndex, messageIndex)
    ) {
      state.speakingMessageIndex = null;
      if (typeof window.refreshAllSpeakerButtons === 'function') {
        window.refreshAllSpeakerButtons();
      }
    }
    return null;
  } finally {
    finalizeLoadingState();
  }
}

async function playKokoroTts(normalizedText, options, playback = {}) {
  const state = getTtsState();
  const messageIndex = Number.isInteger(playback?.messageIndex)
    ? playback.messageIndex
    : null;
  const requestId = state.requestSeq + 1;
  state.requestSeq = requestId;
  state.activeRequestId = requestId;
  ttsDebug("playKokoroTts:start", {
    requestId,
    messageIndex,
    textLength: normalizedText.length,
    kokoro: options.kokoro,
  });
  stopTtsPlayback();
  state.activeRequestId = requestId;
  if (messageIndex !== null) {
    state.loadingMessageIndex = messageIndex;
    if (typeof window.refreshAllSpeakerButtons === 'function') {
      window.refreshAllSpeakerButtons();
    }
  }
  let finalized = false;
  const finalizeLoadingState = () => {
    if (finalized) return;
    finalized = true;
    if (
      messageIndex !== null &&
      state.activeRequestId === requestId &&
      isTtsIndexMatch(state.loadingMessageIndex, messageIndex)
    ) {
      state.loadingMessageIndex = null;
      if (typeof window.refreshAllSpeakerButtons === 'function') {
        window.refreshAllSpeakerButtons();
      }
    }
  };

  try {
    const ensureKokoroInstance = window.ensureKokoroInstance;
    if (typeof ensureKokoroInstance !== 'function') {
      throw new Error("Kokoro TTS not available. Please ensure kokoro.js is loaded.");
    }
    const kokoro = await ensureKokoroInstance(
      options.kokoro.device,
      options.kokoro.dtype,
    );

    const chunks = window.chunkForTTS(normalizedText);
    if (chunks.length === 0) {
      return null;
    }

    const voice = options.kokoro.voice || DEFAULT_KOKORO_VOICE;
    const speed = Number.isFinite(Number(options.kokoro.speed))
      ? Number(options.kokoro.speed)
      : options.rate || 1;

    const createKokoroBufferSource = window.createKokoroBufferSource;
    if (typeof createKokoroBufferSource !== 'function') {
      throw new Error("createKokoroBufferSource not available from kokoro.js");
    }

    const generateBufferSource = async (chunk) => {
      await new Promise((r) => setTimeout(r, 0));
      if (requestId !== state.activeRequestId) {
        throw makeTtsCancelledError();
      }
      ttsDebug("playKokoroTts:generate", { chunk });
      const raw = await kokoro.generate(chunk, { voice, speed });
      const blob = await raw.toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      const bufferSource = await createKokoroBufferSource(arrayBuffer);
      if (bufferSource) return bufferSource;

      const url = URL.createObjectURL(blob);
      return { _fallbackUrl: url, _fallbackBlob: blob };
    };

    const playResolved = (resolved) => {
      if (requestId !== state.activeRequestId) {
        throw makeTtsCancelledError();
      }

      if (resolved?._fallbackUrl) {
        const { _fallbackUrl: url } = resolved;
        const audioEl = new Audio(url);
        state.audio = audioEl;
        return new Promise((resolve, reject) => {
          audioEl.onended = () => {
            if (requestId !== state.activeRequestId) {
              ttsDebug("playKokoroTts:cancelled-on-ended-fallback");
              URL.revokeObjectURL(url);
              reject(makeTtsCancelledError());
              return;
            }
            ttsDebug("playKokoroTts:chunk-ended-fallback");
            if (state.audio === audioEl) state.audio = null;
            URL.revokeObjectURL(url);
            resolve();
          };
          audioEl.onerror = () => {
            ttsDebug("playKokoroTts:error-fallback");
            if (state.audio === audioEl) state.audio = null;
            URL.revokeObjectURL(url);
            if (requestId !== state.activeRequestId) {
              reject(makeTtsCancelledError());
              return;
            }
            reject(new Error("Kokoro TTS playback failed."));
          };
          audioEl.play().catch((err) => {
            if (state.audio === audioEl) state.audio = null;
            URL.revokeObjectURL(url);
            if (requestId !== state.activeRequestId) {
              reject(makeTtsCancelledError());
              return;
            }
            reject(err);
          });
        });
      }

      const bufferSource = resolved;
      state.audio = bufferSource;
      return new Promise((resolve, reject) => {
        bufferSource.onended = () => {
          if (requestId !== state.activeRequestId) {
            ttsDebug("playKokoroTts:cancelled-on-ended");
            try {
              bufferSource.disconnect();
            } catch {
              /* ignore */
            }
            reject(makeTtsCancelledError());
            return;
          }
          ttsDebug("playKokoroTts:chunk-ended", { voice });
          if (state.audio === bufferSource) state.audio = null;
          try {
            bufferSource.disconnect();
          } catch {
            /* ignore */
          }
          resolve();
        };
        try {
          bufferSource.start();
        } catch (err) {
          try {
            bufferSource.disconnect();
          } catch {
            /* ignore */
          }
          reject(err);
        }
      });
    };

    if (requestId !== state.activeRequestId) {
      ttsDebug("playKokoroTts:stale-request", {
        requestId,
        active: state.activeRequestId,
      });
      throw makeTtsCancelledError();
    }

    state.loadingMessageIndex = null;
    finalized = true;
    if (messageIndex !== null) {
      state.speakingMessageIndex = messageIndex;
    }
    if (typeof window.refreshAllSpeakerButtons === 'function') {
      window.refreshAllSpeakerButtons();
    }

    let nextGenPromise = generateBufferSource(chunks[0]);

    for (let i = 0; i < chunks.length; i++) {
      let followingGenPromise = null;
      if (i + 1 < chunks.length) {
        followingGenPromise = nextGenPromise.then(
          () => generateBufferSource(chunks[i + 1]),
          () => null,
        );
      }

      const resolved = await nextGenPromise;
      nextGenPromise = followingGenPromise;

      if (resolved === null) {
        break;
      }

      await playResolved(resolved);

      if (requestId !== state.activeRequestId) {
        ttsDebug("playKokoroTts:stale-after-chunk", {
          requestId,
          active: state.activeRequestId,
        });
        break;
      }
    }

    if (
      messageIndex !== null &&
      isTtsIndexMatch(state.speakingMessageIndex, messageIndex)
    ) {
      state.speakingMessageIndex = null;
      if (typeof window.refreshAllSpeakerButtons === 'function') {
        window.refreshAllSpeakerButtons();
      }
    }
    return null;
  } catch (err) {
    throw err;
  } finally {
    finalizeLoadingState();
  }
}

function stopTtsPlayback(options = {}) {
  const state = getTtsState();
  state.activeRequestId = state.activeRequestId + 1;
  const audioElement =
    state.audio instanceof HTMLAudioElement ? state.audio : null;
  if (audioElement) {
    try {
      audioElement.pause();
      audioElement.currentTime = 0;
      const srcUrl = audioElement.currentSrc || audioElement.src;
      if (typeof srcUrl === "string" && srcUrl.startsWith("blob:")) {
        URL.revokeObjectURL(srcUrl);
      }
    } catch {
      // ignore
    }
  }
  const bufferSource =
    typeof AudioBufferSourceNode !== "undefined" &&
    state.audio instanceof AudioBufferSourceNode
      ? state.audio
      : null;
  if (bufferSource) {
    try {
      bufferSource.stop();
    } catch {
      // ignore
    }
    try {
      bufferSource.disconnect();
    } catch {
      // ignore
    }
  } else if (hasBrowserTtsSupport()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  state.audio = null;
  state.speakingMessageIndex = null;
  state.loadingMessageIndex = null;
  if (typeof window.onTtsStopped === 'function' && !options?.silent) {
    window.onTtsStopped();
  }
}

async function toggleMessageSpeech(index) {
  const state = getTtsState();
  ttsDebug("toggleMessageSpeech:enter", {
    index,
  });
  const conversationHistory = window.conversationHistory;
  if (!window.currentThread || !window.currentCharacter) {
    ttsDebug("toggleMessageSpeech:blocked-no-thread-or-character", {
      hasThread: !!window.currentThread,
      hasCharacter: !!window.currentCharacter,
    });
    if (typeof window.showToast === 'function') {
      window.showToast(window.t ? window.t("openThreadFirst") : "Please open a thread first.", "error");
    }
    return;
  }
  const message = conversationHistory[index];
  if (!message || message.role !== "assistant") {
    ttsDebug("toggleMessageSpeech:blocked-not-assistant", {
      index,
      role: message?.role,
      hasMessage: !!message,
    });
    if (typeof window.showToast === 'function') {
      window.showToast(window.t ? window.t("ttsAssistantOnly") : "TTS only works on bot messages.", "error");
    }
    return;
  }
  if (!String(message.content || "").trim()) {
    ttsDebug("toggleMessageSpeech:blocked-empty-message", { index });
    if (typeof window.showToast === 'function') {
      window.showToast(window.t ? window.t("messageEmpty") : "Message is empty.", "error");
    }
    return;
  }

  const audioElement =
    state.audio instanceof HTMLAudioElement ? state.audio : null;
  const hasAudioObject = !!state.audio;
  const audioIsPlaying = audioElement
    ? !audioElement.paused && !audioElement.ended
    : hasBrowserTtsSupport()
      ? !!(window.speechSynthesis.speaking || window.speechSynthesis.pending)
      : false;
  if (!hasAudioObject && state.speakingMessageIndex !== null) {
    ttsDebug("toggleMessageSpeech:clear-stale-speaking", {
      staleSpeakingIndex: state.speakingMessageIndex,
    });
    state.speakingMessageIndex = null;
  }
  const isActive =
    isTtsIndexMatch(state.speakingMessageIndex, index) ||
    isTtsIndexMatch(state.loadingMessageIndex, index);
  const isActuallyActive =
    isTtsIndexMatch(state.loadingMessageIndex, index) ||
    (isTtsIndexMatch(state.speakingMessageIndex, index) &&
      hasAudioObject &&
      audioIsPlaying);
  ttsDebug("toggleMessageSpeech:active-check", {
    index,
    isActive,
    isActuallyActive,
    loadingIndex: state.loadingMessageIndex,
    speakingIndex: state.speakingMessageIndex,
    hasAudioObject,
    audioIsPlaying,
  });
  const isCurrentlySpeaking = state.speakingMessageIndex !== null;
  const isCurrentlyLoading = state.loadingMessageIndex !== null;
  if (isCurrentlySpeaking || isCurrentlyLoading) {
    ttsDebug("toggleMessageSpeech:stop-active", {
      index,
      isCurrentlySpeaking,
      isCurrentlyLoading,
    });
    stopTtsPlayback();
    return;
  }

  stopTtsPlayback();

  try {
    ttsDebug("toggleMessageSpeech:play", {
      index,
      contentLength: String(message.content || "").length,
    });
    await playTtsAudio(message.content, getCurrentCharacterTtsOptions(), {
      messageIndex: index,
    });
    ttsDebug("toggleMessageSpeech:success", { index });
  } catch (err) {
    if (isTtsCancelledError(err)) {
      ttsDebug("toggleMessageSpeech:cancelled", { index });
      return;
    }
    ttsDebug("toggleMessageSpeech:error", {
      index,
      error: String(err?.message || err || ""),
    });
    if (isTtsIndexMatch(state.loadingMessageIndex, index)) {
      state.loadingMessageIndex = null;
    }
    if (isTtsIndexMatch(state.speakingMessageIndex, index)) {
      state.speakingMessageIndex = null;
      state.audio = null;
    }
    if (typeof window.refreshAllSpeakerButtons === 'function') {
      window.refreshAllSpeakerButtons();
    }
    if (typeof window.showToast === 'function') {
      window.showToast(
        `TTS failed: ${err.message || "Unknown error"}`,
        "error",
      );
    }
  }
}

function getCurrentCharacterTtsOptions() {
  const state = getTtsState();
  const resolved = getResolvedTtsSelection(
    window.currentCharacter?.ttsLanguage,
    window.currentCharacter?.ttsVoice,
    window.currentCharacter?.ttsRate,
    window.currentCharacter?.ttsPitch,
  );
  const provider = String(
    window.currentCharacter?.ttsProvider || "kokoro",
  ).toLowerCase();
  const options = {
    voice: resolved.voice || DEFAULT_TTS_VOICE,
    language: resolved.language || DEFAULT_TTS_LANGUAGE,
    rate: resolved.rate,
    pitch: resolved.pitch,
    provider,
    kokoro: buildKokoroOptions(window.currentCharacter, resolved.rate),
  };
  return options;
}

function getTtsOptionsFromCharacterModal() {
  const state = getTtsState();
  const resolved = getResolvedCharTtsSelection();
  const provider = getCharModalTtsProviderSelection();
  const kokoroSource = {
    kokoroDevice: document.getElementById("char-tts-kokoro-device")?.value,
    kokoroDtype: document.getElementById("char-tts-kokoro-dtype")?.value,
    kokoroVoice: document.getElementById("char-tts-kokoro-voice")?.value,
    kokoroSpeed: resolved.rate,
  };
  const options = {
    voice: resolved.voice || DEFAULT_TTS_VOICE,
    language: resolved.language || DEFAULT_TTS_LANGUAGE,
    rate: resolved.rate,
    pitch: resolved.pitch,
    provider,
    kokoro: buildKokoroOptions(kokoroSource, resolved.rate),
  };
  return options;
}

function getResolvedTtsSelection(
  languageInput,
  voiceInput,
  rateInput,
  pitchInput,
) {
  const language =
    String(languageInput || DEFAULT_TTS_LANGUAGE).trim() ||
    DEFAULT_TTS_LANGUAGE;
  const voice =
    String(voiceInput || DEFAULT_TTS_VOICE).trim() || DEFAULT_TTS_VOICE;
  const rate = Math.max(
    0.5,
    Math.min(2, Number(rateInput) || DEFAULT_TTS_RATE),
  );
  const pitch = Math.max(0, Math.min(2, Number(pitchInput) || 1.1));
  return {
    language,
    voice,
    rate,
    pitch,
  };
}

function getResolvedCharTtsSelection() {
  return getResolvedTtsSelection(
    document.getElementById("char-tts-language")?.value,
    document.getElementById("char-tts-voice")?.value,
    document.getElementById("char-tts-rate")?.value,
    document.getElementById("char-tts-pitch")?.value,
  );
}

function getCharModalTtsProviderSelection() {
  const select = document.getElementById("char-tts-provider");
  return select?.value === "kokoro" ? "kokoro" : "browser";
}

function updateTtsSupportUi() {
  const state = getTtsState();
  const provider = getActiveCharacterTtsProvider();
  const supported = isActiveTtsProviderReady(provider);
  if (provider === "kokoro" && !supported && !state.kokoro.loading) {
    if (typeof window.preloadKokoroForActiveCharacter === 'function') {
      window.preloadKokoroForActiveCharacter();
    }
  }
  const statusEl = document.getElementById("tts-test-status");
  const playBtn = document.getElementById("tts-test-play-btn");
  if (
    statusEl &&
    (!statusEl.textContent ||
      statusEl.textContent.startsWith("TTS: unsupported"))
  ) {
    const fallbackText =
      provider === "kokoro"
        ? "TTS: Kokoro unavailable"
        : "TTS: unsupported in this browser";
    statusEl.textContent = supported ? "TTS: idle" : fallbackText;
  }
  if (playBtn) {
    playBtn.disabled = !supported;
  }
  if (typeof window.refreshAllSpeakerButtons === 'function') {
    window.refreshAllSpeakerButtons();
  }
}

function initBrowserTtsSupport() {
  const state = getTtsState();
  if (!hasBrowserTtsSupport()) {
    state.voiceSupportReady = false;
    updateTtsSupportUi();
    return;
  }
  const synth = window.speechSynthesis;
  const refresh = () => {
    const voices = synth.getVoices?.() || [];
    state.voiceSupportReady = voices.length > 0;
    updateTtsSupportUi();
  };
  refresh();
  if (typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", refresh);
  }
  window.setTimeout(refresh, 250);
  window.setTimeout(refresh, 1000);
}

function updateMessageSpeakerButton(button, index) {
  const state = getTtsState();
  const conversationHistory = window.conversationHistory;
  const t = window.t;
  if (!button) return;
  const msg = conversationHistory[index];
  const isAssistant = msg?.role === "assistant";
  const row = button.closest(".chat-row");
  const streaming = row?.dataset?.streaming === "1";
  const hasContent = !!String(msg?.content || "").trim();
  const isLoading = isTtsIndexMatch(state.loadingMessageIndex, index);
  const isSpeaking = isTtsIndexMatch(state.speakingMessageIndex, index);
  const ttsReady = isActiveTtsProviderReady();
  button.disabled = !isAssistant || streaming || !hasContent || !ttsReady;
  button.classList.toggle("tts-loading", isLoading);
  button.classList.toggle("tts-speaking", isSpeaking);
  const ICONS = window.ICONS;
  if (!ttsReady) {
    button.innerHTML = ICONS?.speaker || "";
    button.setAttribute("title", t ? t("msgVoiceUnavailableTitle") : "Voice unavailable");
    button.setAttribute("aria-label", t ? t("msgVoiceUnavailableAria") : "Voice unavailable");
    return;
  }
  if (isLoading) {
    button.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>';
    button.setAttribute("title", t ? t("msgSpeakLoadingTitle") : "Loading...");
    button.setAttribute("aria-label", t ? t("msgSpeakLoadingTitle") : "Loading...");
  } else if (isSpeaking) {
    button.innerHTML = ICONS?.stop || "";
    button.setAttribute("title", t ? t("msgSpeakCancelTitle") : "Stop");
    button.setAttribute("aria-label", t ? t("msgSpeakCancelAria") : "Stop speaking");
  } else {
    button.innerHTML = ICONS?.speaker || "";
    button.setAttribute("title", t ? t("msgSpeakTitle") : "Speak");
    button.setAttribute("aria-label", t ? t("msgSpeakAria") : "Speak");
  }
}

function initTtsEngine() {
  initBrowserTtsSupport();
  
  window.playTtsAudio = playTtsAudio;
  window.stopTtsPlayback = stopTtsPlayback;
  window.toggleMessageSpeech = toggleMessageSpeech;
  window.isTtsCancelledError = isTtsCancelledError;
  window.makeTtsCancelledError = makeTtsCancelledError;
  window.hasBrowserTtsSupport = hasBrowserTtsSupport;
  window.isActiveTtsProviderReady = isActiveTtsProviderReady;
  window.getActiveCharacterTtsProvider = getActiveCharacterTtsProvider;
  window.updateTtsSupportUi = updateTtsSupportUi;
  window.initBrowserTtsSupport = initBrowserTtsSupport;
  window.getCurrentCharacterTtsOptions = getCurrentCharacterTtsOptions;
  window.getTtsOptionsFromCharacterModal = getTtsOptionsFromCharacterModal;
  window.refreshAllSpeakerButtons = refreshAllSpeakerButtonsFromEngine;
  window.updateMessageSpeakerButton = updateMessageSpeakerButton;
}

function refreshAllSpeakerButtonsFromEngine() {
  document.querySelectorAll(".msg-tts-btn").forEach((btn) => {
    const index = Number(btn.dataset.messageIndex);
    updateMessageSpeakerButton(btn, index);
  });
}

export {
  playTtsAudio,
  stopTtsPlayback,
  toggleMessageSpeech,
  isTtsCancelledError,
  makeTtsCancelledError,
  hasBrowserTtsSupport,
  refreshAllSpeakerButtonsFromEngine,
  updateTtsSupportUi,
  initBrowserTtsSupport,
  isActiveTtsProviderReady,
  getActiveCharacterTtsProvider,
  buildKokoroOptions,
  getCurrentCharacterTtsOptions,
  getTtsOptionsFromCharacterModal,
  updateMessageSpeakerButton,
  initTtsEngine,
};
