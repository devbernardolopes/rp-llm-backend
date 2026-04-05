function populateSettingsTabValues() {
  const openRouterApiKey = document.getElementById("openrouter-api-key");
  const hordeApiKey = document.getElementById("horde-api-key");
  const hordeApiMethod = document.getElementById("horde-api-method");
  const lmstudioBaseUrl = document.getElementById("lmstudio-base-url");
  const lmstudioApiMethod = document.getElementById("lmstudio-api-method");
  const groqApiKey = document.getElementById("groq-api-key");
  const aiProviderSelect = document.getElementById("ai-provider-select");
  
  if (!openRouterApiKey) return;
  
  openRouterApiKey.value = state.settings.openRouterApiKey || "";
  hordeApiKey.value = state.settings.hordeApiKey || CONFIG.hordeApiKey || "";
  hordeApiMethod.value = state.settings.hordeApiMethod || "native";
  lmstudioBaseUrl.value = state.settings.lmstudioBaseUrl || "http://localhost:1234";
  lmstudioApiMethod.value = state.settings.lmstudioApiMethod || "openai";
  groqApiKey.value = state.settings.groqApiKey || "";
  aiProviderSelect.value = state.settings.aiProvider || "openrouter";
  updateProviderVisibility();
}