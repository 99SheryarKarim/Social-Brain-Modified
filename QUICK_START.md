# ⚡ Quick Start Guide

## 🚀 Start All Services

### Terminal 1 - Backend
```bash
cd social-brain-backend-main
npm install  # First time only
npm run dev
```

### Terminal 2 - AI Service  
```bash
cd social-brain-ai-service
pip install -r requirements.txt  # First time only
uvicorn SocialBrain.api:app --host localhost --port 8000 --reload
```

### Terminal 3 - Frontend
```bash
cd social-brain-frontend-main
npm install  # First time only
npm run dev
```

---

## 🔑 Required .env Files

### 1. Backend: `social-brain-backend-main/.env`
```env
MONGO_URI=mongodb://localhost:27017/socialbrain
PORT=3000
JWT_SECRET=your-secret-key-here
CLOUD_NAME=your-cloudinary-name
CLOUD_API_KEY=your-cloudinary-key
CLOUD_API_SECRET=your-cloudinary-secret
```

### 2. AI Service: `social-brain-ai-service/.env`
```env
GOOGLE_API_KEY=your-google-gemini-api-key-here
TAVILY_API_KEY=your-tavily-api-key-here
```

**Get Google Gemini API Key:** https://makersuite.google.com/app/apikey

---

## 🌐 Service URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000  
- **AI Service:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## ✅ Verification

1. Backend running → Check console for "Server is running on http://localhost:3000"
2. AI Service running → Visit http://localhost:8000/docs (should show Swagger UI)
3. Frontend running → Visit http://localhost:5173 (should show React app)

---

## 🐛 Common Issues

**Port already in use?**
- Backend: Change `PORT` in `.env`
- AI Service: Change port: `--port 8001`
- Frontend: Vite auto-selects next port

**CORS errors?**
- ✅ Already fixed! CORS configured for ports 5173, 3000, 8000

**MongoDB connection error?**
- Ensure MongoDB is running
- Check `MONGO_URI` in backend `.env`

**Google API errors?**
- Verify `GOOGLE_API_KEY` in AI service `.env`
- Check API key permissions

---

## 📚 Full Documentation

See `SETUP_GUIDE.md` and `PROJECT_ANALYSIS.md` for detailed information.
