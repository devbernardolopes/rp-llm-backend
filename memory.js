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
 * 1. TRIGGER (in app.js: requestBotReplyForCurrentThread)
 *    - After each bot message is generated
 *    - Conditions:
 *      a) Character has memory enabled (character.useMemory !== false)
 *      b) History length is a multiple of 20 (generationHistory.length % 20 === 0)
 *      c) User is viewing the thread (isViewingThread(threadId))
 *    - Calls: window.summarizeMemory(character)
 *
 * 2. SUMMARIZATION (summarizeMemory function below)
 *    - Finds the oldest unsummarized messages in conversationHistory
 *    - Takes up to 20 messages to summarize
 *    - Creates a pending chat bubble (same UI as bot message)
 *    - Sends them to AI with a summarization prompt
 *    - Stores the summary in db.memories table
 *    - Marks the messages with summarized: true and summaryId
 *    - Removes the pending bubble
 *    - Messages remain visible in chat and DB
 *
 * 3. RETRIEVAL (getMemorySummary function below)
 *    - Called in buildSystemPrompt() before each completion request
 *    - Fetches all stored summaries for the character from db.memories
 *    - If character has memory disabled, returns null
 *
 * 4. PROMPT INCLUSION (in app.js: buildSystemPrompt)
 *    - If memory exists, it's added to the prompt as:
 *      "## Memory Context\n{memory}"
 *    - Summarized messages are filtered out from generationHistory
 *    - Only unsummarized messages are sent to the API
 *
 * ============================================================================
 * DATABASE SCHEMA
 * ============================================================================
 *
 * Table: memories
 * Fields:
 *   - id (auto-increment primary key)
 *   - characterId (indexed)
 *   - summary (string)
 *   - createdAt (timestamp)
 *
 * Message flags (in conversationHistory):
 *   - summarized: true/false
 *   - summaryId: links to db.memories id
 *
 * ============================================================================
 * USAGE
 * ============================================================================
 *
 * This module is loaded as a regular script in index.html.
 * It exposes two global functions:
 *
 * // Get all memory summaries for a character
 * const memory = await getMemorySummary(characterId, threadId);
 *
 * // Trigger memory summarization (called automatically in app.js)
 * await summarizeMemory(character);
 *
 * ============================================================================
 */

/**
 * Retrieves all memory summaries for a character and thread from the database.
 *
 * @param {number} characterId - The ID of the character
 * @param {number} [threadId] - The ID of the thread (optional, for filtering)
 * @returns {Promise<string|null>} - All summaries joined with newlines, or null if none exist
 */
async function getMemorySummary(characterId, threadId) {
  let entries = await db.memories
    .where("characterId")
    .equals(characterId)
    .sortBy("createdAt");

  if (threadId) {
    entries = entries.filter((e) => e.threadId === threadId);
  }

  if (entries.length === 0) return null;

  return entries.map((e) => e.summary).join("\n");
}

function getSummaryThresholdValue(raw) {
  const num = Number(raw);
  if (!Number.isFinite(num)) return 20;
  const stepped = Math.round(num / 5) * 5;
  return Math.min(50, Math.max(10, stepped));
}

window.getSummaryThresholdValue = getSummaryThresholdValue;

function getCurrentSummaryThreshold() {
  const raw = state?.settings?.summaryThreshold;
  return getSummaryThresholdValue(raw ?? 20);
}

/**
 * Summarizes the unslaunched messages in the conversation history once the
 * configured threshold is reached and stores the summary in the database.
 * Messages remain visible in chat but are flagged as summarized (so they
 * no longer contribute to the prompt), except for the five most recent entries
 * which are kept as working context.
 *
 * This function is triggered automatically when the conversation has
 * accumulated at least the summary threshold of unsummarized assistant/user
 * messages and the character has memory enabled.
 *
 * @param {Object} character - The character object (must have id property)
 * @returns {Promise<void>}
 */
async function summarizeMemory(character) {
  if (character.useMemory === false) return;

  const threadId = currentThread?.id;
  const isViewing = threadId && isViewingThread(threadId);

  const unsMessages = conversationHistory
    .map((message, idx) => ({ message, idx }))
    .filter(
      (entry) =>
        entry.message &&
        entry.message.summarized !== true &&
        (entry.message.role === "assistant" || entry.message.role === "user"),
    );
  const threshold = getCurrentSummaryThreshold();
  if (threshold <= 0 || unsMessages.length < threshold) return;

  const toSummarize = unsMessages.map((entry) => entry.message);
  if (toSummarize.length === 0) return;

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
  };
  conversationHistory.push(pendingMessage);
  const pendingIndex = conversationHistory.length - 1;

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

  const prompt = `Summarize the following message exchange content in 1-5 sentences, focusing on key events, decisions, and relationship developments. Be concise and factual.\n\n${toSummarize.map((m) => `${m.role}: ${m.content}`).join("\n\n")}`;

  try {
    const summarySystemPrompt =
      state.settings.summarySystemPrompt ||
      "You are a helpful summarization assistant.";

    const summaryResult = await callOpenRouter(
      summarySystemPrompt,
      [{ role: "user", content: prompt }],
      state.settings.model,
    );

    const summary = summaryResult.content;

    const memoryId = await db.memories.add({
      characterId: character.id,
      threadId,
      summary,
      createdAt: Date.now(),
    });

    const keepCount = Math.min(5, unsMessages.length);
    const markCount = Math.max(0, unsMessages.length - keepCount);
    for (let i = 0; i < markCount; i += 1) {
      const entry = unsMessages[i];
      const idx = entry?.idx;
      if (
        Number.isInteger(idx) &&
        conversationHistory[idx] &&
        conversationHistory[idx].summarized !== true
      ) {
        conversationHistory[idx].summarized = true;
        conversationHistory[idx].summaryId = memoryId;
      }
    }

    conversationHistory.pop();

    await persistCurrentThread();

    if (isViewing) {
      renderChat();
    }
  } catch (e) {
    const idx = conversationHistory.indexOf(pendingMessage);
    if (idx >= 0) {
      conversationHistory.splice(idx, 1);
    }
    await persistCurrentThread();
    if (isViewing) {
      renderChat();
    }
    console.warn("Memory summarization failed:", e.message);
    showToast(`Memory summarization failed: ${e.message}`, "error");
  }
}

// Expose functions globally for app.js to use
window.getMemorySummary = getMemorySummary;
window.summarizeMemory = summarizeMemory;
