import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameCard = ({ game }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to game detail page using the game title as URL parameter
    const urlTitle = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    navigate(`/${urlTitle}`, { state: { game } });
  };

  return (
    <div className="game-card" onClick={handleCardClick}>
      <img
        src={game.thumbnail}
        alt={game.title}
        className="game-card-image"
        onError={(e) => {
          // Fallback for missing images
          e.target.src = '/assets/images/placeholder-thumbnail.svg';
        }}
      />
      <div className="game-card-content">
        <h3 className="game-card-title">{game.title}</h3>
        <p className="game-card-date">{game.releaseDate}</p>
      </div>
    </div>
  );
};

export default GameCard;