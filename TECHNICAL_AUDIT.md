# Social Brain — Technical Audit & Feature Documentation
### Final Year Project (FYP) — 2025

---

## 1. Technology Stack & Dependencies

### 1.1 Frontend

| Item | Technology | Version |
|------|-----------|---------|
| Framework | React | ^19.0.0 |
| Build Tool | Vite | ^6.2.0 |
| Language | JavaScript (ESM) | ES2022+ |
| Routing | React Router DOM | ^7.5.0 |
| State Management | Redux Toolkit | ^2.7.0 |
| HTTP Client | Axios | ^1.8.4 |
| Animations | Framer Motion | ^11.0.3 |
| Notifications | React Hot Toast | ^2.4.1 |
| Icons | Font Awesome (CDN) | 6.x |
| Styling | Inline CSS + Bootstrap 5 (CDN) | — |

### 1.2 Backend

| Item | Technology | Version |
|------|-----------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express.js | ^4.21.2 |
| Database | SQLite3 | ^5.1.7 |
| Authentication | JSON Web Token (JWT) | ^9.0.2 |
| Password Hashing | bcrypt / bcryptjs | ^5.1.1 / ^3.0.2 |
| OAuth | Passport.js + Google Strategy | ^0.7.0 / ^2.0.0 |
| Email | Nodemailer | ^8.0.6 |
| Payments | Stripe SDK | ^22.1.0 |
| Scheduling | node-cron | ^4.2.1 |
| File Uploads | Multer | ^2.0.0 |
| Environment | dotenv | ^16.5.0 |
| Dev Server | Nodemon | ^3.1.7 |

### 1.3 External APIs & Services

| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| Google Gemini 2.5 Flash | AI post & idea generation | `@google/generative-ai` SDK |
| Meta (Facebook) Graph API v19.0 | Publish posts to Facebook Pages | REST via Axios |
| Pexels API | Fetch relevant images for posts | REST via Axios |
| Stripe | Subscription payments | Stripe SDK + Webhooks |
| Google OAuth 2.0 | Social login | Passport.js Google Strategy |
| Gmail (SMTP) | OTP verification + welcome emails | Nodemailer |

---

## 2. Feature Set — Current Implementation

### 2.1 Authentication System

**Email/Password Registration (OTP-Verified)**
- User enters email and password on the Sign Up form
- Backend calls `POST /api/auth/send-otp` which generates a 6-digit OTP, stores it in the `otps` table with a 10-minute expiry, and sends it via Nodemailer/Gmail
- User enters the OTP on the verification screen
- Backend calls `POST /api/auth/verify-otp`, validates the code, creates the user in the `users` table with a bcrypt-hashed password, and returns a JWT token
- A professional HTML welcome email is sent to the user's inbox upon successful registration

**Google OAuth Login**
- User clicks "Continue with Google"
- Passport.js redirects to Google's OAuth consent screen
- On success, Google redirects to `GET /api/auth/google/callback`
- Backend finds or creates the user in the database, generates a JWT, and redirects to the frontend with the token in the URL hash
- New Google users receive a welcome email automatically

**Session Management**
- JWT tokens are stored in `localStorage` and sent as `Authorization: Bearer <token>` headers
- Tokens expire after 7 days
- Plan status is fetched from the server on every login (never trusted from cache)

---

### 2.2 AI Post Generation

**Step 1 — Idea Generation**
- User enters a topic (e.g., "Gaming") and selects a tone (Professional, Creative, Witty, etc.) on the Post Genie page
- Frontend calls `POST /generate_ideas` with `{ prompt, num_posts, tone, num_words }`
- Backend fetches the user's Brand Voice settings from the `settings` table
- A direct prompt is sent to **Google Gemini 2.5 Flash**:
  > *"You are an AI Social Media Manager for [Brand Description]. Target audience: [Target Audience]. Generate X post ideas about [Topic] in a [Tone] tone."*
- Gemini returns structured ideas parsed by regex and returned to the frontend

