const { connectToDatabase } = require('../config/database');
const thumbnailService = require('../services/thumbnailService');
const logger = require('../utils/logger');

async function testThumbnails() {
  try {
    logger.info('Starting thumbnail service test...');
    
    // Connect to database
    await connectToDatabase();
    logger.info('Connected to database');
    
    // Test with a specific game
    const testGame = {
      title: "God of War Ragnarök",
      publisher: "Sony Interactive Entertainment"
    };
    
    logger.info(`Testing thumbnail fetch for: ${testGame.title}`);
    
    const thumbnailData = await thumbnailService.getThumbnailUrl(testGame.title, testGame.publisher);
    
    if (thumbnailData) {
      logger.info('✅ Thumbnail fetch successful!');
      logger.info(`Title: ${thumbnailData.name}`);
      logger.info(`Thumbnail: ${thumbnailData.thumbnail}`);
      logger.info(`Cover: ${thumbnailData.cover}`);
      logger.info(`IGDB ID: ${thumbnailData.igdbId}`);
    } else {
      logger.warn('❌ No thumbnail found for test game');
    }
    
    // Test getting all thumbnails (limit to first 3 for testing)
    logger.info('Testing bulk thumbnail fetch...');
    const allThumbnails = await thumbnailService.getAllThumbnails();
    
    logger.info(`Found ${allThumbnails.length} games in database`);
    
    // Show first 3 results
    const sampleResults = allThumbnails.slice(0, 3);
    sampleResults.forEach((item, index) => {
      logger.info(`Game ${index + 1}: ${item.title} (${item.publisher})`);
      if (item.thumbnail) {
        logger.info(`  ✅ Thumbnail: ${item.thumbnail}`);
      } else {
        logger.info(`  ❌ No thumbnail found`);
      }
    });
    
    logger.info('Thumbnail service test completed successfully');
    process.exit(0);
    
  } catch (error) {
    logger.error('Error testing thumbnail service:', error);
    process.exit(1);
  }
}

// Run the test
testThumbnails(); 