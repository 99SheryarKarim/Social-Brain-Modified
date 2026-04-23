# 🚀 Social Brain Unified 2-Service Architecture - Complete Setup Guide

## Project Overview
Converting from 3-service architecture (React, Node, Python) to 2-service unified architecture with:
- **Frontend**: React with Vite (Port 5173)
- **Backend**: Node.js with Gemini AI (Port 3000)
- **Database**: SQLite

---

## 📦 Phase 1: Backend Setup

### Step 1: Install Backend Dependencies
```bash
cd social-brain-backend-main
npm install
```

This installs:
- `@google/generative-ai` - Gemini AI integration
- `better-sqlite3` - SQLite database
- `express`, `bcrypt`, `jsonwebtoken` - Core dependencies

### Step 2: Configure Environment Variables
```bash
# Create .env file from template
cp .env.example .env
```

Edit `.env` and fill in:
```
# Server
PORT=3000
NODE_ENV=development

# Database
DB_PATH=./database/socialbrain.db

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Google AI
GOOGLE_API_KEY=your_actual_api_key_from_aistudio.google.com

# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/facebook/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

**Getting GOOGLE_API_KEY**:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy and paste into .env

### Step 3: Test Backend
```bash
npm run dev
```

You should see:
```
✓ Database initialized successfully
✅ Connected to SQLite database
Server is running on http://localhost:3000
```

### Step 4: Test API Endpoints
```bash
# In a new terminal, test auth
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# You should get back a success response
```

---

## 🎨 Phase 2: Frontend Setup

### Step 1: Install Frontend Dependencies
```bash
cd ../social-brain-frontend-main
npm install
```

This installs:
- `framer-motion` - Beautiful animations
- `react-hot-toast` - Toast notifications
- Other React dependencies

### Step 2: Verify Frontend Structure
```bash
# Check that these files exist:
# - src/utils/animations.js
# - src/utils/toast.js
# - src/services/ai-generationapi.js
# - src/components/ANIMATION_TEMPLATE.jsx
```

### Step 3: Start Frontend
```bash
npm run dev
```

You should see:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

---

## ✅ Phase 3: Integration Testing

### Test 1: Authentication Flow
1. Open http://localhost:5173
2. Navigate to signup page (create if needed)
3. Sign up with test email
4. Should see success toast notification
5. Check localStorage for "token"

### Test 2: Post Generation
1. Go to Post Genie page
2. Enter a topic (e.g., "Coffee culture")
3. Select a tone
4. Click generate button
5. Should see loading toast → success toast → generated post

### Test 3: Database
```bash
# Check if database was created
ls -la social-brain-backend-main/database/

# You should see: socialbrain.db
```

---

## 📋 API Endpoints Reference

### Authentication
```bash
POST /api/auth/signup
POST /api/auth/signin
```

### Posts (Requires Auth Token)
```bash
POST   /api/posts/generate          # Generate new post
GET    /api/posts                   # Get all user's posts
GET    /api/posts/:postId           # Get specific post
PUT    /api/posts/:postId           # Update post
DELETE /api/posts/:postId           # Delete post
PATCH  /api/posts/:postId/facebook  # Mark as posted
```

### Example: Generate Post
```javascript
// The API is already set up, use it like this:
import { generateSocialPost } from '../services/ai-generationapi';

const result = await generateSocialPost(
  'Climate change awareness',
  'informative',
  150
);

if (result.success) {
  console.log(result.data); // { content, hashtags, imagePrompt, keywords, ... }
} else {
  console.error(result.error);
}
```

---

## 🎯 Common Tasks

### How to Update a Component with Animations
```jsx
import { motion } from 'framer-motion';
import { slideUpVariants } from '../utils/animations';

export default function MyComponent() {
  return (
    <motion.div 
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Your content */}
    </motion.div>
  );
}
```

### How to Show Toast Notifications
```jsx
import { showSuccessToast, showErrorToast } from '../utils/toast';

function MyComponent() {
  const handleClick = async () => {
    try {
      await doSomething();
      showSuccessToast('✅ Success!');
    } catch (error) {
      showErrorToast(error.message);
    }
  };
}
```

### How to Call Backend API with Auth
```jsx
import { generateSocialPost } from '../services/ai-generationapi';

