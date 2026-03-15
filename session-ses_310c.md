# Auto-title generation: completions params question

**Session ID:** ses_310ccad5cfferr0Qg5yMli9Tk4
**Created:** 3/14/2026, 10:54:04 PM
**Updated:** 3/14/2026, 10:55:00 PM

---

## User

What are the parameters being used for `completions` in an auto-title generation request?

---

## Assistant (Plan · big-pickle · 6.8s)

**Tool: grep**

**Input:**
```json
{
  "pattern": "auto.?title|generateTitle"
}
```

**Output:**
```
Found 26 matches
C:\Dev\rp-llm-backend\rp-llm-backend\app.js:
  Line 857:     msgRegenerateTitle: "Regenerate message",
  Line 3027:     "#char-auto-title",
  Line 3028:     "#char-auto-title-min-messages",
  Line 4245:     "thread-autotitle-enabled",
  Line 4248:     "thread-autotitle-min-messages",
  Line 5076:     has("#thread-autotitle-enabled") ||
  Line 5077:     has("#thread-autotitle-min-messages") ||
  Line 5127:     id === "thread-autotitle-enabled" ||
  Line 5128:     id === "thread-autotitle-min-messages" ||
  Line 8728:   document.getElementById("char-auto-title").checked =
  Line 8730:   document.getElementById("char-auto-title-min-messages").value = String(
  Line 8880:     autoTitleEnabled: document.getElementById("char-auto-title").checked,
  Line 8882:       Number(document.getElementById("char-auto-title-min-messages").value) ||
  Line 14839:       t("msgRegenerateTitle"),

C:\Dev\rp-llm-backend\rp-llm-backend\index.html:
  Line 957:               <input type="checkbox" id="thread-autotitle-enabled" checked />
  Line 960:                 id="thread-autotitle-min-messages"
  Line 1934:               <input id="char-auto-title" type="checkbox" checked />
  Line 1942:               >Min. messages for auto-title</span
  Line 1945:               id="char-auto-title-min-messages"

C:\Dev\rp-llm-backend\rp-llm-backend\locales\pt-BR.json:
  Line 287:   "msgRegenerateTitle": "Regenerar mensagem",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\it.json:
  Line 287:   "msgRegenerateTitle": "Rigenera messaggio",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\de.json:
  Line 287:   "msgRegenerateTitle": "Nachricht neu generieren",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\fr.json:
  Line 287:   "msgRegenerateTitle": "Régénérer le message",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\es.json:
  Line 287:   "msgRegenerateTitle": "Regenerar mensaje",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\en.json:
  Line 256:   "autoTitleMinMessages": "Min. messages for auto-title",
  Line 287:   "msgRegenerateTitle": "Regenerate message",
```

---

## Assistant (Plan · big-pickle · 5.7s)

**Tool: grep**

**Input:**
```json
{
  "path": "C:\\Dev\\rp-llm-backend\\rp-llm-backend",
  "pattern": "generateAutoTitle|generateThreadTitle"
}
```

**Output:**
```
No files found
```

---

## Assistant (Plan · big-pickle · 4.5s)

**Tool: grep**

**Input:**
```json
{
  "path": "C:\\Dev\\rp-llm-backend\\rp-llm-backend",
  "pattern": "chat/completions|completions"
}
```

