# AGENTS.md

## Project Context

- AI chat platform built with vanilla JavaScript + HTML + CSS (with some Tailwind CSS). Ongoing project.
- Local storage via Dexie.js.
- Users create characters/scenarios (referred to as **BOTS**) and chat with them, creating **threads**.
- Connects to AI models via OpenRouter, AI Horde, LM Studio, or Groq.
- Requests use OpenAI-compatible format or provider-native APIs depending on the provider.
- Entry points: `index.html` and `app.js`. Supporting modules live alongside them (see each file for inline documentation).

### Key UI Identifiers

- `#character-modal` — BOT creation/editing interface (the "BOT modal").
- `#chat-view` — Chat/thread window.
- `/locales/` — Language JSON files for i18n.
- `/snippets/` — Lazy-loaded HTML fragments for modals.

## Agent Instructions

### Locale / i18n

- Every new UI string must have a corresponding entry **appended to the end** of every `/locales` JSON file.
- Entries must be translated into each file's respective language — do not leave them in English.

### Development

- No build steps or tests required.
- When adding new modules, insert them into the script loading order in `index.html` at the correct dependency position.
- Use `type="module"` for new code that needs ES module support.

### Git Rules

- Never run `git commit`, `git push`, `git add`, or any other git commands that modify the repository.
- Always provide a single-line, concise commit message suggestion in plain-text in its own separate paragraph at the end of your response (except when in plan mode).

### AI Providers

The system supports multiple AI providers. Each provider requires changes across five areas:

1. **UI Elements (`index.html`)**:
   - Add option to `ai-provider-select` dropdown
   - Add API key/settings container (use `hidden` class for conditional visibility)
   - Add to Auto-Title and Summary provider dropdowns if supported

2. **Settings (`app.js`)**:
   - Add default setting to `DEFAULT_SETTINGS`
   - Add state property for model catalog (e.g., `groqModelCatalog: []`)
   - Add element initialization in `initSettings()`
   - Add event listener for input/change handling
   - Update `updateProviderVisibility()` to show/hide provider-specific inputs

3. **Model Catalog (`app.js`)**:
   - Implement `fetch{Provider}ModelCatalog(signal)`
   - Implement `normalize{Provider}ModelItem(model)`
   - Add provider case in `populateSettingsModels()`
   - Add catalog selection in `renderSettingsModelOptions()`

4. **API Implementation (`app.js`)**:
   - Implement `call{Provider}()` following existing provider patterns
   - Support streaming via Server-Sent Events
   - Handle stop strings, temperature, and other parameters
   - Add routing in `callOpenRouter()` for the provider

5. **Localization (`locales/*.json`)**:
   - Add provider name and API key labels to all locale files

#### Existing Providers

- **OpenRouter** — OpenAI-compatible, extensive model catalog
- **AI Horde** — Distributed inference, native and OpenAI-compatible modes
- **LM Studio** — Local LLM inference, OpenAI-compatible and native modes
- **Groq** — LPU-based inference, OpenAI-compatible, dynamic model catalog

### HTML Snippet Modularization

Modals and complex UI sections use lazy-loaded snippet files in `/snippets/`. Snippets are fetched on first modal open and cached (via `data-snippets-loaded` attribute) — they never load twice.

**Adding a new non-tabbed modal:**

1. Create the snippet file in `/snippets/` (e.g., `snippets/my-modal.html`)

2. In `index.html`, replace the modal body with a placeholder:

   ```html
   <div id="mymodal-content" class="modal-body"></div>
   ```

3. In `app.js`, register it in `SNIPPET_MAP`:

   ```js
   const SNIPPET_MAP = {
     "my-modal": ["my-modal.html"],
   };
   ```

4. Add initialization inside `openModal()`, always inside the `.then()` callback (DOM isn't ready until snippets load):

   ```js
   loadSnippetsForModal(modalId).then(() => {
     if (modalId === "my-modal") {
       const textarea = document.getElementById("my-textarea");
       if (textarea) {
         textarea.value = state.settings.myValue || "";
         setupModalTextareas(modal);
         markModalDirtyOnInput("my-modal", ["#my-textarea"]);
       }
     }
   });
   ```

**Useful initialization helpers:**

- `setupModalTextareas(modal)` — auto-expand/collapsible textarea behavior
- `markModalDirtyOnInput(modalId, selectors)` — enables Save/Apply buttons on change
- `populateSettingsTabValues()` — populates all Settings modal form fields

**Notes:**

- If a snippet fails to load, the modal still opens (console warning only).
- For tabbed modals like Settings, call `setupModalTextareas()` when switching tabs.
- The Settings modal intentionally uses inline HTML in `index.html` (not snippets) so all form elements are available at app initialization.
