# 🌐 Port Configuration Guide

This guide explains how the different components of your PS5 Games application are configured to run on separate ports to avoid conflicts.

## 📊 Port Allocation

| Component | Port | URL | Purpose |
|-----------|------|-----|---------|
| **Backend API** | 3000 | http://localhost:3000 | Node.js/Express server with SQLite |
| **Frontend** | 8000 | http://localhost:8000 | React development server |
| **SQLite Database** | N/A | File-based | Embedded in backend (no separate port) |

## 🔧 Why These Ports?

- **Backend (3000)**: Standard Node.js port, already configured
- **Frontend (8000)**: Avoids conflict with backend, easy to remember
- **SQLite**: File-based database, no network port needed

## 🚀 How to Start Each Component

### 1. Start Backend (Port 3000)

```bash
cd backend
./start-sqlite.sh
```

Or manually:
```bash
cd backend
npm install
npm run db:setup
npm run db:seed
npm start
```

**Backend will be available at:** http://localhost:3000

### 2. Start Frontend (Port 8000)

```bash
./start-frontend.sh
```

Or manually:
```bash
npm install
PORT=8000 npm start
```

**Frontend will be available at:** http://localhost:8000

## 🔗 Communication Flow

```
Frontend (Port 8000) → Backend API (Port 3000) → SQLite Database (File)
```

1. **Frontend** serves the React UI on port 8000
2. **Frontend** makes API calls to backend on port 3000
3. **Backend** processes requests and queries SQLite database
4. **SQLite** is embedded in the backend process (no separate port)

## 📁 Configuration Files

### Frontend Configuration (`.env`)
```bash
# Frontend runs on port 8000
PORT=8000

# Backend API URL (port 3000)
REACT_APP_API_URL=http://localhost:3000/api
```

### Backend Configuration (`backend/.env`)
```bash
# Backend runs on port 3000
PORT=3000

# SQLite database file path (no port needed)
DB_PATH=./data/ps5_games.db
```

## 🧪 Testing the Setup

### 1. Test Backend (Port 3000)
```bash
# Health check
curl http://localhost:3000/health

# Get games
curl http://localhost:3000/api/games/stats
```

### 2. Test Frontend (Port 8000)
- Open browser: http://localhost:8000
- Should display PS5 Games search interface
- Search should work and fetch data from backend

## 🚨 Troubleshooting Port Conflicts

### Port 3000 Already in Use
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or change backend port in backend/.env
PORT=3001
```

### Port 8000 Already in Use
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change frontend port in .env
PORT=8001
```

## 🔄 Development Workflow

### Option 1: Run Both Together

**Terminal 1 (Backend):**
```bash
cd backend
./start-sqlite.sh
```

**Terminal 2 (Frontend):**
```bash
./start-frontend.sh
```

### Option 2: Use Package Scripts

You can add these scripts to your main `package.json`:

```json
{
  "scripts": {
    "dev:backend": "cd backend && npm start",
    "dev:frontend": "PORT=8000 npm start",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

## 📱 Accessing Your Application

1. **Frontend**: http://localhost:8000 - User interface
2. **Backend API**: http://localhost:3000 - API endpoints
3. **Database**: `backend/data/ps5_games.db` - SQLite file

## 🔐 CORS Configuration

The backend is configured to allow requests from the frontend:

```javascript
// In backend, CORS allows frontend port 8000
cors({
  origin: ['http://localhost:8000', 'http://localhost:3000'],
  credentials: true
})
```

## ✅ Verification Checklist

- [ ] Backend starts on port 3000 without errors
- [ ] Frontend starts on port 8000 without errors
- [ ] Frontend can fetch data from backend API
- [ ] No port conflicts between components
- [ ] SQLite database file is created and accessible

## 🎯 Quick Start Commands

```bash
# Terminal 1: Start backend
cd backend && ./start-sqlite.sh

# Terminal 2: Start frontend  
./start-frontend.sh

# Then visit: http://localhost:8000
```

Your PS5 Games application is now properly configured with separate ports! 🎮