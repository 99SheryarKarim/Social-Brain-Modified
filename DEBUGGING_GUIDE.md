# DEBUGGING & CONFIGURATION GUIDE FOR CLAUDE AI

## CURRENT SETUP

**Repository**: https://github.com/99SheryarKarim/Social-brain-FYP  
**Branch**: main  
**Node Version**: v22.14.0  
**Backend Port**: 3001  
**Frontend Port**: 5173  
**Database**: SQLite (./database/socialbrain.db)

---

## ERROR REPRODUCTION

### Steps to See the Error
```bash
# Terminal 1: Start Backend
cd "C:\Users\z\Desktop\FYP\Social Brain code\social-brain-backend-main"
npm run dev
# Wait for: "Server is running on http://localhost:3001"

# Terminal 2: Start Frontend
cd "C:\Users\z\Desktop\FYP\Social Brain code\social-brain-frontend-main"
npm run dev
# Wait for: "Local: http://localhost:5173"

# Browser:
# 1. Open http://localhost:5173
# 2. Sign up: email=test@example.com, password=test123
# 3. Login with same credentials
# 4. Enter topic: "hello"
# 5. Click "Generate Ideas"
# 6. See error: "Failed to fetch ideas"
# 7. Check backend terminal for: "API key expired" error
```

### What You'll See in Backend Terminal
```
🚀 Generating 1 ideas with tone "Creative" for prompt: "hello"
Error extracting keywords: GoogleGenerativeAIError: [400 Bad Request] API key expired. 
Please renew the API key. [{"@type":"type.googleapis.com/google.rpc.ErrorInfo",
"reason":"API_KEY_INVALID","domain":"googleapis.com",...}]
```

---

## GOOGLE CLOUD CONSOLE CHECKLIST

### Step 1: Verify Billing is Enabled
```
1. Go to: https://console.cloud.google.com/billing
2. Look for your project
3. Make sure a payment method is attached (even for free tier!)
4. Check the billing account is "ACTIVE"
```

### Step 2: Enable Generative AI API
```
1. Go to: https://console.cloud.google.com/apis/library
2. Search for: "Generative AI API"
3. Click "Generative AI" or "Google AI for Developers"
4. Click "ENABLE"
5. Wait 30 seconds for it to activate
```

### Step 3: Create/Verify API Key
```
1. Go to: https://aistudio.google.com/app/apikey
2. You should see existing keys (if any)
3. If no keys: Click "Create API key in new project"
4. Copy the key exactly (no spaces!)
5. Paste it in: social-brain-backend-main/.env
   GOOGLE_API_KEY=YOUR_KEY_HERE
```

### Step 4: Test the API Key
```
1. Go to: https://aistudio.google.com
2. Click "Get API key"
3. Try the test prompt in their interface
4. If it works there, your key is valid
```

---

## POSSIBLE ROOT CAUSES

| Cause | How to Check | Solution |
|-------|-------------|----------|
| API Key Invalid | Test in Google AI Studio | Delete and create new key |
| Billing Not Enabled | Check Google Cloud Console | Enable billing with payment method |
| API Not Enabled | Check APIs & Services | Enable Generative AI API |
| Wrong Model Name | Check docs for available models | Use correct model ID |
| Rate Limited | Check quota in Cloud Console | Wait or upgrade plan |
| Regional Restriction | Check project location | Change region if needed |
| API Key Revoked | Check API key in Console | Create new API key |

---

## ADVANCED DEBUGGING

### Add Logging to Check What's Being Sent

**Edit: src/services/geminiService.js**

Add this at the top of the `extractKeywords` function:
```javascript
async function extractKeywords(userPrompt, limit = 25) {
  try {
    console.log("API Key:", process.env.GOOGLE_API_KEY); // ⚠️ REMOVE BEFORE PRODUCTION
    console.log("Initializing GoogleGenerativeAI...");
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log("GoogleGenerativeAI initialized");
    
    console.log("Getting model: gemini-pro");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("Model retrieved successfully");
    
    // ... rest of code
```

### Test the API Directly

**Create: test-gemini.js** (in backend root)
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testGemini() {
  try {
    console.log("API Key exists:", !!process.env.GOOGLE_API_KEY);
    console.log("API Key length:", process.env.GOOGLE_API_KEY?.length);
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log("✅ GoogleGenerativeAI initialized");
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("✅ Model retrieved");
    
    const result = await model.generateContent("What is 2+2?");
    console.log("✅ API call successful!");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
  }
}

testGemini();
```

**Run it**:
```bash
cd social-brain-backend-main
node test-gemini.js
```

---

## ALTERNATIVE SOLUTIONS FOR CLAUDE TO CONSIDER

### Option 1: Use Mock Data
```javascript
// For testing without API key
async function extractKeywords(userPrompt, limit = 25) {
  // Return mock keywords for testing
  return [
    "trending", "viral", "popular", "modern", "innovative",
    "creative", "engaging", "authentic", "inspiring", "powerful"
  ].slice(0, limit);
}
```

### Option 2: Use Different AI API
- **OpenAI API**: More reliable, good free tier
- **Anthropic Claude API**: Good alternative
- **Hugging Face**: Open source models
- **Local LLM**: Run locally without API key

### Option 3: Add Retry Logic
```javascript
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
    }
  }
}
```

---

## FILES TO SHARE WITH CLAUDE

You should provide Claude with:

1. ✅ **ISSUE_REPORT_FOR_CLAUDE.md** - Overview of the problem
2. ✅ **CODE_ANALYSIS_FOR_CLAUDE.md** - Code snippets and error chain
3. ✅ **DEBUGGING_GUIDE.md** - This file
4. ✅ **.env** - Current configuration (REDACT SENSITIVE DATA FIRST!)
5. ✅ **package.json** - Dependencies
6. ✅ **src/services/geminiService.js** - Where the error happens
7. ✅ **src/controllers/aiGenerationController.js** - Calls geminiService

---

## WHAT TO ASK CLAUDE

**Question 1**: "Why would a freshly created Google API key show 'API key expired' error immediately?"

**Question 2**: "Is there an issue with how we're initializing GoogleGenerativeAI from the @google/generative-ai package?"

**Question 3**: "Should we add any error handling or validation before calling the API?"

**Question 4**: "What are alternative AI services we could use as a fallback?"

**Question 5**: "Is there a way to test if the API key is valid before using it?"

---

## FINAL CHECKLIST

Before sharing with Claude, verify:

- [ ] You have the latest API key from https://aistudio.google.com/app/apikey
- [ ] Billing is enabled in Google Cloud Console
- [ ] Generative AI API is enabled
- [ ] You can test the API key in Google AI Studio interface
- [ ] You have all the files listed above
- [ ] You've removed any sensitive data before sharing

---

**Ready to ask Claude! Good luck! 🚀**
