const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

class DataScrapingService {
  constructor() {
    this.wikipediaUrl = 'https://en.wikipedia.org/wiki/List_of_PlayStation_5_games';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async scrapePS5Games() {
    try {
      logger.info('Starting to scrape PS5 games from Wikipedia...');
      
      const response = await axios.get(this.wikipediaUrl, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      const games = [];
      
      // Find the main games table (usually the first sortable table)
      const gamesTables = $('table.wikitable.sortable');
      
      if (gamesTables.length === 0) {
        logger.warn('No games table found on Wikipedia page');
        return [];
      }
      
      // Process each table that might contain games
      gamesTables.each((tableIndex, table) => {
        const $table = $(table);
        const headers = [];
        
        // Get headers to understand table structure
        $table.find('thead tr th, tbody tr:first-child th').each((i, header) => {
          headers.push($(header).text().trim().toLowerCase());
        });
        
        // Find relevant column indices
        const titleIndex = this.findColumnIndex(headers, ['title', 'game']);
        const publisherIndex = this.findColumnIndex(headers, ['publisher', 'developer']);
        const genreIndex = this.findColumnIndex(headers, ['genre', 'genres']);
        const releaseDateIndex = this.findColumnIndex(headers, ['release date', 'release', 'date']);
        
        if (titleIndex === -1) {
          logger.warn(`No title column found in table ${tableIndex}`);
          return;
        }
        
        // Process table rows
        $table.find('tbody tr').each((rowIndex, row) => {
          const $row = $(row);
          const cells = $row.find('td');
          
          if (cells.length === 0) return;
          
          const title = this.cleanText($(cells[titleIndex]).text());
          
          // Skip if no title or if it's a header row
          if (!title || title.length < 2) return;
          
          const publisher = publisherIndex !== -1 ? 
            this.cleanText($(cells[publisherIndex]).text()) : 'Unknown';
          
          const genre = genreIndex !== -1 ? 
            this.cleanText($(cells[genreIndex]).text()) : '';
          
          const releaseDate = releaseDateIndex !== -1 ? 
            this.parseDate($(cells[releaseDateIndex]).text()) : null;
          
          // Create game object
          const game = {
            title: title,
            publisher: publisher || 'Unknown',
            description: null, // Will be filled in later versions
            rating: null, // Will be filled in later versions
            releaseDate: releaseDate,
            genre: genre || ''
          };
          
          // Add to games array if not already present
          if (!games.find(g => g.title === game.title && g.publisher === game.publisher)) {
            games.push(game);
          }
        });
      });
      
      logger.info(`Successfully scraped ${games.length} PS5 games from Wikipedia`);
      return games;
      
    } catch (error) {
      logger.error('Error scraping PS5 games:', error);
      throw error;
    }
  }

  findColumnIndex(headers, possibleNames) {
    for (let i = 0; i < headers.length; i++) {
      for (const name of possibleNames) {
        if (headers[i].includes(name)) {
          return i;
        }
      }
    }
    return -1;
  }

  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/\[[^\]]*\]/g, '') // Remove reference links [1], [2], etc.
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  parseDate(dateString) {
    if (!dateString) return null;
    
    const cleaned = this.cleanText(dateString);
    
    // Try different date formats
    const dateFormats = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{1,2})\s+(\w+)\s+(\d{4})/, // DD Month YYYY
      /(\w+)\s+(\d{1,2}),?\s+(\d{4})/, // Month DD, YYYY
      /(\d{4})/ // Just year
    ];
    
    for (const format of dateFormats) {
      const match = cleaned.match(format);
      if (match) {
        try {
          let date;
          if (format.toString().includes('(\\d{4})$')) {
            // Just year
            date = new Date(`${match[1]}-01-01`);
          } else if (format.toString().includes('(\\w+)')) {
            // Month name format
            date = new Date(cleaned);
          } else {
            // Other formats
            date = new Date(cleaned);
          }
          
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    return null;
  }

  // Alternative method to get games from a mock API for testing
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