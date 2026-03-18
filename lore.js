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
 *      c) For each entry, check if keys/secondaryKeys match (based on matching mode)
 *      d) Apply token budget limit to matched entries
 *      e) Replace placeholders ({{char}}, {{user}}) in content
 * 
 * 3. KEYWORD MATCHING MODES
 * 
 *    Option A - Keyword (default):
 *    - Primary keys: At least ONE must match in recent text (word boundary)
 *    - Secondary keys: ALL must match (if present)
 *    - Negative keys: If ANY match, entry is excluded
 *    - Proximity bonus: Primary and secondary keys near each other = higher score
 * 
 *    Option B - Semantic:
 *    - Keywords must match (same as Option A)
 *    - Additional semantic similarity check using embeddings
 *    - Entry only matches if similarity >= threshold
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
 *       negativeKeys: string[], // Keywords that exclude entry if found
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
 * SETTINGS
 * ============================================================================
 * 
 * loreMatchingMode: "keyword" | "semantic" (default: "keyword")
 * loreSemanticThreshold: number 0.0-1.0 (default: 0.5)
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
 */

// Expose globally for app.js to use
window.replaceLorePlaceholders = replaceLorePlaceholders;
window.doesLoreEntryMatch = doesLoreEntryMatch;
window.takeLoreEntriesByTokenBudget = takeLoreEntriesByTokenBudget;
window.getCharacterLoreEntries = getCharacterLoreEntries;
window.updateLoreState = updateLoreState;

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
 * Escapes special regex characters in a string.
 * 
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Finds all positions of a substring in text.
 * 
 * @param {string} text - Text to search in
 * @param {string} sub - Substring to find
 * @returns {number[]} - Array of positions
 */
function findAllPositions(text, sub) {
  const positions = [];
  let pos = 0;
  const lowerText = text.toLowerCase();
  const lowerSub = sub.toLowerCase();
  while ((pos = lowerText.indexOf(lowerSub, pos)) !== -1) {
    positions.push(pos);
    pos += 1;
  }
  return positions;
}

/**
 * Checks if a key matches at a word boundary in the text.
 * Uses regex with \b for word boundaries.
 * 
 * @param {string} key - Keyword to match
 * @param {string} text - Text to search in
 * @returns {boolean} - True if key matches at word boundary
 */
function keyMatchesAtWordBoundary(key, text) {
  if (!key || !text) return false;
  const escaped = escapeRegex(key);
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  return regex.test(text);
}

/**
 * Checks if any negative key matches in the text.
 * Uses word boundary matching.
 * 
 * @param {string[]} negativeKeys - Array of negative keywords
 * @param {string} text - Text to search in
 * @returns {boolean} - True if any negative key matches
 */
function anyNegativeKeyMatches(negativeKeys, text) {
  if (!Array.isArray(negativeKeys) || negativeKeys.length === 0) return false;
  return negativeKeys.some((k) => k && keyMatchesAtWordBoundary(k, text));
}

/**
 * Calculates proximity score based on distance between primary and secondary keys.
 * Returns a bonus score (0-1) based on how close the keys are.
 * Closer keys = higher score.
 * 
 * @param {string[]} keys - Primary keys
 * @param {string[]} secondaryKeys - Secondary keys
 * @param {string} text - Text to search in
 * @returns {number} - Proximity bonus (0 to 1)
 */
function calculateProximityScore(keys, secondaryKeys, text) {
  if (!Array.isArray(keys) || keys.length === 0) return 0;
  if (!Array.isArray(secondaryKeys) || secondaryKeys.length === 0) return 0;
  
  const lowerText = text.toLowerCase();
  
  let minDistance = Infinity;
  
  for (const primary of keys) {
    if (!primary) continue;
    const primaryPos = findAllPositions(lowerText, primary);
    if (primaryPos.length === 0) continue;
    
    for (const secondary of secondaryKeys) {
      if (!secondary) continue;
      const secondaryPos = findAllPositions(lowerText, secondary);
      
      for (const pp of primaryPos) {
        for (const sp of secondaryPos) {
          const distance = Math.abs(pp - sp);
          if (distance < minDistance) {
            minDistance = distance;
          }
        }
      }
    }
  }
  
  if (minDistance === Infinity) return 0;
  
  const maxWindow = 200;
  const score = Math.max(0, 1 - (minDistance / maxWindow));
  return score;
}

