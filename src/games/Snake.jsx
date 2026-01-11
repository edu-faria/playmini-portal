import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const DIFFICULTIES = {
  easy: { speed: 150, label: 'Easy 🐌', scoreMultiplier: 1 },
  medium: { speed: 100, label: 'Medium 🐍', scoreMultiplier: 2 },
  hard: { speed: 60, label: 'Hard 🚀', scoreMultiplier: 3 },
  insane: { speed: 40, label: 'Insane 💀', scoreMultiplier: 5 }
};

const FOOD_EMOJIS = ['🍎', '🍇', '🍊', '🍋', '🍌', '🍉', '🍓', '🥝', '🍑', '🥭'];

export default function Snake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [foodEmoji, setFoodEmoji] = useState('🍎');
  
  const directionRef = useRef(direction);
  const gameLoopRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    setFood(newFood);
    setFoodEmoji(FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)]);
  }, [snake]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setTimer(0);
    setGameOver(false);
    setIsPaused(false);
    generateFood();
  }, [generateFood]);

  const startGame = useCallback(() => {
    resetGame();
    setGameStarted(true);
  }, [resetGame]);

  const togglePause = useCallback(() => {
    if (!gameOver && gameStarted) {
      setIsPaused(prev => !prev);
    }
  }, [gameOver, gameStarted]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted) {
        if (e.key === 'Enter') startGame();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (isPaused || gameOver) return;

      const newDirection = { ...directionRef.current };
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current.y === 0) {
            newDirection.x = 0;
            newDirection.y = -1;
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current.y === 0) {
            newDirection.x = 0;
            newDirection.y = 1;
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current.x === 0) {
            newDirection.x = -1;
            newDirection.y = 0;
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current.x === 0) {
            newDirection.x = 1;
            newDirection.y = 0;
          }
          break;
        default:
          return;
      }
      
      setDirection(newDirection);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, isPaused, startGame, togglePause]);

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const newHead = {
          x: prevSnake[0].x + directionRef.current.x,
          y: prevSnake[0].y + directionRef.current.y
        };

        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          setHighScore(prev => Math.max(prev, score));
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(prev => prev + (10 * DIFFICULTIES[difficulty].scoreMultiplier));
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, DIFFICULTIES[difficulty].speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, isPaused, food, score, difficulty, generateFood]);

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
              🐍 Snake Game 🐍
            </h1>
            <p className="text-purple-200 text-sm">Use Arrow Keys or WASD to move • Space to Pause</p>
          </div>

          {!gameStarted && (
            <div className="mb-6 space-y-4">
              <div className="text-center">
                <label className="text-white text-lg font-semibold mb-3 block">Select Difficulty</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(DIFFICULTIES).map(([key, { label }]) => (
                    <button
                      key={key}
                      onClick={() => setDifficulty(key)}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                        difficulty === key
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-center shadow-lg">
              <div className="text-white text-sm font-semibold mb-1">Score</div>
              <div className="text-white text-2xl font-bold">{score}</div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-cyan-500 rounded-xl p-4 text-center shadow-lg">
              <div className="text-white text-sm font-semibold mb-1">High Score</div>
              <div className="text-white text-2xl font-bold">{highScore}</div>
            </div>
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl p-4 text-center shadow-lg">
              <div className="text-white text-sm font-semibold mb-1">Time</div>
              <div className="text-white text-2xl font-bold">{formatTime(timer)}</div>
            </div>
          </div>

          <div className="relative mb-6">
            <div 
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl mx-auto border-4 border-purple-500/50"
              style={{ 
                width: GRID_SIZE * CELL_SIZE, 
                height: GRID_SIZE * CELL_SIZE,
                position: 'relative',
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(147, 51, 234, 0.1) 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }}
            >
              {snake.map((segment, index) => (
                <div
                  key={index}
                  className={`absolute transition-all duration-100 ${
                    index === 0 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/50' 
                      : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md shadow-blue-500/30'
                  } rounded-md`}
                  style={{
                    left: segment.x * CELL_SIZE,
                    top: segment.y * CELL_SIZE,
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                    border: '2px solid rgba(255,255,255,0.4)'
                  }}
                >
                  {index === 0 && (
                    <div className="text-xs text-center leading-none pt-0.5 text-white font-bold">
                      {direction.x === 1 ? '▶' : direction.x === -1 ? '◀' : direction.y === 1 ? '▼' : '▲'}
                    </div>
                  )}
                </div>
              ))}
              
              <div
                className="absolute text-2xl flex items-center justify-center animate-pulse"
                style={{
                  left: food.x * CELL_SIZE,
                  top: food.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE
                }}
              >
                {foodEmoji}
              </div>

              {isPaused && gameStarted && !gameOver && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⏸️</div>
                    <div className="text-white text-3xl font-bold mb-2">Paused</div>
                    <div className="text-white/80">Press Space to Resume</div>
                  </div>
                </div>
              )}

              {gameOver && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💀</div>
                    <div className="text-white text-3xl font-bold mb-2">Game Over!</div>
                    <div className="text-white/80 mb-4">Final Score: {score}</div>
                    <button
                      onClick={startGame}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}

              {!gameStarted && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎮</div>
                    <div className="text-white text-3xl font-bold mb-4">Ready to Play?</div>
                    <button
                      onClick={startGame}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg animate-pulse"
                    >
                      Start Game
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {gameStarted && !gameOver && (
            <div className="flex justify-center gap-4">
              <button
                onClick={togglePause}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={() => {
                  setGameStarted(false);
                  resetGame();
                }}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                🔄 New Game
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <div className="inline-block bg-white/10 rounded-xl px-4 py-2">
              <span className="text-white/80 text-sm">
                Length: <span className="font-bold text-white">{snake.length}</span> • 
                Difficulty: <span className="font-bold text-white">{DIFFICULTIES[difficulty].label}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}