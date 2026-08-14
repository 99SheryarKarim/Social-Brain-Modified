require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const key = process.env.GOOGLE_API_KEY;
  console.log("\n========================================");
  console.log("🧪 GEMINI API DIAGNOSTIC TEST");
  console.log("========================================\n");
  
  console.log("📋 API Key Status:");
  console.log("  ✓ Key loaded:", !!key);
  console.log("  ✓ Key length:", key?.length || "N/A");
  console.log("  ✓ Key starts with:", key?.substring(0, 8) || "N/A");
  console.log("");

  if (!key) {
    console.error("❌ ERROR: GOOGLE_API_KEY not found in .env file!");
    console.log("\nPlease ensure your .env file contains:");
    console.log("  GOOGLE_API_KEY=your_api_key_here");
    process.exit(1);
  }

  try {
    console.log("🔧 Initializing GoogleGenerativeAI...");
    const genAI = new GoogleGenerativeAI(key);
    
    console.log("📌 Getting model: gemini-2.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    console.log("🚀 Sending test prompt...");
    const result = await model.generateContent("Say 'API works!' in 3 words.");
    
    const response = result.response.text();
    console.log("\n✅ SUCCESS! API is working!\n");
    console.log("📝 Response from Gemini:");
    console.log("  " + response);
    console.log("\n========================================");
    console.log("🎉 Your API key and configuration are valid!");
    console.log("========================================\n");
    
  } catch (err) {
    console.log("\n❌ FAILED! API returned an error.\n");
    console.log("⚠️  Error Details:");
    console.log("  Error Message:", err.message);
    console.log("  Error Status:", err.status || "N/A");
    console.log("  Error Code:", err.code || "N/A");
    console.log("");
    console.log("🔍 Troubleshooting Tips:");
    console.log("  1. Verify the API key is correct in .env");
    console.log("  2. Make sure it's from aistudio.google.com (not Google Cloud Console)");
    console.log("  3. Check if the key has expired in Google AI Studio");
    console.log("  4. Restart your backend after changing .env (npm run dev)");
    console.log("  5. Try creating a NEW key in AI Studio");
    console.log("");
    console.log("========================================\n");
    process.exit(1);
  }
}

test();
