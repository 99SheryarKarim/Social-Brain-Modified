# 🚀 Multi-Model Integration - Week 1 Setup Guide

## ✅ What's Been Implemented (Week 1)

### **Backend Changes**

1. **`src/config/models.js`** - Model Configuration
   - Centralized configuration for all available models
   - Support for Gemini, Hugging Face, Together.ai, and Ollama
   - Model metadata: name, description, provider, response time, quality

2. **`src/services/huggingFaceService.js`** - Hugging Face Integration
   - Implements same interface as Gemini service
   - `generatePostPrompts()` - Generate post ideas
   - `generatePostContent()` - Generate full post content
   - Rate limiting built-in to respect API quotas
   - Error handling for 429 (rate limit) and 503 (model loading) errors

3. **`src/services/modelRouter.js`** - Service Routing
   - **Adapter Pattern** - Routes requests to the correct service
   - `generatePostPromptsWithFallback()` - Falls back to Gemini if HF fails
   - `generatePostContentWithFallback()` - Falls back to Gemini if HF fails
   - Smart error handling with automatic fallback

4. **Updated `src/controllers/aiGenerationController.js`**
   - Now uses `modelRouter` instead of direct Gemini service
   - Passes `model` parameter through the pipeline
   - Returns provider information in response

5. **Updated `.env`**
   - Added `HUGGINGFACE_API_KEY` (currently empty - you need to add this)
   - Added placeholders for Week 2 (Together.ai) and Week 3 (Ollama)

### **Frontend Changes**

1. **`src/components/model-selector/ModelSelector.jsx`** - New Component
   - Beautiful dropdown UI for model selection
   - Shows model info: name, description, response time, quality
   - Provider badges with color coding
   - Smooth animations and transitions
   - Mobile responsive design

2. **`src/components/model-selector/ModelSelector.module.css`** - Styling
   - Modern gradient background
   - Floating animation on badge
   - Dropdown with smooth animations
   - Responsive design for mobile

3. **Updated `src/pages/post-genie/PostGeniePage.jsx`**
   - Replaced old model select with new `ModelSelector` component
   - Automatically saves model selection to localStorage
   - Passes selected model to backend via Redux

---

## 🔑 Setup: Get Hugging Face API Key

### **Step 1: Create Hugging Face Account**
1. Go to [huggingface.co](https://huggingface.co)
2. Click "Sign Up" (top right)
3. Create an account with email/Google/GitHub

### **Step 2: Get API Token**
1. Click your profile icon (top right) → "Settings"
2. Go to "Access Tokens" in the left menu
3. Click "New token"
4. Set permissions:
   - Name: "Idea Pulse"
   - Role: "read" (only read access needed)
5. Copy the token (starts with `hf_`)

### **Step 3: Add to .env**
Open `social-brain-backend-main/.env` and add:
```env
HUGGINGFACE_API_KEY=hf_your_token_here_paste_it_here
```

Replace `hf_your_token_here_paste_it_here` with your actual token!

---

## 🧪 How to Test Week 1

### **Test from Frontend:**

1. **Start the backend** (if not already running):
   ```bash
   cd social-brain-backend-main
   npm run dev
   ```

2. **Start the frontend** (if not already running):
   ```bash
   cd social-brain-frontend-main
   npm run dev
   ```

3. **Open PostGenie page** and look for the new **Model Selector** above the prompt input

4. **Try different models:**
   - Select "Mistral 7B Instruct" (Hugging Face)
   - Enter a prompt: "Write about healthy eating"
   - Click generate

5. **Check what happens:**
   - ✅ Should work with Hugging Face model
   - ✅ If HF fails, should automatically fall back to Gemini
   - ✅ Should show "huggingface" or "api" in dataSource

### **Test from Terminal (curl):**

```bash
# Generate ideas with Hugging Face model
curl -X POST http://localhost:3001/api/posts/generate-ideas \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write about healthy eating",
    "num_posts": 3,
    "tone": "casual",
    "model": "mistralai/Mistral-7B-Instruct-v0.1"
  }'

# Should return:
# {
#   "post_prompts": [...],
#   "isMockData": false,
#   "dataSource": "huggingface",
#   "model": "mistralai/Mistral-7B-Instruct-v0.1"
# }
```

---

## ⚡ Available Models (Week 1)

| Model | Provider | Speed | Quality | API Key |
|-------|----------|-------|---------|---------|
| Gemini 2.5 Flash | Google | Very Fast ⚡⚡⚡ | Excellent ⭐⭐⭐ | ✅ Already Set |
| **Mistral 7B** | **Hugging Face** | **Medium ⚡⚡** | **Very Good ⭐⭐** | **⚠️ Needed** |
| FLAN-T5 XL | Hugging Face | Fast ⚡⚡ | Good ⭐ | ⚠️ Needed |
| LLaMA 2 7B | Hugging Face | Medium ⚡⚡ | Very Good ⭐⭐ | ⚠️ Needed |

---

## 📊 How It Works

### **Flow Diagram:**

```
User selects model in UI
         ↓
Frontend sends request with model ID
         ↓
Backend receives request → modelRouter
         ↓
modelRouter checks model provider:
  ├─ If "gemini" → Use Gemini Service
  ├─ If "huggingface" → Use HF Service
  ├─ If "together" → Use Together Service (Week 2)
  └─ If "ollama" → Use Ollama Service (Week 3)
         ↓
Service generates content
         ↓
If error → Fallback to Gemini
         ↓
Return result with provider info
         ↓
Frontend shows result + model used
```

---

## 🐛 Troubleshooting

### **"HUGGINGFACE_API_KEY not configured"**
- ❌ Solution: Add your HF token to `.env`

### **"Rate limit exceeded"**
- ❌ Solution: Free tier has rate limits. Wait a moment and try again
- 💡 Tip: Gemini fallback will activate

### **"Model is loading"**
- ❌ Solution: Hugging Face is spinning up the model. Takes 10-30 seconds
- 💡 Tip: Try again in a moment, or select a different model

### **Model selector not showing**
- ❌ Solution: Clear browser cache and refresh
- ❌ Or: Restart frontend with `npm run dev`

### **Old model select still showing**
- ❌ Solution: Check that you're on the updated version
- 💡 Tip: Use `npm run build` to compile fresh

---

## 🎓 What To Show Your Professor

✅ **Architecture:**
- Service adapter pattern (easily extensible)
- Model router with fallback mechanism
- Unified interface across providers

✅ **Tech Stack:**
- Multiple AI providers integrated
- React component with real-time model selection
- Automatic fallback for reliability

✅ **User Features:**
- Beautiful UI for model selection
- Model comparison (speed, quality)
- Seamless provider switching

✅ **Error Handling:**
- Rate limit handling
- Fallback to Gemini
- User-friendly error messages

---

## 📝 Next Steps (Week 2)

Ready to add **Together.ai** as a backup provider?

### Week 2 Tasks:
1. Get Together.ai API key
2. Create `huggingFaceService.js` (similar to HF service)
3. Add Together.ai models to config
4. Update modelRouter to support Together.ai
5. Test with multiple models

---

## ❓ Questions?

- **Hugging Face docs:** https://huggingface.co/docs/hub/security-tokens
- **Together.ai docs:** https://www.together.ai/ (for Week 2)
- **Your models:** Check config in `src/config/models.js`

---

**Completed by:** GitHub Copilot
**Date:** 2026-07-24
**Status:** ✅ Week 1 Ready for Testing
