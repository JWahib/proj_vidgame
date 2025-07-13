const { connectToDatabase } = require('../config/database');
const Game = require('../models/Game');
const dataScrapingService = require('../services/dataScrapingService');
const logger = require('../utils/logger');

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');
    
    // Connect to database
    await connectToDatabase();
    logger.info('Connected to database');
    
    // Ensure table exists
    await Game.createTable();
    
    // Clear existing data
    await Game.deleteAll();
    logger.info('Cleared existing data');
    
    // Scrape PS5 games
    let games;
    try {
      games = await dataScrapingService.scrapePS5Games();
    } catch (error) {
      logger.warn('Failed to scrape from Wikipedia, using mock data:', error.message);
      games = await dataScrapingService.getMockPS5Games();
    }
    
    if (games.length === 0) {
      logger.error('No games found to seed');
      process.exit(1);
    }
    
    // Insert games
    const insertedCount = await Game.bulkInsert(games);
    logger.info(`Successfully seeded database with ${insertedCount} games`);
    
    // Show some stats
    const totalCount = await Game.getCount();
    logger.info(`Total games in database: ${totalCount}`);
    
    logger.info('Database seeding completed successfully');
    process.exit(0);
    
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();