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

db.version(5).stores({
  characters: "++id, name",
  lorebooks: "++id, name, createdAt, updatedAt",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
  threads: "++id, characterId, title, updatedAt, createdAt",
  personas: "++id, name, isDefault, order, updatedAt",
});

db.version(6).stores({
  characters: "++id, name",
  lorebooks: "++id, name, createdAt, updatedAt",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
  threads: "++id, characterId, title, updatedAt, createdAt",
  personas: "++id, name, isDefault, order, updatedAt",
}).upgrade(tx => {
  return tx.table("characters").toCollection().modify(char => {
    if (!char.definitions || !Array.isArray(char.definitions)) return;
    
    let mainAvatar = "";
    let mainAvatars = [];
    
    for (const def of char.definitions) {
      if (def.avatars && Array.isArray(def.avatars) && def.avatars.length > 0) {
        if (!mainAvatar && def.avatar) {
          mainAvatar = def.avatar;
          mainAvatars = [...def.avatars];
        }
        if (mainAvatar) break;
      }
    }
    
    if (mainAvatars.length > 0) {
      char.avatars = mainAvatars;
      char.avatar = mainAvatar;
    }
  });
});

db.version(7).stores({
  characters: "++id, name",
  lorebooks: "++id, name, createdAt, updatedAt",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
  threads: "++id, characterId, title, updatedAt, createdAt",
  personas: "++id, name, isDefault, order, updatedAt",
  writingInstructions: "++id, name, createdAt, updatedAt",
});

db.version(8).stores({
  characters: "++id, name",
  lorebooks: "++id, name, createdAt, updatedAt",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
  threads: "++id, characterId, title, updatedAt, createdAt, initialUserName",
  personas: "++id, name, isDefault, order, updatedAt",
  writingInstructions: "++id, name, createdAt, updatedAt",
});

db.version(11).stores({
  characters: "++id, name",
  lorebooks: "++id, name, createdAt, updatedAt",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
  threads: "++id, characterId, title, updatedAt, createdAt, initialUserName",
  personas: "++id, name, isDefault, order, updatedAt",
  writingInstructions: "++id, name, createdAt, updatedAt",
  assets: "++id, name, type, createdAt, updatedAt",
});

db.version(12)
  .stores({
    characters: "++id, name",
    lorebooks: "++id, name, createdAt, updatedAt",
    memories: "++id, characterId, summary, createdAt",
    sessions: "++id, characterId, messages, updatedAt",
    threads: "++id, characterId, title, updatedAt, createdAt, initialUserName",
    personas: "++id, name, isDefault, order, updatedAt",
    writingInstructions: "++id, name, createdAt, updatedAt",
    assets: "++id, name, type, createdAt, updatedAt",
  })
  .upgrade(async (tx) => {
    const memoryTable = tx.table("memories");
    const slotLimit = 5;
    const tracker = new Map();
    const entries = await memoryTable.orderBy("createdAt").toArray();

    for (const entry of entries) {
      const key = `${entry.characterId}:${entry.threadId ?? "null"}`;
      const prev = tracker.get(key) || { slot: 0, level: 1 };
      let nextSlot = prev.slot + 1;
      let nextLevel = prev.level;
      if (nextSlot > slotLimit) {
        nextSlot = 1;
        nextLevel += 1;
      }
      tracker.set(key, { slot: nextSlot, level: nextLevel });
      await memoryTable.update(entry.id, {
        slotNumber: nextSlot,
        levelNumber: nextLevel,
      });
    }
  });

db.version(13).stores({
  characters: "++id, name",
  lorebooks: "++id, name, createdAt, updatedAt",
  memories: "++id, characterId, summary, createdAt",
  sessions: "++id, characterId, messages, updatedAt",
  threads: "++id, characterId, title, updatedAt, createdAt, initialUserName",
  personas: "++id, name, isDefault, order, updatedAt",
  writingInstructions: "++id, name, createdAt, updatedAt",
  assets: "++id, name, type, createdAt, updatedAt",
});
