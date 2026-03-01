import { useState, useEffect, useRef } from 'react';

const WEAPONS = [
  { name: '🔫 Pistol',   damage: 10, fireRate: 500,  cost: 0,   emoji: '🔫', bulletColor: '#fbbf24' },
  { name: '🔥 Rifle',    damage: 15, fireRate: 300,  cost: 50,  emoji: '🔥', bulletColor: '#ef4444' },
  { name: '⚡ SMG',      damage: 8,  fireRate: 150,  cost: 100, emoji: '⚡', bulletColor: '#3b82f6' },
  { name: '💥 Shotgun',  damage: 25, fireRate: 800,  cost: 150, emoji: '💥', bulletColor: '#f97316' },
  { name: '🚀 Launcher', damage: 50, fireRate: 1500, cost: 300, emoji: '🚀', bulletColor: '#8b5cf6' },
];

const ENEMY_TYPES = [
  { type: 'basic', health: 20,  speed: 0.5, damage: 10, emoji: '👾', coins: 5  },
  { type: 'fast',  health: 15,  speed: 1,   damage: 5,  emoji: '⚡', coins: 8  },
  { type: 'tank',  health: 50,  speed: 0.3, damage: 20, emoji: '🛡️', coins: 15 },
  { type: 'boss',  health: 100, speed: 0.4, damage: 30, emoji: '👹', coins: 50 },
];

const INITIAL_PLAYER = { x: 50, y: 80, health: 100, maxHealth: 100 };

function makeEnemies(waveNumber) {
  const count = 3 + waveNumber * 2;
  return Array.from({ length: count }, (_, i) => {
    const typeIndex =
      waveNumber > 5 && Math.random() > 0.7 ? 3
      : waveNumber > 3 && Math.random() > 0.7 ? 2
      : Math.random() > 0.7 ? 1 : 0;
    const t = ENEMY_TYPES[typeIndex];
    const side = Math.floor(Math.random() * 4);
    const x = side === 1 ? 105 : side === 3 ? -5 : Math.random() * 100;
    const y = side === 0 ? -5  : side === 2 ? 105 : Math.random() * 100;
    return { id: Date.now() + i + Math.random() * 1000, x, y, ...t, currentHealth: t.health };
  });
}