**Step 2 — Post Content Generation**
- User selects ideas and clicks "Generate Posts"
- Frontend calls `POST /generate_posts_with_media`
- For each selected idea, Gemini generates:
  - Full post content (anchored to the original topic)
  - Clean hashtags (only `#word` format, validated by regex)
  - Image search keywords
- Each generated post is saved to the `posts` table in SQLite (for logged-in users)
- Posts are returned to the frontend and displayed on the Posts page

**Brand Voice Personalisation**
- Users can set `brand_description` and `target_audience` in Settings
- These are injected into every Gemini prompt, transforming generic output into brand-specific content
- Example: Topic "travel" + Brand "Eco-friendly trekking in Hunza" → posts about sustainable tourism in the Karakoram mountains

---

### 2.3 Image Integration (Pexels API)

- After posts are generated, the frontend fetches a relevant image from Pexels using `topic + tone` as the search query
- Example: "gaming" + "Creative" → searches Pexels for "gaming creative"
- When publishing to Facebook, the backend fetches the Pexels image server-side and attaches it to the Facebook post via the Graph API `/photos` endpoint
- Falls back to a placeholder image if Pexels returns no results

---

### 2.4 Facebook Integration

**Connecting a Facebook Page**
1. User clicks the Facebook card on the Connect Social page
2. Facebook JS SDK triggers a login popup requesting permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `pages_read_user_content`, `read_insights`
3. On success, the frontend calls `/me/accounts` to get the user's managed pages
4. The page's access token is sent to `POST /api/facebook/save-token`
5. Backend exchanges the short-lived token for a **long-lived token (60-day expiry)** via the Graph API token exchange endpoint
6. The token, page ID, and page name are stored as JSON in the `users.facebook_token` column

**Publishing a Post**
- User clicks "Publish Now" on an archive card
- Frontend calls `POST /api/facebook/post` with `{ content, hashtags, originalTopic, postDbId }`
- Backend retrieves the user's stored Facebook token from the database
- Fetches a relevant Pexels image server-side using the `originalTopic`
- Calls `POST /{pageId}/photos` (with image) or `POST /{pageId}/feed` (text only) on the Graph API
- Stores the full `pageId_postId` format Facebook post ID in the database
- Updates `posted_to_facebook = 1` on the post record

**Engagement Analytics**
- User clicks "Sync Engagement" on the Archive tab
- Backend calls `GET /{fullPostId}?fields=reactions.summary(true),comments.summary(true)` for each published post
- Likes and comments counts are stored in the `posts` table
- Clicking the Likes or Comments metric cards on the Dashboard opens a modal showing individual reactor names and full comment text

---

### 2.5 Content Scheduling (Automation)

**Scheduling a Post**
- User clicks the clock icon on any archive card
- A datetime picker appears inline — minimum time is 1 minute in the future
- On confirm, `PATCH /api/library/:id/schedule` saves the `scheduled_at` datetime to the post record

**Automated Publishing (node-cron)**
- When the backend server starts, `schedulerService.js` registers a cron job that runs **every minute**
- The job queries: `SELECT posts WHERE scheduled_at <= NOW AND posted_to_facebook = 0`
- For each due post, it fetches the user's Facebook token, gets a Pexels image, and publishes to Facebook automatically
- On success, `posted_to_facebook = 1` and `facebook_post_id` are updated in the database
- Console logs: `✅ Scheduler: published post {id} → FB id {fbPostId}`

---

### 2.6 Tiered Access — Subscription / Paywall

#### Free Tier
| Restriction | Detail |
|-------------|--------|
| AI Generations | 10 per 24-hour period |
| Dashboard | Redirected to Upgrade page |
| Engagement Analytics | Blocked |
| Brand Voice Settings | Blocked |
| Facebook Publishing | ✅ Allowed |
| Post Scheduling | ✅ Allowed |
| Post Archive | ✅ Allowed |

#### Premium Tier ($9/month via Stripe)
| Feature | Detail |
|---------|--------|
| AI Generations | Unlimited |
| Dashboard | ✅ Full access |
| Engagement Analytics | ✅ Full access |
| Brand Voice Settings | ✅ Full access |
| All Free features | ✅ Included |

