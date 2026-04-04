let state_sfx_editing = {
  editingDef: null,
  index: -1,
  asset: null,
  trigger: "start",
  eviction: "never",
  loop: false,
};

async function openSfxEditor(asset, sfxEntry = null, index = -1) {
  const modal = document.getElementById("sfx-editor-modal");
  if (!modal) return;

  state_sfx_editing.asset = asset;
  state_sfx_editing.index = index;
  state_sfx_editing.editingDef = getActiveCharacterDefinition();

  if (sfxEntry) {
    state_sfx_editing.trigger = sfxEntry.trigger || "start";
    state_sfx_editing.eviction = sfxEntry.eviction || "never";
    state_sfx_editing.loop = !!sfxEntry.loop;
    state_sfx_editing.name = sfxEntry.name || "";
    state_sfx_editing.type = sfxEntry.type || getDefaultSfxType(asset?.type);
    state_sfx_editing.triggerKeywords = sfxEntry.triggerKeywords || [];
    state_sfx_editing.triggerKeywordsSecondary =
      sfxEntry.triggerKeywordsSecondary || [];
    state_sfx_editing.triggerActionPattern =
      sfxEntry.triggerActionPattern || "";
    state_sfx_editing.triggerMatchCase = !!sfxEntry.triggerMatchCase;
    state_sfx_editing.triggerMatchWholeWord = !!sfxEntry.triggerMatchWholeWord;
    state_sfx_editing.triggerTurnInterval = sfxEntry.triggerTurnInterval || 5;
    state_sfx_editing.triggerCooldownMs = sfxEntry.triggerCooldownMs || 0;
    state_sfx_editing.evictionKeywords = sfxEntry.evictionKeywords || [];
    state_sfx_editing.evictionMessageCount =
      sfxEntry.evictionMessageCount || 10;
    state_sfx_editing.volume = sfxEntry.volume || 1;
    state_sfx_editing.fadeInMs = sfxEntry.fadeInMs || 0;
    state_sfx_editing.fadeOutMs = sfxEntry.fadeOutMs || 0;
    state_sfx_editing.opacity = sfxEntry.opacity || 1;
    state_sfx_editing.layer = sfxEntry.layer || 100;
  } else {
    state_sfx_editing.trigger = "start";
    state_sfx_editing.eviction = "never";
    state_sfx_editing.loop = false;
    state_sfx_editing.name = "";
    state_sfx_editing.type = getDefaultSfxType(asset?.type);
    state_sfx_editing.triggerKeywords = [];
    state_sfx_editing.triggerKeywordsSecondary = [];
    state_sfx_editing.triggerActionPattern = "";
    state_sfx_editing.triggerMatchCase = false;
    state_sfx_editing.triggerMatchWholeWord = false;
    state_sfx_editing.triggerTurnInterval = 5;
    state_sfx_editing.triggerCooldownMs = 0;
    state_sfx_editing.evictionKeywords = [];
    state_sfx_editing.evictionMessageCount = 10;
    state_sfx_editing.volume = 1;
    state_sfx_editing.fadeInMs = 0;
    state_sfx_editing.fadeOutMs = 0;
    state_sfx_editing.opacity = 1;
    state_sfx_editing.layer = 100;
  }

  function getDefaultSfxType(assetType) {
    if (assetType === "sound") return "sound";
    if (assetType === "video") return "overlay";
    if (assetType === "image") return "background";
    return "sound";
  }

  const previewContainer = document.getElementById(
    "sfx-asset-preview-container",
  );
  previewContainer.innerHTML = "";

  if (asset.type === "image" && asset.data) {
    const url = getAssetDataUrl(asset);
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = asset.name || "Asset";
      previewContainer.appendChild(img);
    }
  } else if (asset.type === "video" && asset.data) {
    const url = getAssetDataUrl(asset);
    if (url) {
      const video = document.createElement("video");
      video.src = url;
      video.controls = true;
      video.muted = true;
      previewContainer.appendChild(video);
    }
  } else if (asset.type === "sound" && asset.data) {
    const url = getAssetDataUrl(asset);
    if (url) {
      const audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      previewContainer.appendChild(audio);
    }
  } else {
    const icon = document.createElement("span");
    icon.className = "asset-type-icon";
    icon.textContent = getAssetTypeIcon(asset.type);
    previewContainer.appendChild(icon);
  }

  document.getElementById("sfx-name").value = state_sfx_editing.name || "";
  document.getElementById("sfx-type").value = state_sfx_editing.type || "sound";
  document.getElementById("sfx-trigger").value = state_sfx_editing.trigger;
  document.getElementById("sfx-eviction").value = state_sfx_editing.eviction;
  document.getElementById("sfx-loop").checked = state_sfx_editing.loop;
  document.getElementById("sfx-match-case").checked =
    state_sfx_editing.triggerMatchCase;
  document.getElementById("sfx-match-whole-word").checked =
    state_sfx_editing.triggerMatchWholeWord;
  document.getElementById("sfx-trigger-keywords").value = (
    state_sfx_editing.triggerKeywords || []
  ).join(", ");
  document.getElementById("sfx-trigger-keywords-secondary").value = (
    state_sfx_editing.triggerKeywordsSecondary || []
  ).join(", ");
  document.getElementById("sfx-trigger-action-pattern").value =
    state_sfx_editing.triggerActionPattern || "";
  document.getElementById("sfx-trigger-turn-interval").value =
    state_sfx_editing.triggerTurnInterval || 5;
  document.getElementById("sfx-trigger-cooldown").value =
    (state_sfx_editing.triggerCooldownMs || 0) / 1000;
  document.getElementById("sfx-eviction-keywords").value = (
    state_sfx_editing.evictionKeywords || []
  ).join(", ");
  document.getElementById("sfx-eviction-message-count").value =
    state_sfx_editing.evictionMessageCount || 10;
  document.getElementById("sfx-volume").value = state_sfx_editing.volume || 1;
  document.getElementById("sfx-fade-in").value =
    state_sfx_editing.fadeInMs || 0;
  document.getElementById("sfx-fade-out").value =
    state_sfx_editing.fadeOutMs || 0;
  document.getElementById("sfx-opacity").value = state_sfx_editing.opacity || 1;
  document.getElementById("sfx-layer").value = state_sfx_editing.layer || 100;

  const volumeValue = document.getElementById("sfx-volume-value");
  if (volumeValue)
    volumeValue.textContent =
      Math.round((state_sfx_editing.volume || 1) * 100) + "%";
  const opacityValue = document.getElementById("sfx-opacity-value");
  if (opacityValue)
    opacityValue.textContent =
      Math.round((state_sfx_editing.opacity || 1) * 100) + "%";

  updateSfxEditorFields();

  const isNewEntry = index === -1 && asset;
  setModalDirtyState("sfx-editor-modal", isNewEntry);
  state.activeModalId = "sfx-editor-modal";

  modal.dataset.editingIndex = index;

  modal.classList.remove("hidden");
}

