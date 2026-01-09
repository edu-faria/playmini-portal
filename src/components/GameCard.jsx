import React from 'react';
import { Link } from 'react-router-dom';

function GameCard({ game }) {
  return (
    <Link
      to={game.path}
      className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition transform hover:scale-105 border border-white border-opacity-20 block"
    >
      <div className="text-6xl mb-4">{game.icon}</div>
      <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
      <p className="text-gray-300">{game.description}</p>
      <div className="mt-4 text-yellow-400 font-semibold">
        Play Now →
      </div>
    </Link>
  );
}

export default GameCard;