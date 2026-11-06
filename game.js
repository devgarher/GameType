// Zombie Typing Survival - Core Engine
// Handles canvas rendering, game loop, typing engine, particle systems, zombie AI

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Sound & Word Managers
const sounds = new SoundController();
const wordManager = new WordManager();

// Particle System
class Particle {
  constructor(x, y, vx, vy, color, size, life, isBlood = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = life;
    this.life = life;
    this.isBlood = isBlood;
    this.gravity = isBlood ? 0.18 : 0.05;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.96;
    this.life--;
  }

  draw(context) {
    const alpha = Math.max(0, this.life / this.maxLife);
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

// Floating Text Effect (+100, COMBO x2, etc.)
class FloatingText {
  constructor(x, y, text, color = '#00ff66', fontSize = 20) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.fontSize = fontSize;
    this.life = 40;
    this.maxLife = 40;
    this.vy = -1.5;
  }

  update() {
    this.y += this.vy;
    this.life--;
  }

  draw(context) {
    const alpha = Math.max(0, this.life / this.maxLife);
    context.save();
    context.globalAlpha = alpha;
    context.font = `bold ${this.fontSize}px 'Courier New', monospace`;
    context.fillStyle = this.color;
    context.textAlign = 'center';
    context.shadowColor = this.color;
    context.shadowBlur = 8;
    context.fillText(this.text, this.x, this.y);
    context.restore();
  }
}

// Zombie Class
class Zombie {
  constructor(type, word, x, y, speed) {
    this.type = type; // 'walker', 'runner', 'tank', 'boss'
    this.word = word;
    this.typedIndex = 0; // index of next letter to type
    this.x = x;
    this.y = y;
    this.targetY = canvas.height - 90; // defense line
    this.speed = speed;
    this.width = 44;
    this.height = 60;
    this.isDead = false;
    this.animTime = Math.random() * 100;
    this.shakeTimer = 0;

    // Type attributes
    if (type === 'runner') {
      this.color = '#e74c3c';
      this.eyeColor = '#ffeb3b';
      this.skinColor = '#8b2635';
      this.width = 40;
      this.height = 54;
      this.points = 150;
    } else if (type === 'tank') {
      this.color = '#3498db';
      this.eyeColor = '#00e5ff';
      this.skinColor = '#243b55';
      this.width = 64;
      this.height = 80;
      this.points = 300;
    } else if (type === 'boss') {
      this.color = '#9b59b6';
      this.eyeColor = '#ff0055';
      this.skinColor = '#4a154b';
      this.width = 80;
      this.height = 100;
      this.points = 800;
    } else {
      // standard walker
      this.color = '#2ecc71';
      this.eyeColor = '#e74c3c';
      this.skinColor = '#3e5b42';
      this.width = 44;
      this.height = 60;
      this.points = 100;
    }
  }

  update() {
    this.y += this.speed;
    this.animTime += 0.12 * (this.speed / 0.8);
    if (this.shakeTimer > 0) this.shakeTimer--;
  }

