const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('./src/utils/logger');

class FrogJumperDBChecker {
  constructor() {
    this.dbPath = path.join(__dirname, 'data', 'ps5_games.db');
  }

  async checkFrogJumper() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Error opening database:', err.message);
          reject(err);
          return;
        }
        logger.info('Database opened successfully');
      });

      const query = `
        SELECT title, igdb_id, cover_image_id, artwork_image_id, release_date 
        FROM games 
        WHERE title LIKE '%Frog%' OR title LIKE '%Jumper%'
        ORDER BY title
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          logger.error('Error querying database:', err.message);
          reject(err);
          return;
        }

        logger.info(`Found ${rows.length} games matching "Frog" or "Jumper"`);
        
        if (rows.length === 0) {
          logger.info('No games found with "Frog" or "Jumper" in the title');
        } else {
          for (const row of rows) {
            logger.info(`\n=== Game: ${row.title} ===`);
            logger.info(`IGDB ID: ${row.igdb_id}`);
            logger.info(`Release Date: ${row.release_date}`);
            logger.info(`Cover Image ID: ${row.cover_image_id || 'NULL'}`);
            logger.info(`Artwork Image ID: ${row.artwork_image_id || 'NULL'}`);
            
            if (row.cover_image_id || row.artwork_image_id) {
              logger.info('✅ Has image IDs in database');
            } else {
              logger.info('❌ No image IDs in database');
            }
          }
        }

        db.close((err) => {
          if (err) {
            logger.error('Error closing database:', err.message);
          }
          resolve();
        });
      });
    });
  }
}

// Run the check
async function main() {
  const checker = new FrogJumperDBChecker();
  await checker.checkFrogJumper();
}

main().catch(console.error); 