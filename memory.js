// memory.js
async function getMemorySummary(characterId) {
  const entries = await db.memories
    .where("characterId")
    .equals(characterId)
    .sortBy("createdAt");
  if (entries.length === 0) return null;
  return entries.map((e) => e.summary).join("\n");
}

async function summarizeMemory(character) {
  // Take the oldest 20 messages, summarize them, store, then trim history
  const toSummarize = conversationHistory.slice(0, 20);
  const prompt = `Summarize the following roleplay conversation in 3-5 sentences, 
focusing on key events, decisions, and relationship developments. 
Be concise and factual.\n\n${toSummarize.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

  try {
    const summary = await callOpenRouter(
      "You are a helpful summarization assistant.",
      [{ role: "user", content: prompt }],
      document.getElementById("model-select").value,
    );
    await db.memories.add({
      characterId: character.id,
      summary,
      createdAt: Date.now(),
    });
    // Keep only the most recent 20 messages in active history
    conversationHistory = conversationHistory.slice(20);
  } catch (e) {
    console.warn("Memory summarization failed:", e.message);
  }
}