// Token from localStorage is automatically included
const result = await generateSocialPost('topic', 'tone', 150);
```

---

## 🔧 Troubleshooting

### "Database connection error"
```bash
# Make sure DB_PATH exists in .env
# Try deleting and recreating:
rm database/socialbrain.db
npm run dev
```

### "GOOGLE_API_KEY is not set"
```bash
# Check your .env file
# Regenerate key at: https://aistudio.google.com/app/apikey
# Restart: npm run dev
```

### "Cannot POST /api/posts/generate"
```bash
# Backend might not be running
# In backend folder: npm run dev
# Make sure terminal shows "Server is running on http://localhost:3000"
```

### "CORS error when calling API"
```bash
# Make sure frontend URL is in FRONTEND_URL env var
# Restart backend after changing env
```

### "Toast notifications not showing"
```bash
# Check that Toaster is in main.jsx (it should be)
# Check browser console for errors
```

---

## 📊 Project Structure After Setup

```
Social Brain/
├── social-brain-backend-main/
│   ├── database/
│   │   └── init.js                  ← SQLite setup
│   │   └── socialbrain.db           ← Database file (created on first run)
│   ├── src/
│   │   ├── services/
│   │   │   └── geminiService.js     ← AI generation
│   │   ├── models/
│   │   │   └── databaseModels.js    ← DB operations
│   │   ├── controllers/
│   │   │   ├── authController.js    ← Updated for SQLite
│   │   │   └── postGenerationController.js
│   │   ├── routes/
│   │   ├── db.js                    ← SQLite connection
│   │   └── server.js
│   ├── .env.example
│   ├── .env                         ← Create this locally
│   └── package.json                 ← Updated deps
│
├── social-brain-frontend-main/
│   ├── src/
│   │   ├── utils/
│   │   │   ├── animations.js        ← Framer Motion variants
│   │   │   └── toast.js             ← Toast notifications
│   │   ├── services/
│   │   │   └── ai-generationapi.js  ← Updated API calls
│   │   ├── components/
│   │   │   ├── Navbar.jsx           ← Updated with animations
│   │   │   └── ANIMATION_TEMPLATE.jsx ← Reference template
│   │   ├── app/
│   │   │   └── App.jsx              ← Removed Billing/Queue
│   │   ├── index.css                ← 400+ lines of animations
│   │   └── main.jsx                 ← Added Toaster
│   └── package.json                 ← Updated deps
│
├── REFACTORING_PROGRESS.md          ← Backend changes
├── FRONTEND_UPDATE_COMPLETE.md      ← Frontend changes
└── SETUP_COMPLETE.md                ← This file

# Files to Delete (Once Migration Complete)
social-brain-ai-service/             ← DELETE after confirming backend works
```

---

## 🎓 Learning Resources

### Framer Motion Documentation
- [Official Docs](https://www.framer.com/motion/)
- [Animation Variants](https://www.framer.com/motion/animation/)
- [Gesture Animations](https://www.framer.com/motion/gestures/)

### React Hot Toast
- [Documentation](https://react-hot-toast.com/)
- [Examples](https://react-hot-toast.com/docs/toast)

### Google Generative AI
- [Node.js Library](https://github.com/google/generative-ai-js)
- [API Reference](https://ai.google.dev/tutorials/node_quickstart)

---

## ✨ Next Features to Implement

1. **Authentication Pages**
   - Login page with animation
   - Signup page with validation
   - Password reset flow

2. **User Profile**
   - Profile page with account settings
   - Change password
   - Account deletion

3. **Post Management**
   - Posts page showing all user's posts
   - Edit post functionality
   - Bulk post operations

4. **Facebook Integration**
   - Connect Facebook account
   - Post directly to Facebook
   - Schedule posts for later

5. **Dashboard**
   - Statistics and analytics
   - Post performance metrics
   - Quick stats cards

6. **Admin Features**
   - User management
   - Content moderation
   - System monitoring

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages carefully (they usually point to the problem)
3. Ensure both frontend and backend are running
4. Check browser console (F12) for client-side errors
5. Check terminal for server-side errors
6. Verify all environment variables are set correctly

---

## ✅ Checklist

- [ ] Backend dependencies installed (`npm install` in backend folder)
- [ ] `.env` file created with actual API keys
- [ ] Backend running on port 3000
- [ ] Database file created (`socialbrain.db`)
- [ ] Frontend dependencies installed (`npm install` in frontend folder)
- [ ] Frontend running on port 5173
- [ ] Can sign up a new user
- [ ] Can generate a post with AI
- [ ] Toast notifications working
- [ ] Animations playing smoothly
- [ ] No console errors in browser
- [ ] No console errors in terminal

Once all checkboxes are done, you have a fully functional Social Brain MVP! 🎉

---

## 🚀 Deployment Considerations

Before deploying to production:

1. **Security**
   - Change JWT_SECRET to strong random value
   - Enable HTTPS
   - Set proper CORS origins
   - Validate all inputs

2. **Performance**
   - Database backups
   - Caching strategy
   - CDN for static assets
   - API rate limiting

3. **Monitoring**
   - Error logging
   - User analytics
   - API monitoring
   - Database monitoring

4. **Scaling**
   - Database indexing
   - API optimization
   - Load balancing
   - Horizontal scaling

---

Made with ❤️ for your AI-powered social media platform!
