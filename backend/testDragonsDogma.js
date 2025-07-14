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

async function testDragonsDogma() {
  try {
    logger.info('=== Testing Dragon\'s Dogma II Search ===');
    
    const token = await getIGDBToken();
    logger.info('IGDB access token obtained successfully');
    
    // First, search for Dragon's Dogma II by name
    logger.info('Searching for Dragon\'s Dogma II by name...');
    const searchResponse = await axios.post('https://api.igdb.com/v4/games', 
      `search "Dragon's Dogma II";
       fields name,first_release_date,genres.name,artworks,cover,rating,rating_count,summary,platforms.name,involved_companies;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info(`Found ${searchResponse.data.length} games with "Dragon's Dogma II" in name:`);
    searchResponse.data.forEach((game, index) => {
      logger.info(`${index + 1}. ${game.name} (ID: ${game.id})`);
      logger.info(`   Release Date: ${game.first_release_date}`);
      logger.info(`   Platforms: ${game.platforms ? game.platforms.map(p => p.name).join(', ') : 'None'}`);
      logger.info(`   Cover: ${game.cover || 'None'}`);
      logger.info(`   Artworks: ${game.artworks ? game.artworks.length : 0}`);
      logger.info('   ---');
    });
    
    // Now check what platforms are available for PS5
    logger.info('\n=== Checking PS5 Platform ID ===');
    const ps5Response = await axios.post('https://api.igdb.com/v4/platforms',
      `fields name,id;
       where name = "PlayStation 5";`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    logger.info('PS5 Platform Info:', JSON.stringify(ps5Response.data, null, 2));
    
    // Check if Dragon's Dogma II has PS5 as a platform
    if (searchResponse.data.length > 0) {
      const dragonsDogma = searchResponse.data[0];
      logger.info('\n=== Checking Dragon\'s Dogma II Platform Details ===');
      logger.info(`Game: ${dragonsDogma.name}`);
      logger.info(`Platforms: ${JSON.stringify(dragonsDogma.platforms, null, 2)}`);
      
      if (dragonsDogma.platforms) {
        const ps5Platform = dragonsDogma.platforms.find(p => p.name === 'PlayStation 5');
        if (ps5Platform) {
          logger.info('✅ Dragon\'s Dogma II IS available on PS5!');
        } else {
          logger.info('❌ Dragon\'s Dogma II is NOT available on PS5');
          logger.info('Available platforms:', dragonsDogma.platforms.map(p => p.name).join(', '));
        }
      }
    }
    
  } catch (error) {
    logger.error('Error testing Dragon\'s Dogma II:', error.response ? error.response.data : error.message);
  }
}

testDragonsDogma(); 