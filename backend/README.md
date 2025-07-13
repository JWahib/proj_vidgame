# PS5 Games Backend API

This is the backend API for the PS5 Video Game Search Engine project. It provides endpoints for searching and managing PS5 game data.

## Features

- **Database Management**: SQL Server database with optimized queries
- **Data Scraping**: Automatically scrapes PS5 game data from Wikipedia
- **Fast Search**: Optimized search functionality with filters
- **RESTful API**: Clean, well-documented API endpoints
- **Security**: Rate limiting, input validation, and security headers
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Robust error handling middleware

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQL Server** - Database
- **Docker** - Database containerization
- **Winston** - Logging
- **Axios & Cheerio** - Web scraping
- **Joi** - Input validation
- **Helmet** - Security headers

## Prerequisites

- Node.js 16+ 
- Docker and Docker Compose
- SQL Server (via Docker)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ps5-games-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start SQL Server using Docker**
   ```bash
   docker-compose up -d
   ```

5. **Set up the database**
   ```bash
   npm run db:setup
   ```

6. **Seed the database with PS5 games**
   ```bash
   npm run db:seed
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Games
- `GET /api/games` - Get all games
- `GET /api/games/search?q=<query>&genre=<genre>&rating=<rating>&publisher=<publisher>` - Search games
- `GET /api/games/stats` - Get database statistics
- `POST /api/games/refreshDB` - Refresh database with latest PS5 games
- `GET /api/games/:title/:publisher` - Get specific game

### Example Requests

**Search for games:**
```bash
curl "http://localhost:3000/api/games/search?q=spider&genre=action"
```

**Refresh database:**
```bash
curl -X POST "http://localhost:3000/api/games/refreshDB"
```

**Get all games:**
```bash
curl "http://localhost:3000/api/games"
```

## Database Schema

The `games` table has the following structure:

```sql
CREATE TABLE games (
  title NVARCHAR(255) NOT NULL,
  publisher NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  rating NVARCHAR(50),
  release_date DATE,
  genre NVARCHAR(500),
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE(),
  PRIMARY KEY (title, publisher)
);
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error handler
│   │   └── validation.js        # Input validation
│   ├── models/
│   │   └── Game.js              # Game model with database operations
│   ├── routes/
│   │   └── gameRoutes.js        # Game-related API routes
│   ├── scripts/
│   │   ├── setupDatabase.js     # Database setup script
│   │   └── seedDatabase.js      # Database seeding script
│   ├── services/
│   │   └── dataScrapingService.js # Web scraping service
│   ├── utils/
│   │   └── logger.js            # Logging configuration
│   └── app.js                   # Main application file
├── logs/                        # Log files
├── .env                         # Environment variables
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── docker-compose.yml           # Docker Compose for SQL Server
├── package.json                 # Project dependencies and scripts
└── README.md                    # This file
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run db:setup` - Set up the database tables
- `npm run db:seed` - Seed the database with PS5 games data

## Configuration

Environment variables in `.env`:

```bash
# Database Configuration
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=ps5_games_db
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd

# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=100
```

## Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console - Development mode

## Security Features

- Rate limiting (100 requests per 15 minutes by default)
- Input validation using Joi
- Security headers via Helmet
- SQL injection protection via parameterized queries
- CORS enabled for cross-origin requests

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (development only)"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.