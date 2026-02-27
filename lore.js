/**
 * Lore Module
 * 
 * This module handles the lorebooks feature - a collection of atemporal facts
 * that can be looked up during a chat with a bot by keywords.
 * 
 * The lore lookup is done via keyword matching, NOT via API calls to the LLM.
 * This keeps it fast and cost-effective.
 * 
 * ============================================================================
 * LOREBOOKS PIPELINE
 * ============================================================================
 * 
 * 1. CONFIGURATION (per character)
 *    - Each character has `lorebookIds` - array of selected lorebook IDs
 *    - Each lorebook has:
 *      - name: Display name
 *      - entries: Array of lore entries
 *      - scanDepth: How many recent messages to scan for keywords (default: 50)
 *      - tokenBudget: Max tokens for matched entries (default: 1024)
 *      - recursiveScanning: Enable multiple passes for cascading matches
 * 
 * 2. RETRIEVAL (getCharacterLoreEntries function)
 *    - Called in buildSystemPrompt() BEFORE EVERY completion request
 *    - Steps:
 *      a) Get character's selected lorebooks by IDs
 *      b) Scan last N messages (scanDepth) for keyword matching
 *      c) For each entry, check if keys/secondaryKeys match
 *      d) Apply token budget limit to matched entries
 *      e) Replace placeholders ({{char}}, {{user}}) in content
 * 
 * 3. KEYWORD MATCHING (doesLoreEntryMatch function)
 *    - Primary keys: At least ONE must match in recent text
 *    - Secondary keys: ALL must match (if present)
 *    - Case-insensitive substring matching
 * 
 * 4. RECURSIVE SCANNING (optional)
 *    - If enabled, runs up to 4 passes
 *    - After first pass, matched entry content is added to scan text
 *    - Allows cascading triggers (entry A mentions entry B)
 * 
 * 5. PLACEHOLDER REPLACEMENT (replaceLorePlaceholders function)
 *    - {{char}} or [[char]] -> Character name
 *    - {{user}} or [[user]] -> User/Persona name
 * 
 * 6. TOKEN BUDGET (takeLoreEntriesByTokenBudget function)
 *    - Limits total lore content to specified token budget
 *    - Prefers earlier entries (higher priority)
 *    - Rough estimate: ~4 chars per token
 * 
 * 7. PROMPT INCLUSION
 *    - Added to prompt as: "## Lore Context\n- [Lore Book Name] {content}"
 *    - Happens on EVERY request (not just when needed)
 * 
 * ============================================================================
 * DATABASE SCHEMA
 * ============================================================================
 * 
 * Table: lorebooks
 * Fields:
 *   - id (auto-increment primary key)
 *   - name (string)
 *   - entries: Array of {
 *       id: number,
 *       keys: string[],        // Primary trigger keywords
 *       secondaryKeys: string[], // Secondary keywords (all must match)
 *       content: string        // The lore content
 *     }
 *   - scanDepth: number (default: 50)
 *   - tokenBudget: number (default: 1024)
 *   - recursiveScanning: boolean (default: false)
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 *   - avatar: string (optional)
 * 
 * ============================================================================
 * USAGE
 * ============================================================================
 * 
 * This module is loaded as a regular script in index.html.
 * It exposes these global functions:
 * 
 * // Get relevant lore entries for a character based on recent chat
 * const loreEntries = await getCharacterLoreEntries(character, {
 *   historyOverride: optional custom history array,
 *   personaOverride: optional persona object
 * });
 * 
 * // Replace placeholders in lore content
 * const processed = replaceLorePlaceholders(content, personaName, charName);
 * 
 * // Check if a lore entry matches the source text
 * const matches = doesLoreEntryMatch(entry, sourceText);
 * 
 * // Apply token budget to lore entries
 * const limited = takeLoreEntriesByTokenBudget(entries, budget);
 * 
 * ============================================================================
 * KNOWN ISSUES / IMPROVEMENTS NEEDED
 * ============================================================================
 * 
 * 1. NO SEMANTIC SEARCH
 *    - Only keyword substring matching, no vector/semantic similarity
 *    - Can't find related concepts
 * 
 * 2. NO PERSISTENT CONTEXT WINDOW
 *    - Only scans last N messages each request
 *    - Doesn't accumulate "seen" state across requests
 *    - Same keywords trigger every time
 * 
 * 3. EVERY REQUEST PENALTY
 *    - Lore lookup happens on EVERY completion request
 *    - Not just when history gets long or keywords are likely present
 * 
 * 4. TOKEN ESTIMATION IS ROUGH
 *    - Uses 4 chars per token estimate
 *    - Not accurate for all content types
 * 
 * 5. RECURSIVE SCANNING CAN BE EXPENSIVE
 *    - Up to 4 passes over all entries
 *    - Could slow down prompt building
 * 
 * 6. NO SELECTIVE INJECTION
 *    - All matched lore is injected every time
 *    - Could be smarter about what to include
 * 
 * ============================================================================
 */

