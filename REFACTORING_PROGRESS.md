# Social Brain Refactoring: 3-Service → 2-Service Architecture

## Overview
This document outlines the refactoring of Social Brain from a 3-service architecture (React Frontend, Node.js Backend, Python AI Service) to a unified 2-service architecture (React Frontend, Node.js Backend with integrated AI).

## ✅ Completed Changes

### 1. **Database Layer (SQLite)**
- **File**: `database/init.js`
- Created SQLite initialization script with better-sqlite3
- Schema includes:
  - `users` table: id, email, password_hash, facebook_token
  - `posts` table: id, user_id, content, tone, posted_to_facebook, facebook_post_id, timestamps
- Automatic schema initialization on first run
- Foreign key constraints enabled

### 2. **AI Service Integration (Gemini)**
- **File**: `src/services/geminiService.js`
- Integrated Google Generative AI (@google/generative-ai) into Node.js backend
- Functions:
  - `extractKeywords()` - Extract trending keywords from topic
  - `generatePostPrompts()` - Generate creative post ideas
  - `generatePostContent()` - Generate full post with hashtags and image prompt
  - `generateCompletePost()` - End-to-end post generation pipeline

### 3. **Database Models**
- **File**: `src/models/databaseModels.js`
- SQLite-based User and Post models
- User operations: create, findById, findByEmail, verifyPassword, updateFacebookToken, delete
- Post operations: create, findById, findByUserId, update, delete, getStats

### 4. **Post Generation Controller**
- **File**: `src/controllers/postGenerationController.js`
- New endpoints for AI post generation
- Handles post CRUD operations
- Facebook posting status tracking

### 5. **Authentication Controller**
- **File**: `src/controllers/authController.js` (Updated)
- Refactored to use SQLite instead of MongoDB
- Maintains JWT-based authentication flow

### 6. **API Routes**
- **File**: `src/routes/postRoutes.js` (Updated)
- New REST endpoints for post generation and management

### 7. **Environment Configuration**
- **File**: `.env.example` (Updated)
- Added GOOGLE_API_KEY
- Added DB_PATH for SQLite
- Removed MongoDB URI
- Added Facebook OAuth details
- Added frontend URL for CORS

### 8. **Package Dependencies**
- **File**: `package.json` (Updated)
- Added: `@google/generative-ai`, `better-sqlite3`
- Removed: `mongodb`, `mongoose`
- Kept: bcrypt, jsonwebtoken, express, cors, dotenv, etc.

## 📋 API Endpoints

### Authentication
```
POST /api/auth/signup
POST /api/auth/signin
```

### Post Generation & Management
```
POST   /api/posts/generate          - Generate new post from topic
GET    /api/posts                   - Get all user's posts
GET    /api/posts/:postId           - Get specific post
PUT    /api/posts/:postId           - Update post
DELETE /api/posts/:postId           - Delete post
PATCH  /api/posts/:postId/facebook  - Mark as posted to Facebook
```

## 🔄 Next Steps

### 1. **Install Dependencies**
```bash
cd social-brain-backend-main
npm install
```

### 2. **Set Up Environment Variables**
```bash
cp .env.example .env
# Edit .env with your actual values:
# - GOOGLE_API_KEY (from Google AI Studio)
# - JWT_SECRET (generate a random string)
# - Facebook OAuth credentials
```

### 3. **Update Remaining Controllers**
- Update `authRoutes.js` to use authMiddleware from authController
- Update `facebookRoutes.js` to work with SQLite User model
- Create/update `facebookController.js` for Facebook API interactions

### 4. **Migrate Frontend**
- Update all API calls from `http://localhost:8000` (Python service) to `http://localhost:3000` (Node backend)
- Remove Billing page
- Remove Queue page
- Update post generation flow to call `/api/posts/generate`
- Update post list to call `/api/posts`

### 5. **Delete Python Service**
- Delete `social-brain-ai-service/` directory once migration is complete

### 6. **Testing**
- Test user authentication (signup/signin)
- Test post generation with various topics and tones
- Test post CRUD operations
- Test Facebook integration (if available)
- Test database persistence

## 📁 New File Structure
```
social-brain-backend-main/
├── database/
│   └── init.js              ← SQLite initialization
├── src/
│   ├── models/
│   │   ├── databaseModels.js    ← User & Post models
│   │   └── [existing models]
│   ├── controllers/
│   │   ├── authController.js    ← Updated for SQLite
│   │   ├── postGenerationController.js ← NEW
│   │   └── [existing controllers]
│   ├── services/
│   │   └── geminiService.js     ← NEW AI service
│   ├── routes/
│   │   ├── postRoutes.js        ← Updated
│   │   └── [existing routes]
│   ├── app.js
│   ├── db.js                ← Updated to use SQLite
│   └── server.js
├── .env.example             ← Updated
└── package.json             ← Updated

social-brain-frontend-main/
├── src/
│   ├── services/
│   │   ├── ai-generationapi.js  ← Update to use /api/posts/generate
│   │   └── [other services]
│   ├── pages/
│   │   ├── post-genie/          ← Update API calls
│   │   ├── posts/               ← Update API calls
│   │   ├── billing/             ← DELETE
│   │   ├── queue/               ← DELETE
│   │   └── [other pages]
│   └── [other frontend files]
```

## 🚀 Quick Start (Once Setup Complete)

1. **Backend**:
   ```bash
   cd social-brain-backend-main
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd social-brain-frontend-main
   npm install
   npm run dev
   ```

## 🔐 Security Notes
- Change `JWT_SECRET` in production
- Use environment variables for all sensitive data
- Validate all user inputs in controllers
- Implement rate limiting for API endpoints
- Use HTTPS in production

## 📝 Notes
- Database file will be created at path specified in DB_PATH env variable
- Each user's posts are isolated and accessible only to that user
- Post generation uses Gemini 1.5 Flash model for speed
- Structured output parsing is robust but can be improved with JSON schema validation
