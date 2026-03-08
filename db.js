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

db.version(14)
  .stores({
    characters: "++id, name",
    lorebooks: "++id, name, createdAt, updatedAt",
    memories:
      "++id, characterId, summary, createdAt, slotNumber, levelNumber",
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
      const current = tracker.get(key) || { slot: 0, level: 1 };
      let slot = Number(entry.slotNumber);
      let level = Number(entry.levelNumber);
      const hasSlot = Number.isInteger(slot) && slot > 0;
      const hasLevel = Number.isInteger(level) && level > 0;
      if (hasSlot && hasLevel) {
        tracker.set(key, { slot, level });
        continue;
      }
      slot = current.slot + 1;
      level = current.level;
      if (slot > slotLimit) {
        slot = 1;
        level += 1;
      }
      tracker.set(key, { slot, level });
      await memoryTable.update(entry.id, {
        slotNumber: slot,
        levelNumber: level,
      });
    }
  });

db.version(15)
  .stores({
    characters: "++id, name",
    lorebooks: "++id, name, createdAt, updatedAt",
    memories:
      "++id, characterId, summary, createdAt, slotNumber, levelNumber, summarySystemContent, summaryUserContent",
    sessions: "++id, characterId, messages, updatedAt",
    threads: "++id, characterId, title, updatedAt, createdAt, initialUserName",
    personas: "++id, name, isDefault, order, updatedAt",
    writingInstructions: "++id, name, createdAt, updatedAt",
    assets: "++id, name, type, createdAt, updatedAt",
  })
  .upgrade(async (tx) => {
    const memoryTable = tx.table("memories");
    await memoryTable.toCollection().modify((entry) => {
      if (!Object.prototype.hasOwnProperty.call(entry, "summarySystemContent")) {
        entry.summarySystemContent = "";
      }
      if (!Object.prototype.hasOwnProperty.call(entry, "summaryUserContent")) {
        entry.summaryUserContent = "";
      }
    });
  });

db.version(16)
  .stores({
    characters: "++id, name",
    lorebooks: "++id, name, createdAt, updatedAt",
    memories: "++id, characterId, summary, createdAt, slotNumber, levelNumber, summarySystemContent, summaryUserContent, embedding",
    sessions: "++id, characterId, messages, updatedAt",
    threads: "++id, characterId, title, updatedAt, createdAt, initialUserName",
    personas: "++id, name, isDefault, order, updatedAt",
    writingInstructions: "++id, name, createdAt, updatedAt",
    assets: "++id, name, type, createdAt, updatedAt",
  });

db.version(17)
  .stores({
    characters: "++id, name",
    lorebooks: "++id, name, createdAt, updatedAt",
    memories: "++id, characterId, summary, createdAt, slotNumber, levelNumber, summarySystemContent, summaryUserContent, embedding",
    sessions: "++id, characterId, messages, updatedAt",
    threads: "++id, characterId, title, updatedAt, createdAt, initialUserName",
    personas: "++id, name, isDefault, order, updatedAt",
    writingInstructions: "++id, name, createdAt, updatedAt",
    assets: "++id, name, type, createdAt, updatedAt",
  })
  .upgrade(async (tx) => {
    const threads = tx.table("threads");
    await threads.toCollection().modify((thread) => {
      if (!Object.prototype.hasOwnProperty.call(thread, "chatOpacity")) {
        thread.chatOpacity = null;
      }
    });
  });

db.version(18)
  .stores({
    characters: "++id, name",
    lorebooks: "++id, name, createdAt, updatedAt",
    memories: "++id, characterId, summary, createdAt, slotNumber, levelNumber, summarySystemContent, summaryUserContent, embedding",
    sessions: "++id, characterId, messages, updatedAt",
    threads: "++id, characterId, title, updatedAt, createdAt, initialUserName",
    personas: "++id, name, isDefault, order, updatedAt",
    writingInstructions: "++id, name, createdAt, updatedAt",
    assets: "++id, name, type, createdAt, updatedAt",
    themes: "id, name, isBuiltIn, createdAt",
  })
  .upgrade(async (tx) => {
    const table = tx.table("themes");
    const now = Date.now();

    // Dark theme
    await table.put({
      id: "dark",
      name: "Dark",
      nameI18n: "themeDark",
      isBuiltIn: true,
      createdAt: now,
      variables: {
        "--bg": "#0d1016",
        "--panel": "#151b24",
        "--panel-2": "#1a2230",
        "--line": "#2a3244",
        "--text": "#e8edf8",
        "--muted": "#8e9ab3",
        "--primary": "#2c7df0",
        "--primary-hover": "#3a8bff",
        "--danger": "#a64b4b",
        "--text-bright": "#ffffff",
        "--hover": "#2a3a52",
        "--chat-opacity": "1",
      },
    });

    // Light theme
    await table.put({
      id: "light",
      name: "Light",
      nameI18n: "themeLight",
      isBuiltIn: true,
      createdAt: now,
      variables: {
        "--bg": "#f5f5f5",
        "--panel": "#ffffff",
        "--panel-2": "#fafafa",
        "--line": "#d1d5db",
        "--text": "#1f2937",
        "--muted": "#6b7280",
        "--primary": "#2563eb",
        "--primary-hover": "#3b82f6",
        "--danger": "#dc2626",
        "--text-bright": "#000000",
        "--hover": "#e5e7eb",
        "--chat-opacity": "1",
      },
     });
   });
}
