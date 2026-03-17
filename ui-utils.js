// ui-utils.js

function createSystemAvatarFallbackImage(letter = "S") {
  const char =
    String(letter || "S")
      .trim()
      .charAt(0)
      .toUpperCase() || "S";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" ry="20" fill="#7f1d1d"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="72" font-family="Segoe UI, system-ui, sans-serif" fill="#ffd7db">${char}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const DEFAULT_SYSTEM_AVATAR_IMAGE = createSystemAvatarFallbackImage("S");

function readFileAsDataURL(file) {
  if (!file) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() ?? "");
    reader.onerror = () =>
      reject(reader.error || new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

function renderOocSystemAvatarPreview(src) {
  const dropzone = document.getElementById("ooc-system-avatar-dropzone");
  const preview = document.getElementById("ooc-system-avatar-preview");
  const removeBtn = document.getElementById("ooc-system-avatar-remove");
  if (!dropzone || !preview || !removeBtn) return;
  const normalized = String(src || "").trim();
  const hasAvatar = Boolean(normalized);
  if (hasAvatar) {
    preview.src = normalized;
    preview.classList.remove("hidden");
    dropzone.classList.add("has-avatar");
    removeBtn.classList.remove("hidden");
  } else {
    preview.src = "";
    preview.classList.add("hidden");
    dropzone.classList.remove("has-avatar");
    removeBtn.classList.add("hidden");
  }
}

function setOocSystemAvatarData(src) {
  state.settings.oocSystemAvatar = String(src || "");
  renderOocSystemAvatarPreview(state.settings.oocSystemAvatar);
  saveSettings();
}

async function handleOocSystemAvatarFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  try {
    const dataUrl = String((await readFileAsDataURL(file)) || "");
    if (dataUrl) {
      setOocSystemAvatarData(dataUrl);
    }
  } catch (err) {
    console.warn("Failed to load OOC system avatar:", err);
  }
}

function resetUserInputElementHeight(input) {
  if (!input) return;
  input.style.height = "";
  input.style.overflowY = "";
  input.style.maxHeight = "";
}

function adjustUserInputElementHeight(input) {
  if (!input) return;
  const textValue = String(input.value || "");
  const hasMeaningfulContent = textValue.trim().length > 0;
  if (!hasMeaningfulContent) {
    resetUserInputElementHeight(input);
    return;
  }
  input.style.height = "auto";
  const maxHeight = USER_INPUT_AUTO_EXPAND_MAX_HEIGHT;
  const targetHeight = Math.min(input.scrollHeight, maxHeight);
  input.style.height = `${targetHeight}px`;
  input.style.maxHeight = `${maxHeight}px`;
  const needsScroll = input.scrollHeight > maxHeight;
  input.style.overflowY = needsScroll ? "auto" : "hidden";
}

let unreadSoundAudioCtx = null;

function playUnreadMessageSound() {
  if (state.settings.unreadSoundEnabled === false) return;
  try {
    if (!unreadSoundAudioCtx) {
      unreadSoundAudioCtx = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }
    if (unreadSoundAudioCtx.state === "suspended") {
      unreadSoundAudioCtx.resume();
    }
    const oscillator = unreadSoundAudioCtx.createOscillator();
    const gainNode = unreadSoundAudioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(unreadSoundAudioCtx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, unreadSoundAudioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      unreadSoundAudioCtx.currentTime + 0.3,
    );
    oscillator.start(unreadSoundAudioCtx.currentTime);
    oscillator.stop(unreadSoundAudioCtx.currentTime + 0.3);
  } catch {
    // ignore audio errors
  }
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

function processCardsInChunks(cards, processor, chunkSize = 3) {
  let index = 0;
  function processChunk(deadline) {
    while (
      index < cards.length &&
      (deadline.timeRemaining() > 0 || index === 0)
    ) {
      const end = Math.min(index + chunkSize, cards.length);
      for (; index < end; index++) {
        processor(cards[index]);
      }
      if (index >= cards.length) break;
    }
    if (index < cards.length) {
      requestIdleCallback(processChunk, { timeout: 50 });
    }
  }
  requestIdleCallback(processChunk, { timeout: 50 });
}

function normalizePersonaColor(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return DEFAULT_PERSONA_COLOR;
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }
  return `#${hex.toLowerCase()}`;
}

function hexToRgba(hex, alpha = 1) {
  const color = normalizePersonaColor(hex);
  const raw = color.slice(1);
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const clampedAlpha = Math.max(0, Math.min(1, Number(alpha) || 0));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

function normalizeChatOpacityValue(raw) {
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) {
    return Math.min(1, Math.max(0, parsed));
  }
  return DEFAULT_CHAT_OPACITY;
}

function getThreadChatOpacity(thread) {
  if (thread) {
    const threadValue = normalizeChatOpacityValue(thread.chatOpacity);
    const hasExplicit = Object.prototype.hasOwnProperty.call(
      thread,
      "chatOpacity",
    );
    if (hasExplicit) {
      return threadValue;
    }
  }
  return normalizeChatOpacityValue(state.settings.chatOpacity);
}

async function persistThreadChatOpacityValue(threadId, opacity) {
  if (!Number.isInteger(Number(threadId))) return;
  const normalized = normalizeChatOpacityValue(opacity);
  try {
    await db.threads.update(threadId, { chatOpacity: normalized });
  } catch (err) {
    console.warn("Failed to persist thread chat opacity:", err);
  }
}
