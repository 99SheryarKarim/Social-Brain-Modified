/**
 * Available AI Models Configuration
 * ===================================
 * Exactly 4 active models:
 *   1. ideapulse-custom  — our custom fine-tuned TinyLlama LoRA adapter
 *   2. gemini-2.5-flash  — Google Gemini (primary fallback)
 *   3. Mistral 7B        — Hugging Face Inference API
 *   4. ollama-llama2     — Local Ollama
 *
 * The custom model is served by the Python Flask sidecar (serve_custom_model.py)
 * running on http://localhost:5050. When the sidecar is unreachable, all requests
 * for 'ideapulse-custom' automatically fall back to Gemini inside customModelService.js.
 */

const SIDECAR_URL = process.env.CUSTOM_MODEL_URL || "http://localhost:5050";

const AVAILABLE_MODELS = {
  // ── 1. IdeaPulse Custom Fine-Tuned Model ─────────────────────────────────
  "idea-pulse-custom-llm": {
    provider     : "custom",
    name         : "Idea Pulse AI (Fine-Tuned)",
    displayName  : "Idea Pulse AI",
    description  : "Our own fine-tuned TinyLlama model trained on 100 IdeaPulse samples. " +
                   "Served locally via Python sidecar. Falls back to Gemini if sidecar is offline.",
    free         : true,
    requiresKey  : false,
    responseTime : "fast",
    quality      : "excellent",
    priority     : 1,
    sidecarUrl   : SIDECAR_URL,
    adapterPath  : "models/idea-pulse-llm",
  },
  "ideapulse-custom": {
    provider     : "custom",
    name         : "Idea Pulse AI (Fine-Tuned)",
    displayName  : "Idea Pulse AI",
    description  : "Our own fine-tuned TinyLlama model trained on 100 IdeaPulse samples. " +
                   "Served locally via Python sidecar. Falls back to Gemini if sidecar is offline.",
    free         : true,
    requiresKey  : false,
    responseTime : "fast",
    quality      : "excellent",
    priority     : 1,
    sidecarUrl   : SIDECAR_URL,
    adapterPath  : "models/idea-pulse-llm",
  },

  // ── 2. Google Gemini 2.5 Flash ───────────────────────────────────────────
  "gemini-2.5-flash": {
    provider     : "gemini",
    name         : "Google Gemini 2.5 Flash",
    displayName  : "Gemini 2.5 Flash",
    description  : "Fast, highly capable general model by Google — also used as fallback.",
    free         : true,
    requiresKey  : true,
    responseTime : "very-fast",
    quality      : "excellent",
    priority     : 2,
  },

  // ── 3. Mistral 7B via Hugging Face ───────────────────────────────────────
  "mistralai/Mistral-7B-Instruct-v0.2": {
    provider     : "huggingface",
    name         : "Mistral 7B Instruct (HuggingFace)",
    displayName  : "Mistral 7B",
    description  : "Fast open-source instruction-tuned model via Hugging Face Inference API.",
    free         : true,
    requiresKey  : true,
    responseTime : "medium",
    quality      : "very-good",
    priority     : 3,
  },

  // ── 4. LLaMA 2 via local Ollama ──────────────────────────────────────────
  "ollama-llama2": {
    provider     : "ollama",
    name         : "LLaMA 2 (Local Ollama)",
    displayName  : "LLaMA 2",
    description  : "Meta's open-source model running locally via Ollama.",
    free         : true,
    requiresKey  : false,
    responseTime : "medium",
    quality      : "very-good",
    priority     : 4,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getModelInfo(modelId) {
  if (!modelId) return null;
  if (AVAILABLE_MODELS[modelId]) return AVAILABLE_MODELS[modelId];
  if (modelId === "idea-pulse-custom-llm" || modelId === "ideapulse-custom") {
    return AVAILABLE_MODELS["idea-pulse-custom-llm"];
  }
  if (modelId === "mistralai/Mistral-7B-Instruct-v0.1") {
    return AVAILABLE_MODELS["mistralai/Mistral-7B-Instruct-v0.2"];
  }
  return null;
}

function getModelsByProvider(provider) {
  return Object.entries(AVAILABLE_MODELS)
    .filter(([_, info]) => info.provider === provider)
    .map(([id, info]) => ({ id, ...info }));
}

function getAllActiveModels() {
  const seen = new Set();
  const list = [];
  for (const [id, info] of Object.entries(AVAILABLE_MODELS)) {
    const key = info.name;
    if (!seen.has(key)) {
      seen.add(key);
      list.push({ id, ...info });
    }
  }
  return list.sort((a, b) => a.priority - b.priority);
}

function isValidModel(modelId) {
  return modelId in AVAILABLE_MODELS;
}

function isCustomModel(modelId) {
  return AVAILABLE_MODELS[modelId]?.provider === "custom";
}

module.exports = {
  AVAILABLE_MODELS,
  SIDECAR_URL,
  getModelInfo,
  getModelsByProvider,
  getAllActiveModels,
  isValidModel,
  isCustomModel,
};