function updateSfxEditorFields() {
  const trigger = document.getElementById("sfx-trigger")?.value || "start";
  const eviction = document.getElementById("sfx-eviction")?.value || "never";
  const sfxType = document.getElementById("sfx-type")?.value || "sound";

  const keywordsField = document.getElementById("sfx-keywords-field");
  const keywordsSecondaryField = document.getElementById(
    "sfx-keywords-secondary-field",
  );
  const actionPatternField = document.getElementById(
    "sfx-action-pattern-field",
  );
  const turnIntervalField = document.getElementById("sfx-turn-interval-field");
  const cooldownField = document.getElementById("sfx-cooldown-field");

  if (keywordsField)
    keywordsField.classList.toggle("hidden", trigger !== "keyword");
  if (keywordsSecondaryField)
    keywordsSecondaryField.classList.toggle("hidden", trigger !== "keyword");
  if (actionPatternField)
    actionPatternField.classList.toggle("hidden", trigger !== "action_pattern");
  if (turnIntervalField)
    turnIntervalField.classList.toggle("hidden", trigger !== "turn_interval");
  if (cooldownField)
    cooldownField.classList.toggle("hidden", trigger === "start");

  const evictionKeywordsField = document.getElementById(
    "sfx-eviction-keywords-field",
  );
  const evictionMessageCountField = document.getElementById(
    "sfx-eviction-message-count-field",
  );

  if (evictionKeywordsField)
    evictionKeywordsField.classList.toggle("hidden", eviction !== "keyword");
  if (evictionMessageCountField)
    evictionMessageCountField.classList.toggle(
      "hidden",
      eviction !== "message_count",
    );

  const playbackOptions = document.getElementById("sfx-playback-options");
  const volumeField = document.getElementById("sfx-volume-field");
  const fadeInField = document.getElementById("sfx-fade-in-field");
  const fadeOutField = document.getElementById("sfx-fade-out-field");
  const opacityField = document.getElementById("sfx-opacity-field");
  const layerField = document.getElementById("sfx-layer-field");

  const isAudio = sfxType === "sound";
  const isVisual = sfxType === "background" || sfxType === "overlay";

  if (playbackOptions) playbackOptions.classList.remove("hidden");
  if (volumeField) volumeField.classList.toggle("hidden", !isAudio);
  if (fadeInField)
    fadeInField.classList.toggle("hidden", !isAudio && !isVisual);
  if (fadeOutField)
    fadeOutField.classList.toggle("hidden", !isAudio && !isVisual);
  if (opacityField) opacityField.classList.toggle("hidden", !isVisual);
  if (layerField) layerField.classList.toggle("hidden", sfxType !== "overlay");
}

