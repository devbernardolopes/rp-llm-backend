// memory-filter.js
// Semantic memory filtering using embeddings

/**
 * Filter memory summaries to top 3 most relevant based on recent conversation.
 * Uses embedding similarity. Falls back to all if embeddings unavailable.
 */
async function filterMemoriesByRelevance(rawMemoryContext, character, threadId) {
  const K = 3;
  if (!rawMemoryContext) return null;

  // Split into individual entries
  const parts = rawMemoryContext.split('\n\n').filter(p => p.trim());
  if (parts.length <= K) return rawMemoryContext;

  // Build query from recent unsummarized messages (last ~12)
  const recent = [];
  for (let i = conversationHistory.length - 1; i >= 0 && recent.length < 12; i--) {
    const m = conversationHistory[i];
    if (!m || m.ooc === true || isPlaceholderMessage(m) || m.summarized === true) continue;
    if (m.role === 'user' || m.role === 'assistant') recent.unshift(m);
  }
  const queryText = recent.map(m => `${m.role}: ${m.content}`).join('\n');
  if (!queryText.trim()) return rawMemoryContext;

  const queryEmbedding = await getEmbedding(queryText);
  if (!queryEmbedding) return rawMemoryContext;

  // Fetch all memories for this character+thread
  const allMemories = await window.getMemoryEntries(character.id, threadId);
  if (!Array.isArray(allMemories) || allMemories.length === 0) return rawMemoryContext;

  // Determine highest level
  let highestLevel = 1;
  for (const mem of allMemories) {
    const lvl = Number(mem.levelNumber);
    if (Number.isInteger(lvl) && lvl > highestLevel) highestLevel = lvl;
  }

  // Current level memories only
  const currentLevel = allMemories.filter(m => Number(m.levelNumber) === highestLevel);

  // Map by slot-level key for matching
  const memMap = new Map();
  for (const mem of currentLevel) {
    const key = `${Number(mem.slotNumber)}-${Number(mem.levelNumber)}`;
    memMap.set(key, mem);
  }

  // Score each parsed entry
  const scored = parts.map(fullText => {
    const headerMatch = fullText.match(/\*\*ENTRY\s+(\d+).*LEVEL\s+(\d+)\*\*/i);
    if (!headerMatch) return { text: fullText, score: -1, hasEmb: false };
    const slot = parseInt(headerMatch[1], 10);
    const level = parseInt(headerMatch[2], 10);
    const key = `${slot}-${level}`;
    const mem = memMap.get(key);
    if (!mem || !mem.embedding) return { text: fullText, score: -1, hasEmb: false };
    const sim = cosineSimilarity(queryEmbedding, mem.embedding);
    return { text: fullText, score: sim, hasEmb: true };
  });

  const withEmb = scored.filter(x => x.hasEmb).sort((a,b) => b.score - a.score);
  const withoutEmb = scored.filter(x => !x.hasEmb);

  const selected = [];
  const takeFromEmb = Math.min(K, withEmb.length);
  for (let i = 0; i < takeFromEmb; i++) selected.push(withEmb[i].text);
  const remaining = K - selected.length;
  for (let i = 0; i < Math.min(remaining, withoutEmb.length); i++) {
    selected.push(withoutEmb[i].text);
  }

  return selected.length > 0 ? selected.join('\n\n') : rawMemoryContext;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Load embedding model at startup
if (window.loadEmbeddingModel) {
  window.loadEmbeddingModel().catch(() => {});
}
