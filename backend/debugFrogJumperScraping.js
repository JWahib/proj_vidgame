const axios = require('axios');
const logger = require('./src/utils/logger');
require('dotenv').config();

class FrogJumperScrapingDebugger {
  constructor() {
    this.igdbBaseUrl = 'https://api.igdb.com/v4';
    this.clientId = process.env.IGDB_CLIENT_ID;
    this.clientSecret = process.env.IGDB_CLIENT_SECRET;
    this.accessToken = null;
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
      throw error;
    }
  }

  async debugFrogJumperScraping() {
    try {
      const token = await this.getAccessToken();
      
      logger.info('=== DEBUGGING FROG JUMPER SCRAPING ===');
      
      // Step 1: Get the specific game data for Frog Jumper
      logger.info('Step 1: Fetching Frog Jumper game data...');
      const gameResponse = await axios.post(`${this.igdbBaseUrl}/games`, 
        `where id = 305406;
         fields name,first_release_date,genres.name,artworks,cover,rating,rating_count,summary,platforms.name,involved_companies;`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      const game = gameResponse.data[0];
      logger.info(`Raw IGDB game data for Frog Jumper:`);
      logger.info(JSON.stringify(game, null, 2));

      // Step 2: Check if we need to fetch artworks and covers separately
      if (game.artworks && game.artworks.length > 0) {
        logger.info('Step 2: Fetching artwork details...');
        const artworkIds = game.artworks.join(',');
        const artworkResponse = await axios.post(`${this.igdbBaseUrl}/artworks`, 
          `where id = (${artworkIds});
           fields id,image_id;`,
          {
            headers: {
              'Client-ID': this.clientId,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'text/plain'
            }
          }
        );
        logger.info('Artwork response:');
        logger.info(JSON.stringify(artworkResponse.data, null, 2));
      }

      if (game.cover) {
        logger.info('Step 3: Fetching cover details...');
        const coverResponse = await axios.post(`${this.igdbBaseUrl}/covers`, 
          `where id = ${game.cover};
           fields id,image_id;`,
          {
            headers: {
              'Client-ID': this.clientId,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'text/plain'
            }
          }
        );
        logger.info('Cover response:');
        logger.info(JSON.stringify(coverResponse.data, null, 2));
      }

      // Step 4: Simulate the transformation process
      logger.info('Step 4: Simulating transformation...');
      
      // This is what the scraping service should be doing
      const transformedGame = {
        title: game.name,
        igdbId: game.id,
        cover_image_id: game.cover ? game.cover.toString() : null,
        artwork_image_id: game.artworks && game.artworks.length > 0 ? game.artworks[0].toString() : null
      };
      
      logger.info('Transformed game data:');
      logger.info(JSON.stringify(transformedGame, null, 2));

    } catch (error) {
      logger.error('Error debugging Frog Jumper scraping:', error.message);
      if (error.response) {
        logger.error('Response data:', error.response.data);
      }
    }
  }
}

// Run the debug
async function main() {
  const scraperDebugger = new FrogJumperScrapingDebugger();
  await scraperDebugger.debugFrogJumperScraping();
}

main().catch(console.error); 