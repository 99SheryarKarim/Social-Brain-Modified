import React, { useState } from 'react';
import styles from './ModelSelector.module.css';

const ModelSelector = ({ selectedModel, onModelChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Available models configuration (matches backend) - EXACTLY 4 MODELS
  const AVAILABLE_MODELS = [
    {
      id: 'ideapulse-custom',
      name: 'IdeaPulse Custom AI (Fine-Tuned)',
      description: 'Custom fine-tuned AI model trained specifically for IdeaPulse',
      provider: 'custom',
      responseTime: 'fast',
      quality: 'excellent',
      iconClass: 'fas fa-wand-magic-sparkles',
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Google Gemini 2.5 Flash',
      description: 'Fast & highly capable general model by Google',
      provider: 'gemini',
      responseTime: 'very-fast',
      quality: 'excellent',
      iconClass: 'fas fa-bolt',
    },
    {
      id: 'mistralai/Mistral-7B-Instruct-v0.2',
      name: 'Mistral 7B Instruct (HuggingFace)',
      description: 'Fast, open-source instruction model by Mistral AI',
      provider: 'huggingface',
      responseTime: 'medium',
      quality: 'very-good',
      iconClass: 'fas fa-microchip',
    },
    {
      id: 'ollama-llama2',
      name: 'LLaMA 2 (Local Ollama)',
      description: "Meta's open-source model running locally",
      provider: 'ollama',
      responseTime: 'medium',
      quality: 'very-good',
      iconClass: 'fas fa-laptop-code',
    },
  ];

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const getProviderBadgeColor = (provider) => {
    const colors = {
      custom: '#46a29f',      // Teal Accent
      gemini: '#4285f4',      // Blue
      huggingface: '#fbbf24', // Amber
      ollama: '#8b5cf6',      // Purple
    };
    return colors[provider] || '#6b7280';
  };

  return (
    <div className={styles.modelSelector}>
      <div className={styles.label}>
        <span className={styles.labelText}>
          <i className="fas fa-sliders" style={{ color: '#46a29f' }} /> AI Model
        </span>
        <div className={styles.badge}>
          <i className={currentModel?.iconClass || 'fas fa-microchip'} />
        </div>
      </div>

      <div className={styles.selectorContainer}>
        <button
          className={`${styles.selectorButton} ${isOpen ? styles.open : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          title={currentModel?.description}
        >
          <span className={styles.modelName}>{currentModel?.name || 'Select Model'}</span>
          <span className={styles.providerBadge} style={{ backgroundColor: getProviderBadgeColor(currentModel?.provider) }}>
            {currentModel?.provider?.toUpperCase()}
          </span>
          <span className={styles.arrow}>▼</span>
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            {AVAILABLE_MODELS.map((model) => (
              <div
                key={model.id}
                className={`${styles.modelOption} ${selectedModel === model.id ? styles.selected : ''}`}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
              >
                <div className={styles.modelOptionContent}>
                  <div className={styles.modelOptionHeader}>
                    <span className={styles.modelIcon}>
                      <i className={model.iconClass} style={{ color: getProviderBadgeColor(model.provider) }} />
                    </span>
                    <span className={styles.modelOptionName}>{model.name}</span>
                    <span
                      className={styles.modelOptionProvider}
                      style={{ backgroundColor: getProviderBadgeColor(model.provider) }}
                    >
                      {model.provider === 'huggingface' ? 'HF' : model.provider.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <p className={styles.modelOptionDesc}>{model.description}</p>
                  <div className={styles.modelStats}>
                    <span className={styles.stat} title="Response time">
                      <i className="far fa-clock me-1" /> {model.responseTime.replace('-', ' ')}
                    </span>
                    <span className={styles.stat} title="Output quality">
                      <i className="fas fa-star text-warning me-1" /> {model.quality}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentModel && (
        <div className={styles.info}>
          <p className={styles.infoText}>{currentModel.description}</p>
          <div className={styles.features}>
            <span className={styles.feature}>
              <i className="far fa-clock me-1" /> {currentModel.responseTime.replace('-', ' ')}
            </span>
            <span className={styles.feature}>
              <i className="fas fa-star text-warning me-1" /> {currentModel.quality} quality
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
