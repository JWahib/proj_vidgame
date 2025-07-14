require('dotenv').config();
const axios = require('axios');
const logger = require('./src/utils/logger');

async function getIGDBToken() {
  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', 
      `client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    logger.error('Error getting IGDB token:', error);
    throw error;
  }
}

async function debugFrogJumperDetails() {
  try {
    logger.info('=== Debugging Frog Jumper Details ===');
    
    const token = await getIGDBToken();
    logger.info('IGDB access token obtained successfully');
    
    // First, find Frog Jumper's IGDB ID
    const searchResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields id,name; 
       where name = "Frog Jumper" & platforms = 167;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    if (!searchResponse.data || searchResponse.data.length === 0) {
      logger.error('Frog Jumper not found in IGDB');
      return;
    }
    
    const frogJumper = searchResponse.data[0];
    logger.info(`Found Frog Jumper with ID: ${frogJumper.id}`);
    
    // Get full details for Frog Jumper
    const detailsResponse = await axios.post('https://api.igdb.com/v4/games', 
      `fields name,first_release_date,genres.name,artworks,cover,rating,rating_count,summary,platforms.name,involved_companies; 
       where id = ${frogJumper.id};`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    if (!detailsResponse.data || detailsResponse.data.length === 0) {
      logger.error('Could not get details for Frog Jumper');
      return;
    }
    
    const gameDetails = detailsResponse.data[0];
    logger.info('=== Frog Jumper Raw IGDB Data ===');
    logger.info(JSON.stringify(gameDetails, null, 2));
    
    // Check if it has cover
    if (gameDetails.cover) {
      logger.info(`Frog Jumper has cover ID: ${gameDetails.cover}`);
      
      // Get cover details
      const coverResponse = await axios.post('https://api.igdb.com/v4/covers', 
        `fields id,image_id; 
         where id = ${gameDetails.cover};`,
        {
          headers: {
            'Client-ID': process.env.IGDB_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );
      
      if (coverResponse.data && coverResponse.data.length > 0) {
        logger.info('=== Cover Details ===');
        logger.info(JSON.stringify(coverResponse.data[0], null, 2));
      }
    } else {
      logger.info('Frog Jumper has NO cover');
    }
    
    // Check if it has artworks
    if (gameDetails.artworks && gameDetails.artworks.length > 0) {
      logger.info(`Frog Jumper has ${gameDetails.artworks.length} artworks: ${gameDetails.artworks.join(', ')}`);
      
      // Get artwork details
      const artworkResponse = await axios.post('https://api.igdb.com/v4/artworks', 
        `fields id,image_id; 
         where id = (${gameDetails.artworks.join(',')});`,
        {
          headers: {
            'Client-ID': process.env.IGDB_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );
      
      if (artworkResponse.data && artworkResponse.data.length > 0) {
        logger.info('=== Artwork Details ===');
        logger.info(JSON.stringify(artworkResponse.data, null, 2));
      }
    } else {
      logger.info('Frog Jumper has NO artworks');
    }
    
  } catch (error) {
    logger.error('Error debugging Frog Jumper details:', error);
  }
}

debugFrogJumperDetails(); 