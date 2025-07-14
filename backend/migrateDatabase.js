const Game = require('./src/models/Game');
const logger = require('./src/utils/logger');

async function migrateDatabase() {
  try {
    logger.info('=== Starting Database Migration ===');
    
    // Ensure database table exists
    await Game.createTable();
    logger.info('Database table verified');
    
    // Get current database count
    const currentCount = await Game.getCount();
    logger.info(`Current database contains ${currentCount} games`);
    
    // Add artwork_image_id column if it doesn't exist
    const { getDatabase, runQuery } = require('./src/config/database');
    const db = await getDatabase();
    
    // Check if artwork_image_id column exists
    const tableInfo = await db.all("PRAGMA table_info(games)");
    const hasArtworkColumn = tableInfo && Array.isArray(tableInfo) && tableInfo.some(col => col.name === 'artwork_image_id');
    
    if (!hasArtworkColumn) {
      logger.info('Adding artwork_image_id column...');
      await runQuery('ALTER TABLE games ADD COLUMN artwork_image_id TEXT');
      logger.info('artwork_image_id column added successfully');
    } else {
      logger.info('artwork_image_id column already exists');
    }
    
    // Show sample of current data
    const sampleGames = await Game.getAll();
    if (sampleGames.length > 0) {
      logger.info('\nSample of current games:');
      sampleGames.slice(0, 5).forEach((game, index) => {
        logger.info(`${index + 1}. ${game.title} (${game.publisher})`);
        logger.info(`   IGDB ID: ${game.igdb_id}`);
        logger.info(`   Cover Image ID: ${game.cover_image_id || 'NULL'}`);
        logger.info(`   Artwork Image ID: ${game.artwork_image_id || 'NULL'}`);
      });
    }
    
    logger.info('\n=== Database Migration Completed Successfully ===');
    
  } catch (error) {
    logger.error('Error during database migration:', error);
    console.error('Full error:', error);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = migrateDatabase; 