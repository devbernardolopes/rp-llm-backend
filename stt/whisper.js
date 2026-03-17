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
    
    const wavBuffer = audioBufferToWav(audioBuffer);
    const blob = new Blob([wavBuffer], { type: "audio/wav" });
    
    const langCode = language === "pt-BR" ? "pt" : language.split("-")[0];
    
    const result = await window.sttModel(blob, { language: langCode });
    return result.text.trim();
  } catch (e) {
    console.error("STT transcription failed:", e);
    throw e;
  }
}

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  
  const resultLength = 44 + buffer.length * numChannels * (bitDepth / 8);
  const result = new ArrayBuffer(resultLength);
  const view = new DataView(result);
  
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + buffer.length * numChannels * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, buffer.length * numChannels * 2, true);
  
  const channelData = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  
  return result;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
