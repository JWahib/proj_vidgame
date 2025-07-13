const { getPool, sql } = require('../config/database');
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
      const pool = await getPool();
      
      const createTableQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='games' AND xtype='U')
        CREATE TABLE games (
          title NVARCHAR(255) NOT NULL,
          publisher NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          rating NVARCHAR(50),
          release_date DATE,
          genre NVARCHAR(500),
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE(),
          PRIMARY KEY (title, publisher)
        );
        
        -- Create indexes for better search performance
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_games_title')
        CREATE INDEX idx_games_title ON games(title);
        
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_games_genre')
        CREATE INDEX idx_games_genre ON games(genre);
        
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_games_release_date')
        CREATE INDEX idx_games_release_date ON games(release_date);
      `;
      
      await pool.request().query(createTableQuery);
      logger.info('Games table created/verified successfully');
    } catch (error) {
      logger.error('Error creating games table:', error);
      throw error;
    }
  }

  async save() {
    try {
      const pool = await getPool();
      
      const request = pool.request();
      request.input('title', sql.NVarChar(255), this.title);
      request.input('publisher', sql.NVarChar(255), this.publisher);
      request.input('description', sql.NVarChar(sql.MAX), this.description);
      request.input('rating', sql.NVarChar(50), this.rating);
      request.input('releaseDate', sql.Date, this.releaseDate);
      request.input('genre', sql.NVarChar(500), this.genre);
      
      const query = `
        MERGE games AS target
        USING (SELECT @title as title, @publisher as publisher) AS source
        ON (target.title = source.title AND target.publisher = source.publisher)
        WHEN MATCHED THEN
          UPDATE SET 
            description = @description,
            rating = @rating,
            release_date = @releaseDate,
            genre = @genre,
            updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (title, publisher, description, rating, release_date, genre)
          VALUES (@title, @publisher, @description, @rating, @releaseDate, @genre);
      `;
      
      await request.query(query);
      return this;
    } catch (error) {
      logger.error('Error saving game:', error);
      throw error;
    }
  }

  static async bulkInsert(games) {
    try {
      const pool = await getPool();
      const table = new sql.Table('games');
      
      table.columns.add('title', sql.NVarChar(255), {nullable: false});
      table.columns.add('publisher', sql.NVarChar(255), {nullable: false});
      table.columns.add('description', sql.NVarChar(sql.MAX), {nullable: true});
      table.columns.add('rating', sql.NVarChar(50), {nullable: true});
      table.columns.add('release_date', sql.Date, {nullable: true});
      table.columns.add('genre', sql.NVarChar(500), {nullable: true});
      
      games.forEach(game => {
        table.rows.add(
          game.title,
          game.publisher,
          game.description,
          game.rating,
          game.releaseDate,
          game.genre
        );
      });
      
      const request = pool.request();
      await request.bulk(table);
      
      logger.info(`Successfully inserted ${games.length} games`);
      return games.length;
    } catch (error) {
      logger.error('Error bulk inserting games:', error);
      throw error;
    }
  }

  static async search(searchTerm, filters = {}) {
    try {
      const pool = await getPool();
      const request = pool.request();
      
      let query = `
        SELECT title, publisher, description, rating, release_date, genre, created_at, updated_at
        FROM games
        WHERE 1=1
      `;
      
      if (searchTerm) {
        query += ` AND (title LIKE @searchTerm OR description LIKE @searchTerm OR genre LIKE @searchTerm)`;
        request.input('searchTerm', sql.NVarChar, `%${searchTerm}%`);
      }
      
      if (filters.genre) {
        query += ` AND genre LIKE @genre`;
        request.input('genre', sql.NVarChar, `%${filters.genre}%`);
      }
      
      if (filters.rating) {
        query += ` AND rating = @rating`;
        request.input('rating', sql.NVarChar, filters.rating);
      }
      
      if (filters.publisher) {
        query += ` AND publisher LIKE @publisher`;
        request.input('publisher', sql.NVarChar, `%${filters.publisher}%`);
      }
      
      query += ` ORDER BY title`;
      
      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      logger.error('Error searching games:', error);
      throw error;
    }
  }

  static async findByTitleAndPublisher(title, publisher) {
    try {
      const pool = await getPool();
      const request = pool.request();
      
      request.input('title', sql.NVarChar(255), title);
      request.input('publisher', sql.NVarChar(255), publisher);
      
      const query = `
        SELECT title, publisher, description, rating, release_date, genre, created_at, updated_at
        FROM games
        WHERE title = @title AND publisher = @publisher
      `;
      
      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      logger.error('Error finding game:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const pool = await getPool();
      const request = pool.request();
      
      const query = `
        SELECT title, publisher, description, rating, release_date, genre, created_at, updated_at
        FROM games
        ORDER BY title
      `;
      
      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      logger.error('Error getting all games:', error);
      throw error;
    }
  }

  static async deleteAll() {
    try {
      const pool = await getPool();
      const request = pool.request();
      
      await request.query('DELETE FROM games');
      logger.info('All games deleted from database');
    } catch (error) {
      logger.error('Error deleting all games:', error);
      throw error;
    }
  }

  static async getCount() {
    try {
      const pool = await getPool();
      const request = pool.request();
      
      const result = await request.query('SELECT COUNT(*) as count FROM games');
      return result.recordset[0].count;
    } catch (error) {
      logger.error('Error getting games count:', error);
      throw error;
    }
  }
}

module.exports = Game;