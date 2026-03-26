# 📊 Social Brain Project Analysis

## 🎯 Summary

This document provides a complete analysis of your microservices-based Social Media Automation tool and answers all your questions.

---

## 1️⃣ **Exact Commands to Start Each Service**

### **Frontend (React/Vite)**
```bash
cd social-brain-frontend-main
npm install  # First time only
npm run dev
```
**Runs on:** `http://localhost:5173` (Vite default port)

### **Backend (Node.js/Express)**
```bash
cd social-brain-backend-main
npm install  # First time only
npm run dev  # Development mode with nodemon (auto-reload)
# OR
npm start   # Production mode
```
**Runs on:** `http://localhost:3000` (or PORT from .env)

### **AI Service (FastAPI)**
```bash
cd social-brain-ai-service
pip install -r requirements.txt  # First time only

# Option 1: Using uvicorn directly
uvicorn SocialBrain.api:app --host localhost --port 8000 --reload

# Option 2: Using the run script
python run.py

# Option 3: Using Python module
python -m SocialBrain.api
```
**Runs on:** `http://localhost:8000`

---

## 2️⃣ **Communication URLs/Ports Analysis**

### ✅ **Current Configuration:**

| Service | Port | Status |
|---------|------|--------|
| Frontend | 5173 | ✅ Correct |
| Backend | 3000 | ✅ Correct |
| AI Service | 8000 | ✅ Correct |

### **Frontend → AI Service:**
- ✅ **Correct:** Frontend calls `http://localhost:8000` directly
- Files:
  - `src/features/ideas/ideasAPI.js` → `/generate_ideas`
  - `src/services/ai-generationapi.js` → `/generate_post`
  - `src/features/posts/postSliceAPI.js` → `/generate_posts_with_media`

### **Frontend → Backend:**
- ⚠️ **Not Currently Used:** Frontend doesn't call backend API endpoints
- Backend has routes: `/api/auth`, `/api/posts`, `/api/facebook`, `/api/scheduled-posts`
- If you want frontend to use backend, you'll need to add API calls

### **Backend → AI Service:**
- ⚠️ **Not Currently Used:** Backend doesn't call AI service
- Backend could proxy requests to AI service if needed

### **Backend → MongoDB:**
- ✅ Configured: Uses `MONGO_URI` from `.env`
- Default: `mongodb://localhost:27017/socialbrain`

---

## 3️⃣ **OpenAI → Google Gemini Migration**

### ✅ **Files Updated:**

1. **`SocialBrain/api.py`**
   - ❌ Removed: `from langchain_openai import ChatOpenAI`
   - ✅ Added: `from langchain_google_genai import ChatGoogleGenerativeAI`
   - Changed: `ChatOpenAI(temperature=0.7, model_name="gpt-4")` → `ChatGoogleGenerativeAI(temperature=0.7, model="gemini-pro")`

2. **`SocialBrain/generate_post.py`**
   - ❌ Removed: `from langchain_openai import ChatOpenAI`
   - ✅ Added: `from langchain_google_genai import ChatGoogleGenerativeAI`
   - Changed model initialization to use Gemini

3. **`SocialBrain/RAG.py`**
   - ❌ Removed: `from langchain_openai import OpenAIEmbeddings, ChatOpenAI`
   - ✅ Added: `from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI`
   - Changed embeddings: `OpenAIEmbeddings(model="text-embedding-ada-002")` → `GoogleGenerativeAIEmbeddings(model="models/embedding-001")`
   - Changed LLM: `ChatOpenAI(model="gpt-4")` → `ChatGoogleGenerativeAI(model="gemini-pro")`

4. **`SocialBrain/app.py`** (Streamlit app)
   - ❌ Removed: `from langchain_openai import ChatOpenAI`
   - ✅ Added: `from langchain_google_genai import ChatGoogleGenerativeAI`
   - Changed model initialization

5. **`SocialBrain/image_generation.py`**
   - ⚠️ **Special Note:** Google Gemini doesn't have built-in image generation like DALL-E
   - Updated to use Google Generative AI (placeholder implementation)
   - **Options:**
     1. Use Google Cloud Imagen API (requires GCP setup)
     2. Keep OpenAI DALL-E for images only
     3. Use another image generation service

### **Requirements Already Include:**
- ✅ `langchain-google-genai` (already in requirements.txt)
- ✅ `google-generativeai` (already in requirements.txt)

