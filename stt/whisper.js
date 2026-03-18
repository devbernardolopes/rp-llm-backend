// stt/whisper.js
// Speech-to-Text using Whisper (Transformers.js) via WebWorker

const STT_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "it", label: "Italian" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
];

const TARGET_SAMPLE_RATE = 16000;

// Worker state
let sttWorker = null;
let sttWorkerReady = false;
let sttWorkerInitializing = false;
let sttInitPromise = null;
const sttTranscribePromises = new Map();
let transcriptionIdCounter = 0;

function sttDebug(...args) {
  // console.debug('[whisper]', ...args);
}

function getWorkerPath() {
  const scripts = document.getElementsByTagName("script");
  for (let script of scripts) {
    if (script.src && script.src.includes("whisper.js")) {
      const base = script.src.substring(0, script.src.lastIndexOf("/"));
      return `${base}/whisper-worker.js`;
    }
  }
  return "stt/whisper-worker.js";
}

function getWorker() {
  if (sttWorker) return sttWorker;

  const WorkerConstructor = window.Worker || window.webkitWorker;
  if (!WorkerConstructor) {
    throw new Error("Web Workers not supported in this browser.");
  }

  const workerPath = getWorkerPath();
  sttWorker = new WorkerConstructor(workerPath, { type: "module" });

  sttWorker.onmessage = (event) => {
    const { type, id, text, success, error, message } = event.data || {};

    switch (type) {
      case 'initialized':
        sttWorkerReady = success;
        sttWorkerInitializing = false;
        if (success) {
          sttDebug("whisper:worker:initialized");
        } else {
          console.error("whisper:worker:init-failed", error);
        }
        break;

      case 'transcribed':
        const promise = sttTranscribePromises.get(id);
        if (promise) {
          promise.resolve(text);
          sttTranscribePromises.delete(id);
        }
        break;

      case 'error':
        const errorPromise = sttTranscribePromises.get(id);
        if (errorPromise) {
          errorPromise.reject(new Error(message || "Transcription failed"));
          sttTranscribePromises.delete(id);
        }
        break;

      case 'download-progress':
        sttDebug("whisper:download-progress", event.data.percent + "%");
        break;
    }
  };

  sttWorker.onerror = (err) => {
    console.error("whisper:worker:error", err);
    sttWorkerReady = false;
    for (const [id, promise] of sttTranscribePromises) {
      promise.reject(new Error("Worker error: " + err.message));
      sttTranscribePromises.delete(id);
    }
  };

  return sttWorker;
}

async function loadSttModel() {
  if (sttWorkerReady) return;

  if (sttInitPromise) {
    await sttInitPromise;
    return;
  }

  if (sttWorkerInitializing) {
    await new Promise((resolve) => {
      const checkReady = setInterval(() => {
        if (sttWorkerReady) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);
    });
    return;
  }

  sttWorkerInitializing = true;
  const worker = getWorker();
  sttInitPromise = new Promise((resolve) => {
    const checkReady = setInterval(() => {
      if (sttWorkerReady) {
        clearInterval(checkReady);
        sttInitPromise = null;
        resolve();
      }
    }, 100);
  });

  worker.postMessage({ type: 'init' });
  await sttInitPromise;
}

function resampleAudio(channelData, fromSampleRate, toSampleRate = TARGET_SAMPLE_RATE) {
  const ratio = fromSampleRate / toSampleRate;
  const newLength = Math.round(channelData.length / ratio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const index = Math.floor(srcIndex);
    const frac = srcIndex - index;
    
    if (index + 1 < channelData.length) {
      result[i] = channelData[index] * (1 - frac) + channelData[index + 1] * frac;
    } else if (index < channelData.length) {
      result[i] = channelData[index];
    }
  }
  
  return result;
}

function createSilenceDetector(audioContext, stream, onSilenceDetected) {
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.fftSize = 256;
  
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  function getAudioLevel() {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    if (rms === 0) return -100;
    return 20 * Math.log10(rms / 255);
  }
  
  return { analyser, getAudioLevel };
}

async function transcribeAudio(audioBlob, language = "en") {
  if (!sttWorkerReady) {
    await loadSttModel();
    if (!sttWorkerReady) {
      throw new Error("STT model not ready");
    }
  }

  try {
    sttDebug("STT: Processing audio blob, size:", audioBlob.size, "type:", audioBlob.type);
    
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    sttDebug("STT: Decoded audio, sampleRate:", audioBuffer.sampleRate, "length:", audioBuffer.length, "channels:", audioBuffer.numberOfChannels);
    
    let channelData = audioBuffer.getChannelData(0);
    
    // Resample if necessary
    if (audioBuffer.sampleRate !== TARGET_SAMPLE_RATE) {
      channelData = resampleAudio(channelData, audioBuffer.sampleRate, TARGET_SAMPLE_RATE);
    }
    
    // Create a new Float32Array to ensure proper format
    const audioArray = new Float32Array(channelData);
    sttDebug("STT: Audio array ready, length:", audioArray.length);
    
    // Generate unique ID for this transcription
    const id = ++transcriptionIdCounter;
    
    // Create promise that will be resolved by worker message
    const textPromise = new Promise((resolve, reject) => {
      sttTranscribePromises.set(id, { resolve, reject });
    });
    
    // Send to worker with transferable array buffer
    const worker = getWorker();
    worker.postMessage(
      {
        type: 'transcribe',
        id,
        audioData: audioArray,
        language,
        sampleRate: TARGET_SAMPLE_RATE,
      },
      [audioArray.buffer]
    );
    
    // Wait for result
    const text = await textPromise;
    sttDebug("STT: Transcription result:", text);
    return text;
  } catch (e) {
    console.error("STT transcription failed:", e);
    throw e;
  }
}