function MyGame() {
  const [gameState, setGameState] = useState('menu');
  const [player, setPlayer]       = useState(INITIAL_PLAYER);
  const [enemies, setEnemies]     = useState([]);
  const [bullets, setBullets]     = useState([]);
  const [barriers, setBarriers]   = useState([]);
  const [score, setScore]         = useState(0);
  const [wave, setWave]           = useState(1);
  const [coins, setCoins]         = useState(0);
  const [currentWeapon, setCurrentWeapon] = useState(0);
  const [kills, setKills]         = useState(0);

  // Refs for use inside intervals — avoids stale-closure / dependency-array thrashing
  const playerRef       = useRef(INITIAL_PLAYER);
  const enemiesRef      = useRef([]);
  const bulletsRef      = useRef([]);
  const barriersRef     = useRef([]);
  const weaponRef       = useRef(0);
  const wavePendingRef  = useRef(false);
  const mousePos        = useRef({ x: 50, y: 80 });
  const gameLoopRef     = useRef(null);
  const shootTimerRef   = useRef(null);

  // Keep refs in sync so game loop always sees current values
  useEffect(() => { playerRef.current   = player;   }, [player]);
  useEffect(() => { enemiesRef.current  = enemies;  }, [enemies]);
  useEffect(() => { bulletsRef.current  = bullets;  }, [bullets]);
  useEffect(() => { barriersRef.current = barriers; }, [barriers]);
  useEffect(() => { weaponRef.current   = currentWeapon; }, [currentWeapon]);

  // Mouse tracking — only updates a ref, never triggers a re-render
  useEffect(() => {
    if (gameState !== 'playing') return;
    const onMove = (e) => {
      const area = document.getElementById('game-area');
      if (!area) return;
      const r = area.getBoundingClientRect();
      mousePos.current = {
        x: ((e.clientX - r.left) / r.width)  * 100,
        y: ((e.clientY - r.top)  / r.height) * 100,
      };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [gameState]);

  // Auto-shoot — only restarts when gameState or weapon changes
  useEffect(() => {
    if (gameState !== 'playing') return;
    const shoot = () => {
      const es = enemiesRef.current;
      const p  = playerRef.current;
      const w  = WEAPONS[weaponRef.current];
      if (!es.length) return;

      const closest = es.reduce((a, b) =>
        Math.hypot(a.x - p.x, a.y - p.y) < Math.hypot(b.x - p.x, b.y - p.y) ? a : b
      );
      const angle = Math.atan2(closest.y - p.y, closest.x - p.x);

      const newBullets = w.name.includes('Shotgun')
        ? [-2, -1, 0, 1, 2].map(i => {
            const a = angle + i * 0.2;
            return { id: Date.now() + Math.random(), x: p.x, y: p.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, damage: w.damage / 5, color: w.bulletColor };
          })
        : [{ id: Date.now() + Math.random(), x: p.x, y: p.y, vx: Math.cos(angle) * 2, vy: Math.sin(angle) * 2, damage: w.damage, color: w.bulletColor }];

      bulletsRef.current = [...bulletsRef.current, ...newBullets];
    };

    shootTimerRef.current = setInterval(shoot, WEAPONS[currentWeapon].fireRate);
    return () => clearInterval(shootTimerRef.current);
  }, [gameState, currentWeapon]);

  // Main game loop — only (re)starts when gameState changes
  useEffect(() => {
    if (gameState !== 'playing') return;

    wavePendingRef.current = true;
    const spawnTimeout = setTimeout(() => {
      const w1 = makeEnemies(1);
      enemiesRef.current = w1;
      setEnemies(w1);
      wavePendingRef.current = false;
    }, 500);

    gameLoopRef.current = setInterval(() => {
      const p     = playerRef.current;
      const mouse = mousePos.current;

      // Move player toward mouse cursor
      const dx   = mouse.x - p.x;
      const dy   = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newPlayer = dist > 1
        ? { ...p,
            x: Math.max(2, Math.min(98, p.x + (dx / dist) * Math.min(dist, 2))),
            y: Math.max(2, Math.min(98, p.y + (dy / dist) * Math.min(dist, 2))),
          }
        : p;

      // Move bullets
      const movedBullets = bulletsRef.current
        .map(b => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
        .filter(b => b.x >= 0 && b.x <= 100 && b.y >= 0 && b.y <= 100);

      // Move enemies toward player
      const movedEnemies = enemiesRef.current.map(e => {
        const a = Math.atan2(newPlayer.y - e.y, newPlayer.x - e.x);
        return { ...e, x: e.x + Math.cos(a) * e.speed, y: e.y + Math.sin(a) * e.speed };
      });

      // Bullet ↔ enemy collisions (one pass)
      const hitBulletIds = new Set();
      const damagedEnemies = movedEnemies.map(enemy => {
        let hp = enemy.currentHealth;
        for (const b of movedBullets) {
          if (hitBulletIds.has(b.id)) continue;
          if (Math.hypot(enemy.x - b.x, enemy.y - b.y) < 3) {
            hitBulletIds.add(b.id);
            hp -= b.damage;
          }
        }
        return hp !== enemy.currentHealth ? { ...enemy, currentHealth: hp } : enemy;
      });

      let scoreGain = 0, coinsGain = 0, killsGain = 0;
      const aliveEnemies = damagedEnemies.filter(e => {
        if (e.currentHealth <= 0) { scoreGain += e.coins * 10; coinsGain += e.coins; killsGain++; return false; }
        return true;
      });
      const survivingBullets = movedBullets.filter(b => !hitBulletIds.has(b.id));

      // Enemy ↔ player collisions
      let playerDamage = 0;
      const enemiesAfterPlayer = aliveEnemies.filter(e => {
        if (Math.hypot(e.x - newPlayer.x, e.y - newPlayer.y) < 4) { playerDamage += e.damage; return false; }
        return true;
      });

      // Enemy ↔ barrier collisions
      const updatedBarriers = barriersRef.current
        .map(barrier => {
          const dmg = enemiesAfterPlayer.reduce((acc, e) =>
            Math.hypot(e.x - barrier.x, e.y - barrier.y) < 8 ? acc + e.damage * 0.1 : acc, 0);
          return dmg > 0 ? { ...barrier, health: Math.max(0, barrier.health - dmg) } : barrier;
        })
        .filter(b => b.health > 0);

      // Apply player damage
      let finalPlayer = newPlayer;
      let over = false;
      if (playerDamage > 0) {
        const hp = newPlayer.health - playerDamage;
        over = hp <= 0;
        finalPlayer = { ...newPlayer, health: Math.max(0, hp) };
      }

      // Commit to refs first, then schedule state updates
      playerRef.current   = finalPlayer;
      enemiesRef.current  = enemiesAfterPlayer;
      bulletsRef.current  = survivingBullets;
      barriersRef.current = updatedBarriers;

      setPlayer(finalPlayer);
      setEnemies(enemiesAfterPlayer);
      setBullets(survivingBullets);
      setBarriers(updatedBarriers);
      if (scoreGain) setScore(s => s + scoreGain);
      if (coinsGain) setCoins(c => c + coinsGain);
      if (killsGain) setKills(k => k + killsGain);
      if (over) { setGameState('gameOver'); return; }

      // Wave completion
      if (enemiesAfterPlayer.length === 0 && !wavePendingRef.current) {
        wavePendingRef.current = true;
        setWave(w => {
          const next = w + 1;
          setTimeout(() => {
            const nextEnemies = makeEnemies(next);
            enemiesRef.current = nextEnemies;
            setEnemies(nextEnemies);
            wavePendingRef.current = false;
          }, 2000);
          return next;
        });
      }
    }, 50);

    return () => {
      clearTimeout(spawnTimeout);
      clearInterval(gameLoopRef.current);
    };
  }, [gameState]);

  const startGame = () => {
    playerRef.current      = INITIAL_PLAYER;
    enemiesRef.current     = [];
    bulletsRef.current     = [];
    barriersRef.current    = [];
    weaponRef.current      = 0;
    wavePendingRef.current = false;
    mousePos.current       = { x: 50, y: 80 };
    setPlayer(INITIAL_PLAYER);
    setEnemies([]);
    setBullets([]);
    setBarriers([]);
    setScore(0);
    setWave(1);
    setCoins(0);
    setCurrentWeapon(0);
    setKills(0);
    setGameState('playing');
  };

  const buyWeapon = (index) => {
    if (coins >= WEAPONS[index].cost && index > currentWeapon) {
      setCoins(c => c - WEAPONS[index].cost);
      setCurrentWeapon(index);
    }
  };

  const buyBarrier = () => {
    if (coins >= 40) {
      setCoins(c => c - 40);
      const b = { id: Date.now(), x: 20 + Math.random() * 60, y: 40 + Math.random() * 30, health: 100, maxHealth: 100 };
      barriersRef.current = [...barriersRef.current, b];
      setBarriers(prev => [...prev, b]);
    }
  };

  const repairBarriers = () => {
    if (coins >= 30 && barriers.length > 0) {
      setCoins(c => c - 30);
      const repaired = barriersRef.current.map(b => ({ ...b, health: b.maxHealth }));
      barriersRef.current = repaired;
      setBarriers(repaired);
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
            <p>🛡️ Buy barriers for protection!</p>
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
          className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl border-4 border-purple-500"
          style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0f1e 100%)' }}
        >
          {/* Player */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
            style={{ left: `${player.x}%`, top: `${player.y}%`, fontSize: '2.2rem', filter: 'drop-shadow(0 0 8px #a78bfa)' }}
          >
            🪖
          </div>

          {/* Barriers */}
          {barriers.map(barrier => (
            <div
              key={barrier.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${barrier.x}%`, top: `${barrier.y}%` }}
            >
              <div className="text-3xl select-none">🧱</div>
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
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
            >
              <div className="text-2xl animate-pulse select-none">{enemy.emoji}</div>
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
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* HUD */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            <div className="bg-black bg-opacity-70 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-500">❤️</span>
                <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                    style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm">{Math.ceil(player.health)}</span>
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
          <p className="text-2xl text-white">{WEAPONS[currentWeapon].emoji} {WEAPONS[currentWeapon].name}</p>
          <p className="text-gray-400 text-sm">Damage: {WEAPONS[currentWeapon].damage}</p>
        </div>

        <div className="space-y-2 mb-4">
          {WEAPONS.map((weapon, index) => (
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
                  {index <= currentWeapon
                    ? <span className="text-green-400">✅ Owned</span>
                    : <span className="text-yellow-400 font-bold">💰 {weapon.cost}</span>
                  }
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
          <p>• Watch out for boss enemies 👹</p>
        </div>
      </div>
    </div>
  );
}

export default MyGame;
