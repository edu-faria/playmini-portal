import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RotateCcw, Timer, Zap } from 'lucide-react';

const GRID_SIZES = {
  easy: 3,
  medium: 4,
  hard: 5
};

const getDisplayValue = (value) => {
  return value > 0 ? Math.pow(2, value) : '';
};

const Game2048 = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moves, setMoves] = useState(0);

  const gridSize = GRID_SIZES[difficulty];

  useEffect(() => {
    const saved = localStorage.getItem('2048-best-score');
    if (saved) setBestScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  useEffect(() => {
    let interval;
    if (isPlaying && !gameOver && !won) {
      interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, won]);

  const initializeGrid = useCallback(() => {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setTime(0);
    setIsPlaying(true);
    setMoves(0);
  }, [gridSize]);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const addRandomTile = (currentGrid) => {
    const emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (currentGrid[i][j] === 0) {
          emptyCells.push({ x: i, y: j });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentGrid[x][y] = Math.random() < 0.9 ? 1 : 2;
    }
  };

  const moveLeft = (currentGrid) => {
    let moved = false;
    let newScore = 0;
    const newGrid = currentGrid.map(row => {
      const filtered = row.filter(cell => cell !== 0);
      const merged = [];
      let i = 0;
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] + 1);
          newScore += Math.pow(2, filtered[i] + 1);
          i += 2;
          moved = true;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }
      const newRow = [...merged, ...Array(gridSize - merged.length).fill(0)];
      if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true;
      return newRow;
    });
    return { grid: newGrid, moved, score: newScore };
  };

  const rotateGridClockwise = (currentGrid) => {
    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
      newGrid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        newGrid[i][j] = currentGrid[gridSize - 1 - j][i];
      }
    }
    return newGrid;
  };

  const rotateGridCounterClockwise = (currentGrid) => {
    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
      newGrid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        newGrid[i][j] = currentGrid[j][gridSize - 1 - i];
      }
    }
    return newGrid;
  };

  const move = (direction) => {
    if (gameOver || won) return;

    let currentGrid = grid.map(row => [...row]);

    // Apply transformations based on direction
    if (direction === 'right') {
      currentGrid = currentGrid.map(row => row.reverse());
    } else if (direction === 'down') {
      currentGrid = rotateGridClockwise(currentGrid);
    } else if (direction === 'up') {
      currentGrid = rotateGridCounterClockwise(currentGrid);
    }

    const { grid: movedGrid, moved, score: addScore } = moveLeft(currentGrid);
    
    let finalGrid = movedGrid;
    
    // Reverse transformations
    if (direction === 'right') {
      finalGrid = finalGrid.map(row => row.reverse());
    } else if (direction === 'down') {
      finalGrid = rotateGridCounterClockwise(finalGrid);
    } else if (direction === 'up') {
      finalGrid = rotateGridClockwise(finalGrid);
    }

    if (moved) {
      addRandomTile(finalGrid);
      setGrid(finalGrid);
      setScore(s => s + addScore);
      setMoves(m => m + 1);

      const hasWon = finalGrid.some(row => row.some(cell => cell >= 11));
      if (hasWon && !won) {
        setWon(true);
        setIsPlaying(false);
      }

      if (!canMove(finalGrid)) {
        setGameOver(true);
        setIsPlaying(false);
      }
    }
  };

  const canMove = (currentGrid) => {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (currentGrid[i][j] === 0) return true;
        if (j < gridSize - 1 && currentGrid[i][j] === currentGrid[i][j + 1]) return true;
        if (i < gridSize - 1 && currentGrid[i][j] === currentGrid[i + 1][j]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase();
        move(direction);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, gameOver, won]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTileColor = (value) => {
    const colors = [
      'bg-gray-200',
      'bg-pink-200',
      'bg-pink-300',
      'bg-orange-300',
      'bg-yellow-300',
      'bg-lime-300',
      'bg-green-400',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500',
      'bg-red-600',
      'bg-amber-600'
    ];
    return colors[value] || 'bg-gradient-to-br from-purple-600 to-pink-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
              2048 🎮
            </h1>
            <p className="text-gray-600 mb-2">Merge tiles to reach 2048!</p>
          </div>

          <div className="mb-6 flex justify-center gap-2">
            {['easy', 'medium', 'hard'].map(level => (
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  setTimeout(() => initializeGrid(), 0);
                }}
                className={`px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 ${
                  difficulty === level
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={18} />
                <div className="text-xs font-semibold opacity-90">SCORE</div>
              </div>
              <div className="text-2xl font-black">{score}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={18} />
                <div className="text-xs font-semibold opacity-90">BEST</div>
              </div>
              <div className="text-2xl font-black">{bestScore}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Timer size={18} />
                <div className="text-xs font-semibold opacity-90">TIME</div>
              </div>
              <div className="text-2xl font-black">{formatTime(time)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 text-white">
              <div className="text-xs font-semibold opacity-90 mb-1">MOVES</div>
              <div className="text-2xl font-black">{moves}</div>
            </div>
          </div>

          <div 
            className="bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-2xl p-4 mb-6 mx-auto"
            style={{ 
              width: 'fit-content',
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gap: '12px'
            }}
          >
            {grid.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`${getTileColor(cell)} rounded-xl flex items-center justify-center font-black text-white shadow-lg transition-all duration-200 transform hover:scale-105`}
                  style={{
                    width: gridSize === 3 ? '90px' : gridSize === 4 ? '80px' : '65px',
                    height: gridSize === 3 ? '90px' : gridSize === 4 ? '80px' : '65px',
                    fontSize: gridSize === 3 ? '28px' : gridSize === 4 ? '24px' : '20px'
                  }}
                >
                  {getDisplayValue(cell)}
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3 justify-center mb-4">
            <button
              onClick={initializeGrid}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
            >
              <RotateCcw size={20} />
              New Game
            </button>
          </div>

          <div className="text-center text-gray-600 text-sm">
            Use arrow keys or swipe to play
          </div>

          {(gameOver || won) && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl transform scale-100 animate-bounce-in">
                <div className="text-6xl mb-4">{won ? '🎉' : '😢'}</div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                  {won ? 'You Won!' : 'Game Over!'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {won ? 'Congratulations! You reached 2048!' : 'No more moves available!'}
                </p>
                <div className="bg-gray-100 rounded-2xl p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-black text-purple-600">{score}</div>
                      <div className="text-xs text-gray-600">Final Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-pink-600">{formatTime(time)}</div>
                      <div className="text-xs text-gray-600">Time</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={initializeGrid}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game2048;