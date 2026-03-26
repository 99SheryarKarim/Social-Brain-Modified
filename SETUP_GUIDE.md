# 🚀 Social Brain - Local Setup Guide

This guide will help you run all three services locally.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (running locally or connection string)
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))

---

## 🔧 Setup Instructions

### 1. **Backend Service (Node.js/Express)**

**Location:** `social-brain-backend-main`

**Steps:**
```bash
cd social-brain-backend-main
npm install
```

**Create `.env` file** (copy from `.env.example`):
```env
MONGO_URI=mongodb://localhost:27017/socialbrain
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
```

**Start Command:**
```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

**Runs on:** `http://localhost:3000`

---

### 2. **AI Service (FastAPI/Python)**

**Location:** `social-brain-ai-service`

**Steps:**
```bash
cd social-brain-ai-service
pip install -r requirements.txt
```

**Create `.env` file** (copy from `.env.example`):
```env
GOOGLE_API_KEY=your-google-gemini-api-key-here
TAVILY_API_KEY=your-tavily-api-key-here
```

**Start Command:**
```bash
# Option 1: Using uvicorn directly
uvicorn SocialBrain.api:app --host localhost --port 8000 --reload

# Option 2: Using Python (if __main__ is configured)
python -m SocialBrain.api
```

**Runs on:** `http://localhost:8000`

**API Docs:** `http://localhost:8000/docs` (FastAPI Swagger UI)

---

### 3. **Frontend Service (React/Vite)**

**Location:** `social-brain-frontend-main`

**Steps:**
```bash
cd social-brain-frontend-main
npm install
```

**Start Command:**
```bash
npm run dev
```

**Runs on:** `http://localhost:5173` (Vite default port)

---

## 🔗 Service Communication

### Current Configuration:

- **Frontend → AI Service:** `http://localhost:8000` ✅
- **Frontend → Backend:** Not currently used (frontend calls AI service directly)
- **Backend → AI Service:** Not currently used
- **Backend → MongoDB:** `mongodb://localhost:27017/socialbrain`

### Port Summary:
- **Frontend:** `5173` (Vite default)
- **Backend:** `3000`
- **AI Service:** `8000`

---

## 🔄 Starting All Services

Open **3 separate terminal windows**:

**Terminal 1 - Backend:**
```bash
cd social-brain-backend-main
npm run dev
```

**Terminal 2 - AI Service:**
```bash
cd social-brain-ai-service
uvicorn SocialBrain.api:app --host localhost --port 8000 --reload
```

**Terminal 3 - Frontend:**
```bash
cd social-brain-frontend-main
npm run dev
```

---

## ✅ Verification

1. **Backend:** Check `http://localhost:3000` - should show Express server running
2. **AI Service:** Check `http://localhost:8000/docs` - should show FastAPI Swagger UI
3. **Frontend:** Check `http://localhost:5173` - should show React app

---

## 🔑 API Keys Setup

### Google Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `social-brain-ai-service/.env` as `GOOGLE_API_KEY`

### MongoDB:
- Install MongoDB locally OR
- Use MongoDB Atlas (cloud) and update `MONGO_URI` in backend `.env`

### Cloudinary (Optional - for image uploads):
- Sign up at [Cloudinary](https://cloudinary.com)
- Add credentials to backend `.env`

---

## 🐛 Troubleshooting

### CORS Errors:
- ✅ Fixed: CORS is configured to allow `localhost:5173` and `localhost:3000`
- If you see CORS errors, check that all services are running on correct ports

### Port Already in Use:
- Backend: Change `PORT` in `.env` file
- AI Service: Change port in uvicorn command: `--port 8001`
- Frontend: Vite will auto-select next available port

### MongoDB Connection Error:
- Ensure MongoDB is running: `mongod` (or MongoDB service on Windows)
- Check `MONGO_URI` in backend `.env`

### Google Gemini API Errors:
- Verify `GOOGLE_API_KEY` is set correctly in `social-brain-ai-service/.env`
- Check API key has proper permissions

---

## 📝 Notes

- **Image Generation:** Google Gemini doesn't include image generation like DALL-E. The `image_generation.py` file has been updated with a placeholder. You can:
  1. Use Google Cloud Imagen API
  2. Keep OpenAI DALL-E for images only
  3. Use another image generation service

- **RAG Functionality:** Requires Tavily API key for web search functionality

---

## 🎯 Quick Start Checklist

- [ ] MongoDB running
- [ ] Backend `.env` created with MongoDB URI
- [ ] AI Service `.env` created with Google API key
- [ ] All dependencies installed (`npm install` and `pip install`)
- [ ] All three services started
- [ ] Test frontend at `http://localhost:5173`
