# AGENTS.md

## Project Context

- This is an AI chat system that is STILL being built using vanilla JavaScript + HTML + CSS (with some Tailwind CSS). It is an on-going project.
- It uses local storage with Dexie.js.
- It allows users to create characters/scenarios (referred as BOTS) and chat with them, thus creating threads.
- It connects to AI models via OpenRouter with the use of an API Key.
- It makes requests via OpenRouter API following OpenAI-compatible format.
- The main request is `completion` because it generates a BOT message (endpoint: `/api/v1/chat/completions`).
- The main files are `index.html` and `app.js`. Almost all logic lives in `app.js`.
- The UI supports multiple languages as JSON files at `/locales`.
- New text in UI must have a respective JSON entry **appended** at the end of every `/locales` file, translated respectively.
- The home screen shows BOT cards.
- The left panel shows thread cards in the middle (when there are threads), system options in the bottom (buttons), and some main buttons at the top.
- The system supports TTS (using Kokoro.js as well as native browser TTS). The functions for Kokoro.js are at `/tts/kokoro.js`.
- The `<div>` with id = `character-modal` is the interface/UI that allows users to create and edit BOT definitions (may be reffered to as "BOT modal").
- The BOTs have avatars, that is, images and/or videos representing them visually.
- The `<section>` with id = `chat-view` is the window/screen that allows users to chat with a BOT (may be referred to as "chat or thread window/screen").
- The `<div>` with id = `image-preview-modal` is used for displaying a modal with either an image or a video. It is triggered when the user clicks on an avatar.

## Agent Instructions

### Locale / i18n

- New UI strings must have a corresponding entry appended to the end of every `/locales` JSON file.
- Entries must be translated respectively, not left in English across all files.

### Development

- Run the app using VS Code Live Server.
- No build steps or tests required.

## Git Rules

- Never run `git commit`, `git push`, `git add`, or any other git commands that modify the repository.
- After completing a task, always suggest a single-line, concise commit message in plain-text.
- Output the suggested message in its own separate paragraph.
