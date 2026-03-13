/**
 * Memory Module
 *
 * This module handles the conversation memory summarization feature.
 * The memory system summarizes older messages to preserve context while
 * keeping the active conversation history manageable.
 *
 * ============================================================================
 * MEMORY PIPELINE
 * ============================================================================
 *
 * 1. TRIGGER (in app.js)
 *    - Called in two places:
 *      a) After user sends a message (handleUserMessage)
 *      b) After bot message generation completes (generateBotReply)
 *    - Conditions:
 *      a) Character has memory enabled (character.useMemory !== false)
 *      b) Unsummarized message count >= summaryThreshold setting (default: 20)
 *      c) For bot reply trigger only: user is viewing the thread (isViewingThread)
 *    - Calls: window.summarizeMemory(character)
 *
 * 2. SUMMARIZATION (summarizeMemory function)
 *    - Finds oldest unsummarized assistant/user messages in conversationHistory
 *    - Takes all eligible messages up to threshold
 *    - Creates a pending chat bubble (generationStatus: "summarizing")
 *    - If entering new level (slot wraps to 1), includes previous level's summaries
 *    - Sends to AI with summarization prompt
 *    - Stores the summary in db.memories table with slotNumber and levelNumber
 *    - Marks oldest messages as summarized (summarized=true, summaryId=memoryId)
 *    - Protects recent messages: up to memoryMessagesToKeep (default: 3) remain unsummarized
 *    - Removes pending bubble, updates conversationHistory and DB
 *
 * 3. RETRIEVAL (getMemorySummary function)
 *    - Called in buildSystemPrompt() before each completion request
 *    - Fetches all stored summaries for character from db.memories
 *    - Returns only entries from the highest level for that character
 *    - If character has memory disabled, returns null
 *
 * 4. PROMPT INCLUSION (in buildSystemPrompt)
 *    - If memory exists, it's added to the prompt as:
 *      "## Memory Context\n{memory}"
 *    - Summarized messages (summarized=true) are filtered out from generationHistory
 *    - Only unsummarized messages + memory context are sent to the API
 *
 * ============================================================================
 * MEMORY ORGANIZATION (SLOT/LEVEL SYSTEM)
 * ============================================================================
 *
 * Each character+thread combination has its own independent sequence of memory slots.
 * - memorySlots setting (default: 5) controls slots per level
 * - slotNumber: sequential position within current level (1 to memorySlots)
 * - levelNumber: increments when slotNumber wraps from memorySlots back to 1
 *
 * Example with memorySlots=5:
 *   Entry 1: slot=1, level=1
 *   Entry 2: slot=2, level=1
 *   ...
 *   Entry 5: slot=5, level=1
 *   Entry 6: slot=1, level=2  (level increments)
 *
 * Only entries from the highest level are included in the prompt.
 * When a new level begins (slot wraps to 1), previous level summaries
 * are provided as context to the summarizer for continuity.
 *
 * ============================================================================
 * DATABASE SCHEMA
 * ============================================================================
 *
 * Table: memories
 * Fields:
 *   - id (auto-increment primary key)
 *   - characterId (indexed)
 *   - threadId (optional, null for thread-independent memories)
 *   - summary (string, the summarized text)
 *   - slotNumber (int, sequential within level, 1 to memorySlots)
 *   - levelNumber (int, increments when slots wrap)
 *   - createdAt (timestamp, used for ordering)
 *
 * Message flags (in conversationHistory):
 *   - summarized: true (message replaced by summary) / false (still in context)
 *   - summaryId: links to db.memories.id if message was summarized
 *   - summaryProtected: memoryId if message is protected (working context)
 *
 * ============================================================================
 * SETTINGS
 * ============================================================================
 *
 * All settings are stored in state.settings:
 *
 * - summaryThreshold (number, default: 20)
 *   Minimum unsummarized messages before triggering summarization.
 *   Rounded to nearest 5, clamped to 5-50 range.
 *
 * - memorySlots (number, default: 5)
 *   Number of summaries per level before level increments.
 *   Range: 3-10.
 *
 * - memoryMessagesToKeep (number, default: 3)
 *   Number of most recent unsummarized messages to keep as working context.
 *   These messages remain in the prompt even after summarization.
 *   Range: 0-4.
 *
 * ============================================================================
 * USAGE
 * ============================================================================
 *
 * This module is loaded as a regular script in index.html.
 * It exposes two global functions:
 *
 * // Get all memory summaries for a character (highest level only)
 * const memory = await getMemorySummary(characterId, threadId);
 *
 * // Trigger memory summarization (called automatically in app.js)
 * await summarizeMemory(character);
 *
 * ============================================================================
 */

