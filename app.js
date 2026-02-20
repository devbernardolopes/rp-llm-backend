// app.js
let currentCharacter = null;
let conversationHistory = [];

// ── Init ──────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  await loadCharacterSelect();
  document.getElementById("user-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

// ── Send Message ──────────────────────────────────────
// ── Send Message ──────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text || !currentCharacter) return;
  input.value = "";

  appendMessage("You", text, "user");
  conversationHistory.push({ role: "user", content: text });

  const systemPrompt = await buildSystemPrompt(currentCharacter);
  const model = document.getElementById("model-select").value;

  // Create the AI bubble immediately, empty
  const aibubble = appendMessage(currentCharacter.name, "", "ai");

  try {
    document.getElementById("send-btn").disabled = true;
    const reply = await callOpenRouter(
      systemPrompt,
      conversationHistory,
      model,
      (chunk) => {
        aibubble.querySelector("span.content").textContent += chunk;
        const log = document.getElementById("chat-log");
        log.scrollTop = log.scrollHeight;
      },
    );

    conversationHistory.push({ role: "assistant", content: reply });
    await saveSession(currentCharacter.id, conversationHistory);

    if (conversationHistory.length % 20 === 0) {
      await summarizeMemory(currentCharacter);
    }
  } catch (e) {
    aibubble.querySelector("span.content").textContent = `Error: ${e.message}`;
    aibubble.classList.add("bg-red-900");
  } finally {
    document.getElementById("send-btn").disabled = false;
  }
}

// ── OpenRouter API Call (streaming) ───────────────────
async function callOpenRouter(systemPrompt, history, model, onChunk) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CONFIG.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "RP Studio",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...history],
      max_tokens: CONFIG.maxTokens,
      temperature: CONFIG.temperature,
      stream: true, // 👈 this is the key change
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || res.statusText);
  }

  // Read the stream chunk by chunk
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullReply = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Each chunk may contain multiple SSE lines
    const lines = decoder.decode(value).split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;

      try {
        const json = JSON.parse(data);
        const chunk = json.choices?.[0]?.delta?.content;
        if (chunk) {
          fullReply += chunk;
          onChunk(chunk);
        }
      } catch {
        // Malformed chunk, skip it
      }
    }
  }

  return fullReply;
}

// ── System Prompt Builder ─────────────────────────────
async function buildSystemPrompt(character) {
  const loreEntries = await getRelevantLore(conversationHistory);
  const memory = await getMemorySummary(character.id);

  return `
## Your Character
Name: ${character.name}
Persona: ${character.persona}
Personality: ${character.personality}
Speaking Style: ${character.speakingStyle}

${loreEntries.length > 0 ? `## World Lore\n${loreEntries.map((e) => `- ${e.content}`).join("\n")}` : ""}

${memory ? `## Memory (what has happened so far)\n${memory}` : ""}

## Rules
- Stay in character as ${character.name} at all times.
- Never mention you are an AI.
- Respond in 1–3 paragraphs with vivid, immersive language.
- React naturally to what the user says or does.
`.trim();
}

// ── UI Helpers ────────────────────────────────────────
function appendMessage(sender, text, cls) {
  const log = document.getElementById("chat-log");
  const div = document.createElement("div");
  const isUser = cls === "user";
  const isError = cls === "error";

  div.className = [
    "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
    isUser ? "bg-blue-900 self-end ml-auto" : "",
    isError ? "bg-red-900 self-center text-red-300" : "",
    !isUser && !isError ? "bg-violet-950 self-start" : "",
  ].join(" ");

  div.innerHTML = `
    <span class="block text-xs text-violet-400 font-semibold mb-1">${sender}</span>
    <span class="content">${text.replace(/\n/g, "<br>")}</span>
  `;

  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div; // 👈 now returns the element so sendMessage can update it
}

function showTypingIndicator() {
  const log = document.getElementById("chat-log");
  const div = document.createElement("div");
  div.id = "typing";
  div.className = "message ai typing";
  div.textContent = "...";
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function hideTypingIndicator() {
  document.getElementById("typing")?.remove();
}

function openCharacterEditor() {
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

async function saveSession(characterId, messages) {
  const existing = await db.sessions
    .where("characterId")
    .equals(characterId)
    .first();
  if (existing) {
    await db.sessions.update(existing.id, { messages, updatedAt: Date.now() });
  } else {
    await db.sessions.add({ characterId, messages, updatedAt: Date.now() });
  }
}