function renderSfxList() {
  const list = document.getElementById("char-sfx-list");
  if (!list) return;
  list.innerHTML = "";
  const def = getActiveCharacterDefinition();
  const sfxArray = def?.sfx || [];

  if (sfxArray.length === 0) {
    list.innerHTML = `<p class="muted">No SFX added.</p>`;
    return;
  }

  Promise.all(
    sfxArray.map(async (entry, idx) => {
      const asset = await getAssetById(entry.assetId);
      return { entry, idx, asset };
    }),
  )
    .then((items) => {
      items.sort((a, b) => a.idx - b.idx);
      for (const { entry, idx, asset } of items) {
        const row = document.createElement("div");
        row.className = "lorebook-row asset-row";

        const avatar = document.createElement("div");
        avatar.className = "lorebook-avatar";

        if (asset) {
          if (asset.type === "image" && asset.data) {
            const url = getAssetDataUrl(asset);
            if (url) {
              const img = document.createElement("img");
              img.src = url;
              img.alt = asset.name || "Asset";
              avatar.appendChild(img);
            }
          } else if (asset.type === "video" && asset.data) {
            const thumb = document.createElement("img");
            thumb.src = asset.thumbnail || "";
            thumb.alt = asset.name || "Asset";
            if (!asset.thumbnail) {
              avatar.innerHTML = `<span class="asset-type-icon">${getAssetTypeIcon(asset.type)}</span>`;
            } else {
              avatar.appendChild(thumb);
            }
          } else if (asset.type === "sound" && asset.data) {
            avatar.innerHTML = `<span class="asset-type-icon">${getAssetTypeIcon(asset.type)}</span>`;
          } else {
            avatar.innerHTML = `<span class="asset-type-icon">${getAssetTypeIcon(asset.type)}</span>`;
          }
        } else {
          avatar.innerHTML = `<span class="asset-type-icon missing">?</span>`;
        }

        const main = document.createElement("div");
        main.className = "lorebook-main";

        const title = document.createElement("div");
        title.className = "lorebook-title";
        title.textContent = asset
          ? asset.name || asset.originalName || "Untitled"
          : `Missing asset (ID: ${entry.assetId})`;

        const meta = document.createElement("div");
        meta.className = "lorebook-meta";
        const typeSpan = document.createElement("span");
        typeSpan.textContent = asset
          ? getAssetTypeLabel(asset.type)
          : "Unknown";
        typeSpan.style.fontSize = "11px";
        meta.appendChild(typeSpan);
        const triggerSpan = document.createElement("span");
        triggerSpan.textContent =
          t(
            `trigger${entry.trigger.charAt(0).toUpperCase() + entry.trigger.slice(1)}`,
          ) || entry.trigger;
        triggerSpan.style.fontSize = "11px";
        triggerSpan.style.marginLeft = "8px";
        meta.appendChild(triggerSpan);
        const evictionSpan = document.createElement("span");
        evictionSpan.textContent =
          t(
            `eviction${entry.eviction.charAt(0).toUpperCase() + entry.eviction.slice(1)}`,
          ) || entry.eviction;
        evictionSpan.style.fontSize = "11px";
        evictionSpan.style.marginLeft = "8px";
        meta.appendChild(evictionSpan);
        if (entry.loop) {
          const loopSpan = document.createElement("span");
          loopSpan.textContent = "Loop";
          loopSpan.style.fontSize = "11px";
          loopSpan.style.marginLeft = "8px";
          meta.appendChild(loopSpan);
        }

        main.appendChild(title);
        main.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "lorebook-actions";

        const deleteBtn = iconButton(
          "delete",
          t("deleteAssetAria") || "Delete",
          async () => {
            const ok = await openConfirmDialog(
              t("deleteAssetTitle"),
              tf("deleteAssetConfirm", {
                name: asset ? asset.name || asset.originalName : entry.assetId,
              }),
            );
            if (!ok) return;
            const def = getActiveCharacterDefinition();
            def.sfx.splice(idx, 1);
            setModalDirtyState("character-modal", true);
            renderSfxList();
            const currentCharId = Number(currentThread?.characterId);
            const editingCharId = Number(state.editingCharacterId);
            if (
              Number.isInteger(currentCharId) &&
              Number.isInteger(editingCharId) &&
              currentCharId === editingCharId
            ) {
              await applyChatViewBackgroundFromSfx(currentThread);
            }
          },
        );
        deleteBtn.classList.add("danger-icon-btn");
        actions.appendChild(deleteBtn);

        row.append(avatar, main, actions);
        row.addEventListener("click", (e) => {
          if (
            e.target.closest(".lorebook-actions") ||
            e.target.closest("button") ||
            e.target.closest(".icon-btn")
          ) {
            return;
          }
          openSfxEditor(asset, entry, idx);
        });
        list.appendChild(row);
      }
    })
    .catch(console.error);
}

