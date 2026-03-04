# New session - 2026-03-04T21:24:59.947Z

**Session ID:** ses_345429c58ffeZIbZpR5NvNIvf1
**Created:** 3/4/2026, 6:24:59 PM
**Updated:** 3/4/2026, 7:06:23 PM

---

## User

Review the comments in `memory.js` that explain and document the memory features. Since it has been changed so much from the last time these comments were written, a rewrite is required.

---

## Assistant

I'll help you review and rewrite the comments in `memory.js`. Let me first read the file to understand its current structure and what documentation needs updating.

**Tool: read**

---

## Assistant

Now let me check the database schema to ensure I understand the memory table structure correctly:

**Tool: read**

---

## Assistant

Let me also check the app.js to understand how the memory system integrates and what the actual triggers are:

**Tool: grep**

---

## Assistant

Let me also check what the actual trigger condition looks like in app.js:

**Tool: grep**

---

## Assistant

**Tool: read**

---

## Assistant

**Tool: grep**

---

## Assistant

**Tool: read**

---

## Assistant

**Tool: grep**

---

## Assistant

**Tool: read**

---

## Assistant

**Tool: grep**

---

## Assistant

---

## User

Carry on.

---

## Assistant

Let me check a few more key details to ensure the documentation is accurate:

**Tool: read**

---

## Assistant

**Tool: grep**

---

## Assistant

Based on my analysis, here's my plan to rewrite the comments in `memory.js`:

## Analysis of Current Documentation Issues

The existing header comment in `memory.js` is significantly outdated. Key discrepancies:

1. **Trigger mechanism**: Original says it triggers when `generationHistory.length % 20 === 0`, but current code uses `shouldTriggerMemorySummaries()` which checks unsummarized message count against `summaryThreshold` (default 20, but 20 is no longer hardcoded).

2. **Two trigger points**: The function is called in two places with different conditions:
   - After user sends a message (no `isViewingThread` check)
   - After bot reply generation (with `isViewingThread` check)

3. **Slot/Level system**: Not explained in the header. The memory now uses a sophisticated slot-numbering system where each character+thread combination cycles through `memorySlots` before incrementing the `levelNumber`. Only the highest level entries are used in prompts.

4. **Configuration**: Three settings exist but aren't clearly documented: `summaryThreshold`, `memorySlots`, `memoryMessagesToKeep`.

5. **Protection mechanism**: The `summaryProtected` field (which retains recent messages as working context) is not mentioned.

6. **Database schema missing fields**: The `slotNumber` and `levelNumber` fields added in db.js v14 are core to the system but not documented in the schema section.

7. **Typo**: "unslauched" should be "unsummarized"

## Proposed Rewrite

I'll completely rewrite the header comment (lines 1-73) to:
- Accurately describe the two trigger points and their conditions
- Explain the slot/level memory organization system
- Document all configuration options
- Update the database schema with all fields including slotNumber and levelNumber
- Explain the message protection/keep mechanism
- Fix typos and improve overall clarity

I'll also review and enhance inline function comments where helpful, particularly for:
- `summarizeMemory()`: explain the protection mechanism and level context inclusion
- `getMemorySummary()`: clarify that it returns the highest-level entries
- `getNextMemorySlotInfo()`: document the slot/level cycling logic

Will you like me to proceed with this rewrite?

---

## User

Yes.

---

## Assistant

Now I'll rewrite the comments in `memory.js` to accurately reflect the current implementation:

**Tool: edit**

---

## Assistant

Now I'll update the function comments to reflect the current implementation:

**Tool: edit**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: edit**

---

## Assistant

Let me verify the updated file looks correct:

**Tool: read**

---

## Assistant

**Tool: read**

---

## Assistant

**Tool: read**

---

## Assistant

**Tool: read**

---

## Assistant

Done! I've completely rewritten the comments in `memory.js` to accurately reflect the current implementation. The new documentation includes:

