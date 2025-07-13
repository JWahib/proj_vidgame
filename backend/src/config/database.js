const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/ps5_games.db');

let db;

async function connectToDatabase() {
  return new Promise((resolve, reject) => {
    // Create data directory if it doesn't exist
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Database connection failed:', err);
        reject(err);
      } else {
        logger.info('Connected to SQLite database');
        // Enable foreign key constraints
        db.run('PRAGMA foreign_keys = ON');
        resolve(db);
      }
    });
  });
}

async function getDatabase() {
  if (!db) {
    await connectToDatabase();
  }
  return db;
}

async function closeConnection() {
  if (db) {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
          reject(err);
        } else {
          logger.info('Database connection closed');
          db = null;
          resolve();
        }
      });
    });
  }
}

// Helper function to run SQL queries
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper function to get all rows
function getAllRows(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper function to get a single row
function getRow(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeConnection,
  runQuery,
  getAllRows,
  getRow
};