#### Usage Tracking Logic
1. Every call to `/generate_ideas` or `/generate_posts_with_media` passes through the `checkUsageLimit` middleware
2. Middleware decodes the JWT to get `userId`, queries `users.daily_usage` and `users.usage_reset_at`
3. If `(now - usage_reset_at) >= 24 hours` → resets `daily_usage = 0` and updates `usage_reset_at`
4. If `daily_usage >= 10` → returns HTTP 429 with `{ upgrade: true }` → frontend redirects to Upgrade page
5. Otherwise → increments `daily_usage` by 1 and allows the request
6. Premium users bypass the middleware entirely

#### Stripe Payment Flow
1. User clicks "Upgrade to Premium — $9/mo"
2. Frontend calls `POST /api/payment/create-checkout`
3. Backend creates a Stripe Checkout Session with `mode: 'subscription'` and the Price ID
4. User is redirected to Stripe's hosted checkout page
5. User enters card details (test card: `4242 4242 4242 4242`)
6. On payment success, Stripe sends a `checkout.session.completed` webhook to `POST /api/payment/webhook`
7. Backend verifies the webhook signature using `STRIPE_WEBHOOK_SECRET`
8. Extracts `userId` from `session.metadata`, updates `users.plan = 'premium'` and stores `stripe_customer_id` and `stripe_subscription_id`
9. On subscription cancellation, `customer.subscription.deleted` webhook downgrades the user back to `free`

---

### 2.7 Personal Dashboard (Premium Only)

Displays real-time statistics queried from SQLite:

| Metric Card | SQL Query |
|-------------|-----------|
| Total Posts | `COUNT(*) FROM posts WHERE user_id = ?` |
| Scheduled | `COUNT(*) WHERE scheduled_at IS NOT NULL AND posted_to_facebook = 0` |
| Published | `COUNT(*) WHERE posted_to_facebook = 1` |
| Total Likes | `SUM(likes) FROM posts WHERE posted_to_facebook = 1` |
| Total Comments | `SUM(comments) FROM posts WHERE posted_to_facebook = 1` |
| Activities | `COUNT(*) FROM activity WHERE user_id = ?` |

- Clicking the Likes or Comments card opens an engagement modal fetching live data from the Facebook Graph API
- Recent Activity feed shows the last 5 logged actions

---

### 2.8 Activity Logging

Every significant user action is saved to the `activity` table:

| Event Type | Trigger |
|-----------|---------|
| `ideas_generated` | User generates ideas on Post Genie |
| `posts_generated` | User generates post content |
| `post_uploaded` | User publishes a post to Facebook |

The Recent Activity page displays a full timeline grouped by date with filter tabs, stats summary, relative timestamps, and meta tags (tone, topic, count).

---

## 3. Project Architecture

### 3.1 Folder Structure

```
Social Brain code/
├── social-brain-frontend-main/        # React + Vite SPA
│   └── src/
│       ├── app/                       # App.jsx (routing, auth state, plan state)
│       ├── components/                # Navbar, Sidebar, PostCard, IdeaTile
│       ├── features/                  # Redux slices (ideas, posts, selectedIdeas)
│       ├── pages/                     # Dashboard, PostGenie, Posts, Profile,
│       │                              # Upgrade, Settings, Recent, Connect
│       ├── services/                  # activityService, post-to-fb
│       └── main.jsx                   # Entry point + LoadingScreen
│
└── social-brain-backend-main/         # Node.js + Express REST API
    ├── database/
    │   ├── init.js                    # SQLite schema + migrations
    │   └── socialbrain.db             # SQLite database file
    └── src/
        ├── controllers/               # Auth, AI Generation, Facebook,
        │                              # Payment, Subscription, Settings, Activity
        ├── middlewares/               # auth.js (JWT), multer.js
        ├── models/                    # databaseModels.js (User, Post)
        ├── routes/                    # authRoutes, facebookRoutes, paymentRoutes,
        │                              # subscriptionRoutes, settingsRoutes, activityRoutes
        ├── services/                  # geminiService, emailService, schedulerService
        ├── config/                    # googleAuth.js (Passport)
        └── server.js                  # Entry point — starts Express + cron scheduler
```

