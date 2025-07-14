const dataScrapingService = require('./src/services/dataScrapingService');
const logger = require('./src/utils/logger');

async function testArtworks() {
  try {
    logger.info('=== Testing IGDB Artworks Endpoint ===');
    
    const token = await dataScrapingService.getAccessToken();
    const platformId = await dataScrapingService.getPlayStation5PlatformId(token);
    
    const axios = require('axios');
    
    // Test 1: Get games with artworks
    logger.info('\n1. Testing games with artworks...');
    
    const gamesResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields name,artworks; 
       where platforms = ${platformId} & artworks != null; 
       limit 5;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`Found ${gamesResponse.data.length} games with artworks`);
    
    // Collect artwork IDs
    const artworkIds = new Set();
    gamesResponse.data.forEach(game => {
      if (game.artworks) {
        game.artworks.forEach(id => artworkIds.add(id));
      }
    });
    
    logger.info(`Found ${artworkIds.size} unique artwork IDs`);
    
    // Test 2: Get artwork details
    if (artworkIds.size > 0) {
      logger.info('\n2. Fetching artwork details...');
      
      const artworksResponse = await axios.post('https://api.igdb.com/v4/artworks', 
        `fields image_id,url,width,height,game; 
         where id = (${Array.from(artworkIds).slice(0, 10).join(',')});`,
        {
          headers: {
            'Client-ID': process.env.IGDB_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );
      
      logger.info(`Retrieved ${artworksResponse.data.length} artwork details`);
      
      artworksResponse.data.forEach((artwork, index) => {
        logger.info(`\n--- Artwork ${index + 1} ---`);
        logger.info(`ID: ${artwork.id}`);
        logger.info(`Image ID: ${artwork.image_id}`);
        logger.info(`URL: ${artwork.url}`);
        logger.info(`Dimensions: ${artwork.width}x${artwork.height}`);
        logger.info(`Game ID: ${artwork.game}`);
      });
    }
    
    // Test 3: Compare with covers
    logger.info('\n3. Comparing artworks vs covers...');
    
    const coverResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields name,cover; 
       where platforms = ${platformId} & cover != null; 
       limit 3;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`Found ${coverResponse.data.length} games with covers`);
    
    // Test 4: Get a game with both artworks and covers
    logger.info('\n4. Testing game with both artworks and covers...');
    
    const bothResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields name,artworks,cover; 
       where platforms = ${platformId} & artworks != null & cover != null; 
       limit 3;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`Found ${bothResponse.data.length} games with both artworks and covers`);
    
    bothResponse.data.forEach((game, index) => {
      logger.info(`\n--- Game ${index + 1}: ${game.name} ---`);
      logger.info(`Cover ID: ${game.cover}`);
      logger.info(`Artwork IDs: ${game.artworks ? game.artworks.join(', ') : 'None'}`);
    });
    
    logger.info('\n=== Artworks Test Completed ===');
    
  } catch (error) {
    logger.error('Error testing artworks:', error);
    console.error('Full error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testArtworks();
}

module.exports = testArtworks; 