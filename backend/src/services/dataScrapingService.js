const axios = require('axios');
const logger = require('../utils/logger');
require('dotenv').config();

class DataScrapingService {
  constructor() {
    // IGDB API configuration
    this.igdbBaseUrl = 'https://api.igdb.com/v4';
    this.clientId = process.env.IGDB_CLIENT_ID;
    this.clientSecret = process.env.IGDB_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get IGDB access token
   */
  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        }
      });

      this.accessToken = response.data.access_token;
      // Set expiry to 50 days (tokens typically last 60 days, but we refresh early)
      this.tokenExpiry = Date.now() + (50 * 24 * 60 * 60 * 1000);

      logger.info('IGDB access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get IGDB access token:', error.message);
      throw new Error('Failed to authenticate with IGDB API');
    }
  }

  /**
   * Scrape PS5 games from IGDB
   */
  async scrapePS5Games() {
    try {
      logger.info('Starting to scrape PS5 games from IGDB...');
      
      const token = await this.getAccessToken();
      
      // Get PlayStation 5 platform ID first
      const platformId = await this.getPlayStation5PlatformId(token);
      if (!platformId) {
        logger.error('Could not find PlayStation 5 platform ID');
        return [];
      }

      logger.info(`Found PlayStation 5 platform ID: ${platformId}`);

      // Fetch PS5 games from IGDB
      const games = await this.fetchPS5Games(token, platformId);
      
      logger.info(`Successfully scraped ${games.length} PS5 games from IGDB`);
      return games;
      
    } catch (error) {
      logger.error('Error scraping PS5 games from IGDB:', error);
      throw error;
    }
  }

  /**
   * Get PlayStation 5 platform ID from IGDB
   */
  async getPlayStation5PlatformId(token) {
    try {
      const response = await axios.post(`${this.igdbBaseUrl}/platforms`, 
        'fields id,name; where name = "PlayStation 5"; limit 1;',
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      if (response.data && response.data.length > 0) {
        return response.data[0].id;
      }

      return null;
    } catch (error) {
      logger.error('Error getting PlayStation 5 platform ID:', error.message);
      return null;
    }
  }

  /**
   * Fetch PS5 games from IGDB
   */
  async fetchPS5Games(token, platformId) {
    try {
      logger.info('Fetching all PS5 games from IGDB...');

              const response = await axios.post(`${this.igdbBaseUrl}/games`, 
          `fields name,first_release_date,genres.name,artworks,cover,rating,rating_count,summary,platforms.name,involved_companies; 
           where platforms = (${platformId}) & name != null; 
           sort first_release_date desc; 
           limit 500;`,
          {
            headers: {
              'Client-ID': this.clientId,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'text/plain'
            }
          }
        );

        if (!response.data || response.data.length === 0) {
          logger.warn('No PS5 games found');
          return [];
        }

        logger.info(`Found ${response.data.length} PS5 games`);

        // Collect all involved company IDs from all games
        const allInvolvedCompanyIds = new Set();
        response.data.forEach(game => {
          if (game.involved_companies && game.involved_companies.length > 0) {
            game.involved_companies.forEach(id => allInvolvedCompanyIds.add(id));
          }
        });

        // Collect all artwork IDs from all games
        const allArtworkIds = new Set();
        response.data.forEach(game => {
          if (game.artworks && game.artworks.length > 0) {
            game.artworks.forEach(id => allArtworkIds.add(id));
          }
        });

        // Step 1: Get all artwork image_ids in batches (IGDB has limits)
        let artworkImageIds = {};
        if (allArtworkIds.size > 0) {
          const artworkIdsArray = Array.from(allArtworkIds);
          const batchSize = 10; // Reduced batch size to avoid IGDB limits
          
          for (let i = 0; i < artworkIdsArray.length; i += batchSize) {
            const batch = artworkIdsArray.slice(i, i + batchSize);
            const artworksResponse = await axios.post(`${this.igdbBaseUrl}/artworks`, 
              `fields image_id; 
               where id = (${batch.join(',')});`,
              {
                headers: {
                  'Client-ID': this.clientId,
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'text/plain'
                }
              }
            );

            // Create a mapping: artwork_id -> image_id
            if (artworksResponse.data && artworksResponse.data.length > 0) {
              artworksResponse.data.forEach(artwork => {
                artworkImageIds[artwork.id] = artwork.image_id;
              });
            }
          }
          
          // Debug: Print artworkImageIds mapping
          console.log('ARTWORK IMAGE ID MAPPING:', artworkImageIds);
          console.log('TOTAL ARTWORKS FETCHED:', Object.keys(artworkImageIds).length);
          console.log('TOTAL ARTWORKS REQUESTED:', allArtworkIds.size);
        }

        // Step 2: Get all cover image_ids in batches (IGDB has limits)
        const allCoverIds = new Set();
        response.data.forEach(game => {
          if (game.cover) {
            allCoverIds.add(game.cover);
          }
        });

        let coverImageIds = {};
        if (allCoverIds.size > 0) {
          const coverIdsArray = Array.from(allCoverIds);
          const batchSize = 10; // Reduced batch size to avoid IGDB limits
          
          for (let i = 0; i < coverIdsArray.length; i += batchSize) {
            const batch = coverIdsArray.slice(i, i + batchSize);
            const coversResponse = await axios.post(`${this.igdbBaseUrl}/covers`, 
              `fields image_id; 
               where id = (${batch.join(',')});`,
              {
                headers: {
                  'Client-ID': this.clientId,
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'text/plain'
                }
              }
            );

            // Create a mapping: cover_id -> image_id
            if (coversResponse.data && coversResponse.data.length > 0) {
              coversResponse.data.forEach(cover => {
                coverImageIds[cover.id] = cover.image_id;
              });
            }
          }
          
          // Debug: Print coverImageIds mapping
          console.log('COVER IMAGE ID MAPPING:', coverImageIds);
          console.log('TOTAL COVERS FETCHED:', Object.keys(coverImageIds).length);
          console.log('TOTAL COVERS REQUESTED:', allCoverIds.size);
        }

        // Step 3: Get all involved companies (publishers only) in one call
        let publisherCompanies = {};
        if (allInvolvedCompanyIds.size > 0) {
          const involvedCompaniesResponse = await axios.post(`${this.igdbBaseUrl}/involved_companies`, 
            `fields id, company, publisher; 
             where id = (${Array.from(allInvolvedCompanyIds).join(',')}) & publisher = true;`,
            {
              headers: {
                'Client-ID': this.clientId,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
              }
            }
          );

          // Step 4: Get all company names in one call
          if (involvedCompaniesResponse.data && involvedCompaniesResponse.data.length > 0) {
            const companyIds = involvedCompaniesResponse.data.map(ic => ic.company);
            const companiesResponse = await axios.post(`${this.igdbBaseUrl}/companies`, 
              `fields id, name; where id = (${companyIds.join(',')});`,
              {
                headers: {
                  'Client-ID': this.clientId,
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'text/plain'
                }
              }
            );

            // Create a mapping: involved_company_id -> company_name
            const companyMap = {};
            companiesResponse.data.forEach(company => {
              companyMap[company.id] = company.name;
            });

            involvedCompaniesResponse.data.forEach(involvedCompany => {
              publisherCompanies[involvedCompany.id] = companyMap[involvedCompany.company];
            });
          }
        }

        // Process all games with publisher and cover information
        const games = [];
        for (const igdbGame of response.data) {
          // Find the first publisher for this game
          let publisher = 'Unknown';
          if (igdbGame.involved_companies && igdbGame.involved_companies.length > 0) {
            for (const involvedCompanyId of igdbGame.involved_companies) {
              if (publisherCompanies[involvedCompanyId]) {
                publisher = publisherCompanies[involvedCompanyId];
                break; // Use the first publisher found
              }
            }
          }
          
          // Add publisher to the game object
          igdbGame.publisher = publisher;
          
          // Assign artwork_image_id (prefer first artwork, fallback to cover)
          if (igdbGame.artworks && igdbGame.artworks.length > 0 && artworkImageIds[String(igdbGame.artworks[0])]) {
            igdbGame.artwork_image_id = artworkImageIds[String(igdbGame.artworks[0])];
          } else if (igdbGame.cover && coverImageIds[String(igdbGame.cover)]) {
            igdbGame.artwork_image_id = coverImageIds[String(igdbGame.cover)];
          } else {
            igdbGame.artwork_image_id = null;
          }

          // Assign cover_image_id (always from cover, if available)
          if (igdbGame.cover && coverImageIds[String(igdbGame.cover)]) {
            igdbGame.cover_image_id = coverImageIds[String(igdbGame.cover)];
          } else {
            igdbGame.cover_image_id = null;
          }
          
          const game = this.transformIGDBGame(igdbGame);
          if (game) {
            games.push(game);
          }
        }

        logger.info(`Total PS5 games processed: ${games.length}`);
        return games;

    } catch (error) {
      logger.error('Error fetching PS5 games from IGDB:', error.message);
      throw error;
    }
  }

  /**
   * Transform IGDB game data to our format
   */
  transformIGDBGame(igdbGame) {
    try {
      // Skip games without essential data
      if (!igdbGame.name) {
        return null;
      }

      // Extract publisher
      let publisher = 'Unknown';
      if (igdbGame.publisher && igdbGame.publisher.name) {
        publisher = igdbGame.publisher.name;
      }

      // Extract genres
      let genre = '';
      if (igdbGame.genres && igdbGame.genres.length > 0) {
        genre = igdbGame.genres.map(g => g.name).join(', ');
      }

      // Extract release date
      let releaseDate = null;
      if (igdbGame.first_release_date) {
        // IGDB timestamps are in seconds, convert to milliseconds
        const date = new Date(igdbGame.first_release_date * 1000);
        releaseDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }

      // Extract rating
      let rating = null;
      if (igdbGame.rating) {
        // Convert IGDB rating (0-100) to ESRB-like rating
        rating = this.convertRating(igdbGame.rating);
      }

      // Extract description
      let description = null;
      if (igdbGame.summary) {
        description = this.cleanText(igdbGame.summary);
      }

      return {
        title: this.cleanText(igdbGame.name),
        publisher: this.cleanText(publisher),
        description: description,
        rating: rating,
        releaseDate: releaseDate,
        genre: this.cleanText(genre),
        igdbId: igdbGame.id,
        cover_image_id: igdbGame.cover_image_id || null, // Use the encoded image ID that was already assigned
        artwork_image_id: igdbGame.artwork_image_id || null // Use the encoded image ID that was already assigned
      };

    } catch (error) {
      logger.error(`Error transforming IGDB game ${igdbGame.name}:`, error.message);
      return null;
    }
  }

  /**
   * Convert IGDB rating to ESRB-like rating
   */
  convertRating(igdbRating) {
    // IGDB ratings are typically 0-100
    // This is a simplified conversion - in a real app you'd want more sophisticated logic
    if (igdbRating >= 80) return 'E'; // Everyone
    if (igdbRating >= 60) return 'T'; // Teen
    if (igdbRating >= 40) return 'M'; // Mature
    return 'RP'; // Rating Pending
  }

  /**
   * Clean text by removing extra whitespace and special characters
   */
  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Get a sample of popular PS5 games for testing
   */
  async getSamplePS5Games() {
    try {
      logger.info('Fetching sample of popular PS5 games...');
      
      const token = await this.getAccessToken();
      
      const response = await axios.post(`${this.igdbBaseUrl}/games`, 
        `fields name,first_release_date,genres.name,publisher.name,cover,rating,summary; 
         where platforms = (${platformId}) & rating > 70 & first_release_date != null; 
         sort rating desc; 
         limit 20;`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );

      if (!response.data || response.data.length === 0) {
        logger.warn('No sample PS5 games found');
        return [];
      }

      const games = [];
      for (const igdbGame of response.data) {
        const game = this.transformIGDBGame(igdbGame);
        if (game) {
          games.push(game);
        }
      }

      logger.info(`Successfully fetched ${games.length} sample PS5 games`);
      return games;

    } catch (error) {
      logger.error('Error fetching sample PS5 games:', error.message);
      return [];
    }
  }

  /**
   * Alternative method to get games from a mock API for testing
   */
  async getMockPS5Games() {
    return [
      {
        title: "Spider-Man: Miles Morales",
        publisher: "Sony Interactive Entertainment",
        description: "Action-adventure game featuring Miles Morales as Spider-Man",
        rating: "T",
        releaseDate: "2020-11-12",
        genre: "Action, Adventure"
      },
      {
        title: "Demon's Souls",
        publisher: "Sony Interactive Entertainment",
        description: "Action RPG remake of the classic PlayStation 3 game",
        rating: "M",
        releaseDate: "2020-11-12",
        genre: "Action, RPG"
      },
      {
        title: "Returnal",
        publisher: "Sony Interactive Entertainment",
        description: "Roguelike third-person shooter",
        rating: "T",
        releaseDate: "2021-04-30",
        genre: "Action, Shooter, Roguelike"
      },
      {
        title: "Ratchet & Clank: Rift Apart",
        publisher: "Sony Interactive Entertainment",
        description: "Action-platformer game with interdimensional travel",
        rating: "E10+",
        releaseDate: "2021-06-11",
        genre: "Action, Platformer"
      },
      {
        title: "Ghost of Tsushima Director's Cut",
        publisher: "Sony Interactive Entertainment",
        description: "Open-world action-adventure game set in feudal Japan",
        rating: "M",
        releaseDate: "2021-08-20",
        genre: "Action, Adventure, Open World"
      }
    ];
  }
}

module.exports = new DataScrapingService();