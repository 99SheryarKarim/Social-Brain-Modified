/**
 * IdeaPulse Custom Fine-Tuned Model Service
 * ==========================================
 * Handles inference for the custom TinyLlama LoRA adapter trained on idea_pulse_dataset.json.
 *
 * Connection strategy (tried in order):
 *   1. Local Python Flask sidecar  → http://localhost:5050  (serve_custom_model.py)
 *   2. Hugging Face Inference API  → CUSTOM_MODEL_HF_REPO env var (once pushed to Hub)
 *   3. Graceful fallback           → Gemini 2.5 Flash (always available)
 *
 * To start the local sidecar:
 *   cd idea-pulse-backend
 *   python serve_custom_model.py
 */

const axios = require("axios");
const geminiService = require("./geminiService");

// ─── Configuration ─────────────────────────────────────────────────────────────

/** URL of the local Python Flask sidecar (serve_custom_model.py) */
const SIDECAR_URL = process.env.CUSTOM_MODEL_URL || "http://localhost:5050";

/** Optional: Hugging Face Inference API for the pushed LoRA model */
const HF_API_URL = process.env.CUSTOM_MODEL_HF_URL || null;
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || null;

/** Timeout in ms for the sidecar — local inference can be slow on CPU */
const SIDECAR_TIMEOUT_MS = 60000;   // 60 s
const HF_TIMEOUT_MS      = 30000;   // 30 s

// ─── Alpaca prompt template (must match training script) ───────────────────────

const INSTRUCTION_TEXT =
  "You are Idea Pulse AI, a social media engine. Given a topic, tone, and target niche, " +
  "generate a complete post, relevant hashtags, and image search keywords.";

function buildAlpacaPrompt(input) {
  return `### Instruction:\n${INSTRUCTION_TEXT}\n\n### Input:\n${input}\n\n### Response:\n`;
}

// ─── Response parser ───────────────────────────────────────────────────────────

/**
 * Parse the model's raw text output into structured fields.
 * Expected format from training:
 *   POST: <text>
 *   HASHTAGS: #tag1 #tag2
 *   IMAGE_KEYWORDS: keyword1 keyword2
 */
function parseModelOutput(rawText = "") {
  const text = rawText.trim();

  // Extract POST section
  const postMatch = text.match(/POST:\s*([\s\S]*?)(?=\nHASHTAGS:|$)/i);
  const content   = postMatch ? postMatch[1].trim() : text;

  // Extract HASHTAGS
  const hashtagMatch   = text.match(/HASHTAGS:\s*([^\n]+)/i);
  const rawHashtags    = hashtagMatch ? hashtagMatch[1].trim() : "";
  const cleanHashtags  = rawHashtags
    .split(/[\s,]+/)
    .filter((w) => w.startsWith("#") && w.length > 1)
    .slice(0, 5)
    .join(" ");

  // Extract IMAGE_KEYWORDS
  const imgMatch    = text.match(/IMAGE_KEYWORDS:\s*([^\n]+)/i);
  const imagePrompt = imgMatch ? imgMatch[1].trim() : "";

  return {
    content     : content   || text,
    hashtags    : cleanHashtags || `#IdeaPulse`,
    imagePrompt : imagePrompt   || "social media content",
  };
}

// ─── Connectivity check ────────────────────────────────────────────────────────

let _sidecarAvailable = null;   // cached result; null = untested

async function checkSidecarAvailable() {
  if (_sidecarAvailable !== null) return _sidecarAvailable;
  try {
    await axios.get(`${SIDECAR_URL}/health`, { timeout: 3000 });
    _sidecarAvailable = true;
    console.log("✅ Custom model sidecar is reachable at", SIDECAR_URL);
  } catch {
    _sidecarAvailable = false;
    console.warn("⚠️  Custom model sidecar not reachable at", SIDECAR_URL,
      "— will use Gemini fallback.");
  }
  // Reset cache after 2 minutes so a sidecar started later gets detected
  setTimeout(() => { _sidecarAvailable = null; }, 2 * 60 * 1000);
  return _sidecarAvailable;
}

// ─── Core inference helpers ────────────────────────────────────────────────────

/**
 * Call the local Python Flask sidecar.
 * Endpoint: POST /generate
 * Body: { prompt: string }
 * Response: { generated_text: string }
 */
async function callSidecar(prompt) {
  const response = await axios.post(
    `${SIDECAR_URL}/generate`,
    { prompt },
    { timeout: SIDECAR_TIMEOUT_MS }
  );
  const raw = response.data?.generated_text || response.data?.output || "";
  if (!raw) throw new Error("Sidecar returned empty response");
  return raw;
}

/**
 * Call the Hugging Face Inference API (if repo published).
 * Endpoint: POST https://api-inference.huggingface.co/models/<repo>
 */