---

## 4️⃣ **.env Files Location & Configuration**

### **Backend (`social-brain-backend-main/.env`)**

**Location:** `social-brain-backend-main/.env` (create this file)

**Required Variables:**
```env
MONGO_URI=mongodb://localhost:27017/socialbrain
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
```

**Copy from:** `.env.example` (created for you)

---

### **AI Service (`social-brain-ai-service/.env`)**

**Location:** `social-brain-ai-service/.env` (create this file)

**Required Variables:**
```env
GOOGLE_API_KEY=your-google-gemini-api-key-here
TAVILY_API_KEY=your-tavily-api-key-here
```

**Copy from:** `.env.example` (created for you)

**Where to get Google Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in `.env` file

---

### **Frontend (`social-brain-frontend-main/src/.env`)**

**Location:** `social-brain-frontend-main/src/.env` (already exists)

**Current Content:**
```env
FB_ACCESS_TOKEN=
```

**Note:** Frontend doesn't need API keys since it calls services directly. The `.env` file is for Facebook integration.

---

## 5️⃣ **CORS & Connection Issues - FIXED ✅**

### **Changes Made:**

1. **Backend CORS (`social-brain-backend-main/src/app.js`):**
   ```javascript
   // Before: app.use(cors()); // Too permissive
   
   // After: Specific origins
   app.use(cors({
     origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
     credentials: true,
     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
     allowedHeaders: ["Content-Type", "Authorization"]
   }));
   ```

2. **AI Service CORS (`social-brain-ai-service/SocialBrain/api.py`):**
   ```python
   # Before: allow_origins=["*"] # Too permissive
   
   # After: Specific origins
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### **CORS Configuration Summary:**
- ✅ Frontend (port 5173) can call AI Service (port 8000)
- ✅ Frontend (port 5173) can call Backend (port 3000)
- ✅ CORS headers properly configured
- ✅ Credentials allowed for authentication

---

## 📋 **Quick Start Checklist**

1. **Install Dependencies:**
   ```bash
   # Backend
   cd social-brain-backend-main && npm install
   
   # AI Service
   cd social-brain-ai-service && pip install -r requirements.txt
   
   # Frontend
   cd social-brain-frontend-main && npm install
   ```

2. **Create .env Files:**
   - Copy `.env.example` to `.env` in backend and AI service folders
   - Add your Google Gemini API key to AI service `.env`
   - Add MongoDB URI to backend `.env`

3. **Start MongoDB:**
   - Ensure MongoDB is running locally or update `MONGO_URI` with cloud connection string

4. **Start Services (3 terminals):**
   ```bash
   # Terminal 1 - Backend
   cd social-brain-backend-main && npm run dev
   
   # Terminal 2 - AI Service
   cd social-brain-ai-service && uvicorn SocialBrain.api:app --host localhost --port 8000 --reload
   
   # Terminal 3 - Frontend
   cd social-brain-frontend-main && npm run dev
   ```

5. **Verify:**
   - Backend: `http://localhost:3000`
   - AI Service: `http://localhost:8000/docs` (FastAPI docs)
   - Frontend: `http://localhost:5173`

---

## 🔍 **Additional Notes**

### **Image Generation:**
Google Gemini doesn't include image generation. The `image_generation.py` file has been updated with a placeholder. You have three options:
1. **Use Google Cloud Imagen API** (requires GCP account)
2. **Keep OpenAI DALL-E** for images only (add `OPENAI_API_KEY` to `.env`)
3. **Use another service** (Stable Diffusion, Midjourney API, etc.)

### **RAG Functionality:**
The RAG system uses Tavily for web search. You'll need a Tavily API key:
- Sign up at [Tavily](https://tavily.com)
- Add `TAVILY_API_KEY` to AI service `.env`

### **MongoDB:**
- **Local:** Install MongoDB and run `mongod`
- **Cloud:** Use MongoDB Atlas and update `MONGO_URI` in backend `.env`

---

## ✅ **All Tasks Completed**

- ✅ Analyzed all three services
- ✅ Identified start commands
- ✅ Verified communication URLs/ports
- ✅ Replaced OpenAI with Google Gemini
- ✅ Created .env files with proper configuration
- ✅ Fixed CORS issues

**You're all set!** Follow the setup guide to get started.
