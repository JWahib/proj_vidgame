// Game Service for Backend Integration
// This file demonstrates how to integrate with a backend API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class GameService {
  // Fetch all games from the backend
  static async getAllGames() {
    try {
      const response = await fetch(`${API_BASE_URL}/games`);
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  }

  // Search games by query
  static async searchGames(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/games/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search games');
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching games:', error);
      throw error;
    }
  }

  // Get game by ID
  static async getGameById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  }

  // Get game by title (URL-friendly)
  static async getGameByTitle(title) {
    try {
      const response = await fetch(`${API_BASE_URL}/games/title/${encodeURIComponent(title)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching game by title:', error);
      throw error;
    }
  }

  // Get autocomplete suggestions
  static async getSearchSuggestions(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/games/suggestions?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  }

  // Filter games by criteria
  static async filterGames(filters) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.genre) queryParams.append('genre', filters.genre);
      if (filters.releaseYear) queryParams.append('releaseYear', filters.releaseYear);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      
      const response = await fetch(`${API_BASE_URL}/games/filter?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to filter games');
      }
      return await response.json();
    } catch (error) {
      console.error('Error filtering games:', error);
      throw error;
    }
  }

  // Get featured games
  static async getFeaturedGames() {
    try {
      const response = await fetch(`${API_BASE_URL}/games/featured`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured games');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured games:', error);
      throw error;
    }
  }

  // Get recently released games
  static async getRecentGames() {
    try {
      const response = await fetch(`${API_BASE_URL}/games/recent`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent games');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recent games:', error);
      throw error;
    }
  }
}

export default GameService;