const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const logger = require('../utils/logger');
const dataScrapingService = require('../services/dataScrapingService');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());

// Mock data storage
let mockGames = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'PS5 Games Backend (Mock Mode)'
  });
});

// Get all games
app.get('/api/games', (req, res) => {
  res.json({
    success: true,
    data: mockGames,
    count: mockGames.length
  });
});

// Search games
app.get('/api/games/search', (req, res) => {
  const { q, genre, publisher } = req.query;
  
  let filteredGames = mockGames;
  
  if (q) {
    filteredGames = filteredGames.filter(game => 
      game.title.toLowerCase().includes(q.toLowerCase()) ||
      (game.description && game.description.toLowerCase().includes(q.toLowerCase())) ||
      (game.genre && game.genre.toLowerCase().includes(q.toLowerCase()))
    );
  }
  
  if (genre) {
    filteredGames = filteredGames.filter(game => 
      game.genre && game.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
  
  if (publisher) {
    filteredGames = filteredGames.filter(game => 
      game.publisher && game.publisher.toLowerCase().includes(publisher.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: filteredGames,
    count: filteredGames.length,
    query: q,
    filters: { genre, publisher }
  });
});

// Refresh database (mock)
app.post('/api/games/refreshDB', async (req, res) => {
  try {
    logger.info('Starting mock database refresh...');
    
    // Use mock data
    mockGames = await dataScrapingService.getMockPS5Games();
    
    logger.info(`Mock database refreshed successfully. Loaded ${mockGames.length} games`);
    
    res.json({
      success: true,
      message: 'Database refreshed successfully (mock mode)',
      data: {
        gamesImported: mockGames.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error refreshing mock database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh database'
    });
  }
});

// Get stats
app.get('/api/games/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalGames: mockGames.length,
      lastUpdated: new Date().toISOString(),
      mode: 'mock'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🎮 PS5 Games Backend is running on port ${PORT} (Mock Mode)`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📚 API endpoints:`);
  logger.info(`   GET  /api/games - Get all games`);
  logger.info(`   GET  /api/games/search - Search games`);
  logger.info(`   POST /api/games/refreshDB - Refresh database`);
  logger.info(`   GET  /api/games/stats - Get statistics`);
});

module.exports = app;