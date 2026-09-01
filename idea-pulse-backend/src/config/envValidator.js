const requiredEnv = [
  'JWT_SECRET',
  'GOOGLE_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
  'FACEBOOK_CALLBACK_URL',
  'FACEBOOK_GRAPH_API_VERSION',
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_ID',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PUBLISHABLE_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
  'CLOUD_NAME',
  'CLOUD_API_KEY',
  'CLOUD_API_SECRET',
];

const optionalEnv = [
  'YOUTUBE_CLIENT_ID',
  'YOUTUBE_CLIENT_SECRET',
  'YOUTUBE_CALLBACK_URL',
  'HUGGINGFACE_API_KEY',
  'TOGETHER_API_KEY',
  'PEXELS_API_KEY',
];

function validateEnv() {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length === 0) return;

  const header = '\n\n\x1b[31mMissing required environment variables:\x1b[0m\n';
  const details = missing.map((name) => `  - ${name}`).join('\n');
  console.error(`${header}${details}\n\nPlease add them to your .env file or environment before starting the server.\n`);
  process.exit(1);
}

function logOptionalEnvStatus() {
  const missingOptional = optionalEnv.filter((name) => !process.env[name]);
  if (missingOptional.length === 0) return;

  console.warn(
    '\n\x1b[33mOptional AI environment variables missing; Gemini will be used as the fallback provider.\x1b[0m\n' +
      missingOptional.map((name) => `  - ${name}`).join('\n') +
      '\n'
  );
}

module.exports = validateEnv;
module.exports.logOptionalEnvStatus = logOptionalEnvStatus;

module.exports = validateEnv;
