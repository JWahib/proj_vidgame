const dataScrapingService = require('./src/services/dataScrapingService');
const logger = require('./src/utils/logger');

async function testScrapingOutput() {
  try {
    logger.info('=== Testing Scraping Service Output ===');
    
    // Get a small sample of games
    const games = await dataScrapingService.scrapePS5Games();
    
    logger.info(`Scraped ${games.length} games total`);
    
    // Check the first 10 games for image IDs
    const sampleGames = games.slice(0, 10);
    
    logger.info('\n=== Sample Games with Image IDs ===');
    let gamesWithImages = 0;
    
    for (const game of sampleGames) {
      const hasCoverImage = game.cover_image_id || game.coverImageId;
      const hasArtworkImage = game.artwork_image_id || game.artworkImageId;
      
      if (hasCoverImage || hasArtworkImage) {
        gamesWithImages++;
        logger.info(`${game.title}:`);
        logger.info(`  cover_image_id: ${game.cover_image_id || 'null'}`);
        logger.info(`  artwork_image_id: ${game.artwork_image_id || 'null'}`);
        logger.info(`  coverImageId: ${game.coverImageId || 'null'}`);
        logger.info(`  artworkImageId: ${game.artworkImageId || 'null'}`);
      }
    }
    
    logger.info(`\nGames with images in sample: ${gamesWithImages}/10`);
    
    // Check all games for image coverage
    const totalWithImages = games.filter(game => 
      game.cover_image_id || game.coverImageId || 
      game.artwork_image_id || game.artworkImageId
    ).length;
    
    logger.info(`Total games with images: ${totalWithImages}/${games.length}`);
    
  } catch (error) {
    logger.error('Error testing scraping output:', error);
  }
}

testScrapingOutput(); 