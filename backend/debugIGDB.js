require('dotenv').config();
const axios = require('axios');

async function debugIGDBAuth() {
  console.log('=== IGDB Authentication Debug ===\n');
  
  // Check environment variables
  console.log('1. Checking environment variables:');
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  
  console.log(`   IGDB_CLIENT_ID: ${clientId ? '✓ Set' : '✗ Missing'}`);
  console.log(`   IGDB_CLIENT_SECRET: ${clientSecret ? '✓ Set' : '✗ Missing'}`);
  
  if (!clientId || !clientSecret) {
    console.log('\n❌ Missing environment variables!');
    console.log('Please add to your .env file:');
    console.log('IGDB_CLIENT_ID=your_client_id_here');
    console.log('IGDB_CLIENT_SECRET=your_client_secret_here');
    return;
  }
  
  console.log('\n2. Testing IGDB authentication...');
  
  try {
    // Test the OAuth token endpoint
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      },
      timeout: 10000
    });
    
    console.log('✓ OAuth token request successful!');
    console.log(`   Access Token: ${tokenResponse.data.access_token ? '✓ Received' : '✗ Missing'}`);
    console.log(`   Token Type: ${tokenResponse.data.token_type}`);
    console.log(`   Expires In: ${tokenResponse.data.expires_in} seconds`);
    
    const accessToken = tokenResponse.data.access_token;
    
    // Test IGDB API with the token
    console.log('\n3. Testing IGDB API connection...');
    
    const igdbResponse = await axios.post('https://api.igdb.com/v4/platforms', 
      'fields id,name; where name = "PlayStation 5"; limit 1;',
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'text/plain'
        },
        timeout: 10000
      }
    );
    
    console.log('✓ IGDB API request successful!');
    console.log(`   Response Status: ${igdbResponse.status}`);
    console.log(`   Data Length: ${igdbResponse.data ? igdbResponse.data.length : 0} items`);
    
    if (igdbResponse.data && igdbResponse.data.length > 0) {
      console.log(`   PlayStation 5 Platform ID: ${igdbResponse.data[0].id}`);
    }
    
    console.log('\n✅ IGDB authentication is working correctly!');
    
  } catch (error) {
    console.log('\n❌ Authentication failed!');
    console.log('Error details:');
    
    if (error.response) {
      // Server responded with error status
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Status Text: ${error.response.statusText}`);
      console.log(`   Response Data:`, error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n🔍 This looks like an authentication error. Possible issues:');
        console.log('   - Invalid Client ID or Client Secret');
        console.log('   - Client Secret might be incorrect');
        console.log('   - Application not properly registered on Twitch Developer Portal');
      } else if (error.response.status === 403) {
        console.log('\n🔍 This looks like a permissions error. Possible issues:');
        console.log('   - Application not approved for IGDB access');
        console.log('   - Rate limit exceeded');
        console.log('   - Missing required scopes');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.log('   No response received from server');
      console.log('   This might be a network connectivity issue');
    } else {
      // Something else happened
      console.log('   Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Double-check your Client ID and Client Secret');
    console.log('2. Make sure you copied the entire Client Secret (it might be truncated)');
    console.log('3. Verify your application is registered on https://dev.twitch.tv/console');
    console.log('4. Check if your application has the correct category (Application Integration)');
    console.log('5. Try generating a new Client Secret if needed');
  }
}

// Run the debug function
debugIGDBAuth(); 