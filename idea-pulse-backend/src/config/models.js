/**
 * Available AI Models Configuration
 * Clean configuration with exactly 4 active models (including custom trained FYP model).
 */

const AVAILABLE_MODELS = {
  // 1. Custom Trained Model
  "ideapulse-custom": {
    provider: "custom",
    name: "IdeaPulse Custom AI (Fine-Tuned)",
    description: "Custom fine-tuned AI model trained specifically for IdeaPulse content generation",
    free: true,
    requiresKey: false,
    responseTime: "fast",
    quality: "excellent",
    priority: 1,
  },

  // 2. Google Gemini
  "gemini-2.5-flash": {
    provider: "gemini",
    name: "Google Gemini 2.5 Flash",
    description: "Fast, highly capable general model by Google",
    free: true,
    requiresKey: true,
    responseTime: "very-fast",
    quality: "excellent",
    priority: 2,
  },

  // 3. Hugging Face Mistral
  "mistralai/Mistral-7B-Instruct-v0.2": {
    provider: "huggingface",
    name: "Mistral 7B Instruct (Hugging Face)",
    description: "Fast open-source instruction-tuned model",
    free: true,
    requiresKey: true,
    responseTime: "medium",
    quality: "very-good",
    priority: 3,
  },

  // 4. Local Ollama LLaMA
  "ollama-llama2": {
    provider: "ollama",
    name: "LLaMA 2 (Local Ollama)",
    description: "Meta's open-source model running locally",
    free: true,
    requiresKey: false,
    responseTime: "medium",
    quality: "very-good",
    priority: 4,
  },
};

function getModelInfo(modelId) {
  return AVAILABLE_MODELS[modelId] || null;
}

function getModelsByProvider(provider) {
  return Object.entries(AVAILABLE_MODELS)
    .filter(([_, info]) => info.provider === provider)
    .map(([id, info]) => ({ id, ...info }));
}

function getAllActiveModels() {
  return Object.entries(AVAILABLE_MODELS)
    .map(([id, info]) => ({ id, ...info }))
    .sort((a, b) => a.priority - b.priority);
}

function isValidModel(modelId) {
  return modelId in AVAILABLE_MODELS;
}

module.exports = {
  AVAILABLE_MODELS,
  getModelInfo,
  getModelsByProvider,
  getAllActiveModels,
  isValidModel,
};
