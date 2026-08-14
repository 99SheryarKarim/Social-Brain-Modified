# 🧪 COMPLETE TESTING GUIDE - Weeks 2-4

## ✅ Pre-Testing Checklist

```
[ ] Backend running: npm run dev (social-brain-backend-main)
[ ] Frontend running: npm run dev (social-brain-frontend-main)
[ ] HuggingFace API key set in .env ✅ Already done
[ ] Together.ai API key ready (optional for Week 2)
[ ] Ollama installed (optional for Week 3)
```

---

## 🧪 WEEK 2: Together.ai Testing

### Test 1: API Key Setup

```bash
# Step 1: Get key from https://www.together.ai/settings/keys

# Step 2: Add to .env
TOGETHER_API_KEY=b1_your_actual_key_here

# Step 3: Verify .env has the key
cat .env | grep TOGETHER_API_KEY
# Should output: TOGETHER_API_KEY=b1_...

# Step 4: Restart backend
npm run dev
```

### Test 2: Frontend Model Selector

**Expected:** LLaMA 2 70B appears in dropdown

```
1. Open browser to http://localhost:5173
2. Navigate to Post Genie page
3. Look at model dropdown (above prompt)
4. Scroll through dropdown
5. Should see:
   - Google Gemini 2.5 Flash 🚀
   - Mistral 7B Instruct (HF) ⚡
   - LLaMA 2 7B Chat (HF) 🦙
   - LLaMA 2 70B (Together.ai) 🔥
   - Mistral 7B (Together.ai) ⚡
   - Nous Hermes 2 (Together.ai) 🧠
   - And Ollama models below
```

### Test 3: Generate with Together Model

```
1. Select "LLaMA 2 70B (Together.ai)" from dropdown
2. Type prompt: "Write funny social media posts about coffee"
3. Click Generate
4. Wait 5-15 seconds
5. Should get posts generated ✅
6. Check browser console → should see dataSource: "together"
```

### Test 4: Fallback Test (Simulate Failure)

```
1. Temporarily modify .env
   TOGETHER_API_KEY=invalid_key_to_test_fallback

2. Restart backend

3. Select "LLaMA 2 70B (Together.ai)"

4. Generate posts

5. Should automatically fallback to Gemini ✅

6. Check console → will see error logged, then "falling back to Gemini"

7. Posts will be generated but with Gemini, not Together

8. Put correct key back in .env
```

### Test 5: Terminal/CURL Test

```bash
# Make sure Together API key is in .env

curl -X POST http://localhost:3001/api/posts/generate-ideas \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "productivity tips for work",
    "num_posts": 3,
    "tone": "professional",
    "model": "togethercomputer/llama-2-70b-chat"
  }'

# Expected response:
# {
#   "post_prompts": [
#     {"prompt": "idea 1", "hashtags": ""},
#     {"prompt": "idea 2", "hashtags": ""},
#     {"prompt": "idea 3", "hashtags": ""}
#   ],
#   "isMockData": false,
#   "dataSource": "together",
#   "model": "togethercomputer/llama-2-70b-chat"
# }
```

**Verify:** dataSource shows "together" (not "api" or "mock")

---

## 🧪 WEEK 3: Ollama Testing

### Prerequisites

```bash
# Step 1: Install Ollama
# Go to https://ollama.ai and download
# Install and follow setup

# Step 2: Verify installation
ollama --version
# Should print version (e.g., 0.1.35)

# Step 3: Start Ollama server (NEW TERMINAL)
ollama serve
# Should show: "Listening on 127.0.0.1:11434"

# Step 4: Download a model (ANOTHER NEW TERMINAL)
ollama pull mistral
# Downloads model (takes 5-10 minutes, ~7GB)

# Optional: Download more models
ollama pull llama2        # Another 7GB
ollama pull neural-chat   # 5GB

# Step 5: List installed models
ollama list
# Should show: mistral, llama2, neural-chat, etc.
```

### Test 1: Check Ollama Running

```bash
# Terminal test
curl http://localhost:11434/api/tags

# Expected response:
# {
#   "models": [
#     {"name": "mistral:latest", ...},
#     {"name": "llama2:latest", ...}
#   ]
# }

# If error "Connection refused" → Ollama not running
# Run: ollama serve
```

### Test 2: Frontend - See Ollama Models

**Expected:** Ollama models in dropdown

```
1. Browser at http://localhost:5173
2. Post Genie page
3. Open model dropdown
4. Should see at bottom:
   - Mistral (Local) 💻
   - LLaMA 2 (Local) 🦙
   - Neural Chat (Local) 💬
```

### Test 3: Generate with Ollama Model

```
1. Make sure ollama serve is running
2. Select "Mistral (Local)" from dropdown
3. Type prompt: "Tips for healthy lifestyle"
4. Click Generate
5. WAIT 20-60 seconds (local processing is slower!)
6. Should get posts ✅
7. Check console → dataSource: "ollama"
```