/**
 * Checks if a lore entry matches the source text based on keys.
 * 
 * Option A - Keyword Matching:
 * - Primary keys: At least ONE must match (word boundary)
 * - Secondary keys: ALL must match (if present)
 * - Negative keys: If ANY match, entry is excluded
 * - Proximity bonus: Returns score 0-1 based on key proximity
 * 
 * @param {Object} entry - Lore entry with keys, secondaryKeys, negativeKeys
 * @param {string} sourceText - Text to search in
 * @returns {Object} - { matches: boolean, score: number }
 */
function doesLoreEntryMatch(entry, sourceText) {
  const hay = String(sourceText || "").toLowerCase();
  const keys = (entry?.keys || [])
    .map((k) => String(k || "").toLowerCase())
    .filter(Boolean);
  const secondary = (entry?.secondaryKeys || [])
    .map((k) => String(k || "").toLowerCase())
    .filter(Boolean);
  const negative = (entry?.negativeKeys || [])
    .map((k) => String(k || "").toLowerCase())
    .filter(Boolean);
  
  if (keys.length === 0) return { matches: false, score: 0 };
  
  const primaryMatch = keys.some((k) => keyMatchesAtWordBoundary(k, hay));
  if (!primaryMatch) return { matches: false, score: 0 };
  
  if (anyNegativeKeyMatches(negative, hay)) {
    return { matches: false, score: 0 };
  }
  
  if (secondary.length > 0) {
    const secondaryMatch = secondary.every((k) => keyMatchesAtWordBoundary(k, hay));
    if (!secondaryMatch) return { matches: false, score: 0 };
  }
  
  const proximityScore = calculateProximityScore(keys, secondary, hay);
  const score = 0.5 + (proximityScore * 0.5);
  
  return { matches: true, score };
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

let loreEmbeddingCache = new Map();

function getLoreEntryKeyText(entry) {
  const keys = entry?.keys || [];
  const secondary = entry?.secondaryKeys || [];
  const allKeys = [...keys, ...secondary].filter(Boolean);
  return allKeys.join(" ");
}

/**
 * Calculates cosine similarity between two embedding vectors.
 * 
 * @param {number[]} a - First embedding vector
 * @param {number[]} b - Second embedding vector
 * @returns {number} - Similarity score (-1 to 1)
 */
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i += 1) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

/**
 * Checks if entry passes semantic similarity threshold.
 * Compares entry keywords against conversation context.
 * 
 * @param {Object} entry - Lore entry with keys
 * @param {string} contextText - Conversation context
 * @param {number} threshold - Similarity threshold (0-1)
 * @returns {Promise<boolean>} - True if similarity >= threshold
 */
async function doesLoreEntryMatchSemantically(entry, contextText, threshold) {
  if (threshold <= 0) return true;
  if (threshold >= 1) return false;
  
  const keyText = getLoreEntryKeyText(entry);
  if (!keyText.trim()) return false;
  
  const cacheKey = `context:${contextText.slice(0, 100)}`;
  let contextEmbedding = loreEmbeddingCache.get(cacheKey);
  
  if (!contextEmbedding) {
    contextEmbedding = await window.getEmbedding(contextText);
    if (!contextEmbedding) return true;
    loreEmbeddingCache.set(cacheKey, contextEmbedding);
    
    if (loreEmbeddingCache.size > 10) {
      const firstKey = loreEmbeddingCache.keys().next().value;
      loreEmbeddingCache.delete(firstKey);
    }
  }
  
  let keyEmbedding = loreEmbeddingCache.get(`key:${keyText}`);
  if (!keyEmbedding) {
    keyEmbedding = await window.getEmbedding(keyText);
    if (!keyEmbedding) return true;
    loreEmbeddingCache.set(`key:${keyText}`, keyEmbedding);
  }
  
  const similarity = cosineSimilarity(contextEmbedding, keyEmbedding);
  return similarity >= threshold;
}