async function saveSfxEntry({ close = true } = {}) {
  const trigger = document.getElementById("sfx-trigger").value;
  const eviction = document.getElementById("sfx-eviction").value;
  const loop = document.getElementById("sfx-loop").checked;
  const asset = state_sfx_editing.asset;
  const def = state_sfx_editing.editingDef;
  const index = state_sfx_editing.index;

  if (!def || !asset) return false;

  function parseCsvValues(value) {
    if (!value) return [];
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  const sfxEntry = {
    assetId: Number(asset.id),
    name: document.getElementById("sfx-name").value || asset.name || "",
    type: document.getElementById("sfx-type").value,
    trigger,
    eviction,
    loop,
    triggerKeywords: parseCsvValues(
      document.getElementById("sfx-trigger-keywords").value,
    ),
    triggerKeywordsSecondary: parseCsvValues(
      document.getElementById("sfx-trigger-keywords-secondary").value,
    ),
    triggerActionPattern: document.getElementById("sfx-trigger-action-pattern")
      .value,
    triggerMatchCase: document.getElementById("sfx-match-case").checked,
    triggerMatchWholeWord: document.getElementById("sfx-match-whole-word")
      .checked,
    triggerTurnInterval: parseInt(
      document.getElementById("sfx-trigger-turn-interval").value,
      10,
    ),
    triggerCooldownMs:
      parseFloat(document.getElementById("sfx-trigger-cooldown").value) * 1000,
    evictionKeywords: parseCsvValues(
      document.getElementById("sfx-eviction-keywords").value,
    ),
    evictionMessageCount: parseInt(
      document.getElementById("sfx-eviction-message-count").value,
      10,
    ),
    volume: parseFloat(document.getElementById("sfx-volume").value),
    fadeInMs: parseInt(document.getElementById("sfx-fade-in").value, 10),
    fadeOutMs: parseInt(document.getElementById("sfx-fade-out").value, 10),
    opacity: parseFloat(document.getElementById("sfx-opacity").value),
    layer: parseInt(document.getElementById("sfx-layer").value, 10),
  };

  if (!def.sfx) {
    def.sfx = [];
  }

  if (index >= 0 && index < def.sfx.length) {
    def.sfx[index] = sfxEntry;
  } else {
    def.sfx.push(sfxEntry);
  }

  setModalDirtyState("character-modal", true);
  renderSfxList();

  const currentCharId = Number(currentThread?.characterId);
  const editingCharId = Number(state.editingCharacterId);
  if (
    Number.isInteger(currentCharId) &&
    Number.isInteger(editingCharId) &&
    currentCharId === editingCharId
  ) {
    await applyChatViewBackgroundFromSfx(currentThread);
  }

  if (close) {
    closeModal("sfx-editor-modal");
  } else {
    setModalDirtyState("sfx-editor-modal", false);
    state_sfx_editing.index = def.sfx.length - 1;
  }

  return true;
}

async function resolveThreadBackgroundCharacter(thread) {
  if (!thread?.characterId) return null;
  const base = await db.characters.get(Number(thread.characterId));
  if (!base) return null;
  return resolveCharacterForLanguage(
    base,
    thread.characterLanguage || thread.language || base.activeLanguage || "en",
  );
}

async function getThreadStartImageSfxAsset(character, thread) {
  if (!character || !thread) return null;
  const lang = String(thread.characterLanguage || thread.language || "en");
  const defs = Array.isArray(character.definitions)
    ? character.definitions
    : [character].filter(Boolean);
  const def =
    defs.find(
      (d) => String(d?.language || "").toLowerCase() === lang.toLowerCase(),
    ) || defs[0];
  const sfxList = Array.isArray(def?.sfx) ? def.sfx : [];
  for (const entry of sfxList) {
    if (!entry) continue;
    const trigger = String(entry.trigger || "").toLowerCase();
    if (trigger !== "start") continue;
    const eviction = String(entry.eviction || "").toLowerCase();
    if (eviction !== "never") continue;
    const assetId = Number(entry.assetId);
    if (!Number.isInteger(assetId)) continue;
    const asset = await db.assets.get(assetId);
    if (!asset || asset.type !== "image" || !asset.data) continue;
    const url = getAssetDataUrl(asset);
    if (!url) continue;
    return { assetId: Number(asset.id), url };
  }
  return null;
}

async function applyChatViewBackgroundFromSfx(thread) {
  const chatView = document.getElementById("chat-view");
  if (!chatView) {
    state.chatBackgroundAssetId = null;
    state.chatBackgroundAssetUrl = "";
    return;
  }
  try {
    const resolvedCharacter = await resolveThreadBackgroundCharacter(thread);
    if (!resolvedCharacter) {
      if (state.chatBackgroundAssetId || state.chatBackgroundAssetUrl) {
        clearChatViewBackground();
      }
      return;
    }
    const assetInfo = await getThreadStartImageSfxAsset(
      resolvedCharacter,
      thread,
    );
    if (!assetInfo) {
      if (state.chatBackgroundAssetId || state.chatBackgroundAssetUrl) {
        clearChatViewBackground();
      }
      return;
    }
    if (
      state.chatBackgroundAssetId === assetInfo.assetId &&
      state.chatBackgroundAssetUrl === assetInfo.url
    ) {
      return;
    }
    chatView.style.backgroundImage = `url("${assetInfo.url}")`;
    chatView.style.backgroundSize = "cover";
    chatView.style.backgroundPosition = "center center";
    chatView.style.backgroundRepeat = "no-repeat";
    chatView.style.backgroundAttachment = "fixed";
    chatView.style.backgroundColor = "transparent";
    state.chatBackgroundAssetId = assetInfo.assetId;
    state.chatBackgroundAssetUrl = assetInfo.url;
  } catch (err) {
    console.warn("Failed to update chat background from SFX:", err);
  }
}

function stopAllSfx() {
  if (state.sfx?.currentAudio) {
    try {
      state.sfx.currentAudio.pause();
      state.sfx.currentAudio.currentTime = 0;
      if (state.sfx.currentAudio.src?.startsWith("blob:")) {
        URL.revokeObjectURL(state.sfx.currentAudio.src);
      }
    } catch (e) {
      console.warn("Error stopping SFX:", e);
    }
    state.sfx.currentAudio = null;
    state.sfx.playingAssetId = null;
  }

  clearSfxBackground();

  const overlayContainer = getOrCreateSfxOverlayContainer();
  if (overlayContainer) {
    overlayContainer.innerHTML = "";
  }

  state.sfx.activeEntries = [];
  state.sfx.lastTriggered = {};
  state.sfx.messageCount = {};

  renderActiveSfxPanel();
}

async function playStartSfxForCharacter(character, thread) {
  if (ENABLE_SFX_DEBUG_LOGS) {
    console.log("[SFX] playStartSfxForCharacter called", {
      characterName: character?.name,
      threadId: thread?.id,
      messageCount: conversationHistory.length,
    });
  }
  if (!character || !thread) {
    if (ENABLE_SFX_DEBUG_LOGS) {
      console.log("[SFX] No character or thread, returning");
    }
    return;
  }
  stopAllSfx();

  const lang = String(thread.characterLanguage || thread.language || "en");
  if (ENABLE_SFX_DEBUG_LOGS) console.log("[SFX] Thread language:", lang);
  const defs = Array.isArray(character.definitions)
    ? character.definitions
    : [character].filter(Boolean);
  const def =
    defs.find(
      (d) => String(d?.language || "").toLowerCase() === lang.toLowerCase(),
    ) || defs[0];
  const sfxList = Array.isArray(def?.sfx) ? def.sfx : [];
  if (ENABLE_SFX_DEBUG_LOGS) console.log("[SFX] SFX list:", sfxList);

  if (sfxList.length === 0) {
    if (ENABLE_SFX_DEBUG_LOGS) console.log("[SFX] No SFX entries, returning");
    return;
  }
  if (conversationHistory.length > 1) {
    if (ENABLE_SFX_DEBUG_LOGS) console.log("[SFX] More than 1 message, not playing");
    return;
  }

  const sfx = sfxList.find(
    (s) => s && String(s.trigger || "").toLowerCase() === "start",
  );
  if (ENABLE_SFX_DEBUG_LOGS) console.log("[SFX] First SFX with trigger=start:", sfx);
  if (!sfx) {
    if (ENABLE_SFX_DEBUG_LOGS) console.log("[SFX] No SFX with trigger Start, returning");
    return;
  }

  const entry = normalizeSfxEntry(sfx);

  if (isSfxEntryActive(entry.assetId)) {
    if (ENABLE_SFX_DEBUG_LOGS) {
      console.log("[SFX] Same asset already playing, skipping");
    }
    return;
  }

  stopAllSfx();

  try {
    await activateSfxEntry(entry, thread);
  } catch (err) {
    console.warn("Error playing start SFX:", err);
    stopAllSfx();
  }
}

function normalizeSfxEntry(entry) {
  if (!entry) return null;
  const trigger = String(entry.trigger || "").toLowerCase();
  const eviction = String(entry.eviction || "").toLowerCase();
  return {
    assetId: Number(entry.assetId) || null,
    name: String(entry.name || ""),
    type: entry.type || "sound",
    trigger: trigger,
    triggerKeywords: Array.isArray(entry.triggerKeywords)
      ? entry.triggerKeywords
      : [],
    triggerKeywordsSecondary: Array.isArray(entry.triggerKeywordsSecondary)
      ? entry.triggerKeywordsSecondary
      : [],
    triggerActionPattern: String(entry.triggerActionPattern || ""),
    triggerMatchCase: !!entry.triggerMatchCase,
    triggerMatchWholeWord: !!entry.triggerMatchWholeWord,
    triggerTurnInterval: Number(entry.triggerTurnInterval) || 0,
    triggerCooldownMs: Number(entry.triggerCooldownMs) || 0,
    eviction: eviction,
    evictionKeywords: Array.isArray(entry.evictionKeywords)
      ? entry.evictionKeywords
      : [],
    evictionMessageCount: Number(entry.evictionMessageCount) || 0,
    loop: !!entry.loop,
    volume: Number(entry.volume) || 1,
    fadeInMs: Number(entry.fadeInMs) || 0,
    fadeOutMs: Number(entry.fadeOutMs) || 0,
    opacity: Number(entry.opacity) || 1,
    position: entry.position || "cover",
    layer: Number(entry.layer) || 0,
    transitionDuration: Number(entry.transitionDuration) || 300,
  };
}

function doesTextMatchKeywords(text, keywords, options = {}) {
  if (!text || !Array.isArray(keywords) || keywords.length === 0) return false;
  const { matchCase = false, matchWholeWord = false } = options;
  const searchText = matchCase ? text : text.toLowerCase();
  for (const keyword of keywords) {
    if (!keyword) continue;
    const kw = matchCase ? keyword : keyword.toLowerCase();
    if (matchWholeWord) {
      const regex = new RegExp(
        `\\b${escapeRegex(kw)}\\b`,
        matchCase ? "" : "i",
      );
      if (regex.test(searchText)) return true;
    } else {
      if (searchText.includes(kw)) return true;
    }
  }
  return false;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractActionText(text) {
  if (!text) return "";
  const asteriskMatch = text.match(/\*([^*]+)\*/g);
  if (asteriskMatch) {
    return asteriskMatch.map((s) => s.replace(/\*/g, "")).join(" ");
  }
  return "";
}

function doesTextMatchActionPattern(text, pattern) {
  if (!text || !pattern) return false;
  try {
    const regex = new RegExp(pattern, "i");
    return regex.test(text);
  } catch (e) {
    console.warn("Invalid action pattern regex:", e);
    return false;
  }
}

function getLastTriggerTime(entryKey) {
  return state.sfx.lastTriggered[entryKey] || 0;
}

function setLastTriggerTime(entryKey, time = Date.now()) {
  state.sfx.lastTriggered[entryKey] = time;
}

function getSfxMessageCount(entryKey) {
  return state.sfx.messageCount[entryKey] || 0;
}

function incrementSfxMessageCount(entryKey) {
  if (!state.sfx.messageCount[entryKey]) {
    state.sfx.messageCount[entryKey] = 0;
  }
  state.sfx.messageCount[entryKey]++;
}

function resetSfxMessageCount(entryKey) {
  state.sfx.messageCount[entryKey] = 0;
}

function getEntryKey(sfxEntry, charId) {
  return `${charId}-${sfxEntry.assetId}-${sfxEntry.trigger}-${sfxEntry.triggerKeywords?.join(",") || ""}`;
}

function isSfxEntryActive(assetId) {
  return state.sfx.activeEntries.some((e) => e.assetId === assetId);
}

function addActiveSfxEntry(entry) {
  if (!isSfxEntryActive(entry.assetId)) {
    state.sfx.activeEntries.push({ ...entry, activatedAt: Date.now() });
    renderActiveSfxPanel();
  }
}

function removeActiveSfxEntry(assetId) {
  const idx = state.sfx.activeEntries.findIndex((e) => e.assetId === assetId);
  if (idx !== -1) {
    state.sfx.activeEntries.splice(idx, 1);
    renderActiveSfxPanel();
  }
}

async function evaluateSfxTriggers(botMessage, thread) {
  if (!botMessage || !thread) return;
  const charId = Number(thread.characterId);
  if (!Number.isInteger(charId)) return;

  const character = await db.characters.get(charId);
  if (!character) return;

  const lang = String(thread.characterLanguage || thread.language || "en");
  const defs = Array.isArray(character.definitions)
    ? character.definitions
    : [character];
  const def =
    defs.find(
      (d) => String(d?.language || "").toLowerCase() === lang.toLowerCase(),
    ) || defs[0];
  if (!def || !Array.isArray(def.sfx)) return;

  const messageText = String(botMessage.content || "");
  const actionText = extractActionText(messageText);
  const fullText = messageText + " " + actionText;

  for (const rawEntry of def.sfx) {
    const entry = normalizeSfxEntry(rawEntry);
    if (!entry || !entry.assetId) continue;

    const entryKey = getEntryKey(entry, charId);
    let shouldTrigger = false;

    const triggerType = entry.trigger;

    if (triggerType === "start") {
      shouldTrigger = conversationHistory.length <= 1;
    } else if (triggerType === "keyword" || triggerType === "keywords") {
      const primaryMatch = doesTextMatchKeywords(
        fullText,
        entry.triggerKeywords,
        {
          matchCase: entry.triggerMatchCase,
          matchWholeWord: entry.triggerMatchWholeWord,
        },
      );
      const secondaryMatch =
        entry.triggerKeywordsSecondary.length === 0 ||
        doesTextMatchKeywords(fullText, entry.triggerKeywordsSecondary, {
          matchCase: entry.triggerMatchCase,
          matchWholeWord: entry.triggerMatchWholeWord,
        });
      shouldTrigger = primaryMatch && secondaryMatch;
    }

    if (triggerType === "action" || triggerType === "action_pattern") {
      if (entry.triggerActionPattern) {
        shouldTrigger = doesTextMatchActionPattern(
          actionText,
          entry.triggerActionPattern,
        );
      }
    }

    if (triggerType === "turn" || triggerType === "turn_interval") {
      const interval = entry.triggerTurnInterval || 1;
      const count = getSfxMessageCount(entryKey);
      shouldTrigger = count > 0 && count % interval === 0;
    }

    if (triggerType === "always") {
      shouldTrigger = true;
    }

    if (shouldTrigger && entry.triggerCooldownMs > 0) {
      const lastTime = getLastTriggerTime(entryKey);
      const now = Date.now();
      if (now - lastTime < entry.triggerCooldownMs) {
        shouldTrigger = false;
      }
    }

    if (shouldTrigger) {
      setLastTriggerTime(entryKey);
      await activateSfxEntry(entry, thread);
    }
  }
}

async function activateSfxEntry(entry, thread) {
  if (!entry || !entry.assetId) return;

  try {
    const asset = await db.assets.get(entry.assetId);
    if (!asset) {
      console.warn("[SFX] Asset not found:", entry.assetId);
      return;
    }

    const sfxType =
      entry.type || (asset.type === "sound" ? "sound" : "background");

    if (sfxType === "sound") {
      await playSfxSound(entry, asset);
    } else if (sfxType === "background") {
      await showSfxBackground(entry, asset);
    } else if (sfxType === "overlay") {
      await showSfxOverlay(entry, asset);
    } else if (sfxType === "avatar") {
      await swapSfxAvatar(entry, asset, thread);
    }

    addActiveSfxEntry(entry);
  } catch (err) {
    console.warn("[SFX] Error activating entry:", err);
  }
}

async function playSfxSound(entry, asset) {
  if (!asset.data) return;

  if (ENABLE_SFX_DEBUG_LOGS)
    console.log("[SFX] playSfxSound called with entry:", entry);

  const url = getAssetDataUrl(asset);
  if (!url) return;

  if (state.sfx.currentAudio) {
    state.sfx.currentAudio.pause();
    if (state.sfx.currentAudio.src?.startsWith("blob:")) {
      URL.revokeObjectURL(state.sfx.currentAudio.src);
    }
  }

  const audio = new Audio(url);
  audio.loop = !!entry.loop;
  const volume = Number(entry.volume);
  audio.volume =
    Number.isFinite(volume) && volume >= 0 && volume <= 1 ? volume : 1;
  if (ENABLE_SFX_DEBUG_LOGS)
    if (ENABLE_SFX_DEBUG_LOGS)
      console.log("[SFX] Setting audio volume to:", audio.volume);

  if (entry.fadeInMs > 0) {
    audio.volume = 0;
    audio.play();
    fadeAudioIn(audio, entry.fadeInMs, entry.volume || 1);
  } else {
    audio.play();
  }

  state.sfx.currentAudio = audio;
  state.sfx.playingAssetId = entry.assetId;

  audio.addEventListener("ended", () => {
    if (!entry.loop) {
      removeActiveSfxEntry(entry.assetId);
    }
  });
}

function fadeAudioIn(audio, durationMs, targetVolume) {
  const steps = 20;
  const interval = durationMs / steps;
  const volumeStep = targetVolume / steps;
  let currentStep = 0;

  const fadeInterval = setInterval(() => {
    currentStep++;
    audio.volume = Math.min(volumeStep * currentStep, targetVolume);
    if (currentStep >= steps) {
      clearInterval(fadeInterval);
    }
  }, interval);
}

function fadeAudioOut(audio, durationMs, onComplete) {
  if (!audio) {
    if (onComplete) onComplete();
    return;
  }

  const startVolume = audio.volume;
  const steps = 20;
  const interval = durationMs / steps;
  const volumeStep = startVolume / steps;
  let currentStep = 0;

  const fadeInterval = setInterval(() => {
    currentStep++;
    audio.volume = Math.max(startVolume - volumeStep * currentStep, 0);
    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      audio.pause();
      if (onComplete) onComplete();
    }
  }, interval);
}

async function showSfxBackground(entry, asset) {
  if (!asset.data) return;

  const url = getAssetDataUrl(asset);
  if (!url) return;

  const chatView = document.getElementById("chat-view");
  if (!chatView) return;

  if (entry.fadeInMs > 0) {
    chatView.style.transition = `background ${entry.fadeInMs}ms ease-in-out`;
  }

  chatView.style.backgroundImage = `url("${url}")`;
  chatView.style.backgroundSize = entry.position || "cover";
  chatView.style.backgroundPosition = "center center";
  chatView.style.backgroundRepeat = "no-repeat";
  chatView.style.backgroundAttachment = "fixed";
  chatView.style.backgroundColor = "transparent";

  state.sfx.chatBackgroundAssetId = entry.assetId;
  state.sfx.chatBackgroundAssetUrl = url;
}

function clearSfxBackground() {
  const chatView = document.getElementById("chat-view");
  if (chatView) {
    chatView.style.backgroundImage = "";
    chatView.style.backgroundColor = "";
  }
  state.sfx.chatBackgroundAssetId = null;
  state.sfx.chatBackgroundAssetUrl = "";
}

function clearChatViewBackground() {
  const chatView = document.getElementById("chat-view");
  if (chatView) {
    chatView.style.removeProperty("background-image");
    chatView.style.removeProperty("background-size");
    chatView.style.removeProperty("background-position");
    chatView.style.removeProperty("background-repeat");
    chatView.style.removeProperty("background-attachment");
    chatView.style.removeProperty("background-color");
  }
  state.chatBackgroundAssetId = null;
  state.chatBackgroundAssetUrl = "";
}

async function showSfxOverlay(entry, asset) {
  const overlayContainer = getOrCreateSfxOverlayContainer();
  if (!overlayContainer) return;

  const url = asset.data ? getAssetDataUrl(asset) : asset.thumbnail;
  if (!url) return;

  const existingOverlay = overlayContainer.querySelector(
    `[data-sfx-asset-id="${entry.assetId}"]`,
  );
  if (existingOverlay) return;

  const overlay = document.createElement("div");
  overlay.className = "sfx-overlay";
  overlay.dataset.sfxAssetId = entry.assetId;
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = String(entry.layer || 100);
  overlay.style.opacity = String(entry.opacity || 1);
  overlay.style.transition = `opacity ${entry.transitionDuration || 300}ms ease-in-out`;

  if (asset.type === "image") {
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = entry.position || "cover";
    overlay.appendChild(img);
  } else if (asset.type === "video") {
    const video = document.createElement("video");
    video.src = url;
    video.loop = !!entry.loop;
    video.muted = true;
    video.playsInline = true;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = entry.position || "cover";
    if (entry.fadeInMs > 0) {
      video.style.opacity = "0";
      setTimeout(() => {
        video.style.transition = `opacity ${entry.fadeInMs}ms`;
        video.style.opacity = "1";
      }, 10);
    }
    video.play();
    overlay.appendChild(video);
  }

  overlayContainer.appendChild(overlay);
}

function getOrCreateSfxOverlayContainer() {
  let container = document.getElementById("sfx-overlay-container");
  if (!container) {
    container = document.getElementById("chat-view");
  }
  if (!container) return null;

  let overlayDiv = container.querySelector(".sfx-overlays-layer");
  if (!overlayDiv) {
    overlayDiv = document.createElement("div");
    overlayDiv.className = "sfx-overlays-layer";
    overlayDiv.style.position = "absolute";
    overlayDiv.style.top = "0";
    overlayDiv.style.left = "0";
    overlayDiv.style.width = "100%";
    overlayDiv.style.height = "100%";
    overlayDiv.style.pointerEvents = "none";
    overlayDiv.style.zIndex = "50";
    container.style.position = "relative";
    container.appendChild(overlayDiv);
  }
  return overlayDiv;
}

function removeSfxOverlay(assetId) {
  const container = getOrCreateSfxOverlayContainer();
  if (!container) return;

  const overlay = container.querySelector(`[data-sfx-asset-id="${assetId}"]`);
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 300);
  }
}

