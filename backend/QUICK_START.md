# Quick Start Guide

## 🚀 Get the Backend Running in 5 Minutes

### Option 1: Automated Setup (Recommended)
```bash
cd backend
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Start Database**
   ```bash
   sudo docker compose up -d
   ```

3. **Wait for Database (15 seconds)**
   ```bash
   sleep 15
   ```

4. **Setup Database**
   ```bash
   npm run db:setup
   ```

5. **Seed with Data**
   ```bash
   npm run db:seed
   ```

6. **Start Server**
   ```bash
   npm run dev
   ```

### Option 3: Mock Data (If Database Issues)
```bash
cd backend
npm install
node src/scripts/testWithMockData.js
```

## 🧪 Test the APIs

```bash
# Health check
curl http://localhost:3000/health

# Refresh database
curl -X POST http://localhost:3000/api/games/refreshDB

# Get all games
curl http://localhost:3000/api/games

# Search for games
curl "http://localhost:3000/api/games/search?q=spider"

# Get stats
curl http://localhost:3000/api/games/stats
```

## 📊 Expected Results

- **Health Check**: `{"status":"OK","timestamp":"...","service":"PS5 Games Backend"}`
- **RefreshDB**: `{"success":true,"message":"Database refreshed successfully","data":{"gamesImported":N}}`
- **Search**: `{"success":true,"data":[...],"count":N}`

## 🔧 Troubleshooting

### Database Connection Issues
- Run: `sudo service docker start`
- Run: `sudo docker compose up -d`
- Wait 30 seconds for SQL Server to initialize

### Permission Issues
- Use `sudo` with Docker commands
- Ensure Docker daemon is running

### Port Issues
- Change PORT in `.env` file
- Ensure port 3000 and 1433 are available

## 📝 Next Steps

1. Test all API endpoints
2. Customize the scraping logic in `src/services/dataScrapingService.js`
3. Add more game metadata fields
4. Implement frontend integration
5. Add authentication and user management

The backend is now ready for development and testing!