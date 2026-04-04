# Groq Implementation

## Overview

Groq support was added to allow users to connect to Groq's inference API, which provides fast LLM inference using their LPU (Language Processing Unit).

## API Details

- **Base URL**: `https://api.groq.com/openai/v1`
- **Authentication**: Bearer token (API key)
- **Models Endpoint**: `GET https://api.groq.com/openai/v1/models`
- **Chat Endpoint**: `POST https://api.groq.com/openai/v1/chat/completions`

## Implementation

### Files Modified

1. **app.js**
   - `DEFAULT_SETTINGS`: Added `groqApiKey: ""`
   - `state`: Added `groqModelCatalog: []`
   - `updateProviderVisibility()`: Added visibility toggle for Groq API key input
   - `populateSettingsModels()`: Added provider case for "groq"
   - `renderSettingsModelOptions()`: Added catalog selection for Groq
   - `fetchGroqModelCatalog(signal)`: Fetches models from Groq API
   - `normalizeGroqModelItem(model)`: Normalizes model data to internal format
   - `callGroq()`: Main API call function with streaming support
   - `callOpenRouter()`: Added routing for Groq provider

2. **index.html**
   - Added `<option value="groq">` to AI Provider select
   - Added API key input container with id `groq-api-key-container`
   - Added Groq to Auto-Title Provider select
   - Added Groq to Summary Provider select

3. **locales/\*.json** (en, de, fr, es, it, pt-BR)
   - Added `providerGroq` and `groqApiKey` translations

### Model Catalog

Models are fetched dynamically from `https://api.groq.com/openai/v1/models` using the user's API key. Only active models are included in the catalog.

Model data is normalized with:

- `id`: `groq/{model_id}`
- `contextLength`: from `context_window`
- `maxCompletionTokens`: from `max_completion_tokens`

### Features

- **Streaming**: Supported via Server-Sent Events
- **Stop Strings**: Supported
- **Temperature/TopP/FrequencyPenalty/PresencePenalty**: All supported
- **Max Tokens**: Passed as `max_tokens` in request body
- **Auto-Title**: Groq can be selected as the provider
- **Summary**: Groq can be selected as the provider
