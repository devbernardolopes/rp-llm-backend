import {
  detectCapabilities,
  listSupportedModels,
  loadModel,
  generateImage,
  isModelLoaded,
} from "web-txt2img";

let currentModel = null;
let loadPromise = null;

export async function initGenerator(onProgress) {
  const caps = await detectCapabilities();

  if (!caps.webgpu) {
    throw new Error(
      "WebGPU is not supported in this browser. Please use Chrome 113+, Edge, or Safari Technology Preview.",
    );
  }

  return { webgpu: caps.webgpu };
}

export async function loadModelIfNeeded(onProgress = () => {}) {
  if (currentModel && isModelLoaded(currentModel)) {
    return { ok: true, model: currentModel };
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const model = "sd-turbo";
    currentModel = model;

    const result = await loadModel(
      model,
      {
        backendPreference: ["webgpu"],
      },
      (progress) => {
        onProgress(progress);
      },
    );

    loadPromise = null;

    if (!result.ok) {
      currentModel = null;
      return {
        ok: false,
        reason: result.reason,
        message: result.message,
        model: null,
      };
    }

    return { ok: true, model, bytesDownloaded: result.bytesDownloaded };
  })();

  return loadPromise;
}

export async function generateImageWithProgress(prompt, options = {}, onProgress = () => {}) {
  const { seed = -1, model = "sd-turbo" } = options;

  if (model !== currentModel || !isModelLoaded(model)) {
    const loadResult = await loadModelIfNeeded(onProgress);
    if (!loadResult.ok) {
      throw new Error(loadResult.message || "Failed to load model");
    }
  }

  if (model !== currentModel) {
    throw new Error(`Model ${model} is not loaded`);
  }

  const params = {
    prompt,
    seed,
  };

  const result = await generateImage(params);

  if (!result.ok) {
    throw new Error(result.message || "Image generation failed");
  }

  return {
    blob: result.blob,
    seed: seed === -1 ? Math.floor(Math.random() * 2 ** 31) : seed,
    width: result.width || 512,
    height: result.height || 512,
    timeMs: result.timeMs,
  };
}

export function getLoadedModel() {
  return currentModel;
}

export function isModelReady() {
  return currentModel !== null && isModelLoaded(currentModel);
}

export async function getModelList() {
  return listSupportedModels();
}

export async function checkWebGpuSupport() {
  try {
    const caps = await detectCapabilities();
    return {
      supported: caps.webgpu,
      shaderF16: caps.shaderF16,
      wasm: caps.wasm,
    };
  } catch (e) {
    return {
      supported: false,
      error: e.message,
    };
  }
}

if (typeof window !== "undefined") {
  window.imagegen = {
    initGenerator,
    loadModelIfNeeded,
    generateImage: generateImageWithProgress,
    getLoadedModel,
    isModelReady,
    getModelList,
    checkWebGpuSupport,
  };
}
