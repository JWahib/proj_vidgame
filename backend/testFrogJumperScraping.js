const dataScrapingService = require('./src/services/dataScrapingService');
const logger = require('./src/utils/logger');

async function testFrogJumperScraping() {
  try {
    logger.info('=== Testing Frog Jumper Scraping ===');
    
    // Get all games from the scraping service
    const games = await dataScrapingService.scrapePS5Games();
    
    // Find Frog Jumper
    const frogJumper = games.find(game => 
      game.title.toLowerCase().includes('frog') && 
      game.title.toLowerCase().includes('jumper')
    );
    
    if (frogJumper) {
      logger.info('✅ Found Frog Jumper in scraped data:');
      logger.info(`Title: ${frogJumper.title}`);
      logger.info(`Cover Image ID: ${frogJumper.cover_image_id}`);
      logger.info(`Artwork Image ID: ${frogJumper.artwork_image_id}`);
      logger.info(`IGDB ID: ${frogJumper.igdbId}`);
    } else {
      logger.info('❌ Frog Jumper not found in scraped data');
      logger.info(`Total games scraped: ${games.length}`);
      
      // Show some sample games to see what we're getting
      logger.info('Sample games:');
      games.slice(0, 5).forEach(game => {
        logger.info(`- ${game.title} (Rating: ${game.rating || 'N/A'})`);
      });
    }
    
  } catch (error) {
    logger.error('Error testing Frog Jumper scraping:', error.message);
  }
}

testFrogJumperScraping(); 