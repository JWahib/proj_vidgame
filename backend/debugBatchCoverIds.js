const axios = require('axios');
const logger = require('./src/utils/logger');
require('dotenv').config();

class BatchCoverIdsDebugger {
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

  async debugBatchCoverIds() {
    try {
      const token = await this.getAccessToken();
      
      logger.info('Fetching PS5 games with release date sorting...');
      
      const response = await axios.post(`${this.igdbBaseUrl}/games`, 
        `fields name,cover,artworks,first_release_date; 
         where platforms = 167 & first_release_date != null & name != null; 
         sort first_release_date desc; 
         limit 50; 
         offset 0;`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      logger.info(`Found ${response.data.length} games in batch`);
      
      // Collect all cover IDs
      const coverIds = new Set();
      const gamesWithCovers = [];
      
      response.data.forEach(game => {
        if (game.cover) {
          coverIds.add(game.cover);
          gamesWithCovers.push({
            name: game.name,
            cover: game.cover,
            releaseDate: game.first_release_date
          });
        }
      });
      
      logger.info(`Games with covers: ${gamesWithCovers.length}`);
      logger.info(`Unique cover IDs: ${coverIds.size}`);
      logger.info(`Cover IDs: ${Array.from(coverIds).join(', ')}`);
      
      // Check if Frog Jumper's cover ID is included
      if (coverIds.has(391340)) {
        logger.info('✅ Frog Jumper cover ID (391340) is in the batch!');
      } else {
        logger.info('❌ Frog Jumper cover ID (391340) is NOT in the batch');
      }
      
      // Show some sample games with covers
      logger.info('\nSample games with covers:');
      gamesWithCovers.slice(0, 10).forEach(game => {
        const date = new Date(game.releaseDate * 1000);
        logger.info(`- ${game.name} (Cover: ${game.cover}, Release: ${date.toISOString().split('T')[0]})`);
      });
      
    } catch (error) {
      logger.error('Error debugging batch cover IDs:', error.message);
    }
  }
}

// Run the debug
async function main() {
  const batchDebugger = new BatchCoverIdsDebugger();
  await batchDebugger.debugBatchCoverIds();
}

main(); 