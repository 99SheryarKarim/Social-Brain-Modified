# MongoDB Setup Guide

## Current Error
```
connect ECONNREFUSED 127.0.0.1:27017
```
This means MongoDB is not running on your local machine.

---

## Option 1: MongoDB Atlas (Cloud) - RECOMMENDED ✅

### Steps:

1. **Sign up for free MongoDB Atlas account:**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free account (M0 cluster is free forever)

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select a cloud provider and region
   - Click "Create"

3. **Set up Database Access:**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Set up Network Access:**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) OR add your IP
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update your `.env` file:**
   - Open `social-brain-backend-main/.env`
   - Replace `MONGO_URI` with your Atlas connection string
   - Add database name at the end:
     ```
     MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/socialbrain?retryWrites=true&w=majority
     ```
   - Replace `username`, `password`, and `cluster0.xxxxx` with your actual values

7. **Restart your backend server:**
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart
   npm run dev
   ```

---

## Option 2: Install MongoDB Locally

### Windows:

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select Windows → MSI installer
   - Download and install

2. **Start MongoDB Service:**
   - Open Services (Win+R → `services.msc`)
   - Find "MongoDB" service
   - Right-click → Start
   - OR use Command Prompt (as Administrator):
     ```bash
     net start MongoDB
     ```

3. **Verify MongoDB is running:**
   ```bash
     mongod --version
     ```

4. **Your `.env` file should already be correct:**
   ```
   MONGO_URI=mongodb://localhost:27017/socialbrain
   ```

5. **Restart your backend server**

---

## Option 3: Use Docker (if you have Docker installed)

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Your .env file is already correct
MONGO_URI=mongodb://localhost:27017/socialbrain
```

---

## Verify Connection

After setting up MongoDB (either option), restart your backend:

```bash
cd social-brain-backend-main
npm run dev
```

You should see:
```
✅ Connected to MongoDB
```

Instead of the error!

---

## Quick Fix Summary

**For MongoDB Atlas (Easiest):**
1. Sign up at mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env` file with connection string
5. Restart backend

**For Local MongoDB:**
1. Install MongoDB Community Server
2. Start MongoDB service
3. Keep `.env` as is (already correct)
4. Restart backend
