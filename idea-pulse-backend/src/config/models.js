/**
 * Available AI Models Configuration
 * Supports multiple providers: Gemini, Hugging Face, and Ollama
 */

const AVAILABLE_MODELS = {
  // Google Gemini Models
  "gemini-2.5-flash": {
    provider: "gemini",
    name: "Google Gemini 2.5 Flash",
    description: "Fast, highly capable model by Google",
    free: true,
    requiresKey: true,
    responseTime: "very-fast",
    quality: "excellent",
    priority: 1,
  },

  "gemini-pro": {
    provider: "gemini",
    name: "Google Gemini Pro",
    description: "More capable Gemini model",
    free: true,
    requiresKey: true,
    responseTime: "fast",
    quality: "excellent",
    priority: 2,
  },

  // Hugging Face Models
  "mistralai/Mistral-7B-Instruct-v0.1": {
    provider: "huggingface",
    name: "Mistral 7B Instruct",
    description: "Fast, open-source model by Mistral AI",
    free: true,
    requiresKey: true,
    responseTime: "medium",
    quality: "very-good",
    priority: 3,
  },

  "google/flan-t5-xl": {
    provider: "huggingface",
    name: "FLAN-T5 XL",
    description: "Versatile open-source model, good for social media",
    free: true,
    requiresKey: true,
    responseTime: "fast",
    quality: "good",
    priority: 4,
  },

  "meta-llama/Llama-2-7b-chat": {
    provider: "huggingface",
    name: "LLaMA 2 7B Chat",
    description: "Meta's capable open-source conversational model",
    free: true,
    requiresKey: true,
    responseTime: "medium",
    quality: "very-good",
    priority: 5,
  },

  // Together.ai Models
  "togethercomputer/llama-2-70b-chat": {
    provider: "together",
    name: "LLaMA 2 70B Chat",
    description: "High-capability open-source model via Together.ai",
    free: true,
    requiresKey: true,
    responseTime: "fast",
    quality: "excellent",
    priority: 6,
  },

  "mistralai/Mistral-7B-Instruct-v0.2": {
    provider: "together",
    name: "Mistral 7B Instruct",
    description: "Fast Mistral model via Together.ai",
    free: true,
    requiresKey: true,
    responseTime: "very-fast",
    quality: "very-good",
    priority: 6.5,
  },

  "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO": {
    provider: "together",
    name: "Nous Hermes 2 Mixtral",
    description: "Advanced open-source model for complex prompts",
    free: true,
    requiresKey: true,
    responseTime: "fast",
    quality: "excellent",
    priority: 6.8,
  },

  // Ollama Local Models (Week 3)
  "ollama-mistral": {
    provider: "ollama",
    name: "Mistral (Local)",
    description: "Run locally on your machine, no API key needed",
    free: true,
    requiresKey: false,
    responseTime: "medium",
    quality: "very-good",
    priority: 7,
  },

  "ollama-llama2": {
    provider: "ollama",
    name: "LLaMA 2 (Local)",
    description: "Meta's model running locally",
    free: true,
    requiresKey: false,
    responseTime: "medium",
    quality: "very-good",
    priority: 7.5,
  },

  "ollama-neural-chat": {
    provider: "ollama",
    name: "Neural Chat (Local)",
    description: "Optimized for conversation",
    free: true,
    requiresKey: false,
    responseTime: "fast",
    quality: "good",
    priority: 8,
  },
};

/**
 * Get model info by model ID
 */
function getModelInfo(modelId) {
  return AVAILABLE_MODELS[modelId] || null;
}

/**
 * Get all available models for a provider
 */
function getModelsByProvider(provider) {
  return Object.entries(AVAILABLE_MODELS)
    .filter(([_, info]) => info.provider === provider)
    .map(([id, info]) => ({ id, ...info }));
}

/**
 * Get all active models (sorted by priority)
 */
function getAllActiveModels() {
  return Object.entries(AVAILABLE_MODELS)
    .map(([id, info]) => ({ id, ...info }))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Validate if model ID is available
 */
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
