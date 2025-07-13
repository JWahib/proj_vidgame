const dataScrapingService = require('./src/services/dataScrapingService');
const Game = require('./src/models/Game');
const logger = require('./src/utils/logger');

async function populateDatabase() {
  try {
    logger.info('=== Starting Database Population with IGDB Data ===');
    
    // Ensure database table exists
    await Game.createTable();
    logger.info('Database table verified');
    
    // Get current database count
    const currentCount = await Game.getCount();
    logger.info(`Current database contains ${currentCount} games`);
    
    // Ask user if they want to clear existing data
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const clearExisting = await new Promise((resolve) => {
      rl.question('Do you want to clear existing data? (y/N): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
    
    if (clearExisting) {
      logger.info('Clearing existing data...');
      await Game.deleteAll();
      logger.info('Existing data cleared');
    }
    
    // Fetch PS5 games from IGDB
    logger.info('Fetching PS5 games from IGDB...');
    const games = await dataScrapingService.scrapePS5Games();
    
    if (games.length === 0) {
      logger.error('No games found from IGDB');
      return;
    }
    
    logger.info(`Found ${games.length} PS5 games from IGDB`);
    
    // Insert games into database
    logger.info('Inserting games into database...');
    const insertedCount = await Game.bulkInsert(games);
    
    logger.info(`Successfully inserted ${insertedCount} games into database`);
    
    // Verify the data
    const finalCount = await Game.getCount();
    logger.info(`Database now contains ${finalCount} games`);
    
    // Show sample of inserted data
    const sampleGames = await Game.getAll();
    if (sampleGames.length > 0) {
      logger.info('Sample of inserted games:');
      sampleGames.slice(0, 10).forEach((game, index) => {
        logger.info(`${index + 1}. ${game.title} (${game.publisher}) - ${game.release_date} - IGDB ID: ${game.igdb_id}`);
      });
    }
    
    logger.info('=== Database Population Completed Successfully ===');
    
  } catch (error) {
    logger.error('Error populating database:', error);
    console.error('Full error:', error);
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  populateDatabase();
}

module.exports = populateDatabase; 