const { connectToDatabase } = require('../config/database');
const Game = require('../models/Game');
const logger = require('../utils/logger');

async function setupDatabase() {
  try {
    logger.info('Setting up database...');
    
    // Connect to database
    await connectToDatabase();
    logger.info('Connected to database');
    
    // Create tables
    await Game.createTable();
    logger.info('Database tables created successfully');
    
    logger.info('Database setup completed successfully');
    process.exit(0);
    
  } catch (error) {
    logger.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();