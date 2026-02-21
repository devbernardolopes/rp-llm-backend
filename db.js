// db.js
const db = new Dexie("rp-llm-backend-db");

db.version(1).stores({
  characters: "++id, name",
  lorebooks: "++id, name, tags",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
});

db.version(2).stores({
  characters: "++id, name",
  lorebooks: "++id, name, tags",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
  threads: "++id, characterId, title, updatedAt, createdAt",
});

db.version(3).stores({
  characters: "++id, name",
  lorebooks: "++id, name, tags",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
  threads: "++id, characterId, title, updatedAt, createdAt",
  personas: "++id, name, updatedAt",
});

db.version(4).stores({
  characters: "++id, name",
  lorebooks: "++id, name, tags",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
  threads: "++id, characterId, title, updatedAt, createdAt",
  personas: "++id, name, isDefault, order, updatedAt",
});
