const fs = require('fs');
const path = require('path');
const { connectToDatabase, runQuery } = require('./src/config/database');
const logger = require('./src/utils/logger');

async function recreateDatabase() {
  try {
    logger.info('=== Recreating Database with New Schema ===');
    
    const dbPath = path.join(__dirname, 'data/ps5_games.db');
    
    // Check if database file exists
    if (fs.existsSync(dbPath)) {
      logger.info('Backing up existing database...');
      const backupPath = dbPath + '.backup.' + Date.now();
      fs.copyFileSync(dbPath, backupPath);
      logger.info(`Database backed up to: ${backupPath}`);
      
      // Remove existing database
      fs.unlinkSync(dbPath);
      logger.info('Existing database removed');
    }
    
    // Create new database connection
    await connectToDatabase();
    logger.info('New database connection established');
    
    // Create the new games table with updated schema
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS games (
        title TEXT NOT NULL,
        publisher TEXT NOT NULL,
        description TEXT,
        rating TEXT,
        release_date DATE,
        genre TEXT,
        igdb_id INTEGER,
        cover_image_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (title, publisher)
      )
    `;
    
    await runQuery(createTableQuery);
    logger.info('New games table created with updated schema');
    
    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_games_title ON games(title)',
      'CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre)',
      'CREATE INDEX IF NOT EXISTS idx_games_release_date ON games(release_date)',
      'CREATE INDEX IF NOT EXISTS idx_games_igdb_id ON games(igdb_id)',
      'CREATE INDEX IF NOT EXISTS idx_games_publisher ON games(publisher)'
    ];
    
    for (const indexQuery of indexes) {
      await runQuery(indexQuery);
    }
    logger.info('Database indexes created');
    
    // Verify the table structure
    const { getAllRows } = require('./src/config/database');
    const tableInfo = await getAllRows("PRAGMA table_info(games)");
    logger.info('New table structure:');
    tableInfo.forEach(column => {
      logger.info(`  ${column.name} (${column.type})${column.notnull ? ' NOT NULL' : ''}${column.pk ? ' PRIMARY KEY' : ''}`);
    });
    
    logger.info('=== Database Recreation Completed Successfully ===');
    logger.info('You can now run: npm run populate:db');
    
  } catch (error) {
    logger.error('Error recreating database:', error);
    console.error('Full error:', error);
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  recreateDatabase();
}

module.exports = recreateDatabase; 