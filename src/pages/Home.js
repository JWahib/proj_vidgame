import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import GameCard from '../components/GameCard';
import { getGames } from '../data/games';
import { testBackendConnection } from '../utils/testBackend';

const Home = () => {
  const [games, setGames] = useState([]);
  const [displayedGames, setDisplayedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        
        // Test backend connection
        const backendWorking = await testBackendConnection();
        setBackendStatus(backendWorking ? 'connected' : 'disconnected');
        
        const gamesData = await getGames();
        setGames(gamesData);
        
        // Initial load - show all games sorted alphabetically
        const sortedGames = [...gamesData].sort((a, b) => 
          a.title.localeCompare(b.title)
        );
        setDisplayedGames(sortedGames);
      } catch (err) {
        console.error('Error loading games:', err);
        setError('Failed to load games. Please try again later.');
        setBackendStatus('error');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
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

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <div className="loading">
            <h2>Loading games...</h2>
            <p>Fetching the latest PS5 games from our database</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <div className="container">
          <div className="error">
            <h2>Error Loading Games</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <header className="header">
        <div className="container">
          <h1>PlayStation 5 Games Library</h1>
          <p>Discover and explore the best PS5 games</p>
          {backendStatus === 'connected' && (
            <div className="backend-status connected">
              <span>🟢 Connected to backend database</span>
            </div>
          )}
          {backendStatus === 'disconnected' && (
            <div className="backend-status disconnected">
              <span>🟡 Using fallback data (backend unavailable)</span>
            </div>
          )}
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