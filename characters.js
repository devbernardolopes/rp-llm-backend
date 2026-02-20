// characters.js
async function loadCharacterSelect() {
  const sel = document.getElementById("character-select");
  sel.innerHTML = '<option value="">-- pick a character --</option>';
  const all = await db.characters.toArray();
  all.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });

  sel.addEventListener("change", async () => {
    const id = parseInt(sel.value);
    if (!id) return;
    currentCharacter = await db.characters.get(id);
    conversationHistory = [];

    // Load previous session if any
    const session = await db.sessions.where("characterId").equals(id).first();
    if (session) conversationHistory = session.messages;

    // Render chat history
    document.getElementById("chat-log").innerHTML = "";
    conversationHistory.forEach((m) => {
      const sender = m.role === "user" ? "You" : currentCharacter.name;
      appendMessage(sender, m.content, m.role === "user" ? "user" : "ai");
    });

    // Show first message if brand new
    if (conversationHistory.length === 0 && currentCharacter.firstMessage) {
      appendMessage(currentCharacter.name, currentCharacter.firstMessage, "ai");
    }
  });
}

async function saveCharacter() {
  const character = {
    name: document.getElementById("char-name").value.trim(),
    persona: document.getElementById("char-persona").value.trim(),
    personality: document.getElementById("char-personality").value.trim(),
    speakingStyle: document.getElementById("char-style").value.trim(),
    firstMessage: document.getElementById("char-first-msg").value.trim(),
  };
  if (!character.name) return alert("Name is required");
  await db.characters.add(character);
  closeModal();
  await loadCharacterSelect();
}

async function clearMemory() {
  if (!currentCharacter) return;
  await db.memories.where("characterId").equals(currentCharacter.id).delete();
  await db.sessions.where("characterId").equals(currentCharacter.id).delete();
  conversationHistory = [];
  document.getElementById("chat-log").innerHTML = "";
  alert("Memory and session cleared!");
}
