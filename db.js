// db.js
const db = new Dexie("rp-llm-backend-db");

db.version(1).stores({
  characters: "++id, name", // your cast of characters
  lorebooks: "++id, name, tags", // lore entries, filterable by tag
  memories: "++id, characterId, summary, createdAt", // per-character memory
  sessions: "++id, characterId, messages, updatedAt", // chat history
});
