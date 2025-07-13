const { getDatabase, runQuery, getAllRows, getRow } = require('../config/database');
const logger = require('../utils/logger');

class Game {
  constructor(data) {
    this.title = data.title;
    this.publisher = data.publisher;
    this.description = data.description || null;
    this.rating = data.rating || null;
    this.releaseDate = data.releaseDate || null;
    this.genre = data.genre || null; // comma-separated string
  }

  static async createTable() {
    try {
      await getDatabase();
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS games (
          title TEXT NOT NULL,
          publisher TEXT NOT NULL,
          description TEXT,
          rating TEXT,
          release_date DATE,
          genre TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (title, publisher)
        )
      `;
      
      await runQuery(createTableQuery);
      
      // Create indexes for better search performance
      await runQuery('CREATE INDEX IF NOT EXISTS idx_games_title ON games(title)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre)');
      await runQuery('CREATE INDEX IF NOT EXISTS idx_games_release_date ON games(release_date)');
      
      logger.info('Games table created/verified successfully');
    } catch (error) {
      logger.error('Error creating games table:', error);
      throw error;
    }
  }

  async save() {
    try {
      await getDatabase();
      
      const query = `
        INSERT OR REPLACE INTO games (title, publisher, description, rating, release_date, genre, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const params = [
        this.title,
        this.publisher,
        this.description,
        this.rating,
        this.releaseDate,
        this.genre
      ];
      
      await runQuery(query, params);
      return this;
    } catch (error) {
      logger.error('Error saving game:', error);
      throw error;
    }
  }

  static async bulkInsert(games) {
    try {
      await getDatabase();
      
      const query = `
        INSERT OR REPLACE INTO games (title, publisher, description, rating, release_date, genre)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      // Process games in batches to avoid overwhelming the database
      const batchSize = 100;
      let insertedCount = 0;
      
      for (let i = 0; i < games.length; i += batchSize) {
        const batch = games.slice(i, i + batchSize);
        
        for (const game of batch) {
          const params = [
            game.title,
            game.publisher,
            game.description,
            game.rating,
            game.releaseDate,
            game.genre
          ];
          
          await runQuery(query, params);
          insertedCount++;
        }
      }
      
      logger.info(`Successfully inserted ${insertedCount} games`);
      return insertedCount;
    } catch (error) {
      logger.error('Error bulk inserting games:', error);
      throw error;
    }
  }

  static async search(searchTerm, filters = {}) {
    try {
      await getDatabase();
      
      let query = `
        SELECT title, publisher, description, rating, release_date, genre, created_at, updated_at
        FROM games
        WHERE 1=1
      `;
      
      const params = [];
      
      if (searchTerm) {
        query += ` AND (title LIKE ? OR description LIKE ? OR genre LIKE ?)`;
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
      
      if (filters.genre) {
        query += ` AND genre LIKE ?`;
        params.push(`%${filters.genre}%`);
      }
      
      if (filters.rating) {
        query += ` AND rating = ?`;
        params.push(filters.rating);
      }
      
      if (filters.publisher) {
        query += ` AND publisher LIKE ?`;
        params.push(`%${filters.publisher}%`);
      }
      
      query += ` ORDER BY title`;
      
      const result = await getAllRows(query, params);
      return result;
    } catch (error) {
      logger.error('Error searching games:', error);
      throw error;
    }
  }

  static async findByTitleAndPublisher(title, publisher) {
    try {
      await getDatabase();
      
      const query = `
        SELECT title, publisher, description, rating, release_date, genre, created_at, updated_at
        FROM games
        WHERE title = ? AND publisher = ?
      `;
      
      const result = await getRow(query, [title, publisher]);
      return result || null;
    } catch (error) {
      logger.error('Error finding game:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      await getDatabase();
      
      const query = `
        SELECT title, publisher, description, rating, release_date, genre, created_at, updated_at
        FROM games
        ORDER BY title
      `;
      
      const result = await getAllRows(query);
      return result;
    } catch (error) {
      logger.error('Error getting all games:', error);
      throw error;
    }
  }

  static async deleteAll() {
    try {
      await getDatabase();
      
      await runQuery('DELETE FROM games');
      logger.info('All games deleted from database');
    } catch (error) {
      logger.error('Error deleting all games:', error);
      throw error;
    }
  }

  static async getCount() {
    try {
      await getDatabase();
      
      const result = await getRow('SELECT COUNT(*) as count FROM games');
      return result.count;
    } catch (error) {
      logger.error('Error getting games count:', error);
      throw error;
    }
  }
}

module.exports = Game;