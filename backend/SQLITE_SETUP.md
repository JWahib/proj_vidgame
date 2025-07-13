# Running PS5 Games Backend with SQLite (No Docker Required)

This guide explains how to run the PS5 Games Backend using SQLite instead of SQL Server, eliminating the need for Docker.

## Prerequisites

- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** - Comes with Node.js

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd backend
./start-sqlite.sh
```

This script will:
1. Install all dependencies
2. Set up the SQLite database
3. Seed it with PS5 games data
4. Start the backend server

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up the database**
   ```bash
   npm run db:setup
   ```

3. **Seed the database**
   ```bash
   npm run db:seed
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Or production mode
   npm start
   ```

## Testing the Backend

Once the backend is running, you can test it with these commands:

```bash
# Health check
curl http://localhost:3000/health

# Get all games
curl http://localhost:3000/api/games

# Search for games
curl "http://localhost:3000/api/games/search?q=spider"

# Get database stats
curl http://localhost:3000/api/games/stats

# Refresh database with latest data
curl -X POST http://localhost:3000/api/games/refreshDB
```

## Key Differences from Docker Setup

### Database Location
- **SQLite**: Database file stored in `backend/data/ps5_games.db`
- **SQL Server**: Required Docker container

### Configuration
- **SQLite**: Uses `DB_PATH` environment variable
- **SQL Server**: Used `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`

### Dependencies
- **SQLite**: Uses `sqlite3` npm package
- **SQL Server**: Used `mssql` npm package

## Project Structure

```
backend/
├── data/
│   └── ps5_games.db          # SQLite database file (auto-created)
├── src/
│   ├── config/
│   │   └── database.js       # SQLite configuration
│   ├── models/
│   │   └── Game.js           # Game model (updated for SQLite)
│   └── ...
├── .env                      # Environment variables (SQLite config)
├── start-sqlite.sh           # Automated setup script
└── SQLITE_SETUP.md          # This file
```

## Environment Variables

The `.env` file contains:

```bash
# Database Configuration (SQLite)
DB_PATH=./data/ps5_games.db

# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

All API endpoints remain the same:

- `GET /health` - Health check
- `GET /api/games` - Get all games
- `GET /api/games/search` - Search games with filters
- `GET /api/games/stats` - Get database statistics
- `POST /api/games/refreshDB` - Refresh database
- `GET /api/games/:title/:publisher` - Get specific game

## Troubleshooting

### Common Issues

1. **"sqlite3 module not found"**
   ```bash
   npm install sqlite3
   ```

2. **Permission denied for start-sqlite.sh**
   ```bash
   chmod +x start-sqlite.sh
   ```

3. **Port 3000 already in use**
   - Change `PORT=3000` in `.env` to another port
   - Or kill the process using port 3000

4. **Database file not found**
   - The database file is created automatically
   - Ensure the `data/` directory is writable

### Database Management

**View database contents:**
```bash
# Install sqlite3 command line tool (optional)
sudo apt-get install sqlite3  # On Ubuntu/Debian

# View tables
sqlite3 data/ps5_games.db ".tables"

# View games
sqlite3 data/ps5_games.db "SELECT * FROM games LIMIT 10;"
```

**Reset database:**
```bash
# Delete database file
rm data/ps5_games.db

# Recreate and seed
npm run db:setup
npm run db:seed
```

## Performance Notes

- SQLite performs well for this use case (read-heavy operations)
- Database file size is typically small (few MB)
- No network overhead compared to SQL Server
- Suitable for development and small to medium production deployments

## Migration from Docker Setup

If you previously used the Docker setup:

1. Stop the Docker containers:
   ```bash
   docker-compose down
   ```

2. Follow the SQLite setup instructions above

3. Your API endpoints and responses remain exactly the same

## Next Steps

1. Test all API endpoints
2. Integrate with your frontend application
3. Customize the game scraping logic if needed
4. Add authentication if required for production

The backend is now ready to run without Docker! 🎮