**Key improvements:**
- Fixed outdated trigger conditions (was "multiple of 20", now "unsummarized count >= threshold")
- Documented the **two trigger points**: after user messages and after bot replies (with viewing check)
- Added comprehensive **slots/levels system** explanation with example
- Documented all three settings: `summaryThreshold`, `memorySlots`, `memoryMessagesToKeep`
- Explained the **protected messages** mechanism (working context)
- Updated database schema with `slotNumber` and `levelNumber`
- Clarified that only **highest level** summaries are included in prompts
- Fixed typos and improved overall clarity
- Added/updated function JSDoc comments throughout

The comments now match the actual code logic in app.js and db.js.

---

## User

Now, analyze the file `AGENTS.md` and check if anything needs to be updated.

---

## Assistant

I'll read and analyze `AGENTS.md` to determine if anything needs updating based on the changes to the memory system.

**Tool: read**

---

## Assistant

After analyzing `AGENTS.md` against the current memory implementation, I found **no updates needed**.

**Why no changes are required:**

1. **Line 16** describes memory.js as: "Conversation memory: summarizes old messages to preserve context" - This remains factually accurate. The implementation became more sophisticated, but the core purpose is unchanged.

2. **Line 11 & 17** list memory.js and db.js as supporting modules - These references are still correct.

3. **Line 17** mentions "memories" as one of the database tables - This is still true (the table structure evolved but the table exists).

The AGENTS.md file is a high-level guide for AI agents, not detailed technical documentation. It doesn't specify trigger mechanisms, settings, or implementation details that would become outdated. The one-line description is appropriately brief and remains accurate.

**Recommendation:** Leave AGENTS.md as-is. If future memory changes completely alter its purpose (e.g., removing summarization entirely), then the description would need updating, but currently it's fine.

---

## User

I know when a chat has memory entries they all get injected into the system prompt every message/turn. But I also need to know if the memory entries of a chat are being queried during the chat in any other way.

---

## Assistant

Good question. Let me search the codebase to find all places where memory entries are queried or used during chat.

**Tool: grep**

---

## Assistant

Let me check the context of that second `getMemorySummary` call in app.js:

**Tool: read**

---

## Assistant

Let me see what function this code is in:

**Tool: read**

---

## Assistant

**Tool: read**

---

## Assistant

Let me check that first occurrence at line 12348:

**Tool: read**

---

## Assistant

Now let me search for any UI-related memory queries or displays:

**Tool: grep**

---

## Assistant

Let me check the delete operation more closely:

**Tool: read**

---

## Assistant

Let me search for any UI display of memory-related information:

**Tool: grep**

---

## Assistant

Based on my analysis of the codebase, here are **all** the ways memory entries are queried during chat:

## 1. Prompt Injection (on every message generation)
Memory entries are injected into system prompts in **two prompt-building functions**:

- `buildSystemPrompt()` (app.js:15680) - for regular chat completions
- `buildOocSystemPrompt()` (app.js:12348) - for out-of-character mode

Both call `getMemorySummary()` which retrieves all memory entries for the character+thread, filters to the highest level, and formats them into the prompt.

## 2. Summarization Process (when threshold is reached)
When `summarizeMemory()` triggers, it queries `db.memories` in two ways:

- `getNextMemorySlotInfo()` - retrieves all existing memories for the character+thread to determine the next `slotNumber`/`levelNumber` for the new entry
- `getMemoryEntries()` - if entering a new level (slot wraps to 1), fetches previous level summaries to include as context in the summarization prompt

## 3. Character Deletion (cleanup, not chat)
When a character is deleted, all their memories are deleted in bulk: `db.memories.where("characterId").equals(characterId).delete()` (app.js:10636)

---

**Summary:** Memory entries are actively used **during chat** in two distinct contexts:
- **Every generation**: Queried for inclusion in system prompt
- **At summarization triggers**: Queried to manage slot/level sequencing and provide continuity between memory levels

