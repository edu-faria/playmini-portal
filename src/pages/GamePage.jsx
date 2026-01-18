import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { games } from '../data/gamesData';
import AdSpace from '../components/AdSpace';
import ErrorBoundary from '../components/ErrorBoundary';

// Import your game components
import Game2048 from '../games/2048';
import LastWar from '../games/Last-war';
import Memory from '../games/Memory';
import Minesweeper from '../games/Minesweeper';
import Pacman from '../games/Pacman';
import RailStriker from '../games/Rail-striker';
import Snake from '../games/Snake';
import Sudoku from '../games/Sudoku';
import Tetris from '../games/Tetris';

// Map game IDs to components - use the EXACT id from gamesData.js
const gameComponents = {
  '2048': Game2048,
  'last-war': LastWar,
  'memory': Memory,
  'minesweeper': Minesweeper,
  'pacman': Pacman,
  'rail-striker': RailStriker,
  'snake': Snake,
  'sudoku': Sudoku,
  'tetris': Tetris
};

function GamePage() {
  const { gameId } = useParams();
  const game = games.find(g => g.id === gameId);
  const GameComponent = gameComponents[gameId];

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Game not found</h1>
        <Link to="/" className="text-yellow-400 hover:text-yellow-300">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition"
      >
        ← Back to Games
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl">{game.icon}</span>
              <div>
                <h1 className="text-4xl font-bold">{game.name}</h1>
                <p className="text-gray-300">{game.description}</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg min-h-[400px]">
              {/* Wrap the game component with ErrorBoundary */}
              <ErrorBoundary>
                {GameComponent ? (
                  <GameComponent />
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-center text-gray-400">
                    <div>
                      <div className="text-8xl mb-4">{game.icon}</div>
                      <p className="text-xl">Game coming soon!</p>
                    </div>
                  </div>
                )}
              </ErrorBoundary>
            </div>

            <div className="mt-6 bg-black bg-opacity-30 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-2">How to Play</h3>
              <p className="text-gray-300">
                Game instructions will appear here.
              </p>
            </div>
          </div>
        </div>

        <aside className="lg:w-80 space-y-6">
          <AdSpace type="rectangle" />
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
            <h3 className="text-xl font-bold mb-3">More Games</h3>
            <div className="space-y-2">
              {games.filter(g => g.id !== gameId).slice(0, 3).map(g => (
                <Link
                  key={g.id}
                  to={g.path}
                  className="w-full text-left p-3 bg-white bg-opacity-5 rounded-lg hover:bg-opacity-10 transition block"
                >
                  {g.icon} {g.name}
                </Link>
              ))}
            </div>
          </div>

          <AdSpace type="skyscraper" />
        </aside>
      </div>
    </div>
  );
}

export default GamePage;