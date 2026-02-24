// config.js
const CONFIG = {
  version: "1.0.0",
  apiKey:
    (typeof window !== "undefined" &&
      window.ENV &&
      window.ENV.OPENROUTER_API_KEY) ||
    "",
  model: "openrouter/free",
  maxTokens: 1024,
  temperature: 0.8,
};