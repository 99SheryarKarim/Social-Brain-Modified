import React, { useState, useEffect } from 'react';
import styles from './AIModelsSettings.module.css';

const AIModelsSettings = () => {
  const [apiKeys, setApiKeys] = useState({
    togetherAI: localStorage.getItem('togetherAIKey') || '',
    ollamaHost: localStorage.getItem('ollamaHost') || 'http://localhost:11434',
  });

  const [modelStatus, setModelStatus] = useState({
    huggingface: 'configured',
    together: 'not-configured',
    ollama: 'checking',
  });

  const [showSaved, setShowSaved] = useState(false);

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch(`${apiKeys.ollamaHost}/api/tags`, {
        method: 'GET',
      });
      if (response.ok) {
        setModelStatus((prev) => ({ ...prev, ollama: 'connected' }));
      } else {
        setModelStatus((prev) => ({ ...prev, ollama: 'not-responding' }));
      }
    } catch {
      setModelStatus((prev) => ({ ...prev, ollama: 'not-running' }));
    }
  };

  const handleSaveSettings = () => {
    if (apiKeys.togetherAI) {
      localStorage.setItem('togetherAIKey', apiKeys.togetherAI);
      setModelStatus((prev) => ({ ...prev, together: 'configured' }));
    }
    localStorage.setItem('ollamaHost', apiKeys.ollamaHost);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'configured':
      case 'connected':
        return <i className="fas fa-circle-check me-1" />;
      case 'not-configured':
        return <i className="fas fa-triangle-exclamation me-1" />;
      case 'checking':
        return <i className="fas fa-spinner fa-spin me-1" />;
      case 'not-running':
      case 'not-responding':
        return <i className="fas fa-circle-xmark me-1" />;
      default:
        return <i className="fas fa-circle-question me-1" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'configured': '#10b981',
      'connected': '#10b981',
      'not-configured': '#f59e0b',
      'not-running': '#ef4444',
      'checking': '#6366f1',
      'not-responding': '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>AI Models & API Configuration</h2>
        <p>Manage your AI model providers and API keys</p>
      </div>

      <div className={styles.modelsGrid}>
        {/* Gemini */}
        <div className={styles.modelCard}>
          <div className={styles.modelHeader}>
            <span className={styles.modelIcon}>
              <i className="fas fa-bolt" style={{ color: '#4285f4' }} />
            </span>
            <h3>Google Gemini</h3>
          </div>
          <p className={styles.description}>Default AI model powered by Google</p>
          <div className={styles.status}>
            <span className={styles.statusBadge} style={{ backgroundColor: '#10b981' }}>
              <i className="fas fa-circle-check me-1" /> Configured
            </span>
          </div>
          <div className={styles.details}>
            <p>• Ultra-fast responses</p>
            <p>• Excellent quality</p>
            <p>• Already set up</p>
          </div>
        </div>

        {/* Hugging Face */}
        <div className={styles.modelCard}>
          <div className={styles.modelHeader}>
            <span className={styles.modelIcon}>
              <i className="fas fa-microchip" style={{ color: '#fbbf24' }} />
            </span>
            <h3>Hugging Face</h3>
          </div>
          <p className={styles.description}>Open-source models from Hugging Face Hub</p>
          <div className={styles.status}>
            <span className={styles.statusBadge} style={{ backgroundColor: '#10b981' }}>
              <i className="fas fa-circle-check me-1" /> Configured
            </span>
          </div>
          <div className={styles.details}>
            <p>• Free tier available</p>
            <p>• Multiple models</p>
            <p>• API key already added</p>
          </div>
        </div>

        {/* Together.ai */}
        <div className={styles.modelCard}>
          <div className={styles.modelHeader}>
            <span className={styles.modelIcon}>
              <i className="fas fa-fire" style={{ color: '#ef4444' }} />
            </span>
            <h3>Together.ai</h3>
          </div>
          <p className={styles.description}>High-performance open-source models</p>
          <div className={styles.status}>
            <span
              className={styles.statusBadge}
              style={{
                backgroundColor: apiKeys.togetherAI ? '#10b981' : '#f59e0b',
              }}
            >
              {getStatusIcon(modelStatus.together)} {apiKeys.togetherAI ? 'Configured' : 'Not Set'}
            </span>
          </div>
          <div className={styles.details}>
            <p>• 70B+ parameter models</p>
            <p>• Very fast inference</p>
            <p>• Free tier available</p>
          </div>
          <div className={styles.inputGroup}>
            <label>API Key:</label>
            <input
              type="password"
              value={apiKeys.togetherAI}
              onChange={(e) =>
                setApiKeys((prev) => ({ ...prev, togetherAI: e.target.value }))
              }
              placeholder="Paste your Together.ai API key"
              className={styles.input}
            />
            <a
              href="https://www.together.ai/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Get API Key →
            </a>
          </div>
        </div>

        {/* Ollama */}
        <div className={styles.modelCard}>
          <div className={styles.modelHeader}>
            <span className={styles.modelIcon}>
              <i className="fas fa-laptop-code" style={{ color: '#8b5cf6' }} />
            </span>
            <h3>Ollama (Local)</h3>
          </div>
          <p className={styles.description}>Run AI models locally on your machine</p>
          <div className={styles.status}>
            <span
              className={styles.statusBadge}
              style={{ backgroundColor: getStatusColor(modelStatus.ollama) }}
            >
              {getStatusIcon(modelStatus.ollama)} {modelStatus.ollama}
            </span>
          </div>
          <div className={styles.details}>
            <p>• No API key needed</p>
            <p>• Complete privacy</p>
            <p>• Works offline</p>
          </div>
          <div className={styles.inputGroup}>
            <label>Ollama Host:</label>
            <input
              type="text"
              value={apiKeys.ollamaHost}
              onChange={(e) =>
                setApiKeys((prev) => ({ ...prev, ollamaHost: e.target.value }))
              }
              placeholder="http://localhost:11434"
              className={styles.input}
            />
            <button
              className={styles.testButton}
              onClick={checkOllamaStatus}
            >
              Test Connection
            </button>
            <a
              href="https://ollama.ai"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Install Ollama →
            </a>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className={styles.footer}>
        <button className={styles.saveButton} onClick={handleSaveSettings}>
          <i className="fas fa-floppy-disk me-2" /> Save Settings
        </button>
        {showSaved && (
          <div className={styles.savedNotification}>
            <i className="fas fa-circle-check me-1" /> Settings saved successfully!
          </div>
        )}
      </div>

      {/* Quick Setup Guide */}
      <div className={styles.setupGuide}>
        <h3>Quick Setup Guide</h3>

        <div className={styles.setupStep}>
          <h4>1. Set Up Together.ai (Optional)</h4>
          <ol>
            <li>Go to <a href="https://www.together.ai/" target="_blank" rel="noopener noreferrer">together.ai</a></li>
            <li>Create an account and sign in</li>
            <li>Go to <a href="https://www.together.ai/settings/keys" target="_blank" rel="noopener noreferrer">API Keys</a></li>
            <li>Copy your API key and paste it above</li>
            <li>Click Save Settings</li>
          </ol>
        </div>

        <div className={styles.setupStep}>
          <h4>2. Set Up Ollama (Optional)</h4>
          <ol>
            <li>Install Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer">ollama.ai</a></li>
            <li>Run <code>ollama serve</code> in terminal</li>
            <li>Download models: <code>ollama pull mistral</code> or <code>ollama pull llama2</code></li>
            <li>Make sure Ollama is running and click Test Connection above</li>
          </ol>
        </div>

        <div className={styles.setupStep}>
          <h4>3. Key Benefits</h4>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            <li><i className="fas fa-check text-success me-2" /> Multiple model options to choose from</li>
            <li><i className="fas fa-check text-success me-2" /> Automatic fallback if primary model fails</li>
            <li><i className="fas fa-check text-success me-2" /> Better results by comparing different models</li>
            <li><i className="fas fa-check text-success me-2" /> Local privacy with Ollama</li>
          </ul>
        </div>
      </div>

      {/* Model Comparison */}
      <div className={styles.comparison}>
        <h3>Model Comparison</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Model</th>
              <th>Provider</th>
              <th>Speed</th>
              <th>Quality</th>
              <th>Setup</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gemini 2.5 Flash</td>
              <td>Google</td>
              <td>Very Fast</td>
              <td>Excellent</td>
              <td><span style={{ color: '#10b981', fontWeight: 600 }}><i className="fas fa-circle-check me-1" /> Ready</span></td>
            </tr>
            <tr>
              <td>Mistral 7B</td>
              <td>Hugging Face</td>
              <td>Fast</td>
              <td>Very Good</td>
              <td><span style={{ color: '#10b981', fontWeight: 600 }}><i className="fas fa-circle-check me-1" /> Ready</span></td>
            </tr>
            <tr>
              <td>LLaMA 2 70B</td>
              <td>Together.ai</td>
              <td>Fast</td>
              <td>Excellent</td>
              <td><span style={{ color: '#64748b', fontWeight: 500 }}>Optional</span></td>
            </tr>
            <tr>
              <td>Mistral (Local)</td>
              <td>Ollama</td>
              <td>Moderate</td>
              <td>Very Good</td>
              <td><span style={{ color: '#64748b', fontWeight: 500 }}>Optional</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AIModelsSettings;
