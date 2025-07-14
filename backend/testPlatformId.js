require('dotenv').config();
const scrapingService = require('./src/services/dataScrapingService');

async function testPlatformId() {
  try {
    console.log('=== Testing PS5 Platform ID ===');
    
    const token = await scrapingService.getAccessToken();
    
    const platformId = await scrapingService.getPlayStation5PlatformId(token);
    console.log(`PS5 Platform ID found: ${platformId}`);
    
    // Now let's test if Dragon's Dogma II is in the results with this platform ID
    console.log('\n=== Testing Dragon\'s Dogma II with this platform ID ===');
    
    const axios = require('axios');
    const response = await axios.post('https://api.igdb.com/v4/games', 
      `fields name,first_release_date,genres.name,artworks,cover,rating,rating_count,summary,platforms.name,involved_companies; 
       where platforms != null & name != null & platforms = (${platformId});
       limit 500;`,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    // sort first_release_date desc; 
    
    console.log(`Total games found: ${response.data.length}`);
    
    // Check if Dragon's Dogma II is in the results
    const dragonsDogma = response.data.find(game => game.name.includes('Dragon\'s Dogma II'));
    if (dragonsDogma) {
      console.log('✅ Dragon\'s Dogma II found in results!');
      console.log(`   Name: ${dragonsDogma.name}`);
      console.log(`   ID: ${dragonsDogma.id}`);
      console.log(`   Platforms: ${dragonsDogma.platforms ? dragonsDogma.platforms.map(p => p.name).join(', ') : 'None'}`);
    } else {
      console.log('❌ Dragon\'s Dogma II NOT found in results');
      
      // Let's check what games we do have
      console.log('\nFirst 10 games found:');
      response.data.slice(0, 10).forEach((game, index) => {
        console.log(`${index + 1}. ${game.name} (ID: ${game.id})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testPlatformId(); 