const DEFAULT_MEMORY_SUMMARIZER_USER_PROMPT =
  "Summarize the following message exchange content in 1-5 sentences, focusing on key events, decisions, and relationship developments. Be concise and factual.";

function getEntryLevel(entry) {
  const raw = Number(entry?.levelNumber);
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

function formatMemoryEntry(entry, idx) {
  const rawSlot = Number(entry?.slotNumber);
  const fallbackSlot =
    Number.isInteger(idx) && idx >= 0 ? idx + 1 : undefined;
  const slot =
    Number.isInteger(rawSlot) && rawSlot > 0
      ? rawSlot
      : Number.isInteger(fallbackSlot)
      ? fallbackSlot
      : 1;
  const level = getEntryLevel(entry);
  const summaryText = String(entry?.summary || "");
  return `**ENTRY ${slot} LEVEL ${level}**\n${summaryText}`;
}

function formatMemoryEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return "";
  return entries.map(formatMemoryEntry).join("\n\n");
}

function getHighestMemoryLevel(entries) {
  return entries.reduce((max, entry) => Math.max(max, getEntryLevel(entry)), 1);
}

/**
 * Retrieves all memory entries for a character, optionally filtered by thread.
 * Does not filter by level - returns all stored entries.
 *
 * @param {number} characterId - The ID of the character
 * @param {number} [threadId] - The ID of the thread (optional, for filtering)
 * @returns {Promise<Array>} - All matching memory entry objects
 */
async function getMemoryEntries(characterId, threadId) {
  let entries = await db.memories
    .where("characterId")
    .equals(characterId)
    .sortBy("createdAt");
  if (threadId != null) {
    entries = entries.filter((entry) => entry.threadId === threadId);
  }
  return entries;
}

/**
 * Retrieves the memory summary for a character, formatted for prompt inclusion.
 * Returns only entries from the highest level (most recent memory level).
 *
 * @param {number} characterId - The ID of the character
 * @param {number} [threadId] - The ID of the thread (optional, for filtering)
 * @returns {Promise<string|null>} - Formatted memory text or null if no memories exist
 */
async function getMemorySummary(characterId, threadId) {
  const entries = await getMemoryEntries(characterId, threadId);
  if (entries.length === 0) return null;
  const highestLevel = getHighestMemoryLevel(entries);
  const levelEntries = entries.filter(
    (entry) => getEntryLevel(entry) === highestLevel,
  );
  const relevantEntries =
    levelEntries.length > 0 ? levelEntries : entries;
  return formatMemoryEntries(relevantEntries);
}

function getSummaryThresholdValue(raw) {
  const num = Number(raw);
  if (!Number.isFinite(num)) return 20;
  const stepped = Math.round(num / 5) * 5;
  return Math.min(50, Math.max(5, stepped));
}

function getMemoryMessagesToKeepValue(raw) {
  const num = Number(raw);
  if (!Number.isFinite(num)) return 3;
  const rounded = Math.round(num);
  return Math.min(10, Math.max(0, rounded));
}

