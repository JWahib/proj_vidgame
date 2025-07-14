const thumbnailService = require('./src/services/thumbnailService');
const Game = require('./src/models/Game');
const logger = require('./src/utils/logger');

async function testThumbnails() {
  try {
    logger.info('=== Testing Updated Thumbnail Service ===');
    
    // Get a few games from the database
    const games = await Game.getAll();
    logger.info(`Found ${games.length} games in database`);
    
    if (games.length === 0) {
      logger.info('No games found. Please run: npm run populate:db');
      return;
    }

    // Filter games that have cover_image_id
    const gamesWithImage = games.filter((game) => {
      return game.cover_image_id && game.cover_image_id.trim() !== '';
    });
    
    logger.info(`Found ${gamesWithImage.length} games with cover images`);
    
    if (gamesWithImage.length === 0) {
      logger.info('No games with cover images found. Please run: npm run populate:db');
      return;
    }
    
    // Test with first 3 games that have images
    const testGames = gamesWithImage.slice(0, 3);
    
    for (const game of testGames) {
      logger.info(`\n--- Testing: ${game.title} (${game.publisher}) ---`);
      
      // Check if we have cover_image_id
      if (game.cover_image_id) {
        logger.info(`✓ Has cover_image_id: ${game.cover_image_id}`);
      } else {
        logger.info(`✗ No cover_image_id found`);
      }
      
      // Test thumbnail service
      const thumbnailData = await thumbnailService.getThumbnailUrl(game.title, game.publisher);
      
      if (thumbnailData) {
        logger.info(`✓ Thumbnail found (source: ${thumbnailData.source})`);
        logger.info(`  Thumbnail URL: ${thumbnailData.thumbnail}`);
        logger.info(`  Cover URL: ${thumbnailData.cover}`);
        logger.info(`  IGDB ID: ${thumbnailData.igdbId}`);
      } else {
        logger.info(`✗ No thumbnail found`);
      }
      
      // Test multiple image sizes
      const imageData = await thumbnailService.getGameImages(game.title, game.publisher);
      
      if (imageData) {
        logger.info(`✓ Multiple image sizes available:`);
        Object.entries(imageData.images).forEach(([size, url]) => {
          logger.info(`  ${size}: ${url}`);
        });
      } else {
        logger.info(`✗ No multiple image sizes available`);
      }
    }
    
    logger.info('\n=== Thumbnail Test Completed ===');
    
  } catch (error) {
    logger.error('Error during thumbnail test:', error);
    console.error('Full error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testThumbnails();
}

module.exports = testThumbnails; 