/**
 * Clears the lore embedding cache.
 */
function clearLoreEmbeddingCache() {
  loreEmbeddingCache.clear();
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
 * @param {Object} options.thread - Thread object with loreState for tracking injected entries
 * @returns {Promise<{entries: Array, newLoreState: Object}>} - entries + new state to persist
 */
async function getCharacterLoreEntries(character, options = {}) {
  const loreIds = Array.isArray(character.lorebookIds)
    ? character.lorebookIds.map(Number).filter(Number.isInteger)
    : [];
  
  if (loreIds.length === 0) return { entries: [], newLoreState: null };
  
  const lorebooksRaw = await db.lorebooks.where("id").anyOf(loreIds).toArray();
  const lorebooks = lorebooksRaw
    .map((lb) => normalizeLorebookRecord(lb))
    .filter(Boolean);
  
  if (lorebooks.length === 0) return { entries: [], newLoreState: null };

  const thread = options?.thread;
  const loreState = thread?.loreState || {};
  const cooldown = Math.max(0, Number(character.loreCooldown) || 20);
  const currentMessageIndex = Array.isArray(options?.historyOverride)
    ? options.historyOverride.length
    : (conversationHistory?.length || 0);

  const matchingMode = (typeof state !== 'undefined' && state.settings?.loreMatchingMode) 
    ? state.settings.loreMatchingMode 
    : 'keyword';
  const semanticThreshold = (typeof state !== 'undefined' && typeof state.settings?.loreSemanticThreshold === 'number')
    ? state.settings.loreSemanticThreshold
    : 0.5;
  
  const useSemantic = matchingMode === 'semantic';
  let semanticReady = false;
  
  if (useSemantic) {
    if (!window.memoryEmbeddingReady) {
      await window.loadEmbeddingModel();
    }
    semanticReady = window.memoryEmbeddingReady;
  }

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
  const newLoreState = {};

  // Process each lorebook
  for (const lb of lorebooks) {
    if (!Array.isArray(lb.entries) || lb.entries.length === 0) continue;
    
    const lorebookState = loreState[String(lb.id)] || {};
    const injectionMode = lb.injectionMode || "cooldown";
    const suppressionWindow = Math.max(1, lb.suppressionWindow || 10);
    let source = baseSource;
    const matched = [];
    const matchedIds = new Set();
    const maxPasses = lb.recursiveScanning ? 4 : 1;
    
    // First pass: determine which entries have keyword matches
    const keywordMatchesThisCall = new Set();
    
    // Recursive scanning: multiple passes to find cascading matches
    for (let pass = 0; pass < maxPasses; pass += 1) {
      let addedThisPass = 0;
      
      for (const entry of lb.entries) {
        if (matchedIds.has(entry.id)) continue;
        if (keywordMatchesThisCall.has(entry.id)) continue;
        
        const keywordResult = doesLoreEntryMatch(entry, source);
        if (!keywordResult.matches) continue;
        
        if (useSemantic && semanticReady) {
          const semanticMatch = await doesLoreEntryMatchSemantically(
            entry,
            source,
            semanticThreshold
          );
          if (!semanticMatch) continue;
        }
        
        // Keywords matched this call
        keywordMatchesThisCall.add(entry.id);
        
        const entryKey = String(entry.id);
        const entryState = lorebookState[entryKey];
        
        let shouldInject = false;
        
        if (injectionMode === "cooldown") {
          // Original cooldown logic
          const lastInjectedAt = typeof entryState === "number" ? entryState : (entryState?.injectedAt);
          shouldInject = !Number.isFinite(lastInjectedAt) || 
            (currentMessageIndex - lastInjectedAt) >= cooldown;
        } else if (injectionMode === "once_per_context") {
          // Once per context logic
          if (!entryState || !Number.isFinite(entryState.injectedAt)) {
            // Never injected: inject
            shouldInject = true;
          } else if (entryState.suppressedAt == null) {
            // Injected, not suppressed
            // Keywords matched this call: skip (already in context)
            // Keywords absent for >= suppressionWindow: inject again
            const messagesSinceInjection = currentMessageIndex - entryState.injectedAt;
            if (messagesSinceInjection >= suppressionWindow) {
              shouldInject = true;
            }
            // else: keywords matched but still in context, shouldInject = false
          } else {
            // Injected and currently suppressed
            // Keywords matched this call: unsuppress and inject
            // Keywords absent: stay suppressed
            shouldInject = true;
          }
        }
        
        if (shouldInject) {
          matched.push(entry);
          matchedIds.add(entry.id);
          addedThisPass += 1;
          
          // Update lore state
          const newEntryState = {
            injectedAt: currentMessageIndex,
            suppressedAt: injectionMode === "once_per_context" ? null : (entryState?.suppressedAt ?? null),
            lastKeywordMatchAt: currentMessageIndex
          };
          newLoreState[String(lb.id)] = {
            ...(newLoreState[String(lb.id)] || {}),
            [entryKey]: newEntryState,
          };
        } else if (injectionMode === "once_per_context" && entryState) {
          // Track suppression: if keywords not matched and entry was injected
          let suppressedAt = entryState.suppressedAt;
          
          if (!keywordMatchesThisCall.has(entry.id)) {
            // Keywords absent
            if (suppressedAt == null) {
              // Start suppression window
              suppressedAt = currentMessageIndex;
            } else if ((currentMessageIndex - suppressedAt) >= suppressionWindow) {
              // Suppression window elapsed, entry can be injected again
              // Remove suppressedAt so it will be injected on next keyword match
              suppressedAt = null;
            }
          } else {
            // Keywords matched, unsuppress
            suppressedAt = null;
          }
          
          // Only update if state changed
          if (suppressedAt !== entryState.suppressedAt) {
            newLoreState[String(lb.id)] = {
              ...(newLoreState[String(lb.id)] || {}),
              [entryKey]: {
                ...entryState,
                suppressedAt,
                lastKeywordMatchAt: keywordMatchesThisCall.has(entry.id) ? currentMessageIndex : entryState.lastKeywordMatchAt
              },
            };
          }
        }
      };
      
      if (addedThisPass === 0 && pass === 0) break;
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
  }

  return { entries: results, newLoreState };
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
    injectionMode: record.injectionMode === "once_per_context" ? "once_per_context" : "cooldown",
    suppressionWindow: Math.max(1, Number(record.suppressionWindow) || 10),
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
    negativeKeys: Array.isArray(entry.negativeKeys)
      ? entry.negativeKeys.map((k) => String(k || "").trim()).filter(Boolean)
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

/**
 * Updates the lore state for a thread after completion.
 * Merges new lore state with existing state.
 * 
 * @param {number} threadId - The thread ID
 * @param {Object} newLoreState - New lore state to merge
 * @returns {Promise<void>}
 */
async function updateLoreState(threadId, newLoreState) {
  if (!Number.isFinite(threadId) || !newLoreState || typeof newLoreState !== 'object') return;
  
  try {
    const thread = await db.threads.get(Number(threadId));
    if (!thread) return;
    
    const currentState = thread.loreState || {};
    const mergedState = { ...currentState };
    
    for (const [lorebookId, entries] of Object.entries(newLoreState)) {
      mergedState[lorebookId] = {
        ...(mergedState[lorebookId] || {}),
        ...entries,
      };
    }
    
    await db.threads.update(Number(threadId), { loreState: mergedState });
  } catch (err) {
    console.warn('Failed to update lore state:', err);
  }
}