// Expose globally for app.js to use
window.replaceLorePlaceholders = replaceLorePlaceholders;
window.doesLoreEntryMatch = doesLoreEntryMatch;
window.takeLoreEntriesByTokenBudget = takeLoreEntriesByTokenBudget;
window.getCharacterLoreEntries = getCharacterLoreEntries;

/**
 * Replaces placeholders in lore content with actual names.
 * 
 * @param {string} text - The lore content with placeholders
 * @param {string} personaName - The user's/persona's name
 * @param {string} charName - The character's name
 * @returns {string} - Content with placeholders replaced
 */
function replaceLorePlaceholders(text, personaName, charName) {
  return String(text || "")
    .replace(/\{\{\s*user\s*\}\}/gi, personaName || "You")
    .replace(/\[\[\s*user\s*\]\]/gi, personaName || "You")
    .replace(/\{\{\s*char\s*\}\}/gi, charName || "Character")
    .replace(/\[\[\s*char\s*\]\]/gi, charName || "Character");
}

/**
 * Checks if a lore entry matches the source text based on keys.
 * 
 * Primary keys: At least ONE must be found in the text
 * Secondary keys: ALL must be found in the text (if present)
 * 
 * @param {Object} entry - Lore entry with keys and secondaryKeys
 * @param {string} sourceText - Text to search in
 * @returns {boolean} - True if entry matches
 */
function doesLoreEntryMatch(entry, sourceText) {
  const hay = String(sourceText || "").toLowerCase();
  const keys = (entry?.keys || [])
    .map((k) => String(k || "").toLowerCase())
    .filter(Boolean);
  const secondary = (entry?.secondaryKeys || [])
    .map((k) => String(k || "").toLowerCase())
    .filter(Boolean);
  
  if (keys.length === 0) return false;
  
  const primaryMatch = keys.some((k) => hay.includes(k));
  if (!primaryMatch) return false;
  
  if (secondary.length === 0) return true;
  
  return secondary.every((k) => hay.includes(k));
}

/**
 * Applies token budget limit to lore entries.
 * Estimates ~4 characters per token.
 * 
 * @param {Array} entries - Array of lore entries with content
 * @param {number} tokenBudget - Max tokens allowed
 * @returns {Array} - Entries that fit within budget
 */
function takeLoreEntriesByTokenBudget(entries, tokenBudget) {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  if (!Number.isFinite(tokenBudget) || tokenBudget <= 0) return [];
  
  const maxChars = tokenBudget * 4;
  const results = [];
  let totalChars = 0;
  
  for (const entry of entries) {
    const entryChars = String(entry.content || "").length;
    if (totalChars + entryChars > maxChars) break;
    results.push(entry);
    totalChars += entryChars;
  }
  
  return results;
}

/**
 * Retrieves relevant lore entries for a character based on recent conversation.
 * 
 * This is the main entry point - called from buildSystemPrompt() in app.js
 * before every completion request.
 * 
 * @param {Object} character - The character object (must have id, name, lorebookIds)
 * @param {Object} options - Optional configuration
 * @param {Array} options.historyOverride - Use custom history instead of conversationHistory
 * @param {Object} options.personaOverride - Use custom persona for placeholder replacement
 * @returns {Promise<Array>} - Array of {lorebookName, entryId, content}
 */