**Output:**
```
Found 13 matches
C:\Dev\rp-llm-backend\rp-llm-backend\.git\logs\HEAD:
  Line 181: 0f47c9ed1d3bdaa205256187648dd64cc3b351d7 29d583ce255c83af7f455da757bb90a6b0477359 Bernardo Lopes <65916092+devbernardolopes@users.noreply.github.com> 1772217130 -0300	commit: > Handle finish_reason: null as error in chat completions
  Line 349: bf12d6cbd1202f3d7743fb21297bf7529267b565 04fe889e53f21b00693b3dfe76c9a1b23fe98302 Bernardo Lopes <65916092+devbernardolopes@users.noreply.github.com> 1772577973 -0300	commit: fix 5 Skip placeholders in completions and summaries

C:\Dev\rp-llm-backend\rp-llm-backend\.git\logs\refs\heads\main:
  Line 181: 0f47c9ed1d3bdaa205256187648dd64cc3b351d7 29d583ce255c83af7f455da757bb90a6b0477359 Bernardo Lopes <65916092+devbernardolopes@users.noreply.github.com> 1772217130 -0300	commit: > Handle finish_reason: null as error in chat completions
  Line 342: bf12d6cbd1202f3d7743fb21297bf7529267b565 04fe889e53f21b00693b3dfe76c9a1b23fe98302 Bernardo Lopes <65916092+devbernardolopes@users.noreply.github.com> 1772577973 -0300	commit: fix 5 Skip placeholders in completions and summaries

C:\Dev\rp-llm-backend\rp-llm-backend\app.js:
  Line 20405:     return fetch("https://openrouter.ai/api/v1/chat/completions", {
  Line 20418:   const proxyUrl = "/api/chat-completions";
  Line 20448:   return fetch("https://openrouter.ai/api/v1/chat/completions", {

C:\Dev\rp-llm-backend\rp-llm-backend\index.html:
  Line 1956:                 >Include OOC messages in completions</span

C:\Dev\rp-llm-backend\rp-llm-backend\locales\pt-BR.json:
  Line 257:   "includeOocMessages": "Incluir mensagens OOC nas completions",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\it.json:
  Line 257:   "includeOocMessages": "Includi messaggi OOC nelle completions",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\en.json:
  Line 257:   "includeOocMessages": "Include OOC messages in completions",

C:\Dev\rp-llm-backend\rp-llm-backend\AGENTS.md:
  Line 10: - The main request is `completion` because it generates a BOT message (endpoint: `/api/v1/chat/completions`).

C:\Dev\rp-llm-backend\rp-llm-backend\api\chat-completions.js:
  Line 29:       "https://openrouter.ai/api/v1/chat/completions",
```

---

## Assistant (Plan · big-pickle · 4.9s)

**Tool: grep**

**Input:**
```json
{
  "path": "C:\\Dev\\rp-llm-backend\\rp-llm-backend",
  "pattern": "auto.*title|title.*generation|generateTitle"
}
```

**Output:**
```
Found 33 matches
C:\Dev\rp-llm-backend\rp-llm-backend\.git\logs\refs\heads\main:
  Line 232: 9b83463da3bb22c330c879c939736b0e8fb2be8b f6a22e522dc9f558bc492b1d51597b6e0466bb1a Bernardo Lopes <65916092+devbernardolopes@users.noreply.github.com> 1772327306 -0300	commit: Autotitle generation UI/UX.

C:\Dev\rp-llm-backend\rp-llm-backend\.git\logs\HEAD:
  Line 239: 9b83463da3bb22c330c879c939736b0e8fb2be8b f6a22e522dc9f558bc492b1d51597b6e0466bb1a Bernardo Lopes <65916092+devbernardolopes@users.noreply.github.com> 1772327306 -0300	commit: Autotitle generation UI/UX.

C:\Dev\rp-llm-backend\rp-llm-backend\app.js:
  Line 857:     msgRegenerateTitle: "Regenerate message",
  Line 2009:   if (autoReplyToggle) autoReplyToggle.title = t("autoReply");
  Line 3027:     "#char-auto-title",
  Line 3028:     "#char-auto-title-min-messages",
  Line 4245:     "thread-autotitle-enabled",
  Line 4248:     "thread-autotitle-min-messages",
  Line 5076:     has("#thread-autotitle-enabled") ||
  Line 5077:     has("#thread-autotitle-min-messages") ||
  Line 5127:     id === "thread-autotitle-enabled" ||
  Line 5128:     id === "thread-autotitle-min-messages" ||
  Line 8728:   document.getElementById("char-auto-title").checked =
  Line 8730:   document.getElementById("char-auto-title-min-messages").value = String(
  Line 8880:     autoTitleEnabled: document.getElementById("char-auto-title").checked,
  Line 8882:       Number(document.getElementById("char-auto-title-min-messages").value) ||
  Line 13979:   // Create pending message for title generation (will be used for bot reply too)
  Line 14135:     console.warn("Auto-title generation failed:", detail);
  Line 14839:       t("msgRegenerateTitle"),

C:\Dev\rp-llm-backend\rp-llm-backend\index.html:
  Line 957:               <input type="checkbox" id="thread-autotitle-enabled" checked />
  Line 960:                 id="thread-autotitle-min-messages"
  Line 1934:               <input id="char-auto-title" type="checkbox" checked />
  Line 1942:               >Min. messages for auto-title</span
  Line 1945:               id="char-auto-title-min-messages"

C:\Dev\rp-llm-backend\rp-llm-backend\locales\pt-BR.json:
  Line 287:   "msgRegenerateTitle": "Regenerar mensagem",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\it.json:
  Line 287:   "msgRegenerateTitle": "Rigenera messaggio",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\de.json:
  Line 287:   "msgRegenerateTitle": "Nachricht neu generieren",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\fr.json:
  Line 287:   "msgRegenerateTitle": "Régénérer le message",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\es.json:
  Line 287:   "msgRegenerateTitle": "Regenerar mensaje",

C:\Dev\rp-llm-backend\rp-llm-backend\locales\en.json:
  Line 255:   "autoTitleThreads": "Auto-generate thread titles",
  Line 256:   "autoTitleMinMessages": "Min. messages for auto-title",
  Line 287:   "msgRegenerateTitle": "Regenerate message",
  Line 465:    "autoTitleFailed": "Auto-title generation failed: {error}. Please retry before continuing.",
```

