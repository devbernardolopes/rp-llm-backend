# AGENTS.md

## Project Context

- This is an AI chat system that is STILL being built using vanilla JavaScript + HTML + CSS (with some Tailwind CSS). It is an on-going project.
- It uses local storage with Dexie.js.
- It allows users to create characters/scenarios (referred as BOTS) and chat with them, thus creating threads.
- It connects to AI models via OpenRouter, AI Horde, LM Studio, or Groq with the use of an API Key.
- It makes requests via OpenAI-compatible format (OpenRouter, LM Studio, AI Horde Proxy) or custom API (AI Horde, LM Studio native).
- The main request is `completion` because it generates a BOT message (endpoint: `/api/v1/chat/completions`).
- The main file is `index.html` and `app.js`, with supporting modules.

### Module Files

- `app.js` - Main application logic (~23,400 lines)
- `constants.js` - Static constants (model options, icons, language options, etc.)
- `themes.js` - Theme management (applyThemeVars, getThemeById, seedAdditionalThemes, etc.)
- `i18n.js` - Internationalization (t(), tf(), loadLocaleBundle, applyInterfaceLanguage, etc.)
- `ui-utils.js` - UI utility functions (avatar handling, text input, color normalization, etc.)
- `tts-preprocess.js` - TTS text preprocessing (preprocessForTTS, normalizeNumbersForTTS, chunkForTTS, etc.)
- `lore.js` - Lorebooks: keyword-based fact lookup during chat
- `memory.js` - Conversation memory: summarizes old messages to preserve context
- `db.js` - Database schema using Dexie.js (characters, threads, lorebooks, memories, personas, sessions)
- `sfx.js` - SFX (Sound Effects) management: trigger engine, playback, overlay handling
- `tts/kokoro.js` - TTS functions using Kokoro.js for text-to-speech
- `tts/kokoro-worker.js` - Web worker for TTS processing
- `tts/engine.js` - TTS engine abstraction layer
- `tts/ui.js` - TTS UI controls
- `tts/index.js` - TTS module entry point (ES module)
- `stt/whisper.js` - Speech-to-text using Whisper
- `stt/whisper-worker.js` - Web worker for STT processing
- `embeddings.js` - Text embeddings using transformers
- `summarizer/summarizer.js` - Text summarization
- `summarizer/summarizer-worker.js` - Web worker for summarization
- `memory-filter.js` - Memory relevance filtering
- `config.js` - Application configuration
- `three-vrm-loader.js` - 3D VRM model loader using Three.js
- `api/chat-completions.js` - Chat completions API handler
- `api/horde-text.js` - AI Horde API integration

### Script Loading Order (in index.html)

```plaintext
dexie.js → markdown-it.js → embeddings.js → summarizer/summarizer.js → config.js → db.js → constants.js → themes.js → i18n.js → ui-utils.js → tts-preprocess.js → memory.js → app.js → sfx.js → lore.js → memory-filter.js → stt/whisper.js → tts/kokoro.js → tts/index.js (module) → three-vrm-loader.js (module)
```

### UI Features

- The UI supports multiple languages as JSON files at `/locales`.
- New text in UI must have a respective JSON entry **appended** at the end of every `/locales` file, translated respectively.
- The home screen shows BOT cards with filtering, sorting, pagination, and tag chips.
- The left panel shows thread cards in the middle (when there are threads), system options in the bottom (buttons), and some main buttons at the top.
- The `<div>` with id = `character-modal` is the interface/UI that allows users to create and edit BOT definitions (may be referred to as "BOT modal").
- The `<section>` with id = `chat-view` is the window/screen that allows users to chat with a BOT (may be referred to as "chat or thread window/screen").
- **3D Model Panel**: A resizable panel displaying VRM 3D avatars with expression controls.
- **Tags System**: Character tagging and filtering.
- **Assets Management**: Media/file management modal.
- **Database Management**: Database export/import.
- **Guide System**: Onboarding help.

## Agent Instructions

### Locale / i18n

- New UI strings must have a corresponding entry appended to the end of every `/locales` JSON file.
- Entries must be translated respectively, not left in English across all files.

### Development

- No build steps or tests required.
- When creating new modules, add them to the script loading order in `index.html` in the correct dependency order.
- Use ES modules (`type="module"`) for new code that needs module support.

### HTML Snippet Modularization

Modals and complex UI sections are organized into snippet files in `/snippets/` folder for better maintainability. Snippets are loaded on first modal open and cached in memory.

**Adding a new modal with snippets:**

1. **Create snippet files** in `/snippets/` (e.g., `snippets/mymodal.html` for non-tabbed, or `snippets/mymodal-tabname.html` for tabbed)

2. **Update index.html**: Replace modal-body content with placeholder:
   ```html
   <!-- Non-tabbed -->
   <div id="mymodal-content" class="modal-body"></div>
   <!-- Tabbed -->
   <div id="mymodal-tab1-content"></div>
   <div id="mymodal-tab2-content"></div>
   ```

3. **Update app.js**: Add mapping to `SNIPPET_MAP`:
   ```js
   const SNIPPET_MAP = {
     "my-modal": ["mymodal.html"],
     // or for tabbed:
     "my-modal": ["mymodal-tab1.html", "mymodal-tab2.html"],
   };
   ```

4. **For tabbed modals**: Call `setupMyModalTabsLayout()` inside the `loadSnippetsForModal().then()` callback in `openModal()`.

**Key points:**
- Snippets load only once (cached via `data-snippets-loaded` attribute)
- If snippet fails to load, modal still shows (console warning only)
- Tabbed modals need a setup function that moves content into tab panels

### AI Providers

The system supports multiple AI providers. Each provider requires:

1. **UI Elements (index.html)**:
   - Add option to `ai-provider-select` dropdown
   - Add API key/settings container (use `hidden` class for conditional visibility)
   - Add to Auto-Title and Summary provider dropdowns if supported

2. **Settings (app.js)**:
   - Add default setting to `DEFAULT_SETTINGS`
   - Add state property for model catalog (e.g., `groqModelCatalog: []`)
   - Add element initialization in `initSettings()`
   - Add event listener for input/change handling
   - Update `updateProviderVisibility()` to show/hide provider-specific inputs

3. **Model Catalog (app.js)**:
   - Implement `fetch{Provider}ModelCatalog(signal)` function
   - Implement `normalize{Provider}ModelItem(model)` function
   - Add provider case in `populateSettingsModels()`
   - Add catalog selection in `renderSettingsModelOptions()`

4. **API Implementation (app.js)**:
   - Implement `call{Provider}()` function following existing patterns
   - Support streaming via Server-Sent Events
   - Handle stop strings, temperature, and other parameters
   - Add routing in `callOpenRouter()` for the provider

5. **Localization (locales/*.json)**:
   - Add provider name and API key labels to all locale files

#### Existing Providers

- **OpenRouter**: OpenAI-compatible API with extensive model catalog
- **AI Horde**: Distributed AI inference network (native and OpenAI-compatible modes)
- **LM Studio**: Local LLM inference (OpenAI-compatible and native modes)
- **Groq**: Fast LPU-based inference (OpenAI-compatible, dynamic model catalog)

## Git Rules

- Never run `git commit`, `git push`, `git add`, or any other git commands that modify the repository.
- After completing a task where any file whas changed, always suggest a single-line, concise commit message in plain-text in its own separate paragraph.