  // Draw procedural zombie sprite with swaying arms and walking animation
  draw(context, isTargeted) {
    context.save();
    let drawX = this.x;
    let drawY = this.y;

    if (this.shakeTimer > 0) {
      drawX += (Math.random() - 0.5) * 8;
      drawY += (Math.random() - 0.5) * 8;
    }

    const wobble = Math.sin(this.animTime) * 4;
    const legSwing = Math.cos(this.animTime) * 12;

    // Shadow
    context.fillStyle = 'rgba(0, 0, 0, 0.45)';
    context.beginPath();
    context.ellipse(drawX, drawY + this.height / 2, this.width * 0.6, 10, 0, 0, Math.PI * 2);
    context.fill();

    // Legs
    context.strokeStyle = '#1a252f';
    context.lineWidth = 6;
    context.lineCap = 'round';

    // Left leg
    context.beginPath();
    context.moveTo(drawX - 8, drawY + this.height * 0.15);
    context.lineTo(drawX - 10 + legSwing * 0.6, drawY + this.height * 0.5);
    context.stroke();

    // Right leg
    context.beginPath();
    context.moveTo(drawX + 8, drawY + this.height * 0.15);
    context.lineTo(drawX + 10 - legSwing * 0.6, drawY + this.height * 0.5);
    context.stroke();

    // Torso / Body
    context.fillStyle = this.skinColor;
    context.beginPath();
    context.roundRect(drawX - this.width / 2, drawY - this.height * 0.25, this.width, this.height * 0.45, 8);
    context.fill();

    // Tattered clothes / ribs
    context.fillStyle = 'rgba(0,0,0,0.3)';
    context.fillRect(drawX - this.width * 0.35, drawY - this.height * 0.15, this.width * 0.7, 4);
    context.fillRect(drawX - this.width * 0.3, drawY - this.height * 0.05, this.width * 0.6, 4);

    // Arms reaching forward towards player
    context.strokeStyle = this.skinColor;
    context.lineWidth = 5;
    const armWiggle = Math.sin(this.animTime * 1.5) * 6;

    // Left arm
    context.beginPath();
    context.moveTo(drawX - this.width / 2 + 2, drawY - this.height * 0.18);
    context.lineTo(drawX - this.width / 2 - 8, drawY + this.height * 0.1 + armWiggle);
    context.stroke();

    // Right arm
    context.beginPath();
    context.moveTo(drawX + this.width / 2 - 2, drawY - this.height * 0.18);
    context.lineTo(drawX + this.width / 2 + 8, drawY + this.height * 0.1 - armWiggle);
    context.stroke();

    // Head
    const headRadius = this.width * 0.35;
    context.fillStyle = this.skinColor;
    context.beginPath();
    context.arc(drawX + wobble * 0.4, drawY - this.height * 0.4, headRadius, 0, Math.PI * 2);
    context.fill();

    // Eyes (glowing)
    const eyeOffsetX = 4;
    context.fillStyle = this.eyeColor;
    context.shadowColor = this.eyeColor;
    context.shadowBlur = 6;
    context.beginPath();
    context.arc(drawX - eyeOffsetX + wobble * 0.4, drawY - this.height * 0.42, 3, 0, Math.PI * 2);
    context.arc(drawX + eyeOffsetX + wobble * 0.4, drawY - this.height * 0.42, 3, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    // Mouth / Teeth
    context.fillStyle = '#0a0a0a';
    context.beginPath();
    context.arc(drawX + wobble * 0.4, drawY - this.height * 0.32, 5, 0, Math.PI);
    context.fill();

    // Target crosshair reticle if currently locked on
    if (isTargeted) {
      context.save();
      const reticleRadius = Math.max(this.width, this.height) * 0.75;
      context.strokeStyle = '#00ffcc';
      context.lineWidth = 2;
      context.setLineDash([6, 6]);
      context.beginPath();
      context.arc(drawX, drawY - 10, reticleRadius, 0, Math.PI * 2);
      context.stroke();

      // Corner markers
      context.setLineDash([]);
      context.strokeStyle = '#ff3366';
      context.lineWidth = 3;
      const r = reticleRadius + 4;
      // top tick
      context.beginPath();
      context.moveTo(drawX, drawY - 10 - r - 6);
      context.lineTo(drawX, drawY - 10 - r + 4);
      // bottom tick
      context.moveTo(drawX, drawY - 10 + r + 6);
      context.lineTo(drawX, drawY - 10 + r - 4);
      // left tick
      context.moveTo(drawX - r - 6, drawY - 10);
      context.lineTo(drawX - r + 4, drawY - 10);
      // right tick
      context.moveTo(drawX + r + 6, drawY - 10);
      context.lineTo(drawX + r - 4, drawY - 10);
      context.stroke();
      context.restore();
    }

    // Word display banner above zombie
    this.drawWord(context, drawX, drawY - this.height * 0.65 - 10, isTargeted);

    context.restore();
  }

  // Draw typing word with color-coded letters
  drawWord(context, wx, wy, isTargeted) {
    context.save();
    const fontSize = isTargeted ? 21 : 18;
    context.font = `bold ${fontSize}px 'Courier New', monospace`;
    context.textAlign = 'center';

    const fullWord = this.word;
    const typedPart = fullWord.slice(0, this.typedIndex);
    const currentChar = fullWord[this.typedIndex] || '';
    const remainingPart = fullWord.slice(this.typedIndex + (currentChar ? 1 : 0));

    // Measure total width to draw neat background pill
    const totalWidth = context.measureText(fullWord).width + 24;
    const boxHeight = fontSize + 12;

    // Background bubble
    context.fillStyle = isTargeted ? 'rgba(10, 25, 40, 0.92)' : 'rgba(0, 0, 0, 0.75)';
    context.strokeStyle = isTargeted ? '#00ffcc' : 'rgba(255, 255, 255, 0.25)';
    context.lineWidth = isTargeted ? 2 : 1;
    context.beginPath();
    context.roundRect(wx - totalWidth / 2, wy - boxHeight / 2, totalWidth, boxHeight, 8);
    context.fill();
    context.stroke();

    // Render individual letter sections
    let startX = wx - totalWidth / 2 + 12;
    context.textAlign = 'left';
    const textBaselineY = wy + fontSize * 0.35;

    // 1. Typed letters (Green neon)
    if (typedPart.length > 0) {
      context.fillStyle = '#00ff66';
      context.shadowColor = '#00ff66';
      context.shadowBlur = 6;
      context.fillText(typedPart, startX, textBaselineY);
      startX += context.measureText(typedPart).width;
      context.shadowBlur = 0;
    }

    // 2. Next letter to type (Pulsing Gold / Highlighted)
    if (currentChar) {
      context.fillStyle = isTargeted ? '#ffe600' : '#ffffff';
      if (isTargeted) {
        context.shadowColor = '#ffe600';
        context.shadowBlur = 10;
        // Draw small underline for current char
        const charWidth = context.measureText(currentChar).width;
        context.fillRect(startX, textBaselineY + 3, charWidth, 3);
      }
      context.fillText(currentChar, startX, textBaselineY);
      startX += context.measureText(currentChar).width;
      context.shadowBlur = 0;
    }

    // 3. Remaining letters (Clean white or dimmed)
    if (remainingPart.length > 0) {
      context.fillStyle = isTargeted ? '#ffffff' : '#b0b8c0';
      context.fillText(remainingPart, startX, textBaselineY);
    }

    context.restore();
  }
}

// Game State Engine
class ZombieSurvivalGame {
  constructor() {
    this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.zombies = [];
    this.particles = [];
    this.floatingTexts = [];
    this.currentTarget = null;

    // Defense & Player
    this.playerHealth = 100;
    this.maxHealth = 100;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('zombie_typing_highscore') || '0', 10);
    this.combo = 0;
    this.maxCombo = 0;
    this.kills = 0;

