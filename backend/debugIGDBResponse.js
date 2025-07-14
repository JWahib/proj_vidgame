const dataScrapingService = require('./src/services/dataScrapingService');
const logger = require('./src/utils/logger');

async function debugIGDBResponse() {
  try {
    logger.info('=== Debugging IGDB API Response Structure ===');
    
    const token = await dataScrapingService.getAccessToken();
    const platformId = await dataScrapingService.getPlayStation5PlatformId(token);
    
    const axios = require('axios');
    
    // Get a few games and examine their raw structure
    const response = await axios.post('https://api.igdb.com/v4/games', 
      `fields name,cover,first_release_date; 
       where platforms = ${platformId} & cover != null; 
       limit 5;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`Found ${response.data.length} games with covers`);
    
    response.data.forEach((game, index) => {
      logger.info(`\n--- Game ${index + 1}: ${game.name} ---`);
      logger.info('Raw game object:');
      console.log(JSON.stringify(game, null, 2));
      
      if (game.cover) {
        logger.info('\nCover object structure:');
        console.log(JSON.stringify(game.cover, null, 2));
        
        // Check all possible cover properties
        logger.info('\nCover properties:');
        Object.keys(game.cover).forEach(key => {
          logger.info(`  ${key}: ${game.cover[key]}`);
        });
      } else {
        logger.info('No cover object found');
      }
    });
    
    logger.info('\n=== IGDB Response Debug Completed ===');
    
  } catch (error) {
    logger.error('Error debugging IGDB response:', error);
    console.error('Full error:', error);
  }
}

// Run the debug if this file is executed directly
if (require.main === module) {
  debugIGDBResponse();
}

module.exports = debugIGDBResponse; 