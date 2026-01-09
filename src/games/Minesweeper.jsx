import React, { useState, useEffect, useCallback } from 'react';
import { Bomb, Flag, Clock, Trophy, Lightbulb, RotateCcw, Zap } from 'lucide-react';

function Minesweeper() {
  const difficulties = {
    easy: { rows: 8, cols: 10, mines: 10, name: 'Easy', emoji: '😊' },
    medium: { rows: 14, cols: 18, mines: 40, name: 'Medium', emoji: '😐' },
    hard: { rows: 20, cols: 24, mines: 99, name: 'Hard', emoji: '😰' }
  };

  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [gameState, setGameState] = useState('ready'); // ready, playing, won, lost
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(3);
  const [bestScores, setBestScores] = useState({ easy: 0, medium: 0, hard: 0 });
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(1);

  const config = difficulties[difficulty];

  // Initialize board
  const initBoard = useCallback(() => {
    const newBoard = Array(config.rows).fill(null).map(() => 
      Array(config.cols).fill(0)
    );
    
    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < config.mines) {
      const row = Math.floor(Math.random() * config.rows);
      const col = Math.floor(Math.random() * config.cols);
      
      if (newBoard[row][col] !== -1) {
        newBoard[row][col] = -1;
        minesPlaced++;
        
        // Update adjacent cells
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < config.rows && 
                newCol >= 0 && newCol < config.cols && 
                newBoard[newRow][newCol] !== -1) {
              newBoard[newRow][newCol]++;
            }
          }
        }
      }
    }
    
    setBoard(newBoard);
    setRevealed(Array(config.rows).fill(null).map(() => Array(config.cols).fill(false)));
    setFlagged(Array(config.rows).fill(null).map(() => Array(config.cols).fill(false)));
    setGameState('ready');
    setTimer(0);
    setScore(0);
    setCombo(1);
  }, [config.rows, config.cols, config.mines]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Reveal cell logic
  const revealCell = useCallback((row, col) => {
    if (gameState === 'lost' || gameState === 'won') return;
    if (revealed[row][col] || flagged[row][col]) return;

    if (gameState === 'ready') {
      setGameState('playing');
    }

    const newRevealed = revealed.map(r => [...r]);
    
    const reveal = (r, c) => {
      if (r < 0 || r >= config.rows || c < 0 || c >= config.cols) return;
      if (newRevealed[r][c] || flagged[r][c]) return;
      
      newRevealed[r][c] = true;
      
      // Add score with combo multiplier
      const points = Math.floor(10 * combo);
      setScore(s => s + points);
      setCombo(c => Math.min(c + 0.1, 5));
      
      if (board[r][c] === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            reveal(r + i, c + j);
          }
        }
      }
    };

    if (board[row][col] === -1) {
      // Hit a mine
      newRevealed[row][col] = true;
      setRevealed(newRevealed);
      setGameState('lost');
      setCombo(1);
      return;
    }

    reveal(row, col);
    setRevealed(newRevealed);

    // Check win condition
    let revealedCount = 0;
    newRevealed.forEach(r => r.forEach(c => { if (c) revealedCount++; }));
    
    if (revealedCount === config.rows * config.cols - config.mines) {
      setGameState('won');
      const finalScore = score + (1000 - timer * 2) + (hints * 100);
      setScore(finalScore);
      setStreak(s => s + 1);
      
      if (finalScore > bestScores[difficulty]) {
        setBestScores({ ...bestScores, [difficulty]: finalScore });
      }
    }
  }, [board, revealed, flagged, gameState, config.rows, config.cols, config.mines, score, timer, hints, combo, difficulty, bestScores]);

  // Toggle flag
  const toggleFlag = useCallback((row, col, e) => {
    e.preventDefault();
    if (gameState === 'lost' || gameState === 'won') return;
    if (revealed[row][col]) return;

    if (gameState === 'ready') {
      setGameState('playing');
    }

    const newFlagged = flagged.map(r => [...r]);
    newFlagged[row][col] = !newFlagged[row][col];
    setFlagged(newFlagged);
  }, [flagged, revealed, gameState]);

  // Use hint
  const useHint = () => {
    if (hints <= 0 || gameState !== 'playing') return;
    
    // Find a safe cell that's not revealed
    const safeCells = [];
    for (let i = 0; i < config.rows; i++) {
      for (let j = 0; j < config.cols; j++) {
        if (!revealed[i][j] && !flagged[i][j] && board[i][j] !== -1) {
          safeCells.push([i, j]);
        }
      }
    }
    
    if (safeCells.length > 0) {
      const [row, col] = safeCells[Math.floor(Math.random() * safeCells.length)];
      revealCell(row, col);
      setHints(h => h - 1);
    }
  };

  // Reset game
  const resetGame = () => {
    if (gameState === 'lost') {
      setStreak(0);
    }
    setHints(3);
    initBoard();
  };

  // Change difficulty
  const changeDifficulty = (level) => {
    setDifficulty(level);
    setHints(3);
    setStreak(0);
  };

  // Get cell content
  const getCellContent = (row, col) => {
    if (!revealed[row][col]) {
      return flagged[row][col] ? '🚩' : '';
    }
    
    if (board[row][col] === -1) {
      return '💣';
    }
    
    if (board[row][col] === 0) {
      return '';
    }
    
    return board[row][col];
  };

  // Get cell color
  const getCellColor = (value) => {
    const colors = {
      1: 'text-blue-500',
      2: 'text-green-500',
      3: 'text-red-500',
      4: 'text-purple-600',
      5: 'text-yellow-600',
      6: 'text-pink-500',
      7: 'text-gray-700',
      8: 'text-gray-900'
    };
    return colors[value] || '';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const flagCount = flagged.flat().filter(f => f).length;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Bomb className="w-12 h-12 text-red-500" />
            💣 Minesweeper 💎
          </h1>
          <p className="text-purple-300 text-lg">Clear the field without hitting any mines!</p>
        </div>

        {/* Difficulty Selection */}
        <div className="flex justify-center gap-3 mb-6">
          {Object.entries(difficulties).map(([key, diff]) => (
            <button
              key={key}
              onClick={() => changeDifficulty(key)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                difficulty === key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {diff.emoji} {diff.name}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl p-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-xs text-slate-400">Time</div>
              <div className="text-xl font-bold text-white">{formatTime(timer)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl p-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-xs text-slate-400">Score</div>
              <div className="text-xl font-bold text-white">{Math.floor(score)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl p-3">
            <Flag className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-xs text-slate-400">Flags</div>
              <div className="text-xl font-bold text-white">{flagCount}/{config.mines}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl p-3">
            <Zap className="w-5 h-5 text-orange-400" />
            <div>
              <div className="text-xs text-slate-400">Combo</div>
              <div className="text-xl font-bold text-white">{combo.toFixed(1)}x</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl p-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-xs text-slate-400">Streak</div>
              <div className="text-xl font-bold text-white">{streak}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={useHint}
            disabled={hints <= 0 || gameState !== 'playing'}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            <Lightbulb className="w-5 h-5" />
            Hint ({hints})
          </button>
          
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            New Game
          </button>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div 
            className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 shadow-2xl inline-block"
            style={{ maxWidth: '100%', overflow: 'auto' }}
          >
            <div 
              className="grid gap-1"
              style={{ 
                gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
                fontSize: config.cols > 20 ? '10px' : config.cols > 15 ? '12px' : '14px'
              }}
            >
              {board.map((row, i) =>
                row.map((cell, j) => (
                  <button
                    key={`${i}-${j}`}
                    onClick={() => revealCell(i, j)}
                    onContextMenu={(e) => toggleFlag(i, j, e)}
                    className={`
                      aspect-square flex items-center justify-center font-bold transition-all transform hover:scale-105
                      ${revealed[i][j]
                        ? cell === -1
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-600 text-white'
                        : 'bg-gradient-to-br from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white shadow-md'
                      }
                      ${flagged[i][j] && !revealed[i][j] ? 'bg-gradient-to-br from-red-600 to-red-700' : ''}
                      rounded-lg
                    `}
                    style={{ 
                      width: config.cols > 20 ? '24px' : config.cols > 15 ? '28px' : '36px',
                      height: config.cols > 20 ? '24px' : config.cols > 15 ? '28px' : '36px'
                    }}
                  >
                    <span className={revealed[i][j] && cell > 0 ? getCellColor(cell) : ''}>
                      {getCellContent(i, j)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Game Over / Win Message */}
        {(gameState === 'won' || gameState === 'lost') && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-purple-500/50 animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {gameState === 'won' ? '🎉' : '💥'}
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  {gameState === 'won' ? 'Victory!' : 'Game Over!'}
                </h2>
                <div className="space-y-2 mb-6">
                  <p className="text-2xl text-purple-300">
                    Score: <span className="font-bold text-white">{Math.floor(score)}</span>
                  </p>
                  <p className="text-xl text-slate-300">
                    Time: {formatTime(timer)}
                  </p>
                  {gameState === 'won' && (
                    <p className="text-xl text-yellow-400">
                      🔥 Streak: {streak}
                    </p>
                  )}
                  {bestScores[difficulty] > 0 && (
                    <p className="text-lg text-slate-400">
                      Best: {Math.floor(bestScores[difficulty])}
                    </p>
                  )}
                </div>
                <button
                  onClick={resetGame}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Best Scores */}
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-white mb-3 text-center">🏆 Best Scores</h3>
          <div className="space-y-2">
            {Object.entries(difficulties).map(([key, diff]) => (
              <div key={key} className="flex justify-between items-center bg-slate-700/50 rounded-lg p-3">
                <span className="text-slate-300">{diff.emoji} {diff.name}</span>
                <span className="text-yellow-400 font-bold">
                  {bestScores[key] > 0 ? Math.floor(bestScores[key]) : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Minesweeper;