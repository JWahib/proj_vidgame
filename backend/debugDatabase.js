const Game = require('./src/models/Game');
const logger = require('./src/utils/logger');

async function debugDatabase() {
  try {
    logger.info('=== Debugging Database Contents ===');
    
    // Get all games
    const games = await Game.getAll();
    logger.info(`Total games in database: ${games.length}`);
    
    if (games.length === 0) {
      logger.info('No games found in database');
      return;
    }
    
    // Check how many have cover_image_id
    const gamesWithCover = games.filter(game => game.cover_image_id && game.cover_image_id.trim() !== '');
    const gamesWithoutCover = games.filter(game => !game.cover_image_id || game.cover_image_id.trim() === '');
    
    logger.info(`Games WITH cover_image_id: ${gamesWithCover.length}`);
    logger.info(`Games WITHOUT cover_image_id: ${gamesWithoutCover.length}`);
    
    // Show sample of games with covers
    if (gamesWithCover.length > 0) {
      logger.info('\n=== Sample Games WITH Cover Images ===');
      gamesWithCover.slice(0, 5).forEach((game, index) => {
        logger.info(`${index + 1}. ${game.title} (${game.publisher})`);
        logger.info(`   IGDB ID: ${game.igdb_id}`);
        logger.info(`   Cover Image ID: ${game.cover_image_id}`);
        logger.info(`   Release Date: ${game.release_date}`);
        logger.info('');
      });
    }
    
    // Show sample of games without covers
    if (gamesWithoutCover.length > 0) {
      logger.info('\n=== Sample Games WITHOUT Cover Images ===');
      gamesWithoutCover.slice(0, 5).forEach((game, index) => {
        logger.info(`${index + 1}. ${game.title} (${game.publisher})`);
        logger.info(`   IGDB ID: ${game.igdb_id}`);
        logger.info(`   Cover Image ID: ${game.cover_image_id || 'NULL'}`);
        logger.info(`   Release Date: ${game.release_date}`);
        logger.info('');
      });
    }
    
    // Check if any games have IGDB IDs but no cover images
    const gamesWithIGDBButNoCover = games.filter(game => 
      game.igdb_id && (!game.cover_image_id || game.cover_image_id.trim() === '')
    );
    
    if (gamesWithIGDBButNoCover.length > 0) {
      logger.info(`\nGames with IGDB ID but no cover: ${gamesWithIGDBButNoCover.length}`);
      logger.info('This suggests the IGDB API call worked but cover data was missing');
    }
    
    logger.info('\n=== Database Debug Completed ===');
    
  } catch (error) {
    logger.error('Error debugging database:', error);
    console.error('Full error:', error);
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  debugDatabase();
}

module.exports = debugDatabase; 