    // Typing Accuracy & Speed
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.gameStartTime = 0;
    this.wpm = 0;

    // Wave Management
    this.wave = 1;
    this.waveState = 'ACTIVE'; // 'ACTIVE', 'CLEAR', 'STARTING'
    this.waveZombiesToSpawn = 8;
    this.waveZombiesSpawned = 0;
    this.spawnCooldown = 0;
    this.spawnRate = 130; // frames between spawns

    // Visual FX
    this.screenShake = 0;
    this.muzzleFlash = 0;
    this.bulletTracer = null; // { fromX, fromY, toX, toY, life }
    this.fogParticles = [];

    // Init fog particles
    for (let i = 0; i < 25; i++) {
      this.fogParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.8,
        radius: 40 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.4,
        alpha: 0.03 + Math.random() * 0.05
      });
    }

    this.bindEvents();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const container = document.getElementById('canvas-container');
    canvas.width = container.clientWidth || 900;
    canvas.height = container.clientHeight || 640;
  }

  bindEvents() {
    // Keyboard input for typing
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // UI Buttons
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
    document.getElementById('sound-toggle').addEventListener('click', () => this.toggleSound());
    document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
  }

  toggleSound() {
    const isMuted = sounds.toggleMute();
    const btn = document.getElementById('sound-toggle');
    btn.innerHTML = isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
    btn.classList.toggle('muted', isMuted);
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      document.getElementById('pause-overlay').classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      document.getElementById('pause-overlay').classList.add('hidden');
    }
  }

  startGame() {
    sounds.init();
    sounds.startAmbient();

    this.state = 'PLAYING';
    this.zombies = [];
    this.particles = [];
    this.floatingTexts = [];
    this.currentTarget = null;
    this.playerHealth = 100;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.kills = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.gameStartTime = Date.now();
    this.wave = 1;
    this.setupWave(1);

    // Hide overlays
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('pause-overlay').classList.add('hidden');

    this.updateHUD();
  }

  setupWave(waveNum) {
    this.wave = waveNum;
    this.waveState = 'ACTIVE';
    this.waveZombiesSpawned = 0;
    // Escalating zombie count per wave
    this.waveZombiesToSpawn = 7 + waveNum * 4;
    // Faster spawn rate as waves advance
    this.spawnRate = Math.max(50, 140 - waveNum * 12);
    this.spawnCooldown = 30;

    sounds.playWaveHorn();
    this.showWaveAnnouncement(`WAVE ${this.wave}`, this.getWaveSubtitle(waveNum));
  }

  getWaveSubtitle(w) {
    if (w === 1) return "The Infestation Begins!";
    if (w === 2) return "Speed increases! Fast runners spotted!";
    if (w === 3) return "Brutes arriving! Type longer words!";
    if (w === 5) return "WARNING: TITAN ABOMINATION APPROACHING!";
    if (w % 5 === 0) return "BOSS WAVE! Heavy fire required!";
    return "The horde tightens! Maintain focus!";
  }

  showWaveAnnouncement(title, subtitle) {
    const el = document.getElementById('wave-banner');
    el.innerHTML = `<div class="wave-title">${title}</div><div class="wave-sub">${subtitle}</div>`;
    el.classList.remove('hidden');
    el.style.opacity = '1';

    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.classList.add('hidden'), 500);
    }, 2400);
  }

  spawnZombie() {
    if (this.waveZombiesSpawned >= this.waveZombiesToSpawn) return;

    // Pick zombie type based on wave
    let type = 'walker';
    let wordDiff = 'easy';
    const rand = Math.random();

    if (this.wave >= 5 && this.waveZombiesSpawned === this.waveZombiesToSpawn - 1) {
      type = 'boss';
      wordDiff = 'boss';
    } else if (this.wave >= 3 && rand < 0.25) {
      type = 'tank';
      wordDiff = 'hard';
    } else if (this.wave >= 2 && rand < 0.55) {
      type = 'runner';
      wordDiff = 'easy';
    } else {
      type = 'walker';
      wordDiff = this.wave >= 4 ? 'medium' : 'easy';
    }

    const activeWords = this.zombies.map(z => z.word);
    const word = wordManager.getWord(wordDiff, activeWords);

    // X position spread across the top with padding
    const padding = 70;
    const spawnX = padding + Math.random() * (canvas.width - padding * 2);
    const spawnY = -40 - Math.random() * 40;

    // Speeds tuned for typing balance
    let speed = 0.55 + this.wave * 0.08;
    if (type === 'runner') speed *= 1.6;
    if (type === 'tank') speed *= 0.65;
    if (type === 'boss') speed *= 0.45;

    const zombie = new Zombie(type, word, spawnX, spawnY, speed);
    this.zombies.push(zombie);
    this.waveZombiesSpawned++;
  }

  handleKeyDown(e) {
    if (this.state !== 'PLAYING') {
      if (e.key === 'Enter' && (this.state === 'START' || this.state === 'GAMEOVER')) {
        this.startGame();
      }
      return;
    }

    // Pause shortcut
    if (e.key === 'Escape') {
      this.togglePause();
      return;
    }

    // Ignore modifier keys
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    const typedChar = e.key.toLowerCase();
    this.totalKeystrokes++;

    // 1. If currently locked onto a zombie
    if (this.currentTarget && !this.currentTarget.isDead) {
      const expectedChar = this.currentTarget.word[this.currentTarget.typedIndex].toLowerCase();

      if (typedChar === expectedChar) {
        this.processCorrectHit(this.currentTarget);
      } else {
        this.processMiss(this.currentTarget);
      }
      return;
    }

    // 2. If NO zombie is currently locked on: find candidate zombies starting with this letter
    const candidates = this.zombies.filter(z => !z.isDead && z.word[0].toLowerCase() === typedChar);

    if (candidates.length > 0) {
      // Prioritize the zombie closest to the defense barricade (greatest Y)
      candidates.sort((a, b) => b.y - a.y);
      this.currentTarget = candidates[0];
      this.processCorrectHit(this.currentTarget);
    } else {
      // Wrong key, no matching zombie
      this.processMiss(null);
    }
  }

  processCorrectHit(zombie) {
    this.correctKeystrokes++;
    zombie.typedIndex++;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    // Gunfire sound & effects
    sounds.playShoot();
    sounds.playCombo(this.combo);
    this.muzzleFlash = 4;
    this.createBulletTracer(zombie.x, zombie.y);
    this.createHitSparks(zombie.x, zombie.y - 15);

    // If word completed -> ZOMBIE DESTROYED!
    if (zombie.typedIndex >= zombie.word.length) {
      this.killZombie(zombie);
      this.currentTarget = null;
    }

    this.updateHUD();
  }

  processMiss(zombie) {
    sounds.playMiss();
    this.combo = 0; // reset combo on mistake

    if (zombie) {
      zombie.shakeTimer = 8;
    }

    this.screenShake = 3;
    this.updateHUD();
  }

  killZombie(zombie) {
    zombie.isDead = true;
    sounds.playKill();
    this.kills++;

    // Calculate score with combo multiplier
    const multiplier = 1 + Math.floor(this.combo / 10) * 0.5;
    const earnedPoints = Math.round(zombie.points * multiplier);
    this.score += earnedPoints;

    // Screen Shake & floating point text
    this.screenShake = zombie.type === 'boss' ? 14 : (zombie.type === 'tank' ? 8 : 4);
    this.floatingTexts.push(new FloatingText(zombie.x, zombie.y - 20, `+${earnedPoints}`, '#00ffcc', 22));

    if (this.combo >= 10 && this.combo % 5 === 0) {
      this.floatingTexts.push(new FloatingText(canvas.width / 2, canvas.height - 150, `${this.combo}x COMBO!`, '#ffe600', 26));
    }

    // Gore & blood splatter particles
    const particleCount = zombie.type === 'boss' ? 55 : (zombie.type === 'tank' ? 35 : 22);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 1;
      const bloodColor = Math.random() < 0.6 ? '#990000' : (Math.random() < 0.5 ? '#cc1100' : '#4a0e17');
      this.particles.push(new Particle(zombie.x, zombie.y, vx, vy, bloodColor, 2 + Math.random() * 4, 30 + Math.random() * 25, true));
    }
  }

  createBulletTracer(targetX, targetY) {
    const soldierX = canvas.width / 2;
    const soldierY = canvas.height - 50;
    this.bulletTracer = {
      startX: soldierX,
      startY: soldierY,
      endX: targetX,
      endY: targetY,
      life: 3
    };
  }

  createHitSparks(x, y) {
    for (let i = 0; i < 7; i++) {
      const vx = (Math.random() - 0.5) * 4;
      const vy = (Math.random() - 0.5) * 4;
      this.particles.push(new Particle(x, y, vx, vy, '#ffdd55', 2, 12));
    }
  }

  damagePlayer(damage) {
    this.playerHealth = Math.max(0, this.playerHealth - damage);
    sounds.playPlayerHurt();
    this.screenShake = 16;
    this.combo = 0;

    // Red flash overlay
    const container = document.getElementById('canvas-container');
    container.classList.add('damage-flash');
    setTimeout(() => container.classList.remove('damage-flash'), 300);

    if (this.playerHealth <= 0) {
      this.gameOver();
    }
    this.updateHUD();
  }

  gameOver() {
    this.state = 'GAMEOVER';
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('zombie_typing_highscore', this.highScore.toString());
    }

    const accuracy = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100) : 0;
    
    // Fill game over stats modal
    document.getElementById('final-score').innerText = this.score.toLocaleString();
    document.getElementById('final-kills').innerText = this.kills;
    document.getElementById('final-wpm').innerText = this.wpm;
    document.getElementById('final-accuracy').innerText = `${accuracy}%`;
    document.getElementById('final-wave').innerText = this.wave;
    document.getElementById('final-combo').innerText = this.maxCombo;

    // Rank title
    let rank = "Bitten Rookie";
    if (this.score > 15000) rank = "Legendary Zombie Slayer";
    else if (this.score > 8000) rank = "Deadeye Marksman";
    else if (this.score > 4000) rank = "Veteran Defender";
    else if (this.score > 1500) rank = "Brave Survivor";
    document.getElementById('final-rank').innerText = rank;

    document.getElementById('game-over-screen').classList.remove('hidden');
  }

  updateHUD() {
    // Health bar
    const healthPercent = Math.max(0, (this.playerHealth / this.maxHealth) * 100);
    const healthFill = document.getElementById('health-fill');
    healthFill.style.width = `${healthPercent}%`;
    if (healthPercent < 30) {
      healthFill.style.backgroundColor = '#e74c3c';
    } else if (healthPercent < 60) {
      healthFill.style.backgroundColor = '#f39c12';
    } else {
      healthFill.style.backgroundColor = '#2ecc71';
    }
    document.getElementById('health-text').innerText = `${Math.round(this.playerHealth)} / ${this.maxHealth}`;

    // Score & Wave
    document.getElementById('score-display').innerText = this.score.toLocaleString();
    document.getElementById('wave-display').innerText = `WAVE ${this.wave}`;
    document.getElementById('combo-display').innerText = `${this.combo}x`;

    // Live WPM calculation
    const elapsedMinutes = (Date.now() - this.gameStartTime) / 60000;
    if (elapsedMinutes > 0.05) {
      // 5 keystrokes approx 1 word in typing standard
      const wordsTyped = this.correctKeystrokes / 5;
      this.wpm = Math.round(wordsTyped / elapsedMinutes);
    } else {
      this.wpm = 0;
    }
    document.getElementById('wpm-display').innerText = `${this.wpm} WPM`;
  }

  // Update Game Loop
  update() {
    if (this.state !== 'PLAYING') return;

    // Screen Shake decay
    if (this.screenShake > 0) this.screenShake *= 0.88;
    if (this.screenShake < 0.2) this.screenShake = 0;

    // Fog update
    for (const fog of this.fogParticles) {
      fog.x += fog.vx;
      if (fog.x < -100) fog.x = canvas.width + 100;
      if (fog.x > canvas.width + 100) fog.x = -100;
    }

    // Zombie Spawning
    this.spawnCooldown--;
    if (this.spawnCooldown <= 0 && this.waveZombiesSpawned < this.waveZombiesToSpawn) {
      this.spawnZombie();
      this.spawnCooldown = this.spawnRate + Math.random() * 20;
    }

    // Update Zombies
    const defenseY = canvas.height - 85;
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      z.update();

      // Check if zombie breached defense barricade
      if (z.y >= defenseY && !z.isDead) {
        let dmg = 20;
        if (z.type === 'tank') dmg = 35;
        if (z.type === 'boss') dmg = 50;
        if (z.type === 'runner') dmg = 15;

        this.damagePlayer(dmg);
        this.floatingTexts.push(new FloatingText(z.x, z.y, `-${dmg} HP!`, '#ff2244', 24));
        z.isDead = true;

        if (this.currentTarget === z) {
          this.currentTarget = null;
        }
      }

      // Remove dead zombies
      if (z.isDead) {
        this.zombies.splice(i, 1);
      }
    }

    // Check Wave Completion
    if (this.waveZombiesSpawned >= this.waveZombiesToSpawn && this.zombies.length === 0 && this.waveState === 'ACTIVE') {
      this.waveState = 'CLEAR';
      this.showWaveAnnouncement(`WAVE ${this.wave} CLEARED!`, "Catch your breath...");
      setTimeout(() => {
        if (this.state === 'PLAYING') {
          this.setupWave(this.wave + 1);
        }
      }, 2800);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.update();
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Bullet tracer life
    if (this.bulletTracer) {
      this.bulletTracer.life--;
      if (this.bulletTracer.life <= 0) this.bulletTracer = null;
    }

    if (this.muzzleFlash > 0) this.muzzleFlash--;

    // Periodically update live HUD stats
    if (Math.random() < 0.1) {
      this.updateHUD();
    }
  }

  // Draw Background & Scenery
  drawBackground() {
    // Night sky gradient with eerie toxic greenish-purple haze
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#05070a');
    skyGrad.addColorStop(0.5, '#0b1319');
    skyGrad.addColorStop(0.85, '#16221d');
    skyGrad.addColorStop(1, '#1b2d24');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Distant ruined city silhouette
    ctx.fillStyle = '#060a0d';
    const bldCount = 18;
    const bldWidth = canvas.width / bldCount;
    for (let i = 0; i < bldCount; i++) {
      const bldHeight = 70 + ((i * 47) % 110);
      ctx.fillRect(i * bldWidth, canvas.height * 0.45 - bldHeight, bldWidth + 1, bldHeight + 100);
      // Small yellow/red broken windows
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 180, 50, 0.15)';
        ctx.fillRect(i * bldWidth + 8, canvas.height * 0.45 - bldHeight + 15, 6, 8);
        ctx.fillStyle = '#060a0d';
      }
    }

    // Fog particles in the midground
    for (const fog of this.fogParticles) {
      ctx.save();
      const fogGrad = ctx.createRadialGradient(fog.x, fog.y, 10, fog.x, fog.y, fog.radius);
      fogGrad.addColorStop(0, `rgba(70, 110, 90, ${fog.alpha})`);
      fogGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fogGrad;
      ctx.beginPath();
      ctx.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Road / Battleground perspective lines
    ctx.strokeStyle = 'rgba(40, 60, 50, 0.4)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < canvas.width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height * 0.35);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  // Draw Defense Barricade & Player Turret
  drawDefense() {
    const barY = canvas.height - 80;

    // Defense Line Ground / Sandbags
    ctx.fillStyle = '#1e281f';
    ctx.fillRect(0, barY, canvas.width, 80);

    // Sandbags row
    ctx.fillStyle = '#3a3d31';
    for (let x = 0; x < canvas.width; x += 36) {
      ctx.beginPath();
      ctx.roundRect(x + 2, barY + 8, 32, 18, 6);
      ctx.fill();
      ctx.strokeStyle = '#272921';
      ctx.stroke();
    }
    // Second layer of sandbags
    for (let x = 16; x < canvas.width - 20; x += 36) {
      ctx.beginPath();
      ctx.roundRect(x + 2, barY + 24, 32, 18, 6);
      ctx.fill();
      ctx.strokeStyle = '#272921';
      ctx.stroke();
    }

    // Barbed wire line
    ctx.strokeStyle = '#616770';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, barY + 5);
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.lineTo(x, barY + 5 + (x % 40 === 0 ? -6 : 6));
    }
    ctx.stroke();

    // Turret / Soldier in bottom center
    const soldierX = canvas.width / 2;
    const soldierY = canvas.height - 40;

    // Spotlight / Flashlight beam pointing toward current target or straight up
    ctx.save();
    let aimX = soldierX;
    let aimY = 0;
    if (this.currentTarget && !this.currentTarget.isDead) {
      aimX = this.currentTarget.x;
      aimY = this.currentTarget.y;
    }

    const angle = Math.atan2(aimY - soldierY, aimX - soldierX);
    ctx.translate(soldierX, soldierY - 15);
    ctx.rotate(angle + Math.PI / 2);

    // Spotlight Cone
    const coneGrad = ctx.createLinearGradient(0, 0, 0, -500);
    coneGrad.addColorStop(0, 'rgba(0, 255, 200, 0.25)');
    coneGrad.addColorStop(0.8, 'rgba(0, 255, 200, 0.04)');
    coneGrad.addColorStop(1, 'rgba(0, 255, 200, 0)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-90, -500);
    ctx.lineTo(90, -500);
    ctx.closePath();
    ctx.fill();

    // Gun Barrel
    ctx.fillStyle = '#222';
    ctx.fillRect(-4, -32, 8, 30);
    ctx.fillStyle = '#444';
    ctx.fillRect(-6, -10, 12, 12);

    // Muzzle Flash
    if (this.muzzleFlash > 0) {
      ctx.fillStyle = '#fff466';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, -36, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // Turret Base / Soldier body
    ctx.fillStyle = '#1c313a';
    ctx.beginPath();
    ctx.arc(soldierX, soldierY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bullet Tracer line
    if (this.bulletTracer) {
      ctx.save();
      ctx.strokeStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.bulletTracer.startX, this.bulletTracer.startY);
      ctx.lineTo(this.bulletTracer.endX, this.bulletTracer.endY);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Main Render Loop
  render() {
    ctx.save();

    // Screen shake transform
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    this.drawBackground();

    // Draw Zombies sorted by Y so closer ones overlap farther ones
    const sortedZombies = [...this.zombies].sort((a, b) => a.y - b.y);
    for (const z of sortedZombies) {
      z.draw(ctx, z === this.currentTarget);
    }

    this.drawDefense();

    // Draw Particles
    for (const p of this.particles) {
      p.draw(ctx);
    }

    // Draw Floating Text
    for (const ft of this.floatingTexts) {
      ft.draw(ctx);
    }

    ctx.restore();
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }
}

// Start instance
window.game = new ZombieSurvivalGame();
window.game.loop();
