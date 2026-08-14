# Idea Pulse — Complete Project Documentation

**Project Type:** Final Year Project (FYP) — 2025  
**Project Name:** Idea Pulse  
**Tagline:** AI Social Media Manager  
**Repository:** https://github.com/99SheryarKarim/Social-brain-FYP  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack & Tools](#3-technology-stack--tools)
4. [External Services & APIs](#4-external-services--apis)
5. [Project Structure](#5-project-structure)
6. [Database Schema](#6-database-schema)
7. [Features (Detailed)](#7-features-detailed)
8. [API Endpoints Reference](#8-api-endpoints-reference)
9. [Frontend Application](#9-frontend-application)
10. [Backend Application](#10-backend-application)
11. [Authentication & Security](#11-authentication--security)
12. [Subscription & Payments](#12-subscription--payments)
13. [AI Content Generation](#13-ai-content-generation)
14. [Facebook Integration](#14-facebook-integration)
15. [Post Scheduling & Automation](#15-post-scheduling--automation)
16. [Environment Variables](#16-environment-variables)
17. [Setup & Running Locally](#17-setup--running-locally)
18. [Deployment](#18-deployment)
19. [Development Tools & Scripts](#19-development-tools--scripts)
20. [UI/UX & Design](#20-uiux--design)
21. [Legacy Notes & Documentation](#21-legacy-notes--documentation)

---

## 1. Project Overview

**Idea Pulse** is an AI-powered social media management platform built as a Final Year Project. It helps users create, manage, schedule, and publish social media content — primarily to **Facebook Pages** — using **Google Gemini AI**.

### What the Application Does

| Capability | Description |
|------------|-------------|
| AI Idea Generation | Generates post ideas from a topic and tone |
| AI Post Writing | Writes full post content, hashtags, and image keywords |
| Brand Voice | Personalizes AI output using brand description and target audience |
| Image Integration | Fetches relevant stock images from Pexels |
| Facebook Publishing | Publishes posts (text + image) to connected Facebook Pages |
| Scheduling | Schedules posts for automatic future publishing |
| Engagement Analytics | Syncs likes and comments from Facebook (Premium) |
| Subscription Tiers | Free (limited) and Premium ($9/month via Stripe) |
| User Authentication | Email/password with OTP verification + Google OAuth |
| Activity Tracking | Logs user actions and displays activity timeline |
| Streak System | Tracks daily usage streaks (client-side localStorage) |
| Smart Calendar | Visual calendar for scheduled and published content |

### Target Users

- Small business owners
- Social media managers
- Content creators
- Students / FYP demonstration users

---

## 2. Architecture

### Current Architecture (Active)

The project runs as a **two-service monolith-style application**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│                    Port: 5173                                    │
│  User Interface → Redux State → Axios HTTP Requests              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP (localhost:3001)
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│                    Port: 3001 (default in frontend calls)        │
│                                                                  │
│  Routes → Controllers → Services → SQLite Database               │
│                                                                  │
│  Integrated Services:                                            │
│  • Google Gemini AI (post generation)                            │
│  • Facebook Graph API v19.0 (publishing & analytics)             │
│  • Pexels API (images)                                           │
│  • Stripe (payments & webhooks)                                  │
│  • Gmail SMTP via Nodemailer (OTP & welcome emails)              │
│  • Google OAuth 2.0 via Passport.js                              │
│  • node-cron scheduler (auto-publish due posts every minute)     │
└──────────────────────────────────────────────────────────────────┘
                           ▲
                           │ Stripe Webhook
┌──────────────────────────┴──────────────────────────────────────┐
│                         STRIPE                                   │
│  checkout.session.completed → upgrade to premium                 │
│  customer.subscription.deleted → downgrade to free              │
└──────────────────────────────────────────────────────────────────┘
```

### Important Architecture Notes

- **AI is integrated into the backend** — there is no separate Python/FastAPI AI microservice in the current codebase. AI generation runs through `geminiService.js` using `@google/generative-ai`.
- **Database is SQLite** — not MongoDB. Data is stored in `social-brain-backend-main/database/socialbrain.db`.
- **Backend default port** in code is `3000` (`process.env.PORT || 3000`), but the frontend is configured to call **`http://localhost:3001`**. Set `PORT=3001` in your backend `.env` to match.
- Older documentation files (`SETUP_GUIDE.md`, `QUICK_START.md`, `PROJECT_ANALYSIS.md`) reference a third **AI Service** on port 8000 and **MongoDB** — those reflect an earlier architecture that has been simplified/refactored.

---

## 3. Technology Stack & Tools

### 3.1 Frontend Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | ^19.0.0 |
| Build Tool | Vite | ^6.2.0 |
| Language | JavaScript (ES Modules) | ES2022+ |
| Routing | React Router DOM (HashRouter) | ^7.5.0 |
| State Management | Redux Toolkit + React-Redux | ^2.7.0 / ^9.2.0 |
| HTTP Client | Axios | ^1.8.4 |
| Animations | Framer Motion | ^11.0.3 |
| Toast Notifications | React Hot Toast | ^2.4.1 |
| Icons | Font Awesome 6 (CDN) | 6.5.0 |
| CSS Framework | Bootstrap 5 (CDN) | 5.3.5 |
| Styling Approach | CSS Modules + Inline CSS + Global theme CSS | — |
| Linting | ESLint | ^9.21.0 |
| Type Definitions | @types/react, @types/react-dom | ^19.x |

### 3.2 Backend Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Node.js | 18+ recommended |
| Framework | Express.js | ^4.21.2 |
| Database | SQLite3 | ^5.1.7 |
| AI SDK | @google/generative-ai | ^0.3.0 |
| Authentication | JSON Web Token (jsonwebtoken) | ^9.0.2 |
| Password Hashing | bcrypt + bcryptjs | ^5.1.1 / ^3.0.2 |
| OAuth | Passport.js + passport-google-oauth20 | ^0.7.0 / ^2.0.0 |
| Email | Nodemailer (Gmail SMTP) | ^8.0.6 |
| Payments | Stripe SDK | ^22.1.0 |
| Task Scheduling | node-cron | ^4.2.1 |
| Additional Scheduling | node-schedule | ^2.1.1 |
| File Uploads | Multer | ^2.0.0 |
| HTTP Client | Axios | ^1.9.0 |
| Validation | express-validator | ^7.2.1 |
| CORS | cors | ^2.8.5 |
| Environment Config | dotenv | ^16.5.0 |
| Dev Auto-Reload | Nodemon | ^3.1.7 |
| Image Hosting (optional) | Cloudinary | ^2.6.1 |

### 3.3 Root-Level Dependencies

The root `package.json` also includes:

| Package | Version | Purpose |
|---------|---------|---------|
| @google/generative-ai | ^0.24.1 | Standalone AI testing |
| better-sqlite3 | ^12.9.0 | SQLite utilities |
| dotenv | ^17.4.2 | Environment loading |

### 3.4 Development & Build Tools

| Tool | Used For |
|------|----------|
| **Vite** | Frontend dev server, HMR, production build |
| **Nodemon** | Backend auto-restart during development |
| **ESLint** | Frontend code linting (`npm run lint`) |
| **Git** | Version control |
| **Vercel** | Frontend deployment (static build) |
| **Stripe CLI** | Local webhook testing (recommended) |

### 3.5 AI Model Used

| Model | Usage |
|-------|-------|
| **gemini-2.5-flash** | Default model for idea and post generation |
| gemini-pro | Referenced in older docs (legacy) |

---

## 4. External Services & APIs

| Service | Purpose | Integration Location |
|---------|---------|---------------------|
| **Google Gemini API** | AI post & idea generation | `backend/src/services/geminiService.js` |
| **Meta Facebook Graph API v19.0** | Page connection, publishing, engagement sync | `backend/src/controllers/facebookController.js`, `facebookService.js` |
| **Pexels API** | Stock image search for posts | Backend (publish/scheduler) + Frontend (display) |
| **Stripe** | Premium subscription checkout & webhooks | `backend/src/controllers/paymentController.js` |
| **Google OAuth 2.0** | Social login | `backend/src/config/googleAuth.js` |
| **Gmail (SMTP)** | OTP verification & welcome emails | `backend/src/services/emailService.js` |
| **Cloudinary** | Optional image hosting (dependency present) | Backend package dependency |
| **Font Awesome CDN** | UI icons | `frontend/index.html` |
| **Bootstrap CDN** | Responsive layout & utilities | `frontend/index.html` |

### Required API Keys

| Key | Required For |
|-----|-------------|
| `GOOGLE_API_KEY` | Gemini AI generation |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth login |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Facebook token exchange |
| `PEXELS_API_KEY` | Image fetching |
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` / `STRIPE_WEBHOOK_SECRET` | Payments |
| `EMAIL_USER` / `EMAIL_PASS` | OTP & welcome emails (Gmail App Password) |
| `JWT_SECRET` | Authentication tokens |

---

## 5. Project Structure

```
Idea Pulse code/
│
├── social-brain-frontend-main/          # React SPA (Frontend)
│   ├── index.html                       # HTML entry, CDN links (Bootstrap, Font Awesome)
│   ├── vite.config.js                   # Vite config with path aliases
│   ├── vercel.json                      # Vercel deployment config
│   ├── package.json
│   └── src/
│       ├── main.jsx                     # App entry, loading screen, Redux Provider
│       ├── index.css                    # Global styles
│       ├── app/
│       │   ├── App.jsx                  # Routing, auth state, plan management
│       │   └── store.js                 # Redux store configuration
│       ├── components/
│       │   ├── navbar/                  # Top navigation bar
│       │   ├── sidebar/                 # Left navigation menu
│       │   ├── post-card/               # Post display cards
│       │   ├── idea-tile/               # AI idea selection tiles
│       │   ├── social-card/             # Social platform connection cards
│       │   ├── billing-card/            # Subscription billing UI
│       │   ├── primary-button/          # Reusable button component
│       │   └── smart-calendar/          # Calendar components (header, day cells, modals)
│       ├── features/                    # Redux slices & API logic
│       │   ├── ideas/                   # ideasSlice.js, ideasAPI.js
│       │   ├── posts/                   # postsSlice.js, postSliceAPI.js
│       │   └── SelectedIdeas/           # selectedIdeasSlice.js
│       ├── pages/
│       │   ├── dashboard/               # Dashboard (Premium analytics)
│       │   ├── post-genie/              # AI idea & post generation (main feature)
│       │   ├── posts/                   # Post library / archive
│       │   ├── calendar/                # Smart content calendar
│       │   ├── connect-social/          # Facebook connection
│       │   ├── auth/                    # Login / signup
│       │   ├── profile/                 # User profile
│       │   ├── settings/                # Brand voice, account settings
│       │   ├── upgrade/                 # Premium upgrade (Stripe)
│       │   ├── recent/                  # Activity timeline
│       │   ├── streak/                  # Daily usage streak
│       │   ├── billing/                 # Billing page
│       │   ├── queue/                   # Post queue
│       │   └── quick-post/              # Quick post creation
│       ├── services/
│       │   ├── ai-generationapi.js      # Post generation API client
│       │   ├── activityService.js         # Activity logging
│       │   ├── calendarService.js         # Calendar data
│       │   └── post-to-fb.js              # Facebook publish helper
│       ├── utils/
│       │   ├── streak.js                  # Streak tracking (localStorage)
│       │   ├── toast.js                   # Toast helpers
│       │   ├── animations.js              # Animation utilities
│       │   └── urlToBinary.js             # Image URL conversion
│       ├── hooks/
│       │   └── useIdeaGeneratorenerator.js
│       └── styles/
│           ├── theme.css                  # Color theme & CSS variables
│           └── pages.css                  # Page-level styles
│
├── social-brain-backend-main/           # Node.js REST API (Backend)
│   ├── database/
│   │   ├── init.js                      # SQLite schema, migrations, connection
│   │   └── socialbrain.db               # SQLite database file (auto-created)
│   ├── package.json
│   ├── test-gemini.js                   # Gemini API test script
│   └── src/
│       ├── server.js                    # Server entry — starts Express + scheduler
│       ├── app.js                       # Express app, middleware, route mounting
│       ├── db.js                        # Database connection wrapper
│       ├── config/
│       │   ├── googleAuth.js            # Passport Google OAuth strategy
│       │   └── facebook.js              # Facebook app configuration
│       ├── controllers/
│       │   ├── authController.js        # OTP signup, signin, JWT middleware
│       │   ├── aiGenerationController.js # /generate_ideas, /generate_posts_with_media
│       │   ├── facebookController.js    # Facebook connect, publish, engagement
│       │   ├── paymentController.js     # Stripe checkout & webhooks
│       │   ├── subscriptionController.js # Plan, usage limits
│       │   ├── settingsController.js    # Brand voice settings
│       │   ├── activityController.js    # Activity logging
│       │   ├── postController.js        # Post CRUD
│       │   ├── postGenerationController.js
│       │   ├── scheduledPostController.js
│       │   └── userController.js
│       ├── middlewares/
│       │   ├── auth.js                  # JWT authentication middleware
│       │   └── multer.js                # File upload middleware
│       ├── models/
│       │   ├── databaseModels.js        # User & Post SQLite operations
│       │   ├── User.js                  # Legacy user model
│       │   ├── PostedPost.js
│       │   └── ScheduledPost.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── postRoutes.js
│       │   ├── facebookRoutes.js
│       │   ├── paymentRoutes.js
│       │   ├── subscriptionRoutes.js
│       │   ├── settingsRoutes.js
│       │   ├── activityRoutes.js
│       │   └── scheduledPostRoutes.js
│       ├── services/
│       │   ├── geminiService.js         # Google Gemini AI integration
│       │   ├── emailService.js          # Nodemailer email sending
│       │   ├── schedulerService.js      # node-cron auto-publishing
│       │   └── facebookService.js       # Facebook API helpers
│       └── presenters/
│           ├── postPresenter.js
│           └── scheduledPostPresenter.js
│
├── package.json                         # Root-level dependencies
├── vercel.json                          # Root Vercel config (frontend build)
│
└── Documentation Files/
    ├── PROJECT_DETAILS.md               # This file
    ├── TECHNICAL_AUDIT.md               # Technical audit & feature docs
    ├── SETUP_GUIDE.md                   # Setup instructions (partially legacy)
    ├── QUICK_START.md                   # Quick start (partially legacy)
    ├── PROJECT_ANALYSIS.md              # Architecture analysis (legacy 3-service)
    ├── DEBUGGING_GUIDE.md               # Gemini API debugging
    ├── SMART_CALENDAR_IMPLEMENTATION.md
    ├── CALENDAR_VISUAL_GUIDE.md
    └── ... (other docs)
```

---

## 6. Database Schema

**Database Engine:** SQLite  
**Default File:** `social-brain-backend-main/database/socialbrain.db`  
**Configurable via:** `DB_PATH` environment variable

### Tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment user ID |
| email | TEXT UNIQUE | User email address |
| password_hash | TEXT | bcrypt hashed password |
| facebook_token | TEXT | JSON: `{ accessToken, pageId, pageName }` |
| plan | TEXT | `'free'` or `'premium'` (default: `'free'`) |
| daily_usage | INTEGER | AI generations used today (default: 0) |
| usage_reset_at | TEXT | Timestamp for 24-hour usage reset |
| stripe_customer_id | TEXT | Stripe customer ID |
| stripe_subscription_id | TEXT | Stripe subscription ID |
| username | TEXT | Display username |
| created_at | DATETIME | Account creation timestamp |
| updated_at | DATETIME | Last update timestamp |

#### `posts`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Post ID |
| user_id | INTEGER FK → users | Owner user ID |
| content | TEXT | Post body text |
| tone | TEXT | Tone used (e.g., casual, professional) |
| hashtags | TEXT | Space-separated hashtags |
| image_prompt | TEXT | Keywords for Pexels image search |
| original_topic | TEXT | Original user topic |
| posted_to_facebook | INTEGER | 0 = not posted, 1 = posted |
| facebook_post_id | TEXT | Facebook post ID after publishing |
| scheduled_at | DATETIME | Scheduled publish datetime |
| likes | INTEGER | Engagement: likes count |
| comments | INTEGER | Engagement: comments count |
| shares | INTEGER | Engagement: shares count |
| reach | INTEGER | Engagement: reach count |
| engagement_updated_at | DATETIME | Last engagement sync time |
| platform | TEXT | Default: `'facebook'` |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

#### `activity`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Activity ID |
| user_id | INTEGER FK → users | User who performed action |
| type | TEXT | Event type (e.g., `ideas_generated`, `posts_generated`, `post_uploaded`) |
| description | TEXT | Human-readable description |
| meta | TEXT | JSON metadata (tone, topic, count, etc.) |
| created_at | DATETIME | Event timestamp |

#### `otps`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | OTP record ID |
| email | TEXT | Email address |
| otp | TEXT | 6-digit verification code |
| expires_at | DATETIME | Expiry (10 minutes from creation) |
| created_at | DATETIME | Creation timestamp |

#### `settings`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Settings ID |
| user_id | INTEGER UNIQUE FK → users | User ID |
| brand_description | TEXT | Brand voice description |
| target_audience | TEXT | Target audience description |
| updated_at | DATETIME | Last update timestamp |

### Indexes
- `idx_posts_user_id` on `posts(user_id)`
- `idx_posts_created_at` on `posts(created_at)`
- `idx_activity_user_id` on `activity(user_id)`

---

## 7. Features (Detailed)

### 7.1 Authentication

**Email/Password Registration (OTP-Verified)**
1. User enters email on Sign Up
2. Backend sends 6-digit OTP via Gmail (valid 10 minutes)
3. User enters OTP + password
4. Account created, JWT token returned (7-day expiry)
5. Welcome email sent automatically

**Google OAuth Login**
1. User clicks "Continue with Google"
2. Redirected to Google consent screen
3. Callback creates/finds user in database
4. JWT issued, redirect to frontend with token in URL hash

**Session Storage**
- Token stored in `localStorage` as `token`
- Email stored as `userEmail`
- Plan fetched from server on login (not cached permanently)

### 7.2 AI Post Generation (Post Genie)

**Step 1 — Generate Ideas**
- User enters topic, selects tone, number of posts, word count
- Optional: select AI model (`gemini-2.5-flash` default)
- Voice input supported via Web Speech API
- Calls `POST /generate_ideas`
- Returns structured post ideas

**Step 2 — Generate Full Posts**
- User selects ideas from tiles
- Calls `POST /generate_posts_with_media`
- For each idea, Gemini generates:
  - Full post content
  - Clean hashtags (regex-validated `#word` format)
  - Image search keywords
- Posts saved to SQLite for logged-in users
- Pexels images fetched on frontend for display

**Brand Voice Personalization**
- Settings page: `brand_description` + `target_audience`
- Injected into every Gemini prompt
- Premium feature for full access

### 7.3 Post Library (My Posts)

- View all saved/generated posts
- Publish to Facebook immediately
- Schedule for future publishing
- Delete posts
- View engagement metrics (Premium)
- Sync engagement from Facebook

### 7.4 Smart Calendar

- Visual calendar view of scheduled and published posts
- Create posts directly from calendar
- Day cells show post cards
- Sidebar with upcoming scheduled posts

### 7.5 Facebook Integration

**Permissions Requested:**
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_read_user_content`
- `read_insights`

**Flow:**
1. Connect Facebook Page via JS SDK
2. Short-lived token exchanged for long-lived token (~60 days)
3. Token stored as JSON in user record
4. Publish via Graph API `/photos` (with image) or `/feed` (text only)

### 7.6 Engagement Analytics (Premium)

- Sync likes and comments from Facebook Graph API
- Dashboard metric cards: Total Posts, Scheduled, Published, Likes, Comments
- Click Likes/Comments cards to see individual reactors and comment text
- Recent activity feed (last 5 actions)

### 7.7 Activity Logging

| Event Type | Trigger |
|-----------|---------|
| `ideas_generated` | Ideas generated on Post Genie |
| `posts_generated` | Full posts generated |
| `post_uploaded` | Post published to Facebook |

Recent page shows full timeline with date grouping and filter tabs.

### 7.8 Streak System

- Client-side tracking in `localStorage`
- Records daily app usage per user email
- Tracks: current streak, longest streak, total active days
- Streak page with activity calendar visualization

### 7.9 Subscription Tiers

#### Free Tier
| Feature | Access |
|---------|--------|
| AI Generations | 10 per 24 hours |
| Dashboard Analytics | Blocked (redirect to Upgrade) |
| Engagement Analytics | Blocked |
| Brand Voice Settings | Blocked |
| Facebook Publishing | ✅ Allowed |
| Post Scheduling | ✅ Allowed |
| Post Archive | ✅ Allowed |

#### Premium Tier ($9/month)
| Feature | Access |
|---------|--------|
| AI Generations | Unlimited |
| Dashboard | ✅ Full access |
| Engagement Analytics | ✅ Full access |
| Brand Voice Settings | ✅ Full access |
| All Free features | ✅ Included |

---

## 8. API Endpoints Reference

**Base URL:** `http://localhost:3001`  
**Auth Header:** `Authorization: Bearer <JWT_TOKEN>` (where required)

### AI Generation (Usage-Limited)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generate_ideas` | Optional | Generate post ideas from topic |
| POST | `/generate_posts_with_media` | Optional | Generate full posts from selected ideas |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/send-otp` | No | Send OTP to email |
| POST | `/api/auth/verify-otp` | No | Verify OTP and create account |
| POST | `/api/auth/signin` | No | Email/password login |
| GET | `/api/auth/protected` | Yes | Test protected route |
| GET | `/api/auth/google` | No | Google OAuth redirect |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/posts/generate` | Yes | Generate single post |
| GET | `/api/posts` | Yes | Get all user posts |
| GET | `/api/posts/:postId` | Yes | Get post by ID |
| PUT | `/api/posts/:postId` | Yes | Update post |
| DELETE | `/api/posts/:postId` | Yes | Delete post |
| PATCH | `/api/posts/:postId/facebook` | Yes | Mark as posted to Facebook |

### Post Library

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/library` | Yes | Fetch all saved posts |
| DELETE | `/api/library/:id` | Yes | Delete post from library |
| PATCH | `/api/library/:id/schedule` | Yes | Schedule post for auto-publish |
| PATCH | `/api/library/:id/unschedule` | Yes | Cancel scheduled post |

### Facebook

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/facebook/save-token` | Yes | Save Facebook page token |
| GET | `/api/facebook/status` | Yes | Check connection status |
| POST | `/api/facebook/disconnect` | Yes | Disconnect Facebook |
| POST | `/api/facebook/post` | Yes | Publish post to Facebook |
| GET | `/api/facebook/sync-engagement` | Yes | Sync likes/comments |
| GET | `/api/facebook/post-details/:fbPostId` | Yes | Get reactors and comments |

### Subscription & Payment

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subscription/plan` | Yes | Get plan and usage stats |
| POST | `/api/subscription/upgrade` | Yes | Disabled — use Stripe |
| POST | `/api/subscription/downgrade` | Yes | Downgrade to free (testing) |
| GET | `/api/payment/config` | No | Get Stripe publishable key |
| POST | `/api/payment/create-checkout` | Yes | Create Stripe checkout session |
| POST | `/api/payment/webhook` | No | Stripe webhook (raw body) |

### Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/settings` | Yes | Get brand voice settings |
| POST | `/api/settings` | Yes | Save brand voice settings |
| PATCH | `/api/settings/username` | Yes | Update username |
| PATCH | `/api/settings/password` | Yes | Change password |
| DELETE | `/api/settings/account` | Yes | Delete account |

### Activity & Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/activity` | Yes | Log activity event |
| GET | `/api/activity` | Yes | Get activity log |
| GET | `/api/dashboard` | Yes | Aggregated dashboard stats |

### Scheduled Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/scheduled-posts/schedule` | Yes | Schedule post with media upload |
| GET | `/api/scheduled-posts/get-posts` | No* | Get scheduled posts |

---

## 9. Frontend Application

### Routes (HashRouter)

| Path | Page | Description |
|------|------|-------------|
| `/` | DashboardPage | Analytics dashboard (Premium) |
| `/post-genie` | PostGeniePage | AI idea & post generation |
| `/posts` | PostsPage | Post library / archive |
| `/calendar` | CalendarPage | Smart content calendar |
| `/connect-social` | ConnectSocial | Facebook page connection |
| `/recent` | RecentPage | Activity timeline |
| `/streak` | StreakPage | Daily usage streak |
| `/settings` | SettingsPage | Brand voice & account settings |
| `/upgrade` | UpgradePage | Premium subscription (Stripe) |
| `/profile` | ProfilePage / AuthPage | Profile or login/signup |

### Redux Store Slices

| Slice | File | Purpose |
|-------|------|---------|
| `ideas` | `features/ideas/ideasSlice.js` | AI-generated ideas state |
| `posts` | `features/posts/postsSlice.js` | Generated posts state |
| `selectedIdeas` | `features/SelectedIdeas/selectedIdeasSlice.js` | User-selected ideas |

### Vite Path Aliases

| Alias | Path |
|-------|------|
| `@` | `src/` |
| `@assets` | `src/assets/` |
| `@components` | `src/components/` |
| `@hooks` | `src/hooks/` |
| `@pages` | `src/pages/` |
| `@routes` | `src/routes/` |
| `@utils` | `src/utils/` |

### Frontend NPM Scripts

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 10. Backend Application

### Entry Point Flow

1. `server.js` loads dotenv, imports `app.js`, starts Express on `PORT`
2. `startScheduler()` from `schedulerService.js` registers cron job
3. `app.js` connects SQLite, mounts all routes and middleware

### Key Middleware

| Middleware | Purpose |
|-----------|---------|
| CORS | Allows origins: localhost:5173, 5174, 3000 |
| express.json() | JSON body parsing |
| express.raw() | Raw body for Stripe webhook only |
| passport.initialize() | Google OAuth |
| authMiddleware | JWT verification |
| checkUsageLimit | Free tier AI generation limit |

### Backend NPM Scripts

```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Production start
```

---

## 11. Authentication & Security

| Mechanism | Detail |
|-----------|--------|
| Password Hashing | bcrypt with salt rounds = 10 |
| JWT Expiry | 7 days |
| OTP Expiry | 10 minutes |
| Token Storage | Frontend localStorage |
| CORS | Restricted to specific localhost origins |
| Stripe Webhooks | Signature verification via `STRIPE_WEBHOOK_SECRET` |
| Usage Limits | Server-side enforcement via middleware |
| Facebook Tokens | Long-lived tokens stored encrypted in DB as JSON |

---

## 12. Subscription & Payments

### Stripe Flow

1. User clicks "Upgrade to Premium — $9/mo"
2. `POST /api/payment/create-checkout` creates Stripe Checkout Session
3. User redirected to Stripe hosted checkout
4. On success: Stripe webhook `checkout.session.completed` → user upgraded to `premium`
5. On cancellation: `customer.subscription.deleted` → user downgraded to `free`

### Usage Limit Logic

1. Every AI call passes through `checkUsageLimit` middleware
2. If `(now - usage_reset_at) >= 24 hours` → reset `daily_usage = 0`
3. If `daily_usage >= 10` (free) → HTTP 429 with `{ upgrade: true }`
4. Premium users bypass limit entirely
5. Anonymous users (no token) bypass limit (but posts won't save)

### Test Card

```
4242 4242 4242 4242
```

---

## 13. AI Content Generation

### Service File

`social-brain-backend-main/src/services/geminiService.js`

### Functions

| Function | Purpose |
|----------|---------|
| `generatePostPrompts()` | Generate N post ideas from topic + tone |
| `generatePostContent()` | Generate full post with hashtags & image prompt |
| `generatePostPromptsWithTracking()` | Wrapper with quota fallback to mock data |
| `generatePostContentWithTracking()` | Wrapper with quota fallback to mock data |
| `extractKeywordsWithTracking()` | Returns topic as keyword (simplified) |

### Prompt Structure

Ideas prompt includes:
- Brand description (if set)
- Target audience (if set)
- Topic, tone, number of posts
- Structured output format: `IDEA 1: ...`, `IDEA 2: ...`

Post content prompt includes:
- Delimited sections: `---CONTENT_START---`, `---HASHTAGS_START---`, `---IMAGE_PROMPT_START---`
- Hashtag validation via regex (only `#word` format)
- Fallback mock data on API quota errors (429)

---

## 14. Facebook Integration

### Graph API Version

**v19.0**

### Publishing Logic

1. Retrieve user's stored Facebook token from database
2. Build message: `content + hashtags`
3. Fetch Pexels image using `originalTopic` or `image_prompt`
4. If image found: `POST /{pageId}/photos` with image URL
5. If no image: `POST /{pageId}/feed` (text only)
6. Store `facebook_post_id` and set `posted_to_facebook = 1`

### Engagement Sync

- `GET /{postId}?fields=reactions.summary(true),comments.summary(true)`
- Updates `likes`, `comments` columns in posts table
- Post details endpoint returns individual reactor names and comment text

---

## 15. Post Scheduling & Automation

### Scheduler Service

**File:** `social-brain-backend-main/src/services/schedulerService.js`

| Setting | Value |
|---------|-------|
| Cron Expression | `* * * * *` (every minute) |
| Query | Posts where `scheduled_at <= NOW AND posted_to_facebook = 0` |
| Action | Publish to Facebook via same logic as manual publish |
| On Success | Update `posted_to_facebook = 1`, store `facebook_post_id` |

### Scheduling from Frontend

1. User clicks schedule icon on post card
2. Datetime picker (minimum: 1 minute in future)
3. `PATCH /api/library/:id/schedule` with `{ scheduled_at }`
4. Scheduler picks up and publishes automatically

---

## 16. Environment Variables

### Backend (`social-brain-backend-main/.env`)

Create this file — it is not committed to git.

```env
# Server
PORT=3001
DB_PATH=./database/socialbrain.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google Gemini AI
GOOGLE_API_KEY=your-google-gemini-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Email (Gmail App Password)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password

# Pexels Images
PEXELS_API_KEY=your-pexels-api-key

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Facebook / Meta
FACEBOOK_APP_ID=your-meta-app-id
FACEBOOK_APP_SECRET=your-meta-app-secret

# Cloudinary (optional)
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
```

### Frontend (`social-brain-frontend-main/.env`)

```env
VITE_PEXELS_API_KEY=your-pexels-api-key
```

### Where to Get API Keys

| Service | URL |
|---------|-----|
| Google Gemini | https://aistudio.google.com/app/apikey |
| Google OAuth | https://console.cloud.google.com/ |
| Pexels | https://www.pexels.com/api/ |
| Stripe | https://dashboard.stripe.com/ |
| Facebook/Meta | https://developers.facebook.com/ |
| Gmail App Password | Google Account → Security → App Passwords |

---

## 17. Setup & Running Locally

### Prerequisites

- Node.js v16+ (v18+ recommended)
- npm
- Git

### Step 1 — Install Dependencies

```bash
# Backend
cd social-brain-backend-main
npm install

# Frontend
cd ../social-brain-frontend-main
npm install
```

### Step 2 — Configure Environment

1. Create `social-brain-backend-main/.env` with all required variables (see Section 16)
2. Set `PORT=3001` to match frontend API calls
3. Optionally create `social-brain-frontend-main/.env` for Pexels key

### Step 3 — Start Services (2 Terminals)

**Terminal 1 — Backend:**
```bash
cd social-brain-backend-main
npm run dev
```
Expected output: `Server is running on http://localhost:3001` and `Post scheduler started`

**Terminal 2 — Frontend:**
```bash
cd social-brain-frontend-main
npm run dev
```
Expected output: `Local: http://localhost:5173/`

### Step 4 — Verify

| Check | URL / Action |
|-------|-------------|
| Backend running | Console shows server + scheduler messages |
| Frontend running | http://localhost:5173 |
| Database created | `database/socialbrain.db` file exists |
| AI generation | Go to Post Genie, enter topic, generate ideas |
| Auth | Sign up with email, receive OTP |

### Stripe Webhook (Local Testing)

```bash
stripe listen --forward-to localhost:3001/api/payment/webhook
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 18. Deployment

### Frontend — Vercel

- Configured via `vercel.json` at project root
- Builds from `social-brain-frontend-main/package.json`
- Output directory: `dist/`
- SPA routing: all routes redirect to `index.html`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "social-brain-frontend-main/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Backend

- Requires Node.js hosting (Railway, Render, Heroku, VPS, etc.)
- SQLite file must persist on disk (or migrate to PostgreSQL for cloud)
- Update CORS origins for production frontend URL
- Update Google OAuth callback URL for production
- Update Stripe success/cancel URLs in `paymentController.js`

---

## 19. Development Tools & Scripts

| Script / Tool | Location | Purpose |
|--------------|----------|---------|
| `npm run dev` (frontend) | frontend | Vite dev server with HMR |
| `npm run build` (frontend) | frontend | Production build |
| `npm run lint` (frontend) | frontend | ESLint check |
| `npm run dev` (backend) | backend | Nodemon auto-reload |
| `npm start` (backend) | backend | Production server |
| `test-gemini.js` | backend root | Test Gemini API connection |
| Stripe CLI | external | Local webhook forwarding |

---

## 20. UI/UX & Design

### Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Teal | `#46a29f` | Buttons, accents, logo |
| Dark Teal | `#3b8c86` | Gradients |
| Light Background | `#f8f9fa` | Page backgrounds |
| Text Dark | `#1e293b` | Headings |
| Text Muted | `#94a3b8` | Secondary text |

### UI Components

- Fixed sidebar navigation (220px width on desktop)
- Responsive mobile sidebar with overlay
- Animated loading screen on app start (4 seconds)
- Toast notifications via React Hot Toast
- Bootstrap 5 grid and utilities
- CSS Modules for component-scoped styles
- Framer Motion for page/component animations

### Theme

- Light theme only (dark mode disabled)
- Font: Inter, system-ui, sans-serif

---

## 21. Legacy Notes & Documentation

### Architecture Evolution

| Earlier Design | Current Design |
|---------------|----------------|
| 3 services (Frontend + Backend + Python AI) | 2 services (Frontend + Backend with integrated AI) |
| MongoDB | SQLite |
| FastAPI on port 8000 | Gemini SDK in Express backend |
| OpenAI GPT-4 | Google Gemini 2.5 Flash |
| LangChain + Tavily RAG | Direct Gemini prompts (simplified) |
| Backend port 3000 | Frontend expects port 3001 |

### Other Documentation Files in Repo

| File | Contents |
|------|----------|
| `TECHNICAL_AUDIT.md` | Detailed technical audit (mostly current) |
| `SETUP_GUIDE.md` | Setup guide (references legacy AI service & MongoDB) |
| `QUICK_START.md` | Quick start (references legacy architecture) |
| `PROJECT_ANALYSIS.md` | 3-service architecture analysis (legacy) |
| `DEBUGGING_GUIDE.md` | Gemini API key troubleshooting |
| `SMART_CALENDAR_IMPLEMENTATION.md` | Calendar feature implementation |
| `CALENDAR_VISUAL_GUIDE.md` | Calendar UI guide |
| `REFACTORING_COMPLETE.md` | Refactoring completion notes |
| `MONGODB_SETUP.md` | MongoDB setup (no longer used) |

---

## Quick Reference Summary

| Item | Value |
|------|-------|
| **Project Name** | Idea Pulse |
| **Type** | FYP 2025 — AI Social Media Manager |
| **Frontend** | React 19 + Vite 6 → port 5173 |
| **Backend** | Node.js + Express 4 → port 3001 |
| **Database** | SQLite (`socialbrain.db`) |
| **AI** | Google Gemini 2.5 Flash (integrated in backend) |
| **Social Platform** | Facebook Pages (Graph API v19.0) |
| **Payments** | Stripe ($9/month Premium) |
| **Auth** | JWT + OTP Email + Google OAuth |
| **Scheduler** | node-cron (every minute) |
| **Deployment** | Vercel (frontend) |

---

*Document generated: July 2026*  
*Idea Pulse — Final Year Project Documentation*
