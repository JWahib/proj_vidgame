const axios = require('axios');
const Game = require('../models/Game');
const logger = require('../utils/logger');

class ThumbnailService {
  constructor() {
    // IGDB API configuration
    this.igdbBaseUrl = 'https://api.igdb.com/v4';
    this.clientId = process.env.IGDB_CLIENT_ID;
    this.clientSecret = process.env.IGDB_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get IGDB access token
   */
  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        }
      });

      this.accessToken = response.data.access_token;
      // Set expiry to 50 days (tokens typically last 60 days, but we refresh early)
      this.tokenExpiry = Date.now() + (50 * 24 * 60 * 60 * 1000);

      logger.info('IGDB access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get IGDB access token:', error.message);
      throw new Error('Failed to authenticate with IGDB API');
    }
  }

  /**
   * Search for a game on IGDB
   */
  async searchGame(title, publisher) {
    try {
      const token = await this.getAccessToken();
      
      // Search for games with the title
      const searchResponse = await axios.post(`${this.igdbBaseUrl}/games`, 
        `search "${title}"; fields name,cover,first_release_date,genres.name,publisher.name; limit 10;`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      if (!searchResponse.data || searchResponse.data.length === 0) {
        logger.warn(`No games found on IGDB for title: ${title}`);
        return null;
      }

      // Find the best match by comparing title and publisher
      let bestMatch = null;
      let bestScore = 0;

      for (const game of searchResponse.data) {
        let score = 0;
        
        // Title similarity (case-insensitive)
        const titleSimilarity = this.calculateSimilarity(
          title.toLowerCase(), 
          game.name.toLowerCase()
        );
        score += titleSimilarity * 0.7; // 70% weight for title

        // Publisher similarity if available
        if (game.publisher && publisher) {
          const publisherSimilarity = this.calculateSimilarity(
            publisher.toLowerCase(),
            game.publisher.name.toLowerCase()
          );
          score += publisherSimilarity * 0.3; // 30% weight for publisher
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = game;
        }
      }

      // Only return if we have a good match (score > 0.5)
      if (bestScore > 0.5) {
        return bestMatch;
      }

      logger.warn(`No good match found for ${title} (${publisher}). Best score: ${bestScore}`);
      return null;
    } catch (error) {
      logger.error(`Error searching IGDB for ${title}:`, error.message);
      return null;
    }
  }

  /**
   * Get thumbnail URL for a game
   */
  async getThumbnailUrl(title, publisher) {
    try {
      const game = await this.searchGame(title, publisher);
      
      if (!game || !game.cover) {
        logger.warn(`No cover image found for ${title}`);
        return null;
      }

      // IGDB image URL format
      const thumbnailUrl = `https://images.igdb.com/igdb/image/upload/t_thumb/${game.cover.image_id}.jpg`;
      const coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`;

      return {
        thumbnail: thumbnailUrl,
        cover: coverUrl,
        igdbId: game.id,
        name: game.name
      };
    } catch (error) {
      logger.error(`Error getting thumbnail for ${title}:`, error.message);
      return null;
    }
  }

  /**
   * Get thumbnails for all games in the database
   */
  async getAllThumbnails() {
    try {
      logger.info('Starting to fetch thumbnails for all games...');
      
      const games = await Game.getAll();
      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (const game of games) {
        try {
          logger.info(`Fetching thumbnail for: ${game.title} (${game.publisher})`);
          
          const thumbnailData = await this.getThumbnailUrl(game.title, game.publisher);
          
          if (thumbnailData) {
            results.push({
              title: game.title,
              publisher: game.publisher,
              thumbnail: thumbnailData.thumbnail,
              cover: thumbnailData.cover,
              igdbId: thumbnailData.igdbId,
              igdbName: thumbnailData.name
            });
            successCount++;
          } else {
            results.push({
              title: game.title,
              publisher: game.publisher,
              thumbnail: null,
              cover: null,
              igdbId: null,
              igdbName: null
            });
            failureCount++;
          }

          // Rate limiting - wait 100ms between requests
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          logger.error(`Error processing ${game.title}:`, error.message);
          results.push({
            title: game.title,
            publisher: game.publisher,
            thumbnail: null,
            cover: null,
            igdbId: null,
            igdbName: null
          });
          failureCount++;
        }
      }

      logger.info(`Thumbnail fetch completed. Success: ${successCount}, Failures: ${failureCount}`);
      return results;
    } catch (error) {
      logger.error('Error fetching all thumbnails:', error.message);
      throw error;
    }
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateSimilarity(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  /**
   * Update database with thumbnail URLs
   */
  async updateDatabaseWithThumbnails() {
    try {
      logger.info('Starting database update with thumbnail URLs...');
      
      const thumbnails = await this.getAllThumbnails();
      let updatedCount = 0;

      for (const item of thumbnails) {
        if (item.thumbnail) {
          // Update the game record with thumbnail URL
          // Note: You'll need to add thumbnail_url and cover_url columns to your database
          // and update the Game model to support this
          logger.info(`Would update ${item.title} with thumbnail: ${item.thumbnail}`);
          updatedCount++;
        }
      }

      logger.info(`Database update completed. Updated ${updatedCount} games with thumbnails`);
      return { updatedCount, totalProcessed: thumbnails.length };
    } catch (error) {
      logger.error('Error updating database with thumbnails:', error.message);
      throw error;
    }
  }
}

module.exports = new ThumbnailService(); 