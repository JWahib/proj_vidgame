const dataScrapingService = require('./src/services/dataScrapingService');
const Game = require('./src/models/Game');
const logger = require('./src/utils/logger');

async function testIGDBScraping() {
  try {
    logger.info('=== Testing IGDB Data Scraping Service ===');
    
    // 1. Test sample fetch
    logger.info('\n1. Testing sample PS5 games fetch...');
    logger.info('Fetching sample of popular PS5 games...');
    const sampleGames = await dataScrapingService.getSamplePS5Games();
    logger.info(`Found ${sampleGames.length} sample PS5 games`);
    if (sampleGames.length > 0) {
      logger.info('Sample games:');
      sampleGames.slice(0, 5).forEach((game, i) => {
        logger.info(`${i + 1}. ${game.title}`);
        logger.info(`   artworkImageId: ${game.artworkImageId}`);
        logger.info(`   coverImageId: ${game.coverImageId}`);
      });
    }
    
    // 2. Test full scraping (limited)
    logger.info('\n2. Testing full PS5 games scraping (limited)...');
    logger.info('Starting to scrape PS5 games from IGDB...');
    const games = await dataScrapingService.scrapePS5Games();
    logger.info(`Successfully scraped ${games.length} PS5 games from IGDB`);
    if (games.length > 0) {
      logger.info('First 5 games:');
      games.slice(0, 5).forEach((game, i) => {
        logger.info(`${i + 1}. ${game.title}`);
        logger.info(`   artworkImageId: ${game.artworkImageId}`);
        logger.info(`   coverImageId: ${game.coverImageId}`);
      });
    }
    
    logger.info('\n=== IGDB Scraping Test Completed ===');
    
  } catch (error) {
    logger.error('Error testing IGDB scraping:', error);
    console.error('Full error:', error);
  }
}

if (require.main === module) {
  testIGDBScraping();
}

module.exports = testIGDBScraping; 