async function callHuggingFaceEndpoint(prompt) {
  if (!HF_API_URL || !HF_API_KEY) throw new Error("HF endpoint not configured");
  const response = await axios.post(
    HF_API_URL,
    { inputs: prompt, parameters: { max_new_tokens: 350, temperature: 0.7 } },
    {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      timeout: HF_TIMEOUT_MS,
    }
  );
  const result = response.data;
  // HF returns [{ generated_text: "..." }] or { generated_text: "..." }
  const raw = Array.isArray(result)
    ? result[0]?.generated_text || ""
    : result?.generated_text || "";
  // Strip the prompt prefix that HF sometimes echoes back
  return raw.startsWith(prompt) ? raw.slice(prompt.length).trim() : raw.trim();
}

/**
 * Run inference through available backends, falling back in order:
 *   sidecar → HF endpoint → Gemini
 */
async function runInference(prompt, topicForFallback, toneForFallback) {
  // 1. Try local sidecar
  if (await checkSidecarAvailable()) {
    try {
      const raw = await callSidecar(prompt);
      console.log("🤖 [IdeaPulse AI] Inference via local sidecar");
      return { rawText: raw, via: "sidecar" };
    } catch (err) {
      console.warn("Sidecar inference failed:", err.message);
      _sidecarAvailable = null; // force recheck next time
    }
  }

  // 2. Try Hugging Face endpoint
  if (HF_API_URL) {
    try {
      const raw = await callHuggingFaceEndpoint(prompt);
      console.log("🤖 [IdeaPulse AI] Inference via Hugging Face endpoint");
      return { rawText: raw, via: "huggingface" };
    } catch (err) {
      console.warn("HF endpoint inference failed:", err.message);
    }
  }

  // 3. Gemini fallback — always works
  console.log("🔄 [IdeaPulse AI] Falling back to Gemini");
  return null;   // caller detects null and uses Gemini
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate post idea prompts using the custom model.
 */
async function generatePostPrompts(userTopic, tone, numPosts, brandSettings = {}) {
  try {
    const niche = brandSettings?.target_audience || "General";
    const ideas = [];
    let usedVia = null;

    for (let i = 0; i < numPosts; i++) {
      const input  = `Topic: ${userTopic}, Tone: ${tone}, Niche: ${niche}`;
      const prompt = buildAlpacaPrompt(input);
      const result = await runInference(prompt, userTopic, tone);

      if (result) {
        usedVia = `custom-${result.via}`;
        const parsed = parseModelOutput(result.rawText);
        ideas.push(parsed.content || `Post idea about ${userTopic}`);
      } else {
        const fallback = await geminiService.generatePostPromptsWithTracking(
          userTopic, [], tone, 1, brandSettings, "gemini-2.5-flash"
        );
        ideas.push(...(fallback.prompts || [`Post idea about ${userTopic}`]));
      }
    }

    return {
      prompts: ideas.slice(0, numPosts),
      provider: usedVia || "custom",
    };
  } catch (err) {
    console.warn("[customModelService] generatePostPrompts error:", err.message);
    const fallback = await geminiService.generatePostPromptsWithTracking(
      userTopic, [], tone, numPosts, brandSettings, "gemini-2.5-flash"
    );
    return {
      prompts: fallback.prompts,
      provider: "gemini-fallback",
    };
  }
}

/**
 * Generate full post content (text + hashtags + imagePrompt) using the custom model.
 */
async function generatePostContent(idea, tone, numWords = 150, originalTopic = "", brandSettings = {}) {
  const topic = originalTopic || idea;
  const niche = brandSettings?.target_audience || "General";

  try {
    const input  = `Topic: ${topic}, Tone: ${tone}, Niche: ${niche}`;
    const prompt = buildAlpacaPrompt(input);
    const result = await runInference(prompt, topic, tone);

    if (result) {
      const parsed = parseModelOutput(result.rawText);
      return {
        content     : parsed.content,
        hashtags    : parsed.hashtags,
        imagePrompt : parsed.imagePrompt,
        provider    : `custom-${result.via}`,
        isMock      : false,
      };
    }

    // Gemini fallback
    const fallback = await geminiService.generatePostContentWithTracking(
      idea, tone, numWords, topic, brandSettings, "gemini-2.5-flash"
    );
    return { ...fallback, provider: "gemini-fallback" };
  } catch (err) {
    console.warn("[customModelService] generatePostContent error:", err.message);
    const fallback = await geminiService.generatePostContentWithTracking(
      idea, tone, numWords, topic, brandSettings, "gemini-2.5-flash"
    );
    return { ...fallback, provider: "gemini-fallback" };
  }
}

/**
 * Health check — returns true if at least one backend (sidecar or HF) is live.
 */
async function isAvailable() {
  if (await checkSidecarAvailable()) return true;
  if (HF_API_URL && HF_API_KEY) return true;
  return false;   // Gemini fallback will be used transparently
}

module.exports = {
  generatePostPrompts,
  generatePostContent,
  isAvailable,
  SIDECAR_URL,
};
