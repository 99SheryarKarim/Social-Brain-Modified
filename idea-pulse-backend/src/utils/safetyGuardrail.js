/**
 * Safety and Ethical Guardrails Utility
 * Evaluates inputs locally before invoking AI models to save quota and enforce safety.
 */

// 1. Self-Harm & Suicide Patterns
const SELF_HARM_PATTERNS = [
  /suicide/i,
  /self-harm/i,
  /kill\s*(my|your)self/i,
  /end\s*(my|your)\s*life/i,
  /cut\s*(my|your)self/i,
  /hanging\s*(my|your)self/i,
  /overdose/i,
  /slitting\s*wrists/i,
  /want\s*to\s*die/i,
  /how\s*to\s*(commit\s*)?suicide/i,
  /self-mutilation/i
];

// 2. Illegal Activities, Cyberattacks, Weapons & Violence Patterns
const ILLEGAL_VIOLENCE_PATTERNS = [
  /how\s*to\s*make\s*(a\s*)?(bomb|explosive|meth|cocaine|weapon|gun|pipe\s*bomb)/i,
  /how\s*to\s*(hack|cyberattack|ddos|bypass|steal|murder|assassinate|poison\s*someone)/i,
  /build\s*a\s*(weapon|gun|bomb)/i,
  /hate\s*speech/i,
  /terrorist/i,
  /physical\s*harm/i,
  /how\s*to\s*kill/i
];

// 3. Unethical Content & Exploitation Patterns
const UNETHICAL_EXPLOITATION_PATTERNS = [
  /child\s*(exploitation|abuse|porn)/i,
  /non-consensual/i,
  /deepfake\s*nude/i,
  /blackmail/i,
  /extort/i,
  /doxx/i,
  /doxxing/i,
  /harass/i
];

// 4. Jailbreak Patterns
const JAILBREAK_PATTERNS = [
  /ignore\s*(all\s*)?(previous\s*)?(instructions|rules|safety|directives)/i,
  /act\s*as\s*(an\s*)?unfiltered/i,
  /dan\s*mode/i,
  /do\s*anything\s*now/i,
  /override\s*safety/i,
  /bypass\s*restrictions/i,
  /pretend\s*you\s*have\s*no\s*rules/i
];

/**
 * Check if a text prompt violates safety & ethical guardrails.
 * @param {string} text - User prompt or topic input
 * @returns {Object} { isSafe: boolean, message?: string, category?: string }
 */
function checkSafetyGuardrail(text) {
  if (!text || typeof text !== "string") {
    return { isSafe: true };
  }

  const normalized = text.toLowerCase().trim();

  // 1. Check Self-Harm & Suicide (with Crisis Lifeline Resources)
  for (const pattern of SELF_HARM_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        category: "self_harm",
        message:
          "I am not trained to provide assistance in such matters. If you or someone you know is struggling or in crisis, help is available. You can call or text 988 in the US and Canada to reach the Suicide & Crisis Lifeline, or contact your local emergency/crisis support services immediately.",
      };
    }
  }

  // 2. Check Illegal Activities & Violence
  for (const pattern of ILLEGAL_VIOLENCE_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        category: "illegal_violence",
        message: "I am not trained to provide assistance in such matters.",
      };
    }
  }

  // 3. Check Unethical Content & Exploitation
  for (const pattern of UNETHICAL_EXPLOITATION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        category: "unethical_content",
        message: "I am not trained to provide assistance in such matters.",
      };
    }
  }

  // 4. Check Jailbreak Attempts
  for (const pattern of JAILBREAK_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        category: "jailbreak",
        message: "I am not trained to provide assistance in such matters.",
      };
    }
  }

  return { isSafe: true };
}

module.exports = {
  checkSafetyGuardrail,
};