**Note:** Ollama is SLOWER than cloud services. 20-60 seconds is normal.

### Test 4: Ollama Settings Test

```
1. Go to Settings page (if you've added the route)
2. Scroll to Ollama section
3. Should show host: http://localhost:11434
4. Click "Test Connection" button
5. Should show ✅ Connected
6. If Ollama not running: ❌ Not running (then start it)
7. Click "Save Settings"
8. Models now available in selector
```

### Test 5: Terminal/CURL Test

```bash
# Make sure ollama serve is running

curl -X POST http://localhost:3001/api/posts/generate-ideas \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "creative writing ideas",
    "num_posts": 2,
    "tone": "creative",
    "model": "ollama-mistral"
  }'

# Expected response:
# {
#   "post_prompts": [
#     {"prompt": "idea 1", "hashtags": ""}
#   ],
#   "isMockData": false,
#   "dataSource": "ollama",
#   "model": "ollama-mistral"
# }
```

**Verify:** dataSource shows "ollama"

### Test 6: Fallback Test (Ollama Down)

```
1. Stop ollama serve (Ctrl+C in terminal)
2. Try to generate with "Mistral (Local)"
3. Should see error in console
4. Then fallback to Gemini
5. Posts still generated ✅
6. Start ollama again: ollama serve
```

---

## 🧪 WEEK 4: Settings Component Testing

### Test 1: Route Setup

```jsx
// In your routing file (e.g., App.jsx)
import AIModelsSettings from './components/ai-models-settings/AIModelsSettings';

// Add route:
<Route path="/settings/ai-models" element={<AIModelsSettings />} />

// OR add link to sidebar:
<a href="/settings/ai-models">AI Models Settings</a>
```

### Test 2: Settings Page Loads

```
1. Navigate to http://localhost:5173/settings/ai-models
2. Should see:
   - Header: "🤖 AI Models & API Configuration"
   - 4 model cards: Gemini, HuggingFace, Together.ai, Ollama
   - Each showing status badge
   - Save Settings button at bottom
```

### Test 3: Model Status Display

**Expected:** Correct status for each provider

```
Card 1: Gemini
  Status: ✅ Configured

Card 2: Hugging Face
  Status: ✅ Configured

Card 3: Together.ai
  Status: ⚠️ Not Set (if no API key yet)
  OR: ✅ Configured (if API key entered)

Card 4: Ollama
  Status: ❌ Not running (if Ollama not started)
  OR: ✅ Connected (if Ollama is running)
```

### Test 4: Add Together.ai API Key

```
1. On Together.ai card, find API Key input field
2. Paste your Together API key
3. Should show placeholder text
4. Status badge should still show ⚠️
5. Click "Get API Key →" link
   - Should open https://www.together.ai/settings/keys
6. Click Save Settings button
7. Should see ✅ "Settings saved successfully!"
8. Status should now show ✅ Configured
9. Page refresh - key should still be there ✅
```

### Test 5: Ollama Connection Test

```
1. Make sure ollama serve is running
2. On Ollama card, find "Test Connection" button
3. Click it
4. Status badge should change to ✅ Connected
5. Now stop Ollama (Ctrl+C)
6. Click "Test Connection" again
7. Status badge should show ❌ Not running
8. Start Ollama again
9. Click "Test Connection"
10. Status should update to ✅ Connected
```

### Test 6: Setup Guide Section

```
1. Scroll down on settings page
2. Should see "Quick Setup Guide"
3. Should have 3 sections:
   - 1️⃣ Set Up Together.ai (Optional)
   - 2️⃣ Set Up Ollama (Optional)
   - 3️⃣ Benefits
4. All links should work:
   - "Get API Key →" → together.ai/settings/keys
   - "Install Ollama →" → ollama.ai
```

### Test 7: Model Comparison Table

```
1. Scroll to bottom of settings page
2. Should see comparison table with columns:
   - Model
   - Provider
   - Speed
   - Quality
   - Setup
3. Should have 5 rows:
   - Gemini 2.5 Flash
   - Mistral 7B
   - LLaMA 2 70B
   - Mistral (Local)
   - And others
4. Speed ratings: ⚡ to ⚡⚡⚡
5. Quality ratings: ⭐ to ⭐⭐⭐
```

### Test 8: Settings Persistence

```
1. Enter Together API key
2. Click Save Settings
3. Refresh page (F5)
4. Key should still be there ✅
5. Close browser
6. Reopen
7. Key should still be there ✅
(Saved in localStorage)
```

---

## 🧪 Integration Tests

### Test 1: All Models in Selector

