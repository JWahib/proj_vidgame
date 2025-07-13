// Test utility for backend integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend health check passed');
    } else {
      console.log('❌ Backend health check failed');
    }
    
    // Test games endpoint
    const gamesResponse = await fetch(`${API_BASE_URL}/games`);
    if (gamesResponse.ok) {
      const gamesData = await gamesResponse.json();
      console.log(`✅ Backend games endpoint working - ${gamesData.data?.length || 0} games found`);
      return true;
    } else {
      console.log('❌ Backend games endpoint failed');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
}

export async function testThumbnailService() {
  try {
    console.log('Testing thumbnail service...');
    
    const response = await fetch(`${API_BASE_URL}/games/thumbnails`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Thumbnail service working - ${data.data?.length || 0} thumbnails available`);
      return true;
    } else {
      console.log('❌ Thumbnail service failed');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Thumbnail service error:', error.message);
    return false;
  }
} 