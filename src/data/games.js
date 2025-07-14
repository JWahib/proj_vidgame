// Fallback hardcoded games data
const fallbackGames = [
  {
    id: 1,
    title: "Astro's Playroom",
    releaseDate: "November 12, 2020",
    thumbnail: "/assets/images/thumbnails/astros-playroom.jpg",
    coverImage: "/assets/images/covers/astros-playroom-cover.jpg",
    description: "Astro's Playroom is a 3D platformer included with every PlayStation 5 console. Join Astro in a fun adventure that showcases the innovative features of the PS5's DualSense wireless controller. The game is a love letter to all things PlayStation, featuring references to beloved games and characters from the console's history."
  },
  {
    id: 2,
    title: "Demon's Souls",
    releaseDate: "November 12, 2020",
    thumbnail: "/assets/images/thumbnails/demons-souls.jpg",
    coverImage: "/assets/images/covers/demons-souls-cover.jpg",
    description: "Demon's Souls is a remake of the classic action RPG that defined a genre. Experience the ruthless combat and atmospheric world of Boletaria with stunning visuals and enhanced gameplay. Face challenging enemies and bosses in this dark fantasy adventure that rewards skill and perseverance."
  },
  {
    id: 3,
    title: "Final Fantasy VII Rebirth",
    releaseDate: "February 29, 2024",
    thumbnail: "/assets/images/thumbnails/ff7-rebirth.jpg",
    coverImage: "/assets/images/covers/ff7-rebirth-cover.jpg",
    description: "Final Fantasy VII Rebirth is the highly anticipated second installment in the Final Fantasy VII Remake project. Follow Cloud, Tifa, Aerith, and the rest of the party as they venture beyond Midgar to explore the vast world. Experience an epic story with modern gameplay mechanics and stunning visuals."
  },
  {
    id: 4,
    title: "God of War Ragnarök",
    releaseDate: "November 9, 2022",
    thumbnail: "/assets/images/thumbnails/god-of-war-ragnarok.jpg",
    coverImage: "/assets/images/covers/god-of-war-ragnarok-cover.jpg",
    description: "God of War Ragnarök is the epic conclusion to the Norse saga. Join Kratos and Atreus as they face the end of the world in this action-adventure masterpiece. Experience visceral combat, emotional storytelling, and breathtaking visuals as father and son confront their destinies in the twilight of the gods."
  },
  {
    id: 5,
    title: "Gran Turismo 7",
    releaseDate: "March 4, 2022",
    thumbnail: "/assets/images/thumbnails/gran-turismo-7.jpg",
    coverImage: "/assets/images/covers/gran-turismo-7-cover.jpg",
    description: "Gran Turismo 7 brings together the very best features of the Real Driving Simulator. Whether you're a competitive racer, collector, fine-tuning specialist, livery designer, or photographer, discover your authentic racing line with features inspired by the past, present, and future of Gran Turismo."
  },
  {
    id: 6,
    title: "Horizon Forbidden West",
    releaseDate: "February 18, 2022",
    thumbnail: "/assets/images/thumbnails/horizon-forbidden-west.jpg",
    coverImage: "/assets/images/covers/horizon-forbidden-west-cover.jpg",
    description: "Horizon Forbidden West continues Aloy's story as she ventures into the mysterious frontier known as the Forbidden West. Face new mechanical creatures and explore diverse environments from lush forests to dry deserts. Uncover the secrets of the ancient world while fighting for the future of life on Earth."
  },
  {
    id: 7,
    title: "Marvel's Spider-Man: Miles Morales",
    releaseDate: "November 12, 2020",
    thumbnail: "/assets/images/thumbnails/spiderman-miles-morales.jpg",
    coverImage: "/assets/images/covers/spiderman-miles-morales-cover.jpg",
    description: "Marvel's Spider-Man: Miles Morales is an action-adventure game featuring the rise of Miles Morales as he masters new powers to become his own Spider-Man. Experience a new chapter in the Spider-Man universe with unique bio-electric abilities and discover what it means to be a hero."
  },
  {
    id: 8,
    title: "Ratchet & Clank: Rift Apart",
    releaseDate: "June 11, 2021",
    thumbnail: "/assets/images/thumbnails/ratchet-clank-rift-apart.jpg",
    coverImage: "/assets/images/covers/ratchet-clank-rift-apart-cover.jpg",
    description: "Ratchet & Clank: Rift Apart is a brand-new full-length adventure that showcases the power of the PlayStation 5. Experience the evolution of the series with stunning visuals, innovative gameplay mechanics, and dimensional rifts that allow for near-instantaneous travel between worlds."
  },
  {
    id: 9,
    title: "Returnal",
    releaseDate: "April 30, 2021",
    thumbnail: "/assets/images/thumbnails/returnal.jpg",
    coverImage: "/assets/images/covers/returnal-cover.jpg",
    description: "Returnal is a third-person shooter that combines intense combat with a mysterious narrative. Play as Selene, a space pilot trapped in a time loop on an alien planet. Each cycle brings new challenges and revelations in this psychological horror experience with roguelike elements."
  },
  {
    id: 10,
    title: "The Last of Us Part I",
    releaseDate: "September 2, 2022",
    thumbnail: "/assets/images/thumbnails/the-last-of-us-part-1.jpg",
    coverImage: "/assets/images/covers/the-last-of-us-part-1-cover.jpg",
    description: "The Last of Us Part I is a remake of the critically acclaimed original game. Experience the emotional journey of Joel and Ellie in a post-apocalyptic world with completely rebuilt visuals, enhanced gameplay mechanics, and improved accessibility features that make this masterpiece accessible to more players."
  }
];

// Backend API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Fetch games from backend API
 */
async function fetchGamesFromBackend() {
  try {
    console.log('Fetching games from backend API...');
    
    const response = await fetch(`${API_BASE_URL}/games`);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from backend API');
    }
    
    console.log(`Successfully fetched ${result.data.length} games from backend`);
    console.log(result.data[0].coverImage);

    console.log(result.data[2]);
    
    // Transform backend data to match frontend format
    return result.data.map((game, index) => ({
      id: index + 1,
      title: game.title,
      releaseDate: game.release_date ? new Date(game.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'TBA',
      thumbnail: game.artwork_image_id ? `https://images.igdb.com/igdb/image/upload/t_thumb/${game.artwork_image_id}.jpg` : 
                game.cover_image_id ? `https://images.igdb.com/igdb/image/upload/t_thumb/${game.cover_image_id}.jpg` : 
                `/assets/images/thumbnails/placeholder-thumbnail.jpg`,
      coverImage: game.artwork_image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.artwork_image_id}.jpg` : 
                game.cover_image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover_image_id}.jpg` : 
                `/assets/images/covers/placeholder-cover.jpg`,
      description: game.description || `Experience ${game.title}, a PlayStation 5 game published by ${game.publisher}.`,
      publisher: game.publisher,
      genre: game.genre,
      rating: game.rating
    }));
    
  } catch (error) {
    console.warn('Failed to fetch games from backend, using fallback data:', error.message);
    return null;
  }
}

/**
 * Get games - tries backend first, falls back to hardcoded data
 */
async function getGames() {
  const backendGames = await fetchGamesFromBackend();
  
  if (backendGames && backendGames.length > 0) {
    return backendGames;
  }
  
  console.log('Using fallback games data');
  return fallbackGames;
}

// For backward compatibility, export the fallback games as default
// Components can use this for immediate access, or call getGames() for fresh data
const games = fallbackGames;

export { getGames };
export default games;