```
Go to Post Genie page
Open model dropdown
Count models - should see 9 total:

✅ Google Gemini 2.5 Flash
✅ Mistral 7B Instruct (HF)
✅ LLaMA 2 7B Chat (HF)
✅ LLaMA 2 70B (Together)
✅ Mistral 7B (Together)
✅ Nous Hermes (Together)
✅ Mistral (Local)
✅ LLaMA 2 (Local)
✅ Neural Chat (Local)
```

### Test 2: Each Model Works

```bash
# Test each model with CURL

# Gemini
curl -X POST http://localhost:3001/api/posts/generate-ideas \
  -d '{"prompt":"test","num_posts":1,"tone":"casual","model":"gemini-2.5-flash"}'

# Hugging Face
curl -X POST http://localhost:3001/api/posts/generate-ideas \
  -d '{"prompt":"test","num_posts":1,"tone":"casual","model":"mistralai/Mistral-7B-Instruct-v0.1"}'

# Together.ai (requires API key)
curl -X POST http://localhost:3001/api/posts/generate-ideas \
  -d '{"prompt":"test","num_posts":1,"tone":"casual","model":"togethercomputer/llama-2-70b-chat"}'

# Ollama (requires ollama serve running)
curl -X POST http://localhost:3001/api/posts/generate-ideas \
  -d '{"prompt":"test","num_posts":1,"tone":"casual","model":"ollama-mistral"}'

# Each should respond with dataSource showing correct provider
```

### Test 3: Fallback Chain

```
1. Ensure all services configured
2. For each provider, test fallback:
   - Disable API key for that provider
   - Try to generate
   - Should fallback to Gemini
   - Should see console log with warning
   - Posts still generated ✅
```

### Test 4: Load Testing

```
Generate 10 posts in a row:
1. Select a model
2. Generate 3 posts
3. Then 3 more
4. Then 3 more
5. Should not crash
6. Should handle rate limits gracefully
```

---

## 🐛 Debugging Guide

### Issue: Model not showing in dropdown

**Debug Steps:**
```bash
1. Check ModelSelector.jsx has model in AVAILABLE_MODELS
2. Check models.js has model configured
3. Clear browser cache (Ctrl+Shift+Delete)
4. Refresh page
5. Restart frontend (npm run dev)
```

### Issue: Generation fails silently

**Debug Steps:**
```bash
1. Open browser DevTools (F12)
2. Go to Network tab
3. Generate posts
4. Check POST to /api/posts/generate-ideas
5. Look at Response
6. Should show error message
7. Check server console for more details
```

### Issue: Together.ai not working

**Debug Steps:**
```bash
1. Check API key in .env: TOGETHER_API_KEY=b1_...
2. Verify key format (starts with b1_)
3. Go to https://www.together.ai/settings/keys
4. Verify key is still valid (not expired/revoked)
5. Test with CURL (see above)
6. Check internet connection
```

### Issue: Ollama not working

**Debug Steps:**
```bash
1. Check Ollama is running: ollama serve
2. Check models installed: ollama list
3. Test manually: curl http://localhost:11434/api/tags
4. Verify OLLAMA_HOST in .env: http://localhost:11434
5. Check firewall not blocking localhost:11434
6. Try different model: ollama pull llama2
```

### Issue: Settings not saving

**Debug Steps:**
```bash
1. Check browser allows localStorage
2. Open DevTools → Applications → Local Storage
3. Should see entries for:
   - togetherAIKey
   - ollamaHost
4. Check browser isn't in private/incognito mode
5. Try clearing cache and localStorage
```

---

## ✅ Final Verification Checklist

Before showing to professor:

```
[ ] All 9 models showing in dropdown
[ ] Gemini model works
[ ] At least one HF model works
[ ] Together.ai model works (with API key)
[ ] Ollama model works (if installed)
[ ] Settings page accessible
[ ] API key can be entered in settings
[ ] Ollama connection can be tested
[ ] Model comparison table visible
[ ] Quick setup guide visible
[ ] Fallback mechanism works
[ ] No console errors
[ ] Responsive on mobile
[ ] All links in settings work
```

---

## 🎯 Performance Benchmarks

Typical response times:

```
Gemini 2.5 Flash:      2-3 seconds ✅
Mistral 7B (HF):       5-10 seconds
Mistral 7B (Together): 3-5 seconds
LLaMA 2 70B:           5-15 seconds
LLaMA 2 (Ollama):      20-60 seconds
Neural Chat (Ollama):  15-45 seconds
```

**Note:** Times vary based on:
- Internet connection
- Server load
- Model complexity
- Input prompt length

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Model not showing | Refresh page, check models.js |
| Generation timeout | Model may be loading, wait 30s |
| "API key not configured" | Add to .env, restart backend |
| "Ollama not running" | Run `ollama serve` in terminal |
| Settings not saving | Check localStorage enabled |
| Fallback not working | Check console logs for errors |
| Very slow response | Check internet, try Gemini |

---

**Ready to test?** Start with the Week 2 tests above! 🚀

Generated: 2026-07-24
