const axios = require('axios');
const logger = require('./src/utils/logger');
require('dotenv').config();

class ImageAnalysisDebugger {
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
      throw new Error('Failed to authenticate with IGDB API');
    }
  }

  async getPlayStation5PlatformId(token) {
    try {
      const response = await axios.post(`${this.igdbBaseUrl}/platforms`, 
        'fields id,name; where name = "PlayStation 5"; limit 1;',
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      if (response.data && response.data.length > 0) {
        return response.data[0].id;
      }
      return null;
    } catch (error) {
      logger.error('Error getting PlayStation 5 platform ID:', error.message);
      return null;
    }
  }

  async analyzeImageData() {
    try {
      logger.info('=== Starting Image Data Analysis ===');
      
      const token = await this.getAccessToken();
      const platformId = await this.getPlayStation5PlatformId(token);
      
      if (!platformId) {
        logger.error('Could not find PlayStation 5 platform ID');
        return;
      }

      logger.info(`Found PlayStation 5 platform ID: ${platformId}`);

      // Fetch a small sample of PS5 games to analyze
      const response = await axios.post(`${this.igdbBaseUrl}/games`, 
        `fields name,first_release_date,artworks,cover,rating,rating_count,summary; 
         where platforms = ${platformId} & first_release_date != null & name != null; 
         sort first_release_date desc; 
         limit 20;`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      logger.info(`Fetched ${response.data.length} games for analysis`);

      // Analyze each game's image data
      let gamesWithArtworks = 0;
      let gamesWithCovers = 0;
      let gamesWithBoth = 0;
      let gamesWithNeither = 0;

      const gamesWithImages = [];
      const gamesWithoutImages = [];

      for (const game of response.data) {
        const hasArtworks = game.artworks && game.artworks.length > 0;
        const hasCover = game.cover;
        
        if (hasArtworks) gamesWithArtworks++;
        if (hasCover) gamesWithCovers++;
        if (hasArtworks && hasCover) gamesWithBoth++;
        if (!hasArtworks && !hasCover) gamesWithNeither++;

        if (hasArtworks || hasCover) {
          gamesWithImages.push({
            name: game.name,
            artworks: game.artworks,
            cover: game.cover,
            releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null
          });
        } else {
          gamesWithoutImages.push({
            name: game.name,
            releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null
          });
        }
      }

      // Print analysis results
      logger.info('\n=== IMAGE ANALYSIS RESULTS ===');
      logger.info(`Total games analyzed: ${response.data.length}`);
      logger.info(`Games with artworks: ${gamesWithArtworks}`);
      logger.info(`Games with covers: ${gamesWithCovers}`);
      logger.info(`Games with both: ${gamesWithBoth}`);
      logger.info(`Games with neither: ${gamesWithNeither}`);
      logger.info(`Games with any images: ${gamesWithImages.length}`);
      logger.info(`Games without any images: ${gamesWithoutImages.length}`);

      // Show sample games with images
      logger.info('\n=== SAMPLE GAMES WITH IMAGES ===');
      gamesWithImages.slice(0, 5).forEach((game, index) => {
        logger.info(`${index + 1}. ${game.name} (${game.releaseDate})`);
        logger.info(`   Artworks: ${game.artworks ? game.artworks.length : 0}`);
        logger.info(`   Cover: ${game.cover ? 'Yes' : 'No'}`);
      });

      // Show sample games without images
      logger.info('\n=== SAMPLE GAMES WITHOUT IMAGES ===');
      gamesWithoutImages.slice(0, 5).forEach((game, index) => {
        logger.info(`${index + 1}. ${game.name} (${game.releaseDate})`);
      });

      // Test fetching actual image data for games with covers
      if (gamesWithImages.length > 0) {
        logger.info('\n=== TESTING IMAGE ID FETCHING ===');
        
        const sampleGame = gamesWithImages[0];
        logger.info(`Testing image fetching for: ${sampleGame.name}`);

        if (sampleGame.cover) {
          const coverResponse = await axios.post(`${this.igdbBaseUrl}/covers`, 
            `fields image_id; where id = ${sampleGame.cover};`,
            {
              headers: {
                'Client-ID': this.clientId,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
              }
            }
          );

          logger.info(`Cover response for ${sampleGame.name}:`, JSON.stringify(coverResponse.data, null, 2));
        }

        if (sampleGame.artworks && sampleGame.artworks.length > 0) {
          const artworkResponse = await axios.post(`${this.igdbBaseUrl}/artworks`, 
            `fields image_id; where id = ${sampleGame.artworks[0]};`,
            {
              headers: {
                'Client-ID': this.clientId,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
              }
            }
          );

          logger.info(`Artwork response for ${sampleGame.name}:`, JSON.stringify(artworkResponse.data, null, 2));
        }
      }

      logger.info('\n=== ANALYSIS COMPLETE ===');

    } catch (error) {
      logger.error('Error in image analysis:', error.message);
      throw error;
    }
  }
}

// Run the analysis
async function main() {
  const imageAnalyzer = new ImageAnalysisDebugger();
  await imageAnalyzer.analyzeImageData();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ImageAnalysisDebugger; 