function getMemorySlotsValue(raw) {
  const num = Number(raw);
  if (!Number.isFinite(num)) return 5;
  const rounded = Math.round(num);
  return Math.min(10, Math.max(3, rounded));
}

window.getSummaryThresholdValue = getSummaryThresholdValue;
window.getMemorySlotsValue = getMemorySlotsValue;
window.getMemoryMessagesToKeepValue = getMemoryMessagesToKeepValue;

function getCurrentMemorySlots() {
  const raw = state?.settings?.memorySlots;
  return getMemorySlotsValue(raw ?? 5);
}

function getCurrentMemoryMessagesToKeep() {
  const raw = state?.settings?.memoryMessagesToKeep;
  return getMemoryMessagesToKeepValue(raw ?? 3);
}

/**
 * Calculates the next slot/level for a character+thread memory sequence.
 * Cycles through 1 to memorySlots, then increments levelNumber and resets slot to 1.
 *
 * @param {number} characterId - The character ID
 * @param {number} [threadId] - Optional thread ID for thread-specific sequences
 * @returns {Object} - { slot: number, level: number } - next values to use
 */
async function getNextMemorySlotInfo(characterId, threadId) {
  const limit = getCurrentMemorySlots();
  const entries = await db.memories
    .where("characterId")
    .equals(characterId)
    .sortBy("createdAt");

  const filtered =
    threadId != null
      ? entries.filter((entry) => entry.threadId === threadId)
      : entries;

  if (filtered.length === 0) {
    return { slot: 1, level: 1 };
  }

  const lastEntry = filtered[filtered.length - 1];
  const lastSlot =
    Number.isInteger(lastEntry.slotNumber) && lastEntry.slotNumber > 0
      ? lastEntry.slotNumber
      : 1;
  const lastLevel =
    Number.isInteger(lastEntry.levelNumber) && lastEntry.levelNumber > 0
      ? lastEntry.levelNumber
      : 1;

  if (limit <= 0) {
    return { slot: lastSlot, level: lastLevel };
  }

  if (lastSlot >= limit) {
    return { slot: 1, level: lastLevel + 1 };
  }

  return { slot: lastSlot + 1, level: lastLevel };
}

const MEMORY_PLACEHOLDER_STATUSES = new Set([
  "queued",
  "cooling_down",
  "title_generating",
  "summarizing",
]);

/**
 * Checks if a message is a placeholder (spinner/bubble) or has a generation status
 * that indicates it represents ongoing generation rather than real content.
 * Placeholder messages are excluded from summarization.
 *
 * @param {Object} message - The message object to check
 * @returns {boolean} - True if message is a placeholder
 */
function memoryIsPlaceholderMessage(message) {
  if (!message) return false;
  if (message.placeholder === true) return true;
  if (
    typeof window !== "undefined" &&
    typeof window.isPlaceholderMessage === "function"
  ) {
    return window.isPlaceholderMessage(message);
  }
  const status = String(message.generationStatus || "").trim();
  return MEMORY_PLACEHOLDER_STATUSES.has(status);
}

function getCurrentSummaryThreshold() {
  const raw = state?.settings?.summaryThreshold;
  return getSummaryThresholdValue(raw ?? 20);
}

/**
 * Summarizes the oldest unsummarized assistant/user messages in the conversation
 * history and stores the summary as a new memory entry. Only triggers if:
 * - Character has memory enabled (character.useMemory !== false)
 * - Unsummarized message count >= summaryThreshold setting
 *
 * The summarization process:
 * 1. Identifies all unsummarized, non-placeholder assistant/user messages
 * 2. Determines next slot/level for this character+thread combination
 * 3. If entering new level (slot wraps to 1), fetches previous level summaries
 *    and includes them in the summarization prompt for continuity
 * 4. Creates a pending "summarizing" message bubble if user is viewing thread
 * 5. Sends messages to AI with summarization prompt
 * 6. Stores result in db.memories with computed slotNumber and levelNumber
 * 7. Marks oldest unsummarized messages as summarized:
 *    - All but the most recent 'memoryMessagesToKeep' messages get summarized=true
 *    - Each marked message receives the summaryId linking to the new memory
 * 8. Protects the recent memoryMessagesToKeep messages:
 *    - These remain unsummarized but get summaryProtected=memoryId
 *    - They stay in conversationHistory and continue contributing to prompts
 * 9. Removes pending bubble, persists thread, and re-renders chat if viewing
 *
 * Messages are never deleted from conversationHistory; they remain visible in chat.
 *
 * @param {Object} character - The character object (must have id property)
 * @returns {Promise<void>}
 */