---

## Assistant (Plan · big-pickle · 4.3s)



Let me read around line 13979 in app.js to see the auto-title generation code:

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Dev\\rp-llm-backend\\rp-llm-backend\\app.js",
  "limit": 100,
  "offset": 13960
}
```

**Output:**
```
<path>C:\Dev\rp-llm-backend\rp-llm-backend\app.js</path>
<type>file</type>
<content>13960:       m.role === "assistant" &&
13961:       m.generationStatus === "title_generating",
13962:   );
13963:   if (existingTitleMessage) return true;
13964: 
13965:   const hasExistingPendingMessage = conversationHistory.some(
13966:     (m) =>
13967:       m.ooc !== true &&
13968:       m.role === "assistant" &&
13969:       (m.generationStatus === "generating" ||
13970:         m.generationStatus === "regenerating" ||
13971:         m.generationStatus === "queued" ||
13972:         m.generationStatus === "cooling_down"),
13973:   );
13974:   if (hasExistingPendingMessage) return true;
13975: 
13976:   // Clear the pending flag
13977:   state.pendingTitleGeneration = false;
13978: 
13979:   // Create pending message for title generation (will be used for bot reply too)
13980:   const pendingTitleMessage = {
13981:     role: "assistant",
13982:     content: "",
13983:     generationStatus: "title_generating",
13984:     createdAt: Date.now(),
13985:     finishReason: "",
13986:     nativeFinishReason: "",
13987:     truncatedByFilter: false,
13988:     generationId: "",
13989:     completionMeta: null,
13990:     generationInfo: null,
13991:     usedLoreEntries: [],
13992:     usedMemorySummary: "",
13993:     model: state.settings.model || "",
13994:     temperature: Number(state.settings.temperature) || 0,
13995:     placeholder: true,
13996:   };
13997:   conversationHistory.push(pendingTitleMessage);
13998:   if (currentThread) {
13999:     currentThread.messages = [...conversationHistory];
14000:     const msgCount = conversationHistory.length;
14001:     updateThreadMessageCount(currentThread.id, conversationHistory);
14002:   }
14003:   const pendingIndex = conversationHistory.length - 1;
14004: 
14005:   await persistCurrentThread();
14006: 
14007:   const log = document.getElementById("chat-log");
14008:   if (log && isViewingThread(currentThread.id)) {
14009:     const pendingRow = buildMessageRow(
14010:       pendingTitleMessage,
14011:       pendingIndex,
14012:       true,
14013:       displayHistory,
14014:     );
14015:     log.appendChild(pendingRow);
14016:     const pendingContent = pendingRow?.querySelector(".message-content");
14017:     if (pendingContent) {
14018:       pendingContent.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${escapeHtml(t("generatingTitleLabel") || t("generatingLabel"))}`;
14019:     }
14020:     scrollChatToBottom();
14021:   }
14022: 
14023:   setSendingState();
14024: 
14025:   const titleSlice = inSimulationHistory.slice(0, minMessages);
14026:   const transcript = titleSlice
14027:     .map((m, i) => {
14028:       const role = m.role === "assistant" ? "Assistant" : "User";
14029:       const content = String(m.content || "")
14030:         .replace(/\s+/g, " ")
14031:         .trim();
14032:       return `${i + 1}. ${role}: ${content.slice(0, 600)}`;
14033:     })
14034:     .join("\n");
14035:   const languageCode =
14036:     normalizeBotLanguageCode(
14037:       currentThread.characterLanguage ||
14038:         currentCharacter.activeLanguage ||
14039:         "en",
14040:     ) || "en";
14041: 
14042:   const titlePrompt = [
14043:     "Generate a concise roleplay thread title.",
14044:     `Generate the title in language code: ${languageCode}.`,
14045:     "Requirements:",
14046:     "- Maximum 128 characters.",
14047:     "- Plain text only.",
14048:     "- No surrounding quotes.",
14049:     "- Reflect main topic or scene from these messages.",
14050:     "",
14051:     transcript,
14052:   ].join("\n");
14053: 
14054:   try {
14055:     const result = await callOpenRouter(
14056:       "You create concise, descriptive chat thread titles.",
14057:       [{ role: "user", content: titlePrompt }],
14058:       state.settings.model,
14059:       null,

(Showing lines 13960-14059 of 21850. Use offset=14060 to continue.)
</content>
```

---

## Assistant (Plan · big-pickle · 7.0s)

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Dev\\rp-llm-backend\\rp-llm-backend\\app.js",
  "limit": 40,
  "offset": 14055
}
```

**Output:**
```
<path>C:\Dev\rp-llm-backend\rp-llm-backend\app.js</path>
<type>file</type>
<content>14055:     const result = await callOpenRouter(
14056:       "You create concise, descriptive chat thread titles.",
14057:       [{ role: "user", content: titlePrompt }],
14058:       state.settings.model,
14059:       null,
14060:       null,
14061:       { forceStream: false },
14062:     );
14063:     const raw = String(result?.content || "").trim();
14064:     if (!raw) {
14065:       conversationHistory.pop();
14066:       await persistCurrentThread();
14067:       if (isViewingThread(currentThread.id)) {
14068:         renderChat();
14069:       }
14070:       setSendingState();
14071:       return true;
14072:     }
14073:     const cleaned = raw
14074:       .replace(/^["'`]+|["'`]+$/g, "")
14075:       .replace(/\s+/g, " ")
14076:       .trim()
14077:       .slice(0, 128);
14078:     if (!cleaned) {
14079:       conversationHistory.pop();
14080:       await persistCurrentThread();
14081:       if (isViewingThread(currentThread.id)) {
14082:         renderChat();
14083:       }
14084:       setSendingState();
14085:       return true;
14086:     }
14087: 
14088:     const updatedAt = Date.now();
14089:     await db.threads.update(currentThread.id, {
14090:       title: cleaned,
14091:       titleGenerated: true,
14092:       titleManual: false,
14093:       updatedAt,
14094:     });

(Showing lines 14055-14094 of 21850. Use offset=14095 to continue.)
</content>
```

---

## Assistant (Plan · big-pickle · 6.2s)

**Tool: grep**

**Input:**
```json
{
  "path": "C:\\Dev\\rp-llm-backend\\rp-llm-backend\\app.js",
  "pattern": "async function callOpenRouter|function callOpenRouter"
}
```

**Output:**
```
Found 1 matches
C:\Dev\rp-llm-backend\rp-llm-backend\app.js:
  Line 20230: async function callOpenRouter(
```

---

## Assistant (Plan · big-pickle · 3.1s)

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Dev\\rp-llm-backend\\rp-llm-backend\\app.js",
  "limit": 80,
  "offset": 20225
}
```

**Output:**
```
<path>C:\Dev\rp-llm-backend\rp-llm-backend\app.js</path>
<type>file</type>
<content>20225:   return value
20226:     .replace(/\{\{\s*user\s*\}\}/gi, name)
20227:     .replace(/\[\[\s*user\s*\]\]/gi, name);
20228: }
20229: 
20230: async function callOpenRouter(
20231:   systemPrompt,
20232:   history,
20233:   model,
20234:   onChunk = null,
20235:   signal = null,
20236:   options = {},
20237: ) {
20238:   const resolvedModel = resolveModelForRequest(model);
20239:   const fallbackModel = getFallbackModel(resolvedModel, model);
20240:   const promptMessages = [
20241:     { role: "system", content: systemPrompt },
20242:     ...history
20243:       .filter((m) => {
20244:         // Filter out empty assistant messages
20245:         if (m.role === "assistant" && !String(m.content || "").trim()) {
20246:           return false;
20247:         }
20248:         return true;
20249:       })
20250:       .map((m) => ({
20251:         role: normalizeApiRole(m.apiRole || m.role),
20252:         content: removeImageLinksFromContent(m.content),
20253:       })),
20254:   ];
20255:   const systemMessages = promptMessages
20256:     .filter((msg) => msg.role === "system")
20257:     .map((msg) => ({
20258:       role: msg.role,
20259:       content: msg.content,
20260:     }));
20261:   const effectiveMaxTokens = computeEffectiveMaxTokensForRequest(
20262:     resolvedModel,
20263:     promptMessages,
20264:   );
20265:   const streamForced =
20266:     options && Object.prototype.hasOwnProperty.call(options, "forceStream")
20267:       ? Boolean(options.forceStream)
20268:       : null;
20269:   const isSummarization = options?.isSummarization === true;
20270:   const summaryModel = "arcee-ai/trinity-large-preview:free";
20271:   const body = {
20272:     model: isSummarization ? summaryModel : resolvedModel,
20273:     messages: promptMessages,
20274:     max_completion_tokens: effectiveMaxTokens,
20275:     temperature: isSummarization
20276:       ? 0.25
20277:       : clampTemperature(state.settings.temperature),
20278:     top_p: isSummarization ? 0.9 : Number(state.settings.topP) || 1,
20279:     frequency_penalty: isSummarization
20280:       ? 0
20281:       : Number(state.settings.frequencyPenalty) || 0,
20282:     presence_penalty: isSummarization
20283:       ? 0
20284:       : Number(state.settings.presencePenalty) || 0,
20285:     stream:
20286:       streamForced === null
20287:         ? !!state.settings.streamEnabled
20288:         : Boolean(streamForced),
20289:   };
20290: 
20291:   state.currentRequestMessages = body.messages;
20292: 
20293:   try {
20294:     const attempts = body.stream ? 1 : 3;
20295:     const response = await requestCompletionWithRetry(
20296:       body,
20297:       attempts,
20298:       onChunk,
20299:       signal,
20300:     );
20301:     return { ...response, systemMessages };
20302:   } catch (primaryErr) {
20303:     if (!fallbackModel) throw primaryErr;
20304:     const fallbackBody = { ...body, model: fallbackModel };

(Showing lines 20225-20304 of 21850. Use offset=20305 to continue.)
</content>
```

---

## Assistant (Plan · big-pickle · 13.3s)



Based on my code search, here's the answer:

## Auto-Title Generation Parameters

When generating an auto-title, `callOpenRouter` is invoked at **app.js:14055** with these parameters:

```javascript
await callOpenRouter(
  "You create concise, descriptive chat thread titles.",  // systemPrompt
  [{ role: "user", content: titlePrompt }],              // history
  state.settings.model,                                   // model
  null,                                                   // onChunk
  null,                                                   // signal
  { forceStream: false }                                 // options
);
```

### The body sent to `/api/v1/chat/completions`:

| Parameter | Value Source |
|-----------|--------------|
| `model` | `state.settings.model` (user's selected model) |
| `messages` | System message + user message with transcript |
| `max_completion_tokens` | Computed effective max tokens |
| `temperature` | `state.settings.temperature` (user setting, defaults to 0) |
| `top_p` | `state.settings.topP` (defaults to 1) |
| `frequency_penalty` | `state.settings.frequencyPenalty` (defaults to 0) |
| `presence_penalty` | `state.settings.presencePenalty` (defaults to 0) |
| `stream` | `false` (forced for auto-title) |

The title prompt itself is constructed at **app.js:14042-14052** with a 600-char slice of the conversation, limited to 128 characters in the response.

---