async function getCharacterLoreEntries(character, options = {}) {
  const loreIds = Array.isArray(character.lorebookIds)
    ? character.lorebookIds.map(Number).filter(Number.isInteger)
    : [];
  
  if (loreIds.length === 0) return [];
  
  const lorebooksRaw = await db.lorebooks.where("id").anyOf(loreIds).toArray();
  const lorebooks = lorebooksRaw
    .map((lb) => normalizeLorebookRecord(lb))
    .filter(Boolean);
  
  if (lorebooks.length === 0) return [];

  // Determine scan window size (how many recent messages to check)
  const scanWindow = Math.max(
    5,
    ...lorebooks.map((lb) => Math.max(5, Number(lb.scanDepth) || 50)),
  );
  
  // Get history to scan (custom or default)
  const historySource = Array.isArray(options?.historyOverride)
    ? options.historyOverride
    : conversationHistory;
  
  const recent = historySource.slice(-scanWindow);
  const baseSource = recent
    .map((m) => String(m.content || ""))
    .join("\n")
    .toLowerCase();

  // Get persona name for placeholder replacement
  const defaultPersona = await getCharacterDefaultPersona();
  const personaName =
    options?.personaOverride?.name ||
    currentPersona?.name ||
    defaultPersona?.name ||
    "You";
  const charName = character?.name || "Character";
  
  const results = [];

  // Process each lorebook
  lorebooks.forEach((lb) => {
    if (!Array.isArray(lb.entries) || lb.entries.length === 0) return;
    
    let source = baseSource;
    const matched = [];
    const matchedIds = new Set();
    const maxPasses = lb.recursiveScanning ? 4 : 1;
    
    // Recursive scanning: multiple passes to find cascading matches
    for (let pass = 0; pass < maxPasses; pass += 1) {
      let addedThisPass = 0;
      
      lb.entries.forEach((entry) => {
        if (matchedIds.has(entry.id)) return;
        if (!doesLoreEntryMatch(entry, source)) return;
        
        matched.push(entry);
        matchedIds.add(entry.id);
        addedThisPass += 1;
      });
      
      if (addedThisPass === 0) break;
      
      // Add matched content to source for next pass (recursive scanning)
      if (lb.recursiveScanning) {
        source += `\n${matched
          .slice(-addedThisPass)
          .map((e) => e.content)
          .join("\n")}`.toLowerCase();
      }
    }

    // Apply token budget
    const budgeted = takeLoreEntriesByTokenBudget(matched, lb.tokenBudget);
    
    // Add to results with processed content
    budgeted.forEach((entry) => {
      results.push({
        lorebookName: lb.name || "Lore Book",
        entryId: entry.id,
        content: replaceLorePlaceholders(entry.content, personaName, charName),
      });
    });
  });

  return results;
}

/**
 * Normalizes a lorebook record from the database.
 * Ensures all required fields have proper defaults.
 * 
 * @param {Object} record - Raw lorebook from database
 * @returns {Object|null} - Normalized lorebook or null if invalid
 */
function normalizeLorebookRecord(record) {
  if (!record || typeof record !== "object") return null;
  
  return {
    id: Number(record.id) || 0,
    name: String(record.name || "").trim() || "Untitled",
    avatar: String(record.avatar || "").trim(),
    scanDepth: Math.max(1, Number(record.scanDepth) || 50),
    tokenBudget: Math.max(0, Number(record.tokenBudget) || 1024),
    recursiveScanning: record.recursiveScanning === true,
    entries: Array.isArray(record.entries)
      ? record.entries.map(normalizeLorebookEntry).filter(Boolean)
      : [],
    createdAt: Number(record.createdAt) || Date.now(),
    updatedAt: Number(record.updatedAt) || Date.now(),
  };
}

/**
 * Normalizes a single lore entry.
 * 
 * @param {Object} entry - Raw entry from lorebook
 * @param {number} fallbackIndex - Index to use if entry has no id
 * @returns {Object|null} - Normalized entry or null
 */
function normalizeLorebookEntry(entry, fallbackIndex = 0) {
  if (!entry || typeof entry !== "object") return null;
  
  return {
    id: Number(entry.id) || fallbackIndex,
    keys: Array.isArray(entry.keys)
      ? entry.keys.map((k) => String(k || "").trim()).filter(Boolean)
      : [],
    secondaryKeys: Array.isArray(entry.secondaryKeys)
      ? entry.secondaryKeys.map((k) => String(k || "").trim()).filter(Boolean)
      : [],
    content: String(entry.content || "").trim(),
  };
}

/**
 * Gets the default persona for a character.
 * Used for placeholder replacement in lore content.
 * 
 * @returns {Promise<Object|null>}
 */
async function getCharacterDefaultPersona() {
  // This would need access to app.js's db.personas
  // For now, return null and let app.js handle it
  if (typeof db === 'undefined' || !db.personas) return null;
  
  try {
    const personas = await db.personas.toArray();
    return personas.find(p => p.isDefault) || personas[0] || null;
  } catch {
    return null;
  }
}
