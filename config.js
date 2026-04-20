// config.js
const CONFIG = {
  version: "31.1.10",
  apiKey:
    (typeof window !== "undefined" &&
      window.ENV &&
      window.ENV.OPENROUTER_API_KEY) ||
    "",
  hordeApiKey:
    (typeof window !== "undefined" && window.ENV && window.ENV.HORDE_API_KEY) ||
    "41e85e5f-e62d-42a4-ae89-3ac5a1c72d6a",
  hordeApiMethod: "native",
  lmstudioBaseUrl: "http://localhost:1234",
  lmstudioApiMethod: "openai",
  model: "openrouter/free",
  maxTokens: 1024,
  temperature: 0.8,
  topK: 0,
  repeatPenalty: 1,
  contextLength: 0,
  loreMatchingMode: "keyword",
  loreSemanticThreshold: 0.5,
};
