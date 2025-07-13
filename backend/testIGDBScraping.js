const dataScrapingService = require('./src/services/dataScrapingService');
const Game = require('./src/models/Game');
const logger = require('./src/utils/logger');

async function testIGDBScraping() {
  try {
    logger.info('=== Testing IGDB Data Scraping Service ===');
    
    // Test 1: Get sample PS5 games
    logger.info('\n1. Testing sample PS5 games fetch...');
    const sampleGames = await dataScrapingService.getSamplePS5Games();
    logger.info(`Found ${sampleGames.length} sample PS5 games`);
    
    if (sampleGames.length > 0) {
      logger.info('Sample games:');
      sampleGames.slice(0, 5).forEach((game, index) => {
        logger.info(`${index + 1}. ${game.title} (${game.publisher}) - ${game.genre}`);
      });
    }
    
    // Test 2: Full PS5 games scraping (limited to avoid rate limits)
    logger.info('\n2. Testing full PS5 games scraping (limited)...');
    const allGames = await dataScrapingService.scrapePS5Games();
    logger.info(`Found ${allGames.length} total PS5 games`);
    
    if (allGames.length > 0) {
      logger.info('First 10 games:');
      allGames.slice(0, 10).forEach((game, index) => {
        logger.info(`${index + 1}. ${game.title} (${game.publisher}) - ${game.releaseDate} - ${game.genre}`);
      });
    }
    
    // Test 3: Database integration
    logger.info('\n3. Testing database integration...');
    
    // Create/update database table
    await Game.createTable();
    
    // Insert sample games into database
    if (sampleGames.length > 0) {
      logger.info(`Inserting ${sampleGames.length} sample games into database...`);
      const insertedCount = await Game.bulkInsert(sampleGames);
      logger.info(`Successfully inserted ${insertedCount} games`);
      
      // Verify data in database
      const dbGames = await Game.getAll();
      logger.info(`Database now contains ${dbGames.length} games`);
      
      if (dbGames.length > 0) {
        logger.info('Database games (first 5):');
        dbGames.slice(0, 5).forEach((game, index) => {
          logger.info(`${index + 1}. ${game.title} (${game.publisher}) - IGDB ID: ${game.igdb_id}`);
        });
      }
    }
    
    logger.info('\n=== IGDB Scraping Test Completed Successfully ===');
    
  } catch (error) {
    logger.error('Error during IGDB scraping test:', error);
    console.error('Full error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testIGDBScraping();
}

module.exports = testIGDBScraping; 