### 3.2 Database Schema

```
users          — id, email, password_hash, facebook_token, plan, daily_usage,
                 usage_reset_at, stripe_customer_id, stripe_subscription_id
posts          — id, user_id, content, tone, hashtags, image_prompt, original_topic,
                 posted_to_facebook, facebook_post_id, scheduled_at, likes, comments,
                 shares, engagement_updated_at
activity       — id, user_id, type, description, meta (JSON), created_at
settings       — id, user_id, brand_description, target_audience
otps           — id, email, otp, expires_at
```

### 3.3 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  User Input → Redux Action → Axios HTTP Request                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP (localhost:3001)
┌──────────────────────▼──────────────────────────────────────────┐
│                      BACKEND (Express)                           │
│                                                                  │
│  JWT Middleware → Controller → SQLite DB                         │
│       │                │                                         │
│       │         ┌──────┴──────────────────────┐                 │
│       │         │   External API Calls         │                 │
│       │         │  • Google Gemini (AI)        │                 │
│       │         │  • Facebook Graph API        │                 │
│       │         │  • Pexels (Images)           │                 │
│       │         │  • Stripe (Payments)         │                 │
│       │         │  • Gmail SMTP (Emails)       │                 │
│       │         └─────────────────────────────┘                 │
│       │                                                          │
│  node-cron (every minute)                                        │
│  → Query due scheduled posts → Publish to Facebook              │
└──────────────────────────────────────────────────────────────────┘
                       ▲
                       │ Webhook (POST /api/payment/webhook)
┌──────────────────────┴──────────────────────────────────────────┐
│                         STRIPE                                   │
│  checkout.session.completed → upgrade user to premium            │
│  customer.subscription.deleted → downgrade user to free          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate_ideas` | Generate AI post ideas (usage-limited) |
| POST | `/generate_posts_with_media` | Generate full post content (usage-limited) |
| POST | `/api/auth/send-otp` | Send OTP to email for registration |
| POST | `/api/auth/verify-otp` | Verify OTP and create account |
| POST | `/api/auth/signin` | Email/password login |
| GET | `/api/auth/google` | Google OAuth redirect |
| GET | `/api/facebook/status` | Check Facebook page connection |
| POST | `/api/facebook/save-token` | Save long-lived Facebook page token |
| POST | `/api/facebook/post` | Publish post to Facebook page |
| GET | `/api/facebook/sync-engagement` | Fetch likes/comments from Graph API |
| GET | `/api/facebook/post-details/:id` | Get individual reactors and comments |
| GET | `/api/library` | Fetch all saved posts for user |
| PATCH | `/api/library/:id/schedule` | Schedule a post for auto-publish |
| GET | `/api/subscription/plan` | Get user's current plan and usage |
| POST | `/api/payment/create-checkout` | Create Stripe checkout session |
| POST | `/api/payment/webhook` | Stripe webhook (raw body) |
| GET | `/api/dashboard` | Aggregated stats for dashboard |
| GET | `/api/activity` | Full activity log for user |
| GET/POST | `/api/settings` | Get/save brand voice settings |

---

## 4. Environment Variables Required

### Backend (`social-brain-backend-main/.env`)
```env
PORT=3001
DB_PATH=./database/socialbrain.db
JWT_SECRET=<strong-random-string>
GOOGLE_API_KEY=<gemini-api-key>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
EMAIL_USER=<gmail-address>
EMAIL_PASS=<gmail-app-password>
PEXELS_API_KEY=<pexels-api-key>
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<stripe-publishable-key>
STRIPE_PRICE_ID=<stripe-price-id>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
FACEBOOK_APP_ID=<meta-app-id>
FACEBOOK_APP_SECRET=<meta-app-secret>
```

### Frontend (`social-brain-frontend-main/.env`)
```env
VITE_PEXELS_API_KEY=<pexels-api-key>
```

---

*Document generated for Social Brain FYP — 2025*
