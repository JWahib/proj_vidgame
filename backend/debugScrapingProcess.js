const axios = require('axios');
const logger = require('./src/utils/logger');
require('dotenv').config();

class ScrapingProcessDebugger {
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

  async debugScrapingProcess() {
    try {
      logger.info('=== Starting Scraping Process Debug ===');
      
      const token = await this.getAccessToken();
      const platformId = await this.getPlayStation5PlatformId(token);
      
      if (!platformId) {
        logger.error('Could not find PlayStation 5 platform ID');
        return;
      }

      logger.info(`Found PlayStation 5 platform ID: ${platformId}`);

      // Step 1: Fetch a small batch of games (like our scraping service does)
      logger.info('\n=== STEP 1: Fetching Games ===');
      const gamesResponse = await axios.post(`${this.igdbBaseUrl}/games`, 
        `fields name,first_release_date,artworks,cover,rating,rating_count,summary; 
         where platforms = ${platformId} & first_release_date != null & name != null; 
         sort first_release_date desc; 
         limit 10;`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      logger.info(`Fetched ${gamesResponse.data.length} games`);
      
      // Log raw game data
      logger.info('\n=== RAW GAME DATA ===');
      gamesResponse.data.forEach((game, index) => {
        logger.info(`${index + 1}. ${game.name}`);
        logger.info(`   Cover: ${game.cover || 'null'}`);
        logger.info(`   Artworks: ${game.artworks ? game.artworks.length : 0} (${game.artworks ? game.artworks.join(',') : 'none'})`);
      });

      // Step 2: Collect all cover IDs
      logger.info('\n=== STEP 2: Collecting Cover IDs ===');
      const allCoverIds = new Set();
      gamesResponse.data.forEach(game => {
        if (game.cover) {
          allCoverIds.add(game.cover);
        }
      });
      
      logger.info(`Found ${allCoverIds.size} unique cover IDs: ${Array.from(allCoverIds).join(', ')}`);

      // Step 3: Collect all artwork IDs
      logger.info('\n=== STEP 3: Collecting Artwork IDs ===');
      const allArtworkIds = new Set();
      gamesResponse.data.forEach(game => {
        if (game.artworks && game.artworks.length > 0) {
          game.artworks.forEach(id => allArtworkIds.add(id));
        }
      });
      
      logger.info(`Found ${allArtworkIds.size} unique artwork IDs: ${Array.from(allArtworkIds).join(', ')}`);

      // Step 4: Fetch cover image IDs
      logger.info('\n=== STEP 4: Fetching Cover Image IDs ===');
      let coverImageIds = {};
      if (allCoverIds.size > 0) {
        const coversResponse = await axios.post(`${this.igdbBaseUrl}/covers`, 
          `fields image_id; where id = (${Array.from(allCoverIds).join(',')});`,
          {
            headers: {
              'Client-ID': this.clientId,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'text/plain'
            }
          }
        );

        logger.info(`Covers API response:`, JSON.stringify(coversResponse.data, null, 2));

        if (coversResponse.data && coversResponse.data.length > 0) {
          coversResponse.data.forEach(cover => {
            coverImageIds[cover.id] = cover.image_id;
          });
        }
        
        logger.info(`Cover image ID mapping:`, coverImageIds);
      }

      // Step 5: Fetch artwork image IDs
      logger.info('\n=== STEP 5: Fetching Artwork Image IDs ===');
      let artworkImageIds = {};
      if (allArtworkIds.size > 0) {
        const artworksResponse = await axios.post(`${this.igdbBaseUrl}/artworks`, 
          `fields image_id; where id = (${Array.from(allArtworkIds).join(',')});`,
          {
            headers: {
              'Client-ID': this.clientId,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'text/plain'
            }
          }
        );

        logger.info(`Artworks API response:`, JSON.stringify(artworksResponse.data, null, 2));

        if (artworksResponse.data && artworksResponse.data.length > 0) {
          artworksResponse.data.forEach(artwork => {
            artworkImageIds[artwork.id] = artwork.image_id;
          });
        }
        
        logger.info(`Artwork image ID mapping:`, artworkImageIds);
      }

      // Step 6: Process each game (simulate our transformation logic)
      logger.info('\n=== STEP 6: Processing Games ===');
      const processedGames = [];
      
      for (const igdbGame of gamesResponse.data) {
        logger.info(`\nProcessing: ${igdbGame.name}`);
        logger.info(`  Original cover: ${igdbGame.cover}`);
        logger.info(`  Original artworks: ${igdbGame.artworks ? igdbGame.artworks.join(',') : 'none'}`);
        
        // Assign artwork_image_id (prefer first artwork, fallback to cover)
        let artworkImageId = null;
        if (igdbGame.artworks && igdbGame.artworks.length > 0 && artworkImageIds[String(igdbGame.artworks[0])]) {
          artworkImageId = artworkImageIds[String(igdbGame.artworks[0])];
          logger.info(`  ✓ Using artwork image ID: ${artworkImageId} (from artwork ${igdbGame.artworks[0]})`);
        } else if (igdbGame.cover && coverImageIds[String(igdbGame.cover)]) {
          artworkImageId = coverImageIds[String(igdbGame.cover)];
          logger.info(`  ✓ Using cover as artwork image ID: ${artworkImageId} (from cover ${igdbGame.cover})`);
        } else {
          logger.info(`  ✗ No artwork image ID available`);
        }

        // Assign cover_image_id (always from cover, if available)
        let coverImageId = null;
        if (igdbGame.cover && coverImageIds[String(igdbGame.cover)]) {
          coverImageId = coverImageIds[String(igdbGame.cover)];
          logger.info(`  ✓ Using cover image ID: ${coverImageId} (from cover ${igdbGame.cover})`);
        } else {
          logger.info(`  ✗ No cover image ID available`);
        }

        const processedGame = {
          title: igdbGame.name,
          igdbId: igdbGame.id,
          coverImageId: coverImageId,
          artworkImageId: artworkImageId,
          releaseDate: igdbGame.first_release_date ? new Date(igdbGame.first_release_date * 1000).toISOString().split('T')[0] : null
        };

        processedGames.push(processedGame);
        logger.info(`  Final result: cover=${coverImageId}, artwork=${artworkImageId}`);
      }

      // Step 7: Summary
      logger.info('\n=== STEP 7: Processing Summary ===');
      const gamesWithCoverImages = processedGames.filter(g => g.coverImageId);
      const gamesWithArtworkImages = processedGames.filter(g => g.artworkImageId);
      const gamesWithAnyImages = processedGames.filter(g => g.coverImageId || g.artworkImageId);
      
      logger.info(`Total games processed: ${processedGames.length}`);
      logger.info(`Games with cover images: ${gamesWithCoverImages.length}`);
      logger.info(`Games with artwork images: ${gamesWithArtworkImages.length}`);
      logger.info(`Games with any images: ${gamesWithAnyImages.length}`);

      logger.info('\n=== PROCESSING COMPLETE ===');

    } catch (error) {
      logger.error('Error in scraping process debug:', error.message);
      throw error;
    }
  }
}

// Run the debug
async function main() {
  const processDebugger = new ScrapingProcessDebugger();
  await processDebugger.debugScrapingProcess();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ScrapingProcessDebugger; 