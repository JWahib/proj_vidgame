const dataScrapingService = require('./src/services/dataScrapingService');
const logger = require('./src/utils/logger');

async function testCoverImages() {
  try {
    logger.info('=== Testing IGDB Cover Images ===');
    
    // Test 1: Get a few popular PS5 games that should have covers
    logger.info('\n1. Testing popular PS5 games with covers...');
    
    const token = await dataScrapingService.getAccessToken();
    const platformId = await dataScrapingService.getPlayStation5PlatformId(token);
    
    // Query for popular games with covers
    const axios = require('axios');
    const response = await axios.post('https://api.igdb.com/v4/games', 
      `fields name,first_release_date,cover,rating,rating_count; 
       where platforms = ${platformId} & cover != null & cover.image_id != null & rating_count > 100; 
       sort rating desc; 
       limit 100;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`Found ${response.data.length} popular games with covers`);
    
    response.data.forEach((game, index) => {
      logger.info(`${index + 1}. ${game.name}`);
      logger.info(`   Cover ID: ${game.cover}`);
      logger.info(`   Rating: ${game.rating}/100 (${game.rating_count} votes)`);
      logger.info(`   Release Date: ${game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : 'Unknown'}`);
      logger.info('');
    });
    
    // Test 2: Check what percentage of PS5 games have covers
    logger.info('\n2. Checking cover image availability...');
    
    const totalResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields name,cover; 
       where platforms = ${platformId} & name != null; 
       limit 500;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    const gamesWithCovers = totalResponse.data.filter(game => game.cover);
    const gamesWithoutCovers = totalResponse.data.filter(game => !game.cover);
    
    logger.info(`Total PS5 games sampled: ${totalResponse.data.length}`);
    logger.info(`Games WITH covers: ${gamesWithCovers.length} (${Math.round(gamesWithCovers.length / totalResponse.data.length * 100)}%)`);
    logger.info(`Games WITHOUT covers: ${gamesWithoutCovers.length} (${Math.round(gamesWithoutCovers.length / totalResponse.data.length * 100)}%)`);
    
    // Test 3: Check if our current query is working
    logger.info('\n3. Testing our current query format...');
    
    const currentQueryResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields name,first_release_date,genres.name,cover,rating,rating_count,summary,platforms.name,involved_companies; 
       where platforms = ${platformId} & first_release_date != null & name != null; 
       sort first_release_date desc; 
       limit 10;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`Current query returned ${currentQueryResponse.data.length} games`);
    const currentWithCovers = currentQueryResponse.data.filter(game => game.cover);
    logger.info(`Games with covers in current query: ${currentWithCovers.length}`);
    
    if (currentWithCovers.length > 0) {
      logger.info('Sample games with covers from current query:');
      currentWithCovers.slice(0, 3).forEach((game, index) => {
        logger.info(`${index + 1}. ${game.name} - Cover ID: ${game.cover}`);
      });
    }
    
    logger.info('\n=== Cover Image Test Completed ===');
    
  } catch (error) {
    logger.error('Error testing cover images:', error);
    console.error('Full error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCoverImages();
}

module.exports = testCoverImages; 