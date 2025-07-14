const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('./src/utils/logger');
require('dotenv').config();

class DatabaseGamesChecker {
  constructor() {
    this.igdbBaseUrl = 'https://api.igdb.com/v4';
    this.clientId = process.env.IGDB_CLIENT_ID;
    this.clientSecret = process.env.IGDB_CLIENT_SECRET;
    this.accessToken = null;
    this.dbPath = path.join(__dirname, 'data', 'ps5_games.db');
  }

  async getAccessToken() {
    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        }
      });

      this.accessToken = response.data.access_token;
      logger.info('IGDB access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get IGDB access token:', error.message);
      throw new Error('Failed to authenticate with IGDB API');
    }
  }

  async getGamesFromDatabase() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      const query = `
        SELECT title, igdb_id, cover_image_id, artwork_image_id, release_date 
        FROM games 
        ORDER BY release_date DESC 
        LIMIT 20
      `;
      
      db.all(query, [], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async checkGamesInIGDB(games) {
    try {
      const token = await this.getAccessToken();
      
      logger.info(`\n=== Checking ${games.length} Database Games in IGDB ===`);
      
      let gamesWithImagesInIGDB = 0;
      let gamesWithoutImagesInIGDB = 0;
      
      for (const game of games) {
        logger.info(`\nChecking: ${game.title} (IGDB ID: ${game.igdb_id})`);
        logger.info(`  Database has cover_image_id: ${game.cover_image_id || 'NULL'}`);
        logger.info(`  Database has artwork_image_id: ${game.artwork_image_id || 'NULL'}`);
        
        // Check if this game has images in IGDB
        const igdbResponse = await axios.post(`${this.igdbBaseUrl}/games`, 
          `fields name,cover,artworks; where id = ${game.igdb_id};`,
          {
            headers: {
              'Client-ID': this.clientId,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'text/plain'
            }
          }
        );

        if (igdbResponse.data && igdbResponse.data.length > 0) {
          const igdbGame = igdbResponse.data[0];
          const hasCover = igdbGame.cover;
          const hasArtworks = igdbGame.artworks && igdbGame.artworks.length > 0;
          
          logger.info(`  IGDB has cover: ${hasCover ? 'Yes' : 'No'}`);
          logger.info(`  IGDB has artworks: ${hasArtworks ? 'Yes' : 'No'}`);
          
          if (hasCover || hasArtworks) {
            gamesWithImagesInIGDB++;
            logger.info(`  ✓ Game has images in IGDB`);
            
            // If IGDB has images but our database doesn't, this is a problem
            if (!game.cover_image_id && !game.artwork_image_id) {
              logger.info(`  ⚠️  PROBLEM: IGDB has images but database doesn't!`);
            }
          } else {
            gamesWithoutImagesInIGDB++;
            logger.info(`  ✗ Game has no images in IGDB`);
          }
        } else {
          gamesWithoutImagesInIGDB++;
          logger.info(`  ✗ Game not found in IGDB`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      logger.info(`\n=== SUMMARY ===`);
      logger.info(`Games with images in IGDB: ${gamesWithImagesInIGDB}`);
      logger.info(`Games without images in IGDB: ${gamesWithoutImagesInIGDB}`);
      logger.info(`Total games checked: ${games.length}`);
      
      return { gamesWithImagesInIGDB, gamesWithoutImagesInIGDB };
      
    } catch (error) {
      logger.error('Error checking games in IGDB:', error.message);
      throw error;
    }
  }

  async run() {
    try {
      logger.info('=== Database Games IGDB Check ===');
      
      // Get games from database
      const games = await this.getGamesFromDatabase();
      logger.info(`Found ${games.length} games in database`);
      
      // Check each game in IGDB
      await this.checkGamesInIGDB(games);
      
    } catch (error) {
      logger.error('Error in database games check:', error.message);
      throw error;
    }
  }
}

// Run the check
async function main() {
  const checker = new DatabaseGamesChecker();
  await checker.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseGamesChecker; 