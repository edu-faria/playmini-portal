import React from 'react';
import GameCard from '../components/GameCard';
import AdSpace from '../components/AdSpace';
import { games } from '../data/gamesData';

function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
          Welcome to PlayMini.io
        </h1>
        <p className="text-xl text-gray-300">
          Play fun mini games directly in your browser - no downloads needed!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      <div className="mt-12 hidden lg:block">
        <AdSpace type="rectangle" />
      </div>
    </div>
  );
}

export default HomePage;