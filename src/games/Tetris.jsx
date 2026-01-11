import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCw, Trophy, Clock, Zap } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMOJI_SETS = ['🟦', '🟨', '🟩', '🟪', '🟧', '🟥', '⬜'];

const TETROMINOS = {
  I: { shape: [[1,1,1,1]], color: 0 },
  O: { shape: [[1,1],[1,1]], color: 1 },
  T: { shape: [[0,1,0],[1,1,1]], color: 2 },
  S: { shape: [[0,1,1],[1,1,0]], color: 3 },
  Z: { shape: [[1,1,0],[0,1,1]], color: 4 },
  J: { shape: [[1,0,0],[1,1,1]], color: 5 },
  L: { shape: [[0,0,1],[1,1,1]], color: 6 }
};

const DIFFICULTIES = {
  easy: { speed: 600, label: 'Easy 🐢', pointMultiplier: 1 },
  medium: { speed: 350, label: 'Medium 🏃', pointMultiplier: 2 },
  hard: { speed: 150, label: 'Hard 🚀', pointMultiplier: 3 }
};

export default function Tetris() {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [time, setTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  
  const gameLoopRef = useRef(null);
  const timerRef = useRef(null);

  const createEmptyBoard = () => Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

  const getRandomPiece = () => {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return TETROMINOS[randomPiece];
  };

  const canMove = useCallback((piece, pos, boardState) => {
    if (!piece) return false;
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && boardState[newY][newX] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    
    if (!currentPiece) return newBoard;
    
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
    return newBoard;
  }, [board, currentPiece, position]);

  const clearLines = useCallback((boardState) => {
    let linesCount = 0;
    const newBoard = boardState.filter(row => {
      if (row.every(cell => cell !== null)) {
        linesCount++;
        return false;
      }
      return true;
    });
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    
    if (linesCount > 0) {
      const multiplier = DIFFICULTIES[difficulty].pointMultiplier;
      const basePoints = linesCount === 1 ? 100 : linesCount === 2 ? 300 : linesCount === 3 ? 500 : 800;
      const comboBonus = combo * 50;
      const points = (basePoints + comboBonus) * multiplier;
      
      setScore(prev => prev + points);
      setLinesCleared(prev => prev + linesCount);
      setLevel(Math.floor(linesCleared / 10) + 1);
      setCombo(prev => prev + 1);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 1000);
    } else {
      setCombo(0);
    }
    
    return { newBoard, linesCount };
  }, [linesCleared, difficulty, combo]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || isPaused || !isPlaying) return;
    
    const rotated = {
      ...currentPiece,
      shape: currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
      )
    };
    
    if (canMove(rotated, position, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, position, board, canMove, isPaused, isPlaying]);

  const movePiece = useCallback((dx, dy) => {
    if (!currentPiece || isPaused || !isPlaying) return;
    
    const newPos = { x: position.x + dx, y: position.y + dy };
    
    if (canMove(currentPiece, newPos, board)) {
      setPosition(newPos);
      if (dy > 0) {
        setScore(prev => prev + 1 * DIFFICULTIES[difficulty].pointMultiplier);
      }
      return true;
    }
    return false;
  }, [currentPiece, position, board, canMove, isPaused, isPlaying, difficulty]);

  const dropPiece = useCallback(() => {
    if (!movePiece(0, 1)) {
      const mergedBoard = mergePiece();
      const { newBoard, linesCount } = clearLines(mergedBoard);
      setBoard(newBoard);
      
      const newPiece = getRandomPiece();
      const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
      
      if (!canMove(newPiece, startPos, newBoard)) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }
      
      setCurrentPiece(newPiece);
      setPosition(startPos);
    }
  }, [movePiece, mergePiece, clearLines, canMove]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused || !isPlaying) return;
    
    let dropDistance = 0;
    while (canMove(currentPiece, { x: position.x, y: position.y + dropDistance + 1 }, board)) {
      dropDistance++;
    }
    
    setPosition(prev => ({ ...prev, y: prev.y + dropDistance }));
    setScore(prev => prev + dropDistance * 2 * DIFFICULTIES[difficulty].pointMultiplier);
    
    setTimeout(dropPiece, 50);
  }, [currentPiece, position, board, canMove, dropPiece, isPaused, isPlaying, difficulty]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying || gameOver) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (movePiece(0, 1)) {
            movePiece(0, 1);
            movePiece(0, 1);
          }
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          rotatePiece();
          break;
        case 'Enter':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePiece, hardDrop, isPlaying, gameOver]);

  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      const speedReduction = Math.min(level - 1, 10) * 30;
      const currentSpeed = Math.max(DIFFICULTIES[difficulty].speed - speedReduction, 100);
      gameLoopRef.current = setInterval(dropPiece, currentSpeed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, isPaused, gameOver, dropPiece, difficulty, level]);

  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      timerRef.current = setInterval(() => setTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isPaused, gameOver]);

  const startGame = () => {
    const newBoard = createEmptyBoard();
    const newPiece = getRandomPiece();
    const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    
    setBoard(newBoard);
    setCurrentPiece(newPiece);
    setPosition(startPos);
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    setTime(0);
    setCombo(0);
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece && !gameOver) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayBoard = renderBoard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <h1 className="text-6xl font-bold text-center mb-8 text-white drop-shadow-lg animate-pulse">
          🎮 TETRIS 🎮
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center lg:items-center">
          {/* Game Board */}
          <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border-4 border-purple-500 mx-auto">
            <div className="grid gap-1 bg-gray-900 p-4 rounded-2xl relative" 
                 style={{ 
                   gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                   width: 'fit-content'
                 }}>
              {displayBoard.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className="w-8 h-8 flex items-center justify-center text-2xl transition-all duration-100 rounded"
                    style={{
                      backgroundColor: cell !== null ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.05)',
                      boxShadow: cell !== null ? '0 0 10px rgba(147, 51, 234, 0.5)' : 'none'
                    }}
                  >
                    {cell !== null ? EMOJI_SETS[cell] : ''}
                  </div>
                ))
              )}
              
              {showCombo && combo > 1 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-6xl font-bold text-yellow-400 animate-bounce drop-shadow-lg">
                    🔥 x{combo} COMBO! 🔥
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Side Panel */}
          <div className="flex flex-col gap-4 w-full lg:w-80">
            {/* Stats - Only show when game is running */}
            {isPlaying && (
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-3xl shadow-2xl border-4 border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6" />
                      <span className="font-bold">Score</span>
                    </div>
                    <span className="text-3xl font-bold">{score}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Zap className="w-6 h-6" />
                      <span className="font-bold">Level</span>
                    </div>
                    <span className="text-2xl font-bold">{level}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-white">
                    <span className="font-bold">Lines</span>
                    <span className="text-2xl font-bold">{linesCleared}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="w-6 h-6" />
                      <span className="font-bold">Time</span>
                    </div>
                    <span className="text-2xl font-bold">{formatTime(time)}</span>
                  </div>
                  
                  {combo > 1 && (
                    <div className="bg-yellow-400 text-black px-4 py-2 rounded-xl text-center font-bold">
                      🔥 {combo}x COMBO
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Difficulty Selection */}
            {!isPlaying && (
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border-4 border-white/20">
                <h3 className="text-white font-bold text-xl mb-4 text-center">Select Difficulty</h3>
                <div className="space-y-2">
                  {Object.entries(DIFFICULTIES).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setDifficulty(key)}
                      className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 ${
                        difficulty === key
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black scale-105 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border-4 border-white/20">
              <div className="space-y-3">
                {!isPlaying ? (
                  <button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:scale-105"
                  >
                    <Play className="w-6 h-6" />
                    START GAME
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:scale-105"
                    >
                      {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                      {isPaused ? 'RESUME' : 'PAUSE'}
                    </button>
                    
                    <button
                      onClick={startGame}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:scale-105"
                    >
                      <RotateCw className="w-5 h-5" />
                      RESTART
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border-4 border-white/20">
              <h3 className="text-white font-bold text-lg mb-3">🎯 Controls</h3>
              <div className="text-white/90 text-sm space-y-2">
                <p>⬅️ ➡️ Move</p>
                <p>⬆️ / Space: Rotate</p>
                <p>⬇️ Soft Drop</p>
                <p>Enter: Hard Drop</p>
                <p>P: Pause</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-3xl shadow-2xl border-4 border-white/30 max-w-md w-full text-center">
              <h2 className="text-5xl font-bold text-white mb-4">GAME OVER! 💀</h2>
              <div className="space-y-3 text-white text-xl mb-6">
                <p>Final Score: <span className="font-bold text-yellow-300">{score}</span></p>
                <p>Lines: <span className="font-bold text-yellow-300">{linesCleared}</span></p>
                <p>Level: <span className="font-bold text-yellow-300">{level}</span></p>
                <p>Time: <span className="font-bold text-yellow-300">{formatTime(time)}</span></p>
              </div>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}