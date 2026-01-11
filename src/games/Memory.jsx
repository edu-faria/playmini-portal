import React, { useState, useEffect } from 'react';
import { Trophy, Timer, Star, RotateCcw, Sparkles } from 'lucide-react';

const EMOJI_SETS = {
  easy: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭'],
  medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
  hard: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🥭']
};

const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, cols: 4, time: 60, name: 'Easy' },
  medium: { pairs: 8, cols: 4, time: 90, name: 'Medium' },
  hard: { pairs: 12, cols: 4, time: 120, name: 'Hard' }
};

export default function Memory() {
  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState({});

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameWon) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted && !gameWon) {
      endGame(false);
    }
  }, [timeLeft, gameStarted, gameWon]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameWon(true);
      calculateScore();
    }
  }, [matched, cards]);

  const initGame = (level) => {
    const config = DIFFICULTY_CONFIG[level];
    const emojis = EMOJI_SETS[level];
    const pairs = emojis.slice(0, config.pairs);
    const gameCards = [...pairs, ...pairs]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, matched: false }));
    
    setDifficulty(level);
    setCards(gameCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimeLeft(config.time);
    setGameStarted(true);
    setGameWon(false);
    setScore(0);
  };

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setMatched([...matched, first, second]);
          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const calculateScore = () => {
    const timeBonus = timeLeft * 10;
    const movesPenalty = moves * 5;
    const finalScore = Math.max(1000 + timeBonus - movesPenalty, 100);
    setScore(finalScore);

    if (!bestScore[difficulty] || finalScore > bestScore[difficulty]) {
      setBestScore({ ...bestScore, [difficulty]: finalScore });
    }
  };

  const endGame = (won) => {
    setGameStarted(false);
    if (won) setGameWon(true);
  };

  const resetGame = () => {
    setDifficulty(null);
    setCards([]);
    setGameStarted(false);
    setGameWon(false);
  };

  if (!difficulty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-8 animate-bounce">
            <Sparkles className="w-20 h-20 mx-auto text-yellow-300" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Memory Game
          </h1>
          <p className="text-xl text-white mb-12 opacity-90">
            Choose your difficulty level
          </p>
          <div className="space-y-4">
            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => initGame(key)}
                className="w-64 py-4 px-8 bg-white text-gray-800 rounded-2xl font-bold text-xl hover:scale-105 transform transition-all duration-200 shadow-2xl hover:shadow-3xl"
              >
                <div className="flex items-center justify-between">
                  <span>{config.name}</span>
                  <span className="text-sm opacity-60">{config.pairs} pairs</span>
                </div>
              </button>
            ))}
          </div>
          {Object.keys(bestScore).length > 0 && (
            <div className="mt-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6" />
                Best Scores
              </h3>
              {Object.entries(bestScore).map(([level, score]) => (
                <div key={level} className="flex justify-between items-center py-2">
                  <span className="capitalize">{level}</span>
                  <span className="font-bold">{score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameWon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-md animate-pulse">
          <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-6" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">You Win! 🎉</h2>
          <div className="space-y-3 mb-8 text-lg">
            <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3">
              <span className="font-semibold">Score:</span>
              <span className="text-2xl font-bold text-purple-600">{score}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3">
              <span className="font-semibold">Moves:</span>
              <span className="font-bold">{moves}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3">
              <span className="font-semibold">Time Left:</span>
              <span className="font-bold">{timeLeft}s</span>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => initGame(difficulty)}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transform transition-all"
            >
              Play Again
            </button>
            <button
              onClick={resetGame}
              className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:scale-105 transform transition-all"
            >
              Change Difficulty
            </button>
          </div>
        </div>
      </div>
    );
  }

  const config = DIFFICULTY_CONFIG[difficulty];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-xl">
          <div className="flex justify-between items-center text-white flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-6 h-6" />
              <span className="text-2xl font-bold">{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              <span className="text-2xl font-bold">{moves} moves</span>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-bold hover:scale-105 transform transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>

        <div 
          className="grid gap-3"
          style={{ 
            gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            const isMatched = matched.includes(card.id);
            
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square cursor-pointer transition-all duration-500 transform ${
                  isFlipped ? 'rotate-y-180' : ''
                } ${isMatched ? 'scale-105' : 'hover:scale-105'}`}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div
                  className="relative w-full h-full rounded-2xl shadow-xl transition-all duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'
                  }}
                >
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-white to-gray-100 rounded-2xl flex items-center justify-center backface-hidden shadow-lg"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <Sparkles className="w-12 h-12 text-purple-400" />
                  </div>
                  <div
                    className={`absolute w-full h-full rounded-2xl flex items-center justify-center backface-hidden shadow-lg relative ${
                      isMatched
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-4 border-green-300'
                        : 'bg-gradient-to-br from-pink-400 to-purple-500'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <span className="text-5xl relative z-10">{card.emoji}</span>
                    {isMatched && (
                      <div className="absolute inset-0 bg-green-200 bg-opacity-30 rounded-2xl animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}