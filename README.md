# PlayStation 5 Games Library

A modern React frontend for browsing and discovering PlayStation 5 games, featuring a dark theme, search functionality, and detailed game information.

## Features

- **Dark Theme**: Modern, eye-friendly dark interface
- **Search Functionality**: Search through games with real-time suggestions
- **Game Grid**: Alphabetically sorted games with thumbnails
- **Game Details**: Detailed view with cover images, release dates, and descriptions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Hover Effects**: Interactive elements with smooth transitions
- **Routing**: Clean URLs for game details (e.g., `/god-of-war-ragnarok`)

## Technology Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **CSS3**: Custom styling with CSS variables and Grid/Flexbox
- **Responsive Design**: Mobile-first approach

## Project Structure

```
ps5-games-frontend/
├── public/
│   ├── assets/
│   │   └── images/
│   │       ├── thumbnails/     # Game thumbnail images
│   │       ├── covers/         # Game cover images
│   │       ├── placeholder-thumbnail.svg
│   │       └── placeholder-cover.svg
│   └── index.html
├── src/
│   ├── components/
│   │   ├── GameCard.js         # Individual game card component
│   │   └── SearchBar.js        # Search functionality component
│   ├── data/
│   │   └── games.js           # Game data structure
│   ├── pages/
│   │   ├── Home.js            # Main page with game grid
│   │   └── GameDetail.js      # Individual game details page
│   ├── App.js                 # Main app component with routing
│   ├── App.css                # Main stylesheet
│   └── index.js               # React entry point
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Game Data Structure

Each game in the data structure contains:

```javascript
{
  id: number,
  title: string,
  releaseDate: string,
  thumbnail: string,        // Path to thumbnail image
  coverImage: string,       // Path to cover image
  description: string       // Game description
}
```

## Backend Integration

The frontend is prepared for backend integration with the following considerations:

### Search API
- The SearchBar component includes placeholder code for backend search calls
- Expects a search endpoint that returns filtered games based on substring matches
- Currently uses client-side filtering for demonstration

### Game Data API
- Game data is currently stored in `src/data/games.js`
- Can be easily replaced with API calls to fetch game information
- Structured to match common game database APIs

### Image Storage
- Images are currently stored in `public/assets/images/`
- Can be easily configured to use CDN or external image services
- Includes local SVG placeholder images for missing assets
- Placeholder images match the dark theme and are optimized for performance

## Features in Detail

### Search Functionality
- Real-time search with dropdown suggestions
- Substring matching across game titles
- Keyboard navigation support
- Clean URL updates

### Game Grid
- Responsive grid layout
- Hover effects with smooth transitions
- Alphabetical sorting
- Loading states and error handling

### Game Details
- Clean URL routing (`/game-title`)
- Large cover image display
- Game information including release date and description
- Back navigation to main grid

### Dark Theme
- CSS custom properties for consistent theming
- High contrast for accessibility
- Smooth transitions and hover effects
- Mobile-optimized interface

## Customization

### Adding New Games
1. Add game data to `src/data/games.js`
2. Add corresponding images to `public/assets/images/thumbnails/` and `public/assets/images/covers/`
3. Images will automatically be displayed in the grid and detail views

### Styling
- Modify CSS variables in `src/App.css` to change theme colors
- Responsive breakpoints can be adjusted in the media queries
- Component-specific styles are organized by feature

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Future Enhancements

- User authentication
- Game ratings and reviews
- Wishlist functionality
- Advanced filtering options
- Game comparison features
- Social sharing
- PWA capabilities

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 