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
 *    - Takes the oldest 20 messages from conversationHistory (global)
 *    - Sends them to AI with a summarization prompt
 *    - Stores the summary in db.memories table
 *    - TRUNCATES conversationHistory to remove those 20 messages
 *    - Persists the trimmed history
 * 
 * 3. RETRIEVAL (getMemorySummary function below)
 *    - Called in buildSystemPrompt() before each completion request
 *    - Fetches all stored summaries for the character from db.memories
 *    - If character has memory disabled, returns null
 * 
 * 4. PROMPT INCLUSION (in app.js: buildSystemPrompt)
 *    - If memory exists, it's added to the prompt as:
 *      "## Memory Context\n{memory}"
 *    - This happens on EVERY request, not just when needed
 * 
 * ============================================================================
 * KNOWN ISSUES / IMPROVEMENTS NEEDED
 * ============================================================================
 * 
 * 1. NO AGING MECHANISM
 *    - Memory summaries accumulate forever with no pruning
 *    - Old summaries remain even when no longer relevant
 * 
 * 2. NO SIZE LIMITS
 *    - All summaries are joined with newlines on every request
 *    - Prompt can grow extremely large over time
 *    - No token budget or max memory size enforcement
 * 
 * 3. EVERY REQUEST PENALTY
 *    - Memory is included in EVERY completion request
 *    - Not just when the history gets long
 *    - Increases latency and token usage unnecessarily
 * 
 * 4. SUMMARIZATION THRESHOLD
 *    - Hard-coded to trigger every 20 messages
 *    - Not configurable per character
 *    - 20 may be too aggressive or too conservative
 * 
 * 5. NO SELECTIVE SUMMARIZATION
 *    - Always summarizes oldest 20
 *    - Could be smarter about what to summarize
 *    - Could keep recent messages intact
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
 * ============================================================================
 * USAGE
 * ============================================================================
 * 
 * This module is loaded as a regular script in index.html.
 * It exposes two global functions:
 * 
 * // Get all memory summaries for a character
 * const memory = await getMemorySummary(characterId);
 * 
 * // Trigger memory summarization (called automatically in app.js)
 * await summarizeMemory(character);
 * 
 * ============================================================================
 */

/**
 * Retrieves all memory summaries for a character from the database.
 * 
 * @param {number} characterId - The ID of the character
 * @returns {Promise<string|null>} - All summaries joined with newlines, or null if none exist
 */
async function getMemorySummary(characterId) {
  const entries = await db.memories
    .where("characterId")
    .equals(characterId)
    .sortBy("createdAt");
  
  if (entries.length === 0) return null;
  
  return entries.map((e) => e.summary).join("\n");
}

/**
 * Summarizes the oldest 20 messages in the conversation history and stores
 * the summary in the database. Then truncates the conversation history.
 * 
 * This function is called automatically after every 20th bot message when
 * the character has memory enabled.
 * 
 * @param {Object} character - The character object (must have id property)
 * @returns {Promise<void>}
 */
async function summarizeMemory(character) {
  // Skip if memory is disabled for this character
  if (character.useMemory === false) return;

  // Get the oldest 20 messages to summarize
  const toSummarize = conversationHistory.slice(0, 20);
  
  if (toSummarize.length === 0) return;

  // Build the summarization prompt
  const prompt = `Summarize the following roleplay conversation in 3-5 sentences, 
focusing on key events, decisions, and relationship developments.
Be concise and factual.\n\n${toSummarize.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

  try {
    // Use the summary system prompt from settings, or default
    const summarySystemPrompt = state.settings.summarySystemPrompt 
      || "You are a helpful summarization assistant.";
    
    const summaryResult = await callOpenRouter(
      summarySystemPrompt,
      [{ role: "user", content: prompt }],
      state.settings.model
    );
    
    const summary = summaryResult.content;
    
    // Store the summary in the database
    await db.memories.add({
      characterId: character.id,
      summary,
      createdAt: Date.now(),
    });

    // TRUNCATE: Keep only the most recent messages (remove the 20 we just summarized)
    conversationHistory = conversationHistory.slice(20);
    
    // Persist the trimmed conversation history
    await persistCurrentThread();
    
    // Re-render the chat to reflect the changes
    renderChat();
    
  } catch (e) {
    console.warn("Memory summarization failed:", e.message);
  }
}

// Expose functions globally for app.js to use
window.getMemorySummary = getMemorySummary;
window.summarizeMemory = summarizeMemory;
