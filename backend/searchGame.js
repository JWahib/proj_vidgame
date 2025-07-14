const Game = require('./src/models/Game');
const logger = require('./src/utils/logger');

async function searchGame() {
  try {
    logger.info('=== Searching for Specific Game ===');
    
    const searchTerm = "Terminator: Resistance Enhanced";
    
    // Search for games containing the term
    const games = await Game.search(searchTerm);
    
    logger.info(`Found ${games.length} games matching "${searchTerm}"`);
    
    games.forEach((game, index) => {
      logger.info(`\n--- Game ${index + 1} ---`);
      logger.info(`Title: ${game.title}`);
      logger.info(`Publisher: ${game.publisher}`);
      logger.info(`IGDB ID: ${game.igdb_id}`);
      logger.info(`Cover Image ID: ${game.cover_image_id || 'NULL'}`);
      logger.info(`Release Date: ${game.release_date}`);
      logger.info(`Genre: ${game.genre}`);
    });
    
    // Also check if there are any games with "Terminator" in the title
    const allGames = await Game.getAll();
    const terminatorGames = allGames.filter(game => 
      game.title.toLowerCase().includes('terminator')
    );
    
    if (terminatorGames.length > 0) {
      logger.info(`\n=== All Games with "Terminator" in title ===`);
      terminatorGames.forEach((game, index) => {
        logger.info(`${index + 1}. ${game.title} (${game.publisher})`);
        logger.info(`   IGDB ID: ${game.igdb_id}`);
        logger.info(`   Cover Image ID: ${game.cover_image_id || 'NULL'}`);
      });
    }
    
    logger.info('\n=== Search Completed ===');
    
  } catch (error) {
    logger.error('Error searching for game:', error);
    console.error('Full error:', error);
  }
}

// Run the search if this file is executed directly
if (require.main === module) {
  searchGame();
}

module.exports = searchGame; 