// stt/whisper.js
// Speech-to-Text using Whisper (Transformers.js)

window.sttModel = null;
window.sttReady = false;

const STT_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "it", label: "Italian" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
];

async function loadSttModel() {
  if (window.sttReady) return;

  try {
    const { pipeline, whisper } = await import(
      "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0"
    );
    window.sttModel = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny");
    window.sttReady = true;
    console.log("STT model loaded");
  } catch (e) {
    console.warn("Failed to load STT model:", e);
    window.sttReady = false;
  }
}

async function transcribeAudio(audioBlob, language = "en") {
  if (!window.sttReady || !window.sttModel) {
    await loadSttModel();
    if (!window.sttReady) {
      throw new Error("STT model not ready");
    }
  }

  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const targetSampleRate = 16000;
    let channelData = audioBuffer.getChannelData(0);
    
    if (audioBuffer.sampleRate !== targetSampleRate) {
      channelData = resampleAudio(channelData, audioBuffer.sampleRate, targetSampleRate);
    }
    
    const langCode = language === "pt-BR" ? "pt" : language.split("-")[0];
    console.log("STT: Using language code:", langCode);
    
    const audioInput = {
      array: channelData,
      sampling_rate: targetSampleRate
    };
    
    const result = await window.sttModel(audioInput, { 
      language: langCode,
      task: "transcribe"
    });
    console.log("STT: Transcription result:", result.text.trim());
    return result.text.trim();
  } catch (e) {
    console.error("STT transcription failed:", e);
    throw e;
  }
}

function resampleAudio(channelData, fromSampleRate, toSampleRate = 16000) {
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

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
