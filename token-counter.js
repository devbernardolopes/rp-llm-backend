let tokenEncoder = null;
let encoderLoading = null;

async function loadEncoder() {
  if (tokenEncoder) return tokenEncoder;
  if (encoderLoading) return encoderLoading;

  encoderLoading = import("https://esm.sh/gpt-tokenizer@3.4.0")
    .then((module) => {
      const { encode } = module;
      tokenEncoder = (text) => encode(text, "cl100k_base").length;
      encoderLoading = null;
      return tokenEncoder;
    })
    .catch((err) => {
      console.warn("Failed to load token counter:", err);
      encoderLoading = null;
      return null;
    });

  return encoderLoading;
}

async function estimateTokens(text) {
  if (!text || typeof text !== "string") return 0;
  if (!tokenEncoder) {
    const encoder = await loadEncoder();
    if (!encoder) return Math.ceil(text.length / 4);
    return encoder(text);
  }
  return tokenEncoder(text);
}

function estimateTokensSync(text) {
  if (!text || typeof text !== "string") return 0;
  if (!tokenEncoder) {
    return Math.ceil(text.length / 4);
  }
  return tokenEncoder(text);
}

window.estimateTokens = estimateTokens;
window.estimateTokensSync = estimateTokensSync;