async function swapSfxAvatar(entry, asset, thread) {
  if (!asset || !thread) return;

  const url = asset.data ? getAssetDataUrl(asset) : asset.thumbnail;
  if (!url) return;

  thread.sfxAvatarUrl = url;

  const messageElements = document.querySelectorAll(
    `.message[data-character-id="${thread.characterId}"] .message-avatar img`,
  );
  messageElements.forEach((img) => {
    img.src = url;
  });

  const avatarElements = document.querySelectorAll(
    `.bot-avatar[data-thread-id="${thread.id}"]`,
  );
  avatarElements.forEach((avatar) => {
    avatar.innerHTML = `<img src="${url}" alt="Avatar">`;
  });
}

async function evaluateSfxEvictions(botMessage, thread) {
  if (!botMessage || !thread) return;
  const charId = Number(thread.characterId);
  if (!Number.isInteger(charId)) return;

  const character = await db.characters.get(charId);
  if (!character) return;

  const lang = String(thread.characterLanguage || thread.language || "en");
  const defs = Array.isArray(character.definitions)
    ? character.definitions
    : [character];
  const def =
    defs.find(
      (d) => String(d?.language || "").toLowerCase() === lang.toLowerCase(),
    ) || defs[0];
  if (!def || !Array.isArray(def.sfx)) return;

  const messageText = String(botMessage.content || "");

  const activeAssetIds = state.sfx.activeEntries.map((e) => e.assetId);

  for (const activeEntry of [...state.sfx.activeEntries]) {
    const rawEntry = def.sfx.find(
      (e) => Number(e.assetId) === activeEntry.assetId,
    );
    if (!rawEntry) {
      await deactivateSfxEntry(activeEntry);
      continue;
    }

    const entry = normalizeSfxEntry(rawEntry);
    const entryKey = getEntryKey(entry, charId);
    const evictionType = entry.eviction;

    let shouldEvict = false;

    if (evictionType === "never" || evictionType === "manual") {
      continue;
    }

    if (evictionType === "keyword" || evictionType === "keywords") {
      shouldEvict = doesTextMatchKeywords(messageText, entry.evictionKeywords, {
        matchCase: entry.triggerMatchCase,
        matchWholeWord: entry.triggerMatchWholeWord,
      });
    }

    if (evictionType === "message_count" || evictionType === "messagecount") {
      incrementSfxMessageCount(entryKey);
      const count = getSfxMessageCount(entryKey);
      if (
        entry.evictionMessageCount > 0 &&
        count >= entry.evictionMessageCount
      ) {
        shouldEvict = true;
        resetSfxMessageCount(entryKey);
      }
    }

    if (evictionType === "eof" || evictionType === "end_of_conversation") {
      if (botMessage.isFinalIncomplete) {
        shouldEvict = true;
      }
    }

    if (shouldEvict) {
      await deactivateSfxEntry(activeEntry);
    }
  }
}

