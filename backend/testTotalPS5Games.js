require('dotenv').config();
const axios = require('axios');
const logger = require('./src/utils/logger');

async function getIGDBToken() {
  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.IGDB_CLIENT_ID,
        client_secret: process.env.IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });
    return response.data.access_token;
  } catch (error) {
    logger.error('Error getting IGDB token:', error);
    throw error;
  }
}

async function testTotalPS5Games() {
  try {
    logger.info('=== Testing Total PS5 Games in IGDB ===');
    
    const token = await getIGDBToken();
    logger.info('IGDB access token obtained successfully');
    
    // Get PlayStation 5 platform ID
    const platformResponse = await axios.post('https://api.igdb.com/v4/platforms', 
      'fields id,name; where name = "PlayStation 5"; limit 1;',
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    const platformId = platformResponse.data[0].id;
    logger.info(`Found PlayStation 5 platform ID: ${platformId}`);
    
    // Test 1: All PS5 games (no filters)
    const allGamesResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields id,name; where platforms = ${platformId}; limit 500;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`Total PS5 games (no filters): ${allGamesResponse.data.length}`);
    
    // Test 2: PS5 games with names only
    const namedGamesResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields id,name; where platforms = ${platformId} & name != null; limit 500;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`PS5 games with names: ${namedGamesResponse.data.length}`);
    
    // Test 3: PS5 games with release dates only
    const releaseDateGamesResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields id,name,first_release_date; where platforms = ${platformId} & first_release_date != null; limit 500;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`PS5 games with release dates: ${releaseDateGamesResponse.data.length}`);
    
    // Test 4: PS5 games with both name and release date (our current query)
    const currentQueryResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields id,name,first_release_date; where platforms = ${platformId} & first_release_date != null & name != null; limit 500;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`PS5 games with name AND release date: ${currentQueryResponse.data.length}`);
    
    // Test 5: PS5 games with names but no release date requirement
    const noReleaseDateResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields id,name,first_release_date; where platforms = ${platformId} & name != null; limit 500;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`PS5 games with names (no release date requirement): ${noReleaseDateResponse.data.length}`);
    
    // Show some examples of games without release dates
    const gamesWithoutReleaseDates = noReleaseDateResponse.data.filter(game => !game.first_release_date);
    if (gamesWithoutReleaseDates.length > 0) {
      logger.info('Sample games without release dates:');
      gamesWithoutReleaseDates.slice(0, 10).forEach(game => {
        logger.info(`- ${game.name} (ID: ${game.id})`);
      });
    }
    
  } catch (error) {
    logger.error('Error testing total PS5 games:', error);
  }
}

testTotalPS5Games(); 