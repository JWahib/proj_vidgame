const axios = require('axios');
const logger = require('./src/utils/logger');
require('dotenv').config();

class FrogJumperTester {
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

  async searchFrogJumper() {
    try {
      const token = await this.getAccessToken();
      
      logger.info('Searching for "Frog Jumper" in IGDB...');
      
      // Search for games with "Frog Jumper" in the name
      const searchResponse = await axios.post(`${this.igdbBaseUrl}/games`, 
        `search "Frog Jumper";
         fields name,id,first_release_date,genres.name,artworks,cover,rating,rating_count,summary,platforms.name;`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      const games = searchResponse.data;
      logger.info(`Found ${games.length} games matching "Frog Jumper"`);

      if (games.length === 0) {
        logger.info('No games found with "Frog Jumper" in the name');
        return;
      }

      // Check each game for images
      for (const game of games) {
        logger.info(`\n=== Game: ${game.name} (ID: ${game.id}) ===`);
        logger.info(`Release Date: ${game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : 'Unknown'}`);
        logger.info(`Rating: ${game.rating || 'N/A'}`);
        logger.info(`Platforms: ${game.platforms ? game.platforms.map(p => p.name).join(', ') : 'N/A'}`);
        
        // Check for cover image
        if (game.cover) {
          logger.info(`✅ Has cover image: ${game.cover}`);
        } else {
          logger.info(`❌ No cover image`);
        }
        
        // Check for artwork images
        if (game.artworks && game.artworks.length > 0) {
          logger.info(`✅ Has ${game.artworks.length} artwork image(s): ${game.artworks.join(', ')}`);
        } else {
          logger.info(`❌ No artwork images`);
        }

        // If we have image IDs, let's get the actual image URLs
        if (game.cover) {
          const coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover}.jpg`;
          logger.info(`Cover URL: ${coverUrl}`);
        }
        
        if (game.artworks && game.artworks.length > 0) {
          const artworkUrl = `https://images.igdb.com/igdb/image/upload/t_artwork_big/${game.artworks[0]}.jpg`;
          logger.info(`Artwork URL: ${artworkUrl}`);
        }
      }

    } catch (error) {
      logger.error('Error searching for Frog Jumper:', error.message);
      if (error.response) {
        logger.error('Response data:', error.response.data);
      }
    }
  }
}

// Run the test
async function main() {
  const tester = new FrogJumperTester();
  await tester.searchFrogJumper();
}

main().catch(console.error); 