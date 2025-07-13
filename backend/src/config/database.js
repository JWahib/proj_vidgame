const sql = require('mssql');
const logger = require('../utils/logger');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE || 'ps5_games_db',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  }
};

// Config for initial connection (without database specified)
const masterConfig = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: 'master',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000
  }
};

let pool;

async function connectToDatabase() {
  try {
    // First, try to create the database if it doesn't exist
    await ensureDatabaseExists();
    
    pool = await sql.connect(config);
    logger.info('Connected to SQL Server database');
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

async function ensureDatabaseExists() {
  let masterPool;
  try {
    masterPool = await sql.connect(masterConfig);
    const dbName = process.env.DB_DATABASE || 'ps5_games_db';
    
    const checkDbQuery = `
      SELECT database_id 
      FROM sys.databases 
      WHERE name = '${dbName}'
    `;
    
    const result = await masterPool.request().query(checkDbQuery);
    
    if (result.recordset.length === 0) {
      logger.info(`Database ${dbName} does not exist. Creating...`);
      await masterPool.request().query(`CREATE DATABASE [${dbName}]`);
      logger.info(`Database ${dbName} created successfully`);
    } else {
      logger.info(`Database ${dbName} already exists`);
    }
  } catch (error) {
    logger.error('Error ensuring database exists:', error);
    throw error;
  } finally {
    if (masterPool) {
      await masterPool.close();
    }
  }
}

async function getPool() {
  if (!pool) {
    await connectToDatabase();
  }
  return pool;
}

async function closeConnection() {
  if (pool) {
    await pool.close();
    pool = null;
    logger.info('Database connection closed');
  }
}

module.exports = {
  connectToDatabase,
  getPool,
  closeConnection,
  ensureDatabaseExists,
  sql
};