There is **no UI display** of memory counts or individual entries to the user during chat, nor are queries made for any other purpose.

---

## User

This application is a frontend for roleplaying text chat with AI BOTs/Characters. So I want to implement the most correct/efficient memory system possible for a bot in a chat. Would it make sense to have the system query the memories entries of a bot in a chat without using AI? Like, maybe, a keyword search or something so that if there is a match, the memory could be used somehow in a more smart way to feed the system prompt?

---

## Assistant

Excellent question about memory efficiency. You're asking: **should we implement non-AI keyword/search-based retrieval to selectively include only relevant memories in prompts, instead of dumping all highest-level summaries every turn?**

## Current System Analysis

Right now, the system:
- Stores memory summaries at different levels (episodic → thematic → meta)
- **Always injects ALL highest-level summaries** into every prompt
- This is simple but potentially wasteful:
  - Old, irrelevant memories consume token budget
  - User may have 50+ memory entries for a long-running character
  - Costs increase linearly with memory accumulation

## Potential Approaches

### 1. Keyword/Text Matching (simple BM25, substring search)
- Scan memory summaries for keyword overlap with recent conversation
- Include only matching memories in prompt
- **Pros:** Fast, deterministic, no AI cost, reduces token usage
- **Cons:** Brittle (synonyms, paraphrasing fail), may miss context, false negatives

### 2. Vector Embeddings + Semantic Search
- Generate embeddings for each memory summary (using local model or API)
- On each turn, embed recent messages/context, find top-K similar memories
- **Pros:** Captures semantic relevance, robust to wording variations
- **Cons:** Embedding generation cost, storage complexity, added dependencies

### 3. Hybrid: Keyword + Recency + Importance
- Combine signals: keyword matches, time decay, slot/level (newer = more important)
- Simple scoring function to rank memories, take top-N
- **Pros:** Lightweight, no ML needed, balances relevance and importance
- **Cons:** Heuristic, may need tuning

### 4. AI-Based Retrieval (expensive but accurate)
- Periodically ask AI to rate relevance of memories to recent context
- Store relevance scores, use them for filtering
- **Cons:** High cost, complexity, not truly "non-AI"

## Key Questions for You

1. **What's your primary goal?**
   - Save tokens/cost? (then any filtering helps)
   - Improve relevance? (need semantic search)
   - Both?

2. **What's your expected usage pattern?**
   - Short chats (few hours, <1000 messages) → maybe no filtering needed
   - Months-long persistent characters → likely need filtering

3. **How many memory entries do you expect per character?**
   - Default: 5 slots × ~4 levels = 20 summaries max
   - But without threading or cleanup, long-lived threads could accumulate many

4. **Implementation constraints?**
   - Want to avoid external dependencies/libraries?
   - Willing to add embedding model (e.g., Transformers.js) or use API?
   - Concerned about UI complexity (settings for thresholds, etc)?

## Recommendations Based on Your Context

Given this is a **vanilla JS frontend** with no build steps:

- **Quick win:** Implement a simple **keyword overlap + recency** filter. It's ~20 lines of code, no dependencies, and will reduce token usage for most chats where old topics don't resurface.
- **Advanced:** If you want semantic search and are okay with an API call, you could use OpenRouter's embedding models to generate embeddings and store vectors. But this adds cost and complexity.
- **Alternative:** Could also implement **level-based expiration**—only use memories from the last N levels (e.g., last 3 levels). This is ultra-simple and already partially happens (highest level only), but if you skip levels due to slot wrapping, you lose intermediate memories entirely.

**Important nuance:** Your current system uses only the **highest level** entries. If you have 5 slots and a long chat, after 25 messages you get level 2, after 50 messages level 3, etc. By level 5, you're using only the last 25 messages worth of summaries, not all historical ones. So the system is already somewhat discarding old memories automatically through level progression. The question is whether *within* a level, you should filter further.