async function deactivateSfxEntry(entry) {
  if (!entry) return;

  const assetId = entry.assetId || entry;

  try {
    const asset = await db.assets.get(assetId);
    const sfxType =
      entry.type || (asset?.type === "sound" ? "sound" : "background");

    if (sfxType === "sound") {
      if (state.sfx.playingAssetId === assetId && state.sfx.currentAudio) {
        if (entry.fadeOutMs > 0) {
          fadeAudioOut(state.sfx.currentAudio, entry.fadeOutMs, () => {
            if (state.sfx.currentAudio?.src?.startsWith("blob:")) {
              URL.revokeObjectURL(state.sfx.currentAudio.src);
            }
            state.sfx.currentAudio = null;
            state.sfx.playingAssetId = null;
          });
        } else {
          state.sfx.currentAudio.pause();
          if (state.sfx.currentAudio.src?.startsWith("blob:")) {
            URL.revokeObjectURL(state.sfx.currentAudio.src);
          }
          state.sfx.currentAudio = null;
          state.sfx.playingAssetId = null;
        }
      }
    } else if (sfxType === "background") {
      if (state.sfx.chatBackgroundAssetId === assetId) {
        clearSfxBackground();
      }
    } else if (sfxType === "overlay") {
      removeSfxOverlay(assetId);
    } else if (sfxType === "avatar") {
    }

    removeActiveSfxEntry(assetId);
  } catch (err) {
    console.warn("[SFX] Error deactivating entry:", err);
    removeActiveSfxEntry(assetId);
  }
}

function renderActiveSfxPanel() {
  const panel = document.getElementById("active-sfx-panel");
  if (!panel) return;

  if (state.sfx.activeEntries.length === 0) {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");
  const list = panel.querySelector(".active-sfx-list");
  if (!list) return;

  list.innerHTML = "";

  for (const entry of state.sfx.activeEntries) {
    const item = document.createElement("div");
    item.className = "active-sfx-item";
    item.innerHTML = `
      <span class="active-sfx-name">${entry.name || "SFX"}</span>
      <button class="icon-btn danger-icon-btn" data-evict-sfx="${entry.assetId}" title="${t("stopSfx") || "Stop"}">
        &times;
      </button>
    `;
    list.appendChild(item);
  }

  list.querySelectorAll("[data-evict-sfx]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const assetId = Number(e.target.dataset.evictSfx);
      const entry = state.sfx.activeEntries.find(
        (ent) => ent.assetId === assetId,
      );
      if (entry) {
        await deactivateSfxEntry(entry);
      }
    });
  });
}

async function evictAllSfx() {
  for (const entry of [...state.sfx.activeEntries]) {
    await deactivateSfxEntry(entry);
  }
  state.sfx.lastTriggered = {};
  state.sfx.messageCount = {};
}
