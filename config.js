// config.js
const CONFIG = {
  version: "25.1.4",
  apiKey:
    (typeof window !== "undefined" &&
      window.ENV &&
      window.ENV.OPENROUTER_API_KEY) ||
    "",
  hordeApiKey:
    (typeof window !== "undefined" && window.ENV && window.ENV.HORDE_API_KEY) ||
    "617e08d4-2ac6-46b7-a469-e2f67d79512b",
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