Would you like me to sketch out a specific implementation plan based on your goals?

---

## User

Before I answer your questions, let me add that whenever a memory level happens, the memory entries of the previous level are NOT being sent anymore to the system prompt. When the leval changes happens in a summarization event, the summarization instruction also includes the directive for the AI to consider the previous level memories entries. Thus, only the memory entries of the current level are always being sent in the system prompt. Now, some answers: 1 = both, that is, save tokens/cost (no API/AI calls), and improve relevance. 2 = <1000 msgs. 3 = as I have just said, currently the injected mem entries are for the current level only, but if they wouldn't be injected into the prompt, then I don't need to limit the entries for character. 4 = we can use any external lib. I would VERY MUCH PREFER to use embedding models (this would be perfect), no concerns about UI complexity.

---

## Assistant

Thank you for that crucial clarification. So the system already elegantly phases out old levels—only the **current level** (most recent memory cycle) is actively injected. That means memory filtering is only relevant for **within the current level**, which could have up to `memorySlots` entries (default 5, configurable 3-10). That's a very manageable number.

Given your goals and constraints, here's my analysis:

## Current Memory Scale within a Level
- Max entries per level: 3-10 (configurable `memorySlots`)
- Typical: 5 entries
- Each entry is a summary of a batch of messages (up to `summaryThreshold` old messages, minus `memoryMessagesToKeep` protected ones)
- So within a level, you have at most ~5 summary paragraphs competing for token space

## Why Embedding-Based Filtering Makes Sense

**Token savings:** If each summary is ~200 tokens and you have 5, that's 1000 tokens per turn. If 2-3 are irrelevant, you save 400-600 tokens (~$0.002-0.003/turn on GPT-4o, negligible but adds up). More importantly, **relevance improves** because you remove noise.

**Embedding approach:**
- Generate embeddings for each memory summary when it's created (store in DB as vector)
- On each turn, embed the recent conversation context (maybe last 5-10 unsummarized messages + current character system prompt)
- Find top-K (e.g., 3) most similar memory summaries from current level
- Inject only those into system prompt

**Benefits:**
- Local only: Use Transformers.js with a small embedding model (e.g., `Xenova/all-MiniLM-L6-v2` ~80MB)
- Fast enough for 5-10 vectors (cosine similarity is trivial)
- Truly semantic—catches paraphrasing, synonyms

**Implementation locations:**
- Where memory summaries are stored: add `embedding` field (array of floats)
- Where system prompt is built: filter before injection

**Questions for you:**

1. **How many memories per level do you expect to be active?** With `summaryThreshold=20` and `memoryMessagesToKeep=3`, each summarization consumes 17 old messages. With `memorySlots=5`, you'd have 5 summaries covering ~85 messages, but each summary is condensed.

2. **What's your typical token budget?** How long are your system prompts before memory injection? This helps determine if 5 summaries is too much anyway.

3. **Do you want to keep all current-level summaries in the prompt sometimes?** Or always filter to top-K? What if K=3 but you only have 2 memories? Then include both. Should there be a minimum threshold (e.g., only filter if >3 memories)?

4. **Model choice:** Transformers.js works in browser but initial model load is ~80MB. Acceptable? Would you prefer a smaller model or even a simple TF-IDF keyword approach as fallback?

5. **Query composition:** What should be embedded to query against memories?
   - Just the latest user message?
   - Last N messages?
   - Entire current conversation history (minus summarized)?
   - Include the character's system prompt in the query?

6. **Storage:** Embeddings will be large (~384-768 dimensions per summary × 5 × ~100 characters). That's maybe 5KB total per level. Acceptable in IndexedDB? We'd store `[float32]` arrays.

7. **When to generate embeddings:** At summarization time (when summary is created) is most efficient. But what about existing memories? Would you want a migration to backfill embeddings for old summaries, or start fresh only for new ones?

Once you answer these, I can produce a detailed implementation plan you can review before any code changes.

---

