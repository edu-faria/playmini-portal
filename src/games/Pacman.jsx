import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Ghost, Circle, Trophy, Zap, Heart } from 'lucide-react';

const CELL_SIZE = 30;
const GRID_WIDTH = 19;
const GRID_HEIGHT = 21;

const DIFFICULTIES = {
  easy: { ghostSpeed: 150, pointMultiplier: 1, lives: 5, powerUpDuration: 8000 },
  medium: { ghostSpeed: 120, pointMultiplier: 1.5, lives: 3, powerUpDuration: 6000 },
  hard: { ghostSpeed: 90, pointMultiplier: 2, lives: 2, powerUpDuration: 4000 },
  insane: { ghostSpeed: 70, pointMultiplier: 3, lives: 1, powerUpDuration: 3000 }
};

// Classic Pacman maze
const createMaze = () => {
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
    [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
    [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
    [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,3,2,1,2,2,2,2,2,5,2,2,2,2,2,1,2,3,1],
    [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];
  return maze;
};

const Pacman = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver, won
  const [maze, setMaze] = useState(createMaze());
  const [pacman, setPacman] = useState({ x: 9, y: 16, dir: 'right', nextDir: 'right' });
  const [ghosts, setGhosts] = useState([
    { x: 9, y: 9, color: '#FF0000', dir: 'left', name: 'Blinky' },
    { x: 8, y: 10, color: '#FFB8FF', dir: 'up', name: 'Pinky' },
    { x: 9, y: 10, color: '#00FFFF', dir: 'up', name: 'Inky' },
    { x: 10, y: 10, color: '#FFB851', dir: 'up', name: 'Clyde' }
  ]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [powerUp, setPowerUp] = useState(false);
  const [time, setTime] = useState(0);
  const [dotsLeft, setDotsLeft] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(true);
  const [scared, setScared] = useState(false);
  
  const gameLoopRef = useRef(null);
  const ghostLoopRef = useRef(null);
  const timerRef = useRef(null);
  const mouthRef = useRef(null);

  // Count initial dots
  useEffect(() => {
    const dots = maze.flat().filter(cell => cell === 2 || cell === 3).length;
    setDotsLeft(dots);
  }, [maze]);

  // Start game
  const startGame = (level) => {
    setDifficulty(level);
    setGameState('playing');
    setMaze(createMaze());
    setPacman({ x: 9, y: 16, dir: 'right', nextDir: 'right' });
    setGhosts([
      { x: 9, y: 9, color: '#FF0000', dir: 'left', name: 'Blinky' },
      { x: 8, y: 10, color: '#FFB8FF', dir: 'up', name: 'Pinky' },
      { x: 9, y: 10, color: '#00FFFF', dir: 'up', name: 'Inky' },
      { x: 10, y: 10, color: '#FFB851', dir: 'up', name: 'Clyde' }
    ]);
    setScore(0);
    setLives(DIFFICULTIES[level].lives);
    setPowerUp(false);
    setTime(0);
    setScared(false);
  };

  // Mouth animation
  useEffect(() => {
    if (gameState === 'playing') {
      mouthRef.current = setInterval(() => {
        setMouthOpen(prev => !prev);
      }, 150);
    }
    return () => clearInterval(mouthRef.current);
  }, [gameState]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      
      const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'w': 'up',
        's': 'down',
        'a': 'left',
        'd': 'right'
      };
      
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        setPacman(prev => ({ ...prev, nextDir: dir }));
      }
      
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Check if move is valid
  const canMove = (x, y) => {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return false;
    const cell = maze[y][x];
    return cell !== 1;
  };

  // Get next position
  const getNextPos = (x, y, dir) => {
    const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = moves[dir];
    let newX = x + dx;
    let newY = y + dy;
    
    // Tunnel wrap
    if (newX < 0) newX = GRID_WIDTH - 1;
    if (newX >= GRID_WIDTH) newX = 0;
    
    return { x: newX, y: newY };
  };

  // Pacman movement
  useEffect(() => {
    if (gameState !== 'playing' || !difficulty) return;
    
    gameLoopRef.current = setInterval(() => {
      setPacman(prev => {
        let { x, y, dir, nextDir } = prev;
        
        // Try to turn
        const nextPos = getNextPos(x, y, nextDir);
        if (canMove(nextPos.x, nextPos.y)) {
          dir = nextDir;
        }
        
        // Move in current direction
        const newPos = getNextPos(x, y, dir);
        if (!canMove(newPos.x, newPos.y)) {
          return prev;
        }
        
        const { x: newX, y: newY } = newPos;
        
        // Check for dots and power pellets
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          const cell = newMaze[newY][newX];
          
          if (cell === 2) {
            newMaze[newY][newX] = 0;
            setScore(s => s + 10 * DIFFICULTIES[difficulty].pointMultiplier);
            setDotsLeft(d => d - 1);
          } else if (cell === 3) {
            newMaze[newY][newX] = 0;
            setScore(s => s + 50 * DIFFICULTIES[difficulty].pointMultiplier);
            setDotsLeft(d => d - 1);
            setPowerUp(true);
            setScared(true);
            setTimeout(() => {
              setPowerUp(false);
              setScared(false);
            }, DIFFICULTIES[difficulty].powerUpDuration);
          }
          
          return newMaze;
        });
        
        return { x: newX, y: newY, dir, nextDir };
      });
    }, 100);
    
    return () => clearInterval(gameLoopRef.current);
  }, [gameState, difficulty, maze]);

  // Ghost AI
  useEffect(() => {
    if (gameState !== 'playing' || !difficulty) return;
    
    ghostLoopRef.current = setInterval(() => {
      setPacman(currentPacman => {
        setGhosts(prevGhosts => {
          return prevGhosts.map(ghost => {
            const directions = ['up', 'down', 'left', 'right'];
            const possibleDirs = directions.filter(dir => {
              const pos = getNextPos(ghost.x, ghost.y, dir);
              return canMove(pos.x, pos.y);
            });
            
            if (possibleDirs.length === 0) return ghost;
            
            let chosenDir;
            if (scared) {
              // Run away from Pacman
              chosenDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
            } else {
              // Chase Pacman
              const distances = possibleDirs.map(dir => {
                const pos = getNextPos(ghost.x, ghost.y, dir);
                return {
                  dir,
                  dist: Math.abs(pos.x - currentPacman.x) + Math.abs(pos.y - currentPacman.y)
                };
              });
              distances.sort((a, b) => a.dist - b.dist);
              chosenDir = distances[0].dir;
            }
            
            const newPos = getNextPos(ghost.x, ghost.y, chosenDir);
            return { ...ghost, x: newPos.x, y: newPos.y, dir: chosenDir };
          });
        });
        return currentPacman;
      });
    }, DIFFICULTIES[difficulty].ghostSpeed);
    
    return () => clearInterval(ghostLoopRef.current);
  }, [gameState, difficulty, scared]);

  // Check collisions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const collision = ghosts.some(ghost => 
      ghost.x === pacman.x && ghost.y === pacman.y
    );
    
    if (collision) {
      if (powerUp) {
        setScore(s => s + 200 * DIFFICULTIES[difficulty].pointMultiplier);
        setGhosts(prevGhosts => 
          prevGhosts.map(g => 
            g.x === pacman.x && g.y === pacman.y 
              ? { ...g, x: 9, y: 9 }
              : g
          )
        );
      } else {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('gameOver');
            setHighScore(prev => Math.max(prev, score));
          } else {
            setPacman({ x: 9, y: 16, dir: 'right', nextDir: 'right' });
            setGhosts([
              { x: 9, y: 9, color: '#FF0000', dir: 'left', name: 'Blinky' },
              { x: 8, y: 10, color: '#FFB8FF', dir: 'up', name: 'Pinky' },
              { x: 9, y: 10, color: '#00FFFF', dir: 'up', name: 'Inky' },
              { x: 10, y: 10, color: '#FFB851', dir: 'up', name: 'Clyde' }
            ]);
          }
          return newLives;
        });
      }
    }
  }, [pacman, ghosts, gameState, powerUp, score, difficulty]);

  // Check win
  useEffect(() => {
    if (dotsLeft === 0 && gameState === 'playing') {
      setGameState('won');
      setHighScore(prev => Math.max(prev, score));
    }
  }, [dotsLeft, gameState, score]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPacmanRotation = () => {
    const rotations = { right: 0, down: 90, left: 180, up: 270 };
    return rotations[pacman.dir] || 0;
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-4 border-yellow-400 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-7xl font-bold mb-4 text-yellow-400 tracking-wider" style={{ textShadow: '4px 4px 0px #000, 8px 8px 20px rgba(255,193,7,0.5)' }}>
              PAC-MAN
            </h1>
            <div className="flex justify-center gap-4 text-4xl mb-4">
              <span className="animate-bounce">👻</span>
              <span className="text-yellow-400 text-5xl">●</span>
              <span className="animate-bounce delay-100">👻</span>
              <span className="text-yellow-400 text-5xl">●</span>
              <span className="animate-bounce delay-200">👻</span>
            </div>
            <p className="text-yellow-300 text-lg">Choose Your Destiny</p>
          </div>
          
          <div className="space-y-4 mb-6">
            {Object.entries(DIFFICULTIES).map(([level, config]) => (
              <button
                key={level}
                onClick={() => startGame(level)}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 border-yellow-300 flex justify-between items-center"
              >
                <span className="text-2xl uppercase">{level}</span>
                <div className="flex gap-1">
                  {[...Array(config.lives)].map((_, i) => (
                    <Heart key={i} size={20} fill="red" stroke="red" />
                  ))}
                </div>
              </button>
            ))}
          </div>
          
          {highScore > 0 && (
            <div className="text-center bg-yellow-400/20 rounded-xl p-4 border-2 border-yellow-400">
              <Trophy className="inline-block mb-2 text-yellow-400" size={32} />
              <p className="text-yellow-300 text-sm">HIGH SCORE</p>
              <p className="text-yellow-400 text-3xl font-bold">{highScore}</p>
            </div>
          )}
          
          <div className="mt-6 text-yellow-300 text-center text-sm">
            <p>🎮 Arrow Keys or WASD to move</p>
            <p>SPACE/ESC to pause</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver' || gameState === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border-4 border-yellow-400 text-center">
          <h2 className="text-6xl font-bold mb-4 text-yellow-400">
            {gameState === 'won' ? '🎉 YOU WON! 🎉' : '💀 GAME OVER 💀'}
          </h2>
          <div className="bg-yellow-400/20 rounded-xl p-6 mb-6 border-2 border-yellow-400">
            <p className="text-yellow-300 text-lg mb-2">FINAL SCORE</p>
            <p className="text-yellow-400 text-5xl font-bold mb-4">{score}</p>
            <p className="text-yellow-300">Time: {formatTime(time)}</p>
            {score > highScore && (
              <p className="text-green-400 text-xl mt-2 animate-pulse">🏆 NEW HIGH SCORE! 🏆</p>
            )}
          </div>
          <button
            onClick={() => setGameState('menu')}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 text-xl"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'paused') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border-4 border-yellow-400 text-center">
          <h2 className="text-6xl font-bold mb-8 text-yellow-400">⏸️ PAUSED</h2>
          <div className="space-y-4">
            <button
              onClick={() => setGameState('playing')}
              className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 text-xl"
            >
              ▶️ RESUME
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 text-xl"
            >
              🏠 MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border-4 border-yellow-400">
        {/* HUD */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="text-yellow-400 font-bold">
            <div className="text-sm text-yellow-300">SCORE</div>
            <div className="text-3xl">{score}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-yellow-300">LEVEL</div>
            <div className="text-2xl text-yellow-400 uppercase">{difficulty}</div>
          </div>
          
          <div className="text-yellow-400 font-bold text-right">
            <div className="text-sm text-yellow-300">TIME</div>
            <div className="text-3xl">{formatTime(time)}</div>
          </div>
        </div>
        
        {/* Lives & Power Up */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex gap-2">
            {[...Array(lives)].map((_, i) => (
              <Heart key={i} size={24} fill="#ff0000" stroke="#ff0000" className="animate-pulse" />
            ))}
          </div>
          
          {powerUp && (
            <div className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold flex items-center gap-2 animate-pulse">
              <Zap size={16} fill="currentColor" />
              POWER UP!
            </div>
          )}
          
          <div className="text-yellow-300 text-sm">
            Dots: {dotsLeft}
          </div>
        </div>
        
        {/* Game Board */}
        <div 
          className="relative bg-black rounded-xl overflow-hidden border-4 border-blue-900"
          style={{ 
            width: GRID_WIDTH * CELL_SIZE,
            height: GRID_HEIGHT * CELL_SIZE 
          }}
        >
          {/* Maze */}
          {maze.map((row, y) => 
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                style={{
                  position: 'absolute',
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE
                }}
              >
                {cell === 1 && (
                  <div className="w-full h-full bg-blue-700 border border-blue-500" />
                )}
                {cell === 2 && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full" />
                  </div>
                )}
                {cell === 3 && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-yellow-300 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Pacman */}
          <div
            style={{
              position: 'absolute',
              left: pacman.x * CELL_SIZE + CELL_SIZE / 2,
              top: pacman.y * CELL_SIZE + CELL_SIZE / 2,
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              transform: `translate(-50%, -50%) rotate(${getPacmanRotation()}deg)`,
              transition: 'left 0.1s linear, top 0.1s linear'
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="2"
              />
              {mouthOpen && (
                <path
                  d="M 50 50 L 85 25 A 45 45 0 0 1 85 75 Z"
                  fill="#000"
                />
              )}
              <circle cx="65" cy="35" r="5" fill="#000" />
            </svg>
          </div>
          
          {/* Ghosts */}
          {ghosts.map((ghost, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: ghost.x * CELL_SIZE + CELL_SIZE / 2,
                top: ghost.y * CELL_SIZE + CELL_SIZE / 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                transform: 'translate(-50%, -50%)',
                transition: 'left 0.1s linear, top 0.1s linear'
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  d="M 10 50 Q 10 10 50 10 Q 90 10 90 50 L 90 90 L 80 80 L 70 90 L 60 80 L 50 90 L 40 80 L 30 90 L 20 80 L 10 90 Z"
                  fill={scared ? '#0000FF' : ghost.color}
                  stroke={scared ? '#FFF' : '#000'}
                  strokeWidth="2"
                />
                {scared ? (
                  <>
                    <circle cx="35" cy="40" r="6" fill="#FFF" />
                    <circle cx="65" cy="40" r="6" fill="#FFF" />
                    <path d="M 30 60 Q 50 70 70 60" stroke="#FFF" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <ellipse cx="35" cy="40" rx="8" ry="10" fill="#FFF" />
                    <ellipse cx="65" cy="40" rx="8" ry="10" fill="#FFF" />
                    <circle cx="35" cy="42" r="4" fill="#000" />
                    <circle cx="65" cy="42" r="4" fill="#000" />
                  </>
                )}
              </svg>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setGameState('paused')}
          className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-all"
        >
          ⏸️ PAUSE
        </button>
      </div>
    </div>
  );
};

export default Pacman;