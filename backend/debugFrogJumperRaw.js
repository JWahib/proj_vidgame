const axios = require('axios');
const logger = require('./src/utils/logger');
require('dotenv').config();

class FrogJumperRawDebugger {
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

  async debugFrogJumperRaw() {
    try {
      const token = await this.getAccessToken();
      
      logger.info('Searching for "Frog Jumper" in IGDB...');
      
      // Search for Frog Jumper specifically
      const searchResponse = await axios.post(`${this.igdbBaseUrl}/games`, 
        `search "Frog Jumper"; fields name,cover,artworks,first_release_date,rating,platforms.name; limit 5;`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      if (!searchResponse.data || searchResponse.data.length === 0) {
        logger.warn('No games found for "Frog Jumper"');
        return;
      }

      logger.info(`Found ${searchResponse.data.length} games matching "Frog Jumper"`);
      
      for (const game of searchResponse.data) {
        logger.info(`\n=== Game: ${game.name} (ID: ${game.id}) ===`);
        logger.info(`Raw IGDB Response: ${JSON.stringify(game, null, 2)}`);
        
        if (game.cover) {
          logger.info(`Cover ID: ${game.cover}`);
        }
        
        if (game.artworks && game.artworks.length > 0) {
          logger.info(`Artwork IDs: ${game.artworks.join(', ')}`);
        }
      }
      
    } catch (error) {
      logger.error('Error debugging Frog Jumper raw data:', error.message);
    }
  }
}

// Run the debug
async function main() {
  const rawDebugger = new FrogJumperRawDebugger();
  await rawDebugger.debugFrogJumperRaw();
}

main(); 