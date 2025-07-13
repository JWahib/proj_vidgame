import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GameDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const game = location.state?.game;

  if (!game) {
    return (
      <div className="container">
        <div className="error">
          Game not found. Please go back and select a game.
        </div>
      </div>
    );
  }

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="game-detail">
      <div className="container">
        <button onClick={handleBackClick} className="back-button">
          ← Back to Games
        </button>
        
        <div className="game-detail-container">
          <div className="game-detail-image-container">
            <img
              src={game.coverImage}
              alt={`${game.title} cover`}
              className="game-detail-image"
              onError={(e) => {
                // Fallback for missing images
                e.target.src = 'https://via.placeholder.com/400x600/2d2d2d/ffffff?text=PS5+Game+Cover';
              }}
            />
          </div>
          
          <div className="game-detail-info">
            <h1>{game.title}</h1>
            <p className="game-detail-date">Released: {game.releaseDate}</p>
            <p className="game-detail-description">{game.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;