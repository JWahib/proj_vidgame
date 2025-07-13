# IGDB Integration for PS5 Games Database

This document explains the new IGDB (Internet Game Database) integration that replaces the Wikipedia scraping functionality.

## Overview

The data scraping service has been updated to use the IGDB API instead of Wikipedia scraping. This provides:

- **More accurate data**: IGDB is a dedicated gaming database with curated information
- **Better structure**: Consistent data format and fields
- **Rich metadata**: Additional information like ratings, descriptions, and cover images
- **Real-time updates**: Access to the latest game information
- **Consistent with thumbnails**: Both data and images come from the same source

## Features

### New Data Fields
- `igdbId`: Unique IGDB identifier for each game
- `coverImageId`: IGDB image ID for cover art
- `description`: Game summary from IGDB
- `rating`: Converted IGDB rating to ESRB-like format
- `releaseDate`: Accurate release dates
- `genre`: Properly categorized genres

### API Endpoints
All existing endpoints remain the same, but now return enhanced data:
- `GET /api/games` - Returns all games with IGDB metadata
- `GET /api/games/search` - Search with enhanced filtering
- `POST /api/games/refreshDB` - Populate database with IGDB data

## Setup

### 1. Environment Variables
Ensure your `.env` file contains IGDB credentials:
```env
IGDB_CLIENT_ID=your_igdb_client_id
IGDB_CLIENT_SECRET=your_igdb_client_secret
```

### 2. Database Schema
The database schema has been updated to include new fields:
- `igdb_id` (INTEGER): IGDB game identifier
- `cover_image_id` (TEXT): IGDB image identifier

## Usage

### Populate Database with IGDB Data
```bash
npm run populate:db
```
This script will:
1. Connect to IGDB API
2. Fetch all PS5 games
3. Transform data to our format
4. Insert into database
5. Optionally clear existing data

### Test IGDB Integration
```bash
npm run test:igdb
```
This script tests:
- IGDB API connectivity
- Data transformation
- Database integration
- Sample data fetching

### API Refresh
Use the existing endpoint to refresh data:
```bash
curl -X POST http://localhost:3001/api/games/refreshDB
```

## Data Quality Improvements

### Before (Wikipedia)
- Inconsistent data format
- Missing or incorrect information
- Limited metadata
- Manual parsing required

### After (IGDB)
- Structured, consistent data
- Verified game information
- Rich metadata (descriptions, ratings, genres)
- Automatic data transformation
- Cover image integration

## Rate Limiting

The service includes built-in rate limiting:
- 100ms delay between API requests
- Token caching (50-day expiry)
- Batch processing for large datasets

## Error Handling

The service includes comprehensive error handling:
- API authentication failures
- Network timeouts
- Data transformation errors
- Database connection issues

## Migration from Wikipedia Data

If you have existing Wikipedia-scraped data:

1. **Backup existing data** (optional)
2. **Run the populate script**: `npm run populate:db`
3. **Choose to clear existing data** when prompted
4. **Verify new data** through the API endpoints

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify IGDB credentials in `.env`
   - Check API quota limits

2. **No Games Found**
   - Check IGDB API status
   - Verify PlayStation 5 platform exists
   - Check network connectivity

3. **Database Errors**
   - Ensure database file is writable
   - Check table schema updates
   - Verify SQLite installation

### Debug Mode
Enable detailed logging by setting:
```env
LOG_LEVEL=debug
```

## API Response Format

Games now include additional fields:
```json
{
  "title": "Spider-Man: Miles Morales",
  "publisher": "Sony Interactive Entertainment",
  "description": "Action-adventure game featuring Miles Morales...",
  "rating": "T",
  "releaseDate": "2020-11-12",
  "genre": "Action, Adventure",
  "igdbId": 123456,
  "coverImageId": "abc123"
}
```

## Future Enhancements

- Automatic thumbnail fetching during data import
- Scheduled data updates
- Enhanced search with IGDB metadata
- Game recommendations based on IGDB data
- Integration with IGDB user ratings and reviews 