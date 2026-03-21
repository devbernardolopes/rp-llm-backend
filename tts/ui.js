/**
 * TTS UI Module
 * 
 * UI controls for TTS:
 * - Auto-TTS toggle button
 * - Thread auto-TTS management
 */

import { getTtsState } from './index.js';
import { stopTtsPlayback } from './engine.js';

function updateAutoTtsToggleButton() {
  const t = window.t;
  const ICONS = window.ICONS;
  const btn = document.getElementById("auto-tts-toggle-btn");
  if (!btn) return;
  btn.innerHTML = ICONS?.speaker || "";
  const enabled = !!(window.currentThread && window.currentThread.autoTtsEnabled === true);
  btn.classList.toggle("is-active", enabled);
  btn.disabled = !window.currentThread;
  btn.setAttribute(
    "title",
    enabled ? (t ? t("autoTtsTitleOn") : "Auto-TTS on") : (t ? t("autoTtsTitleOff") : "Auto-TTS off"),
  );
  btn.setAttribute(
    "aria-label",
    enabled ? (t ? t("disableAutoTtsAria") : "Disable auto-TTS") : (t ? t("enableAutoTtsAria") : "Enable auto-TTS"),
  );
}

async function toggleThreadAutoTts() {
  const db = window.db;
  const t = window.t;
  const showToast = window.showToast;
  const broadcastSyncEvent = window.broadcastSyncEvent;
  const renderThreads = window.renderThreads;
  
  if (!window.currentThread) return;
  const next = !(window.currentThread.autoTtsEnabled === true);
  window.currentThread.autoTtsEnabled = next;
  if (db) {
    await db.threads.update(window.currentThread.id, {
      autoTtsEnabled: next,
    });
  }
  updateAutoTtsToggleButton();
  if (broadcastSyncEvent) {
    broadcastSyncEvent({
      type: "thread-updated",
      threadId: window.currentThread.id,
    });
  }
  if (showToast) {
    showToast(next ? (t ? t("autoTtsEnabled") : "Auto-TTS enabled") : (t ? t("autoTtsDisabled") : "Auto-TTS disabled"), "success");
  }
  if (renderThreads) {
    renderThreads().catch(() => {});
  }
}

function refreshSpeakerButtons() {
  document.querySelectorAll(".msg-tts-btn").forEach((btn) => {
    const index = Number(btn.dataset.messageIndex);
    if (typeof window.updateMessageSpeakerButton === 'function') {
      window.updateMessageSpeakerButton(btn, index);
    }
  });
}

function initTtsUi() {
  window.updateAutoTtsToggleButton = updateAutoTtsToggleButton;
  window.toggleThreadAutoTts = toggleThreadAutoTts;
  window.refreshSpeakerButtons = refreshSpeakerButtons;
  
  const btn = document.getElementById("auto-tts-toggle-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      if (typeof window.toggleThreadAutoTts === 'function') {
        window.toggleThreadAutoTts();
      }
    });
  }
}

export {
  updateAutoTtsToggleButton,
  toggleThreadAutoTts,
  refreshSpeakerButtons,
  initTtsUi,
};
