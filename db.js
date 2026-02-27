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
