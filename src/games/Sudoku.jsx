import React, { useState, useEffect, useRef } from 'react';

function Sudoku() {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState(0);
  const [hints, setHints] = useState(1);
  const [timer, setTimer] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [level, setLevel] = useState('easy');
  const timerRef = useRef(null);

  const levels = {
    easy: 35,
    medium: 45,
    hard: 52,
    expert: 58
  };

  // Generate a complete valid Sudoku solution
  const generateSolution = () => {
    const grid = Array(9).fill().map(() => Array(9).fill(0));
    fillGrid(grid);
    return grid;
  };

  const fillGrid = (grid) => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          shuffle(nums);
          for (let num of nums) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (fillGrid(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const isValid = (grid, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
      if (grid[i][col] === num) return false;
    }
    
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  };

  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };

  const createPuzzle = (sol, difficulty) => {
    const puzzle = sol.map(row => [...row]);
    const cellsToRemove = levels[difficulty];
    let removed = 0;
    
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }
    return puzzle;
  };

  const startTimer = () => {
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
  };

  const newGame = () => {
    const newSolution = generateSolution();
    const newBoard = createPuzzle(newSolution, level);
    setSolution(newSolution);
    setBoard(newBoard);
    setErrors(0);
    setHints(1);
    setSelected(null);
    setGameActive(true);
    setGameOver(null);
    startTimer();
  };

  const selectCell = (row, col) => {
    if (!gameActive) return;
    if (solution[row][col] === board[row][col] && board[row][col] !== 0) return;
    setSelected({ row, col });
  };

  const placeNumber = (num) => {
    if (!selected || !gameActive) return;
    
    const { row, col } = selected;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);
    
    if (solution[row][col] !== num) {
      const newErrors = errors + 1;
      setErrors(newErrors);
      
      if (newErrors >= 3) {
        endGame(false);
      }
    } else {
      if (checkWin(newBoard)) {
        endGame(true);
      }
    }
  };

  const useHint = () => {
    if (hints <= 0 || !gameActive) return;
    
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0 || board[row][col] !== solution[row][col]) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) return;
    
    const random = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map(r => [...r]);
    newBoard[random.row][random.col] = solution[random.row][random.col];
    setBoard(newBoard);
    setHints(0);
    
    if (checkWin(newBoard)) {
      endGame(true);
    }
  };

  const checkWin = (currentBoard) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentBoard[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  };

  const endGame = (won) => {
    setGameActive(false);
    setGameOver(won);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const isFixed = (row, col) => {
    if (solution.length === 0 || board.length === 0) return false;
    return solution[row][col] === board[row][col] && board[row][col] !== 0;
  };

  useEffect(() => {
    newGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = () => {
    const mins = Math.floor(timer / 60).toString().padStart(2, '0');
    const secs = (timer % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-600 to-purple-800">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Sudoku</h1>
        
        {/* Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex gap-6">
            <div className="font-bold text-blue-600">⏱️ {formatTime()}</div>
            <div className="font-bold text-red-600">❌ {errors}/3</div>
            <div className="font-bold text-yellow-600">💡 {hints}</div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select 
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-4 py-2 border-2 border-purple-600 rounded-lg font-bold text-purple-600 bg-white cursor-pointer"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
            <button 
              onClick={newGame}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
            >
              New Game
            </button>
            <button 
              onClick={useHint}
              disabled={hints <= 0}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Hint
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-9 gap-0 w-fit mx-auto border-4 border-gray-800 mb-6">
          {board.map((row, rowIdx) => 
            row.map((cell, colIdx) => {
              const idx = rowIdx * 9 + colIdx;
              const isSelectedCell = selected && selected.row === rowIdx && selected.col === colIdx;
              const isFixedCell = isFixed(rowIdx, colIdx);
              const rightBorder = (colIdx + 1) % 3 === 0 && colIdx !== 8;
              const bottomBorder = (rowIdx + 1) % 3 === 0 && rowIdx !== 8;
              
              return (
                <div
                  key={idx}
                  onClick={() => selectCell(rowIdx, colIdx)}
                  className={`
                    w-12 h-12 flex items-center justify-center text-xl font-bold border border-gray-300 cursor-pointer
                    ${isFixedCell ? 'bg-gray-100 cursor-default' : 'bg-white hover:bg-gray-50'}
                    ${isSelectedCell ? 'bg-blue-200' : ''}
                    ${rightBorder ? 'border-r-4 border-r-gray-800' : ''}
                    ${bottomBorder ? 'border-b-4 border-b-gray-800' : ''}
                  `}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              );
            })
          )}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-9 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => placeNumber(num)}
              className="p-4 bg-gray-100 border-2 border-gray-300 rounded-lg text-xl font-bold hover:bg-blue-100 hover:border-purple-600 transition"
            >
              {num}
            </button>
          ))}
        </div>

        {/* Game Over Message */}
        {gameOver !== null && (
          <div className={`text-center p-6 rounded-lg text-xl font-bold ${
            gameOver ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {gameOver 
              ? `🎉 Congratulations! You won in ${formatTime()}!` 
              : '😔 Game Over! Too many errors. Try again!'}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sudoku;