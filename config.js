// config.js
const CONFIG = {
  version: "1.0.0",
  apiKey:
    (typeof window !== "undefined" &&
      window.ENV &&
      window.ENV.OPENROUTER_API_KEY) ||
    "",
  hordeApiKey:
    (typeof window !== "undefined" &&
      window.ENV &&
      window.ENV.HORDE_API_KEY) ||
    "",
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