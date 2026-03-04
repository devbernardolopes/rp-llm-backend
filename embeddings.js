// embeddings.js
// Embedding utilities for semantic memory filtering
// Uses Transformers.js with Xenova/all-MiniLM-L6-v2

window.memoryEmbeddingModel = null;
window.memoryEmbeddingReady = false;

async function loadEmbeddingModel() {
  if (window.memoryEmbeddingReady) return;

  try {
    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0');
    window.memoryEmbeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    // Ensure normalized embeddings for cosine similarity
    window.memoryEmbeddingModel.options = { normalize: true };
    window.memoryEmbeddingReady = true;
    console.log('Memory embedding model loaded');
  } catch (e) {
    console.warn('Failed to load embedding model:', e);
    window.memoryEmbeddingReady = false;
  }
}

async function getEmbedding(text) {
  if (!window.memoryEmbeddingReady || !window.memoryEmbeddingModel) return null;
  try {
    const output = await window.memoryEmbeddingModel(text, {
      pooling: 'mean',
      normalize: true
    });
    // Convert Float32Array to regular array for IndexedDB storage
    return Array.from(output.data);
  } catch (e) {
    console.warn('Embedding generation failed:', e);
    return null;
  }
}
