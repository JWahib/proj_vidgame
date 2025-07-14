const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const dataScrapingService = require('../services/dataScrapingService');
const thumbnailService = require('../services/thumbnailService');
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

// GET /api/games/thumbnails - Get thumbnails for all games
router.get('/thumbnails', async (req, res, next) => {
  try {
    logger.info('Thumbnail request received');
    
    const thumbnails = await thumbnailService.getAllThumbnails();
    
    res.json({
      success: true,
      data: thumbnails,
      count: thumbnails.length
    });
  } catch (error) {
    logger.error('Error fetching thumbnails:', error);
    next(error);
  }
});

// GET /api/games/:title/:publisher/thumbnail - Get thumbnail for specific game
router.get('/:title/:publisher/thumbnail', async (req, res, next) => {
  try {
    const { title, publisher } = req.params;
    const decodedTitle = decodeURIComponent(title);
    const decodedPublisher = decodeURIComponent(publisher);
    
    logger.info(`Thumbnail request for: ${decodedTitle} (${decodedPublisher})`);
    
    const thumbnailData = await thumbnailService.getThumbnailUrl(decodedTitle, decodedPublisher);
    
    if (!thumbnailData) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }
    
    res.json({
      success: true,
      data: thumbnailData
    });
  } catch (error) {
    logger.error('Error fetching thumbnail:', error);
    next(error);
  }
});

// GET /api/games/:title/:publisher/images - Get all image sizes for a game
router.get('/:title/:publisher/images', async (req, res, next) => {
  try {
    const { title, publisher } = req.params;
    const decodedTitle = decodeURIComponent(title);
    const decodedPublisher = decodeURIComponent(publisher);
    
    logger.info(`Images request for: ${decodedTitle} (${decodedPublisher})`);
    
    const imageData = await thumbnailService.getGameImages(decodedTitle, decodedPublisher);
    
    if (!imageData) {
      return res.status(404).json({
        success: false,
        message: 'Images not found'
      });
    }
    
    res.json({
      success: true,
      data: imageData
    });
  } catch (error) {
    logger.error('Error fetching images:', error);
    next(error);
  }
});

// POST /api/games/update-thumbnails - Update database with thumbnail URLs
router.post('/update-thumbnails', async (req, res, next) => {
  try {
    logger.info('Thumbnail update request received');
    
    const result = await thumbnailService.updateDatabaseWithThumbnails();
    
    res.json({
      success: true,
      message: 'Thumbnail update completed',
      data: result
    });
  } catch (error) {
    logger.error('Error updating thumbnails:', error);
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