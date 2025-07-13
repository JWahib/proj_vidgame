import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import GameCard from '../components/GameCard';
import games from '../data/games';

const Home = () => {
  const [displayedGames, setDisplayedGames] = useState([]);

  useEffect(() => {
    // Initial load - show all games sorted alphabetically
    const sortedGames = [...games].sort((a, b) => 
      a.title.localeCompare(b.title)
    );
    setDisplayedGames(sortedGames);
  }, []);

  const handleSearchResults = (results) => {
    if (results.length === 0 && displayedGames.length === games.length) {
      // If no results and currently showing all games, keep showing all
      return;
    }
    
    // Sort results alphabetically
    const sortedResults = [...results].sort((a, b) => 
      a.title.localeCompare(b.title)
    );
    setDisplayedGames(sortedResults);
  };

  return (
    <div className="home">
      <header className="header">
        <div className="container">
          <h1>PlayStation 5 Games Library</h1>
          <p>Discover and explore the best PS5 games</p>
        </div>
      </header>

      <div className="container">
        <SearchBar games={games} onSearchResults={handleSearchResults} />
        
        <section className="games-section">
          <h2>Games ({displayedGames.length})</h2>
          <div className="games-grid">
            {displayedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;