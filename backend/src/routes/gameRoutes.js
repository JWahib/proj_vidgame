const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const dataScrapingService = require('../services/dataScrapingService');
const { validateSearch } = require('../middleware/validation');
const logger = require('../utils/logger');

// GET /api/games - Get all games
router.get('/', async (req, res, next) => {
  try {
    const games = await Game.getAll();
    res.json({
      success: true,
      data: games,
      count: games.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/games/search - Search games
router.get('/search', validateSearch, async (req, res, next) => {
  try {
    const { q, genre, rating, publisher } = req.query;
    
    const filters = {};
    if (genre) filters.genre = genre;
    if (rating) filters.rating = rating;
    if (publisher) filters.publisher = publisher;
    
    const games = await Game.search(q, filters);
    
    res.json({
      success: true,
      data: games,
      count: games.length,
      query: q,
      filters: filters
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/games/stats - Get database statistics
router.get('/stats', async (req, res, next) => {
  try {
    const count = await Game.getCount();
    
    res.json({
      success: true,
      data: {
        totalGames: count,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/games/refreshDB - Refresh database with latest PS5 games
router.post('/refreshDB', async (req, res, next) => {
  try {
    logger.info('Starting database refresh...');
    
    // Check if database needs to be set up
    await Game.createTable();
    
    // Scrape PS5 games from Wikipedia
    const games = await dataScrapingService.scrapePS5Games();
    
    if (games.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No games were found to import'
      });
    }
    
    // Clear existing data
    await Game.deleteAll();
    
    // Insert new data
    const insertedCount = await Game.bulkInsert(games);
    
    logger.info(`Database refreshed successfully. Inserted ${insertedCount} games`);
    
    res.json({
      success: true,
      message: 'Database refreshed successfully',
      data: {
        gamesImported: insertedCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error refreshing database:', error);
    next(error);
  }
});

// GET /api/games/:title/:publisher - Get specific game
router.get('/:title/:publisher', async (req, res, next) => {
  try {
    const { title, publisher } = req.params;
    const game = await Game.findByTitleAndPublisher(decodeURIComponent(title), decodeURIComponent(publisher));
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;