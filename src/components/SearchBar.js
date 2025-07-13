import React, { useState, useEffect } from 'react';

const SearchBar = ({ games, onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Filter games based on search term
    const filteredGames = games.filter(game =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    onSearchResults(filteredGames);
    
    // Show suggestions only if there's a search term
    if (searchTerm.trim()) {
      setSuggestions(filteredGames.slice(0, 5)); // Limit to 5 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, games, onSearchResults]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = (game) => {
    setSearchTerm(game.title);
    setShowSuggestions(false);
    onSearchResults([game]);
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Find video game"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((game) => (
            <div
              key={game.id}
              className="search-suggestion"
              onClick={() => handleSuggestionClick(game)}
            >
              {game.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;