import React, { useState, useEffect, useRef } from 'react';
import { Zap, Shield, Flame, Star, Trophy } from 'lucide-react';

const RailStriker = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [currency, setCurrency] = useState(0);
  const [wave, setWave] = useState(1);
  const [highScore, setHighScore] = useState(0);
  
  const gameRef = useRef({
    player: {
      x: 180,
      y: 500,
      width: 40,
      height: 40,
      health: 100,
      maxHealth: 100,
      damage: 10,
      fireRate: 200,
      lastShot: 0,
      shield: false,
      shieldTime: 0,
      weapons: []
    },
    enemies: [],
    bullets: [],
    particles: [],
    powerups: [],
    enemySpawnTimer: 0,
    enemySpawnRate: 1500,
    scrollOffset: 0,
    touchStartX: null,
    upgrades: {
      damage: 1,
      health: 1,
      fireRate: 1
    },
    score: 0,
    wave: 1
  });

  const COLORS = {
    player: '#00ff88',
    enemy: '#ff3366',
    bullet: '#ffff00',
    enemyBullet: '#ff6633',
    powerup: '#00ccff',
    particle: '#ffffff',
    shield: '#00ddff'
  };

  const ENEMY_TYPES = [
    { health: 30, speed: 1.5, color: '#ff3366', points: 10, size: 30 },
    { health: 50, speed: 1, color: '#ff6633', points: 20, size: 35 },
    { health: 80, speed: 0.8, color: '#cc00ff', points: 30, size: 40 },
    { health: 150, speed: 0.5, color: '#ff0066', points: 50, size: 50, isBoss: true }
  ];

  const POWERUP_TYPES = [
    { type: 'fireRate', icon: '⚡', color: '#ffff00', duration: 5000 },
    { type: 'spread', icon: '✦', color: '#00ffff', duration: 7000 },
    { type: 'laser', icon: '━', color: '#ff00ff', duration: 6000 },
    { type: 'rocket', icon: '◆', color: '#ff6600', duration: 8000 },
    { type: 'shield', icon: '◉', color: '#00ddff', duration: 5000 }
  ];

  useEffect(() => {
    if (gameState !== 'playing') return;

    let animationId;
    const game = gameRef.current;

    const spawnEnemy = () => {
      const waveLevel = Math.floor(game.wave / 5) + 1;
      const isBossWave = game.wave % 10 === 0;
      
      let enemyType;
      if (isBossWave) {
        enemyType = ENEMY_TYPES[3];
      } else {
        const typeIndex = Math.min(Math.floor(game.wave / 3), ENEMY_TYPES.length - 2);
        enemyType = ENEMY_TYPES[Math.floor(Math.random() * (typeIndex + 1))];
      }

      const enemy = {
        x: Math.random() * 320 + 20,
        y: -enemyType.size,
        width: enemyType.size,
        height: enemyType.size,
        health: enemyType.health * waveLevel,
        maxHealth: enemyType.health * waveLevel,
        speed: enemyType.speed,
        color: enemyType.color,
        points: enemyType.points,
        isBoss: enemyType.isBoss || false,
        shootTimer: 0,
        shootRate: 2000
      };

      game.enemies.push(enemy);
    };

    const spawnPowerup = (x, y) => {
      if (Math.random() < 0.3) {
        const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        game.powerups.push({
          x, y,
          width: 25,
          height: 25,
          type: powerupType.type,
          icon: powerupType.icon,
          color: powerupType.color,
          duration: powerupType.duration,
          vy: 2
        });
      }
    };

    const createParticles = (x, y, color, count = 8) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        game.particles.push({
          x, y,
          vx: Math.cos(angle) * (2 + Math.random() * 2),
          vy: Math.sin(angle) * (2 + Math.random() * 2),
          size: 3 + Math.random() * 3,
          color,
          life: 1
        });
      }
    };

    const applyPowerup = (powerup) => {
      const existingWeapon = game.player.weapons.find(w => w.type === powerup.type);
      
      if (existingWeapon) {
        existingWeapon.endTime = Date.now() + powerup.duration;
      } else {
        game.player.weapons.push({
          type: powerup.type,
          endTime: Date.now() + powerup.duration
        });
      }

      if (powerup.type === 'shield') {
        game.player.shield = true;
        game.player.shieldTime = Date.now() + powerup.duration;
      }
    };

    const shootBullet = () => {
      const now = Date.now();
      const fireRate = game.player.fireRate / game.upgrades.fireRate;
      
      if (now - game.player.lastShot < fireRate) return;

      const hasSpread = game.player.weapons.some(w => w.type === 'spread');
      const hasLaser = game.player.weapons.some(w => w.type === 'laser');
      const hasRocket = game.player.weapons.some(w => w.type === 'rocket');

      if (hasLaser) {
        game.bullets.push({
          x: game.player.x, y: game.player.y - 20,
          width: 8, height: 100, vy: -15,
          damage: game.player.damage * 2,
          color: '#ff00ff', type: 'laser'
        });
      } else if (hasRocket) {
        game.bullets.push({
          x: game.player.x, y: game.player.y - 20,
          width: 12, height: 20, vy: -8,
          damage: game.player.damage * 3,
          color: '#ff6600', type: 'rocket'
        });
      } else {
        game.bullets.push({
          x: game.player.x, y: game.player.y - 20,
          width: 5, height: 15, vy: -10,
          damage: game.player.damage,
          color: COLORS.bullet, type: 'normal'
        });

        if (hasSpread) {
          game.bullets.push({
            x: game.player.x - 15, y: game.player.y - 20,
            width: 5, height: 15, vy: -10, vx: -2,
            damage: game.player.damage, color: '#00ffff', type: 'spread'
          });
          game.bullets.push({
            x: game.player.x + 15, y: game.player.y - 20,
            width: 5, height: 15, vy: -10, vx: 2,
            damage: game.player.damage, color: '#00ffff', type: 'spread'
          });
        }
      }

      game.player.lastShot = now;
    };

    const checkCollision = (rect1, rect2) => {
      return rect1.x < rect2.x + rect2.width &&
             rect1.x + rect1.width > rect2.x &&
             rect1.y < rect2.y + rect2.height &&
             rect1.y + rect1.height > rect2.y;
    };

    const updateGame = () => {
      const now = Date.now();

      game.player.weapons = game.player.weapons.filter(w => w.endTime > now);
      if (game.player.shield && game.player.shieldTime < now) {
        game.player.shield = false;
      }

      game.scrollOffset += 2;
      shootBullet();

      game.bullets = game.bullets.filter(bullet => {
        bullet.y += bullet.vy;
        if (bullet.vx) bullet.x += bullet.vx;
        return bullet.y > -50 && bullet.y < 700 && bullet.x > -20 && bullet.x < 380;
      });

      game.enemySpawnTimer += 16;
      if (game.enemySpawnTimer > game.enemySpawnRate) {
        spawnEnemy();
        game.enemySpawnTimer = 0;
        game.enemySpawnRate = Math.max(500, 1500 - game.wave * 30);
      }

      game.enemies = game.enemies.filter(enemy => {
        enemy.y += enemy.speed;
        
        enemy.shootTimer += 16;
        if (enemy.shootTimer > enemy.shootRate && enemy.y > 50 && enemy.y < 400) {
          game.bullets.push({
            x: enemy.x, y: enemy.y + enemy.height,
            width: 6, height: 12, vy: 5, damage: 10,
            color: COLORS.enemyBullet, isEnemy: true
          });
          enemy.shootTimer = 0;
        }

        let alive = true;
        game.bullets.forEach((bullet, bIndex) => {
          if (!bullet.isEnemy && checkCollision(bullet, enemy)) {
            enemy.health -= bullet.damage * game.upgrades.damage;
            createParticles(bullet.x, bullet.y, enemy.color, 5);
            game.bullets.splice(bIndex, 1);

            if (enemy.health <= 0) {
              game.score += enemy.points;
              setScore(game.score);
              setCurrency(c => c + Math.floor(enemy.points / 2));
              createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 15);
              spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              
              if (enemy.isBoss) {
                game.wave++;
                setWave(game.wave);
                setGameState('upgrade');
              }
              alive = false;
            }
          }
        });

        if (enemy.y > 600) {
          game.player.health -= 20;
          return false;
        }

        return alive;
      });

      game.powerups = game.powerups.filter(powerup => {
        powerup.y += powerup.vy;
        if (checkCollision(powerup, game.player)) {
          applyPowerup(powerup);
          createParticles(powerup.x, powerup.y, powerup.color, 10);
          return false;
        }
        return powerup.y < 700;
      });

      game.particles = game.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vy += 0.1;
        return particle.life > 0;
      });

      game.bullets.forEach((bullet, bIndex) => {
        if (bullet.isEnemy && checkCollision(bullet, game.player)) {
          if (!game.player.shield) {
            game.player.health -= bullet.damage;
            createParticles(bullet.x, bullet.y, COLORS.player, 8);
          }
          game.bullets.splice(bIndex, 1);
        }
      });

      if (game.player.health <= 0) {
        setGameState('gameover');
        if (game.score > highScore) {
          setHighScore(game.score);
        }
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, 360, 640);

      ctx.strokeStyle = '#1a1a3a';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const offset = game.scrollOffset % gridSize;
      
      for (let y = -gridSize + offset; y < 640; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(360, y);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(game.player.x, game.player.y);
      
      if (game.player.shield) {
        ctx.strokeStyle = COLORS.shield;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = COLORS.player;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-15, 20);
      ctx.lineTo(15, 20);
      ctx.closePath();
      ctx.fill();

      const hasLaser = game.player.weapons.some(w => w.type === 'laser');
      const hasRocket = game.player.weapons.some(w => w.type === 'rocket');
      if (hasLaser) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(-3, -25, 6, 8);
      }
      if (hasRocket) {
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-8, 10, 4, 8);
        ctx.fillRect(4, 10, 4, 8);
      }

      ctx.restore();

      game.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        if (bullet.type === 'laser') {
          ctx.globalAlpha = 0.7;
          ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
          ctx.globalAlpha = 1;
        } else if (bullet.type === 'rocket') {
          ctx.save();
          ctx.translate(bullet.x, bullet.y);
          ctx.fillRect(-6, 0, 12, 20);
          ctx.fillStyle = '#ffaa00';
          ctx.beginPath();
          ctx.moveTo(-4, 20);
          ctx.lineTo(0, 28);
          ctx.lineTo(4, 20);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        }
      });

      game.enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x - enemy.width / 2, enemy.y, enemy.width, enemy.height);
        
        const healthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - 10, enemy.width, 4);
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffaa00' : '#ff0000';
        ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - 10, enemy.width * healthPercent, 4);

        if (enemy.isBoss) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(enemy.x - enemy.width / 2 - 5, enemy.y - 5, enemy.width + 10, enemy.height + 10);
        }
      });

      game.powerups.forEach(powerup => {
        ctx.fillStyle = powerup.color;
        ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 100) * 0.2;
        ctx.beginPath();
        ctx.arc(powerup.x, powerup.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.icon, powerup.x, powerup.y);
      });

      game.particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${game.score}`, 10, 30);
      ctx.fillText(`Wave: ${game.wave}`, 10, 55);
      
      ctx.fillStyle = '#333';
      ctx.fillRect(10, 600, 340, 20);
      const healthPercent = game.player.health / game.player.maxHealth;
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffaa00' : '#ff0000';
      ctx.fillRect(10, 600, 340 * healthPercent, 20);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(10, 600, 340, 20);

      let weaponY = 80;
      game.player.weapons.forEach(weapon => {
        const timeLeft = weapon.endTime - Date.now();
        if (timeLeft > 0) {
          const powerup = POWERUP_TYPES.find(p => p.type === weapon.type);
          ctx.fillStyle = powerup.color;
          ctx.globalAlpha = 0.7;
          ctx.fillRect(10, weaponY, (timeLeft / powerup.duration) * 100, 8);
          ctx.globalAlpha = 1;
          ctx.font = 'bold 12px Arial';
          ctx.fillText(powerup.icon, 115, weaponY + 6);
          weaponY += 12;
        }
      });
    };

    const gameLoop = () => {
      updateGame();
      draw();
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameState, highScore]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      
      const game = gameRef.current;
      const moveSpeed = 8;
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        game.player.x = Math.max(20, game.player.x - moveSpeed);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        game.player.x = Math.min(340, game.player.x + moveSpeed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    gameRef.current.touchStartX = touch.clientX - rect.left;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (gameRef.current.touchStartX === null) return;

    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const deltaX = touchX - gameRef.current.touchStartX;

    gameRef.current.player.x = Math.max(20, Math.min(340, gameRef.current.player.x + deltaX));
    gameRef.current.touchStartX = touchX;
  };

  const handleTouchEnd = () => {
    gameRef.current.touchStartX = null;
  };

  const startGame = () => {
    const game = gameRef.current;
    game.player = {
      x: 180, y: 500, width: 40, height: 40,
      health: 100 * game.upgrades.health,
      maxHealth: 100 * game.upgrades.health,
      damage: 10 * game.upgrades.damage,
      fireRate: 200, lastShot: 0,
      shield: false, shieldTime: 0, weapons: []
    };
    game.enemies = [];
    game.bullets = [];
    game.particles = [];
    game.powerups = [];
    game.enemySpawnTimer = 0;
    game.enemySpawnRate = 1500;
    game.scrollOffset = 0;
    game.score = 0;
    game.wave = 1;
    
    setScore(0);
    setWave(1);
    setGameState('playing');
  };

  const upgradeSystem = (type) => {
    const game = gameRef.current;
    const costs = {
      damage: 50 * game.upgrades.damage,
      health: 75 * game.upgrades.health,
      fireRate: 60 * game.upgrades.fireRate
    };

    if (currency >= costs[type]) {
      setCurrency(c => c - costs[type]);
      game.upgrades[type]++;
    }
  };

  const continueGame = () => {
    gameRef.current.player.health = gameRef.current.player.maxHealth;
    setGameState('playing');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-8">
      <div className="relative" style={{ position: 'relative', zIndex: 10 }}>
        <canvas
          ref={canvasRef}
          width={360}
          height={640}
          className="border-4 border-purple-500 rounded-lg shadow-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none', display: 'block', maxWidth: '100%' }}
        />

        {gameState === 'menu' && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg"
            style={{ pointerEvents: 'all' }}
          >
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-4">
              ⚡ RAIL STRIKER
            </h1>
            <p className="text-white text-lg mb-2 text-center px-4">Blast through waves</p>
            <p className="text-gray-400 mb-8">Collect power-ups • Survive!</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer"
              style={{ pointerEvents: 'all', zIndex: 100 }}
            >
              START GAME
            </button>
            {highScore > 0 && (
              <div className="mt-6 text-yellow-400 text-xl flex items-center gap-2">
                <Trophy size={24} />
                High Score: {highScore}
              </div>
            )}
            <div className="mt-4 text-cyan-400 flex items-center gap-2">
              <Star size={20} />
              Credits: {currency}
            </div>
          </div>
        )}

        {gameState === 'upgrade' && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center rounded-lg p-6" style={{ pointerEvents: 'all' }}>
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">BOSS DEFEATED!</h2>
            <div className="text-white mb-6">
              <p className="text-xl">Credits: {currency}</p>
            </div>
            <div className="space-y-3 w-full mb-6">
              <button
                onClick={() => upgradeSystem('damage')}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold flex items-center justify-between px-4 hover:bg-red-700 cursor-pointer"
                style={{ pointerEvents: 'all' }}
              >
                <span className="flex items-center gap-2">
                  <Flame size={20} />
                  Damage Lv.{gameRef.current.upgrades.damage}
                </span>
                <span>{50 * gameRef.current.upgrades.damage} Credits</span>
              </button>
              <button
                onClick={() => upgradeSystem('health')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-between px-4 hover:bg-green-700 cursor-pointer"
                style={{ pointerEvents: 'all' }}
              >
                <span className="flex items-center gap-2">
                  <Shield size={20} />
                  Health Lv.{gameRef.current.upgrades.health}
                </span>
                <span>{75 * gameRef.current.upgrades.health} Credits</span>
              </button>
              <button
                onClick={() => upgradeSystem('fireRate')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-between px-4 hover:bg-blue-700 cursor-pointer"
                style={{ pointerEvents: 'all' }}
              >
                <span className="flex items-center gap-2">
                  <Zap size={20} />
                  Fire Rate Lv.{gameRef.current.upgrades.fireRate}
                </span>
                <span>{60 * gameRef.current.upgrades.fireRate} Credits</span>
              </button>
            </div>
            <button
              onClick={continueGame}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform cursor-pointer"
              style={{ pointerEvents: 'all' }}
            >
              CONTINUE
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center rounded-lg" style={{ pointerEvents: 'all' }}>
            <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
            <p className="text-white text-2xl mb-2">Score: {score}</p>
            <p className="text-yellow-400 text-xl mb-2">Wave: {wave}</p>
            <p className="text-cyan-400 text-lg mb-8">Credits Earned: {currency}</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:scale-110 transition-transform cursor-pointer"
              style={{ pointerEvents: 'all' }}
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-gray-400 text-sm">
        <p>Mobile: Drag left/right • Desktop: Arrow Keys or A/D</p>
      </div>
    </div>
  );
};

export default RailStriker;