async function summarizeMemory(character) {
  if (character.useMemory === false) return true;

  const threadId = currentThread?.id;
  const isViewing = threadId && isViewingThread(threadId);

  const candidateMessages = conversationHistory
    .map((message, idx) => ({ message, idx }))
    .filter((entry) => {
      const msg = entry.message;
      if (
        !msg ||
        msg.ooc === true ||
        memoryIsPlaceholderMessage(msg) ||
        msg.summarized === true
      ) {
        return false;
      }
      if (msg.role !== "assistant" && msg.role !== "user") {
        return false;
      }
      return true;
    });
  const unsummarizedCount = candidateMessages.reduce((count, entry) => {
    const msg = entry.message;
    if (Boolean(msg.summaryProtected)) {
      return count;
    }
    return count + 1;
  }, 0);
  const threshold = getCurrentSummaryThreshold();
  if (threshold <= 0 || unsummarizedCount < threshold) return true;

  const upcomingSlotInfo = await getNextMemorySlotInfo(character.id, threadId);
  const shouldIncludePreviousLevel =
    upcomingSlotInfo.slot === 1 && upcomingSlotInfo.level > 1;
  let previousLevelContext = "";
  if (shouldIncludePreviousLevel) {
    const previousLevel = upcomingSlotInfo.level - 1;
    const previousEntries = await getMemoryEntries(character.id, threadId);
    const levelEntries = previousEntries.filter(
      (entry) => getEntryLevel(entry) === previousLevel,
    );
    const formattedEntries = formatMemoryEntries(levelEntries);
    if (formattedEntries) {
      previousLevelContext = `***MEMORY LEVEL ${previousLevel} CONTEXT***\n\n${formattedEntries}`;
    }
  }

  const storedMemorySummary = await getMemorySummary(character.id, threadId);
  const memoryContextSection = storedMemorySummary
    ? `***MEMORY CONTEXT***\n\n${storedMemorySummary}`
    : "";

  const userPromptText =
    (state?.settings?.memorySummarizerUserPrompt || "").trim() ||
    DEFAULT_MEMORY_SUMMARIZER_USER_PROMPT;
  const summarySections = [];
  if (memoryContextSection) {
    summarySections.push(memoryContextSection);
  }
  if (previousLevelContext) {
    summarySections.push(previousLevelContext);
  }
  const keepSetting = getCurrentMemoryMessagesToKeep();
  const keepCount = Math.min(keepSetting, candidateMessages.length);
  const markCount = Math.max(0, candidateMessages.length - keepCount);
  if (markCount === 0) return true;
  const toSummarizeEntries = candidateMessages
    .slice(0, markCount)
    .map((entry) => entry.message)
    .filter(Boolean);
  if (toSummarizeEntries.length === 0) return true;
  const messageEntries = toSummarizeEntries
    .map((m) => buildMessageEntryForSummary(m))
    .filter(Boolean);
  if (messageEntries.length === 0) {
    return true;
  }
  const messagesSection = buildSummaryMessagesSection(messageEntries);
  if (messagesSection) {
    summarySections.push(messagesSection);
  }
  const prompt = `${userPromptText}\n\n${summarySections.join("\n\n")}`;
  const requestHistory = [{ role: "user", content: prompt }];

  if (isViewing) {
    showToast("Memory summarization triggered", "info");
  }

  const pendingMessage = {
    role: "assistant",
    content: "",
    generationStatus: "summarizing",
    createdAt: Date.now(),
    finishReason: "",
    nativeFinishReason: "",
    truncatedByFilter: false,
    generationId: "",
    completionMeta: null,
    generationInfo: null,
    usedLoreEntries: [],
    usedMemorySummary: "",
    model: state.settings.model || "",
    temperature: Number(state.settings.temperature) || 0,
    placeholder: true,
  };
  conversationHistory.push(pendingMessage);
  if (currentThread) {
    currentThread.messages = [...conversationHistory];
    updateThreadMessageCount(currentThread.id, conversationHistory);
  }
  const pendingIndex = conversationHistory.length - 1;

  // Set thread as actively generating for UI state
  state.activeGenerationThreadId = threadId;
  // No abort controller needed for summarization (unless we want to support cancelling)
  // But we'll set a flag that summarization is in progress
  if (!state.summarizationInProgress) {
    state.summarizationInProgress = new Set();
  }
  state.summarizationInProgress.add(threadId);

  await persistCurrentThread();

  if (isViewing) {
    const log = document.getElementById("chat-log");
    if (log) {
      const pendingRow = buildMessageRow(pendingMessage, pendingIndex, true);
      log.appendChild(pendingRow);
      const pendingContent = pendingRow?.querySelector(".message-content");
      if (pendingContent) {
        pendingContent.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(t("summarizingMemoryLabel"))}`;
      }
      scrollChatToBottom();
    }
  }

  const summarySystemPrompt =
    state.settings.summarySystemPrompt ||
    "You are a helpful summarization assistant.";

  try {
     let summary = null;
     let summarySystemContent = summarySystemPrompt;
     let summaryUserContent = prompt;
     
     if (state.settings.useLocalSummarization) {
       if (isViewing) {
         showToast("Using local summarization...", "info");
       }
       const localSummary = await getLocalSummary(prompt);
       if (localSummary) {
         summary = localSummary;
       } else {
         if (isViewing) {
           showToast("Local summarization failed, using API", "warning");
         }
         // Fall through to API
       }
     }
     
     if (summary === null) {
       const summaryResult = await callOpenRouter(
         summarySystemPrompt,
         requestHistory,
         state.settings.model,
         null,
         null,
         { forceStream: false },
       );
       summary = summaryResult.content;
       
       const systemMessages = Array.isArray(summaryResult.systemMessages)
         ? summaryResult.systemMessages
         : [];
       const systemContentPieces = systemMessages
         .filter((msg) => msg.role === "system")
         .map((msg) => String(msg.content || "").trim())
         .filter(Boolean);
       summarySystemContent =
         systemContentPieces.length > 0
           ? systemContentPieces.join("\n\n")
           : summarySystemPrompt;
       
       const userContentPieces = requestHistory
         .filter((msg) => msg.role === "user")
         .map((msg) => String(msg.content || "").trim())
         .filter(Boolean);
       summaryUserContent =
         userContentPieces.length > 0 ? userContentPieces.join("\n\n") : prompt;
     }
     const memoryId = await db.memories.add({
       characterId: character.id,
       threadId,
       summary,
       slotNumber: upcomingSlotInfo.slot,
       levelNumber: upcomingSlotInfo.level,
       summarySystemContent,
       summaryUserContent,
       createdAt: Date.now(),
     });

     // Generate and store embedding asynchronously for semantic filtering
     if (typeof getEmbedding === 'function') {
       (async () => {
         try {
           const embedding = await getEmbedding(String(summary || '').trim());
           if (embedding && Array.isArray(embedding)) {
             await db.memories.update(memoryId, { embedding });
           }
         } catch (e) {
           console.warn('Failed to generate memory embedding:', e);
         }
       })();
     }

     for (let i = 0; i < markCount; i += 1) {
       const entry = candidateMessages[i];
       const idx = entry?.idx;
       if (
         Number.isInteger(idx) &&
         conversationHistory[idx] &&
         conversationHistory[idx].summarized !== true
       ) {
         conversationHistory[idx].summarized = true;
         conversationHistory[idx].summaryId = memoryId;
         conversationHistory[idx].summaryProtected = false;
       }
     }
     for (let i = markCount; i < candidateMessages.length; i += 1) {
       const entry = candidateMessages[i];
       const idx = entry?.idx;
       if (
         Number.isInteger(idx) &&
         conversationHistory[idx] &&
         conversationHistory[idx].summarized !== true
       ) {
         conversationHistory[idx].summaryProtected = memoryId;
       }
     }

    conversationHistory.pop();

    // Clean up summarization state
    if (state.summarizationInProgress) {
      state.summarizationInProgress.delete(threadId);
    }
    // Refresh send button state
    if (typeof setSendingState === 'function') {
      setSendingState();
    }

    await persistCurrentThread();

    if (isViewing) {
      renderChat();
    }
    return true;
  } catch (e) {
    const detail = String(e?.message || t("unknownError"));
    const errorMessage = tf("memorySummarizationFailed", { error: detail });
    const idx = conversationHistory.indexOf(pendingMessage);
    if (idx >= 0) {
      const failureMessage = conversationHistory[idx];
      failureMessage.generationStatus = "";
      failureMessage.placeholder = false;
      failureMessage.content = "";
      failureMessage.generationError = errorMessage;
    }
    // Clean up summarization state on error
    if (state.summarizationInProgress) {
      state.summarizationInProgress.delete(threadId);
    }
    // Refresh send button state
    if (typeof setSendingState === 'function') {
      setSendingState();
    }
    await persistCurrentThread();
    if (isViewing) {
      renderChat();
    }
    console.warn("Memory summarization failed:", detail);
    showToast(errorMessage, "error");
    return false;
}
}

function buildMessageEntryForSummary(message) {
  if (!message) return "";
  const rawContent = String(message.content || "");
  if (!rawContent.trim()) return "";
  const processed =
    message.role === "assistant"
      ? applySummaryMessagePreProcessing(rawContent)
      : rawContent;
  const filtered = removeSummaryParagraphs(processed);
  const trimmed = filtered.trim();
  if (!trimmed) return "";
  const labeled = `${message.role}: ${trimmed}`;
  const normalized = normalizeSummaryRoleLabels(labeled);
  if (message.role === "user") {
    const personaName = String(message.senderName || "You");
    return normalized.replace(
      /^\[USER\]:/,
      `[USER (as ${personaName})]:`,
    );
  }
  return normalized;
}

function removeSummaryParagraphs(text, prefix = "> || ") {
  if (!text) return "";
  const normalized = text.replace(/\r\n/g, "\n");
  const paragraphs = normalized.split(/\n\s*\n/);
  const filtered = paragraphs.filter((paragraph) => {
    const trimmed = paragraph.trimStart();
    return !trimmed.startsWith(prefix);
  });
  return filtered.join("\n\n");
}

function normalizeSummaryRoleLabels(text) {
  if (!text) return "";
  const normalized = text.replace(/\r\n/g, "\n");
  return normalized
    .replace(/(^|\n)assistant:/gi, "$1[ASSISTANT]:")
    .replace(/(^|\n)user:/gi, "$1[USER]:");
}

function buildSummaryMessagesSection(entries) {
  if (!entries || entries.length === 0) return "";
  return `***MESSAGES***\n\n${entries.join("\n\n")}`;
}

// Expose functions globally for app.js to use
window.getMemorySummary = getMemorySummary;
window.summarizeMemory = summarizeMemory;
window.getMemoryEntries = getMemoryEntries;
