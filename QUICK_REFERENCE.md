# ⚡ QUICK REFERENCE - Week 1 Multi-Model Integration

## 🎯 TL;DR

✅ **Hugging Face integration is DONE**
- Add API key to `.env`: `HUGGINGFACE_API_KEY=your_hf_token`
- Start backend & frontend as normal
- You'll see new model selector in Post Genie page
- Select any Hugging Face model and generate posts!

---

## 📦 What Changed

### New Components:
- `ModelSelector.jsx` - Beautiful model dropdown UI
- `huggingFaceService.js` - Hugging Face API calls
- `modelRouter.js` - Smart model routing
- `models.js` - Model configuration

### Updated Files:
- `aiGenerationController.js` - Uses model router
- `PostGeniePage.jsx` - Uses ModelSelector
- `.env` - Added HF API key placeholder

### Documentation:
- `WEEK1_SETUP_GUIDE.md` - Full setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Detailed overview
- `QUICK_REFERENCE.md` - This file

---

## 🔧 Setup in 3 Steps

### **Step 1: Get Hugging Face Token**
1. Go to [huggingface.co](https://huggingface.co) → Sign up
2. Settings → Access Tokens → New token
3. Copy your token (starts with `hf_`)

### **Step 2: Add to .env**
```env
HUGGINGFACE_API_KEY=hf_your_token_here
```

### **Step 3: Run & Test**
```bash
# Terminal 1
cd social-brain-backend-main
npm run dev

# Terminal 2
cd social-brain-frontend-main
npm run dev

# Then:
# - Open browser to http://localhost:5173
# - Go to Post Genie page
# - See new Model Selector ✨
# - Try generating with Mistral model
```

---

## 📊 Available Models (Week 1)

```
🚀 Gemini 2.5 Flash (RECOMMENDED)
   └─ Super fast, best quality
   └─ You already have API key

⚡ Mistral 7B Instruct (NEW)
   └─ Fast, very good quality
   └─ Open-source, free tier available

🎯 FLAN-T5 XL (NEW)
   └─ Good for social media
   └─ Fastest response time

🦙 LLaMA 2 Chat (NEW)
   └─ Very capable, chatty
   └─ Good for engaging content
```

---

## 💻 How It Works

```
User picks model → Backend routes to correct service
                 ↓
         [Service generates content]
                 ↓
         [Error? → Fallback to Gemini]
                 ↓
         Result returned to user
```

**Key Insight:** If Hugging Face fails, automatically uses Gemini. User doesn't see the switch!

---

## 🧪 Quick Test

### From UI:
1. Open Post Genie page
2. Click model dropdown (above prompt input)
3. Select "Mistral 7B Instruct"
4. Type prompt: "social media tips"
5. Click generate
6. ✅ Should work!

### From Terminal:
```bash
curl -X POST http://localhost:3001/api/posts/generate-ideas \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "healthy eating",
    "num_posts": 3,
    "tone": "casual",
    "model": "mistralai/Mistral-7B-Instruct-v0.1"
  }'
```

Expected response:
```json
{
  "post_prompts": [
    { "prompt": "idea 1", "hashtags": "" },
    { "prompt": "idea 2", "hashtags": "" }
  ],
  "isMockData": false,
  "dataSource": "huggingface",
  "model": "mistralai/Mistral-7B-Instruct-v0.1"
}
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not configured" | Add `HUGGINGFACE_API_KEY` to `.env` |
| "Rate limit exceeded" | Free tier has limits, try Gemini fallback |
| "Model is loading" | Wait 10-30 seconds, Hugging Face is initializing |
| Model selector not visible | Refresh browser, clear cache |
| Old dropdown still showing | Restart frontend: `npm run dev` |

---

## 📁 File Structure

```
social-brain-backend-main/
  src/
    config/
      models.js ........................ NEW
    services/
      geminiService.js ................ existing
      huggingFaceService.js ........... NEW
      modelRouter.js ................. NEW
    controllers/
      aiGenerationController.js ....... UPDATED

social-brain-frontend-main/
  src/
    components/
      model-selector/
        ModelSelector.jsx ............ NEW
        ModelSelector.module.css ..... NEW
    pages/
      post-genie/
        PostGeniePage.jsx ............ UPDATED
```

---

## 🎓 For Your Professor

**Key Points to Highlight:**

1. **Design Pattern:** Adapter pattern for multi-provider support
2. **Scalability:** Adding new models only requires config update
3. **Reliability:** Automatic fallback mechanism
4. **UX:** Beautiful component with model comparisons
5. **Code Quality:** Clean separation, proper error handling

**Show Them:**
- Model selector UI (looks professional)
- Config file (easy to understand)
- Router logic (elegant design)
- Fallback in action (if HF fails, shows Gemini result)

---

## 🚀 What's Next (Week 2-4)

### Week 2: Together.ai Integration
- Add 70B models (more capable)
- Better fallback option
- Same pattern, just new service

### Week 3: Ollama (Local)
- Run models locally
- No internet needed
- Perfect for private use

### Week 4: UI Polish
- Settings page for API keys
- Model performance stats
- Better error messages

---

## 📝 Model Selection Behavior

**Current behavior (Week 1):**
- Model selection stored in localStorage
- Persists across page refreshes
- Sent to backend with each request
- Backend uses modelRouter to select service

**Future (Week 2):**
- Will be saved to user profile in database
- Each user can have different preferences
- API key management in settings

---

## ⚙️ Environment Variables

Required for Week 1:
```env
# Already have:
GOOGLE_API_KEY=your_gemini_key

# Add for Week 1:
HUGGINGFACE_API_KEY=hf_your_token

# Placeholders for Week 2-3:
TOGETHER_API_KEY=
OLLAMA_HOST=http://localhost:11434
```

---

## 📞 Quick Links

- 📖 Full Setup: [WEEK1_SETUP_GUIDE.md](./WEEK1_SETUP_GUIDE.md)
- 📋 Full Details: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- 🤖 Hugging Face: https://huggingface.co
- 🔑 Get Token: https://huggingface.co/settings/tokens
- 💻 API Docs: https://huggingface.co/docs/hub

---

## ✅ Checklist Before Showing Professor

- [ ] Added Hugging Face API key to `.env`
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev`)
- [ ] Model selector visible on Post Genie page
- [ ] Can select different models
- [ ] Can generate posts with HF models
- [ ] Fallback works (tested by disabling HF key)
- [ ] Read through code to explain it

---

**Ready to impress your professor!** 🎓

*Last Updated: 2026-07-24*
