import React, { useState, useEffect, useRef } from 'react';

function MyGame() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [player, setPlayer] = useState({ x: 50, y: 80, health: 100, maxHealth: 100 });
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [barriers, setBarriers] = useState([]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [coins, setCoins] = useState(0);
  const [currentWeapon, setCurrentWeapon] = useState(0);
  const [kills, setKills] = useState(0);
  
  const gameLoopRef = useRef(null);
  const shootTimerRef = useRef(null);
  const waveTimerRef = useRef(null);
  const mousePos = useRef({ x: 50, y: 50 });

  const weapons = [
    { name: '🔫 Pistol', damage: 10, fireRate: 500, cost: 0, emoji: '🔫', bulletColor: '#fbbf24' },
    { name: '🔥 Rifle', damage: 15, fireRate: 300, cost: 50, emoji: '🔥', bulletColor: '#ef4444' },
    { name: '⚡ SMG', damage: 8, fireRate: 150, cost: 100, emoji: '⚡', bulletColor: '#3b82f6' },
    { name: '💥 Shotgun', damage: 25, fireRate: 800, cost: 150, emoji: '💥', bulletColor: '#f97316' },
    { name: '🚀 Launcher', damage: 50, fireRate: 1500, cost: 300, emoji: '🚀', bulletColor: '#8b5cf6' },
  ];

  const enemyTypes = [
    { type: 'basic', health: 20, speed: 0.5, damage: 10, emoji: '👾', coins: 5 },
    { type: 'fast', health: 15, speed: 1, damage: 5, emoji: '⚡', coins: 8 },
    { type: 'tank', health: 50, speed: 0.3, damage: 20, emoji: '🛡️', coins: 15 },
    { type: 'boss', health: 100, speed: 0.4, damage: 30, emoji: '👹', coins: 50 },
  ];

  // Initialize barriers - start with no barriers
  useEffect(() => {
    if (gameState === 'playing' && barriers.length === 0) {
      setBarriers([]);
    }
  }, [gameState]);

  // Mouse tracking and player movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const targetX = ((e.clientX - rect.left) / rect.width) * 100;
      const targetY = ((e.clientY - rect.top) / rect.height) * 100;
      
      mousePos.current = { x: targetX, y: targetY };
      
      // Smooth player movement towards mouse
      setPlayer(prev => {
        const dx = targetX - prev.x;
        const dy = targetY - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
          const speed = 0.3;
          return {
            ...prev,
            x: prev.x + (dx / distance) * speed * distance,
            y: prev.y + (dy / distance) * speed * distance,
          };
        }
        return prev;
      });
    };

    const gameArea = document.getElementById('game-area');
    if (gameArea && gameState === 'playing') {
      gameArea.addEventListener('mousemove', handleMouseMove);
      return () => gameArea.removeEventListener('mousemove', handleMouseMove);
    }
  }, [gameState]);

  // Auto-shoot
  useEffect(() => {
    if (gameState !== 'playing') return;

    const shoot = () => {
      setEnemies(currentEnemies => {
        if (currentEnemies.length > 0) {
          setPlayer(currentPlayer => {
            const weapon = weapons[currentWeapon];
            const closestEnemy = currentEnemies.reduce((closest, enemy) => {
              const dist = Math.hypot(enemy.x - currentPlayer.x, enemy.y - currentPlayer.y);
              const closestDist = Math.hypot(closest.x - currentPlayer.x, closest.y - currentPlayer.y);
              return dist < closestDist ? enemy : closest;
            });

            const angle = Math.atan2(closestEnemy.y - currentPlayer.y, closestEnemy.x - currentPlayer.x);
            
            if (weapon.name.includes('Shotgun')) {
              // Shotgun shoots 5 bullets in a spread
              const newBullets = [];
              for (let i = -2; i <= 2; i++) {
                const spreadAngle = angle + (i * 0.2);
                newBullets.push({
                  id: Date.now() + Math.random(),
                  x: currentPlayer.x,
                  y: currentPlayer.y,
                  vx: Math.cos(spreadAngle) * 2,
                  vy: Math.sin(spreadAngle) * 2,
                  damage: weapon.damage / 5,
                  color: weapon.bulletColor,
                });
              }
              setBullets(prev => [...prev, ...newBullets]);
            } else {
              setBullets(prev => [...prev, {
                id: Date.now() + Math.random(),
                x: currentPlayer.x,
                y: currentPlayer.y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                damage: weapon.damage,
                color: weapon.bulletColor,
              }]);
            }
            
            return currentPlayer;
          });
        }
        return currentEnemies;
      });
    };

    shootTimerRef.current = setInterval(shoot, weapons[currentWeapon].fireRate);
    return () => clearInterval(shootTimerRef.current);
  }, [gameState, currentWeapon]);

  // Spawn enemies
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnWave = (waveNumber) => {
      const enemyCount = 3 + waveNumber * 2;
      const newEnemies = [];
      
      for (let i = 0; i < enemyCount; i++) {
        const typeIndex = waveNumber > 5 && Math.random() > 0.7 ? 3 : 
                         waveNumber > 3 && Math.random() > 0.7 ? 2 :
                         Math.random() > 0.7 ? 1 : 0;
        const enemyType = enemyTypes[typeIndex];
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
          case 0: x = Math.random() * 100; y = -5; break;
          case 1: x = 105; y = Math.random() * 100; break;
          case 2: x = Math.random() * 100; y = 105; break;
          default: x = -5; y = Math.random() * 100;
        }
        
        newEnemies.push({
          id: Date.now() + i + Math.random() * 1000,
          x, y,
          ...enemyType,
          currentHealth: enemyType.health,
        });
      }
      
      setEnemies(newEnemies);
    };

    // Spawn initial wave immediately
    if (wave === 1 && enemies.length === 0) {
      setTimeout(() => spawnWave(1), 500);
    }

    return () => {
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    };
  }, [gameState, wave, enemies.length]);

  // Check for wave completion
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const checkWaveCompletion = setInterval(() => {
      if (enemies.length === 0 && wave < 50) {
        setWave(prev => {
          const nextWave = prev + 1;
          setTimeout(() => {
            const enemyCount = 3 + nextWave * 2;
            const newEnemies = [];
            
            for (let i = 0; i < enemyCount; i++) {
              const typeIndex = nextWave > 5 && Math.random() > 0.7 ? 3 : 
                               nextWave > 3 && Math.random() > 0.7 ? 2 :
                               Math.random() > 0.7 ? 1 : 0;
              const enemyType = enemyTypes[typeIndex];
              const side = Math.floor(Math.random() * 4);
              let x, y;
              
              switch(side) {
                case 0: x = Math.random() * 100; y = -5; break;
                case 1: x = 105; y = Math.random() * 100; break;
                case 2: x = Math.random() * 100; y = 105; break;
                default: x = -5; y = Math.random() * 100;
              }
              
              newEnemies.push({
                id: Date.now() + i + Math.random() * 1000,
                x, y,
                ...enemyType,
                currentHealth: enemyType.health,
              });
            }
            
            setEnemies(newEnemies);
          }, 2000);
          return nextWave;
        });
      }
    }, 1000);

    return () => clearInterval(checkWaveCompletion);
  }, [gameState, enemies.length, wave]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      // Move bullets
      setBullets(prev => prev
        .map(bullet => ({
          ...bullet,
          x: bullet.x + bullet.vx,
          y: bullet.y + bullet.vy,
        }))
        .filter(bullet => bullet.x >= 0 && bullet.x <= 100 && bullet.y >= 0 && bullet.y <= 100)
      );

      // Move enemies toward player
      setEnemies(prev => prev.map(enemy => {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        return {
          ...enemy,
          x: enemy.x + Math.cos(angle) * enemy.speed,
          y: enemy.y + Math.sin(angle) * enemy.speed,
        };
      }));

      // Check bullet-enemy collisions
      setBullets(prevBullets => {
        const remainingBullets = [];
        const bulletHits = new Set();

        prevBullets.forEach(bullet => {
          let hit = false;
          setEnemies(prevEnemies => {
            return prevEnemies.map(enemy => {
              if (!hit && !bulletHits.has(bullet.id)) {
                const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);
                if (dist < 3) {
                  hit = true;
                  bulletHits.add(bullet.id);
                  const newHealth = enemy.currentHealth - bullet.damage;
                  
                  if (newHealth <= 0) {
                    setScore(prev => prev + enemy.coins * 10);
                    setCoins(prev => prev + enemy.coins);
                    setKills(prev => prev + 1);
                    return null;
                  }
                  return { ...enemy, currentHealth: newHealth };
                }
              }
              return enemy;
            }).filter(Boolean);
          });

          if (!hit) remainingBullets.push(bullet);
        });

        return remainingBullets;
      });

      // Check enemy-player collisions
      setEnemies(prevEnemies => {
        let damage = 0;
        const remaining = prevEnemies.filter(enemy => {
          const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
          if (dist < 4) {
            damage += enemy.damage;
            return false;
          }
          return true;
        });

        if (damage > 0) {
          setPlayer(prev => {
            const newHealth = prev.health - damage;
            if (newHealth <= 0) {
              setGameState('gameOver');
              return { ...prev, health: 0 };
            }
            return { ...prev, health: newHealth };
          });
        }

        return remaining;
      });

      // Check enemy-barrier collisions
      const enemiesToRemove = new Set();
      
      setBarriers(prevBarriers => {
        const updatedBarriers = prevBarriers.map(barrier => {
          let totalDamage = 0;
          
          enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - barrier.x, enemy.y - barrier.y);
            if (dist < 8 && !enemiesToRemove.has(enemy.id)) {
              totalDamage += enemy.damage;
              enemiesToRemove.add(enemy.id);
            }
          });

          if (totalDamage > 0) {
            return { ...barrier, health: Math.max(0, barrier.health - totalDamage) };
          }
          return barrier;
        });
        
        return updatedBarriers.filter(b => b.health > 0);
      });
      
      // Remove enemies that hit barriers
      if (enemiesToRemove.size > 0) {
        setEnemies(prevEnemies => 
          prevEnemies.filter(enemy => !enemiesToRemove.has(enemy.id))
        );
      }

    }, 50);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, player, enemies]);

  const startGame = () => {
    setGameState('playing');
    setPlayer({ x: 50, y: 80, health: 100, maxHealth: 100 });
    setEnemies([]);
    setBullets([]);
    setBarriers([]);
    setScore(0);
    setWave(1);
    setCoins(0);
    setCurrentWeapon(0);
    setKills(0);
  };

  const buyWeapon = (index) => {
    if (coins >= weapons[index].cost && index > currentWeapon) {
      setCoins(prev => prev - weapons[index].cost);
      setCurrentWeapon(index);
    }
  };

  const buyBarrier = () => {
    if (coins >= 40) {
      setCoins(prev => prev - 40);
      const newBarrier = {
        id: Date.now(),
        x: 20 + Math.random() * 60,
        y: 40 + Math.random() * 30,
        health: 100,
        maxHealth: 100,
      };
      setBarriers(prev => [...prev, newBarrier]);
    }
  };

  const repairBarriers = () => {
    if (coins >= 30 && barriers.length > 0) {
      setCoins(prev => prev - 30);
      setBarriers(prev => prev.map(b => ({ ...b, health: b.maxHealth })));
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 animate-pulse">
            ⚔️ LAST WAR ⚔️
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Survival Shooter</p>
          <button
            onClick={startGame}
            className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-2xl font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transform hover:scale-105 transition shadow-lg"
          >
            🎮 START GAME
          </button>
          <div className="mt-8 text-gray-400 text-sm">
            <p>🖱️ Move your mouse to control the player</p>
            <p>🎯 Auto-shoots at nearest enemy</p>
            <p>💰 Collect coins to upgrade weapons</p>
            <p>🛡️ Protect barriers and survive!</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-red-500">💀 GAME OVER 💀</h1>
          <div className="text-2xl text-gray-300 mb-8">
            <p>Wave Reached: {wave}</p>
            <p>Score: {score}</p>
            <p>Kills: {kills}</p>
          </div>
          <button
            onClick={startGame}
            className="px-12 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-2xl font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition shadow-lg"
          >
            🔄 PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex">
      {/* Game Area */}
      <div className="flex-1 p-4">
        <div
          id="game-area"
          className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-2xl border-4 border-purple-500"
          style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0f1e 100%)' }}
        >
          {/* Player */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
          >
            <svg width="64" height="64" viewBox="0 0 64 64" className="drop-shadow-lg">
              {/* Body - Tactical Vest */}
              <ellipse cx="32" cy="40" rx="12" ry="16" fill="#2c3e50"/>
              <rect x="26" y="32" width="12" height="20" fill="#34495e" rx="2"/>
              
              {/* Arms */}
              <rect x="18" y="36" width="8" height="16" fill="#e67e22" rx="3"/>
              <rect x="38" y="36" width="8" height="16" fill="#e67e22" rx="3"/>
              
              {/* Weapon in hand */}
              <rect x="44" y="42" width="14" height="4" fill="#7f8c8d" rx="1"/>
              <rect x="56" y="40" width="4" height="8" fill="#95a5a6" rx="1"/>
              <circle cx="46" cy="44" r="2" fill="#34495e"/>
              
              {/* Head */}
              <circle cx="32" cy="20" r="12" fill="#f39c12"/>
              
              {/* Helmet */}
              <path d="M 20 20 Q 20 10 32 10 Q 44 10 44 20 L 42 22 L 22 22 Z" fill="#27ae60"/>
              <rect x="30" y="10" width="4" height="4" fill="#2ecc71"/>
              
              {/* Visor */}
              <ellipse cx="32" cy="20" rx="8" ry="4" fill="#3498db" opacity="0.7"/>
              
              {/* Face details */}
              <circle cx="28" cy="20" r="2" fill="#2c3e50"/>
              <circle cx="36" cy="20" r="2" fill="#2c3e50"/>
              <line x1="30" y1="24" x2="34" y2="24" stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="round"/>
              
              {/* Legs */}
              <rect x="26" y="52" width="6" height="10" fill="#34495e" rx="2"/>
              <rect x="32" y="52" width="6" height="10" fill="#34495e" rx="2"/>
              
              {/* Boots */}
              <rect x="25" y="60" width="7" height="4" fill="#2c3e50" rx="1"/>
              <rect x="32" y="60" width="7" height="4" fill="#2c3e50" rx="1"/>
              
              {/* Tactical details */}
              <circle cx="32" cy="38" r="2" fill="#e74c3c"/>
              <rect x="28" y="34" width="2" height="4" fill="#95a5a6"/>
              <rect x="34" y="34" width="2" height="4" fill="#95a5a6"/>
            </svg>
          </div>

          {/* Barriers */}
          {barriers.map(barrier => (
            <div
              key={barrier.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${barrier.x}%`, top: `${barrier.y}%` }}
            >
              <div className="text-3xl">🧱</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-12 h-1 bg-gray-700 rounded">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded transition-all"
                  style={{ width: `${(barrier.health / barrier.maxHealth) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* Enemies */}
          {enemies.map(enemy => (
            <div
              key={enemy.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all"
              style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
            >
              <div className="text-2xl animate-pulse">{enemy.emoji}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-8 h-1 bg-gray-700 rounded">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded transition-all"
                  style={{ width: `${(enemy.currentHealth / enemy.health) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* Bullets */}
          {bullets.map(bullet => (
            <div
              key={bullet.id}
              className="absolute w-2 h-2 rounded-full shadow-lg"
              style={{
                left: `${bullet.x}%`,
                top: `${bullet.y}%`,
                backgroundColor: bullet.color,
                boxShadow: `0 0 10px ${bullet.color}`,
              }}
            />
          ))}

          {/* HUD */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-black bg-opacity-70 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-500">❤️</span>
                <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                    style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm">{player.health}</span>
              </div>
              <div className="text-white text-sm">
                <p>🌊 Wave: {wave}</p>
                <p>⚔️ Kills: {kills}</p>
              </div>
            </div>

            <div className="bg-black bg-opacity-70 p-3 rounded-lg text-right">
              <p className="text-yellow-400 text-xl font-bold">💰 {coins}</p>
              <p className="text-white text-sm">Score: {score}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Panel */}
      <div className="w-80 bg-gray-900 p-4 overflow-y-auto border-l-4 border-purple-500">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">🏪 WEAPON SHOP</h2>
        
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-yellow-400 font-bold">Current Weapon:</p>
          <p className="text-2xl text-white">{weapons[currentWeapon].emoji} {weapons[currentWeapon].name}</p>
          <p className="text-gray-400 text-sm">Damage: {weapons[currentWeapon].damage}</p>
        </div>

        <div className="space-y-2 mb-4">
          {weapons.map((weapon, index) => (
            <button
              key={index}
              onClick={() => buyWeapon(index)}
              disabled={index <= currentWeapon || coins < weapon.cost}
              className={`w-full p-3 rounded-lg text-left transition ${
                index <= currentWeapon
                  ? 'bg-green-900 text-green-300 cursor-not-allowed'
                  : coins >= weapon.cost
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{weapon.emoji} {weapon.name}</p>
                  <p className="text-sm">DMG: {weapon.damage} | Rate: {weapon.fireRate}ms</p>
                </div>
                <div className="text-right">
                  {index <= currentWeapon ? (
                    <span className="text-green-400">✅ Owned</span>
                  ) : (
                    <span className="text-yellow-400 font-bold">💰 {weapon.cost}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={buyBarrier}
          disabled={coins < 40}
          className={`w-full p-4 rounded-lg font-bold text-lg transition mb-2 ${
            coins >= 40
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          🧱 Buy Barrier (💰 40)
        </button>

        <button
          onClick={repairBarriers}
          disabled={coins < 30 || barriers.length === 0}
          className={`w-full p-4 rounded-lg font-bold text-lg transition ${
            coins >= 30 && barriers.length > 0
              ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          🔧 Repair All Barriers (💰 30)
        </button>

        <div className="mt-4 p-3 bg-gray-800 rounded-lg text-gray-300 text-sm">
          <p className="font-bold text-white mb-2">📖 Controls & Tips:</p>
          <p>🖱️ <span className="text-yellow-400">Move mouse</span> to control player</p>
          <p>🎯 <span className="text-green-400">Auto-shoots</span> at nearest enemy</p>
          <p>🧱 <span className="text-blue-400">Buy barriers</span> for protection</p>
          <p>• Enemies get stronger each wave</p>
          <p>• Each weapon has different bullet color</p>
          <p>• Barriers block enemies completely</p>
          <p>• Watch out for boss enemies 👹</p>
        </div>
      </div>
    </div>
  );
}

export default MyGame;